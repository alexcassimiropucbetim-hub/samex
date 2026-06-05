import { getCategories, createCategory, deleteCategory, updateCategory } from "@/actions/category";
import { ListMusic, Plus, Trash2, Edit2, Save, X } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const categories = await getCategories();
  const resolvedSearchParams = await searchParams;
  const editId = resolvedSearchParams?.edit;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <ListMusic className="text-purple-500" /> Categorias
        </h1>
        <p className="text-slate-500 mt-2">Gerenciamento de categorias de instrumentos (ex: Cordas, Sopros, etc).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="glass-card h-fit">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Nova Categoria</h2>
          <form action={createCategory} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-600 mb-1">
                Nome da Categoria
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder="Ex: Cordas Friccionadas..."
                className="input-glass focus:ring-purple-500"
              />
            </div>
            <button type="submit" className="btn-primary w-full flex justify-center items-center gap-2">
              <Plus className="w-5 h-5" /> Cadastrar Categoria
            </button>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Categorias Cadastradas ({categories.length})</h2>
          
          {categories.length === 0 ? (
            <div className="glass-card text-center text-slate-500 py-10">
              Nenhuma categoria cadastrada ainda.
            </div>
          ) : (
            <div className="grid gap-4">
              {categories.map((category) => {
                const isEditing = editId === category.id;

                return (
                <div key={category.id} className="glass-card !p-4 flex items-center justify-between group gap-4">
                  {isEditing ? (
                    <form action={async (formData: FormData) => {
                      "use server";
                      await updateCategory(category.id, formData);
                      redirect("/categorias");
                    }} className="flex-1 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                        <ListMusic className="w-5 h-5" />
                      </div>
                      <input 
                        type="text" 
                        name="name" 
                        defaultValue={category.name} 
                        className="input-glass flex-1 py-1 px-3 uppercase" 
                        required 
                        autoFocus
                      />
                      <div className="flex items-center gap-2 shrink-0">
                        <button type="submit" className="text-green-600 hover:bg-green-50 p-2 rounded-lg transition-colors" title="Salvar">
                          <Save className="w-5 h-5" />
                        </button>
                        <Link href="/categorias" className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors" title="Cancelar">
                          <X className="w-5 h-5" />
                        </Link>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                          <ListMusic className="w-5 h-5" />
                        </div>
                        <span className="text-lg font-medium text-slate-900 uppercase">{category.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        <Link href={`/categorias?edit=${category.id}`} className="text-slate-400 hover:text-blue-500 p-2 rounded-lg hover:bg-blue-50 transition-colors" title="Editar Categoria">
                          <Edit2 className="w-5 h-5" />
                        </Link>
                        <form action={async () => {
                          "use server";
                          await deleteCategory(category.id);
                        }}>
                          <button 
                            type="submit" 
                            className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            title="Excluir Categoria"
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
