import { describe, expect, it } from "vitest";
import {
  analyzeBill,
  type PriorBillSummary,
} from "@/lib/analysis/detect";
import { BillParseSchema, type BillParse } from "@/lib/validation";

function makeParse(overrides: Partial<Parameters<typeof BillParseSchema.parse>[0]> = {}): BillParse {
  return BillParseSchema.parse({
    provider: "Comcast Xfinity",
    category: "internet",
    account_number: "123456789",
    billing_period_start: "2026-07-01",
    billing_period_end: "2026-07-31",
    total_amount: 129.97,
    currency: "USD",
    line_items: [
      { description: "Performance Internet 300", category: "base_service", amount: 59.99, is_recurring: true },
      { description: "Xfinity Gateway Rental", category: "equipment", amount: 15.0, is_recurring: true },
      { description: "Paper Statement Fee", category: "fee", amount: 3.5, is_recurring: true },
    ],
    ...overrides,
  });
}

describe("detectSuspiciousFees", () => {
  it("flags equipment rental as a high-severity hidden fee with monthly savings", () => {
    const findings = analyzeBill(makeParse());
    const equip = findings.find((f) => f.type === "hidden_fee" && /Gateway/.test(f.title));
    expect(equip).toBeDefined();
    expect(equip!.severity).toBe("high");
    expect(equip!.estimated_monthly_savings).toBe(15);
  });

  it("flags paper statement fees", () => {
    const findings = analyzeBill(makeParse());
    expect(findings.some((f) => /Paper Statement/i.test(f.title))).toBe(true);
  });

  it("does not flag plain base service charges", () => {
    const findings = analyzeBill(
      makeParse({
        line_items: [
          { description: "Performance Internet 300", category: "base_service", amount: 59.99, is_recurring: true },
        ],
      }),
    );
    expect(findings.filter((f) => f.type === "hidden_fee")).toHaveLength(0);
  });

  it("ignores discounts and credits", () => {
    const findings = analyzeBill(
      makeParse({
        line_items: [
          { description: "Promotional Credit", category: "discount", amount: -10, is_recurring: true },
        ],
      }),
    );
    expect(findings).toHaveLength(0);
  });
});

describe("detectDuplicateCharges", () => {
  it("flags identical description + amount appearing twice", () => {
    const findings = analyzeBill(
      makeParse({
        line_items: [
          { description: "TV Channel Package", category: "base_service", amount: 20.0, is_recurring: true },
          { description: "TV Channel  package", category: "base_service", amount: 20.0, is_recurring: true },
        ],
      }),
    );
    const dup = findings.find((f) => f.type === "duplicate_charge");
    expect(dup).toBeDefined();
    expect(dup!.evidence.occurrences).toBe(2);
    expect(dup!.evidence.excess_total).toBe(20);
  });

  it("does not flag different amounts", () => {
    const findings = analyzeBill(
      makeParse({
        line_items: [
          { description: "TV Package", category: "base_service", amount: 20.0, is_recurring: true },
          { description: "TV Package", category: "base_service", amount: 25.0, is_recurring: true },
        ],
      }),
    );
    expect(findings.find((f) => f.type === "duplicate_charge")).toBeUndefined();
  });
});

describe("detectTaxAnomalies", () => {
  it("flags effective tax rate above 30%", () => {
    const findings = analyzeBill(
      makeParse({
        line_items: [
          { description: "Mobile Plan", category: "base_service", amount: 50, is_recurring: true },
          { description: "State Tax", category: "tax", amount: 20, is_recurring: true },
        ],
      }),
    );
    expect(findings.some((f) => f.type === "tax_error")).toBe(true);
  });

  it("passes normal tax rates", () => {
    const findings = analyzeBill(
      makeParse({
        line_items: [
          { description: "Mobile Plan", category: "base_service", amount: 50, is_recurring: true },
          { description: "State Tax", category: "tax", amount: 4, is_recurring: true },
        ],
      }),
    );
    expect(findings.some((f) => f.type === "tax_error")).toBe(false);
  });
});

describe("detectContractMismatch", () => {
  it("flags billing above the contracted monthly price", () => {
    const findings = analyzeBill(
      makeParse({
        line_items: [
          { description: "Internet Plan", category: "base_service", amount: 74.99, is_recurring: true },
        ],
        contract: { monthly_price: 59.99, commitment_months: 24, end_date: "2027-06-01" },
      }),
    );
    const mismatch = findings.find((f) => f.type === "contract_mismatch");
    expect(mismatch).toBeDefined();
    expect(mismatch!.severity).toBe("high");
    expect(mismatch!.estimated_monthly_savings).toBe(15);
  });

  it("tolerates sub-dollar rounding differences", () => {
    const findings = analyzeBill(
      makeParse({
        line_items: [
          { description: "Internet Plan", category: "base_service", amount: 60.25, is_recurring: true },
        ],
        contract: { monthly_price: 60.0, commitment_months: 24, end_date: null },
      }),
    );
    expect(findings.find((f) => f.type === "contract_mismatch")).toBeUndefined();
  });
});

describe("detectPriceChanges", () => {
  const previous: PriorBillSummary = {
    billing_period_end: "2026-06-30",
    line_items: [
      { description: "Performance Internet 300", category: "base_service", amount: 49.99, is_recurring: true },
    ],
  };

  it("flags a >10% recurring price increase with the delta as savings", () => {
    const findings = analyzeBill(makeParse(), previous);
    const increase = findings.find((f) => f.type === "price_increase" && /Internet 300/.test(f.title));
    expect(increase).toBeDefined();
    expect(increase!.estimated_monthly_savings).toBe(10); // 59.99 - 49.99
  });

  it("flags new recurring fees that were not on the previous bill", () => {
    const findings = analyzeBill(makeParse(), {
      billing_period_end: "2026-06-30",
      line_items: [
        { description: "Performance Internet 300", category: "base_service", amount: 59.99, is_recurring: true },
      ],
    });
    const newFee = findings.find((f) => /New recurring charge/i.test(f.title));
    expect(newFee).toBeDefined();
    expect(newFee!.estimated_monthly_savings).toBeGreaterThan(0);
  });

  it("ignores decreases", () => {
    const findings = analyzeBill(
      makeParse({
        line_items: [
          { description: "Performance Internet 300", category: "base_service", amount: 39.99, is_recurring: true },
        ],
      }),
      previous,
    );
    expect(findings.find((f) => f.type === "price_increase")).toBeUndefined();
  });

  it("returns nothing when there is no previous bill", () => {
    const findings = analyzeBill(makeParse(), null);
    expect(findings.find((f) => f.type === "price_increase")).toBeUndefined();
  });
});

describe("detectUnusualOneTimeCharges", () => {
  it("flags one-time charges of $20 or more", () => {
    const findings = analyzeBill(
      makeParse({
        line_items: [
          { description: "Technician Visit", category: "one_time", amount: 70, is_recurring: false },
        ],
      }),
    );
    expect(findings.some((f) => f.type === "unusual_charge" && /Technician/.test(f.title))).toBe(true);
  });

  it("ignores small one-time charges", () => {
    const findings = analyzeBill(
      makeParse({
        line_items: [
          { description: "PayPer View", category: "one_time", amount: 5.99, is_recurring: false },
        ],
      }),
    );
    expect(findings.find((f) => f.type === "unusual_charge")).toBeUndefined();
  });
});
