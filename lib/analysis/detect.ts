import type { BillParse, ParsedLineItem } from "@/lib/validation";
import { round2 } from "@/lib/validation";

export type FindingType =
  | "hidden_fee"
  | "duplicate_charge"
  | "price_increase"
  | "contract_mismatch"
  | "unusual_charge"
  | "tax_error";

export type Severity = "low" | "medium" | "high";

export interface Finding {
  type: FindingType;
  severity: Severity;
  title: string;
  explanation: string;
  confidence: number;
  estimated_monthly_savings: number | null;
  evidence: {
    line_item_descriptions: string[];
    amounts: number[];
    [key: string]: unknown;
  };
}

/** Fee labels that are commonly negotiable, waived, or never clearly disclosed. */
const SUSPICIOUS_FEE_PATTERNS: Array<{
  re: RegExp;
  severity: Severity;
  confidence: number;
  reason: string;
}> = [
  {
    re: /paper(?:ing)?[\s-]*(statement|billing|copy)[\s-]*fee/i,
    severity: "medium",
    confidence: 0.9,
    reason: "paper statement fees are routinely waived on request or by switching to paperless billing",
  },
  {
    re: /convenience[\s-]*fee|processing[\s-]*fee/i,
    severity: "medium",
    confidence: 0.8,
    reason: "generic processing/convenience fees often have no underlying cost and are frequently credited back when challenged",
  },
  {
    re: /administrative[\s-]*fee/i,
    severity: "medium",
    confidence: 0.75,
    reason: "administrative fees are vague surcharges that providers commonly remove to retain customers",
  },
  {
    re: /regulatory[\s-]*(recovery|cost)[\s-]*fee|carrier[\s-]*cost[\s-]*recovery|federal[\s-]*universal[\s-]*service/i,
    severity: "low",
    confidence: 0.6,
    reason: "regulatory recovery fees are provider add-ons, not government taxes, and can be disputed or reduced",
  },
  {
    re: /network[\s-]*(access|enhancement)[\s-]*fee/i,
    severity: "low",
    confidence: 0.6,
    reason: "network fees are infrastructure costs already covered by the base plan price",
  },
  {
    re: /equipment[\s-]*(rental|lease|fee)|(modem|router|gateway|receiver)[\s-]*(fee|rental|lease)/i,
    severity: "high",
    confidence: 0.85,
    reason: "equipment rental fees compound every month; providers routinely waive them, or you can buy the equipment outright",
  },
  {
    re: /activation[\s-]*fee|installation[\s-]*fee|setup[\s-]*fee/i,
    severity: "medium",
    confidence: 0.8,
    reason: "activation/installation fees are one of the most commonly waived charges when requested, especially for new or returning customers",
  },
  {
    re: /late[\s-]*fee|late[\s-]*payment[\s-]*charge/i,
    severity: "low",
    confidence: 0.7,
    reason: "first-time late fees are almost always reversed on request, and autopay prevents them entirely",
  },
  {
    re: /minimum[\s-]*term[\s-]*fee|early[\s-]*termination|etf/i,
    severity: "high",
    confidence: 0.7,
    reason: "termination fees can often be reduced or waived, especially if the provider raised prices mid-contract",
  },
];

/** Descriptions that look like fees regardless of the model's category tag. */
const FEE_LIKE = /fee|charge|surcharge|recovery|rental/i;

