import { getAdministrations, createAdministration, deleteAdministration, updateAdministration } from "@/actions/administration";
import { getActiveRRMs } from "@/actions/rrm";
import { MapPin, Plus, Trash2, Edit2, Save, X, ToggleLeft, ToggleRight, Network, User } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function AdministrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  const adms = await getAdministrations();
  const rrms = await getActiveRRMs();
  const resolvedSearchParams = await searchParams;
  const editId = resolvedSearchParams?.edit;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <MapPin className="text-blue-500" /> Administrações
        </h1>
        <p className="text-slate-500 mt-2">Gerenciamento de Administrações (vinculadas a RRMs).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="glass-card h-fit">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Nova Administração</h2>
          
          {rrms.length === 0 ? (
            <div className="p-4 bg-amber-50 text-amber-600 rounded-lg text-sm border border-amber-200">
              É necessário cadastrar uma RRM primeiro.
            </div>
          ) : (
            <form action={createAdministration} className="space-y-4">
              <div>
                <label htmlFor="rrmId" className="block text-sm font-medium text-slate-600 mb-1">
                  RRM
                </label>
                <select id="rrmId" name="rrmId" required className="input-glass">
                  <option value="">Selecione uma RRM</option>
                  {rrms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-600 mb-1">
                  Nome da Administração
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder="Ex: Administração Betim"
                  className="input-glass"
                />
              </div>
              <button type="submit" className="btn-primary w-full flex justify-center items-center gap-2">
                <Plus className="w-5 h-5" /> Cadastrar
              </button>
            </form>
          )}
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Administrações Cadastradas ({adms.length})</h2>
          
          {adms.length === 0 ? (
            <div className="glass-card text-center text-slate-500 py-10">
              Nenhuma Administração cadastrada ainda.
            </div>
          ) : (
            <div className="grid gap-4">
              {adms.map((adm) => {
                const isEditing = editId === adm.id;

                return (
                <div key={adm.id} className="glass-card !p-4 flex flex-col gap-4 group">
                  {isEditing ? (
                    <form action={async (formData: FormData) => {
                      "use server";
                      await updateAdministration(adm.id, formData);
                      redirect("/administracoes");
                    }} className="flex-1 flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <input 
                            type="text" 
                            name="name" 
                            defaultValue={adm.name} 
                            className="input-glass w-full py-1 px-3" 
                            required 
                            autoFocus
                          />
                          <select name="rrmId" defaultValue={adm.rrmId} className="input-glass w-full py-1 px-3" required>
                            {rrms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                          </select>
                        </div>
                        <div className="flex flex-col items-center gap-2 shrink-0">
                          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                            <input type="checkbox" name="active" value="true" defaultChecked={adm.active} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                            Ativo
                          </label>
                          <div className="flex gap-2">
                            <button type="submit" className="text-green-600 hover:bg-green-50 p-2 rounded-lg transition-colors" title="Salvar">
                              <Save className="w-5 h-5" />
                            </button>
                            <Link href="/administracoes" className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors" title="Cancelar">
                              <X className="w-5 h-5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full ${adm.active ? 'bg-blue-500/20 text-blue-500' : 'bg-slate-200 text-slate-400'} flex items-center justify-center shrink-0`}>
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-lg font-medium ${adm.active ? 'text-slate-900' : 'text-slate-400 line-through'}`}>{adm.name}</span>
                          <span className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                            <Network className="w-3 h-3" /> {adm.rrm.name} &bull; {adm._count.sectors} Setores
                          </span>
                          {adm.admin ? (
                            <span className="text-xs text-emerald-600 flex items-center gap-1 mt-1 bg-emerald-50 w-fit px-2 py-0.5 rounded-full border border-emerald-100">
                              <User className="w-3 h-3" /> Admin: {adm.admin.name} ({adm.admin.username})
                            </span>
                          ) : (
                            <span className="text-xs text-amber-600 flex items-center gap-1 mt-1 bg-amber-50 w-fit px-2 py-0.5 rounded-full border border-amber-100">
                              <User className="w-3 h-3" /> Sem Administrador Local
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Link href={`/usuarios?adm=${adm.id}`} className="text-slate-400 hover:text-emerald-500 p-2 rounded-lg hover:bg-emerald-50 transition-colors" title="Gerenciar Admin">
                          <User className="w-5 h-5" />
                        </Link>
                        
                        <form action={async () => {
                          "use server";
                          const fd = new FormData();
                          fd.append("name", adm.name);
                          fd.append("rrmId", adm.rrmId);
                          if (!adm.active) fd.append("active", "true");
                          await updateAdministration(adm.id, fd);
                        }}>
                          <button type="submit" className={`p-2 rounded-lg transition-colors ${adm.active ? 'text-green-500 hover:bg-green-50' : 'text-slate-400 hover:bg-slate-100'}`} title={adm.active ? "Desativar" : "Ativar"}>
                            {adm.active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                          </button>
                        </form>

                        <Link href={`/administracoes?edit=${adm.id}`} className="text-slate-400 hover:text-blue-500 p-2 rounded-lg hover:bg-blue-50 transition-colors" title="Editar">
                          <Edit2 className="w-5 h-5" />
                        </Link>
                        <form action={async () => {
                          "use server";
                          await deleteAdministration(adm.id);
                        }}>
                          <button 
                            type="submit" 
                            className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                            title="Excluir"
                            disabled={adm._count.sectors > 0 || !!adm.admin}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )})}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
