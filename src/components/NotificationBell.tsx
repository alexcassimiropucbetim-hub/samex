"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check } from "lucide-react";
import { 
  getUnreadNotifications, 
  markNotificationAsRead, 
  markAllAsRead 
} from "@/actions/notification";

type NotificationType = {
  id: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousCountRef = useRef<number>(0);
  const isFirstLoad = useRef(true);

  const loadNotifications = async () => {
    try {
      const data = await getUnreadNotifications();
      if (Array.isArray(data)) {
        setNotifications(data);
        
        // Toca o som apenas se o número de notificações aumentou E não for o primeiro carregamento
        if (!isFirstLoad.current && data.length > previousCountRef.current) {
          if (audioRef.current) {
            audioRef.current.play().catch(e => console.log("Audio play prevented:", e));
          }
        }
        
        previousCountRef.current = data.length;
        isFirstLoad.current = false;
      }
    } catch (error) {
      console.error("Failed to load notifications", error);
    }
  };

  useEffect(() => {
    // Carregar na montagem
    loadNotifications();
    
    // Polling a cada 30 segundos
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    previousCountRef.current = Math.max(0, previousCountRef.current - 1);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    setNotifications([]);
    previousCountRef.current = 0;
  };

  return (
    <div className="relative">
      <audio ref={audioRef} src="/notification.wav" preload="auto" />
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 rounded-full transition-colors flex items-center justify-center"
        aria-label="Notificações"
      >
        <Bell className="w-5 h-5" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg shadow-slate-200/50 border border-slate-200 overflow-hidden z-50">
            <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <h3 className="font-semibold text-slate-800 text-sm">Notificações</h3>
              {notifications.length > 0 && (
                <button 
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-orange-500 hover:text-orange-600 font-medium transition-colors"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>
            
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <Bell className="w-8 h-8 mx-auto text-slate-200 mb-2" />
                  <p className="text-sm text-slate-500 font-medium">Nenhuma notificação</p>
                  <p className="text-xs text-slate-400 mt-1">Você está em dia!</p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {notifications.map((notif) => (
                    <li key={notif.id} className="p-3 hover:bg-slate-50 transition-colors flex gap-3 group">
                      <div className="mt-1">
                        <div className="w-2 h-2 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-700 leading-snug">{notif.message}</p>
                        <span className="text-xs text-slate-400 mt-1.5 block">
                          {new Date(notif.createdAt).toLocaleDateString('pt-BR')} às {new Date(notif.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="opacity-0 group-hover:opacity-100 self-center p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                        title="Marcar como lida"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
