import { requireSuperAdminPage } from "@/lib/auth-scope";

export default async function ConfiguracoesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSuperAdminPage();
  return <>{children}</>;
}
