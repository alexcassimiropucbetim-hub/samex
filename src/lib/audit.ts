import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { headers } from "next/headers";

export async function logActivity(
  action: string,
  entityType: string,
  entityId?: string,
  details?: Record<string, any>
) {
  try {
    const session = await getSession();
    if (!session) return; // Silent return se não houver sessão

    const headersList = await headers();
    const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "Desconhecido";
    const userAgent = headersList.get("user-agent") || "Desconhecido";

    const personInChargeId = session.type === "encarregado" ? session.id : null;
    const adminUsername = session.type === "admin" ? session.name : null;

    await prisma.activityLog.create({
      data: {
        action,
        entityType,
        entityId,
        details: details ? JSON.stringify(details) : null,
        ipAddress,
        userAgent,
        personInChargeId,
        adminUsername,
      }
    });
  } catch (error) {
    console.error("Erro ao registrar log de atividade:", error);
    // Não lançamos o erro para não quebrar o fluxo principal se o log falhar
  }
}
