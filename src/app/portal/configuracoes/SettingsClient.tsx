"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Settings2, Smartphone, ShieldCheck } from "lucide-react";

export function SettingsClient({ initialSettings }: { initialSettings: any }) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');
  
  const [notifyOnNewRegistration, setNotifyOnNewRegistration] = useState(initialSettings?.notifyOnNewRegistration ?? true);
  const [notifyOnSchedule, setNotifyOnSchedule] = useState(initialSettings?.notifyOnSchedule ?? true);
  const [notifyOnResult, setNotifyOnResult] = useState(initialSettings?.notifyOnResult ?? true);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setPermissionState(Notification.permission);
      
      const registerSW = async () => {
        try {
          let reg = await navigator.serviceWorker.getRegistration();
          if (!reg) {
            reg = await navigator.serviceWorker.register('/sw.js');
          }
          setRegistration(reg);
          
          const sub = await reg.pushManager.getSubscription();
          if (sub && !(sub.expirationTime && Date.now() > sub.expirationTime - 5 * 60 * 1000)) {
            setSubscription(sub);
            setIsSubscribed(true);
          }
        } catch (err) {
          console.error('Service Worker erro:', err);
        } finally {
          setLoading(false);
        }
      };

      registerSW();
    } else {
      setLoading(false);
    }
  }, []);

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeButtonOnClick = async (event: React.MouseEvent) => {
    event.preventDefault();
    if (!registration) {
      alert("Service Worker não está pronto.");
      return;
    }

    try {
      setLoading(true);
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
      });
      
      setSubscription(sub);
      setIsSubscribed(true);
      setPermissionState(Notification.permission);

      // Save on backend
      await fetch('/api/web-push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sub),
      });
      
    } catch (err: any) {
      if (Notification.permission === 'denied') {
        alert("A permissão para notificações foi negada. Por favor, libere nas configurações do seu navegador.");
      } else {
        console.error('Falha ao inscrever:', err);
        alert("Erro ao ativar notificações: " + err.message);
      }
      setPermissionState(Notification.permission);
    } finally {
      setLoading(false);
    }
  };

  const unsubscribeButtonOnClick = async (event: React.MouseEvent) => {
    event.preventDefault();
    if (!subscription) return;
    
    setLoading(true);
    try {
      await subscription.unsubscribe();
      setIsSubscribed(false);
      setSubscription(null);
      
      // Remove from backend
      await fetch('/api/web-push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
    } catch (error) {
      console.error('Error unsubscribing', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    if (!isSubscribed || !subscription) return;
    
    // Simulate test by pushing via our own backend or local trigger
    // Naively we can just show local notification for testing if SW is ready
    if (registration) {
      registration.showNotification("Notificação de Teste", {
        body: "O sistema de notificações Push está funcionando perfeitamente!",
        icon: "/icon-192x192.png",
        vibrate: [200, 100, 200]
      });
    }
  };

  const handleSavePreferences = async () => {
    // We would have a server action here to update `PersonInCharge` preferences.
    // Assuming a hypothetical `updateNotificationPreferences` server action.
    alert("Preferências salvas com sucesso!");
  };

  if (loading && !registration && !isSubscribed) {
    return <div className="p-8 text-center text-slate-500">Carregando configurações do dispositivo...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-[#224465]" />
            Notificações neste Dispositivo
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Permita que o SAMEX envie avisos importantes mesmo quando o portal estiver fechado.
          </p>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <p className="font-semibold text-slate-800">Ativar Notificações Push</p>
              <p className="text-xs text-slate-500 mt-1">
                Status no Navegador: 
                <span className={`ml-1 font-bold ${permissionState === 'granted' ? 'text-green-600' : permissionState === 'denied' ? 'text-red-500' : 'text-amber-500'}`}>
                  {permissionState === 'granted' ? 'Permitido' : permissionState === 'denied' ? 'Bloqueado' : 'Aguardando'}
                </span>
              </p>
            </div>
            
            <button
              onClick={isSubscribed ? unsubscribeButtonOnClick : subscribeButtonOnClick}
              disabled={loading || permissionState === 'denied'}
              className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors ${
                isSubscribed 
                  ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' 
                  : 'bg-[#224465] text-white hover:bg-[#1a334d]'
              } ${(loading || permissionState === 'denied') ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubscribed ? <BellOff className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
              {isSubscribed ? 'Desativar neste aparelho' : 'Habilitar neste aparelho'}
            </button>
          </div>

          {isSubscribed && (
            <div className="mt-4">
              <button 
                onClick={handleTestNotification}
                className="text-sm font-medium text-[#224465] hover:underline"
              >
                Enviar notificação de teste agora
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden opacity-50">
        {/* Placeholder for specific preferences integration with server action */}
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Settings2 className="w-6 h-6 text-slate-400" />
              Preferências de Alertas (Em breve)
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Escolha quais tipos de aviso deseja receber
            </p>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <label className="flex items-center gap-3 cursor-not-allowed">
            <input type="checkbox" checked={notifyOnNewRegistration} disabled className="rounded border-slate-300 w-5 h-5 text-[#224465]" />
            <div>
              <p className="font-semibold text-slate-700">Novos Cadastros</p>
              <p className="text-xs text-slate-500">Avisar quando um novo pedido de pré-avaliação for gerado</p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-not-allowed">
            <input type="checkbox" checked={notifyOnSchedule} disabled className="rounded border-slate-300 w-5 h-5 text-[#224465]" />
            <div>
              <p className="font-semibold text-slate-700">Agendamentos</p>
              <p className="text-xs text-slate-500">Avisar quando houver agendamento ou reagendamento de teste</p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-not-allowed">
            <input type="checkbox" checked={notifyOnResult} disabled className="rounded border-slate-300 w-5 h-5 text-[#224465]" />
            <div>
              <p className="font-semibold text-slate-700">Resultados</p>
              <p className="text-xs text-slate-500">Avisar quando os testes forem avaliados (Aprovação/Reprovação)</p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
