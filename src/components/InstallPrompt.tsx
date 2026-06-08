"use client";

import { useState, useEffect } from "react";
import { Download, X, Share, PlusSquare } from "lucide-react";

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if it is already installed (standalone mode)
    const isStandaloneMode = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone;
    setIsStandalone(!!isStandaloneMode);

    // Detect iOS
    const ua = window.navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Listen for the beforeinstallprompt event (Android / Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isStandaloneMode) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // If it's iOS and not standalone, we can optionally show the prompt
    // But let's only show it if the user hasn't dismissed it
    const hasDismissed = localStorage.getItem("installPromptDismissed");
    if (isIOSDevice && !isStandaloneMode && !hasDismissed) {
      setShowPrompt(true);
    } else if (!isIOSDevice && !isStandaloneMode && !hasDismissed) {
      // For Android, we rely on the beforeinstallprompt event above
      // But just in case, we check local storage too
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      setShowPrompt(false);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSInstructions(false);
    localStorage.setItem("installPromptDismissed", "true");
  };

  if (isStandalone) return null;

  return (
    <>
      {showPrompt && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 flex items-center justify-between animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Instalar Aplicativo</p>
              <p className="text-xs text-slate-500 leading-tight mt-0.5">Adicione à tela inicial para acesso rápido e offline.</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 ml-4 shrink-0">
            <button 
              onClick={handleInstallClick}
              className="bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              Instalar
            </button>
            <button 
              onClick={handleDismiss}
              className="text-slate-400 hover:text-slate-600 text-xs transition-colors"
            >
              Agora não
            </button>
          </div>
        </div>
      )}

      {showIOSInstructions && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in slide-in-from-bottom-10 sm:zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Instalar no iPhone</h3>
              <button onClick={handleDismiss} className="text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full p-1.5">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-slate-600">Para instalar este aplicativo no seu iPhone ou iPad, siga os passos abaixo:</p>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-slate-100 text-blue-500 rounded-xl flex items-center justify-center shrink-0">
                  <Share className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">1. Toque em Compartilhar</p>
                  <p className="text-xs text-slate-500 mt-1">Encontre este ícone na barra inferior do Safari.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center shrink-0">
                  <PlusSquare className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">2. Adicionar à Tela de Início</p>
                  <p className="text-xs text-slate-500 mt-1">Role o menu para baixo e selecione esta opção.</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setShowIOSInstructions(false)}
              className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-xl transition-all"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
}
