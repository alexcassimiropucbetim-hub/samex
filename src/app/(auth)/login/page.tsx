"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { loginEncarregado } from "@/actions/auth";
import {
  Music,
  ShieldCheck,
  Users,
  User,
  Lock,
  ArrowRight,
  IdCard,
  Shield,
  Calendar,
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

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "6LeQkxUtAAAAAMo1Qv5ZcYC3FfDtYrusy2Ivrfgh";
  const [churchSelectionOptions, setChurchSelectionOptions] = useState<any[]>([]);
  const [tempCredentials, setTempCredentials] = useState<{ password: string; cardNumber: string } | null>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  const [cardNumber, setCardNumber] = useState("");
  const [username, setUsername] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Carregar carteirinha salva se houver
  useEffect(() => {
    try {
      const savedCard = localStorage.getItem("samex_remember_card");
      if (savedCard) {
        setCardNumber(savedCard);
        setRememberMe(true);
      }
    } catch {
      // Ignora erro caso localStorage esteja restrito
    }
  }, []);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    // Salvar ou remover número da carteirinha no localStorage (nunca senha/usuário)
    try {
      if (rememberMe && cardNumber.trim()) {
        localStorage.setItem("samex_remember_card", cardNumber.trim());
      } else {
        localStorage.removeItem("samex_remember_card");
      }
    } catch {
      // Ignora erro de localStorage
    }

    if (churchSelectionOptions.length === 0) {
      if (!recaptchaToken) {
        setError("Confirme que você não é um robô antes de prosseguir.");
        setLoading(false);
        return;
      }
      formData.append("recaptchaToken", recaptchaToken);
    }

    // Se estivermos na etapa de selecionar a igreja
    if (churchSelectionOptions.length > 0 && tempCredentials) {
      const finalFormData = new FormData();
      finalFormData.append("cardNumber", tempCredentials.cardNumber);
      finalFormData.append("password", tempCredentials.password);
      finalFormData.append("login", tempCredentials.password);
      finalFormData.append("selectedChurchId", formData.get("selectedChurchId") as string);

      const result = await loginEncarregado(finalFormData);
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
      return;
    }

    // Garantir que os campos cheguem à server action
    formData.set("cardNumber", cardNumber.trim());
    formData.set("login", username.trim());
    formData.set("password", username.trim());

    const result = await loginEncarregado(formData);

    if (result?.requireChurchSelection) {
      setChurchSelectionOptions(result.churches || []);
      setTempCredentials({
        cardNumber: cardNumber.trim(),
        password: username.trim(),
      });
      setLoading(false);
    } else if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-[#071B3B] flex flex-col justify-between items-center px-4 py-6 sm:py-10 relative overflow-x-hidden selection:bg-[#FF6500] selection:text-white font-sans">
      {/* Background radial atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(16,43,82,0.7)_0%,rgba(7,27,59,1)_100%)] pointer-events-none"></div>

      {/* Main Container Card */}
      <div className="w-full max-w-[1020px] rounded-[24px] sm:rounded-[28px] overflow-hidden shadow-[0_25px_65px_-12px_rgba(0,0,0,0.85),0_0_35px_rgba(255,101,0,0.12)] border border-[#FF6500]/30 bg-white relative flex flex-col lg:flex-row my-auto z-10">
        
        {/* ========================================================================= */}
        {/* DESKTOP LEFT COLUMN (42%) */}
        {/* ========================================================================= */}
        <div className="hidden lg:flex lg:w-[42%] relative overflow-hidden bg-gradient-to-br from-[#071B3B] via-[#0A2247] to-[#071B3B] p-8 sm:p-10 flex-col justify-between text-white z-0">
          {/* Background image: instrument of brass & clarinet over sheet music */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/samex_music_bg.jpg"
              alt="Instrumentos musicais e partitura SAMEX"
              fill
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover object-bottom opacity-35 mix-blend-luminosity brightness-110 contrast-125"
              priority
            />
            {/* Gradients to blend smoothly with navy brand */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#071B3B] via-[#071B3B]/60 to-[#071B3B]/90" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#071B3B]/95 via-transparent to-[#071B3B]/90" />
          </div>

          {/* S-Curve divider transition on the right */}
          <svg
            className="absolute top-0 -right-[1px] h-full w-14 z-20 pointer-events-none"
            viewBox="0 0 50 640"
            preserveAspectRatio="none"
            fill="none"
          >
            <path
              d="M 50 0 C 12 140, 12 260, 30 360 C 48 460, 18 540, 50 640"
              stroke="#FF6500"
              strokeWidth="3.5"
              className="drop-shadow-[0_0_8px_rgba(255,101,0,0.9)]"
            />
            <path
              d="M 50 0 C 12 140, 12 260, 30 360 C 48 460, 18 540, 50 640 L 50 640 L 50 0 Z"
              fill="#FFFFFF"
            />
          </svg>

          {/* Top Brand Section */}
          <div className="relative z-10 flex flex-col items-start">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF8500] to-[#FF5500] p-[1px] shadow-[0_8px_20px_rgba(255,101,0,0.45)] flex items-center justify-center mb-3 ring-1 ring-white/20">
              <Music className="w-7 h-7 text-white drop-shadow" />
            </div>

            <div className="flex flex-col items-start">
              <h1 className="text-4xl font-black italic tracking-wider text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                SAMEX
              </h1>
              {/* Orange swoosh curve */}
              <svg className="w-32 h-3.5 -mt-1 text-[#FF6500]" viewBox="0 0 130 14" fill="none">
                <path d="M2 3C32 10 75 12 128 3C90 8 45 9 2 3Z" fill="currentColor" />
              </svg>
            </div>

            <p className="text-xs text-slate-300 font-medium tracking-wide mt-2">
              Sistema de Administração Musical de Exames
            </p>
          </div>

          {/* Middle 3 Features */}
          <div className="relative z-10 space-y-3.5 my-8">
            {/* Feature 1 */}
            <div className="bg-[#071B3B]/75 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex items-center gap-3.5 shadow-sm hover:border-[#FF6500]/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#FF6500]/15 border border-[#FF6500]/30 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-[#FF8500]" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-white leading-tight">Agendamentos</h4>
                <p className="text-xs text-slate-300">Exames e Ensaios</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#071B3B]/75 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex items-center gap-3.5 shadow-sm hover:border-[#FF6500]/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#FF6500]/15 border border-[#FF6500]/30 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-[#FF8500]" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-white leading-tight">Organização</h4>
                <p className="text-xs text-slate-300">por Setor, Administração e Igreja</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#071B3B]/75 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex items-center gap-3.5 shadow-sm hover:border-[#FF6500]/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-[#FF6500]/15 border border-[#FF6500]/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#FF8500]" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-white leading-tight">Segurança</h4>
                <p className="text-xs text-slate-300">Controle e acesso exclusivo</p>
              </div>
            </div>
          </div>

          {/* Bottom subtle note */}
          <div className="relative z-10 text-[11px] text-slate-400">
            Ambiente ministerial seguro e monitorado.
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

          <div className="relative z-10 flex flex-col items-center">
            {/* Orange glowing app squircle */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FF8500] to-[#FF5500] shadow-[0_6px_20px_rgba(255,101,0,0.45)] flex items-center justify-center mb-2.5 ring-1 ring-white/20">
              <Music className="w-7 h-7 text-white drop-shadow" />
            </div>

            {/* SAMEX Logo with orange swoosh */}
            <h1 className="text-3xl font-black italic tracking-wider text-white">SAMEX</h1>
            <svg className="w-28 h-3 -mt-0.5 text-[#FF6500]" viewBox="0 0 130 14" fill="none">
              <path d="M2 3C32 10 75 12 128 3C90 8 45 9 2 3Z" fill="currentColor" />
            </svg>
            <p className="text-xs text-slate-300 font-medium tracking-wide mt-2">
              Sistema de Administração Musical de Exames
            </p>
          </div>

          {/* Smooth curved bottom divider with orange highlight */}
          <div className="absolute -bottom-[1px] left-0 right-0 z-10 pointer-events-none">
            <svg
              className="w-full h-8 block"
              viewBox="0 0 400 32"
              preserveAspectRatio="none"
              fill="none"
            >
              <path
                d="M 0 0 C 120 28, 280 28, 400 0 L 400 32 L 0 32 Z"
                fill="#FFFFFF"
              />
              <path
                d="M 0 0 C 120 28, 280 28, 400 0"
                stroke="#FF6500"
                strokeWidth="3"
                className="drop-shadow-[0_0_6px_rgba(255,101,0,0.8)]"
              />
            </svg>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN (FORM CARD AREA - 58%) */}
        {/* ========================================================================= */}
        <div className="w-full lg:w-[58%] px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-10 flex flex-col justify-center bg-white relative z-10">
          
          {/* Users Icon Badge */}
          <div className="w-14 h-14 bg-white rounded-full border-2 border-[#FF6500]/25 shadow-[0_6px_20px_rgba(255,101,0,0.18)] flex items-center justify-center -mt-12 sm:-mt-14 lg:mt-0 mb-3 mx-auto z-10 relative">
            <Users className="w-7 h-7 text-[#FF6500]" />
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-[28px] font-black text-[#071B3B] text-center tracking-tight">
            Portal do Encarregado
          </h2>

          {/* Decorative Treble Clef between orange lines */}
          <div className="flex items-center justify-center gap-3 my-2 w-full max-w-[240px] mx-auto">
            <div className="flex-1 h-[1.5px] bg-gradient-to-r from-transparent to-[#FF6500]"></div>
            <TrebleClef className="w-4 h-6 text-[#FF6500] shrink-0" />
            <div className="flex-1 h-[1.5px] bg-gradient-to-l from-transparent to-[#FF6500]"></div>
          </div>

          {/* Subtitle */}
          <p className="text-slate-500 text-xs sm:text-[13px] font-medium text-center mb-6">
            Acesso exclusivo para Encarregados e Examinadoras
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-5 bg-red-500/10 border border-red-500/30 text-red-600 px-4 py-3 rounded-xl text-sm flex items-start gap-3 animate-in fade-in duration-300">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
              <p className="font-medium text-xs sm:text-sm">{error}</p>
            </div>
          )}

          {/* Multi-church Selection Flow */}
          {churchSelectionOptions.length > 0 ? (
            <form action={handleSubmit} className="space-y-4 animate-in slide-in-from-right-8 duration-500">
              <div>
                <label className="block text-sm font-bold text-[#071B3B] mb-2">
                  Selecione a Igreja de Atuação
                </label>
                <select
                  name="selectedChurchId"
                  required
                  defaultValue=""
                  className="w-full bg-[#F8FAFD] border border-[#D8E1EF] rounded-xl px-4 py-3 text-[#071B3B] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6500]/40 focus:border-[#FF6500] transition-all shadow-sm uppercase font-semibold"
                >
                  <option value="" disabled>Selecione uma igreja...</option>
                  {churchSelectionOptions.map((church) => (
                    <option key={church.id} value={church.id}>
                      {church.name.toUpperCase()}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-2">
                  Você possui acesso a múltiplas congregações. Escolha qual deseja administrar.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#FF6500] to-[#FF8500] hover:from-[#e55a00] hover:to-[#ff7500] text-white font-bold py-3.5 px-6 rounded-xl shadow-[0_8px_20px_-4px_rgba(255,101,0,0.45)] hover:shadow-[0_12px_24px_-4px_rgba(255,101,0,0.6)] active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
              >
                <Lock className="w-4 h-4" />
                <span>{loading ? "Acessando..." : "Confirmar Acesso"}</span>
                {!loading && <ArrowRight className="w-4 h-4 ml-auto" />}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setChurchSelectionOptions([]);
                  setTempCredentials(null);
                  setError(null);
                }}
                className="w-full bg-[#F8FAFD] hover:bg-slate-100 text-slate-600 font-semibold py-2.5 rounded-xl transition-all border border-[#D8E1EF] text-sm"
              >
                Voltar
              </button>
            </form>
          ) : (
            <form action={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Campo 1: Número da Carteirinha */}
              <div>
                <label
                  htmlFor="cardNumber"
                  className="flex items-center gap-2 text-sm font-bold text-[#071B3B] mb-1.5"
                >
                  <span className="w-6 h-6 rounded-md bg-[#FF6500]/10 border border-[#FF6500]/30 flex items-center justify-center text-[#FF6500]">
                    <IdCard className="w-3.5 h-3.5" />
                  </span>
                  Número da Carteirinha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <IdCard className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    name="cardNumber"
                    id="cardNumber"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="Digite o número da sua carteirinha"
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                    className="w-full bg-[#F8FAFD] border border-[#D8E1EF] rounded-xl pl-11 pr-4 py-3 text-sm text-[#071B3B] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF6500]/40 focus:border-[#FF6500] transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Campo 2: Usuário */}
              <div>
                <label
                  htmlFor="username"
                  className="flex items-center gap-2 text-sm font-bold text-[#071B3B] mb-1.5"
                >
                  <span className="w-6 h-6 rounded-md bg-[#FF6500]/10 border border-[#FF6500]/30 flex items-center justify-center text-[#FF6500]">
                    <User className="w-3.5 h-3.5" />
                  </span>
                  Usuário
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    name="login"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Digite seu usuário"
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                    className="w-full bg-[#F8FAFD] border border-[#D8E1EF] rounded-xl pl-11 pr-4 py-3 text-sm text-[#071B3B] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF6500]/40 focus:border-[#FF6500] transition-all shadow-sm"
                  />
                </div>
              </div>

              {/* Checkbox & Esqueci meus dados */}
              <div className="flex items-center justify-between text-sm pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[#D8E1EF] text-[#FF6500] focus:ring-[#FF6500] accent-[#FF6500] cursor-pointer"
                  />
                  <span className="text-slate-600 group-hover:text-[#071B3B] text-xs sm:text-sm font-medium transition-colors">
                    Lembrar meus dados
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs sm:text-sm font-semibold text-[#FF6500] hover:text-[#FF8500] transition-colors underline-offset-2 hover:underline"
                >
                  Esqueci meus dados?
                </button>
              </div>

              {/* Botão Entrar no Portal */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#FF6500] to-[#FF8500] hover:from-[#e55a00] hover:to-[#ff7500] text-white font-bold py-3.5 px-6 rounded-xl shadow-[0_8px_20px_-4px_rgba(255,101,0,0.45)] hover:shadow-[0_12px_24px_-4px_rgba(255,101,0,0.6)] active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
              >
                <Lock className="w-4 h-4" />
                <span className="text-sm sm:text-base font-bold">
                  {loading ? "Acessando..." : "Entrar no Portal"}
                </span>
                {!loading && <ArrowRight className="w-4 h-4 ml-auto" />}
              </button>

              {/* Divisor Verificação de Segurança */}
              <div className="relative flex items-center justify-center my-4 pt-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#D8E1EF]"></div>
                </div>
                <div className="relative px-3 bg-white text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Verificação de Segurança
                </div>
              </div>

              {/* reCAPTCHA Responsivo (sem rolagem horizontal) */}
              <div className="flex justify-center w-full overflow-hidden min-h-[78px]">
                <div className="transform scale-[0.9] sm:scale-100 origin-center">
                  <ReCAPTCHA
                    sitekey={siteKey}
                    onChange={(token) => setRecaptchaToken(token)}
                    theme="light"
                  />
                </div>
              </div>

              {/* Botão Acesso Restrito ao Administrador */}
              <div className="pt-1">
                <Link
                  href="/admin-login"
                  className="flex items-center justify-between w-full bg-[#F8FAFD] hover:bg-slate-100 border border-[#D8E1EF] hover:border-slate-300 rounded-xl py-3 px-4 text-xs sm:text-sm font-semibold text-[#071B3B] transition-all shadow-sm group"
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-slate-500 group-hover:text-[#FF6500] transition-colors" />
                    <span>Acesso Restrito ao Administrador</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#071B3B] group-hover:translate-x-0.5 transition-all" />
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Global Footer */}
      <footer className="mt-8 text-center flex flex-col items-center gap-2 z-10 w-full px-4">
        <div className="flex items-center justify-center gap-2 text-white font-medium text-xs sm:text-sm tracking-wide">
          <span className="text-[#FF8500] text-base">🎵</span>
          <span className="text-slate-200">
            SAMEX <span className="text-slate-400">—</span> Sistema de Administração Musical de Exames
          </span>
        </div>
        <div className="w-48 sm:w-64 h-[1px] bg-gradient-to-r from-transparent via-[#FF6500]/60 to-transparent my-0.5"></div>
        <p className="text-slate-400 text-xs">
          &copy; {currentYear} Todos os direitos reservados.
        </p>
      </footer>

      {/* Modal de Recuperação de Senha */}
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
              <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#FF6500]">
                <Info className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#071B3B]">Recuperação de Acesso</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Por motivos de segurança e integridade do sistema, a recuperação de usuário e redefinição de dados de acesso ao <strong>Portal do Encarregado</strong> devem ser solicitadas diretamente ao <strong>Administrador Musical</strong> da sua Administração ou Setor.
            </p>
            <div className="bg-[#F8FAFD] border border-[#D8E1EF] rounded-xl p-3 text-xs text-slate-500 mb-6">
              Tenha em mãos o seu <strong>número de carteirinha</strong> ao entrar em contato com o responsável.
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
