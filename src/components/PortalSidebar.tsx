"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileSignature, CalendarClock, LogOut } from "lucide-react";
import clsx from "clsx";
import { logout } from "@/actions/auth-actions"; 

export function PortalSidebar({ isRegional }: { isRegional: boolean }) {
  const pathname = usePathname();

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
    <aside className="w-64 h-screen fixed left-0 top-0 bg-white border-r border-slate-200 flex flex-col">
      <div className="p-6 flex items-center justify-center border-b border-slate-200 h-24">
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
  );
}
