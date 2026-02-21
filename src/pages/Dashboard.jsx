import React, { useState, useEffect } from 'react';
import { 
  Bell, Play, ChevronRight, Calendar, BookOpen, 
  MapPin, Pin, Clock, Radio, Info
} from 'lucide-react';
import { Card, Badge, Button } from '../components/ui';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');

  // Define a saudação baseada na hora do dia
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bom dia');
    else if (hour < 18) setGreeting('Boa tarde');
    else setGreeting('Boa noite');
  }, []);

  // Dados Mockados para o frontend (depois ligaremos ao Supabase)
  const announcements = [
    { id: 1, title: "Campanha de Jejum e Oração", desc: "Iniciamos nesta segunda-feira nossa campanha de 7 dias. Participe!", pinned: true, date: "Hoje" },
    { id: 2, title: "Encontro de Casais", desc: "As inscrições para o encontro de casais estão abertas no hall da igreja.", pinned: false, date: "Ontem" },
    { id: 3, title: "Doação de Alimentos", desc: "Traga 1kg de alimento não perecível neste domingo para a ação social.", pinned: false, date: "2 dias atrás" }
  ];

  const upcomingEvents = [
    { id: 1, title: "Culto de Ensino", date: "Terça, 19:30", type: "Culto", day: "14", month: "NOV" },
    { id: 2, title: "Círculo de Oração", date: "Quinta, 14:00", type: "Oração", day: "16", month: "NOV" },
    { id: 3, title: "Culto de Celebração", date: "Domingo, 19:00", type: "Culto", day: "19", month: "NOV" },
  ];

  const quickAccess = [
    { icon: BookOpen, label: "Bíblia", color: "text-indigo-500", bg: "bg-indigo-500/10", path: "/bible" },
    { icon: Radio, label: "Ao Vivo", color: "text-red-500", bg: "bg-red-500/10", path: "/live" },
    { icon: Calendar, label: "Agenda", color: "text-blue-500", bg: "bg-blue-500/10", path: "/events" },
    { icon: MapPin, label: "Localização", color: "text-emerald-500", bg: "bg-emerald-500/10", path: "#" },
  ];

  const firstName = profile?.full_name?.split(' ')[0] || 'Irmão(ã)';

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto pb-10">
      
      {/* Header Mobile / Greeting Desktop */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {greeting}, {firstName}!
          </h1>
          <p className="text-slate-500 dark:text-zinc-400 text-sm md:text-base mt-1">
            Que a paz do Senhor esteja com você hoje.
          </p>
        </div>
        
        {/* Sino de Notificações */}
        <button className="relative p-2.5 rounded-full bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-zinc-400 hover:text-indigo-600 shadow-sm transition-colors">
          <Bell className="w-5 h-5 md:w-6 md:h-6" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-white dark:border-zinc-800"></span>
        </button>
      </div>

      {/* Versículo do Dia & Banner Ao Vivo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        
        {/* Versículo */}
        <Card className="md:col-span-2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white border-none shadow-xl shadow-indigo-500/20 relative overflow-hidden group p-6 md:p-8">
          <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-700">
            <BookOpen className="w-32 h-32 md:w-48 md:h-48" />
          </div>
          <div className="relative z-10">
            <Badge className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-md border-none mb-4 uppercase tracking-wider text-[10px] md:text-xs">Palavra do Dia</Badge>
            <blockquote className="text-xl md:text-3xl font-semibold leading-snug md:leading-tight mb-6 text-indigo-50">
              "Deixo-vos a paz, a minha paz vos dou; não vo-la dou como o mundo a dá. Não se turbe o vosso coração, nem se atemorize."
            </blockquote>
            <div className="flex items-center justify-between mt-auto">
              <p className="text-indigo-200 font-bold tracking-wide uppercase text-xs md:text-sm">— João 14:27</p>
              <Button 
                variant="secondary" 
                onClick={() => navigate('/bible')}
                className="h-9 px-4 text-xs md:text-sm bg-white/10 text-white hover:bg-white/20 border-none backdrop-blur-md"
              >
                Ler <ChevronRight className="w-4 h-4 ml-1 hidden sm:block" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Banner Ao Vivo (Mockado como Offline por padrão, mas chamativo) */}
        <Card className="flex flex-col justify-center items-center text-center bg-zinc-900 text-white border-zinc-800 relative overflow-hidden p-6 md:p-8">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1438283173091-5dbf5c5a3206?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-900/80 to-transparent"></div>
          <div className="relative z-10 w-full">
            <div className="flex justify-center mb-4 md:mb-6">
              <div className="h-14 w-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center">
                <Radio className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-1 text-white">Próximo Culto</h3>
            <p className="text-xs md:text-sm text-zinc-400 mb-6">Terça-feira às 19:30</p>
            <Button onClick={() => navigate('/live')} className="w-full bg-white text-zinc-900 hover:bg-zinc-200 border-none shadow-lg text-sm md:text-base h-10 md:h-12">
              Acessar Canal
            </Button>
          </div>
        </Card>
      </div>

      {/* Acesso Rápido */}
      <div>
        <h3 className="text-sm font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-3 px-1">Acesso Rápido</h3>
        <div className="grid grid-cols-4 gap-3 md:gap-4">
          {quickAccess.map((item, i) => (
            <button 
              key={i} 
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center text-center gap-2 p-3 md:p-4 rounded-2xl bg-white dark:bg-zinc-900/50 border border-slate-200/60 dark:border-white/5 hover:border-indigo-500/30 hover:shadow-lg dark:hover:bg-zinc-800 transition-all active:scale-95 group"
            >
              <div className={cn("p-2.5 md:p-3 rounded-xl transition-transform group-hover:scale-110 duration-300", item.bg)}>
                <item.icon className={cn("w-5 h-5 md:w-6 md:h-6", item.color)} />
              </div>
              <span className="font-semibold text-[10px] md:text-xs text-slate-700 dark:text-zinc-300">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Avisos */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Quadro de Avisos</h3>
            <button className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">Ver todos</button>
          </div>
          <div className="space-y-3">
            {announcements.map((aviso) => (
              <Card key={aviso.id} className="p-4 flex gap-4 items-start border-slate-200/60 dark:border-white/5 hover:border-indigo-500/30 transition-colors">
                <div className={cn(
                  "p-2 rounded-lg mt-1 shrink-0",
                  aviso.pinned ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400" : "bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400"
                )}>
                  {aviso.pinned ? <Pin className="w-5 h-5 fill-current" /> : <Info className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="font-bold text-slate-900 dark:text-white truncate">{aviso.title}</h4>
                    <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500 whitespace-nowrap">{aviso.date}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed line-clamp-2">{aviso.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Próximos Eventos */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Próximos Eventos</h3>
          </div>
          <div className="space-y-3">
            {upcomingEvents.map((ev) => (
              <Card key={ev.id} hover className="p-3 md:p-4 flex gap-4 items-center cursor-pointer border-slate-200/60 dark:border-white/5">
                <div className="flex flex-col items-center justify-center bg-slate-100 dark:bg-zinc-800 rounded-xl p-2 min-w-[60px] md:min-w-[65px] border border-slate-200/50 dark:border-white/5">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase">{ev.month}</span>
                  <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 leading-none mt-0.5">{ev.day}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm md:text-base text-slate-900 dark:text-white truncate">{ev.title}</h4>
                  <div className="flex items-center text-xs md:text-sm text-slate-500 dark:text-zinc-400 mt-1">
                    <Clock className="w-3.5 h-3.5 mr-1" /> {ev.date.split(', ')[1]}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 dark:text-zinc-600 shrink-0" />
              </Card>
            ))}
          </div>
          <Button variant="secondary" onClick={() => navigate('/events')} className="w-full h-12 text-sm">
            Ver Agenda Completa
          </Button>
        </div>
        
      </div>
    </div>
  );
}