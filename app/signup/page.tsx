"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "../../utils/supabase/client";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/40 via-black to-black -z-10" />

        <div className="w-full max-w-md">
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
              Check your email
            </h1>
            <p className="text-zinc-500 text-sm">
              We sent a confirmation link to{" "}
              <span className="text-zinc-300 font-medium">{email}</span>.
            </p>
          </div>

          <div className="p-8 border border-zinc-800 bg-zinc-950 rounded-lg text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-emerald-400"
              >
                <path d="M4 4h16c1 0 2 1 2 2v12c0 1-1 2-2 2H4c-1 0-2-1-2-2V6c0-1 1-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <p className="text-sm text-zinc-400 mb-6">
              Click the link in the email to confirm your account. Then come
              back here to sign in.
            </p>
            <Link
              href="/login"
              className="inline-block w-full py-2.5 px-4 bg-white text-black font-medium rounded-md hover:bg-zinc-200 transition-all text-sm"
            >
              Continue to sign in
            </Link>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setEmail("");
                setPassword("");
                setSuccess(false);
              }}
              className="text-xs text-zinc-600 hover:text-zinc-400 underline underline-offset-2"
            >
              Use a different email
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            Create your account
          </h1>
          <p className="text-zinc-500 text-sm">
            Start negotiating your bills with AI agents.
          </p>
        </div>

        {/* Form Card */}
        <div className="p-8 border border-zinc-800 bg-zinc-950 rounded-lg">
          <form onSubmit={handleSignup} className="space-y-5">
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
                placeholder="you@example.com"
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
                placeholder="At least 6 characters"
                required
                minLength={6}
                className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-all text-white placeholder-zinc-600 text-sm"
              />
              <p className="text-xs text-zinc-600 mt-1">
                Use at least 6 characters.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-white text-black font-medium rounded-md hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          {error && (
            <div className="mt-5 p-3 bg-red-950 border border-red-900 rounded-md text-xs text-center text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Sign in link */}
        <div className="mt-6 text-center">
          <p className="text-xs text-zinc-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-zinc-400 hover:text-white underline underline-offset-2"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
