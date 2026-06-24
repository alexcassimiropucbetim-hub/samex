import { getChurchesPaginated, createChurch, deleteChurch, updateChurch } from "@/actions/church";
import { getSectors } from "@/actions/sector";
import { Church, Plus, Trash2, MapPin, Edit2, Save, X } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import SearchInput from "@/components/SearchInput";

export default async function ChurchesPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string, page?: string, q?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams?.page) || 1;
  const q = resolvedSearchParams?.q || "";
  const editId = resolvedSearchParams?.edit;

  const { data: churches, total, totalPages } = await getChurchesPaginated(page, 10, q);
  const sectors = await getSectors();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Church className="text-emerald-500" /> Igrejas
        </h1>
        <p className="text-slate-500 mt-2">Gerenciamento de igrejas e suas localizações.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="glass-card h-fit">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Nova Igreja</h2>
          <form action={createChurch} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-600 mb-1">
                Nome da Comum
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder="Ex: Central..."
                className="input-glass"
              />
            </div>
            
            <div>
              <label htmlFor="sectorId" className="block text-sm font-medium text-slate-600 mb-1">
                Setor
              </label>
              <select defaultValue=""
                id="sectorId"
                name="sectorId"
                required
                className="input-glass"
              >
                <option value="" disabled >Selecione um setor...</option>
                {sectors.map(sector => (
                  <option key={sector.id} value={sector.id}>{sector.name}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn-primary w-full flex justify-center items-center gap-2">
              <Plus className="w-5 h-5" /> Cadastrar Igreja
            </button>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              Cadastradas 
              <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-1 rounded-full">{total} registros</span>
            </h2>
            
            <SearchInput defaultValue={q} placeholder="Buscar igreja ou setor..." />
          </div>
          
          {churches.length === 0 ? (
            <div className="glass-card text-center text-slate-500 py-10">
              {q ? "Nenhuma igreja encontrada para a busca." : "Nenhuma igreja cadastrada ainda."}
            </div>
          ) : (
            <div className="hidden lg:block glass-card overflow-hidden !p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-medium">Nome da Igreja</th>
                      <th className="px-4 py-3 font-medium">Setor</th>
                      <th className="px-4 py-3 font-medium text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {churches.map((church) => {
                      const isEditing = editId === church.id;

                      return isEditing ? (
                        <tr key={church.id} className="bg-blue-50/50">
                          <td colSpan={3} className="p-0">
                            <form action={async (formData: FormData) => {
                              "use server";
                              await updateChurch(church.id, formData);
                              redirect(`/igrejas?page=${page}&q=${q}`);
                            }} className="flex flex-col md:flex-row items-center gap-4 p-3 w-full">
                              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                <input 
                                  type="text" 
                                  name="name" 
                                  defaultValue={church.name} 
                                  className="input-glass py-1.5 px-3 uppercase text-sm" 
                                  required 
                                  autoFocus
                                  placeholder="Nome da Igreja"
                                />
                                <select
                                  name="sectorId"
                                  defaultValue={church.sectorId}
                                  required
                                  className="input-glass py-1.5 px-3 uppercase text-sm"
                                >
                                  {sectors.map(sector => (
                                    <option key={sector.id} value={sector.id}>{sector.name}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 md:justify-end">
                                <button type="submit" className="text-green-600 hover:bg-green-100 p-2 rounded-lg transition-colors" title="Salvar">
                                  <Save className="w-5 h-5" />
                                </button>
                                <Link href={`/igrejas?page=${page}&q=${q}`} className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-200 transition-colors" title="Cancelar">
                                  <X className="w-5 h-5" />
                                </Link>
                              </div>
                            </form>
                          </td>
                        </tr>
                      ) : (
                        <tr key={church.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-4 py-3 font-medium text-slate-900 uppercase">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                                <Church className="w-4 h-4" />
                              </div>
                              {church.name}
                            </div>
                          </td>
                          <td className="px-4 py-3 uppercase">
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" /> {church.sector.name}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                              <Link href={`/igrejas?page=${page}&q=${q}&edit=${church.id}`} className="text-slate-400 hover:text-blue-500 p-2 rounded-lg hover:bg-blue-50 transition-colors" title="Editar Igreja">
                                <Edit2 className="w-4 h-4" />
                              </Link>
                              <form action={async () => {
                                "use server";
                                await deleteChurch(church.id);
                              }}>
                                <button 
                                  type="submit" 
                                  className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                  title="Excluir Igreja"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </form>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
                  <span className="text-sm text-slate-500">
                    Página {page} de {totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    {page > 1 ? (
                      <Link href={`/igrejas?page=${page - 1}&q=${q}`} className="px-3 py-1 text-sm border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
                        Anterior
                      </Link>
                    ) : (
                      <span className="px-3 py-1 text-sm border border-slate-100 rounded-lg text-slate-300 cursor-not-allowed">
                        Anterior
                      </span>
                    )}
                    
                    {page < totalPages ? (
                      <Link href={`/igrejas?page=${page + 1}&q=${q}`} className="px-3 py-1 text-sm border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
                        Próxima
                      </Link>
                    ) : (
                      <span className="px-3 py-1 text-sm border border-slate-100 rounded-lg text-slate-300 cursor-not-allowed">
                        Próxima
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile Cards */}
          {churches.length > 0 && (
            <div className="lg:hidden flex flex-col gap-4 mt-4">
              {churches.map((church) => {
                const isEditing = editId === church.id;
                return isEditing ? (
                  <div key={church.id} className="bg-blue-50 rounded-xl p-4 shadow-sm border border-blue-100 flex flex-col gap-3">
                    <form action={async (formData: FormData) => {
                      "use server";
                      await updateChurch(church.id, formData);
                      redirect(`/igrejas?page=${page}&q=${q}`);
                    }} className="flex flex-col gap-3 w-full">
                      <input 
                        type="text" 
                        name="name" 
                        defaultValue={church.name} 
                        className="input-glass py-1.5 px-3 uppercase text-sm" 
                        required 
                        autoFocus
                        placeholder="Nome da Igreja"
                      />
                      <select
                        name="sectorId"
                        defaultValue={church.sectorId}
                        required
                        className="input-glass py-1.5 px-3 uppercase text-sm"
                      >
                        {sectors.map(sector => (
                          <option key={sector.id} value={sector.id}>{sector.name}</option>
                        ))}
                      </select>
                      <div className="flex items-center gap-2 justify-end pt-2 border-t border-blue-200/50 mt-1">
                        <button type="submit" className="text-green-600 bg-green-100 hover:bg-green-200 p-2.5 rounded-xl transition-colors" title="Salvar">
                          <Save className="w-5 h-5" />
                        </button>
                        <Link href={`/igrejas?page=${page}&q=${q}`} className="text-slate-500 bg-slate-200 hover:bg-slate-300 p-2.5 rounded-xl transition-colors" title="Cancelar">
                          <X className="w-5 h-5" />
                        </Link>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div key={church.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                          <Church className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 uppercase text-sm">{church.name}</span>
                          <span className="text-xs text-slate-500 uppercase flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" /> {church.sector.name}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 justify-end pt-2 border-t border-slate-100">
                      <Link href={`/igrejas?page=${page}&q=${q}&edit=${church.id}`} className="text-slate-500 hover:text-blue-500 p-2.5 rounded-xl hover:bg-blue-50 transition-colors">
                        <Edit2 className="w-5 h-5" />
                      </Link>
                      <form action={async () => {
                        "use server";
                        await deleteChurch(church.id);
                      }}>
                        <button 
                          type="submit" 
                          className="text-slate-500 hover:text-red-500 p-2.5 rounded-xl hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </form>
                    </div>
                  </div>
                )
              })}
              
              {/* Pagination (Mobile) */}
              {totalPages > 1 && (
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex items-center justify-between">
                    {page > 1 ? (
                      <Link href={`/igrejas?page=${page - 1}&q=${q}`} className="px-4 py-2 text-sm border border-slate-200 bg-white rounded-xl shadow-sm text-slate-600 font-medium w-full text-center hover:bg-slate-50">
                        Anterior
                      </Link>
                    ) : (
                      <span className="px-4 py-2 text-sm border border-slate-100 bg-slate-50 rounded-xl text-slate-400 font-medium w-full text-center opacity-50 cursor-not-allowed">
                        Anterior
                      </span>
                    )}
                    <div className="w-4 shrink-0"></div>
                    {page < totalPages ? (
                      <Link href={`/igrejas?page=${page + 1}&q=${q}`} className="px-4 py-2 text-sm border border-slate-200 bg-white rounded-xl shadow-sm text-slate-600 font-medium w-full text-center hover:bg-slate-50">
                        Próxima
                      </Link>
                    ) : (
                      <span className="px-4 py-2 text-sm border border-slate-100 bg-slate-50 rounded-xl text-slate-400 font-medium w-full text-center opacity-50 cursor-not-allowed">
                        Próxima
                      </span>
                    )}
                  </div>
                  <div className="text-center text-xs text-slate-500 mt-1">Página {page} de {totalPages}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
