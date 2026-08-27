"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  UploadCloud,
  PhoneCall,
  CreditCard,
  Settings,
  LogOut,
} from "lucide-react";
import { createClient } from "../utils/supabase/client";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Upload Bill", href: "/dashboard/upload", icon: UploadCloud },
  { label: "Negotiations", href: "/dashboard/negotiations", icon: PhoneCall },
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; name: string } | null>(
    null,
  );

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }: { data: { user: { email?: string } | null } }) => {
      if (user?.email) {
        setUser({ email: user.email, name: user.email.split("@")[0] });
      }
    });
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="w-64 flex-shrink-0 border-r border-zinc-200 bg-white h-screen sticky top-0 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-zinc-200">
        <Link href="/dashboard" className="inline-flex items-center gap-2">
          <div className="w-7 h-7 bg-zinc-900 rounded-sm flex items-center justify-center">
            <span className="text-white font-bold text-xs">R</span>
          </div>
          <span className="text-base font-semibold tracking-tight text-zinc-900">
            ResolveAI
          </span>
          <span className="ml-1 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 bg-zinc-100 border border-zinc-200 rounded">
            BETA
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
          Workspace
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-zinc-100 text-zinc-900 font-medium"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
              }`}
            >
              <Icon className="w-4 h-4 text-zinc-400" strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User info */}
      <div className="px-3 py-3 border-t border-zinc-200">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 bg-zinc-100 border border-zinc-200 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-medium text-zinc-600">
              {user?.name?.charAt(0).toUpperCase() || "O"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-zinc-900 truncate">
              {user?.name || "Operator"}
            </div>
            <div className="text-xs text-zinc-400 truncate">
              {user?.email || "operator@resolveai.com"}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full mt-1 px-3 py-2 text-xs text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 rounded-md transition-colors text-left flex items-center gap-2"
        >
          <LogOut className="w-3.5 h-3.5" strokeWidth={1.75} />
          Sign out
        </button>
      </div>
    </aside>
  );
}

