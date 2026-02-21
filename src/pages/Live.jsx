import React, { useState } from 'react';
import { Radio, Play, Calendar, Users, Clock, X, ChevronRight, AlertCircle } from 'lucide-react';
import { Card, Badge, Button } from '../components/ui';
import { cn } from '../lib/utils';

export default function Live() {
  // Estado para controlar se a igreja está ao vivo agora (Puxar do Supabase depois)
  const [isLive, setIsLive] = useState(false); 
  
  // Controle do Player Modal
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Dados Mockados de vídeos passados
  const pastStreams = [
    { id: 'video1', title: 'Culto de Celebração da Família', date: 'Domingo, 12 de Nov', duration: '2:15:30', views: '1.2k', image: 'https://images.unsplash.com/photo-1438283173091-5dbf5c5a3206?q=80&w=600&auto=format&fit=crop', videoId: 'dQw4w9WgXcQ' },
    { id: 'video2', title: 'Culto de Ensino - A Graça', date: 'Terça, 07 de Nov', duration: '1:45:00', views: '850', image: 'https://images.unsplash.com/photo-1544427920-c49ccf08c146?q=80&w=600&auto=format&fit=crop', videoId: 'dQw4w9WgXcQ' },
    { id: 'video3', title: 'Santa Ceia do Senhor', date: 'Domingo, 05 de Nov', duration: '2:30:10', views: '2.1k', image: 'https://images.unsplash.com/photo-1444840535719-195841cb6e2b?q=80&w=600&auto=format&fit=crop', videoId: 'dQw4w9WgXcQ' },
  ];

  const currentLive = {
    title: "Culto de Ensino",
    preacher: "Pr. Marcos Cavallari",
    videoId: "dQw4w9WgXcQ" // ID do YouTube real deve vir do banco
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto pb-10">
      
      {/* Cabeçalho */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Radio className="w-6 h-6 md:w-8 md:h-8 text-indigo-500" />
          Cultos e Mensagens
        </h2>
        <p className="text-slate-500 dark:text-zinc-400 mt-1 text-sm md:text-base">
          Acompanhe nossos cultos ao vivo ou reveja as mensagens anteriores.
        </p>
      </div>

      {/* =========================================
          SESSÃO DE DESTAQUE (Ao Vivo ou Fallback)
          ========================================= */}
      {isLive ? (
        <Card className="p-0 overflow-hidden border-none shadow-2xl shadow-red-500/10 bg-zinc-900">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-3/5 relative aspect-video bg-black flex items-center justify-center group cursor-pointer" onClick={() => setSelectedVideo(currentLive.videoId)}>
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1438283173091-5dbf5c5a3206?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:opacity-50 transition-opacity"></div>
              
              {/* Botão Play Central */}
              <div className="relative z-10 w-16 h-16 md:w-20 md:h-20 bg-red-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.5)] group-hover:scale-110 transition-transform duration-300">
                <Play className="w-8 h-8 md:w-10 md:h-10 text-white ml-1.5" />
              </div>
              
              <div className="absolute top-4 left-4 z-10">
                <Badge variant="danger" className="px-3 py-1 flex items-center gap-1.5 text-xs">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span> AO VIVO
                </Badge>
              </div>
            </div>
            
            <div className="md:w-2/5 p-6 md:p-8 flex flex-col justify-center bg-gradient-to-br from-zinc-900 to-zinc-950">
              <h3 className="text-2xl font-bold text-white mb-2 leading-tight">{currentLive.title}</h3>
              <p className="text-zinc-400 flex items-center gap-2 mb-6">
                <Users className="w-4 h-4" /> Ministração: {currentLive.preacher}
              </p>
              
              <div className="space-y-3 mt-auto">
                <Button className="w-full bg-red-600 hover:bg-red-700 text-white border-none shadow-lg shadow-red-600/20" onClick={() => setSelectedVideo(currentLive.videoId)}>
                  Assistir Agora
                </Button>
                <Button variant="secondary" className="w-full bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border-none">
                  Compartilhar Link
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-zinc-800/80 dark:to-zinc-900/80 border-slate-200/50 dark:border-white/5 flex flex-col md:flex-row items-center justify-between p-6 md:p-8 gap-6 shadow-inner">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-slate-200 dark:bg-zinc-800 rounded-full text-slate-400 dark:text-zinc-500 shrink-0">
              <Radio className="w-8 h-8 opacity-50" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Transmissão Offline</h3>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Nenhum culto sendo transmitido no momento.</p>
            </div>
          </div>
          <div className="w-full md:w-auto text-center md:text-right">
            <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Próxima Transmissão</p>
            <Badge className="bg-white dark:bg-zinc-950 px-4 py-2 text-sm shadow-sm border border-slate-200 dark:border-white/5 font-semibold text-indigo-600 dark:text-indigo-400">
              Domingo às 19:00
            </Badge>
          </div>
        </Card>
      )}

      {/* =========================================
          ÚLTIMOS CULTOS (Grade)
          ========================================= */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Últimas Mensagens</h3>
          <button className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center">
            Acessar Canal <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pastStreams.map((video) => (
            <Card key={video.id} className="p-0 overflow-hidden group cursor-pointer border-slate-200/60 dark:border-white/5 hover:border-indigo-500/30" onClick={() => setSelectedVideo(video.videoId)}>
              <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-zinc-900">
                <img 
                  src={video.image} 
                  alt={video.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300">
                    <Play className="w-5 h-5 text-white ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded">
                  {video.duration}
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-bold text-slate-900 dark:text-white text-base leading-tight line-clamp-2 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {video.title}
                </h4>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 font-medium">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {video.date}</span>
                  <span>{video.views} views</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* =========================================
          MODAL DO YOUTUBE PLAYER
          ========================================= */}
      {selectedVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setSelectedVideo(null)}></div>
          
          <div className="relative w-full max-w-5xl bg-zinc-950 rounded-2xl overflow-hidden shadow-2xl border border-white/10 z-10 scale-in-95 animate-in">
            {/* Header do Modal */}
            <div className="flex items-center justify-between p-4 bg-zinc-900 border-b border-white/5">
              <h3 className="text-white font-bold flex items-center gap-2">
                <Play className="w-4 h-4 text-indigo-400" /> Reprodutor
              </h3>
              <button 
                onClick={() => setSelectedVideo(null)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Iframe 16:9 responsivo */}
            <div className="relative w-full aspect-video bg-black">
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}