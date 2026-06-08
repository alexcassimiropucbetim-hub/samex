import { prisma } from "@/lib/prisma";
import { Activity, ShieldCheck, User } from "lucide-react";

export const dynamic = "force-dynamic";

export default function LogsPage() {
  return (
    <div className="p-6 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-500" />
            Logs de Acesso
          </h1>
          <p className="text-slate-500 mt-1">Histórico de acessos recentes ao sistema.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Data e Hora</th>
                <th className="px-6 py-4">Usuário</th>
                <th className="px-6 py-4">Ação</th>
                <th className="px-6 py-4">Endereço IP</th>
                <th className="px-6 py-4">Navegador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <LogTableRows />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Separate component for data fetching
async function LogTableRows() {
  const logs = await prisma.accessLog.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
    include: {
      personInCharge: {
        include: { church: true, roleType: true }
      }
    }
  });

  if (logs.length === 0) {
    return (
      <tr>
        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
          Nenhum log de acesso encontrado.
        </td>
      </tr>
    );
  }

  return (
    <>
      {logs.map((log) => (
        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
          <td className="px-6 py-4 whitespace-nowrap text-slate-600">
            {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'medium' }).format(new Date(log.createdAt))}
          </td>
          <td className="px-6 py-4">
            <div className="flex items-center gap-3">
              {log.adminUsername ? (
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
              )}
              
              <div>
                <p className="font-medium text-slate-900">
                  {log.adminUsername || log.personInCharge?.fullName || "Usuário Removido"}
                </p>
                {log.personInCharge && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {log.personInCharge.roleType?.name || "Sem cargo"} • {log.personInCharge.church?.name}
                  </p>
                )}
                {log.adminUsername && (
                  <p className="text-xs text-purple-500 mt-0.5 font-medium">Administrador</p>
                )}
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
              {log.action}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-mono text-xs">
            {log.ipAddress}
          </td>
          <td className="px-6 py-4 text-slate-500 text-xs max-w-xs truncate" title={log.userAgent || ""}>
            {log.userAgent}
          </td>
        </tr>
      ))}
    </>
  );
}
