import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Admin } from "@prisma/client";

/**
 * Obtém o Administrador autenticado atual, consultando a base de dados
 * para garantir que os dados de 'role' e 'administrationId' sejam sempre atuais,
 * não dependendo cegamente do JWT da sessão.
 */
export async function getAuthenticatedAdmin(): Promise<Admin | null> {
  const session = await getSession();
  
  // 1. Ler a sessão e confirmar que é do tipo admin
  if (!session || session.type !== "admin") return null;

  // 2. Buscar o Admin atual no banco usando o ID da sessão
  const admin = await prisma.admin.findUnique({
    where: { id: session.id },
  });

  // 3. Se o Admin não existir mais, acesso negado
  if (!admin) return null;

  // 4. Checagem de consistência rigorosa (SUPER_ADMIN não deve ter administrationId)
  if (admin.role === "SUPER_ADMIN" && admin.administrationId !== null) {
    console.error(`Admin Inconsistente (SUPER_ADMIN): ID ${admin.id} não deveria ter administrationId.`);
    return null;
  }
  
  // (ADMINISTRATION_ADMIN DEVE ter administrationId)
  if (admin.role === "ADMINISTRATION_ADMIN" && admin.administrationId === null) {
    console.error(`Admin Inconsistente (ADMINISTRATION_ADMIN): ID ${admin.id} obrigatório ter administrationId.`);
    return null;
  }

  // 5. Retornar dados frescos do banco
  return admin;
}

/**
 * Exige que o usuário atual seja um SUPER_ADMIN (Uso em Server Actions).
 * Será utilizado para gestão global, RRMs e criação de outros Admins.
 */
export async function requireSuperAdmin(): Promise<Admin> {
  const admin = await getAuthenticatedAdmin();
  if (!admin) throw new Error("Acesso negado. Administrador não autenticado.");
  if (admin.role !== "SUPER_ADMIN") throw new Error("Acesso restrito a Super Administradores.");
  return admin;
}

/**
 * Exige que o usuário atual seja um SUPER_ADMIN (Uso em Páginas e Layouts).
 * Redireciona de forma silenciosa e amigável em vez de lançar 500.
 */
export async function requireSuperAdminPage(): Promise<Admin> {
  const { redirect } = await import("next/navigation");
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    redirect("/admin-login");
    return null as never;
  }
  if (admin.role !== "SUPER_ADMIN") {
    // Redireciona o ADMIN_ADMIN para o painel principal caso não tenha permissão de SUPER
    redirect("/");
    return null as never;
  }
  return admin as Admin;
}

/**
 * Exige que o administrador esteja autenticado (Uso em Páginas e Layouts).
 */
export async function requireAuthenticatedAdminPage(): Promise<Admin> {
  const { redirect } = await import("next/navigation");
  const admin = await getAuthenticatedAdmin();
  if (!admin) {
    redirect("/admin-login");
    return null as never;
  }
  return admin as Admin;
}


/**
 * Valida o acesso de gravação ou visualização direta para uma Administração específica.
 * @param targetAdministrationId O ID da administração alvo.
 */
export async function assertAdministrationAccess(targetAdministrationId: string): Promise<boolean> {
  const admin = await getAuthenticatedAdmin();
  if (!admin) throw new Error("Acesso negado. Administrador não autenticado.");

  // SUPER_ADMIN possui acesso global
  if (admin.role === "SUPER_ADMIN") return true;

  // ADMINISTRATION_ADMIN possui acesso somente à própria administração
  if (admin.role === "ADMINISTRATION_ADMIN" && admin.administrationId === targetAdministrationId) {
    return true;
  }

  throw new Error("Acesso negado a esta Administração. Violação de Isolamento.");
}

export type ScopedModel = "Sector" | "Church" | "PreEvaluation" | "TestSchedule" | "PersonInCharge" | "Evaluator";

/**
 * Retorna o objeto `where` apropriado do Prisma para isolar os registros 
 * de acordo com a permissão do Administrador autenticado.
 * @param model O prefixo/nome do model sendo pesquisado
 */
export async function buildAdministrationWhere(model: ScopedModel): Promise<any> {
  const admin = await getAuthenticatedAdmin();
  if (!admin) throw new Error("Acesso negado. Administrador não autenticado.");

  // Acesso Global
  if (admin.role === "SUPER_ADMIN") return {};

  const admId = admin.administrationId;
  if (!admId) throw new Error("Administrador inválido: Nenhuma Administração vinculada.");

  // Escopo estrito por entidade (Baseado nas relações reais do schema.prisma)
  switch (model) {
    case "Sector":
      return { administrationId: admId };
      
    case "Church":
      return { sector: { administrationId: admId } };
      
    case "PreEvaluation":
      // PreEvaluation -> Church -> Sector -> Administration
      return { church: { sector: { administrationId: admId } } };
      
    case "TestSchedule":
      // TestSchedule -> Church -> Sector -> Administration
      return { church: { sector: { administrationId: admId } } };
      
    case "PersonInCharge":
      // PersonInCharge -> Church -> Sector -> Administration
      return { church: { sector: { administrationId: admId } } };
      
    case "Evaluator":
      // Evaluator -> Administration (Relação Direta)
      return { administrationId: admId };
      
    default:
      throw new Error(`O model '${model}' não possui mapeamento de escopo no momento.`);
  }
}
