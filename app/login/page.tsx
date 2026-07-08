"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { setAuthenticated } from "../../utils/auth";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("Authenticating...");

    // TODO: Replace with real Supabase auth
    setTimeout(() => {
      setAuthenticated(email);
      setMessage("Access granted. Redirecting...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 400);
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/40 via-black to-black -z-10" />

      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
              <span className="text-black font-bold text-sm">R</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">
              ResolveAI
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight mb-2">
            Sign in to your account
          </h1>
          <p className="text-zinc-500 text-sm">
            Enter your credentials to access the operator dashboard.
          </p>
        </div>

        {/* Form Card */}
        <div className="p-8 border border-zinc-800 bg-zinc-950 rounded-lg">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-xs font-medium text-zinc-400 uppercase tracking-wider"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@resolveai.com"
                required
                className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-all text-white placeholder-zinc-600 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-xs font-medium text-zinc-400 uppercase tracking-wider"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-all text-white placeholder-zinc-600 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-white text-black font-medium rounded-md hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? "Authenticating..." : "Sign in"}
            </button>
          </form>

          {message && (
            <div className="mt-5 p-3 bg-zinc-900 border border-zinc-800 rounded-md text-xs text-center text-zinc-400">
              {message}
            </div>
          )}
        </div>

        {/* Demo notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-zinc-600">
            Demo mode — any email and password will sign you in.
          </p>
        </div>
      </div>
    </div>
  );
}
