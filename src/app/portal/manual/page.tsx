import { ManualContent } from "@/components/ManualContent";

export const metadata = {
  title: "Manual | Portal",
};

export default function ManualPortalPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Manual</h1>
        <p className="text-slate-500 mt-1">Guia de uso e documentação do portal</p>
      </div>

      <ManualContent />
    </div>
  );
}
