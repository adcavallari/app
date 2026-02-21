import React, { useState, useEffect } from 'react';
import { Heart, BookOpen, Calendar, ArrowRight, CheckCircle2, ChevronRight, Bookmark } from 'lucide-react';
import { Card, Badge, Button } from '../components/ui';
import { useNavigate } from 'react-router-dom';

export default function Devotional() {
  const navigate = useNavigate();
  const [isRead, setIsRead] = useState(false);
  
  // Estado para recuperar onde o utilizador parou na Bíblia
  const [lastRead, setLastRead] = useState({ book: 'mt', chapter: 5, name: 'Mateus' });

  useEffect(() => {
    // Tenta recuperar do localStorage onde o utilizador parou na Bíblia
    const saved = localStorage.getItem('lastBibleRead');
    if (saved) {
      try {
        setLastRead(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao ler lastBibleRead");
      }
    }
  }, []);

  // Dados Mockados do Devocional
  const dailyDevotional = {
    title: "A Paz que Excede o Entendimento",
    reference: "Filipenses 4:7",
    text: "Em um mundo cheio de ruídos e ansiedades, somos frequentemente tentados a carregar pesos que não fomos chamados para suportar. A paz de Deus não é a ausência de problemas, mas a certeza da presença de Cristo no meio deles. Quando entregamos as nossas preocupações através da oração, Ele guarda a nossa mente e o nosso coração.",
    date: new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
  };

  const previousDevotionals = [
    { id: 1, title: "O Poder da Esperança", reference: "Romanos 15:13", date: "Ontem" },
    { id: 2, title: "Luz no Caminho", reference: "Salmos 119:105", date: "2 dias atrás" },
    { id: 3, title: "Força na Fraqueza", reference: "2 Coríntios 12:9", date: "3 dias atrás" },
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto pb-10">
      
      {/* Cabeçalho */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Heart className="w-6 h-6 md:w-8 md:h-8 text-rose-500" />
          Devocional Diário
        </h2>
        <p className="text-slate-500 dark:text-zinc-400 mt-1 text-sm md:text-base capitalize">
          {dailyDevotional.date}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* =========================================
            LEITURA PRINCIPAL DO DIA
            ========================================= */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-0 overflow-hidden border-slate-200/60 dark:border-white/5 relative">
            <div className="h-2 bg-gradient-to-r from-rose-400 to-orange-400 w-full"></div>
            <div className="p-6 md:p-8">
              <Badge className="bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-none mb-4 uppercase tracking-wider text-[10px] md:text-xs">
                Mensagem de Hoje
              </Badge>
              
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white leading-tight mb-2">
                {dailyDevotional.title}
              </h3>
              
              <div className="flex items-center text-indigo-600 dark:text-indigo-400 font-semibold text-sm mb-6">
                <BookOpen className="w-4 h-4 mr-2" /> {dailyDevotional.reference}
              </div>

              <div className="text-slate-700 dark:text-zinc-300 text-lg leading-relaxed font-serif mb-8">
                {dailyDevotional.text}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100 dark:border-white/5">
                <button 
                  onClick={() => setIsRead(!isRead)}
                  className={`flex items-center justify-center w-full sm:w-auto px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                    isRead 
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' 
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-transparent'
                  }`}
                >
                  <CheckCircle2 className={`w-5 h-5 mr-2 ${isRead ? 'text-emerald-500' : 'text-slate-400'}`} />
                  {isRead ? 'Marcado como Lido' : 'Marcar como Lido'}
                </button>

                {/* Botão para ir para a Bíblia no versículo do devocional */}
                <Button variant="ghost" className="w-full sm:w-auto text-indigo-600 dark:text-indigo-400">
                  Ler Contexto <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>

          {/* =========================================
              CONTINUAR LEITURA BÍBLICA (Integração)
              ========================================= */}
          <Card className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-none p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-indigo-500/20">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0">
                <Bookmark className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-indigo-200 text-sm font-medium uppercase tracking-wider mb-1">Continuar Leitura</p>
                <h4 className="text-xl font-bold text-white">{lastRead.name}, Cap. {lastRead.chapter}</h4>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/bible')}
              className="w-full sm:w-auto bg-white text-indigo-600 hover:bg-slate-50 border-none shadow-lg whitespace-nowrap"
            >
              Retomar <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Card>
        </div>

        {/* =========================================
            MENSAGENS ANTERIORES (Sidebar Mobile/Desktop)
            ========================================= */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight px-1">
            Mensagens Anteriores
          </h3>
          <div className="space-y-3">
            {previousDevotionals.map((dev) => (
              <Card key={dev.id} hover className="p-4 cursor-pointer border-slate-200/60 dark:border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-[10px] bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border-none">
                    <Calendar className="w-3 h-3 mr-1" /> {dev.date}
                  </Badge>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1 line-clamp-2">
                  {dev.title}
                </h4>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center">
                  <BookOpen className="w-3 h-3 mr-1" /> {dev.reference}
                </p>
              </Card>
            ))}
          </div>
          <Button variant="secondary" className="w-full h-12 text-sm mt-2">
            Ver Todo o Histórico
          </Button>
        </div>

      </div>
    </div>
  );
}