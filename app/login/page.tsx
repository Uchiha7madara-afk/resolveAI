"use client";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-white px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
            Resolve AI
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Algorithmically Optimizing Your Recurring Costs
          </p>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Leveraging distributed AI agents to analyze, deploy, and secure
            machine learning models in your daily tasks. Maintain efficiency,
            reduce costs.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <a
              href="/dashboard"
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Get Started Free
            </a>
            <a
              href="/login"
              className="px-8 py-3 bg-white/10 backdrop-blur-sm rounded-lg font-semibold hover:bg-white/20 transition border border-white/20"
            >
              Sign In
            </a>
          </div>

                    {/* Trust Indicators - honest */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-sm text-gray-400">
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4">
              <p className="text-white font-semibold">Encrypted by design</p>
              <p>Data encrypted in transit and at rest</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4">
              <p className="text-white font-semibold">Real-time AI</p>
              <p>Powered by Claude & GPT-4</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4">
              <p className="text-white font-semibold">Early access</p>
              <p>Now accepting pilot users</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
