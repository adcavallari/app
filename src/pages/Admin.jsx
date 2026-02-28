import React, { useState } from 'react';
import { 
  Shield, Users, Music, Activity, ArrowUpRight, ShieldCheck, 
  UserPlus, Settings, Database, X, Check, XCircle, Download, ToggleLeft, ToggleRight
} from 'lucide-react';

// ⚠️ PARA O SEU VSCODE: Descomente as importações abaixo
// import { Card, Badge, Button } from '../components/ui';
// import { cn } from '../lib/utils';

// --- INÍCIO DAS SIMULAÇÕES (Remover no seu projeto) ---
const cn = (...classes) => classes.filter(Boolean).join(' ');
const Card = ({ children, className, hover }) => <div className={cn("rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/80", hover && "transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/30", className)}>{children}</div>;
const Badge = ({ children, className }) => <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider", className)}>{children}</span>;
const Button = ({ children, className, onClick, variant }) => <button onClick={onClick} className={cn("inline-flex items-center justify-center rounded-xl font-semibold h-12 px-6 transition-transform active:scale-95", variant === 'secondary' ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700' : variant === 'ghost' ? 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700', className)}>{children}</button>;
// --- FIM DAS SIMULAÇÕES ---

export default function Admin() {
  // Estado para controlar qual Modal está aberto
  const [activeModal, setActiveModal] = useState(null); // 'approve', 'ministries', 'export', 'settings', null
  const [systemOnline, setSystemOnline] = useState(true);

  // Mocks de Estatísticas
  const stats = [
    { label: "Membros Registados", value: "342", icon: Users, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10", trend: "+12 este mês" },
    { label: "Ministérios Ativos", value: "8", icon: Music, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-500/10", trend: "Total" },
    { label: "Acessos Hoje", value: "89", icon: Activity, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10", trend: "Normal" },
    { label: "Avisos Ativos", value: "3", icon: ShieldCheck, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10", trend: "1 Fixado" },
  ];

  const recentUsers = [
    { id: 1, name: "Irmão Pedro Silva", role: "Membro", date: "Há 2 horas", status: "Aprovado" },
    { id: 2, name: "Irmã Maria Costa", role: "Pendente", date: "Há 5 horas", status: "Aguardando" },
    { id: 3, name: "Pr. Marcos Cavallari", role: "Pastor", date: "Ontem", status: "Aprovado" },
  ];

  const pendingApprovals = [
    { id: 2, name: "Irmã Maria Costa", email: "maria.costa@email.com", date: "Há 5 horas" },
    { id: 4, name: "Lucas Fernandes", email: "lucas.f@email.com", date: "Há 1 dia" }
  ];

  const closeModal = () => setActiveModal(null);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto pb-28 md:pb-10">
      
      {/* Cabeçalho */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Shield className="w-8 h-8 text-indigo-500" />
          Painel de Administração
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm md:text-base">
          Visão geral e controlo do sistema Hub Cavallari.
        </p>
      </div>

      {/* Grelha de Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="p-5 flex flex-col justify-between h-36">
            <div className="flex justify-between items-start">
              <div className={cn("p-2.5 rounded-xl", stat.bg, stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-0.5">{stat.value}</p>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Ações Rápidas */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 md:p-8">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6">Ações Rápidas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <button onClick={() => setActiveModal('approve')} className="flex items-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 hover:border-indigo-500/50 transition-all group text-left">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Aprovar Membros</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">2 utilizadores a aguardar</p>
                </div>
              </button>

              <button onClick={() => setActiveModal('ministries')} className="flex items-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 hover:border-violet-500/50 transition-all group text-left">
                <div className="p-3 bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                  <Music className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Gerir Ministérios</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Atribuir líderes e equipas</p>
                </div>
              </button>

              <button onClick={() => setActiveModal('export')} className="flex items-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 hover:border-emerald-500/50 transition-all group text-left">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Exportar Dados</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Membros e presenças (Excel)</p>
                </div>
              </button>

              <button onClick={() => setActiveModal('settings')} className="flex items-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 hover:border-slate-500/50 transition-all group text-left">
                <div className="p-3 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                  <Settings className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Configurações</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Preferências do sistema</p>
                </div>
              </button>

            </div>
          </Card>

          {/* Últimos Utilizadores Registados */}
          <Card className="p-0 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-white/5 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Registos Recentes</h3>
              <button onClick={() => setActiveModal('approve')} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Ver Todos</button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {recentUsers.map(user => (
                <div key={user.id} className="p-4 md:px-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">{user.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{user.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={cn("px-2 py-1", user.status === 'Aprovado' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400')}>
                      {user.status}
                    </Badge>
                    <button className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm"><ArrowUpRight className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar Info Admin */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-indigo-600 to-violet-800 text-white border-none p-6 md:p-8">
            <ShieldCheck className="w-12 h-12 mb-4 opacity-80" />
            <h3 className="text-2xl font-bold mb-2">Sistema Seguro</h3>
            <p className="text-indigo-100 text-sm leading-relaxed mb-6">
              Todos os dados dos membros estão encriptados. Apenas utilizadores com o perfil <strong className="text-white">Admin</strong> têm acesso a este painel.
            </p>
            <Button className="w-full bg-white/20 text-white hover:bg-slate-100 border-none shadow-lg">Ver Registos de Acesso</Button>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-slate-500 dark:text-slate-400">?</span>
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Precisa de Ajuda?</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Aceda à documentação do sistema ou contacte o suporte técnico.
            </p>
            <Button variant="secondary" className="w-full text-sm h-10">Manual do Administrador</Button>
          </Card>
        </div>

      </div>

      {/* =========================================================
          MODAIS (POP-UPS) DE ADMINISTRAÇÃO
          ========================================================= */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={closeModal}></div>
          
          <div className="relative bg-white dark:bg-slate-950 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-white/5 shrink-0">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {activeModal === 'approve' && <><UserPlus className="w-5 h-5 text-indigo-500" /> Aprovar Membros</>}
                {activeModal === 'ministries' && <><Music className="w-5 h-5 text-violet-500" /> Gestão de Ministérios</>}
                {activeModal === 'export' && <><Database className="w-5 h-5 text-emerald-500" /> Exportação de Dados</>}
                {activeModal === 'settings' && <><Settings className="w-5 h-5 text-slate-500" /> Configurações Gerais</>}
              </h3>
              <button onClick={closeModal} className="p-2 bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content (Scrollable) */}
            <div className="p-6 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-800">
              
              {/* === CONTEÚDO: APROVAR MEMBROS === */}
              {activeModal === 'approve' && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Analise as contas recém-criadas que aguardam aprovação para aceder aos conteúdos exclusivos da igreja.</p>
                  
                  {pendingApprovals.map(user => (
                    <div key={user.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                         <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                           {user.name.charAt(0)}
                         </div>
                         <div>
                           <p className="font-bold text-sm text-slate-900 dark:text-white">{user.name}</p>
                           <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                         </div>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button variant="secondary" className="flex-1 sm:flex-none h-10 px-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">Rejeitar</Button>
                        <Button className="flex-1 sm:flex-none h-10 px-3 bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"><Check className="w-4 h-4 mr-1" /> Aprovar</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* === CONTEÚDO: MINISTÉRIOS === */}
              {activeModal === 'ministries' && (
                <div className="space-y-4">
                   <div className="flex justify-between items-center mb-6">
                     <p className="text-sm text-slate-500 dark:text-slate-400">Departamentos e Equipas da Igreja</p>
                     <Button className="h-10 px-4 text-sm"><UserPlus className="w-4 h-4 mr-2" /> Novo</Button>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {['Ministério de Louvor', 'Mídia e Comunicação', 'Equipa de Obreiros', 'Ministério Infantil'].map((min, idx) => (
                        <div key={idx} className="p-4 border border-slate-200 dark:border-white/5 rounded-xl flex justify-between items-center group hover:border-violet-500/50 transition-colors cursor-pointer">
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-sm">{min}</p>
                            <p className="text-xs text-slate-500 mt-0.5">3 líderes • 12 membros</p>
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-violet-500" />
                        </div>
                     ))}
                   </div>
                </div>
              )}

              {/* === CONTEÚDO: EXPORTAÇÃO === */}
              {activeModal === 'export' && (
                <div className="space-y-6">
                   <p className="text-sm text-slate-500 dark:text-slate-400">Faça o download dos dados da igreja em formato Excel/CSV para análise externa ou backups.</p>
                   
                   <div className="space-y-3">
                     <div className="p-4 flex justify-between items-center border border-slate-200 dark:border-white/5 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">Lista de Membros Ativos</p>
                          <p className="text-xs text-slate-500">Nomes, contactos e ministérios</p>
                        </div>
                        <Button variant="secondary" className="h-10 px-4"><Download className="w-4 h-4 mr-2" /> CSV</Button>
                     </div>
                     <div className="p-4 flex justify-between items-center border border-slate-200 dark:border-white/5 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">Escalas e Presenças</p>
                          <p className="text-xs text-slate-500">Histórico de escalas do último ano</p>
                        </div>
                        <Button variant="secondary" className="h-10 px-4"><Download className="w-4 h-4 mr-2" /> Excel</Button>
                     </div>
                   </div>
                </div>
              )}

              {/* === CONTEÚDO: CONFIGURAÇÕES === */}
              {activeModal === 'settings' && (
                <div className="space-y-6">
                   <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-white/5 rounded-xl">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">Status do Sistema (Hub)</p>
                        <p className="text-xs text-slate-500">Se desativado, os membros verão uma página de manutenção.</p>
                      </div>
                      <button onClick={() => setSystemOnline(!systemOnline)} className={cn("transition-colors", systemOnline ? "text-emerald-500" : "text-slate-400")}>
                        {systemOnline ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
                      </button>
                   </div>
                   <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-white/5 rounded-xl">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">Aprovações Automáticas</p>
                        <p className="text-xs text-slate-500">Novos registos requerem aprovação manual de um Admin.</p>
                      </div>
                      <button className="text-slate-400">
                        <ToggleLeft className="w-10 h-10" />
                      </button>
                   </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-white/5 flex gap-3 justify-end shrink-0">
              <Button variant="secondary" onClick={closeModal}>Fechar Janela</Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}