function normalizeDescription(desc: string): string {
  return desc
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isFeeLike(item: ParsedLineItem): boolean {
  return item.category === "fee" || (item.category !== "tax" && FEE_LIKE.test(item.description));
}

function detectSuspiciousFees(items: ParsedLineItem[]): Finding[] {
  const findings: Finding[] = [];
  for (const item of items) {
    if (item.amount <= 0) continue;
    if (!isFeeLike(item) && item.category !== "equipment") continue;

    for (const pattern of SUSPICIOUS_FEE_PATTERNS) {
      if (!pattern.re.test(item.description)) continue;
      findings.push({
        type: "hidden_fee",
        severity: pattern.severity,
        title: `Disputable fee: ${item.description}`,
        explanation: `"${item.description}" charges ${item.amount.toFixed(2)} per ${item.is_recurring ? "month" : "occurrence"} and ${pattern.reason}.`,
        confidence: pattern.confidence,
        estimated_monthly_savings: item.is_recurring ? item.amount : null,
        evidence: {
          line_item_descriptions: [item.description],
          amounts: [item.amount],
          matched_pattern: pattern.re.source,
        },
      });
      break; // one finding per line item
    }
  }
  return findings;
}

function detectDuplicateCharges(items: ParsedLineItem[]): Finding[] {
  const groups = new Map<string, ParsedLineItem[]>();
  for (const item of items) {
    if (item.amount <= 0 || item.category === "tax") continue;
    const key = `${normalizeDescription(item.description)}|${item.amount.toFixed(2)}`;
    const group = groups.get(key) ?? [];
    group.push(item);
    groups.set(key, group);
  }

  const findings: Finding[] = [];
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    const [first, ...extras] = group;
    const excess = round2(extras.reduce((sum, item) => sum + item.amount, 0));
    findings.push({
      type: "duplicate_charge",
      severity: "high",
      title: `Possible duplicate charge: ${first.description}`,
      explanation: `"${first.description}" appears ${group.length} times at ${first.amount.toFixed(2)} each. Duplicate billing is a common billing-system error and should be credited on request.`,
      confidence: 0.75,
      estimated_monthly_savings: first.is_recurring ? excess : null,
      evidence: {
        line_item_descriptions: group.map((item) => item.description),
        amounts: group.map((item) => item.amount),
        occurrences: group.length,
        excess_total: excess,
      },
    });
  }
  return findings;
}

function detectTaxAnomalies(items: ParsedLineItem[], parse: BillParse): Finding[] {
  const taxes = round2(
    items.filter((i) => i.category === "tax" && i.amount > 0).reduce((sum, i) => sum + i.amount, 0),
  );
  const preTax = round2(
    items.filter((i) => i.category !== "tax").reduce((sum, i) => sum + i.amount, 0),
  );
  if (taxes <= 0 || preTax <= 0) return [];

  const effectiveRate = taxes / Math.abs(preTax);
  // Typical combined tax burden on telecom/utility bills lands well under 30%.
  if (effectiveRate <= 0.3) return [];

  return [
    {
      type: "tax_error",
      severity: "medium",
      title: `Unusually high taxes (${Math.round(effectiveRate * 100)}% of pre-tax charges)`,
      explanation: `Taxes total ${taxes.toFixed(2)} on ${Math.abs(preTax).toFixed(2)} of pre-tax charges (${Math.round(effectiveRate * 100)}%). Some providers bundle surcharges labeled as "taxes"; these can be itemized and disputed. Verify each tax line against your state's published rates.`,
      confidence: 0.5,
      estimated_monthly_savings: null,
      evidence: {
        line_item_descriptions: items.filter((i) => i.category === "tax").map((i) => i.description),
        amounts: [taxes],
        pre_tax_total: preTax,
        effective_rate: round2(effectiveRate),
        bill_total: parse.total_amount,
      },
    },
  ];
}

function detectContractMismatch(parse: BillParse): Finding[] {
  const contractPrice = parse.contract?.monthly_price;
  if (contractPrice == null || contractPrice <= 0) return [];

  const baseItems = itemsOf(parse).filter((i) => i.category === "base_service" && i.is_recurring);
  if (baseItems.length === 0) return [];

  const actualBase = round2(baseItems.reduce((sum, i) => sum + i.amount, 0));
  const diff = round2(actualBase - contractPrice);
  if (Math.abs(diff) < 0.51) return [];

  const overcharging = diff > 0;
  return [
    {
      type: "contract_mismatch",
      severity: overcharging ? "high" : "low",
      title: overcharging
        ? `Billed ${diff.toFixed(2)} above contracted price`
        : `Billed below contracted price`,
      explanation: overcharging
        ? `Your contract sets the monthly price at ${contractPrice.toFixed(2)}, but recurring base-service charges total ${actualBase.toFixed(2)} — ${diff.toFixed(2)} more per month. This is a direct contract violation you can demand credits for.`
        : `Recurring base-service charges (${actualBase.toFixed(2)}) are below your contracted price (${contractPrice.toFixed(2)}). No action needed; keep this bill as evidence if prices change.`,
      confidence: 0.85,
      estimated_monthly_savings: overcharging ? diff : null,
      evidence: {
        line_item_descriptions: baseItems.map((i) => i.description),
        amounts: [contractPrice, actualBase],
        contract_price: contractPrice,
        billed_base: actualBase,
      },
    },
  ];
}

