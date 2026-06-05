import { PortalSidebar } from "@/components/PortalSidebar";
import { Sidebar } from "@/components/Sidebar";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  
  if (!session) {
    redirect("/login");
  }

  const isAdmin = session.type === "admin";
  const isRegional = session.roleName?.toLowerCase().includes("regional") || session.roleName?.toLowerCase().includes("examinadora");

  return (
    <>
      {isAdmin ? <Sidebar /> : <PortalSidebar isRegional={!!isRegional} />}
      <div className="flex-1 ml-64 p-8">
        {!isAdmin && (
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-medium text-slate-600">
              Bem-vindo(a), <span className="text-slate-900 font-bold">{session.name}</span>
            </h2>
            {session.roleName && (
              <span className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-xs font-semibold border border-orange-500/30">
                {session.roleName}
              </span>
            )}
          </div>
        )}
        {children}
      </div>
    </>
  );
}
