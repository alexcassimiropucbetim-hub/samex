"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin, getRecaptchaSiteKey } from "@/actions/auth";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const ReCAPTCHA = dynamic(() => import("react-google-recaptcha"), { ssr: false });

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeQkxUtAAAAAMo1Qv5ZcYC3FfDtYrusy2Ivrfgh";
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    if (!recaptchaToken) {
      setError("Confirme que você não é um robô.");
      setLoading(false);
      return;
    }
    formData.append("recaptchaToken", recaptchaToken);

    const result = await loginAdmin(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c] px-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none"></div>
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
            <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center mb-4 text-purple-400">
              <ShieldCheck className="w-8 h-8" />
            </div>
          )}
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Administrador</h1>
          <p className="text-slate-500 text-sm mt-1">Acesso irrestrito ao sistema</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form action={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Usuário (Login)</label>
            <input 
              type="text" 
              name="username"
              placeholder="Digite o nome de usuário"
              required 
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all shadow-sm" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">Senha</label>
            <input 
              type="password" 
              name="password"
              placeholder="Digite sua senha"
              required 
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all shadow-sm" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 mt-4"
          >
            {loading ? "Autenticando..." : "Acessar Sistema"}
          </button>
          <div className="mt-4 flex justify-center w-full overflow-hidden min-h-[78px]">
            <ReCAPTCHA
              sitekey={siteKey}
              onChange={(token) => setRecaptchaToken(token)}
              theme="light"
            />
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200 text-center">
          <Link href="/login" className="text-xs text-slate-500 hover:text-slate-600 transition-colors">
            Voltar para o Portal do Encarregado
          </Link>
        </div>
      </div>
    </div>
  );
}
