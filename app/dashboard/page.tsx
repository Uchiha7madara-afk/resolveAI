"use client";

const stats = [
  {
    label: "Bills Negotiated",
    value: "12",
    change: "+3 this month",
  },
  {
    label: "Total Savings",
    value: "$3,847",
    change: "+$612 this month",
  },
  {
    label: "Active Agents",
    value: "3",
    change: "2 in progress",
  },
  {
    label: "Success Rate",
    value: "87%",
    change: "+4% vs last month",
  },
];

const recentNegotiations = [
  {
    id: 1,
    provider: "Comcast Xfinity",
    category: "Internet",
    monthlySavings: "$43",
    status: "Completed",
    date: "2 hours ago",
  },
  {
    id: 2,
    provider: "AT&T Fiber",
    category: "Internet",
    monthlySavings: "$25",
    status: "Completed",
    date: "1 day ago",
  },
  {
    id: 3,
    provider: "Verizon Wireless",
    category: "Mobile",
    monthlySavings: "$18",
    status: "Completed",
    date: "3 days ago",
  },
  {
    id: 4,
    provider: "Spectrum Internet",
    category: "Internet",
    monthlySavings: "$35",
    status: "In Progress",
    date: "5 days ago",
  },
];

const quickActions = [
  {
    title: "Upload New Bill",
    description: "Drop a PDF or image to start negotiation",
  },
  {
    title: "View Active Agents",
    description: "Monitor ongoing negotiations in real-time",
  },
  {
    title: "Download Report",
    description: "Export your savings history as CSV",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 max-w-7xl">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Dashboard
        </h2>
        <p className="text-sm text-zinc-500 mt-1">
          Monitor your bill negotiation activity and agent performance.
        </p>
      </div>

      {/* Demo banner */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-100 border border-zinc-200 rounded-md">
        <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
          Demo Mode
        </span>
        <span className="text-xs text-zinc-400">
          — Data shown is sample data. Connect Supabase to enable real
          functionality.
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-5 bg-white border border-zinc-200 rounded-lg"
          >
            <div className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
              {stat.label}
            </div>
            <div className="mt-2 text-2xl font-semibold text-zinc-900 tracking-tight">
              {stat.value}
            </div>
            <div className="mt-1 text-xs text-zinc-400">{stat.change}</div>
          </div>
        ))}
      </div>

      {/* Recent Negotiations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-zinc-900">
            Recent Negotiations
          </h3>
          <button className="text-xs text-zinc-500 hover:text-zinc-900 font-medium">
            View all →
          </button>
        </div>
        <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <th className="px-5 py-3 text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                  Monthly Savings
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {recentNegotiations.map((neg) => (
                <tr key={neg.id} className="hover:bg-zinc-50">
                  <td className="px-5 py-3.5 text-sm font-medium text-zinc-900">
                    {neg.provider}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-zinc-600">
                    {neg.category}
                  </td>
                  <td className="px-5 py-3.5 text-sm font-medium text-zinc-900">
                    {neg.monthlySavings}/mo
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        neg.status === "Completed"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {neg.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-zinc-400">
                    {neg.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-base font-semibold text-zinc-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.title}
              className="p-5 bg-white border border-zinc-200 rounded-lg text-left hover:border-zinc-300 hover:bg-zinc-50 transition-colors group"
            >
              <div className="text-sm font-medium text-zinc-900 group-hover:text-black">
                {action.title}
              </div>
              <div className="text-xs text-zinc-500 mt-1">
                {action.description}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
