import { getInstrumentsPaginated, createInstrument, deleteInstrument, updateInstrument } from "@/actions/instrument";
import { getCategories } from "@/actions/category";
import { Music, Plus, Trash2, ListMusic, Edit2, Save, X } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import SearchInput from "@/components/SearchInput";

export default async function InstrumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string, page?: string, q?: string }>;
}) {
  const categories = await getCategories();
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams?.page) || 1;
  const q = resolvedSearchParams?.q || "";
  const editId = resolvedSearchParams?.edit;

  const { data: instruments, total, totalPages } = await getInstrumentsPaginated(page, 10, q);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Music className="text-pink-500" /> Instrumentos
        </h1>
        <p className="text-slate-500 mt-2">Gerenciamento de instrumentos e suas categorias.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="glass-card h-fit">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Novo Instrumento</h2>
          <form action={createInstrument} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-600 mb-1">
                Nome do Instrumento
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder="Ex: Violino..."
                className="input-glass focus:ring-pink-500"
              />
            </div>
            
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-slate-600 mb-1">
                Categoria
              </label>
              <select defaultValue=""
                id="categoryId"
                name="categoryId"
                required
                className="input-glass focus:ring-pink-500"
              >
                <option value="" disabled >Selecione uma categoria...</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn-primary w-full flex justify-center items-center gap-2">
              <Plus className="w-5 h-5" /> Cadastrar Instrumento
            </button>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              Cadastrados 
              <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-1 rounded-full">{total} registros</span>
            </h2>
            
            <SearchInput defaultValue={q} placeholder="Buscar instrumento ou categoria..." />
          </div>
          
          {instruments.length === 0 ? (
            <div className="glass-card text-center text-slate-500 py-10">
              {q ? "Nenhum instrumento encontrado para a busca." : "Nenhum instrumento cadastrado ainda."}
            </div>
          ) : (
            <div className="glass-card overflow-hidden !p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-medium">Nome do Instrumento</th>
                      <th className="px-4 py-3 font-medium">Categoria</th>
                      <th className="px-4 py-3 font-medium text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {instruments.map((instrument) => {
                      const isEditing = editId === instrument.id;

                      return isEditing ? (
                        <tr key={instrument.id} className="bg-blue-50/50">
                          <td colSpan={3} className="p-0">
                            <form action={async (formData: FormData) => {
                              "use server";
                              await updateInstrument(instrument.id, formData);
                              redirect(`/instrumentos?page=${page}&q=${q}`);
                            }} className="flex flex-col md:flex-row items-center gap-4 p-3 w-full">
                              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                <input 
                                  type="text" 
                                  name="name" 
                                  defaultValue={instrument.name} 
                                  className="input-glass py-1.5 px-3 uppercase text-sm focus:ring-pink-500" 
                                  required 
                                  autoFocus
                                  placeholder="Nome do Instrumento"
                                />
                                <select
                                  name="categoryId"
                                  defaultValue={instrument.categoryId}
                                  required
                                  className="input-glass py-1.5 px-3 uppercase text-sm focus:ring-pink-500"
                                >
                                  {categories.map(category => (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 md:justify-end">
                                <button type="submit" className="text-green-600 hover:bg-green-100 p-2 rounded-lg transition-colors" title="Salvar">
                                  <Save className="w-5 h-5" />
                                </button>
                                <Link href={`/instrumentos?page=${page}&q=${q}`} className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-200 transition-colors" title="Cancelar">
                                  <X className="w-5 h-5" />
                                </Link>
                              </div>
                            </form>
                          </td>
                        </tr>
                      ) : (
                        <tr key={instrument.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-4 py-3 font-medium text-slate-900 uppercase">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500 shrink-0">
                                <Music className="w-4 h-4" />
                              </div>
                              {instrument.name}
                            </div>
                          </td>
                          <td className="px-4 py-3 uppercase">
                            <span className="inline-flex items-center gap-1">
                              <ListMusic className="w-3 h-3 text-slate-400" /> {instrument.category.name}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                              <Link href={`/instrumentos?page=${page}&q=${q}&edit=${instrument.id}`} className="text-slate-400 hover:text-blue-500 p-2 rounded-lg hover:bg-blue-50 transition-colors" title="Editar Instrumento">
                                <Edit2 className="w-4 h-4" />
                              </Link>
                              <form action={async () => {
                                "use server";
                                await deleteInstrument(instrument.id);
                              }}>
                                <button 
                                  type="submit" 
                                  className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                  title="Excluir Instrumento"
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
                      <Link href={`/instrumentos?page=${page - 1}&q=${q}`} className="px-3 py-1 text-sm border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
                        Anterior
                      </Link>
                    ) : (
                      <span className="px-3 py-1 text-sm border border-slate-100 rounded-lg text-slate-300 cursor-not-allowed">
                        Anterior
                      </span>
                    )}
                    
                    {page < totalPages ? (
                      <Link href={`/instrumentos?page=${page + 1}&q=${q}`} className="px-3 py-1 text-sm border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
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
        </div>
      </div>
    </div>
  );
}
