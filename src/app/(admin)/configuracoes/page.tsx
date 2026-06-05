"use client";

import { useState, useRef, useEffect } from "react";
import { saveConfig, getConfig } from "@/actions/config-actions";
import { Upload, Image as ImageIcon, Save, Check, Loader2, Cloud } from "lucide-react";

export default function ConfiguracoesPage() {
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [faviconBase64, setFaviconBase64] = useState<string | null>(null);
  const [driveFolderId, setDriveFolderId] = useState("");
  const [driveServiceAccount, setDriveServiceAccount] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadConfigs() {
      const folderId = await getConfig("google_drive_folder_id");
      const serviceAccount = await getConfig("google_drive_service_account");
      if (folderId) setDriveFolderId(folderId);
      if (serviceAccount) setDriveServiceAccount(serviceAccount);
    }
    loadConfigs();
  }, []);

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
      
      await saveConfig("google_drive_folder_id", driveFolderId);
      await saveConfig("google_drive_service_account", driveServiceAccount);

      setSuccessMsg("Configurações salvas com sucesso! Recarregue a página para ver todas as alterações.");
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
            Personalize a aparência do sistema e configure integrações externas (Google Drive).
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
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 mb-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <Cloud className="w-5 h-5 text-blue-500" />
          Backup no Google Drive
        </h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ID da Pasta do Google Drive</label>
            <p className="text-xs text-slate-500 mb-2">Exemplo: 1A2b3C4d5E6f... (encontrado na URL da pasta no navegador)</p>
            <input 
              type="text" 
              value={driveFolderId}
              onChange={(e) => setDriveFolderId(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Cole o ID da pasta do Drive"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">JSON da Service Account</label>
            <p className="text-xs text-slate-500 mb-2">Conteúdo do arquivo JSON gerado no Google Cloud (Service Accounts).</p>
            <textarea 
              rows={6}
              value={driveServiceAccount}
              onChange={(e) => setDriveServiceAccount(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
              placeholder='{\n  "type": "service_account",\n  "project_id": "...",\n  ...\n}'
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 shadow-sm rounded-2xl border border-slate-200">
        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2 text-sm font-medium">
            <Check className="w-4 h-4" />
            {successMsg}
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
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
