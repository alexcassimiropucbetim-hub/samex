import { getPeopleInChargePaginated, getPersonInChargeById, createPersonInCharge, updatePersonInCharge, deletePersonInCharge } from "@/actions/personInCharge";
import { getChurches } from "@/actions/church";
import { getRoleTypes } from "@/actions/roleType";
import { getTestTypes } from "@/actions/testType";
import { UserCheck, Plus, Trash2, Church, BadgeCheck, Pencil, X, Briefcase, FileSignature } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import SearchInput from "@/components/SearchInput";

export default async function EncarregadosPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string, page?: string, q?: string, error?: string }>;
}) {
  const churches = await getChurches();
  const cargos = await getRoleTypes();
  const tiposTeste = await getTestTypes();
  
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams?.page) || 1;
  const q = resolvedParams?.q || "";
  const editingId = resolvedParams?.edit;

  const { data: encarregados, total, totalPages } = await getPeopleInChargePaginated(page, 10, q);
  const editingPerson = editingId ? await getPersonInChargeById(editingId) : null;

  // Extrair IDs dos tipos de teste permitidos para preencher os checkboxes no modo de edição
  const allowedTestTypeIds = editingPerson ? editingPerson.allowedTestTypes.map(t => t.id) : [];
  
  const editParam = editingId ? `&edit=${editingId}` : "";
  const errorMsg = resolvedParams?.error;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <UserCheck className="text-blue-500" /> Encarregados
        </h1>
        <p className="text-slate-500 mt-2">Gerenciamento de encarregados locais/regionais e seus acessos.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Form */}
        <div className="glass-card h-fit xl:col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-slate-900">
              {editingPerson ? "Editar Encarregado" : "Novo Encarregado"}
            </h2>
            {editingPerson && (
              <Link href={`/encarregados?page=${page}&q=${q}`} className="text-slate-500 hover:text-slate-900 transition-colors">
                <X className="w-5 h-5" />
              </Link>
            )}
          </div>
          
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-lg">
              {errorMsg}
            </div>
          )}

          <form key={editingPerson?.id || "new"} action={async (formData) => {
            "use server";
            let result;
            if (editingPerson) {
              result = await updatePersonInCharge(editingPerson.id, formData);
            } else {
              result = await createPersonInCharge(formData);
            }
            if (result && !result.success) {
              redirect(`/encarregados?page=${page}&q=${q}${editParam}&error=${encodeURIComponent(result.error || "")}`);
            } else {
              redirect(`/encarregados?page=${page}&q=${q}`);
            }
          }} className="space-y-4">
            
            <div>
              <label htmlFor="login" className="block text-sm font-medium text-slate-600 mb-1">
                Nome de Login
              </label>
              <input
                type="text"
                id="login"
                name="login"
                required
                defaultValue={editingPerson?.login || ""}
                placeholder="Ex: joao.silva"
                className="input-glass"
              />
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-600 mb-1">
                Nome Completo
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                required
                defaultValue={editingPerson?.fullName || ""}
                placeholder="Ex: João da Silva..."
                className="input-glass"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-slate-600 mb-1">
                  Sexo
                </label>
                <select
                  id="gender"
                  name="gender"
                  required
                  defaultValue={editingPerson?.gender || ""}
                  className="input-glass"
                >
                  <option value="" disabled>Selecione...</option>
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                </select>
              </div>

              <div>
                <label htmlFor="cardNumber" className="block text-sm font-medium text-slate-600 mb-1">
                  Nº Carteirinha
                </label>
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  required
                  defaultValue={editingPerson?.cardNumber || ""}
                  placeholder="Ex: 123456"
                  className="input-glass"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="roleTypeId" className="block text-sm font-medium text-slate-600 mb-1">
                Cargo
              </label>
              <select
                id="roleTypeId"
                name="roleTypeId"
                required
                defaultValue={editingPerson?.roleTypeId || ""}
                className="input-glass"
              >
                <option value="" disabled>Selecione um cargo...</option>
                {cargos.map(cargo => (
                  <option key={cargo.id} value={cargo.id}>{cargo.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="churchId" className="block text-sm font-medium text-slate-600 mb-1">
                Igreja
              </label>
              <select
                id="churchId"
                name="churchId"
                required
                defaultValue={editingPerson?.churchId || ""}
                className="input-glass"
              >
                <option value="" disabled>Selecione uma comum...</option>
                {churches.map(church => (
                  <option key={church.id} value={church.id}>{church.name}</option>
                ))}
              </select>
            </div>

            <div className="pt-2">
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Tipos de Teste Permitidos (Pode aplicar)
              </label>
              {tiposTeste.length === 0 ? (
                <p className="text-xs text-amber-500">Cadastre "Tipos de Teste" primeiro.</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar border border-slate-100 rounded-lg p-2 bg-slate-50/50">
                  {tiposTeste.map(tipo => (
                    <label key={tipo.id} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-slate-900 transition-colors">
                      <input 
                        type="checkbox" 
                        name="testTypeIds" 
                        value={tipo.id}
                        defaultChecked={allowedTestTypeIds.includes(tipo.id)}
                        className="rounded border-slate-300 bg-slate-100 text-blue-500 focus:ring-blue-500/50"
                      />
                      {tipo.name}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2">
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Igrejas de Atuação (Opcional - Múltiplas)
              </label>
              {churches.length === 0 ? (
                <p className="text-xs text-amber-500">Cadastre Igrejas primeiro.</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar border border-slate-100 rounded-lg p-2 bg-slate-50/50">
                  <p className="text-[11px] text-slate-400 mb-2">Selecione além da Comum Congregação, quais outras igrejas ele gerencia.</p>
                  {churches.map(church => (
                    <label key={church.id} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-slate-900 transition-colors">
                      <input 
                        type="checkbox" 
                        name="managedChurchIds" 
                        value={church.id}
                        defaultChecked={editingPerson?.managedChurches?.some((mc: any) => mc.id === church.id) || false}
                        className="rounded border-slate-300 bg-slate-100 text-blue-500 focus:ring-blue-500/50"
                      />
                      {church.name}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" className="btn-primary w-full flex justify-center items-center gap-2 mt-4">
              {editingPerson ? (
                <>
                  <Pencil className="w-5 h-5" /> Salvar Alterações
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" /> Cadastrar Encarregado
                </>
              )}
            </button>
          </form>
        </div>

        {/* Table List */}
        <div className="xl:col-span-3 space-y-4 overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              Cadastrados 
              <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-1 rounded-full">{total} registros</span>
            </h2>
            
            <SearchInput defaultValue={q} placeholder="Buscar nome, login, cargo, igreja..." />
          </div>
          
          {encarregados.length === 0 ? (
            <div className="glass-card text-center text-slate-500 py-10">
              {q ? "Nenhum encarregado encontrado para a busca." : "Nenhum encarregado cadastrado ainda."}
            </div>
          ) : (
            <div className="glass-card overflow-hidden !p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 border-collapse min-w-[800px]">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-medium">Encarregado & Cargo</th>
                      <th className="px-4 py-3 font-medium">Credenciais</th>
                      <th className="px-4 py-3 font-medium">Igreja</th>
                      <th className="px-4 py-3 font-medium">Pode Aplicar</th>
                      <th className="px-4 py-3 font-medium text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {encarregados.map((person) => (
                      <tr key={person.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                              <UserCheck className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block uppercase">{person.fullName}</span>
                              <span className="text-xs text-slate-500 flex items-center gap-1 uppercase">
                                <Briefcase className="w-3 h-3" /> {person.roleType?.name || "Sem Cargo"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex flex-col gap-1">
                            <span className="text-blue-500 font-medium">@{person.login}</span>
                            <span className="text-slate-500 flex items-center gap-1 text-xs uppercase">
                              <BadgeCheck className="w-3.5 h-3.5" /> Cart: {person.cardNumber}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-sm uppercase">
                          <div className="flex items-center gap-1.5">
                            <Church className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {person.church.name}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {person.allowedTestTypes.length === 0 ? (
                              <span className="text-xs text-slate-500 italic">Nenhum</span>
                            ) : (
                              person.allowedTestTypes.map(t => (
                                <span key={t.id} className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full flex items-center gap-1 uppercase">
                                  <FileSignature className="w-3 h-3 text-slate-400" /> {t.name}
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <Link 
                              href={`/encarregados?page=${page}&q=${q}&edit=${person.id}`}
                              className="text-slate-400 hover:text-blue-500 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                              title="Editar Encarregado"
                            >
                              <Pencil className="w-4 h-4" />
                            </Link>
                            <form action={async () => {
                              "use server";
                              await deletePersonInCharge(person.id);
                            }}>
                              <button 
                                type="submit" 
                                className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                title="Excluir Encarregado"
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
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
                  <span className="text-sm text-slate-500">
                    Página {page} de {totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    {page > 1 ? (
                      <Link href={`/encarregados?page=${page - 1}&q=${q}${editParam}`} className="px-3 py-1 text-sm border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
                        Anterior
                      </Link>
                    ) : (
                      <span className="px-3 py-1 text-sm border border-slate-100 rounded-lg text-slate-300 cursor-not-allowed">
                        Anterior
                      </span>
                    )}
                    
                    {page < totalPages ? (
                      <Link href={`/encarregados?page=${page + 1}&q=${q}${editParam}`} className="px-3 py-1 text-sm border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
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
