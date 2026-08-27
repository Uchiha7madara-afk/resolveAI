const plans = [
  {
    name: "Free",
    price: "$0",
    features: [
      "1 bill analysis per month",
      "Hidden fee detection",
      "Email support",
    ],
    cta: "Current plan",
    current: true,
  },
  {
    name: "Pro",
    price: "$19",
    features: [
      "Unlimited bill analyses",
      "Autonomous negotiation agents",
      "Dispute letter drafting & sending",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    current: false,
  },
];

export default function BillingPage() {
  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Billing
        </h2>
        <p className="text-sm text-zinc-500 mt-1">
          Manage your subscription and payment method.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`p-6 bg-white border rounded-lg ${
              plan.current ? "border-zinc-900" : "border-zinc-200"
            }`}
          >
            <div className="flex items-baseline justify-between">
              <div className="text-sm font-semibold text-zinc-900">
                {plan.name}
              </div>
              <div className="text-2xl font-semibold text-zinc-900">
                {plan.price}
                <span className="text-xs text-zinc-400 font-normal">
                  /mo
                </span>
              </div>
            </div>
            <ul className="mt-4 space-y-2">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className="text-xs text-zinc-600 flex items-start gap-2"
                >
                  <span className="text-emerald-500 mt-0.5">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            <button
              disabled={plan.current}
              className={`mt-6 w-full py-2 text-xs font-medium rounded-md transition-colors disabled:cursor-default ${
                plan.current
                  ? "bg-zinc-100 text-zinc-400"
                  : "bg-zinc-900 text-white hover:bg-zinc-800"
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      <div className="p-4 bg-white border border-zinc-200 rounded-lg">
        <div className="text-sm font-medium text-zinc-900">Payment method</div>
        <div className="text-xs text-zinc-400 mt-1">
          No card on file. Payment collection via Stripe is coming soon.
        </div>
      </div>
    </div>
  );
}
