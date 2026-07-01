"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, Church, ListMusic, Music, Music2, Users, UserCheck, ChevronDown, FolderOpen, Briefcase, FileSignature, CalendarClock, LogOut, Settings, Menu, X, Activity, UserCog, BookOpen } from "lucide-react";
import clsx from "clsx";
import { useState } from "react";
import { logout } from "@/actions/auth-actions";

const menuGroups = [
  {
    name: "Dashboard",
    items: [
      { name: "Início", href: "/", icon: Home }
    ]
  },
  {
    name: "Cadastros Base",
    icon: FolderOpen,
    items: [
      { name: "Setores", href: "/setores", icon: MapPin },
      { name: "Igrejas", href: "/igrejas", icon: Church },
      { name: "Categorias", href: "/categorias", icon: ListMusic },
      { name: "Instrumentos", href: "/instrumentos", icon: Music },
      { name: "Cargos", href: "/cargos", icon: Briefcase },
      { name: "Tipos de Teste", href: "/tipos-teste", icon: FileSignature },
      { name: "Ministérios", href: "/ministerios", icon: Users },
      { name: "Métodos de Teoria", href: "/metodos-teoria", icon: BookOpen },
      { name: "Métodos de Prática", href: "/metodos-pratica", icon: Music },
    ]
  },
  {
    name: "Agendamentos",
    icon: CalendarClock,
    items: [
      { name: "Cadastro de Teste", href: "/portal/cadastro-teste", icon: CalendarClock },
      { name: "Pedido Pré-Avaliação", href: "/portal/pre-avaliacao", icon: FileSignature }
    ]
  },
  {
    name: "Cadastro Pessoal",
    icon: Users,
    items: [
      { name: "Encarregados", href: "/encarregados", icon: UserCheck },
      { name: "Avaliadores", href: "/avaliadores", icon: Users },
    ]
  },
  {
    name: "Sistema",
    icon: Settings,
    items: [
      { name: "Usuários (Admins)", href: "/usuarios", icon: UserCog },
      { name: "Configurações", href: "/configuracoes", icon: Settings },
      { name: "Logs de Acesso", href: "/logs", icon: Activity },
      { name: "Manual do Sistema", href: "/manual", icon: BookOpen }
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "Cadastros Base": true,
    "Cadastro Pessoal": true,
  });
  const [isOpen, setIsOpen] = useState(false);

  const toggleGroup = (groupName: string) => {
    setOpenGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  };
  
  const closeSidebar = () => setIsOpen(false);

  const [logoError, setLogoError] = useState(false);

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-3">
           {!logoError ? (
             <img src="/api/config/logo" alt="Logo" className="h-8 object-contain" onError={() => setLogoError(true)} />
           ) : (
             <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
               <Music2 className="text-white w-5 h-5" />
             </div>
           )}
           <span className="font-bold text-slate-800 text-sm">Painel Admin</span>
        </div>
        <button onClick={() => setIsOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40" onClick={closeSidebar} />
      )}

      {/* Sidebar Content */}
      <aside className={clsx(
        "w-64 glass h-screen flex flex-col fixed left-0 top-0 border-r border-[rgba(255,255,255,0.1)] z-50 overflow-y-auto transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        
        <div className="p-6 flex items-center justify-center border-b border-slate-200 sticky top-0 bg-white backdrop-blur-md z-10 h-24">
          <div className="md:hidden absolute top-4 right-4 z-50">
            <button onClick={closeSidebar} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
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
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Music2 className="text-white w-7 h-7" />
                </div>
              </div>
            )}
          </div>
        </div>
        
        <nav className="flex-1 p-4 flex flex-col gap-6">
          {menuGroups.map((group) => {
            if (!group.icon) {
              // Render direct items (like Dashboard)
              return (
                <div key={group.name} className="flex flex-col gap-2">
                  {group.items.map(item => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeSidebar}
                        className={clsx(
                          "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                          isActive 
                            ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[inset_0_0_20px_rgba(37,99,235,0.1)]" 
                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                        )}
                      >
                        <Icon className={clsx("w-5 h-5", isActive ? "text-blue-400" : "text-slate-500")} />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              );
            }

            // Render collapsible groups
            const GroupIcon = group.icon;
            const isOpenGroup = openGroups[group.name];
            
            return (
              <div key={group.name} className="flex flex-col">
                <button 
                  onClick={() => toggleGroup(group.name)}
                  className="flex items-center justify-between px-2 py-2 text-slate-600 hover:text-slate-900 transition-colors group mb-2"
                >
                  <div className="flex items-center gap-2">
                    <GroupIcon className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                    <span className="text-xs font-bold uppercase tracking-wider">{group.name}</span>
                  </div>
                  <ChevronDown className={clsx("w-4 h-4 transition-transform duration-300", isOpenGroup ? "rotate-180" : "")} />
                </button>
                
                <div className={clsx("flex flex-col gap-1 overflow-hidden transition-all duration-300 origin-top", isOpenGroup ? "max-h-[500px] opacity-100 scale-y-100" : "max-h-0 opacity-0 scale-y-0")}>
                  {group.items.map(item => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeSidebar}
                        className={clsx(
                          "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300",
                          isActive 
                            ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[inset_0_0_20px_rgba(37,99,235,0.1)]" 
                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                        )}
                      >
                        <Icon className={clsx("w-5 h-5", isActive ? "text-blue-400" : "text-slate-500")} />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <form action={logout}>
            <button type="submit" className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors">
              <LogOut className="w-5 h-5" />
              Sair do Sistema
            </button>
          </form>
        </div>

        <div className="p-4 border-t border-slate-200 text-center text-xs text-slate-500 sticky bottom-0 bg-white backdrop-blur-md">
          &copy; {new Date().getFullYear()} Sistema Musical
        </div>
      </aside>
    </>
  );
}
