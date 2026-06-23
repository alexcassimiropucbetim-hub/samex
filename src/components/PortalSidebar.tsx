"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import clsx from "clsx";
import { logout } from "@/actions/auth-actions"; 
import { NotificationBell } from "./NotificationBell";

export function PortalSidebar({ isRegional }: { isRegional: boolean }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  
  const closeSidebar = () => setIsOpen(false);

  const allItems = [
    ...(isRegional ? [{ name: "Início", href: "/portal", icon: CalendarClock }] : []),
    ...(isRegional ? [{ name: "Agendar Teste", href: "/portal/cadastro-teste", icon: CalendarClock }] : []),
    { name: "Pré-Avaliação", href: "/portal/pre-avaliacao", icon: FileSignature }
  ];

  const menuGroups = [
    {
      name: "Painel do Encarregado",
      icon: CalendarClock,
      items: allItems
    }
  ];

  const [logoError, setLogoError] = useState(false);

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-3">
           {!logoError ? (
             <img src="/api/config/logo" alt="Logo" className="h-8 object-contain" onError={() => setLogoError(true)} />
           ) : (
             <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
               <span className="text-white font-bold text-sm">P</span>
             </div>
           )}
           <span className="font-bold text-slate-800 text-sm">Portal</span>
        </div>
        <div className="flex items-center gap-1">
          <NotificationBell />
          <button onClick={() => setIsOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40" onClick={closeSidebar} />
      )}

      {/* Sidebar Content */}
      <aside className={clsx(
        "w-64 h-screen fixed left-0 top-0 bg-white border-r border-slate-200 flex flex-col z-50 transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-6 flex items-center justify-between border-b border-slate-200 h-24 relative">
          <div className="w-full h-full flex items-center justify-center relative">
            {!logoError && (
              <img 
                src="/api/config/logo" 
                alt="Logo" 
                className="max-w-full max-h-full object-contain z-10"
                onError={() => setLogoError(true)}
              />
            )}
            {logoError && (
              <div className="absolute inset-0 flex items-center justify-center -z-10">
                <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2">
            <NotificationBell />
          </div>

          <div className="md:hidden absolute right-4 top-1/2 -translate-y-1/2">
            <button onClick={closeSidebar} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {menuGroups.map((group) => (
            <div key={group.name} className="space-y-1">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">
                {group.name}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={closeSidebar}
                    className={clsx(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                      isActive 
                        ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" 
                        : "text-slate-500 hover:text-slate-600 hover:bg-slate-100 border border-transparent"
                    )}
                  >
                    <Icon className={clsx("w-5 h-5", isActive ? "text-orange-400" : "text-slate-500 group-hover:text-slate-500")} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        
        <div className="p-4 border-t border-slate-200">
          <form action={logout}>
            <button type="submit" className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors">
              <LogOut className="w-5 h-5" />
              Sair do Sistema
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
