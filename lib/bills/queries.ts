import { createClient } from "@/utils/supabase/server";

export interface DashboardSummary {
  billsCount: number;
  analyzedCount: number;
  openFindings: number;
  potentialMonthlySavings: number;
  actualMonthlySavings: number;
  successRate: number | null; // won / (won + lost), null when no closed negotiations
  activeNegotiations: number;
}

export async function getDashboardSummary(userId: string): Promise<DashboardSummary> {
  const supabase = await createClient();

  const [billsRes, findingsRes, negotiationsRes] = await Promise.all([
    supabase.from("bills").select("status").eq("user_id", userId),
    supabase.from("bill_findings").select("id").eq("user_id", userId),
    supabase
      .from("negotiations")
      .select("status, potential_monthly_savings, actual_monthly_savings")
      .eq("user_id", userId),
  ]);

  const bills = billsRes.data ?? [];
  const negotiations = negotiationsRes.data ?? [];
  const won = negotiations.filter((n) => n.status === "won");
  const lost = negotiations.filter((n) => n.status === "lost");
  const closed = won.length + lost.length;

  return {
    billsCount: bills.length,
    analyzedCount: bills.filter((b) => b.status === "analyzed").length,
    openFindings: (findingsRes.data ?? []).length,
    potentialMonthlySavings: roundSum(
      negotiations
        .filter((n) => n.status === "suggested" || n.status === "in_progress")
        .map((n) => n.potential_monthly_savings),
    ),
    actualMonthlySavings: roundSum(won.map((n) => n.actual_monthly_savings ?? n.potential_monthly_savings)),
    successRate: closed > 0 ? won.length / closed : null,
    activeNegotiations: negotiations.filter((n) => n.status === "in_progress").length,
  };
}

function roundSum(values: Array<number | null | undefined>): number {
  return Math.round(values.reduce<number>((sum, v) => sum + (v ?? 0), 0) * 100) / 100;
}

export interface NegotiationWithBill {
  id: string;
  status: "suggested" | "in_progress" | "won" | "lost" | "cancelled";
  potential_monthly_savings: number | null;
  actual_monthly_savings: number | null;
  draft_message: string | null;
  created_at: string;
  bill: {
    id: string;
    provider: string | null;
    category: string | null;
    billing_period_end: string | null;
  } | null;
}

export async function getNegotiations(userId: string): Promise<NegotiationWithBill[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("negotiations")
    .select(
      `id, status, potential_monthly_savings, actual_monthly_savings, draft_message, created_at,
       bills ( id, provider, category, billing_period_end )`,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []) as unknown as NegotiationWithBill[];
}

export interface BillListItem {
  id: string;
  status: string;
  provider: string | null;
  category: string | null;
  billing_period_end: string | null;
  total_amount: number | null;
  currency: string;
  created_at: string;
  findings_count: number;
}

export async function getRecentBills(userId: string, limit = 10): Promise<BillListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bills")
    .select(
      `id, status, provider, category, billing_period_end, total_amount, currency, created_at,
       bill_findings ( id )`,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((bill) => ({
    ...bill,
    findings_count: (bill.bill_findings as unknown[] | null)?.length ?? 0,
  }));
}

export interface BillDetail {
  bill: {
    id: string;
    status: string;
    provider: string | null;
    category: string | null;
    account_number: string | null;
    billing_period_start: string | null;
    billing_period_end: string | null;
    total_amount: number | null;
    currency: string;
    file_name: string;
    parse_error: string | null;
    created_at: string;
  };
  lineItems: Array<{
    id: string;
    description: string;
    category: string;
    amount: number;
    is_recurring: boolean;
    quantity: number | null;
    notes: string | null;
  }>;
  findings: Array<{
    id: string;
    type: string;
    severity: string;
    title: string;
    explanation: string;
    confidence: number;
    estimated_monthly_savings: number | null;
  }>;
  negotiation: {
    id: string;
    status: string;
    potential_monthly_savings: number | null;
    draft_message: string | null;
  } | null;
}

export async function getBillDetail(userId: string, billId: string): Promise<BillDetail | null> {
  const supabase = await createClient();

  const { data: bill, error: billError } = await supabase
    .from("bills")
    .select(
      `id, status, provider, category, account_number, billing_period_start, billing_period_end,
       total_amount, currency, file_name, parse_error, created_at`,
    )
    .eq("id", billId)
    .eq("user_id", userId)
    .maybeSingle();
  if (billError || !bill) return null;

  const [itemsRes, findingsRes, negRes] = await Promise.all([
    supabase
      .from("bill_line_items")
      .select("id, description, category, amount, is_recurring, quantity, notes")
      .eq("bill_id", billId)
      .order("sort_order"),
    supabase
      .from("bill_findings")
      .select("id, type, severity, title, explanation, confidence, estimated_monthly_savings")
      .eq("bill_id", billId)
      .order("severity", { ascending: false }),
    supabase
      .from("negotiations")
      .select("id, status, potential_monthly_savings, draft_message")
      .eq("bill_id", billId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return {
    bill,
    lineItems: (itemsRes.data ?? []).map((item) => ({
      ...item,
      amount: Number(item.amount),
    })),
    findings: (findingsRes.data ?? []).map((f) => ({
      ...f,
      confidence: Number(f.confidence),
      estimated_monthly_savings:
        f.estimated_monthly_savings == null ? null : Number(f.estimated_monthly_savings),
    })),
    negotiation: negRes.data ?? null,
  };
}
