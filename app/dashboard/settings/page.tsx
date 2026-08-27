"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../utils/supabase/client";

export default function SettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data: { user } }: { data: { user: { email?: string } | null } }) => setEmail(user?.email ?? null));
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Settings
        </h2>
        <p className="text-sm text-zinc-500 mt-1">
          Manage your account preferences.
        </p>
      </div>

      <div className="p-6 bg-white border border-zinc-200 rounded-lg">
        <div className="text-sm font-medium text-zinc-900">Account</div>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-500">Email</span>
            <span className="text-zinc-900 font-medium">
              {email ?? "Loading..."}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Plan</span>
            <span className="text-zinc-900 font-medium">Free</span>
          </div>
        </div>
      </div>

      <div className="p-6 bg-white border border-zinc-200 rounded-lg">
        <div className="text-sm font-medium text-zinc-900">Notifications</div>
        <div className="mt-3 text-xs text-zinc-400">
          Email alerts for negotiation outcomes are enabled by default. Granular
          notification controls are coming soon.
        </div>
      </div>

      <div className="p-6 bg-white border border-red-200 rounded-lg">
        <div className="text-sm font-medium text-zinc-900">Session</div>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="mt-3 px-4 py-2 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-500 transition-colors disabled:opacity-50"
        >
          {signingOut ? "Signing out..." : "Sign out of all sessions"}
        </button>
      </div>
    </div>
  );
}

