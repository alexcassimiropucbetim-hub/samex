"use client";

import { useState, useRef } from "react";
import { saveConfig } from "@/actions/config-actions";
import { Upload, Image as ImageIcon, Save, Check, Loader2 } from "lucide-react";

export default function ConfiguracoesPage() {
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [faviconBase64, setFaviconBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "favicon") => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Converter para Base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (type === "logo") {
        setLogoBase64(base64String);
      } else {
        setFaviconBase64(base64String);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setLoading(true);
    setSuccessMsg("");

    try {
      if (logoBase64) {
        await saveConfig("logo", logoBase64);
      }
      if (faviconBase64) {
        await saveConfig("favicon", faviconBase64);
      }
      
      setSuccessMsg("Configurações salvas com sucesso! Recarregue a página para ver todas as alterações.");
      
      // Limpar os previews se quiser, ou deixar lá
      // Para forçar a imagem a recarregar onde ela já está sendo exibida, a API Next fará revalidate
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar configurações.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Configurações do Sistema</h1>
          <p className="text-slate-500 mt-2">
            Personalize a aparência do sistema fazendo o upload da sua própria Logo e Favicon.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 mb-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-blue-500" />
          Identidade Visual
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* LOGO UPLOAD */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">Logo do Sistema</label>
            <p className="text-xs text-slate-500">Recomendado: PNG transparente, altura máx 100px.</p>
            
            <div 
              className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer min-h-[160px]"
              onClick={() => logoInputRef.current?.click()}
            >
              {logoBase64 ? (
                <img src={logoBase64} alt="Preview Logo" className="max-h-24 object-contain" />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-sm font-medium text-slate-600">Clique para selecionar</span>
                </>
              )}
            </div>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={logoInputRef}
              onChange={(e) => handleFileChange(e, "logo")}
            />
            
            {/* Imagem Atual Fallback */}
            <div className="text-sm text-slate-500">
              Logo atual: <img src="/api/config/logo" alt="logo" className="inline h-6 ml-2 rounded border" onError={(e) => (e.currentTarget.style.display = 'none')} />
            </div>
          </div>

          {/* FAVICON UPLOAD */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">Favicon (Ícone da Aba)</label>
            <p className="text-xs text-slate-500">Recomendado: Ícone quadrado 32x32px (PNG ou ICO).</p>
            
            <div 
              className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer min-h-[160px]"
              onClick={() => faviconInputRef.current?.click()}
            >
              {faviconBase64 ? (
                <img src={faviconBase64} alt="Preview Favicon" className="max-h-16 w-16 object-contain" />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-sm font-medium text-slate-600">Clique para selecionar</span>
                </>
              )}
            </div>
            <input 
              type="file" 
              accept="image/png, image/x-icon, image/ico" 
              className="hidden" 
              ref={faviconInputRef}
              onChange={(e) => handleFileChange(e, "favicon")}
            />
            
            {/* Imagem Atual Fallback */}
            <div className="text-sm text-slate-500">
              Favicon atual: <img src="/api/config/favicon" alt="favicon" className="inline h-4 w-4 ml-2 border" onError={(e) => (e.currentTarget.style.display = 'none')} />
            </div>
          </div>
        </div>

        {successMsg && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2 text-sm font-medium">
            <Check className="w-4 h-4" />
            {successMsg}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading || (!logoBase64 && !faviconBase64)}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 shadow-md shadow-blue-500/20"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  );
}
