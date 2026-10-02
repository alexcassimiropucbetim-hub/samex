import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Database, Download, AlertTriangle, RefreshCw, ArchiveRestore, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BackupRestauracaoPage() {
  const session = await getSession();
  
  if (!session || session.type !== "admin" || session.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  return (
    <div className="p-6 max-w-6xl mx-auto animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Backup e Restauração</h1>
          <p className="text-slate-500 mt-2">
            Gerencie cópias de segurança do banco de dados do sistema SAMEX.
          </p>
        </div>
      </div>

      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 mt-0.5 shrink-0 text-amber-600" />
        <div>
          <h3 className="font-bold">Serviço de backup ainda não configurado</h3>
          <p className="text-sm mt-1">
            Esta interface foi preparada estruturalmente para a rotina de backup, porém a geração real de 
            arquivos (dumps) requer configuração adicional de ambiente para ser executada com segurança. 
            Nenhuma operação destrutiva está ativada neste momento.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-500" />
          Ações Manuais
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-slate-200 rounded-xl p-5 bg-slate-50 flex flex-col items-start">
            <h3 className="font-bold text-slate-800 mb-2">Gerar Backup do Banco de Dados</h3>
            <p className="text-sm text-slate-500 mb-4 flex-1">
              Cria uma cópia de segurança completa contendo estrutura e dados. O processo pode levar alguns minutos.
            </p>
            <button
              disabled
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600/50 cursor-not-allowed text-white rounded-xl font-medium"
            >
              <RefreshCw className="w-5 h-5" />
              Gerar Backup Agora
            </button>
          </div>

          <div className="border border-slate-200 rounded-xl p-5 bg-slate-50 flex flex-col items-start">
            <h3 className="font-bold text-slate-800 mb-2">Restaurar Backup</h3>
            <p className="text-sm text-slate-500 mb-4 flex-1">
              Restaura o sistema a partir de um arquivo de backup previamente gerado. Os dados atuais serão substituídos.
            </p>
            <button
              disabled
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600/50 cursor-not-allowed text-white rounded-xl font-medium"
            >
              <ArchiveRestore className="w-5 h-5" />
              Restaurar Backup
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" />
          Histórico de Backups
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-sm text-slate-500">
                <th className="pb-3 font-medium">Data / Hora</th>
                <th className="pb-3 font-medium">Arquivo</th>
                <th className="pb-3 font-medium">Tamanho</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {/* Espaço para listar backups reais futuramente */}
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500 text-sm">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Database className="w-8 h-8 text-slate-300" />
                    <span>Nenhum backup encontrado no momento.</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
