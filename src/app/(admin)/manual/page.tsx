import { ManualContent } from "@/components/ManualContent";

export const metadata = {
  title: "Manual do Sistema | Painel Admin",
};

export default function ManualAdminPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Manual do Sistema</h1>
        <p className="text-slate-500 mt-1">Guia de uso e documentação do sistema</p>
      </div>

      <ManualContent />
    </div>
  );
}
