"use client";

import { useState, useRef, useEffect } from "react";
import { saveConfig, getConfig } from "@/actions/config-actions";
import { Upload, Image as ImageIcon, Save, Check, Loader2, Cloud, AlertCircle, RefreshCw } from "lucide-react";

// Redimensionamento e otimização de imagem no client-side para evitar limites de payload
function processImageFile(file: File, maxWidth: number, maxHeight: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.max(1, Math.round(width * ratio));
          height = Math.max(1, Math.round(height * ratio));
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function ConfiguracoesPage() {
  const [logoBase64, setLogoBase64] = useState<string | null>(null);
  const [faviconBase64, setFaviconBase64] = useState<string | null>(null);
  const [logoChanged, setLogoChanged] = useState(false);
  const [faviconChanged, setFaviconChanged] = useState(false);
  const [driveFolderId, setDriveFolderId] = useState("");
  const [driveServiceAccount, setDriveServiceAccount] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [timestamp, setTimestamp] = useState<number | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadConfigs() {
      try {
        const [folderId, serviceAccount, currentLogo, currentFavicon] = await Promise.all([
          getConfig("google_drive_folder_id"),
          getConfig("google_drive_service_account"),
          getConfig("logo"),
          getConfig("favicon"),
        ]);
        if (folderId) setDriveFolderId(folderId);
        if (serviceAccount) setDriveServiceAccount(serviceAccount);
        if (currentLogo) setLogoBase64(currentLogo);
        if (currentFavicon) setFaviconBase64(currentFavicon);
      } catch (err) {
        console.error("Erro ao carregar configurações:", err);
      }
    }
    loadConfigs();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "favicon") => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (type === "logo") {
        // Redimensionar logo para até 800x260px transparente
        const optimized = await processImageFile(file, 800, 260);
        setLogoBase64(optimized);
        setLogoChanged(true);
      } else {
        // Redimensionar favicon para 128x128px
        const optimized = await processImageFile(file, 128, 128);
        setFaviconBase64(optimized);
        setFaviconChanged(true);
      }
      setSuccessMsg("");
      setErrorMsg("");
    } catch (err) {
      console.error("Erro ao processar imagem:", err);
      setErrorMsg("Erro ao processar a imagem selecionada. Tente outro arquivo.");
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      if (logoChanged && logoBase64) {
        const resLogo = await saveConfig("logo", logoBase64);
        if (!resLogo.success) {
          throw new Error(resLogo.error || "Erro ao salvar a Logo.");
        }
      }

      if (faviconChanged && faviconBase64) {
        const resFav = await saveConfig("favicon", faviconBase64);
        if (!resFav.success) {
          throw new Error(resFav.error || "Erro ao salvar o Favicon.");
        }
      }

      const resDrive = await saveConfig("google_drive_folder_id", driveFolderId);
      if (!resDrive.success) {
        throw new Error(resDrive.error || "Erro ao salvar pasta do Google Drive.");
      }

      const resAcc = await saveConfig("google_drive_service_account", driveServiceAccount);
      if (!resAcc.success) {
        throw new Error(resAcc.error || "Erro ao salvar Service Account do Google Drive.");
      }

      setLogoChanged(false);
      setFaviconChanged(false);
      const newTime = Date.now();
      setTimestamp(newTime);
      setSuccessMsg("Configurações e identidade visual salvas com sucesso!");
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      setErrorMsg(error?.message || "Erro ao salvar configurações.");
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
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700">Logo do Sistema</label>
              {logoChanged && (
                <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Alteração pendente
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">Recomendado: Imagem transparente (PNG ou SVG).</p>
            
            <div 
              className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100/80 transition-colors cursor-pointer min-h-[170px]"
              onClick={() => logoInputRef.current?.click()}
            >
              {logoBase64 ? (
                <div className="flex flex-col items-center gap-2">
                  <img src={logoBase64} alt="Preview Logo" className="max-h-24 max-w-full object-contain" />
                  <span className="text-xs text-blue-600 hover:underline font-medium mt-1">
                    Clique para trocar
                  </span>
                </div>
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
            
            {/* Imagem Atual em Produção */}
            <div className="text-xs text-slate-500 flex items-center gap-2 pt-1">
              <span>Logo ativa:</span>
              <img 
                src={timestamp ? `/api/config/logo?t=${timestamp}` : "/api/config/logo"} 
                alt="logo atual" 
                className="h-6 object-contain border border-slate-200 rounded px-1.5 py-0.5 bg-white" 
                onError={(e) => (e.currentTarget.style.display = 'none')} 
              />
            </div>
          </div>

          {/* FAVICON UPLOAD */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700">Favicon (Ícone da Aba)</label>
              {faviconChanged && (
                <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Alteração pendente
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">Recomendado: Ícone quadrado 32x32px ou 128x128px (PNG ou ICO).</p>
            
            <div 
              className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100/80 transition-colors cursor-pointer min-h-[170px]"
              onClick={() => faviconInputRef.current?.click()}
            >
              {faviconBase64 ? (
                <div className="flex flex-col items-center gap-2">
                  <img src={faviconBase64} alt="Preview Favicon" className="h-16 w-16 object-contain rounded-lg border border-slate-200 p-1 bg-white shadow-sm" />
                  <span className="text-xs text-blue-600 hover:underline font-medium mt-1">
                    Clique para trocar
                  </span>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-sm font-medium text-slate-600">Clique para selecionar</span>
                </>
              )}
            </div>
            <input 
              type="file" 
              accept="image/png, image/x-icon, image/ico, image/jpeg" 
              className="hidden" 
              ref={faviconInputRef}
              onChange={(e) => handleFileChange(e, "favicon")}
            />
            
            {/* Favicon Atual em Produção */}
            <div className="text-xs text-slate-500 flex items-center gap-2 pt-1">
              <span>Favicon ativo:</span>
              <img 
                src={timestamp ? `/api/config/favicon?t=${timestamp}` : "/api/config/favicon"} 
                alt="favicon atual" 
                className="h-5 w-5 object-contain border border-slate-200 rounded p-0.5 bg-white" 
                onError={(e) => (e.currentTarget.style.display = 'none')} 
              />
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
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 text-sm font-medium">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2 text-sm font-medium">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
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
