import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";

export const metadata = { title: { template: "%s | Admin — Casino Platform" } };

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Fixed sidebar */}
      <AdminSidebar />

      {/* Main area (offset by sidebar) */}
      <div className="flex flex-col flex-1 ml-64 overflow-hidden">
        <AdminTopbar />

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
