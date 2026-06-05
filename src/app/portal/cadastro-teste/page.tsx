import { getSectors } from "@/actions/sector";
import { getChurches } from "@/actions/church";
import { getTestSchedules, createTestSchedule, updateTestSchedule, deleteTestSchedule } from "@/actions/testSchedule";
import { CalendarClock, MapPin, Church, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { getSession } from "@/lib/auth";

export default async function CadastroTestePage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const session = await getSession();
  
  const [sectors, churches, allTestSchedules] = await Promise.all([
    getSectors(),
    getChurches(),
    getTestSchedules(),
  ]);

  const isRegional = session?.roleName?.toLowerCase().includes("regional") || session?.roleName?.toLowerCase().includes("examinadora");
  const isAdmin = session?.type === "admin";
  
  const testSchedules = (isRegional || isAdmin) 
    ? allTestSchedules 
    : allTestSchedules.filter(t => t.churchId === session?.churchId);

  const resolvedParams = await searchParams;
  const editingId = resolvedParams.edit;
  const editingSchedule = editingId ? testSchedules.find(t => t.id === editingId) : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <CalendarClock className="text-orange-500" /> Cadastro de Teste
        </h1>
        <p className="text-slate-500 mt-2">Agende as datas e locais onde os testes serão realizados.</p>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">
          {editingSchedule ? "Editar Agendamento" : "Agendar Data de Teste"}
        </h2>
        
        <form action={async (formData) => {
          "use server";
          if (editingSchedule) {
            await updateTestSchedule(editingSchedule.id, formData);
          } else {
            await createTestSchedule(formData);
          }
        }} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Data e Hora do Teste</label>
              <input 
                type="datetime-local" 
                name="testDate"
                defaultValue={editingSchedule ? new Date(new Date(editingSchedule.testDate).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                required 
                className="w-full bg-slate-100 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Igreja que será realizada o teste</label>
              <select
                name="churchId"
                defaultValue={editingSchedule?.churchId || ""}
                required
                className="w-full bg-slate-100 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="" className="bg-white">Selecione uma congregação...</option>
                {churches.map((church) => (
                  <option key={church.id} value={church.id} className="bg-white">
                    {church.name} - {church.sector?.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-slate-600 font-medium mb-2">Chave do Teste (Opcional)</label>
              <input
                type="text"
                name="masterKey"
                defaultValue={editingSchedule?.masterKey || ""}
                placeholder="Ex: TESTE123"
                className="w-full bg-slate-100 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <p className="text-xs text-slate-500 mt-1">Usada para permitir alocação manual de candidatos em cima da hora.</p>
            </div>
            
            <div>
              <label className="block text-slate-600 font-medium mb-2">Ancião do Teste</label>
              <input
                type="text"
                name="elderName"
                defaultValue={editingSchedule?.elderName || ""}
                placeholder="Ex: João da Silva"
                className="w-full bg-slate-100 border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <p className="text-xs text-slate-500 mt-1">Nome do Ancião que será impresso nas cartas posteriormente.</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            {editingSchedule && (
              <Link href="/portal/cadastro-teste" className="px-6 py-2 rounded-lg text-slate-600 font-medium hover:bg-slate-100 transition-colors">
                Cancelar
              </Link>
            )}
            <button type="submit" className="btn-primary">
              {editingSchedule ? "Atualizar Agendamento" : "Salvar Agendamento"}
            </button>
          </div>
        </form>
      </div>

      <div className="pt-4 border-t border-slate-200">
        <h2 className="text-2xl font-semibold text-slate-900 mb-6">Testes Agendados ({testSchedules.length})</h2>
        
        {testSchedules.length === 0 ? (
          <div className="glass-card text-center text-slate-500 py-10">
            Nenhuma data de teste agendada ainda.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testSchedules.map((schedule) => (
              <div key={schedule.id} className="glass-card flex flex-col gap-4 relative group hover:border-blue-500/50 hover:bg-blue-500/5 transition-all">
                <Link href={`/portal/cadastro-teste/${schedule.id}`} className="absolute inset-0 z-0"></Link>
                
                <div className="p-5 flex justify-between items-start relative z-10 pointer-events-none">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-500/20 text-orange-400 rounded-xl flex items-center justify-center shrink-0 border border-orange-500/30">
                      <div className="text-center leading-none">
                        <span className="block text-lg font-bold">{new Date(schedule.testDate).getDate().toString().padStart(2, '0')}</span>
                        <span className="block text-[10px] uppercase">{new Date(schedule.testDate).toLocaleString('pt-BR', { month: 'short' })}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Data Agendada</p>
                      <p className="text-slate-900 font-medium">{new Date(schedule.testDate).toLocaleDateString('pt-BR')} às {new Date(schedule.testDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto">
                    <Link 
                      href={`/portal/cadastro-teste?edit=${schedule.id}`}
                      className="text-slate-500 hover:text-orange-400 p-1.5 rounded-lg hover:bg-orange-400/10 transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <form action={async () => {
                      "use server";
                      await deleteTestSchedule(schedule.id);
                    }}>
                      <button 
                        type="submit" 
                        className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-400/10 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>

                <div className="bg-slate-100 rounded-lg p-3 border border-slate-200 mt-2 mx-5 mb-5 relative z-10 pointer-events-none">
                  <p className="text-sm font-medium text-slate-600 flex items-center gap-2">
                    <Church className="w-4 h-4 text-orange-400" />
                    {schedule.church.name}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-2 mt-1 ml-6">
                    <MapPin className="w-3.5 h-3.5" />
                    Setor: {schedule.church.sector.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
