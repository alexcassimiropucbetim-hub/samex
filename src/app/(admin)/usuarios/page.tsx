import { getAdmins, createAdmin, updateAdmin, deleteAdmin } from "@/actions/admin-users";
import { prisma } from "@/lib/prisma";
import { UserCog, Plus, Trash2, Pencil, X, KeyRound, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/auth-scope";

export default async function UsuariosAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string, error?: string, adm?: string }>;
}) {
  await requireSuperAdmin();
  const resolvedParams = await searchParams;
  const admins = await getAdmins();
  
  const editingId = resolvedParams?.edit;
  const errorMsg = resolvedParams?.error;
  const autoSelectAdm = resolvedParams?.adm;
  const editingAdmin = editingId ? admins.find((a: any) => a.id === editingId) : null;

  // Buscar administrações para o select
  const administracoes = await prisma.administration.findMany({
    orderBy: { name: "asc" },
    include: { rrm: true }
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <UserCog className="text-orange-500" /> Administradores
        </h1>
        <p className="text-slate-500 mt-2">Gerenciamento de usuários com acesso administrativo (SUPER_ADMIN ou ADMINISTRATION_ADMIN).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Form */}
        <div className="glass-card h-fit lg:col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-slate-900">
              {editingAdmin ? "Editar Usuário" : "Novo Usuário"}
            </h2>
            {(editingAdmin || autoSelectAdm) && (
              <Link href="/usuarios" className="text-slate-500 hover:text-slate-900 transition-colors">
                <X className="w-5 h-5" />
              </Link>
            )}
          </div>
          
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-lg">
              {errorMsg}
            </div>
          )}

          <form key={editingId || "new"} action={async (formData) => {
            "use server";
            const id = formData.get("id") as string;
            if (id) {
              const res = await updateAdmin(id, formData);
              if (res?.success) {
                redirect("/usuarios");
              } else {
                redirect(`/usuarios?edit=${id}&error=${encodeURIComponent(res?.error || "Erro ao atualizar")}`);
              }
            } else {
              const res = await createAdmin(formData);
              if (res?.success) {
                redirect("/usuarios");
              } else {
                redirect(`/usuarios?error=${encodeURIComponent(res?.error || "Erro ao criar")}`);
              }
            }
          }} className="space-y-4">
            {editingAdmin && (
              <input type="hidden" name="id" value={editingAdmin.id} />
            )}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-600 mb-1">
                Nome Completo
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                defaultValue={editingAdmin?.name || ""}
                placeholder="Ex: João Silva..."
                className="input-glass focus:ring-orange-500"
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-600 mb-1">
                Login de Acesso
              </label>
              <input
                type="text"
                id="username"
                name="username"
                required
                defaultValue={editingAdmin?.username || ""}
                placeholder="Ex: joao.admin..."
                className="input-glass focus:ring-orange-500"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-slate-600 mb-1">
                Nível de Acesso (Role)
              </label>
              <select
                id="role"
                name="role"
                required
                defaultValue={editingAdmin?.role || (autoSelectAdm ? "ADMINISTRATION_ADMIN" : "ADMINISTRATION_ADMIN")}
                className="input-glass focus:ring-orange-500"
              >
                <option value="ADMINISTRATION_ADMIN">ADMINISTRATION_ADMIN (Local)</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN (Global)</option>
              </select>
            </div>

            <div>
              <label htmlFor="administrationId" className="block text-sm font-medium text-slate-600 mb-1">
                Administração (se aplicável)
              </label>
              <select
                id="administrationId"
                name="administrationId"
                defaultValue={editingAdmin?.administrationId || autoSelectAdm || ""}
                className="input-glass focus:ring-orange-500"
              >
                <option value="">-- Nenhuma (Apenas Super Admin) --</option>
                {administracoes.map(adm => (
                  <option key={adm.id} value={adm.id}>{adm.rrm.name} - {adm.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-600 mb-1">
                {editingAdmin ? "Nova Senha (opcional)" : "Senha Inicial"}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required={!editingAdmin}
                placeholder={editingAdmin ? "Digite apenas para alterar..." : "********"}
                className="input-glass focus:ring-orange-500"
              />
            </div>

            <button type="submit" className="btn-primary w-full flex justify-center items-center gap-2">
              {editingAdmin ? (
                <>
                  <Pencil className="w-5 h-5" /> Salvar Alterações
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" /> Cadastrar Usuário
                </>
              )}
            </button>
          </form>
        </div>

        {/* Table List */}
        <div className="lg:col-span-3 space-y-4 overflow-hidden">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Usuários Cadastrados ({admins.length})</h2>
          
          {admins.length === 0 ? (
            <div className="glass-card text-center text-slate-500 py-10">
              Nenhum usuário administrador encontrado.
            </div>
          ) : (
            <div className="hidden lg:block glass-card overflow-x-auto p-0">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100">
                    <th className="p-4 text-sm font-semibold text-slate-600">Usuário</th>
                    <th className="p-4 text-sm font-semibold text-slate-600">Login / Papel</th>
                    <th className="p-4 text-sm font-semibold text-slate-600 text-center w-32">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {admins.map((admin: any) => {
                    const admVinculada = administracoes.find(a => a.id === admin.administrationId);
                    return (
                    <tr key={admin.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${admin.role === 'SUPER_ADMIN' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'}`}>
                            {admin.role === 'SUPER_ADMIN' ? <ShieldAlert className="w-4 h-4" /> : <UserCog className="w-4 h-4" />}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-900">{admin.name}</span>
                            <span className="text-xs text-slate-500">Cadastrado em: {new Date(admin.createdAt).toLocaleDateString("pt-BR")}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col items-start gap-1">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-xs font-mono border border-slate-200">
                            {admin.username}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${admin.role === 'SUPER_ADMIN' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {admin.role}
                          </span>
                          {admin.role === 'ADMINISTRATION_ADMIN' && admVinculada && (
                            <span className="text-xs text-slate-500 mt-1">
                              {admVinculada.name}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <Link 
                            href={`/usuarios?edit=${admin.id}`}
                            className="text-slate-500 hover:text-orange-400 p-2 rounded-lg hover:bg-orange-50 transition-colors"
                            title="Editar e Alterar Senha"
                          >
                            <KeyRound className="w-4 h-4" />
                          </Link>
                          {admin.username !== 'admin' && ( // Protect master admin visually too
                            <form action={async (formData) => {
                              "use server";
                              const id = formData.get("id") as string;
                              if (id) await deleteAdmin(id);
                            }}>
                              <input type="hidden" name="id" value={admin.id} />
                              <button 
                                type="submit" 
                                className="text-slate-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                title="Excluir Usuário"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
          )}

          {/* Mobile Cards */}
          {admins.length > 0 && (
            <div className="lg:hidden flex flex-col gap-4 mt-4">
              {admins.map((admin: any) => {
                const admVinculada = administracoes.find(a => a.id === admin.administrationId);
                return (
                <div key={admin.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${admin.role === 'SUPER_ADMIN' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'}`}>
                        {admin.role === 'SUPER_ADMIN' ? <ShieldAlert className="w-5 h-5" /> : <UserCog className="w-5 h-5" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-sm">{admin.name}</span>
                        <span className="text-xs text-slate-500">Cadastrado: {new Date(admin.createdAt).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Login</span>
                      <span className="text-xs font-mono font-medium text-slate-700 bg-white px-2 py-1 rounded border border-slate-200">
                        {admin.username}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Role</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${admin.role === 'SUPER_ADMIN' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {admin.role}
                      </span>
                    </div>
                    {admVinculada && (
                      <div className="text-xs text-slate-600 mt-1 pt-1 border-t border-slate-200">
                        <strong>Adm:</strong> {admVinculada.name}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 justify-end pt-2 border-t border-slate-100">
                    <Link 
                      href={`/usuarios?edit=${admin.id}`}
                      className="text-slate-500 hover:text-orange-400 p-2.5 rounded-xl hover:bg-orange-50 transition-colors"
                      title="Editar e Alterar Senha"
                    >
                      <KeyRound className="w-5 h-5" />
                    </Link>
                    {admin.username !== 'admin' && (
                      <form action={async (formData) => {
                        "use server";
                        const id = formData.get("id") as string;
                        if (id) await deleteAdmin(id);
                      }}>
                        <input type="hidden" name="id" value={admin.id} />
                        <button 
                          type="submit" 
                          className="text-slate-500 hover:text-red-400 p-2.5 rounded-xl hover:bg-red-50 transition-colors"
                          title="Excluir Usuário"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )})}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
