import { prisma } from "@/lib/prisma";
import { Activity, ShieldCheck, User } from "lucide-react";
import Link from "next/link";
import SearchInput from "@/components/SearchInput";

export const dynamic = "force-dynamic";

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams?.page) || 1;
  const q = resolvedParams?.q || "";
  const pageSize = 50;

  const where = q
    ? {
        OR: [
          { action: { contains: q, mode: "insensitive" as const } },
          { ipAddress: { contains: q, mode: "insensitive" as const } },
          { adminUsername: { contains: q, mode: "insensitive" as const } },
          { personInCharge: { fullName: { contains: q, mode: "insensitive" as const } } },
          { personInCharge: { login: { contains: q, mode: "insensitive" as const } } },
        ],
      }
    : {};

  const [total, logs] = await Promise.all([
    prisma.accessLog.count({ where }),
    prisma.accessLog.findMany({
      where,
      take: pageSize,
      skip: (page - 1) * pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        personInCharge: {
          include: { church: true, roleType: true },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

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
        
        <div className="w-full md:w-auto min-w-[300px]">
          <SearchInput defaultValue={q} placeholder="Buscar usuário, IP, ação..." />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="hidden lg:block overflow-x-auto">
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
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Nenhum log de acesso encontrado.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                      {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'medium', timeZone: 'America/Sao_Paulo' }).format(new Date(log.createdAt))}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {log.adminUsername ? (
                          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
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
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        {logs.length > 0 && (
          <div className="lg:hidden flex flex-col gap-4 p-4 bg-slate-50/50">
            {logs.map(log => (
              <div key={log.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs text-slate-500 font-medium">
                    {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' }).format(new Date(log.createdAt))}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700 border border-green-200">
                    {log.action}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  {log.adminUsername ? (
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                  
                  <div>
                    <p className="font-bold text-slate-900 text-sm">
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

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-1">
                  <div>
                    <p className="text-slate-400 font-medium mb-0.5">Endereço IP</p>
                    <p className="font-mono text-slate-600">{log.ipAddress}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium mb-0.5">Navegador</p>
                    <p className="text-slate-600 truncate" title={log.userAgent || ""}>
                      {log.userAgent ? log.userAgent.split(' ')[0] : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50/50">
            <span className="text-sm text-slate-500">
              Página {page} de {totalPages} ({total} registros)
            </span>
            <div className="flex items-center gap-2">
              {page > 1 ? (
                <Link href={`/logs?page=${page - 1}&q=${q}`} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors bg-white">
                  Anterior
                </Link>
              ) : (
                <span className="px-3 py-1.5 text-sm border border-slate-100 rounded-lg text-slate-300 cursor-not-allowed bg-slate-50">
                  Anterior
                </span>
              )}
              
              {page < totalPages ? (
                <Link href={`/logs?page=${page + 1}&q=${q}`} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors bg-white">
                  Próxima
                </Link>
              ) : (
                <span className="px-3 py-1.5 text-sm border border-slate-100 rounded-lg text-slate-300 cursor-not-allowed bg-slate-50">
                  Próxima
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
