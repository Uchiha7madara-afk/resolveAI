import Link from "next/link";
import HeroVisual3D from "../components/HeroVisual3D";
import EnterpriseTrustSection from "../components/EnterpriseTrustSection";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30 selection:text-white font-sans overflow-hidden">
      {/* 0. Top Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#050505]/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
            <span className="font-semibold tracking-wide text-lg">
              ResolveAI
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <Link
              href="#infrastructure"
              className="hover:text-white transition-colors"
            >
              Infrastructure
            </Link>
            <Link
              href="#security"
              className="hover:text-white transition-colors"
            >
              Security
            </Link>
            <Link
              href="#metrics"
              className="hover:text-white transition-colors"
            >
              API Docs
            </Link>
            <Link
              href="#pricing"
              className="hover:text-white transition-colors"
            >
              Pricing
            </Link>
          </div>
          <Link
            href="/login"
            className="bg-white/10 border border-white/10 text-white px-5 py-2 text-sm rounded-md hover:bg-white/20 transition-all shadow-[0_0_15px_rgba(99,102,241,0.1)]"
          >
            CUSTOMER LOGIN →
          </Link>
        </div>
      </nav>

      {/* 1. Hero Section with Neural/Data Background */}
      <section className="relative pt-40 pb-20 px-6 max-w-7xl mx-auto">
        {/* Background Glows */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] -z-10" />
        <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-xs font-medium text-indigo-300 mb-8">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              Early access — accepting pilot users
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 leading-[1.1]">
              ALGORITHMICALLY <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-400 to-zinc-600">
                OPTIMIZING YOUR RECURRING COSTS.
              </span>
            </h1>
            <p className="text-lg text-zinc-400 mb-10 leading-relaxed max-w-lg">
              Leveraging distributed AI agents to analyze, dispute, and secure
              maximum savings on your utility bills. Minimal effort, flawless
              execution.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-md text-sm font-semibold hover:bg-indigo-500 transition-all shadow-[0_0_30px_rgba(79,70,229,0.3)]"
            >
              MAXIMIZE YOUR SAVINGS →
            </Link>
          </div>

          {/* Hero Visual - Simulated Data Nodes */}
          <div className="relative h-[400px] w-full border border-white/10 rounded-xl bg-black/50 backdrop-blur-sm p-6 overflow-hidden flex flex-col justify-between">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            <HeroVisual3D />
            <div className="relative z-10 flex justify-between items-center text-xs font-mono text-zinc-500 mb-4">
              <span>Cost Factors</span>
              <span className="text-indigo-400">Negotiation Pulse</span>
            </div>
            <div className="relative z-10 w-full h-full flex items-center justify-center">
              <svg
                className="w-full h-full opacity-70"
                viewBox="0 0 200 100"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,50 Q25,20 50,50 T100,50 T150,50 T200,50"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="2"
                />
                <path
                  d="M0,60 Q30,80 60,60 T120,60 T180,60 T200,60"
                  fill="none"
                  stroke="url(#gradient2)"
                  strokeWidth="1"
                  opacity="0.5"
                />
                <defs>
                  <linearGradient
                    id="gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#4f46e5" />
                    <stop offset="50%" stopColor="#c084fc" />
                    <stop offset="100%" stopColor="#38bdf8" />
                  </linearGradient>
                  <linearGradient
                    id="gradient2"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="relative z-10 text-right text-xs font-mono text-zinc-500 mt-4">
              Illustrative negotiation trend{" "}
              <span className="text-zinc-600">(sample data)</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Bill Categories We Target (no partnership implied) */}
      <section className="border-y border-white/5 bg-black/40 py-10 px-6">
        <p className="max-w-7xl mx-auto mb-6 text-center text-xs uppercase tracking-widest text-zinc-600">
          Built to negotiate bills across
        </p>
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-12 text-zinc-600 font-bold text-2xl tracking-widest grayscale opacity-60">
          <span className="hover:text-white transition-colors duration-500 cursor-default">
            Internet &amp; Cable
          </span>
          <span className="hover:text-white transition-colors duration-500 cursor-default">
            Wireless
          </span>
          <span className="hover:text-white transition-colors duration-500 cursor-default">
            Electric &amp; Gas
          </span>
          <span className="hover:text-white transition-colors duration-500 cursor-default">
            Streaming
          </span>
          <span className="hover:text-white transition-colors duration-500 cursor-default">
            Home Security
          </span>
        </div>
      </section>

      {/* 3. Core Infrastructure (Elite Bento Box) */}
      <section id="infrastructure" className="py-24 px-6 max-w-7xl mx-auto">
        <h2 className="text-3xl font-medium tracking-tight mb-10 text-zinc-100">
          Core Infrastructure
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Box 1 */}
          <div className="group border border-white/10 bg-[#0a0a0a] rounded-xl p-8 hover:border-indigo-500/50 transition-all duration-300 relative overflow-hidden flex flex-col h-[350px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] -z-10 group-hover:bg-indigo-500/20 transition-all" />
            <h3 className="text-xl font-semibold mb-2">
              Automated Bill Ingestion
            </h3>
            <p className="text-sm text-zinc-400 mb-auto leading-relaxed">
              OCR extracts line items, filtering packets, and hidden fees from
              statements with extreme precision.
            </p>
            <div className="h-32 w-full mt-6 bg-black/50 border border-white/5 rounded-lg flex items-center justify-center relative">
              <div className="grid grid-cols-4 gap-2 w-full px-4">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full ${i % 3 === 0 ? "bg-indigo-500" : "bg-zinc-800"}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Box 2 */}
          <div className="group border border-white/10 bg-[#0a0a0a] rounded-xl p-8 hover:border-purple-500/50 transition-all duration-300 relative overflow-hidden flex flex-col h-[350px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[50px] -z-10 group-hover:bg-purple-500/20 transition-all" />
            <h3 className="text-xl font-semibold mb-2">Market Intel Node</h3>
            <p className="text-sm text-zinc-400 mb-auto leading-relaxed">
              Cross-references rates and visualizes global real-time cost
              patterns against your specific provider.
            </p>
            <div className="h-32 w-full mt-6 flex items-center justify-center">
              <div className="w-full h-full flex flex-col gap-2 justify-end opacity-70">
                <div className="flex items-end gap-1 w-full h-24 px-4">
                  {[40, 70, 45, 90, 65, 85, 30, 50].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-purple-900/50 to-purple-500 rounded-t-sm"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Box 3 */}
          <div className="group border border-white/10 bg-[#0a0a0a] rounded-xl p-8 hover:border-emerald-500/50 transition-all duration-300 relative overflow-hidden flex flex-col h-[350px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] -z-10 group-hover:bg-emerald-500/20 transition-all" />
            <h3 className="text-xl font-semibold mb-2">
              Distributed Agent Network
            </h3>
            <p className="text-sm text-zinc-400 mb-auto leading-relaxed">
              Conducts live voice negotiations executing parallel actions across
              multiple accounts seamlessly.
            </p>
            <div className="h-32 w-full mt-6 bg-black/50 border border-white/5 rounded-lg flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border border-emerald-500/30 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-full border border-emerald-500 animate-ping opacity-20" />
                <div className="w-4 h-4 bg-emerald-500 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* 4. Trust & Live Demo (honest - no fabricated certs or stats) */}
      <section
        id="metrics"
        className="py-24 px-6 border-t border-white/5 bg-[#030303]"
      >
        <EnterpriseTrustSection />
      </section>

      {/* 5. Clean Footer */}
      <footer className="border-t border-white/10 bg-[#050505] pt-16 pb-8 px-6 text-sm text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="w-4 h-4 rounded bg-white" />
            <span className="font-medium text-white tracking-wide">
              ResolveAI
            </span>
          </div>
          <div className="flex gap-8">
            <Link href="#" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
