import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getNegotiations, type NegotiationWithBill } from "@/lib/bills/queries";
import { formatMoney } from "@/lib/validation";
import { startNegotiation, markWon, markLost, cancelNegotiation } from "./actions";

const statusStyles: Record<string, string> = {
  suggested: "bg-blue-50 text-blue-700 border border-blue-200",
  in_progress: "bg-amber-50 text-amber-700 border border-amber-200",
  won: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  lost: "bg-zinc-100 text-zinc-500 border border-zinc-200",
  cancelled: "bg-zinc-100 text-zinc-500 border border-zinc-200",
};

function ActionButtons({ negotiation }: { negotiation: NegotiationWithBill }) {
  const id = negotiation.id;
  const hidden = <input type="hidden" name="id" value={id} />;
  const base =
    "px-3 py-1.5 text-xs font-medium rounded-md border transition-colors";

  switch (negotiation.status) {
    case "suggested":
      return (
        <div className="flex items-center gap-2">
          <form action={startNegotiation}>{hidden}
            <button className={`${base} bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800`}>
              Start negotiation
            </button>
          </form>
          <form action={cancelNegotiation}>{hidden}
            <button className={`${base} bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50`}>
              Dismiss
            </button>
          </form>
        </div>
      );
    case "in_progress":
      return (
        <div className="flex items-center gap-2">
          <form action={markWon}>{hidden}
            <button className={`${base} bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-500`}>
              Mark won
            </button>
          </form>
          <form action={markLost}>{hidden}
            <button className={`${base} bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50`}>
              Mark lost
            </button>
          </form>
        </div>
      );
    default:
      return null;
  }
}

export default async function NegotiationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const negotiations = await getNegotiations(user.id);

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Negotiations</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Savings opportunities generated from your bill analyses. Start one, send the draft, and
          track the outcome.
        </p>
      </div>

      {negotiations.length === 0 ? (
        <div className="p-10 bg-white border border-zinc-200 rounded-lg text-center">
          <div className="text-sm font-medium text-zinc-900">No negotiation opportunities yet</div>
          <p className="text-xs text-zinc-500 mt-1 mb-4">
            When a bill analysis finds recoverable charges, a negotiation draft appears here.
          </p>
          <Link
            href="/dashboard/upload"
            className="inline-block px-4 py-2 bg-zinc-900 text-white text-xs font-medium rounded-md hover:bg-zinc-800"
          >
            Upload a bill
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {negotiations.map((negotiation) => (
            <div key={negotiation.id} className="p-5 bg-white border border-zinc-200 rounded-lg">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/dashboard/bills/${negotiation.bill?.id}`}
                      className="text-sm font-semibold text-zinc-900 hover:underline"
                    >
                      {negotiation.bill?.provider ?? "Bill"}
                    </Link>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        statusStyles[negotiation.status] ?? statusStyles.cancelled
                      }`}
                    >
                      {negotiation.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">
                    Created{" "}
                    {new Date(negotiation.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  <div className="mt-2 text-sm">
                    {negotiation.status === "won" ? (
                      <span className="font-semibold text-emerald-600">
                        {formatMoney(negotiation.actual_monthly_savings ?? negotiation.potential_monthly_savings)}/mo saved
                      </span>
                    ) : negotiation.potential_monthly_savings != null ? (
                      <span className="font-semibold text-zinc-700">
                        {formatMoney(negotiation.potential_monthly_savings)}/mo target
                      </span>
                    ) : null}
                  </div>
                </div>
                <ActionButtons negotiation={negotiation} />
              </div>

              {negotiation.draft_message && (
                <details className="mt-3 group">
                  <summary className="text-xs font-medium text-zinc-500 hover:text-zinc-900 cursor-pointer select-none">
                    View draft letter
                  </summary>
                  <pre className="mt-3 p-4 bg-zinc-50 border border-zinc-200 rounded-md text-xs text-zinc-600 whitespace-pre-wrap font-sans leading-relaxed">
                    {negotiation.draft_message}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
