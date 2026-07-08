"use client";

export default function TopBar() {
  return (
    <header className="border-b border-zinc-200 bg-white px-8 h-12 flex items-center justify-between sticky top-0 z-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-zinc-400">ResolveAI</span>
        <span className="text-zinc-300">/</span>
        <span className="text-zinc-900 font-medium">Dashboard</span>
      </div>

      {/* Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
          <span className="text-xs text-zinc-500">All systems operational</span>
        </div>
      </div>
    </header>
  );
}
