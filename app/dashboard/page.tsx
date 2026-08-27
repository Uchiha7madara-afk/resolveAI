import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../utils/supabase/server";
import { getDashboardSummary, getRecentBills } from "../../lib/bills/queries";
import { formatMoney, formatDate } from "../../lib/validation";

const statusStyles: Record<string, string> = {
  analyzed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  pending: "bg-zinc-100 text-zinc-600 border border-zinc-200",
  processing: "bg-blue-50 text-blue-700 border border-blue-200",
  failed: "bg-red-50 text-red-700 border border-red-200",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [summary, recentBills] = await Promise.all([
    getDashboardSummary(user.id),
    getRecentBills(user.id, 8),
  ]);

  const stats = [
    { label: "Bills Analyzed", value: `${summary.analyzedCount}`, sub: `${summary.billsCount} uploaded` },
    {
      label: "Issues Detected",
      value: `${summary.openFindings}`,
      sub: summary.openFindings > 0 ? "across your bills" : "nothing flagged yet",
    },
    {
      label: "Potential Savings",
      value: formatMoney(summary.potentialMonthlySavings),
      sub: `${summary.activeNegotiations} active negotiation${summary.activeNegotiations === 1 ? "" : "s"}`,
    },
    {
      label: "Realized Savings",
      value: formatMoney(summary.actualMonthlySavings),
      sub:
        summary.successRate == null ? "no closed negotiations yet" : `${Math.round(summary.successRate * 100)}% success rate`,
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Dashboard</h2>
          <p className="text-sm text-zinc-500 mt-1">
            Your bills, detected issues, and negotiation outcomes.
          </p>
        </div>
        <Link
          href="/dashboard/upload"
          className="px-4 py-2 bg-zinc-900 text-white text-xs font-medium rounded-md hover:bg-zinc-800 transition-colors"
        >
          Upload a bill
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="p-5 bg-white border border-zinc-200 rounded-lg">
            <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
              {stat.label}
            </div>
            <div className="mt-2 text-2xl font-semibold text-zinc-900 tracking-tight">{stat.value}</div>
            <div className="mt-1 text-xs text-zinc-400">{stat.sub}</div>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-zinc-900">Your Bills</h3>
          <Link href="/dashboard/upload" className="text-xs text-zinc-500 hover:text-zinc-900 font-medium">
            Upload another →
          </Link>
        </div>

        {recentBills.length === 0 ? (
          <div className="p-10 bg-white border border-zinc-200 rounded-lg text-center">
            <div className="text-sm font-medium text-zinc-900">No bills uploaded yet</div>
            <p className="text-xs text-zinc-500 mt-1 mb-4">
              Upload your first bill and our engine will parse it and flag hidden charges.
            </p>
            <Link
              href="/dashboard/upload"
              className="inline-block px-4 py-2 bg-zinc-900 text-white text-xs font-medium rounded-md hover:bg-zinc-800"
            >
              Upload your first bill
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  {["Provider", "Period", "Total", "Issues", "Status", "Uploaded"].map((h) => (
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
                {recentBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-zinc-50">
                    <td className="px-5 py-3.5 text-sm font-medium text-zinc-900">
                      <Link href={`/dashboard/bills/${bill.id}`} className="hover:underline">
                        {bill.provider ?? "Processing…"}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-zinc-600">
                      {formatDate(bill.billing_period_end)}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-zinc-900">
                      {formatMoney(bill.total_amount, bill.currency)}
                    </td>
                    <td className="px-5 py-3.5 text-sm">
                      {bill.findings_count > 0 ? (
                        <span className="text-amber-700 font-medium">{bill.findings_count} flagged</span>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          statusStyles[bill.status] ?? statusStyles.pending
                        }`}
                      >
                        {bill.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-zinc-400">
                      {new Date(bill.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
