import { PortalSidebar } from "@/components/PortalSidebar";
import { Sidebar } from "@/components/Sidebar";
import { InactivityTimer } from "@/components/InactivityTimer";
import { ChurchSwitcher } from "@/components/ChurchSwitcher";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
  const isExaminadora = session.roleName?.toLowerCase().includes("examinadora");
  const adminRole = session.role; // Pass admin role

  let pendingTestsCount = 0;
  let userChurches: any[] = [];
  let activeChurchId = session.churchId || "";

  if (!isAdmin) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [pendingCount, encarregado] = await Promise.all([
      prisma.preEvaluation.count({
        where: {
          testEvaluatorId: session.id,
          evaluatorConfirmed: true,
          finalTestStatus: "PENDENTE",
          testSchedule: {
            testDate: { gte: today },
            isClosed: false,
          },
        },
      }),
      prisma.personInCharge.findUnique({
        where: { id: session.id },
        include: {
          church: { include: { sector: true } },
          managedChurches: { include: { sector: true } }
        }
      })
    ]);

    pendingTestsCount = pendingCount;

    if (encarregado) {
      const churchesMap = new Map();
      if (encarregado.church) {
        churchesMap.set(encarregado.church.id, {
          id: encarregado.church.id,
          name: encarregado.church.name,
          isPrimary: true,
          sector: encarregado.church.sector
        });
      }
      encarregado.managedChurches.forEach((c) => {
        churchesMap.set(c.id, {
          id: c.id,
          name: c.name,
          isPrimary: false,
          sector: c.sector
        });
      });
      userChurches = Array.from(churchesMap.values());

      if (!activeChurchId && encarregado.churchId) {
        activeChurchId = encarregado.churchId;
      }
    }
  }

  const logoConfig = await prisma.systemConfig.findUnique({
    where: { key: "logo" }
  });
  const logoUrl = logoConfig?.value || "/logo.png";

  return (
    <>
      <InactivityTimer />
      {isAdmin ? (
        <Sidebar role={adminRole} logoUrl={logoUrl} />
      ) : (
        <PortalSidebar 
          isRegional={!!isRegional} 
          isExaminadora={!!isExaminadora} 
          pendingTestsCount={pendingTestsCount} 
          userChurches={userChurches}
          activeChurchId={activeChurchId}
          logoUrl={logoUrl}
        />
      )}
      <div className="flex-1 ml-0 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 min-h-screen">
        {!isAdmin && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-sm p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                A Paz de Deus, {session.name}!
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Hoje é {new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(new Date()).charAt(0).toUpperCase() + new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(new Date()).slice(1)}, {new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {userChurches.length > 0 && (
                <ChurchSwitcher 
                  churches={userChurches} 
                  activeChurchId={activeChurchId} 
                />
              )}
              {session.roleName && (
                <span className="bg-orange-500/10 text-orange-600 px-3 py-1.5 rounded-xl text-xs font-semibold border border-orange-500/20 shadow-xs">
                  {session.roleName}
                </span>
              )}
            </div>
          </div>
        )}
        {children}
      </div>
    </>
  );
}
