import type { Finding } from "@/lib/analysis/detect";
import type { BillParse } from "@/lib/validation";
import { round2 } from "@/lib/validation";

function formatFinding(finding: Finding): string {
  const amounts = finding.evidence.amounts.filter((a): a is number => typeof a === "number");
  const amountNote = amounts.length
    ? ` (${amounts.map((a) => `$${round2(a).toFixed(2)}`).join(" → ")})`
    : "";
  return `• ${finding.title}${amountNote}`;
}

/**
 * Build a professional dispute/retention letter from the detected findings.
 * Deterministic template — the same findings always produce the same draft.
 */
export function buildNegotiationDraft(
  parse: BillParse,
  findings: Finding[],
  accountEmail: string,
): string {
  const monthly = findings
    .map((f) => f.estimated_monthly_savings ?? 0)
    .reduce((sum, v) => sum + v, 0);
  const oneTime = findings
    .filter((f) => f.estimated_monthly_savings == null)
    .map((f) => f.evidence.amounts.filter((a): a is number => typeof a === "number"))
    .flat()
    .reduce((sum, v) => sum + Math.max(v, 0), 0);

  const accountRef = parse.account_number
    ? `account ${parse.account_number}`
    : "my account";

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const lines = [
    `To the ${parse.provider} Billing and Retention Team,`,
    ``,
    `Date: ${today}`,
    ``,
    `I am writing regarding my recent bill for the period${
      parse.billing_period_start && parse.billing_period_end
        ? ` of ${parse.billing_period_start} to ${parse.billing_period_end}`
        : ""
    } on ${accountRef}. After reviewing the charges, I have identified the following issues that I ask you to correct:`,
    ``,
    ...findings.map(formatFinding),
    ``,
  ];

  if (monthly > 0) {
    lines.push(
      `These charges add up to $${round2(monthly).toFixed(2)} per month in avoidable or incorrect charges${
        oneTime > 0 ? `, plus $${round2(oneTime).toFixed(2)} in one-time charges` : ""
      }. I request that they be removed from my bill and that appropriate credits be applied to my account going forward.`,
    );
  } else {
    lines.push(
      `I request a review and correction of these charges, with any resulting credits applied to my account.`,
    );
  }

  lines.push(
    ``,
    `I have been a loyal customer and would prefer to resolve this quickly and continue my service. However, I am actively comparing alternative providers, and correcting these charges is a key factor in my decision to stay.`,
    ``,
    `Please confirm the adjustments in writing within 14 days. If these charges cannot be justified item by item, I expect them to be credited.`,
    ``,
    `Thank you for your prompt attention.`,
    ``,
    `Sincerely,`,
    `${accountEmail}`,
    `${parse.account_number ? `Account: ${parse.account_number}` : ""}`,
  );

  return lines.filter((line, i, arr) => !(line === "" && arr[i - 1] === "")).join("\n").trim() + "\n";
}
