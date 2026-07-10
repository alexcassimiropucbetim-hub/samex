import { SettingsClient } from "./SettingsClient";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const authPayload = await getSession();
  if (!authPayload) {
    redirect("/portal/login");
  }

  const isRegional = authPayload.roleName?.toLowerCase().includes("regional") || authPayload.roleName?.toLowerCase().includes("examinadora");
  const isAdmin = authPayload.type === 'admin';
  
  if (!isRegional && !isAdmin) {
    redirect("/portal");
  }

  // Fetch initial preferences if needed
  let userSettings = null;
  if (authPayload.type !== 'admin') {
    userSettings = await prisma.personInCharge.findUnique({
      where: { id: authPayload.id },
      select: {
        notifyOnNewRegistration: true,
        notifyOnSchedule: true,
        notifyOnResult: true,
      }
    });
  }

  return (
    <div className="p-8 pb-32 md:pb-8 min-h-screen">
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Configurações</h1>
        <p className="text-slate-500 mt-2 font-medium">
          Ajuste as preferências do seu perfil e notificações.
        </p>
      </div>
      
      <SettingsClient initialSettings={userSettings} />
    </div>
  );
}
