import { getPracticalMethods, createPracticalMethod, updatePracticalMethod, deletePracticalMethod } from "@/actions/practicalMethod";
import { Music, Plus, Trash2, Pencil, X } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function MetodosPraticaPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const resolvedParams = await searchParams;
  const methods = await getPracticalMethods();
  const instruments = await prisma.instrument.findMany({ orderBy: { name: "asc" } });
  
  const editingId = resolvedParams?.edit;
  const editingMethod = editingId ? methods.find(m => m.id === editingId) : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Music className="text-blue-500" /> Métodos de Prática
        </h1>
        <p className="text-slate-500 mt-2">Gerenciamento dos métodos práticos para o estudo dirigido.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Form */}
        <div className="glass-card h-fit lg:col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-slate-900">
              {editingMethod ? "Editar Método" : "Novo Método"}
            </h2>
            {editingMethod && (
              <Link href="/metodos-pratica" className="text-slate-500 hover:text-slate-900 transition-colors">
                <X className="w-5 h-5" />
              </Link>
            )}
          </div>
          
          <form action={async (formData) => {
            "use server";
            if (editingMethod) {
              await updatePracticalMethod(editingMethod.id, formData);
              redirect("/metodos-pratica");
            } else {
              await createPracticalMethod(formData);
            }
          }} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-600 mb-1">
                Nome do Método
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                defaultValue={editingMethod?.name || ""}
                placeholder="Ex: Schmoll, Burgmuller..."
                className="input-glass focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Instrumentos Vinculados
              </label>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                {instruments.map(inst => {
                  const isChecked = editingMethod?.instruments?.some(i => i.id === inst.id) || false;
                  return (
                    <label key={inst.id} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-slate-100 rounded">
                      <input 
                        type="checkbox" 
                        name="instrumentIds" 
                        value={inst.id}
                        defaultChecked={isChecked}
                        className="rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">{inst.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <button type="submit" className="btn-primary w-full flex justify-center items-center gap-2">
              {editingMethod ? (
                <>
                  <Pencil className="w-5 h-5" /> Salvar Alterações
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" /> Cadastrar Método
                </>
              )}
            </button>
          </form>
        </div>

        {/* Table List */}
        <div className="lg:col-span-3 space-y-4 overflow-hidden">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Métodos Cadastrados ({methods.length})</h2>
          
          {methods.length === 0 ? (
            <div className="glass-card text-center text-slate-500 py-10">
              Nenhum método cadastrado ainda.
            </div>
          ) : (
            <div className="hidden lg:block glass-card overflow-x-auto p-0">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100">
                    <th className="p-4 text-sm font-semibold text-slate-600">Método de Prática</th>
                    <th className="p-4 text-sm font-semibold text-slate-600">Instrumento</th>
                    <th className="p-4 text-sm font-semibold text-slate-600 text-center w-32">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {methods.map((method) => (
                    <tr key={method.id} className="hover:bg-slate-100 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                            <Music className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-slate-900">{method.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {method.instruments?.length > 0 ? (
                            method.instruments.map(inst => (
                              <span key={inst.id} className="text-xs font-medium text-slate-600 bg-slate-200 px-2 py-1 rounded-md whitespace-nowrap">
                                {inst.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400">Nenhum</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <Link 
                            href={`/metodos-pratica?edit=${method.id}`}
                            className="text-slate-500 hover:text-blue-400 p-2 rounded-lg hover:bg-blue-400/10 transition-colors"
                            title="Editar Método"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <form action={async () => {
                            "use server";
                            await deletePracticalMethod(method.id);
                          }}>
                            <button 
                              type="submit" 
                              className="text-slate-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-400/10 transition-colors"
                              title="Excluir Método"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Mobile Cards */}
          {methods.length > 0 && (
            <div className="lg:hidden flex flex-col gap-4 mt-4">
              {methods.map((method) => (
                <div key={method.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                        <Music className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{method.name}</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {method.instruments?.length > 0 ? (
                            method.instruments.map(inst => (
                              <span key={inst.id} className="text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                {inst.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400">Nenhum</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link 
                        href={`/metodos-pratica?edit=${method.id}`}
                        className="text-slate-500 hover:text-blue-400 p-2.5 rounded-xl hover:bg-blue-400/10 transition-colors"
                        title="Editar Método"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <form action={async () => {
                        "use server";
                        await deletePracticalMethod(method.id);
                      }}>
                        <button 
                          type="submit" 
                          className="text-slate-500 hover:text-red-400 p-2.5 rounded-xl hover:bg-red-400/10 transition-colors"
                          title="Excluir Método"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
