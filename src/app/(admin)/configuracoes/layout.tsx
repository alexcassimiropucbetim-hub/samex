import { requireSuperAdmin } from "@/lib/auth-scope";

export default async function ConfiguracoesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSuperAdmin();
  return <>{children}</>;
}
