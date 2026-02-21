import React from 'react';
import { Play } from 'lucide-react';
import { Card, Badge, Button } from '../components/ui';

export default function Worship() {
  const setlist = [
    { id: 1, song: "A Ele a Glória", artist: "Diante do Trono", key: "G", bpm: 72 },
    { id: 2, song: "Maranata", artist: "Ministério Avivah", key: "A", bpm: 130 },
    { id: 3, song: "Lindo És", artist: "Juliano Son", key: "E", bpm: 68 },
    { id: 4, song: "Ousado Amor", artist: "Isaias Saad", key: "C#m", bpm: 110 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-violet-600 to-indigo-600 p-8 rounded-2xl text-white shadow-xl shadow-indigo-500/20">
        <div>
          <Badge className="bg-white/20 text-white border-none mb-3 backdrop-blur-md">Próximo Domingo, 19:00</Badge>
          <h2 className="text-3xl font-bold tracking-tight">Culto de Celebração</h2>
          <p className="text-indigo-100 mt-1">Líder: Ministério de Louvor Principal</p>
        </div>
        <Button className="bg-white text-indigo-600 hover:bg-slate-100 border-none shadow-lg">
          <Play className="w-4 h-4 mr-2" /> Ensaiar Setlist
        </Button>
      </div>

      <Card className="p-0 overflow-hidden border-transparent shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-900/80 border-b border-slate-200 dark:border-white/5">
                <th className="p-4 font-semibold text-sm text-slate-500 dark:text-zinc-400">MÚSICA</th>
                <th className="p-4 font-semibold text-sm text-slate-500 dark:text-zinc-400 text-center">TOM</th>
                <th className="p-4 font-semibold text-sm text-slate-500 dark:text-zinc-400 text-center">BPM</th>
                <th className="p-4 font-semibold text-sm text-slate-500 dark:text-zinc-400 text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-white/5">
              {setlist.map((song, i) => (
                <tr key={song.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 text-center text-slate-400 dark:text-zinc-600 font-mono text-sm">{i+1}</div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{song.song}</p>
                        <p className="text-sm text-slate-500 dark:text-zinc-400">{song.artist}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <Badge variant="primary" className="text-sm font-bold bg-indigo-50 dark:bg-indigo-500/10 px-3">{song.key}</Badge>
                  </td>
                  <td className="p-4 text-center text-slate-600 dark:text-zinc-400 font-mono">{song.bpm}</td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" className="h-8 px-2 text-indigo-600 dark:text-indigo-400">Cifra</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}