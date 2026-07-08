import { getReportsData } from "@/actions/reports";
import { ReportsClient } from "./ReportsClient";

export const metadata = {
  title: "Relatórios | SAMEX",
  description: "Relatórios estatísticos",
};

export default async function RelatoriosPage({ searchParams }: { searchParams: Promise<{ ano?: string }> }) {
  const resolvedParams = await searchParams;
  const currentYear = new Date().getFullYear();
  const year = resolvedParams.ano ? parseInt(resolvedParams.ano, 10) : currentYear;

  const data = await getReportsData(year);

  // Array de anos para o filtro (ex: 2024 até o ano atual + 1)
  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Estatísticas e Relatórios</h1>
        <p className="text-slate-500">Métricas e acompanhamentos de testes musicais realizados.</p>
      </div>

      <ReportsClient data={data} year={year} availableYears={availableYears} />
    </div>
  );
}
