import Link from "next/link";

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
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-xs font-medium text-emerald-400 mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              System Operational
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
              Realized savings metrics:{" "}
              <span className="text-emerald-400">+$867.00</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Supported Providers (Grayscale Marquee) */}
      <section className="border-y border-white/5 bg-black/40 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-12 text-zinc-600 font-bold text-2xl tracking-widest grayscale opacity-60">
          <span className="hover:text-white transition-colors duration-500 cursor-default">
            AT&T
          </span>
          <span className="hover:text-white transition-colors duration-500 cursor-default">
            COMCAST
          </span>
          <span className="hover:text-white transition-colors duration-500 cursor-default">
            VERIZON
          </span>
          <span className="hover:text-white transition-colors duration-500 cursor-default">
            PG&E
          </span>
          <span className="hover:text-white transition-colors duration-500 cursor-default">
            SPECTRUM
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

      {/* 4. Complex Metrics & Dashboard Case Study */}
      <section
        id="metrics"
        className="py-24 px-6 border-t border-white/5 bg-[#030303]"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 border border-white/10 bg-[#0a0a0a] rounded-xl p-10 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-zinc-800/20 rounded-full blur-[80px]" />
            <h2 className="text-3xl font-medium tracking-tight mb-6">
              Enterprise Privacy
            </h2>
            <ul className="space-y-6 text-sm text-zinc-400">
              <li className="flex items-start gap-4">
                <div className="p-2 bg-white/5 rounded text-zinc-300">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div>
                  <strong className="block text-white mb-1">
                    SOC-2 Type II Certified
                  </strong>
                  Rigorous security controls protecting your raw financial data.
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="p-2 bg-white/5 rounded text-zinc-300">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <div>
                  <strong className="block text-white mb-1">
                    AES-256 Encryption at Rest
                  </strong>
                  Military-grade encryption for all stored utility credentials.
                </div>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-7 border border-white/10 bg-[#0a0a0a] rounded-xl p-8 flex flex-col">
            <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
              <h3 className="text-lg font-medium">
                Continual Negotiation Metrics
              </h3>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-zinc-700" />
                <div className="w-3 h-3 rounded-full bg-zinc-700" />
                <div className="w-3 h-3 rounded-full bg-zinc-700" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-black/50 border border-white/5 p-4 rounded-lg">
                <div className="text-xs text-zinc-500 mb-1">
                  Negotiated Accounts
                </div>
                <div className="text-2xl font-semibold text-white">
                  100,000+
                </div>
              </div>
              <div className="bg-black/50 border border-white/5 p-4 rounded-lg">
                <div className="text-xs text-zinc-500 mb-1">
                  Average Savings
                </div>
                <div className="text-2xl font-semibold text-emerald-400">
                  -$340.50
                </div>
              </div>
              <div className="bg-black/50 border border-white/5 p-4 rounded-lg">
                <div className="text-xs text-zinc-500 mb-1">System Status</div>
                <div className="text-2xl font-semibold text-white">Optimal</div>
              </div>
            </div>

            <div className="bg-black rounded-lg border border-white/5 p-4 font-mono text-xs text-zinc-400 flex-1">
              <div className="text-zinc-600 mb-2">
                // Agent executing live negotiation...
              </div>
              <div className="text-indigo-400">const</div>{" "}
              <span className="text-white">agent</span> ={" "}
              <span className="text-blue-300">new</span>{" "}
              <span className="text-emerald-300">VoiceAgent</span>(userData);
              <br />
              <span className="text-white">agent</span>.
              <span className="text-blue-300">connect</span>(
              <span className="text-orange-300">'comcast_retention_line'</span>
              );
              <br />
              <br />
              <span className="text-zinc-600">
                &gt; Authenticating with provider... [OK]
              </span>
              <br />
              <span className="text-zinc-600">
                &gt; Cross-referencing tier promotions... [FOUND]
              </span>
              <br />
              <span className="text-zinc-600">
                &gt; Initiating dispute protocol...
              </span>
              <br />
              <span className="text-emerald-400 animate-pulse">
                &gt; Rate successfully lowered by $45/mo.
              </span>
            </div>
          </div>
        </div>
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
              System Status
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
