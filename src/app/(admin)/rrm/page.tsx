import { getRRMs, createRRM, deleteRRM, updateRRM } from "@/actions/rrm";
import { Network, Plus, Trash2, Edit2, Save, X, ToggleLeft, ToggleRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function RRMPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  const rrms = await getRRMs();
  const resolvedSearchParams = await searchParams;
  const editId = resolvedSearchParams?.edit;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Network className="text-blue-500" /> RRM (Região Reunião Ministerial)
        </h1>
        <p className="text-slate-500 mt-2">Gerenciamento da estrutura raiz do sistema.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="glass-card h-fit">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Nova RRM</h2>
          <form action={createRRM} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-600 mb-1">
                Nome da RRM
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder="Ex: RRM São Paulo"
                className="input-glass"
              />
            </div>
            <button type="submit" className="btn-primary w-full flex justify-center items-center gap-2">
              <Plus className="w-5 h-5" /> Cadastrar RRM
            </button>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">RRMs Cadastradas ({rrms.length})</h2>
          
          {rrms.length === 0 ? (
            <div className="glass-card text-center text-slate-500 py-10">
              Nenhuma RRM cadastrada ainda.
            </div>
          ) : (
            <div className="grid gap-4">
              {rrms.map((rrm) => {
                const isEditing = editId === rrm.id;

                return (
                <div key={rrm.id} className="glass-card !p-4 flex items-center justify-between group">
                  {isEditing ? (
                    <form action={async (formData: FormData) => {
                      "use server";
                      await updateRRM(rrm.id, formData);
                      redirect("/rrm");
                    }} className="flex-1 flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                          <Network className="w-5 h-5" />
                        </div>
                        <input 
                          type="text" 
                          name="name" 
                          defaultValue={rrm.name} 
                          className="input-glass flex-1 py-1 px-3" 
                          required 
                          autoFocus
                        />
                        <div className="flex items-center gap-2 shrink-0">
                          <label className="flex items-center gap-2 text-sm text-slate-600 mr-2 cursor-pointer">
                            <input type="checkbox" name="active" value="true" defaultChecked={rrm.active} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                            Ativo
                          </label>
                          <button type="submit" className="text-green-600 hover:bg-green-50 p-2 rounded-lg transition-colors" title="Salvar">
                            <Save className="w-5 h-5" />
                          </button>
                          <Link href="/rrm" className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors" title="Cancelar">
                            <X className="w-5 h-5" />
                          </Link>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full ${rrm.active ? 'bg-blue-500/20 text-blue-500' : 'bg-slate-200 text-slate-400'} flex items-center justify-center shrink-0`}>
                          <Network className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-lg font-medium ${rrm.active ? 'text-slate-900' : 'text-slate-400 line-through'}`}>{rrm.name}</span>
                          <span className="text-xs text-slate-500">{rrm._count.administrations} Administrações vinculadas</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Toggle Active/Inactive without full edit */}
                        <form action={async () => {
                          "use server";
                          const fd = new FormData();
                          fd.append("name", rrm.name);
                          if (!rrm.active) fd.append("active", "true"); // Toggle
                          await updateRRM(rrm.id, fd);
                        }}>
                          <button type="submit" className={`p-2 rounded-lg transition-colors ${rrm.active ? 'text-green-500 hover:bg-green-50' : 'text-slate-400 hover:bg-slate-100'}`} title={rrm.active ? "Desativar" : "Ativar"}>
                            {rrm.active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                          </button>
                        </form>

                        <Link href={`/rrm?edit=${rrm.id}`} className="text-slate-400 hover:text-blue-500 p-2 rounded-lg hover:bg-blue-50 transition-colors" title="Editar RRM">
                          <Edit2 className="w-5 h-5" />
                        </Link>
                        <form action={async () => {
                          "use server";
                          await deleteRRM(rrm.id);
                        }}>
                          <button 
                            type="submit" 
                            className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            title="Excluir RRM"
                            disabled={rrm._count.administrations > 0}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </form>
                      </div>
                    </>
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
