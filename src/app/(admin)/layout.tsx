import { Sidebar } from "@/components/Sidebar";
import { InactivityTimer } from "@/components/InactivityTimer";

import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.type !== "admin") {
    redirect("/admin-login");
  }

  return (
    <>
      <InactivityTimer />
      <Sidebar role={session.role} adminName={session.name} administrationId={session.administrationId} />
      <div className="flex-1 ml-0 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 min-h-screen">
        {children}
      </div>
    </>
  );
}
