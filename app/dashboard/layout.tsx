import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";

// Route protection is enforced server-side by middleware.ts (Supabase session).
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
