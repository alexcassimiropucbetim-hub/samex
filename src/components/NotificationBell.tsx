"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check } from "lucide-react";
import { 
  getUnreadNotifications, 
  markNotificationAsRead, 
  markAllAsRead 
} from "@/actions/notification";

import clsx from "clsx";

type NotificationType = {
  id: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
};

export function NotificationBell({ align = "right" }: { align?: "left" | "right" }) {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [permissionState, setPermissionState] = useState<NotificationPermission | "default">("default");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousCountRef = useRef<number>(0);
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermissionState(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const perm = await Notification.requestPermission();
      setPermissionState(perm);
      
      // Unlocks audio context on user interaction
      if (audioRef.current) {
        audioRef.current.volume = 0.01;
        audioRef.current.play().then(() => {
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.volume = 1;
          }
        }).catch(() => {});
      }
    }
  };

  const loadNotifications = async () => {
    try {
      const data = await getUnreadNotifications();
      if (Array.isArray(data)) {
        setNotifications(data);
        
        // Check for new notifications
        if (!isFirstLoad.current && data.length > previousCountRef.current) {
          const newCount = data.length - previousCountRef.current;
          
          // Play sound
          if (audioRef.current) {
            audioRef.current.play().catch(e => console.log("Audio play prevented:", e));
          }

          // Vibrate if supported (mobile)
          if (typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
          }

          // Show native notification
          if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
            const newNotifs = data.slice(0, newCount);
            newNotifs.forEach(notif => {
              new Notification("SAMEX - Nova Notificação", {
                body: notif.message,
                icon: "/icon-192x192.png",
              });
            });
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
      
      {permissionState === "default" && (
        <div className="absolute right-0 top-12 w-64 bg-orange-500 text-white text-xs p-3 rounded-xl shadow-lg z-50 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
          <p className="font-medium">Ative as notificações para receber alertas sonoros e visuais.</p>
          <div className="flex justify-end gap-2 mt-1">
            <button onClick={() => setPermissionState("denied")} className="px-2 py-1 bg-orange-600 hover:bg-orange-700 rounded transition-colors">Agora não</button>
            <button onClick={requestNotificationPermission} className="px-2 py-1 bg-white text-orange-600 font-bold rounded hover:bg-orange-50 transition-colors">Ativar</button>
          </div>
        </div>
      )}

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
          <div className={clsx(
            "absolute mt-2 w-80 bg-white rounded-xl shadow-lg shadow-slate-200/50 border border-slate-200 overflow-hidden z-50",
            align === "right" ? "right-0" : "left-0"
          )}>
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
