import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, BookOpen, Calendar, Music, Sun, Moon, LogOut, 
  LayoutGrid, Radio, Heart, ClipboardList, MessageSquare, 
  MapPin, Megaphone, Shield, User
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../lib/utils';

export default function MainLayout() {
  const { profile, user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fecha o menu mobile sempre que a rota mudar E sobe a página para o topo
  useEffect(() => {
    setIsMobileMenuOpen(false);
    // Força a janela a voltar para o topo sempre que a rota (página) mudar
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  // =========================================================================
  // LÓGICA DE PERMISSÕES (ROLES & MINISTRIES)
  // =========================================================================
  const userRole = profile?.role || 'membro'; 
  const userMinistries = profile?.ministries || []; 

  // =========================================================================
  // GARANTIA DE NOME E CARGO FORMATADOS
  // =========================================================================
  // Tenta pegar o nome do perfil, se falhar pega direto dos metadados do login
  const displayName = profile?.full_name || profile?.name || user?.user_metadata?.full_name || 'Utilizador';
  const firstLetter = displayName.charAt(0).toUpperCase();

  // Traduz o cargo do banco para um nome bonito na tela
  const rolesMapText = {
    admin: 'Administrador',
    pastor: 'Pastor',
    lider: 'Líder',
    membro: 'Membro',
  };
  const displayRole = rolesMapText[userRole] || 'Membro';

  const allPages = [
    { id: 'dashboard', path: '/dashboard', name: 'Início', icon: Home, roles: ['admin', 'pastor', 'lider', 'membro'] },
    { id: 'bible', path: '/bible', name: 'Bíblia', icon: BookOpen, roles: ['admin', 'pastor', 'lider', 'membro'] },
    { id: 'events', path: '/events', name: 'Agenda', icon: Calendar, roles: ['admin', 'pastor', 'lider', 'membro'] },
    { id: 'live', path: '/live', name: 'Ao Vivo', icon: Radio, roles: ['admin', 'pastor', 'lider', 'membro'] },
    { id: 'devotional', path: '/devotional', name: 'Devocional', icon: Heart, roles: ['admin', 'pastor', 'lider', 'membro'] },
    { id: 'schedules', path: '/schedules', name: 'Escalas', icon: ClipboardList, roles: ['admin', 'pastor', 'lider', 'membro'] },
    { id: 'chat', path: '/chat', name: 'Mensagens', icon: MessageSquare, roles: ['admin', 'pastor', 'lider', 'membro'] },
    { id: 'location', path: '/location', name: 'Localização', icon: MapPin, roles: ['admin', 'pastor', 'lider', 'membro'] },
    { id: 'announcements', path: '/announcements', name: 'Avisos', icon: Megaphone, roles: ['admin', 'pastor', 'lider', 'membro'] },
    
    // Funcionalidades Restritas
    { id: 'worship', path: '/worship', name: 'Louvor', icon: Music, roles: ['admin', 'pastor'], ministries: ['louvor'] },
    { id: 'admin', path: '/admin', name: 'Painel Admin', icon: Shield, roles: ['admin', 'pastor'] },
  ];

  // Filtra as páginas consoante o acesso do utilizador
  const filteredNavigation = allPages.filter(page => {
    const hasRoleAccess = page.roles ? page.roles.includes(userRole) : true;
    const hasMinistryAccess = page.ministries 
      ? page.ministries.some(m => userMinistries.includes(m)) || ['admin', 'pastor'].includes(userRole)
      : true;

    return hasRoleAccess && hasMinistryAccess;
  });

  // =========================================================================
  // BOTÕES DA BARRA INFERIOR MOBILE (Fixos)
  // =========================================================================
  const mobilePrimaryNav = [
    { id: 'dashboard', path: '/dashboard', name: 'Início', icon: Home },
    { id: 'events', path: '/events', name: 'Agenda', icon: Calendar },
    { id: 'menu', name: 'Menu', icon: LayoutGrid, isToggle: true }, // Botão Central Expansivo
    { id: 'bible', path: '/bible', name: 'Bíblia', icon: BookOpen },
    { id: 'profile', path: '/profile', name: 'Perfil', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex text-slate-900 dark:text-slate-50 font-sans">
      
      {/* =========================================================
          SIDEBAR (Visível apenas em Desktop)
          ========================================================= */}
      <aside className="hidden md:flex w-72 flex-col fixed h-screen p-4 z-20">
        <div className="flex-1 flex flex-col bg-white/60 dark:bg-slate-900/50 backdrop-blur-2xl border border-slate-200/50 dark:border-white/5 rounded-3xl shadow-2xl overflow-hidden">
          
          <div className="p-6 flex items-center gap-4">
            <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/30">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Painel de Membros</h1>
              <BadgeRole role={userRole} />
            </div>
          </div>

          <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto scroll-smooth [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-transparent dark:[&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname.includes(item.path);
              return (
                <button
                  key={item.id} onClick={() => navigate(item.path)}
                  className={cn("w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group",
                    isActive ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" : "text-slate-600 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:bg-white/5"
                  )}
                >
                  <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-slate-400")} />
                  {item.name}
                </button>
              );
            })}
          </nav>

          {/* User Profile Footer (Desktop) */}
          <div className="p-4 mt-auto border-t border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" onClick={() => navigate('/profile')}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-inner shrink-0">
                {firstLetter}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-bold truncate text-slate-900 dark:text-white">{displayName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{displayRole}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-3 px-2">
               <button onClick={toggleTheme} className="flex-1 flex justify-center p-2 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 shadow-sm border border-slate-200 dark:border-white/5 transition-colors">
                 {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
               </button>
               <button onClick={signOut} className="flex-1 flex justify-center p-2 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 shadow-sm border border-red-100 dark:border-red-500/20 transition-colors">
                 <LogOut className="w-4 h-4" />
               </button>
            </div>
          </div>
        </div>
      </aside>

      {/* =========================================================
          MAIN CONTENT AREA
          ========================================================= */}
      <main className="flex-1 md:pl-[19rem] flex flex-col min-h-screen relative">
        
        {/* Mobile Header (Fallback) */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-2 rounded-lg"><Home className="w-5 h-5 text-white" /></div>
            <span className="font-bold text-lg tracking-tight">Painel de Membros</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs shadow-inner cursor-pointer shrink-0" onClick={() => navigate('/profile')}>
            {firstLetter}
          </div>
        </header>

        {/* Rotas Renderizadas Aqui */}
        <div className="flex-1 p-4 md:p-8 md:pt-10 max-w-7xl mx-auto w-full pb-28 md:pb-8">
          <Outlet />
        </div>

        {/* =========================================================
            MENU EXPANSIVO MOBILE (Bottom Sheet)
            ========================================================= */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex flex-col justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileMenuOpen(false)}></div>
            <div className="relative bg-white dark:bg-slate-900 w-full rounded-t-3xl shadow-2xl pb-28 animate-in slide-in-from-bottom-full duration-300 ease-out border-t border-slate-200 dark:border-white/10">
              
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mt-4 mb-6"></div>
              
              <div className="px-6 mb-4 flex justify-between items-center">
                <h3 className="font-bold text-xl text-slate-900 dark:text-white">Explorar</h3>
                <div className="flex gap-2">
                  <button onClick={toggleTheme} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>
                  <button onClick={signOut} className="p-2 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-y-6 gap-x-2 px-4 max-h-[50vh] mb-7 mt-7 overflow-y-auto">
                {filteredNavigation.map((item) => (
                  <button 
                    key={item.id} 
                    onClick={() => navigate(item.path)} 
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform active:scale-90 shadow-sm border",
                      location.pathname.includes(item.path) 
                        ? "bg-indigo-600 border-indigo-500 shadow-indigo-500/30" 
                        : "bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-white/5 group-hover:border-indigo-500/30"
                    )}>
                      <item.icon className={cn("w-6 h-6", location.pathname.includes(item.path) ? "text-white" : "text-slate-600 dark:text-slate-400")} />
                    </div>
                    <span className="text-[11px] font-semibold text-center leading-tight text-slate-600 dark:text-slate-400 max-w-[70px] truncate">
                      {item.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            BOTTOM NAVIGATION BAR (Fixo Mobile)
            ========================================================= */}
        <nav className="md:hidden fixed bottom-6 left-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 rounded-3xl shadow-2xl z-50 px-2 py-2">
          <div className="flex justify-between items-center relative">
            {mobilePrimaryNav.map((item) => {
              const isActive = location.pathname.includes(item.path) && !item.isToggle;
              
              if (item.isToggle) {
                // Botão Central de Menu Expansivo
                return (
                  <button 
                    key={item.id} 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                    className="relative flex flex-col items-center justify-center w-14 h-14 -mt-1 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-500/40 border-4 border-slate-50 dark:border-slate-950 active:scale-95 transition-transform"
                  >
                    <item.icon className={cn("w-6 h-6 transition-transform", isMobileMenuOpen && "rotate-45")} />
                  </button>
                );
              }

              // Botões Normais
              return (
                <button 
                  key={item.id} 
                  onClick={() => { setIsMobileMenuOpen(false); navigate(item.path); }} 
                  className={cn(
                    "flex flex-col items-center justify-center flex-1 py-1 gap-1 rounded-2xl transition-all", 
                    isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  )}
                >
                  <div className={cn("p-1.5 rounded-xl transition-colors", isActive && "bg-indigo-50 dark:bg-indigo-500/10")}>
                    <item.icon className={cn("w-6 h-6", isActive && "fill-current opacity-20")} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className="text-[10px] font-bold tracking-tight">{item.name}</span>
                </button>
              );
            })}
          </div>
        </nav>

      </main>
    </div>
  );
}

// Componente Auxiliar para a Label (Role) no Desktop
function BadgeRole({ role }) {
  const rolesMap = {
    admin: { label: 'Administrador', color: 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400' },
    pastor: { label: 'Pastor', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400' },
    lider: { label: 'Líder', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400' },
    membro: { label: 'Membro', color: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/5' },
  };
  const current = rolesMap[role] || rolesMap.membro;
  
  return (
    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider mt-0.5 inline-block", current.color)}>
      {current.label}
    </span>
  );
}