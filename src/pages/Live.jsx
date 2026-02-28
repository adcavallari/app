import React, { useState, useEffect } from 'react';
import { Radio, Play, Calendar, Users, Clock, X, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';

// =========================================================================
// ⚠️ COMPONENTES DE UI (Substitua pelos seus reais se necessário)
// =========================================================================
const cn = (...classes) => classes.filter(Boolean).join(' ');

const Card = ({ children, className, onClick }) => (
  <div onClick={onClick} className={cn("rounded-2xl border bg-white shadow-sm dark:bg-slate-900 dark:border-slate-800", className)}>{children}</div>
);
const Badge = ({ children, className, variant }) => (
  <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider", variant === 'danger' ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300", className)}>{children}</span>
);
const Button = ({ children, className, onClick, variant, isLoading, disabled }) => (
  <button onClick={onClick} disabled={disabled || isLoading} className={cn("inline-flex items-center justify-center rounded-xl font-semibold px-6 py-3 transition-transform active:scale-95 disabled:opacity-70 disabled:active:scale-100", variant === 'secondary' ? 'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20', className)}>
    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
    {children}
  </button>
);

export default function Live() {
  // =========================================================================
  // CONFIGURAÇÕES DO YOUTUBE E CHAVES DA API
  // =========================================================================
  // No seu projeto real (Vite), substitua as strings abaixo por import.meta.env.VITE_YOUTUBE_API_KEY
  const YOUTUBE_API_KEYS = [
    import.meta.env.VITE_YOUTUBE_API_KEY_1 || null, // Garante que chaves vazias ou não configuradas sejam filtradas
    import.meta.env.VITE_YOUTUBE_API_KEY_2,
    import.meta.env.VITE_YOUTUBE_API_KEY_3,
    import.meta.env.VITE_YOUTUBE_API_KEY_4,
    import.meta.env.VITE_YOUTUBE_API_KEY_5,
  ].filter(key => key && !key.includes(import.meta.env.VITE_YOUTUBE_API_KEY_PLACEHOLDER)); // Remove chaves de placeholder ou vazias
  
  const YOUTUBE_CHANNEL_ID = import.meta.env.VITE_YOUTUBE_CHANNEL_ID; // No Vite, use: import.meta.env.VITE_YOUTUBE_CHANNEL_ID
  const MAX_RESULTS_PER_PAGE = 6;

  // Estados
  const [isLive, setIsLive] = useState(false); 
  const [currentLive, setCurrentLive] = useState(null);
  const [pastStreams, setPastStreams] = useState([]);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [nextEvent, setNextEvent] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Função robusta que tenta usar as chaves de API uma por uma se der limite de cota (Erro 403)
  const fetchWithKeyRotation = async (urlTemplate) => {
    if (YOUTUBE_API_KEYS.length === 0) throw new Error("Nenhuma chave de API configurada no .env");

    for (let i = 0; i < YOUTUBE_API_KEYS.length; i++) {
      const key = YOUTUBE_API_KEYS[i];
      const url = urlTemplate.replace('API_KEY_PLACEHOLDER', key);
      
      try {
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) return data;
        
        // Se o erro for 403 (Limite de cota excedido), avisa e tenta a próxima chave no loop
        if (response.status === 403) {
          console.warn(`Chave API ${i + 1} falhou (Cota excedida?). Tentando a próxima...`);
          continue; 
        }
        
        throw new Error(data.error?.message || 'Erro desconhecido na API do YouTube');
      } catch (err) {
        // Se for a última chave e der erro, joga o erro para a tela
        if (i === YOUTUBE_API_KEYS.length - 1) throw err;
      }
    }
  };

  // Formatação de data (ex: "ter, 07 de nov")
  const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }).replace('.', '');
  };

  // Formatação para o Próximo Culto (ex: "Domingo às 19:00")
  const formatNextEventDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const dia = diasSemana[date.getDay()];
    const hora = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${dia} às ${hora}`;
  };

  useEffect(() => {
    fetchYouTubeData();
  }, []);

  const fetchYouTubeData = async (pageToken = '') => {
    const isFetchingMore = pageToken !== '';
    if (isFetchingMore) setIsLoadingMore(true);
    else setIsLoading(true);
    setError(null);

    try {
      // 1. Monta a URL (Se for a primeira carga, pega 15 itens para garantir que vem os gravados, os agendados e os ao vivos)
      const maxResults = isFetchingMore ? MAX_RESULTS_PER_PAGE : 15;
      let searchUrl = `https://www.googleapis.com/youtube/v3/search?key=API_KEY_PLACEHOLDER&channelId=${YOUTUBE_CHANNEL_ID}&part=snippet&type=video&order=date&maxResults=${maxResults}`;
      if (pageToken) searchUrl += `&pageToken=${pageToken}`;

      // 2. Faz a busca usando o rotacionador de chaves
      const searchData = await fetchWithKeyRotation(searchUrl);
      const videos = searchData.items || [];
      
      let pastVideosRaw = videos;

      // 3. Lógica apenas para a PRIMEIRA carga da página
      if (!isFetchingMore) {
        // A. Verifica se tem vídeo AO VIVO agora
        const liveVideo = videos.find(v => v.snippet.liveBroadcastContent === 'live');
        if (liveVideo) {
          setIsLive(true);
          setCurrentLive({ 
            title: liveVideo.snippet.title, 
            preacher: "Transmissão Ao Vivo", 
            videoId: liveVideo.id.videoId 
          });
        } else {
          setIsLive(false);
          setCurrentLive(null);
        }

        // B. Verifica se tem algum vídeo AGENDADO (Próximo Culto)
        // O YouTube retorna liveBroadcastContent === 'upcoming' para lives agendadas
        const upcomingVideo = videos.find(v => v.snippet.liveBroadcastContent === 'upcoming');
        if (upcomingVideo) {
          setNextEvent({
            title: upcomingVideo.snippet.title,
            // Para vídeos agendados no endpoint search, publishedAt reflete o horário de início agendado
            date: upcomingVideo.snippet.publishedAt 
          });
        } else {
          setNextEvent(null);
        }

        // C. Filtra para pegar SOMENTE os vídeos que já acabaram e limita a 6
        pastVideosRaw = videos
          .filter(v => v.snippet.liveBroadcastContent === 'none')
          .slice(0, MAX_RESULTS_PER_PAGE);
      } else {
        // Se estiver carregando mais, só garante que não vem vídeo agendado ou ao vivo pro meio dos antigos
        pastVideosRaw = videos.filter(v => v.snippet.liveBroadcastContent === 'none');
      }

      // 4. (Opcional mas recomendado) Buscar as views dos vídeos gravados
      let formattedVideos = pastVideosRaw.map(video => ({
        id: video.id.videoId,
        title: video.snippet.title,
        date: formatDate(video.snippet.publishedAt),
        duration: "Gravado", 
        views: "", // Padrão caso a chamada de views falhe para não quebrar
        image: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium?.url,
        videoId: video.id.videoId
      }));

      // Tentativa de buscar as estatísticas (Views)
      if (pastVideosRaw.length > 0) {
        try {
          const videoIds = pastVideosRaw.map(v => v.id.videoId).join(',');
          const statsUrl = `https://www.googleapis.com/youtube/v3/videos?key=API_KEY_PLACEHOLDER&id=${videoIds}&part=statistics`;
          const statsData = await fetchWithKeyRotation(statsUrl);
          
          formattedVideos = formattedVideos.map(video => {
            const stats = statsData.items?.find(s => s.id === video.videoId);
            return {
              ...video,
              views: stats ? `${parseInt(stats.statistics.viewCount).toLocaleString('pt-BR')} views` : ""
            };
          });
        } catch (statsErr) {
          console.warn("Erro ao buscar estatísticas de views, seguindo sem elas.", statsErr);
        }
      }

      // 5. Atualiza os estados
      if (isFetchingMore) {
        setPastStreams(prev => [...prev, ...formattedVideos]);
      } else {
        setPastStreams(formattedVideos);
      }

      // Salva o token da próxima página para o botão "Carregar Mais"
      setNextPageToken(searchData.nextPageToken || null);

    } catch (err) {
      console.error(err);
      if (!isFetchingMore) setError(err.message || "Não foi possível carregar os vídeos no momento.");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto pb-10 px-4 sm:px-6 lg:px-8 mt-6">
      
      {/* Cabeçalho */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Radio className="w-6 h-6 md:w-8 md:h-8 text-indigo-500" />
          Cultos e Mensagens
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm md:text-base">
          Acompanhe nossos cultos ao vivo ou reveja as mensagens anteriores.
        </p>
      </div>

      {isLoading ? (
        // LOADING SKELETON
        <div className="flex flex-col items-center justify-center p-20 text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 w-full">
          <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
          <p className="font-medium animate-pulse text-slate-500 dark:text-slate-400">Buscando transmissões...</p>
        </div>
      ) : error ? (
        // ERROR STATE
        <Card className="p-8 flex flex-col items-center justify-center text-center border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10">
          <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
          <h3 className="font-bold text-red-700 dark:text-red-400">Não foi possível carregar</h3>
          <p className="text-red-600/80 dark:text-red-400/80 text-sm mt-1 mb-4 max-w-md">{error}</p>
          <Button onClick={() => fetchYouTubeData()} variant="secondary" className="bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-500/20 dark:text-red-300">Tentar Novamente</Button>
        </Card>
      ) : (
        <>
          {/* =========================================
              SESSÃO DE DESTAQUE (Ao Vivo ou Fallback)
              ========================================= */}
          {isLive && currentLive ? (
            <Card className="p-0 overflow-hidden border-none shadow-2xl shadow-red-500/10 bg-zinc-900 animate-in slide-in-from-bottom-4">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-3/5 relative aspect-video bg-black flex items-center justify-center group cursor-pointer" onClick={() => setSelectedVideo(currentLive.videoId)}>
                  {/* Thumbnail do YouTube */}
                  <div className={`absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-50 transition-opacity`} style={{ backgroundImage: `url('https://img.youtube.com/vi/${currentLive.videoId}/maxresdefault.jpg')` }}></div>
                  
                  {/* Botão Play Central */}
                  <div className="relative z-10 w-16 h-16 md:w-20 md:h-20 bg-red-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.5)] group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-8 h-8 md:w-10 md:h-10 text-white ml-1.5" />
                  </div>
                  
                  <div className="absolute top-4 left-4 z-10">
                    <Badge variant="danger" className="px-3 py-1 flex items-center gap-1.5 text-xs shadow-sm shadow-red-500/20 bg-red-500 text-white border-none">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span> AO VIVO
                    </Badge>
                  </div>
                </div>
                
                <div className="md:w-2/5 p-6 md:p-8 flex flex-col justify-center bg-gradient-to-br from-zinc-900 to-zinc-950">
                  <h3 className="text-2xl font-bold text-white mb-2 leading-tight">{currentLive.title}</h3>
                  <p className="text-zinc-400 flex items-center gap-2 mb-6 text-sm">
                    <Users className="w-4 h-4" /> Ministração: {currentLive.preacher}
                  </p>
                  
                  <div className="space-y-3 mt-auto">
                    <Button className="w-full bg-red-600 hover:bg-red-500 text-white border-none shadow-lg shadow-red-600/20" onClick={() => setSelectedVideo(currentLive.videoId)}>
                      Assistir Agora
                    </Button>
                    <Button variant="secondary" onClick={() => window.open(`https://youtu.be/${currentLive.videoId}`, '_blank')} className="w-full bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border-none">
                      Abrir no YouTube
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800/80 flex flex-col md:flex-row items-center justify-between p-6 md:p-8 gap-6 shadow-sm animate-in fade-in relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex items-center gap-4 relative z-10 w-full md:w-auto text-center md:text-left flex-col md:flex-row">
                <div className="p-4 bg-white dark:bg-slate-900/80 rounded-full text-slate-400 dark:text-slate-500 shrink-0 shadow-sm border border-slate-100 dark:border-slate-800">
                  <Radio className="w-8 h-8 opacity-70" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Transmissão Offline</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Nenhum culto sendo transmitido no momento.</p>
                </div>
              </div>
              
              <div className="w-full md:w-auto text-center md:text-right relative z-10 border-t border-slate-200 dark:border-slate-800 md:border-t-0 pt-4 md:pt-0">
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Próxima Transmissão</p>
                
                {nextEvent ? (
                  <div className="bg-white dark:bg-slate-900 px-4 py-2.5 shadow-sm border border-slate-200 dark:border-slate-700 font-semibold text-indigo-600 dark:text-indigo-400 rounded-xl inline-flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                    <span className="flex items-center gap-2"><Calendar className="w-4 h-4 opacity-70" /> {formatNextEventDate(nextEvent.date)}</span>
                  </div>
                ) : (
                  <div className="bg-slate-100 dark:bg-slate-900/80 px-4 py-2 text-sm border border-slate-200 dark:border-slate-800 font-medium text-slate-500 dark:text-slate-400 rounded-lg inline-flex items-center gap-2">
                     Nenhum culto agendado
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* =========================================
              ÚLTIMOS CULTOS (Grade)
              ========================================= */}
          {pastStreams.length > 0 && (
            <div className="pt-4 animate-in slide-in-from-bottom-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-500 shrink-0" /> Últimas Mensagens
                </h3>
                <a href={`https://youtube.com/channel/${YOUTUBE_CHANNEL_ID}`} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-lg w-fit">
                  Acessar Canal YouTube <ChevronRight className="w-4 h-4 ml-1" />
                </a>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastStreams.map((video) => (
                  <Card key={video.id} className="p-0 overflow-hidden group cursor-pointer border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 hover:shadow-md transition-all duration-300 flex flex-col" onClick={() => setSelectedVideo(video.videoId)}>
                    <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-900 shrink-0">
                      <img 
                        src={video.image} 
                        alt={video.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/50 transition-colors flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 border border-white/30 shadow-xl">
                          <Play className="w-5 h-5 text-white ml-1" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded shadow-sm">
                        {video.duration}
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h4 className="font-bold text-slate-900 dark:text-white text-[15px] leading-snug line-clamp-2 mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" title={video.title}>
                        {video.title}
                      </h4>
                      <div className="mt-auto flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium pt-2">
                        <span className="flex items-center gap-1.5 capitalize"><Calendar className="w-3.5 h-3.5" /> {video.date}</span>
                        {video.views && <span>{video.views}</span>}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Botão de Carregar Mais */}
              {nextPageToken && (
                <div className="mt-8 flex justify-center">
                  <Button 
                    variant="secondary" 
                    onClick={() => fetchYouTubeData(nextPageToken)} 
                    isLoading={isLoadingMore}
                    className="w-full sm:w-auto h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500/30"
                  >
                    Carregar mais vídeos
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* =========================================
          MODAL DO YOUTUBE PLAYER
          ========================================= */}
      {selectedVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedVideo(null)}></div>
          
          <div className="relative w-full max-w-5xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800 z-10 animate-in zoom-in-95 duration-200">
            {/* Header do Modal */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent absolute top-0 w-full z-20 pointer-events-none">
              <h3 className="text-white font-bold flex items-center gap-2 text-sm drop-shadow-md pointer-events-auto">
                <Play className="w-4 h-4 text-red-500" /> Reprodutor
              </h3>
              <button 
                onClick={() => setSelectedVideo(null)}
                className="p-2 bg-black/50 hover:bg-black/80 rounded-full text-slate-300 hover:text-white transition-colors pointer-events-auto backdrop-blur-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Iframe 16:9 responsivo */}
            <div className="relative w-full aspect-video bg-black pt-14 md:pt-0">
              <iframe
                className="absolute inset-0 w-full h-full md:pt-14"
                src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1&rel=0`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}