"use client";

import { useState } from "react";
import { loginEncarregado } from "@/actions/auth";
import { UserCheck, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [logoError, setLogoError] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await loginEncarregado(formData);
    if (result?.error) {
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

        <form action={handleSubmit} className="space-y-5">
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
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all shadow-sm" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-medium py-3 rounded-xl shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 mt-4"
          >
            {loading ? "Acessando..." : "Entrar no Portal"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200 text-center">
          <Link href="/admin-login" className="text-xs text-slate-500 hover:text-slate-600 transition-colors">
            Acesso Restrito ao Administrador
          </Link>
        </div>
      </div>
    </div>
  );
}
