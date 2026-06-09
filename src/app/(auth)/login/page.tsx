"use client";

import { useState, useEffect } from "react";
import { loginEncarregado, getRecaptchaSiteKey } from "@/actions/auth";
import { UserCheck, ShieldAlert } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const ReCAPTCHA = dynamic(() => import("react-google-recaptcha"), { ssr: false });

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [siteKey, setSiteKey] = useState<string | null>(null);

  useEffect(() => {
    getRecaptchaSiteKey().then(setSiteKey);
  }, []);
  const [churchSelectionOptions, setChurchSelectionOptions] = useState<any[]>([]);
  const [tempCredentials, setTempCredentials] = useState<{login: string, cardNumber: string} | null>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    if (churchSelectionOptions.length === 0) {
      if (!recaptchaToken) {
        setError("Confirme que você não é um robô.");
        setLoading(false);
        return;
      }
      formData.append("recaptchaToken", recaptchaToken);
    }

    // Se estivermos na etapa de selecionar a igreja
    if (churchSelectionOptions.length > 0 && tempCredentials) {
      const finalFormData = new FormData();
      finalFormData.append("cardNumber", tempCredentials.cardNumber);
      finalFormData.append("login", tempCredentials.login);
      finalFormData.append("selectedChurchId", formData.get("selectedChurchId") as string);
      
      const result = await loginEncarregado(finalFormData);
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
      return;
    }

    const result = await loginEncarregado(formData);
    
    if (result?.requireChurchSelection) {
      setChurchSelectionOptions(result.churches || []);
      setTempCredentials({
        cardNumber: formData.get("cardNumber") as string,
        login: formData.get("login") as string
      });
      setLoading(false);
    } else if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c] px-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="glass-card max-w-md w-full relative z-10 p-8 shadow-2xl shadow-black/50 border border-slate-200">
        <div className="flex flex-col items-center mb-8">
          {!logoError ? (
            <div className="w-48 h-24 flex items-center justify-center mb-4">
              <img 
                src="/api/config/logo" 
                alt="Logo do Sistema" 
                className="max-w-full max-h-full object-contain drop-shadow-sm"
                onError={() => setLogoError(true)}
              />
            </div>
          ) : (
            <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center mb-4 text-orange-400">
              <UserCheck className="w-8 h-8" />
            </div>
          )}
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Portal do Encarregado</h1>
          <p className="text-slate-500 text-sm mt-1">Acesso exclusivo para Encarregados e Examinadoras</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {churchSelectionOptions.length > 0 ? (
          <form action={handleSubmit} className="space-y-5 animate-in slide-in-from-right-8 duration-500">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Selecione a Igreja de Atuação</label>
              <select 
                name="selectedChurchId"
                required 
                defaultValue=""
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all shadow-sm" 
              >
                <option value="" disabled>Selecione uma igreja...</option>
                {churchSelectionOptions.map((church) => (
                  <option key={church.id} value={church.id}>{church.name}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-2">Você possui acesso a múltiplas igrejas. Selecione qual deseja administrar nesta sessão.</p>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-500 text-white font-medium py-3 rounded-xl shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 mt-4"
            >
              {loading ? "Acessando..." : "Confirmar Acesso"}
            </button>
            <button 
              type="button" 
              disabled={loading}
              onClick={() => {
                setChurchSelectionOptions([]);
                setTempCredentials(null);
                setError(null);
              }}
              className="w-full bg-transparent hover:bg-slate-50 text-slate-600 font-medium py-2 rounded-xl transition-all mt-2"
            >
              Voltar
            </button>
          </form>
        ) : (
          <form action={handleSubmit} className="space-y-5 animate-in slide-in-from-left-8 duration-500">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Número da Carteirinha</label>
              <input 
                type="text" 
                name="cardNumber"
                placeholder="Digite o número da sua carteirinha"
                required 
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all shadow-sm" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">Nome de Login</label>
              <input 
                type="text" 
                name="login"
                placeholder="Digite seu nome de login"
                required 
                onInput={(e) => e.currentTarget.value = e.currentTarget.value.toUpperCase()}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all shadow-sm uppercase" 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-500 text-white font-medium py-3 rounded-xl shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 mt-4"
            >
              {loading ? "Acessando..." : "Entrar no Portal"}
            </button>
            <div className="mt-4 flex justify-center w-full overflow-hidden min-h-[78px]">
              {siteKey ? (
                <ReCAPTCHA
                  sitekey={siteKey}
                  onChange={(token) => setRecaptchaToken(token)}
                  theme="light"
                />
              ) : siteKey === "" ? (
                <div className="text-xs text-red-500 bg-red-50 p-2 rounded border border-red-200 text-center">
                  ⚠️ A variável NEXT_PUBLIC_RECAPTCHA_SITE_KEY não foi encontrada.<br/>
                  Verifique o arquivo .env e reinicie o Next.js.
                </div>
              ) : (
                <div className="text-xs text-gray-500">Carregando verificação...</div>
              )}
            </div>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-slate-200 text-center">
          <Link href="/admin-login" className="text-xs text-slate-500 hover:text-slate-600 transition-colors">
            Acesso Restrito ao Administrador
          </Link>
        </div>
      </div>
    </div>
  );
}
