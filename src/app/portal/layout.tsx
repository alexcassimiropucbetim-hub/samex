import { PortalSidebar } from "@/components/PortalSidebar";
import { Sidebar } from "@/components/Sidebar";
import { InactivityTimer } from "@/components/InactivityTimer";
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
      <InactivityTimer />
      {isAdmin ? <Sidebar /> : <PortalSidebar isRegional={!!isRegional} />}
      <div className="flex-1 ml-0 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 min-h-screen">
        {!isAdmin && (
          <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                A Paz de Deus, {session.name}!
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Hoje é {new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(new Date()).charAt(0).toUpperCase() + new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(new Date()).slice(1)}, {new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}.
              </p>
            </div>
            {session.roleName && (
              <span className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-xs font-semibold border border-orange-500/30 self-start md:self-auto mt-1 md:mt-0">
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