function detectUnusualOneTimeCharges(items: ParsedLineItem[]): Finding[] {
  const findings: Finding[] = [];
  for (const item of items) {
    if (item.category !== "one_time" || item.amount < 20 || !Number.isFinite(item.amount)) continue;
    findings.push({
      type: "unusual_charge",
      severity: "medium",
      title: `Large one-time charge: ${item.description}`,
      explanation: `"${item.description}" is a one-time charge of ${item.amount.toFixed(2)}. One-time charges above $20 that you did not explicitly request (upgrades, technician visits, add-ons) are frequently reversed when disputed.`,
      confidence: 0.55,
      estimated_monthly_savings: null,
      evidence: {
        line_item_descriptions: [item.description],
        amounts: [item.amount],
      },
    });
  }
  return findings;
}

export interface PriorBillSummary {
  line_items: ParsedLineItem[];
  billing_period_end: string | null;
}

function itemsOf(parse: BillParse): ParsedLineItem[] {
  return parse.line_items;
}

/**
 * Compare recurring charges against the previous bill for the same provider
 * and account. Flags price increases >10% and >$2, plus brand-new recurring
 * charges that were not present before.
 */
export function detectPriceChanges(current: BillParse, previous: PriorBillSummary | null): Finding[] {
  if (!previous) return [];
  const findings: Finding[] = [];

  const prevRecurring = new Map<string, ParsedLineItem>();
  for (const item of previous.line_items) {
    if (!item.is_recurring || item.amount <= 0) continue;
    prevRecurring.set(normalizeDescription(item.description), item);
  }

  const seen = new Set<string>();
  for (const item of itemsOf(current)) {
    if (!item.is_recurring || item.amount <= 0) continue;
    const key = normalizeDescription(item.description);
    seen.add(key);

    const prior = prevRecurring.get(key);
    if (!prior) {
      if (item.amount >= 5 && (isFeeLike(item) || item.category === "equipment" || item.category === "fee")) {
        findings.push({
          type: "price_increase",
          severity: "medium",
          title: `New recurring charge: ${item.description}`,
          explanation: `"${item.description}" (${item.amount.toFixed(2)}/mo) did not appear on your previous bill. Undisclosed new recurring fees must be disclosed and can usually be removed retroactively.`,
          confidence: 0.7,
          estimated_monthly_savings: item.amount,
          evidence: {
            line_item_descriptions: [item.description],
            amounts: [item.amount],
            previous_amount: 0,
          },
        });
      }
      continue;
    }

    const diff = round2(item.amount - prior.amount);
    const pctIncrease = diff / prior.amount;
    if (diff > 2 && pctIncrease > 0.1) {
      findings.push({
        type: "price_increase",
        severity: "medium",
        title: `Price increase: ${item.description}`,
        explanation: `"${item.description}" went from ${prior.amount.toFixed(2)} to ${item.amount.toFixed(2)} (${Math.round(pctIncrease * 100)}%, +${diff.toFixed(2)}/mo) since your previous bill. Providers must notify you of increases, and retention departments routinely restore promotional pricing when challenged.`,
        confidence: 0.8,
        estimated_monthly_savings: diff,
        evidence: {
          line_item_descriptions: [item.description],
          amounts: [prior.amount, item.amount],
          previous_amount: prior.amount,
          current_amount: item.amount,
        },
      });
    }
  }
  return findings;
}

/**
 * Run the full detection suite over a parsed bill. Pure function:
 * same inputs always produce the same findings.
 */
export function analyzeBill(
  parse: BillParse,
  previous: PriorBillSummary | null = null,
): Finding[] {
  const items = itemsOf(parse);
  return [
    ...detectSuspiciousFees(items),
    ...detectDuplicateCharges(items),
    ...detectTaxAnomalies(items, parse),
    ...detectContractMismatch(parse),
    ...detectUnusualOneTimeCharges(items),
    ...detectPriceChanges(parse, previous),
  ];
}
