import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getBillDetail } from "@/lib/bills/queries";
import { formatMoney, formatDate } from "@/lib/validation";
import CopyButton from "@/components/CopyButton";

const severityStyles: Record<string, string> = {
  high: "bg-red-50 text-red-700 border border-red-200",
  medium: "bg-amber-50 text-amber-700 border border-amber-200",
  low: "bg-zinc-100 text-zinc-600 border border-zinc-200",
};

const categoryLabels: Record<string, string> = {
  base_service: "Service",
  usage: "Usage",
  equipment: "Equipment",
  fee: "Fee",
  tax: "Tax",
  discount: "Discount",
  one_time: "One-time",
  other: "Other",
};

export default async function BillDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const detail = await getBillDetail(user.id, id);
  if (!detail) notFound();

  const { bill, lineItems, findings, negotiation } = detail;
  const totalFindingsSavings = findings.reduce(
    (sum, f) => sum + (f.estimated_monthly_savings ?? 0),
    0,
  );

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/dashboard" className="text-xs text-zinc-400 hover:text-zinc-900">
            ← Back to dashboard
          </Link>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 mt-2">
            {bill.provider ?? "Bill analysis"}
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            {bill.account_number ? `Account ${bill.account_number} · ` : ""}
            {formatDate(bill.billing_period_start)} – {formatDate(bill.billing_period_end)}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold text-zinc-900">
            {formatMoney(bill.total_amount, bill.currency)}
          </div>
          <div className="text-xs text-zinc-400">total billed</div>
        </div>
      </div>

      {bill.status === "failed" && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-sm font-medium text-red-700">Analysis failed</div>
          <div className="text-xs text-red-600 mt-1">{bill.parse_error ?? "Unknown error"}</div>
          <Link
            href="/dashboard/upload"
            className="inline-block mt-3 text-xs font-medium text-red-700 underline underline-offset-2"
          >
            Re-upload the bill
          </Link>
        </div>
      )}

      {findings.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-zinc-900">
              Detected issues ({findings.length})
            </h3>
            {totalFindingsSavings > 0 && (
              <span className="text-sm font-semibold text-emerald-600">
                {formatMoney(totalFindingsSavings)}/mo potentially recoverable
              </span>
            )}
          </div>
          <div className="space-y-3">
            {findings.map((finding) => (
              <div key={finding.id} className="p-4 bg-white border border-zinc-200 rounded-lg">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          severityStyles[finding.severity] ?? severityStyles.low
                        }`}
                      >
                        {finding.severity}
                      </span>
                      <span className="text-sm font-medium text-zinc-900">{finding.title}</span>
                    </div>
                    <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                      {finding.explanation}
                    </p>
                    <div className="text-[11px] text-zinc-400 mt-2">
                      {Math.round(finding.confidence * 100)}% confidence
                      {finding.estimated_monthly_savings != null &&
                        ` · ~${formatMoney(finding.estimated_monthly_savings)}/mo if resolved`}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {bill.status === "analyzed" && findings.length === 0 && (
        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-lg">
          <div className="text-sm font-medium text-emerald-700">No issues detected</div>
          <p className="text-xs text-emerald-600 mt-1">
            This bill looks clean — no hidden fees, duplicates, or price anomalies were found.
          </p>
        </div>
      )}

      {negotiation?.draft_message && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-zinc-900">Negotiation draft</h3>
            <CopyButton text={negotiation.draft_message} label="Copy letter" />
          </div>
          <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-t-lg">
            <span className="text-xs text-zinc-500">
              Status: <span className="font-medium text-zinc-700">{negotiation.status.replace("_", " ")}</span>
              {negotiation.potential_monthly_savings != null && (
                <>
                  {" · "}target {formatMoney(negotiation.potential_monthly_savings)}/mo
                </>
              )}
            </span>
            <Link
              href="/dashboard/negotiations"
              className="text-xs font-medium text-zinc-600 hover:text-zinc-900 underline underline-offset-2"
            >
              Manage in Negotiations →
            </Link>
          </div>
          <pre className="p-5 bg-white border border-t-0 border-zinc-200 rounded-b-lg text-xs text-zinc-700 whitespace-pre-wrap font-sans leading-relaxed">
            {negotiation.draft_message}
          </pre>
        </div>
      )}

      {lineItems.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-zinc-900 mb-4">
            Line items ({lineItems.length})
          </h3>
          <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  {["Description", "Type", "Recurring", "Amount"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {lineItems.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50">
                    <td className="px-5 py-3 text-sm text-zinc-900">
                      {item.description}
                      {item.notes && <div className="text-xs text-zinc-400 mt-0.5">{item.notes}</div>}
                    </td>
                    <td className="px-5 py-3 text-sm text-zinc-600">
                      {categoryLabels[item.category] ?? item.category}
                    </td>
                    <td className="px-5 py-3 text-sm text-zinc-600">
                      {item.is_recurring ? "Monthly" : "One-time"}
                    </td>
                    <td
                      className={`px-5 py-3 text-sm font-medium ${
                        item.amount < 0 ? "text-emerald-600" : "text-zinc-900"
                      }`}
                    >
                      {formatMoney(item.amount, bill.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
