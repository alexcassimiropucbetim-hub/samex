import { Sidebar } from "@/components/Sidebar";
import { InactivityTimer } from "@/components/InactivityTimer";

export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <InactivityTimer />
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 min-h-screen">
        {children}
      </div>
    </>
  );
}
