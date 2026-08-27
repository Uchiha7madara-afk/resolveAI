import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { logger } from "@/lib/logger";
import { parseBillWithLlm, LlmConfigError } from "@/lib/llm/parse-bill";
import { analyzeBill, type Finding } from "@/lib/analysis/detect";
import { buildNegotiationDraft } from "@/lib/negotiation/draft";
import { round2, type ParsedLineItem } from "@/lib/validation";

export const runtime = "nodejs";
export const maxDuration = 120;

interface BillRow {
  id: string;
  user_id: string;
  status: "pending" | "processing" | "analyzed" | "failed";
  file_path: string;
  file_type: "application/pdf" | "image/png" | "image/jpeg";
  provider: string | null;
  account_number: string | null;
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: bill, error: billError } = await supabase
      .from("bills")
      .select("id, user_id, status, file_path, file_type, provider, account_number")
      .eq("id", id)
      .single<BillRow>();
    if (billError || !bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }
    if (bill.status === "processing") {
      return NextResponse.json({ error: "Bill is already being processed" }, { status: 409 });
    }
    if (bill.status === "analyzed") {
      return NextResponse.json({ error: "Bill is already analyzed" }, { status: 409 });
    }

    const { error: claimError } = await supabase
      .from("bills")
      .update({ status: "processing", parse_error: null })
      .eq("id", id)
      .in("status", ["pending", "failed"]);
    if (claimError) throw claimError;

    const result = await processBill(supabase, user.id, user.email ?? "account holder", bill);
    logger.info("Bill analyzed", { billId: id, findings: result.findingsCount });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    logger.error("Bill processing failed", { billId: id, error: message });

    // Best-effort: mark the bill failed so the UI can show + retry.
    try {
      const supabase = await createClient();
      await supabase
        .from("bills")
        .update({ status: "failed", parse_error: message })
        .eq("id", id);
    } catch (cleanupErr) {
      logger.error("Failed to mark bill as failed", {
        billId: id,
        error: cleanupErr instanceof Error ? cleanupErr.message : String(cleanupErr),
      });
    }

    const status = err instanceof LlmConfigError ? 503 : 422;
    return NextResponse.json({ error: message }, { status });
  }
}

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

async function processBill(
  supabase: SupabaseServerClient,
  userId: string,
  userEmail: string,
  bill: BillRow,
): Promise<{ status: string; findingsCount: number; negotiationCreated: boolean }> {
  // 1. Fetch the stored document.
  const { data: fileData, error: downloadError } = await supabase.storage
    .from("bills")
    .download(bill.file_path);
  if (downloadError || !fileData) {
    throw new Error(`Could not read the stored bill file: ${downloadError?.message ?? "missing"}`);
  }

  // 2. LLM parse with schema validation.
  const parse = await parseBillWithLlm({
    buffer: await fileData.arrayBuffer(),
    mimeType: bill.file_type,
    fileName: bill.file_path,
  });

  // 3. Replace any line items from a previous failed attempt.
  await supabase.from("bill_line_items").delete().eq("bill_id", bill.id);

  const { error: itemsError } = await supabase.from("bill_line_items").insert(
    parse.line_items.map((item, index) => ({
      bill_id: bill.id,
      description: item.description.slice(0, 500),
      category: item.category,
      amount: round2(item.amount),
      quantity: item.quantity ?? null,
      is_recurring: item.is_recurring,
      notes: item.notes ?? null,
      sort_order: index,
    })),
  );
  if (itemsError) throw itemsError;

  // 4. Pull the previous analyzed bill for the same provider/account
  //    (price-increase detection needs history).
  let prevBillQuery = supabase
    .from("bills")
    .select("id, billing_period_end")
    .eq("user_id", userId)
    .eq("status", "analyzed")
    .eq("provider", parse.provider)
    .order("created_at", { ascending: false })
    .limit(1);

  prevBillQuery = parse.account_number
    ? prevBillQuery.eq("account_number", parse.account_number)
    : prevBillQuery.is("account_number", null);

  const { data: prevBill } = await prevBillQuery.maybeSingle();

  let previous: Parameters<typeof analyzeBill>[1] = null;
  if (prevBill) {
    const { data: prevItems } = await supabase
      .from("bill_line_items")
      .select("description, category, amount, quantity, is_recurring, notes")
      .eq("bill_id", prevBill.id)
      .order("sort_order");
    if (prevItems && prevItems.length > 0) {
      previous = {
        billing_period_end: prevBill.billing_period_end,
        line_items: prevItems as unknown as ParsedLineItem[],
      };
    }
  }

  // 5. Run detection.
  const findings: Finding[] = analyzeBill(parse, previous);

  if (findings.length > 0) {
    await supabase.from("bill_findings").insert(
      findings.map((finding) => ({
        bill_id: bill.id,
        user_id: userId,
        type: finding.type,
        severity: finding.severity,
        title: finding.title.slice(0, 300),
        explanation: finding.explanation,
        confidence: finding.confidence,
        estimated_monthly_savings: finding.estimated_monthly_savings,
        evidence: finding.evidence,
      })),
    );
  }

  // 6. Negotiation opportunity from actionable findings.
  const potentialSavings = round2(
    findings.reduce((sum, f) => sum + (f.estimated_monthly_savings ?? 0), 0),
  );
  let negotiationCreated = false;
  if (findings.length > 0 && potentialSavings > 0) {
    const draft = buildNegotiationDraft(parse, findings, userEmail);
    const { error: negError } = await supabase.from("negotiations").insert({
      bill_id: bill.id,
      user_id: userId,
      status: "suggested",
      potential_monthly_savings: potentialSavings,
      draft_message: draft,
    });
    if (negError) throw negError;
    negotiationCreated = true;
  }

  // 7. Finalize the bill record.
  const { error: finalizeError } = await supabase
    .from("bills")
    .update({
      status: "analyzed",
      provider: parse.provider,
      category: parse.category,
      account_number: parse.account_number,
      billing_period_start: parse.billing_period_start,
      billing_period_end: parse.billing_period_end,
      total_amount: parse.total_amount != null ? round2(parse.total_amount) : null,
      currency: parse.currency,
      parsed_at: new Date().toISOString(),
      raw_analysis: parse,
      parse_error: null,
    })
    .eq("id", bill.id);
  if (finalizeError) throw finalizeError;

  return { status: "analyzed", findingsCount: findings.length, negotiationCreated };
}
