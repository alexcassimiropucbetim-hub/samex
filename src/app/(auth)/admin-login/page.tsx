"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "@/actions/auth";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ShieldCheck,
  User,
  Lock,
  ArrowRight,
  ArrowLeft,
  Settings,
  Monitor,
  Users,
  Eye,
  EyeOff,
  AlertCircle,
  X,
  Info,
} from "lucide-react";

const ReCAPTCHA = dynamic(() => import("react-google-recaptcha"), { ssr: false });

function TrebleClef({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 38"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M12.5 0C11.6 0 10.8.5 10.3 1.3C9.7 2.2 9.4 3.4 9.4 4.8C9.4 6.8 10.1 8.8 11.2 10.9C12.3 13 13.5 15.3 14.5 17.6C15 18.7 15.3 19.8 15.3 20.9C15.3 22.3 14.8 23.6 13.9 24.6C13 25.6 11.8 26.1 10.4 26.1C9.6 26.1 8.8 25.9 8.1 25.5C7.4 25.1 6.8 24.5 6.4 23.8C6 23.1 5.8 22.3 5.8 21.4C5.8 20.3 6.1 19.3 6.8 18.5C7.5 17.7 8.4 17.2 9.5 17.1C9.4 16.3 9.1 15.6 8.5 15C7.9 14.4 7.1 14.1 6.2 14.1C4.4 14.1 3 14.8 2 16.2C1 17.6.5 19.4.5 21.6C.5 24 1.2 26 2.6 27.6C4 29.2 5.9 30 8.2 30C9.6 30 10.9 29.7 12 29.1C12 29.6 11.9 30.2 11.9 30.7C11.8 32.3 11.5 33.7 11.1 34.8C10.7 35.9 10.1 36.8 9.5 37.3C8.9 37.8 8.1 38.1 7.2 38.1C6.5 38.1 5.9 37.9 5.4 37.5C4.9 37.1 4.6 36.6 4.5 36C4.8 35.8 5 35.5 5.2 35.2C5.4 34.8 5.5 34.4 5.5 33.9C5.5 33.1 5.2 32.4 4.7 31.9C4.2 31.3 3.5 31 2.7 31C1.9 31 1.2 31.3.7 31.9C.2 32.5 0 33.2 0 34.1C0 35.3.4 36.3 1.3 37.2C2.2 38.1 3.4 38.8 4.9 39.3C6.4 39.8 8 40 9.7 40C11.4 40 12.9 39.5 14.2 38.6C15.5 37.7 16.5 36.4 17.2 34.8C17.9 33.2 18.2 31.4 18.2 29.3C18.2 28.5 18.2 27.6 18.1 26.8C19 25.8 19.7 24.6 20.1 23.2C20.6 21.8 20.8 20.4 20.8 18.9C20.8 16.9 20.3 15 19.4 13.2C18.5 11.4 17.3 9.6 15.8 7.8C14.4 6 13.2 4.4 12.3 3.1C12.1 2.8 12 2.5 12 2.1C12 1.7 12.2 1.5 12.5 1.5C12.8 1.5 13 1.7 13.1 2C13.6 3 14.3 3.8 15.2 4.4C16.1 5 17 5.3 18 5.3C19 5.3 19.8 4.9 20.4 4.1C21 3.3 21.3 2.3 21.3 1.2C21.3.9 21.2.6 21.1.4C20.9.1 20.7 0 20.5 0C20.2 0 19.9.1 19.7.4C19.5.7 19.4 1 19.4 1.4C19.4 1.9 19.2 2.3 18.9 2.6C18.6 2.9 18.2 3.1 17.7 3.1C17.1 3.1 16.6 2.8 16.1 2.3C15.6 1.8 15.2 1.1 14.9.4C14.3.1 13.5 0 12.5 0Z" />
    </svg>
  );
}

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeQkxUtAAAAAMo1Qv5ZcYC3FfDtYrusy2Ivrfgh";
  const router = useRouter();

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("samex_remember_admin_user");
      if (savedUser) {
        setUsername(savedUser);
        setRememberMe(true);
      }
    } catch {
      // Ignora erro em ambientes sem localStorage
    }
  }, []);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    if (rememberMe && username) {
      try {
        localStorage.setItem("samex_remember_admin_user", username.trim());
      } catch {
        // Ignora
      }
    } else {
      try {
        localStorage.removeItem("samex_remember_admin_user");
      } catch {
        // Ignora
      }
    }

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

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-[#030B17] via-[#071B3B] to-[#040E1E] p-4 sm:p-6 lg:p-8 relative overflow-x-hidden font-sans select-none">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#0055FF]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-[#0088FF]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-[980px] bg-white rounded-3xl shadow-[0_0_40px_rgba(0,102,255,0.22),0_25px_60px_rgba(0,0,0,0.6)] border border-[#0088FF]/30 overflow-hidden flex flex-col lg:flex-row relative z-10">

        {/* ========================================================================= */}
        {/* LEFT COLUMN (DESKTOP - 42%) */}
        {/* ========================================================================= */}
        <div className="hidden lg:flex lg:w-[42%] bg-[#071B3B] relative overflow-hidden flex-col justify-between p-10 text-white border-r border-white/5">
          
          {/* Musical sheet & instruments background image blended in bottom */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/samex_music_bg.jpg"
              alt="Instrumentos musicais SAMEX"
              fill
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover object-bottom opacity-55 mix-blend-luminosity brightness-110"
              priority
            />
            {/* Dark gradient overlay keeping the top deep navy */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#071B3B]/60 via-[#071B3B]/85 to-[#071B3B]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#071B3B]/90 via-transparent to-[#071B3B]/90" />
          </div>

          {/* Musical treble clef and staff lines watermark in top-left */}
          <div className="absolute top-4 left-6 pointer-events-none opacity-20 z-10">
            <TrebleClef className="w-16 h-24 text-[#38BDF8]" />
            <div className="absolute top-8 left-12 w-48 space-y-1.5 opacity-60">
              <div className="h-[1px] bg-[#38BDF8]" />
              <div className="h-[1px] bg-[#38BDF8]" />
              <div className="h-[1px] bg-[#38BDF8]" />
              <div className="h-[1px] bg-[#38BDF8]" />
              <div className="h-[1px] bg-[#38BDF8]" />
            </div>
          </div>

          {/* S-Curve divider transition on the right with electric blue glow */}
          <svg
            className="absolute top-0 -right-[1px] h-full w-14 z-20 pointer-events-none"
            viewBox="0 0 50 640"
            preserveAspectRatio="none"
            fill="none"
          >
            <path
              d="M 50 0 C 12 140, 12 260, 30 360 C 48 460, 18 540, 50 640"
              stroke="#0088FF"
              strokeWidth="3.5"
              className="drop-shadow-[0_0_10px_rgba(0,136,255,0.95)]"
            />
            <path
              d="M 50 0 C 12 140, 12 260, 30 360 C 48 460, 18 540, 50 640 L 50 640 L 50 0 Z"
              fill="#FFFFFF"
            />
          </svg>

          {/* Top Brand Section */}
          <div className="relative z-10 flex flex-col items-center text-center mt-2">
            
            {/* 3D Shield Badge with Checkmark */}
            <div className="relative mb-3 flex items-center justify-center">
              <div className="absolute inset-0 bg-[#0066FF] blur-2xl opacity-70 animate-pulse" />
              <div className="relative p-3.5 rounded-2xl bg-gradient-to-b from-[#0091FF] via-[#0055EE] to-[#0038A8] shadow-[0_0_30px_rgba(0,145,255,0.6)] border border-[#60A5FA]/60 flex items-center justify-center">
                <svg className="w-11 h-11 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(255,255,255,0.14)" />
                  <path d="m9 12 2 2 4-4" stroke="white" strokeWidth="2.5" />
                </svg>
              </div>
            </div>

            {/* SAMEX Title & Orange Swoosh */}
            <div className="flex flex-col items-center">
              <h1 className="text-4xl font-black italic tracking-wider text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                SAMEX
              </h1>
              {/* Orange swoosh curve */}
              <svg className="w-32 h-3.5 -mt-1 text-[#FF6500]" viewBox="0 0 130 14" fill="none">
                <path d="M2 3C32 10 75 12 128 3C90 8 45 9 2 3Z" fill="currentColor" />
              </svg>
            </div>

            {/* Administrador Pill Badge */}
            <div className="mt-2.5 px-5 py-1 rounded-full bg-[#0D3875] border border-[#1E6FD9]/50 shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
              <span className="text-xs sm:text-[13px] font-bold text-white tracking-wide">
                Administrador
              </span>
            </div>

            <p className="text-xs text-slate-200 font-medium tracking-wide mt-2 text-center max-w-[240px]">
              Sistema de Administração Musical de Exames
            </p>
          </div>

          {/* Middle 3 Features */}
          <div className="relative z-10 space-y-4 my-8">
            {/* Feature 1: Gestão Completa */}
            <div className="bg-[#071B3B]/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex items-center gap-3.5 shadow-sm hover:border-[#0088FF]/40 transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#0055FF]/20 border border-[#0070F3]/50 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(0,102,255,0.3)]">
                <Monitor className="w-5 h-5 text-[#38BDF8]" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-white leading-tight">Gestão Completa</h4>
                <p className="text-xs text-slate-300">Configurações e acessos</p>
              </div>
            </div>

            {/* Feature 2: Controle de Usuários */}
            <div className="bg-[#071B3B]/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex items-center gap-3.5 shadow-sm hover:border-[#0088FF]/40 transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#0055FF]/20 border border-[#0070F3]/50 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(0,102,255,0.3)]">
                <Users className="w-5 h-5 text-[#38BDF8]" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-white leading-tight">Controle de Usuários</h4>
                <p className="text-xs text-slate-300">Encarregados, Examinadoras e Equipes</p>
              </div>
            </div>

            {/* Feature 3: Segurança */}
            <div className="bg-[#071B3B]/80 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex items-center gap-3.5 shadow-sm hover:border-[#0088FF]/40 transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#0055FF]/20 border border-[#0070F3]/50 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(0,102,255,0.3)]">
                <ShieldCheck className="w-5 h-5 text-[#38BDF8]" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-white leading-tight">Segurança</h4>
                <p className="text-xs text-slate-300">Acesso restrito e monitorado</p>
              </div>
            </div>
          </div>

          {/* Bottom subtle note */}
          <div className="relative z-10 text-[11px] text-slate-400 text-center">
            Acesso restrito a administradores autorizados.
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MOBILE HEADER (< 1024px) */}
        {/* ========================================================================= */}
        <div className="lg:hidden relative w-full pt-8 pb-10 px-6 overflow-hidden bg-gradient-to-b from-[#071B3B] via-[#0A2247] to-[#071B3B] text-center flex flex-col items-center">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/samex_music_bg.jpg"
              alt="Instrumentos musicais SAMEX"
              fill
              sizes="100vw"
              className="object-cover object-center opacity-30 mix-blend-luminosity brightness-110"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#071B3B]/90 via-[#071B3B]/70 to-[#071B3B]/95" />
          </div>

          {/* 3D Shield Badge with Checkmark */}
          <div className="relative z-10 p-3 rounded-2xl bg-gradient-to-b from-[#0091FF] via-[#0055EE] to-[#0038A8] shadow-[0_0_25px_rgba(0,145,255,0.6)] border border-[#60A5FA]/60 flex items-center justify-center mb-2.5">
            <svg className="w-9 h-9 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(255,255,255,0.14)" />
              <path d="m9 12 2 2 4-4" stroke="white" strokeWidth="2.5" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <h1 className="text-3xl font-black italic tracking-wider text-white">SAMEX</h1>
            <svg className="w-24 h-2.5 -mt-0.5 text-[#FF6500]" viewBox="0 0 130 14" fill="none">
              <path d="M2 3C32 10 75 12 128 3C90 8 45 9 2 3Z" fill="currentColor" />
            </svg>
          </div>

          <div className="relative z-10 mt-2 px-4 py-0.5 rounded-full bg-[#0D3875] border border-[#1E6FD9]/50 shadow-sm">
            <span className="text-[11px] font-bold text-white tracking-wide">
              Administrador
            </span>
          </div>

          <p className="relative z-10 text-[11px] text-slate-300 font-medium tracking-wide mt-1.5">
            Sistema de Administração Musical de Exames
          </p>

          {/* Curved wave transition to white card */}
          <div className="absolute -bottom-1 left-0 right-0 h-6 z-10 pointer-events-none">
            <svg viewBox="0 0 500 50" preserveAspectRatio="none" className="w-full h-full fill-white">
              <path d="M0,0 C150,50 350,50 500,0 L500,50 L0,50 Z" />
            </svg>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN (FORM CARD AREA - 58%) */}
        {/* ========================================================================= */}
        <div className="w-full lg:w-[58%] px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-10 flex flex-col justify-center bg-white relative z-10">
          
          {/* Top Badge: Blue Shield with Checkmark */}
          <div className="w-14 h-14 bg-white rounded-full border-2 border-blue-100 shadow-[0_6px_20px_rgba(0,102,255,0.18)] flex items-center justify-center -mt-12 sm:-mt-14 lg:mt-0 mb-3 mx-auto z-10 relative">
            <ShieldCheck className="w-7 h-7 text-[#0066FF]" />
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-[28px] font-black text-[#071B3B] text-center tracking-tight">
            Painel Admin
          </h2>

          {/* Decorative Gear with Blue Lines */}
          <div className="flex items-center justify-center gap-3 my-2 w-full max-w-[200px] mx-auto">
            <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent to-[#0066FF]"></div>
            <Settings className="w-4 h-4 text-[#0066FF] shrink-0" />
            <div className="flex-1 h-[2px] bg-gradient-to-l from-transparent to-[#0066FF]"></div>
          </div>

          {/* Subtitle */}
          <p className="text-slate-500 text-xs sm:text-[13px] font-medium text-center mb-6">
            Entre com suas credenciais de acesso
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-5 bg-red-500/10 border border-red-500/30 text-red-600 px-4 py-3 rounded-xl text-sm flex items-start gap-3 animate-in fade-in duration-300">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
              <p className="font-medium text-xs sm:text-sm">{error}</p>
            </div>
          )}

          <form action={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Campo 1: Usuário (Login) */}
            <div>
              <label
                htmlFor="username"
                className="flex items-center gap-2 text-sm font-bold text-[#071B3B] mb-1.5"
              >
                <User className="w-4 h-4 text-[#0066FF]" />
                Usuário (Login)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  name="username"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Digite o nome de usuário"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  className="w-full bg-[#F8FAFD] border border-[#D8E1EF] rounded-xl pl-11 pr-4 py-3 text-sm text-[#071B3B] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/40 focus:border-[#0066FF] transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Campo 2: Senha */}
            <div>
              <label
                htmlFor="password"
                className="flex items-center gap-2 text-sm font-bold text-[#071B3B] mb-1.5"
              >
                <Lock className="w-4 h-4 text-[#0066FF]" />
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  required
                  className="w-full bg-[#F8FAFD] border border-[#D8E1EF] rounded-xl pl-11 pr-11 py-3 text-sm text-[#071B3B] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0066FF]/40 focus:border-[#0066FF] transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Checkbox & Esqueci meus dados */}
            <div className="flex items-center justify-between text-sm pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#D8E1EF] text-[#0066FF] focus:ring-[#0066FF] accent-[#0066FF] cursor-pointer"
                />
                <span className="text-slate-600 group-hover:text-[#071B3B] text-xs sm:text-sm font-medium transition-colors">
                  Lembrar meus dados
                </span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-xs sm:text-sm font-semibold text-[#0066FF] hover:underline transition-colors"
              >
                Esqueci meus dados?
              </button>
            </div>

            {/* Botão Acessar Sistema */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#0055FF] to-[#0070F3] hover:from-[#0048e0] hover:to-[#0060d6] text-white font-bold py-3.5 px-6 rounded-xl shadow-[0_8px_20px_-4px_rgba(0,102,255,0.45)] hover:shadow-[0_12px_24px_-4px_rgba(0,102,255,0.6)] active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              <Lock className="w-4 h-4" />
              <span>{loading ? "Autenticando..." : "Acessar Sistema"}</span>
              {!loading && <ArrowRight className="w-4 h-4 ml-auto" />}
            </button>

            {/* Divisor Verificação de Segurança */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-[1px] bg-slate-200"></div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Verificação de Segurança
              </span>
              <div className="flex-1 h-[1px] bg-slate-200"></div>
            </div>

            {/* Google reCAPTCHA */}
            <div className="flex justify-center w-full my-2">
              <div className="overflow-hidden rounded-xl border border-slate-200/80 shadow-sm max-w-full">
                <div className="origin-top transform sm:scale-100 scale-[0.84]">
                  <ReCAPTCHA
                    sitekey={siteKey}
                    onChange={(token) => setRecaptchaToken(token)}
                    theme="light"
                  />
                </div>
              </div>
            </div>

            {/* Botão Voltar para o Portal do Encarregado */}
            <div className="pt-2">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 w-full bg-[#F8FAFD] hover:bg-slate-100 border border-[#D8E1EF] hover:border-slate-300 rounded-xl py-3 px-4 text-xs sm:text-sm font-semibold text-[#071B3B] transition-all shadow-sm group"
              >
                <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-1 transition-transform" />
                <span>Voltar para o Portal do Encarregado</span>
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Global Footer */}
      <footer className="mt-8 text-center flex flex-col items-center gap-2 z-10 w-full px-4">
        <div className="flex items-center justify-center gap-2 text-white font-medium text-xs sm:text-sm tracking-wide">
          <span className="text-[#0088FF] text-base">🎵</span>
          <span className="text-slate-200">
            SAMEX <span className="text-slate-400">—</span> Sistema de Administração Musical de Exames
          </span>
        </div>
        <div className="w-48 sm:w-64 h-[1px] bg-gradient-to-r from-transparent via-[#0088FF]/60 to-transparent my-0.5"></div>
        <p className="text-slate-400 text-xs">
          &copy; {currentYear} Todos os direitos reservados.
        </p>
      </footer>

      {/* Modal de Recuperação de Acesso do Administrador */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#0066FF]">
                <Info className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#071B3B]">Acesso Administrativo</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Por motivos de segurança e governança, a recuperação de credenciais de acesso ao <strong>Painel Admin</strong> deve ser realizada pelo superadministrador ou via script seguro de redefinição no servidor do sistema.
            </p>
            <div className="bg-[#F8FAFD] border border-[#D8E1EF] rounded-xl p-3 text-xs text-slate-500 mb-6">
              Caso não se lembre de suas credenciais, contate o responsável pela infraestrutura do SAMEX.
            </div>
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="w-full bg-[#071B3B] hover:bg-[#102B52] text-white font-bold py-3 rounded-xl transition-colors text-sm"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
