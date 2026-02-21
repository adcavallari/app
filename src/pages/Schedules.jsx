import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Users, Music, Video, Shield, ChevronRight, AlertCircle, ClipboardList } from 'lucide-react';
import { Card, Badge, Button } from '../components/ui';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

export default function Schedules() {
  const { profile } = useAuth();
  
  // =========================================================================
  // LÓGICA DE PERMISSÕES MULTI-MINISTERY
  // =========================================================================
  // Simulação de dados do utilizador (depois os valores vêm do AuthContext)
  const userRole = profile?.role || 'membro'; // Pode ser: 'admin', 'pastor', 'lider', 'membro'
  const userMinistries = profile?.ministries || ['louvor']; // Array de ministérios que o user pertence

  const isAdminOrPastor = ['admin', 'pastor'].includes(userRole);

  const allMinistries = [
    { id: 'louvor', label: 'Louvor', icon: Music, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { id: 'midia', label: 'Mídia', icon: Video, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'obreiros', label: 'Obreiros', icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
  ];

  // Filtra os ministérios visíveis nas Abas baseado nas permissões
  const allowedMinistries = isAdminOrPastor 
    ? allMinistries 
    : allMinistries.filter(m => userMinistries.includes(m.id));

  // Se o utilizador tiver acesso a algum, seleciona o primeiro por padrão
  const [activeTab, setActiveTab] = useState(allowedMinistries.length > 0 ? allowedMinistries[0].id : null);

  // =========================================================================
  // DADOS MOCKADOS DE ESCALAS
  // =========================================================================
  const scheduleData = [
    {
      date: 'Domingo, 19 de Nov',
      events: [
        {
          id: 1, title: 'Culto de Celebração', time: '19:00',
          teams: {
            louvor: [
              { role: 'Ministro', name: 'João Silva' },
              { role: 'Vocal', name: 'Maria, Ana' },
              { role: 'Teclado', name: 'Pedro' },
              { role: 'Bateria', name: 'Lucas' }
            ],
            midia: [
              { role: 'Corte (Câmera)', name: 'Tiago' },
              { role: 'Projeção', name: 'Sara' },
              { role: 'Som', name: 'Marcos' }
            ],
            obreiros: [
              { role: 'Porta Principal', name: 'Pr. Antônio' },
              { role: 'Corredor', name: 'Irmão Carlos' },
              { role: 'Santa Ceia', name: 'Todos os Diáconos' }
            ]
          }
        }
      ]
    },
    {
      date: 'Terça, 21 de Nov',
      events: [
        {
          id: 2, title: 'Culto de Ensino', time: '19:30',
          teams: {
            louvor: [
              { role: 'Ministro', name: 'Ana Oliveira' },
              { role: 'Violão', name: 'Paulo' }
            ],
            midia: [
              { role: 'Som e Projeção', name: 'Felipe' }
            ],
            obreiros: [
              { role: 'Porta Principal', name: 'Irmão José' }
            ]
          }
        }
      ]
    }
  ];

  // =========================================================================
  // RENDERIZAÇÃO SE O MEMBRO NÃO TIVER MINISTÉRIOS
  // =========================================================================
  if (allowedMinistries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] max-w-lg mx-auto text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-6 border border-slate-200 dark:border-white/5">
          <Shield className="w-10 h-10 text-slate-400 dark:text-zinc-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Área Restrita</h2>
        <p className="text-slate-500 dark:text-zinc-400 mb-8 leading-relaxed">
          Você não está associado a nenhum ministério com escalas no momento. Se acha que isto é um erro, por favor, fale com o seu líder.
        </p>
        <Button variant="secondary" onClick={() => window.history.back()}>
          Voltar ao Início
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto pb-10">
      
      {/* Cabeçalho */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <ClipboardList className="w-6 h-6 md:w-8 md:h-8 text-indigo-500" />
          Escalas de Serviço
        </h2>
        <p className="text-slate-500 dark:text-zinc-400 mt-1 text-sm md:text-base">
          Verifique as suas escalas e compromissos ministeriais.
        </p>
      </div>

      {/* =========================================
          ABAS DE NAVEGAÇÃO (Tabs)
          ========================================= */}
      {allowedMinistries.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 snap-x scroll-smooth [&::-webkit-scrollbar]:hidden">
          {allowedMinistries.map((min) => {
            const isActive = activeTab === min.id;
            return (
              <button
                key={min.id}
                onClick={() => setActiveTab(min.id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap snap-center border",
                  isActive 
                    ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white border-slate-200 dark:border-white/10 shadow-sm" 
                    : "bg-transparent text-slate-500 dark:text-zinc-500 border-transparent hover:bg-slate-100 dark:hover:bg-white/5"
                )}
              >
                <min.icon className={cn("w-4 h-4", isActive ? min.color : "text-slate-400")} />
                {min.label}
              </button>
            )
          })}
        </div>
      )}

      {/* =========================================
          LISTAGEM DE EVENTOS E ESCALAS
          ========================================= */}
      <div className="space-y-8">
        {scheduleData.map((day, index) => (
          <div key={index} className="space-y-4">
            
            {/* Divisor de Data */}
            <div className="flex items-center gap-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2 bg-slate-100 dark:bg-zinc-800/80 px-4 py-1.5 rounded-lg border border-slate-200 dark:border-white/5">
                <CalendarIcon className="w-4 h-4 text-indigo-500" />
                {day.date}
              </h3>
              <div className="flex-1 h-px bg-slate-200 dark:bg-white/5"></div>
            </div>

            {/* Cards de Evento */}
            <div className="space-y-4 pl-2 md:pl-6">
              {day.events.map(event => {
                const ministryTeam = event.teams[activeTab];
                
                // Se o ministério ativo não estiver escalado neste evento, ignorar.
                if (!ministryTeam || ministryTeam.length === 0) return null;

                const ActiveIcon = allMinistries.find(m => m.id === activeTab)?.icon || Users;
                const activeColorInfo = allMinistries.find(m => m.id === activeTab);

                return (
                  <Card key={event.id} className="p-0 overflow-hidden border-slate-200/60 dark:border-white/5 relative">
                    {/* Borda lateral colorida */}
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500"></div>
                    
                    {/* Cabeçalho do Evento */}
                    <div className="px-5 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-zinc-900/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-lg">{event.title}</h4>
                        <div className="flex items-center text-slate-500 dark:text-zinc-400 text-sm mt-1">
                          <Clock className="w-4 h-4 mr-1.5" /> Início às {event.time}
                        </div>
                      </div>
                      <Badge className={cn("self-start md:self-auto uppercase tracking-wider text-[10px]", activeColorInfo?.bg, activeColorInfo?.color)}>
                        <ActiveIcon className="w-3 h-3 mr-1.5" /> Equipe de {activeColorInfo?.label}
                      </Badge>
                    </div>

                    {/* Lista de Pessoas Escaladas */}
                    <div className="p-5 bg-white dark:bg-[#0c0c0e]">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                        {ministryTeam.map((member, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-white/5 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 bg-slate-50/50 dark:bg-zinc-900/30 transition-colors">
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-0.5">
                                {member.role}
                              </span>
                              <span className="font-semibold text-slate-900 dark:text-white">
                                {member.name}
                              </span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-zinc-400">
                              {member.name.charAt(0)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}