"use client";
import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);

  const handleLaunch = () => {
    setLoading(true);
    // This will route to our authentication dashboard next
    window.location.href = "/dashboard";
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-black text-white p-8 overflow-hidden">
      {/* Dynamic Ambient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-950/30 via-black to-black -z-10" />

      <div className="text-center z-10 space-y-6 max-w-4xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 text-xs text-zinc-400 tracking-wide backdrop-blur-sm animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          System Status: Operational
        </div>

        <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-white">
          Resolve
          <span className="text-indigo-500 drop-shadow-[0_0_25px_rgba(99,102,241,0.4)]">
            AI
          </span>
        </h1>

        <p className="text-lg md:text-xl text-zinc-400 font-medium max-w-2xl mx-auto leading-relaxed">
          Autonomous intelligence reclaiming the hours lost to modern
          bureaucracy. Parse corporate billing systems, deploy negotiating
          agents, and secure your capital back.
        </p>

        <div className="pt-6">
          <button
            onClick={handleLaunch}
            disabled={loading}
            className="group relative px-8 py-4 bg-white text-black font-bold rounded-full overflow-hidden transition-all duration-300 hover:bg-indigo-600 hover:text-white transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] disabled:opacity-50"
          >
            {loading ? "Initializing Core..." : "Launch Production Agent"}
          </button>
        </div>
      </div>

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_1px)] opacity-20 -z-20" />
    </main>
  );
}
