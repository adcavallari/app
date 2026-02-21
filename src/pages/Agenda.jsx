import React from 'react';
import { Search, Calendar, Clock, User, ChevronRight } from 'lucide-react';
import { Card, Button, Input, Badge } from '../components/ui';

export default function Agenda() {
  const events = [
    { id: 1, title: "Culto de Celebração", date: "Domingo, 19:00", type: "Culto", minister: "Pr. Marcos", tags: ["Todos"] },
    { id: 2, title: "Ensaio Geral - Louvor", date: "Sábado, 15:00", type: "Ensaio", minister: "Min. Louvor", tags: ["Louvor", "Mídia"] },
    { id: 3, title: "Reunião de Jovens (UMADEC)", date: "Sábado, 19:30", type: "Jovens", minister: "Líder João", tags: ["Jovens"] },
    { id: 4, title: "Escola Bíblica Dominical", date: "Domingo, 09:00", type: "Ensino", minister: "Vários", tags: ["Ensino"] },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Agenda</h2>
          <p className="text-slate-500 dark:text-zinc-400 mt-1">Fique por dentro de tudo o que acontece na AD Cavallari.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Input placeholder="Pesquisar evento..." icon={Search} className="h-10 w-full md:w-64" />
          <Button variant="secondary" className="h-10 px-4"><Calendar className="w-5 h-5" /></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map(ev => (
          <Card key={ev.id} hover className="flex gap-4 p-5 cursor-pointer items-center">
            <div className="flex flex-col items-center justify-center bg-slate-100 dark:bg-zinc-800/80 rounded-xl p-3 min-w-[70px] border border-slate-200 dark:border-white/5">
              <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">NOV</span>
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">12</span>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">{ev.title}</h4>
              </div>
              <div className="flex items-center text-sm text-slate-500 dark:text-zinc-400 mt-2 gap-4">
                <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {ev.date.split(', ')[1]}</span>
                <span className="flex items-center"><User className="w-4 h-4 mr-1" /> {ev.minister}</span>
              </div>
              <div className="flex gap-2 mt-3">
                {ev.tags.map(tag => (
                  <Badge key={tag} variant={tag === 'Louvor' ? 'primary' : 'default'} className="px-2 py-0.5 text-[10px] uppercase tracking-wider">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 dark:text-zinc-600" />
          </Card>
        ))}
      </div>
    </div>
  );
}
