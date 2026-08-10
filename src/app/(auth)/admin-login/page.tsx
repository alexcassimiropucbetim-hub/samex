"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "@/actions/auth";
import { ShieldAlert, ShieldCheck, User, Lock, ArrowRight, Music, ArrowLeft } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const ReCAPTCHA = dynamic(() => import("react-google-recaptcha"), { ssr: false });

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1a2639] px-4 py-8 relative overflow-hidden">
      {/* Background radial gradient for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0,transparent_100%)] pointer-events-none"></div>

      <div className="flex flex-col md:flex-row w-full max-w-[900px] bg-white rounded-[24px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden z-10 min-h-[650px] border border-slate-700/50">
        
        {/* Left Column (Dark Sidebar) */}
        <div className="w-full md:w-[40%] bg-[#0B1B3D] border-l-4 border-l-blue-500 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
          {/* Subtle large background icon */}
          <ShieldCheck className="absolute -left-12 -top-12 w-96 h-96 text-white opacity-[0.02] rotate-12 pointer-events-none" />
          
          {/* Glowing effect at bottom to simulate energy/security field */}
          <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-blue-500/20 to-transparent pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(37,99,235,0.4)]">
              <ShieldCheck className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">SAMEX</h1>
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">SAMEX</h1>
            <h2 className="text-blue-500 font-semibold">Administrador</h2>
            <div className="w-10 h-0.5 bg-blue-600 mt-3 mb-6"></div>
            
            <p className="text-slate-300 text-sm max-w-[200px] mb-12 leading-relaxed">
              Acesso irrestrito e configurações do sistema
            </p>

            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full border border-blue-500/30 flex items-center justify-center mb-1">
                <Lock className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-white text-sm font-bold">Ambiente Administrativo</h3>
              <p className="text-slate-400 text-xs max-w-[220px]">
                Acesso exclusivo e monitorado para gerentes do sistema.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (Form Area) */}
        <div className="w-full md:w-[60%] flex flex-col bg-white">
          <div className="flex-1 p-8 md:p-12">
            
            <div className="flex flex-col items-center mb-8">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-slate-50">
                <ShieldCheck className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-3xl font-extrabold text-[#0B1B3D]">Painel Admin</h2>
              <div className="flex items-center gap-2 mt-4 mb-6">
                <div className="w-8 h-0.5 bg-blue-500 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <div className="w-8 h-0.5 bg-blue-500 rounded-full"></div>
              </div>
              <p className="text-slate-500 text-sm text-center">Entre com suas credenciais de acesso</p>
            </div>

            {error && (
              <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <form action={handleSubmit} className="space-y-6 animate-in slide-in-from-left-8 duration-500">
              
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-2">
                  <div className="w-6 h-6 border border-blue-200 rounded flex items-center justify-center bg-blue-50/50">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  Usuário (Login)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    name="username"
                    placeholder="Digite o nome de usuário"
                    required 
                    className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-sm" 
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-2">
                  <div className="w-6 h-6 border border-blue-200 rounded flex items-center justify-center bg-blue-50/50">
                    <Lock className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-slate-400" />
                  </div>
                  <input 
                    type="password" 
                    name="password"
                    placeholder="Digite sua senha"
                    required 
                    className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-3.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-sm" 
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 mt-2 mb-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all" />
                  <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Lembrar meus dados</span>
                </label>
                <Link href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-700 underline decoration-blue-600/30 underline-offset-4 transition-colors">
                  Esqueci meus dados
                </Link>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 group mt-2"
              >
                <Lock className="w-5 h-5" />
                {loading ? "Autenticando..." : "Acessar Sistema"}
                {!loading && <ArrowRight className="w-5 h-5 ml-auto group-hover:translate-x-1 transition-transform" />}
              </button>

              <div className="flex items-center gap-4 my-8">
                <hr className="flex-1 border-slate-100" />
                <span className="text-xs font-semibold text-slate-400">Verificação de Segurança</span>
                <hr className="flex-1 border-slate-100" />
              </div>

              <div className="flex justify-center w-full overflow-hidden min-h-[78px]">
                <ReCAPTCHA
                  sitekey={siteKey}
                  onChange={(token) => setRecaptchaToken(token)}
                  theme="light"
                />
              </div>
            </form>
          </div>
          
          {/* Card Footer */}
          <div className="bg-slate-50 border-t border-slate-100 py-6 px-8 flex justify-center mt-auto">
            <Link href="/login" className="flex items-center justify-between w-full bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl py-3 px-4 text-sm font-semibold text-slate-600 transition-all shadow-sm group">
              <div className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                Voltar para o Portal do Encarregado
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Global Footer */}
      <div className="mt-8 text-center flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
          <Lock className="w-4 h-4" />
          SAMEX - Sistema de Administração Musical de Exames
        </div>
        <p className="text-slate-400 text-xs">© 2026 Todos os direitos reservados.</p>
      </div>
    </div>
  );
}
