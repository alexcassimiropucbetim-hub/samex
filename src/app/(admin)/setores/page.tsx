import { getSectors, createSector, deleteSector, updateSector } from "@/actions/sector";
import { MapPin, Plus, Trash2, Edit2, Save, X } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function SectorsPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const sectors = await getSectors();
  const resolvedSearchParams = await searchParams;
  const editId = resolvedSearchParams?.edit;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <MapPin className="text-blue-500" /> Setores
        </h1>
        <p className="text-slate-500 mt-2">Gerenciamento de setores regionais.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="glass-card h-fit">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Novo Setor</h2>
          <form action={createSector} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-600 mb-1">
                Nome do Setor
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder="Ex: Brás, Vila Maria..."
                className="input-glass"
              />
            </div>
            <button type="submit" className="btn-primary w-full flex justify-center items-center gap-2">
              <Plus className="w-5 h-5" /> Cadastrar Setor
            </button>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Setores Cadastrados ({sectors.length})</h2>
          
          {sectors.length === 0 ? (
            <div className="glass-card text-center text-slate-500 py-10">
              Nenhum setor cadastrado ainda.
            </div>
          ) : (
            <div className="grid gap-4">
              {sectors.map((sector) => {
                const isEditing = editId === sector.id;

                return (
                <div key={sector.id} className="glass-card !p-4 flex items-center justify-between group">
                  {isEditing ? (
                    <form action={async (formData: FormData) => {
                      "use server";
                      await updateSector(sector.id, formData);
                      redirect("/setores");
                    }} className="flex-1 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <input 
                        type="text" 
                        name="name" 
                        defaultValue={sector.name} 
                        className="input-glass flex-1 py-1 px-3 uppercase" 
                        required 
                        autoFocus
                      />
                      <div className="flex items-center gap-2 shrink-0">
                        <button type="submit" className="text-green-600 hover:bg-green-50 p-2 rounded-lg transition-colors" title="Salvar">
                          <Save className="w-5 h-5" />
                        </button>
                        <Link href="/setores" className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors" title="Cancelar">
                          <X className="w-5 h-5" />
                        </Link>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <span className="text-lg font-medium text-slate-900 uppercase">{sector.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Link href={`/setores?edit=${sector.id}`} className="text-slate-400 hover:text-blue-500 p-2 rounded-lg hover:bg-blue-50 transition-colors" title="Editar Setor">
                          <Edit2 className="w-5 h-5" />
                        </Link>
                        <form action={async () => {
                          "use server";
                          await deleteSector(sector.id);
                        }}>
                          <button 
                            type="submit" 
                            className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            title="Excluir Setor"
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
