import React, { useState, useEffect, useRef } from 'react';
import { Search, Settings, Loader2, BookmarkPlus, ChevronDown, BookOpen, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { Card, Button, Input } from '../components/ui';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const DICC_LIVROS = {
  gn: "Gênesis", ex: "Êxodo", lv: "Levítico", nm: "Números", dt: "Deuteronômio",
  js: "Josué", jz: "Juízes", rt: "Rute", "1sm": "1 Samuel", "2sm": "2 Samuel",
  "1rs": "1 Reis", "2rs": "2 Reis", "1cr": "1 Crônicas", "2cr": "2 Crônicas",
  ed: "Esdras", ne: "Neemias", et: "Ester", jó: "Jó", sl: "Salmos", pv: "Provérbios",
  ec: "Eclesiastes", ct: "Cânticos", is: "Isaías", jr: "Jeremias", lm: "Lamentações",
  ez: "Ezequiel", dn: "Daniel", os: "Oséias", jl: "Joel", am: "Amós", ob: "Obadias",
  jn: "Jonas", mq: "Miquéias", na: "Naum", hc: "Habacuque", sf: "Sofonias",
  ag: "Ageu", zc: "Zacarias", ml: "Malaquias", mt: "Mateus", mc: "Marcos",
  lc: "Lucas", jo: "João", at: "Atos", rm: "Romanos", "1co": "1 Coríntios",
  "2co": "2 Coríntios", gl: "Gálatas", ef: "Efésios", fp: "Filipenses",
  cl: "Colossenses", "1ts": "1 Tessalonicenses", "2ts": "2 Tessalonicenses",
  "1tm": "1 Timóteo", "2tm": "2 Timóteo", tt: "Tito", fm: "Filemom",
  hb: "Hebreus", tg: "Tiago", "1pe": "1 Pedro", "2pe": "2 Pedro",
  "1jo": "1 João", "2jo": "2 João", "3jo": "3 João", jd: "Judas", ap: "Apocalipse"
};

export default function Bible() {
  const { user } = useAuth();
  const [bibleData, setBibleData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedBookIndex, setSelectedBookIndex] = useState(0);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [searchBook, setSearchBook] = useState('');
  
  // Referência para fazer o scroll voltar ao topo
  const scrollRef = useRef(null);
  
  // Controles de Navegação (Desktop e Mobile)
  const [showDesktopChapterGrid, setShowDesktopChapterGrid] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [mobileNavTab, setMobileNavTab] = useState('books'); // 'books' | 'chapters'

  useEffect(() => {
    fetch('/acf.json')
      .then(res => res.json())
      .then(data => {
        setBibleData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao carregar acf.json:", err);
        setLoading(false);
      });
  }, []);

  // Efeito que observa mudanças de capítulo e sobe a tela suavemente
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedChapter, selectedBookIndex]);

  const handleHighlight = async (verseIndex, text) => {
    if (!user) return;
    const bookAbbrev = bibleData[selectedBookIndex].abbrev;
    
    try {
      await supabase.from('bible_highlights').insert([{
        user_id: user.id,
        book: bookAbbrev,
        chapter: selectedChapter,
        verse: verseIndex + 1,
        text: text,
        color: 'yellow'
      }]);
      alert(`Versículo ${verseIndex + 1} marcado!`);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
        <p className="font-medium animate-pulse">Carregando as Sagradas Escrituras...</p>
      </div>
    );
  }

  if (!bibleData || bibleData.length === 0) {
    return (
      <Card className="p-10 text-center max-w-md mx-auto mt-10">
        <p className="text-red-500 font-bold mb-2 text-xl">Erro ao carregar a Bíblia</p>
        <p className="text-slate-500">Certifique-se de que o ficheiro <code className="bg-slate-100 dark:bg-zinc-800 px-2 py-1 rounded">acf.json</code> está na pasta <code className="bg-slate-100 dark:bg-zinc-800 px-2 py-1 rounded">public/</code> do seu projeto.</p>
      </Card>
    );
  }

  const currentBook = bibleData[selectedBookIndex];
  const chaptersCount = currentBook.chapters.length;
  const currentVerses = currentBook.chapters[selectedChapter - 1];
  const currentBookName = DICC_LIVROS[currentBook.abbrev] || currentBook.abbrev.toUpperCase();

  const filteredBooks = bibleData.map((b, i) => ({ ...b, originalIndex: i }))
    .filter(b => {
      const nome = DICC_LIVROS[b.abbrev] || b.abbrev;
      return nome.toLowerCase().includes(searchBook.toLowerCase());
    });

  // Funções de navegação rápida
  const handlePrevChapter = () => setSelectedChapter(prev => Math.max(1, prev - 1));
  const handleNextChapter = () => setSelectedChapter(prev => Math.min(chaptersCount, prev + 1));

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6 animate-in fade-in duration-500 relative">
      
      {/* =========================================================
          SIDEBAR DESKTOP (Livros)
          ========================================================= */}
      <Card className="hidden lg:flex flex-col w-72 p-0 overflow-hidden shrink-0 border-transparent shadow-lg bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
        <div className="p-4 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-zinc-950/50">
          <Input 
            placeholder="Buscar livro..." 
            icon={Search} 
            className="h-10 bg-white dark:bg-zinc-900 border-none shadow-sm" 
            value={searchBook}
            onChange={(e) => setSearchBook(e.target.value)}
          />
        </div>
        <div className="overflow-y-auto flex-1 p-3 space-y-1 scroll-smooth">
          {filteredBooks.map((livro) => {
            const isSelected = livro.originalIndex === selectedBookIndex;
            const nomeLivro = DICC_LIVROS[livro.abbrev] || livro.abbrev.toUpperCase();
            return (
              <button 
                key={livro.abbrev} 
                onClick={() => {
                  setSelectedBookIndex(livro.originalIndex);
                  setSelectedChapter(1);
                  setShowDesktopChapterGrid(true); // Abre os capítulos logo após escolher o livro
                }}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                  isSelected 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20" 
                    : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-zinc-100"
                )}
              >
                {nomeLivro}
              </button>
            )
          })}
        </div>
      </Card>

      {/* =========================================================
          ÁREA DE LEITURA PRINCIPAL
          ========================================================= */}
      <Card className="flex-1 flex flex-col p-0 overflow-hidden border-transparent shadow-xl bg-white dark:bg-[#0c0c0e] relative">
        
        {/* HEADER DA LEITURA (Desktop & Mobile) */}
        <div className="flex flex-col border-b border-slate-100 dark:border-white/5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl relative z-10 sticky top-0">
          <div className="flex items-center justify-between p-4">
            
            {/* Desktop: Título Fixo */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
                <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {currentBookName}
              </h2>
            </div>

            {/* Mobile: Título Clicável que abre o Navigation Overlay */}
            <button 
              className="sm:hidden flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-zinc-800 rounded-xl font-bold text-slate-800 dark:text-zinc-100 active:scale-95 transition-transform"
              onClick={() => {
                setMobileNavTab('books');
                setIsMobileNavOpen(true);
              }}
            >
              {currentBookName} {selectedChapter}
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>

            {/* Desktop: Botão de Capítulos */}
            <div className="hidden sm:flex items-center gap-3">
              <button 
                onClick={() => setShowDesktopChapterGrid(!showDesktopChapterGrid)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-white/10 rounded-xl font-bold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors shadow-sm"
              >
                Capítulo {selectedChapter}
                <ChevronDown className={cn("w-4 h-4 transition-transform text-slate-400", showDesktopChapterGrid && "rotate-180")} />
              </button>
              <Button variant="ghost" className="h-10 w-10 p-0 rounded-full bg-slate-50 dark:bg-zinc-800/50"><Settings className="w-5 h-5" /></Button>
            </div>

            {/* Mobile: Botão de Configurações */}
            <Button variant="ghost" className="sm:hidden h-10 w-10 p-0 rounded-full bg-slate-50 dark:bg-zinc-800/50">
              <Settings className="w-5 h-5" />
            </Button>
          </div>

          {/* Desktop: Grade de Capítulos Expansível */}
          {showDesktopChapterGrid && (
            <div className="hidden sm:block p-6 bg-slate-50/80 dark:bg-zinc-950/80 border-t border-slate-100 dark:border-white/5 animate-in slide-in-from-top-2 shadow-inner">
              <div className="grid grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3 max-w-5xl mx-auto">
                {Array.from({ length: chaptersCount }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => {
                      setSelectedChapter(i + 1);
                      setShowDesktopChapterGrid(false);
                    }}
                    className={cn(
                      "aspect-square rounded-xl font-bold text-sm flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50",
                      selectedChapter === i + 1
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-105"
                        : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-500 hover:text-indigo-600 dark:bg-zinc-900 dark:border-white/5 dark:text-zinc-400 dark:hover:border-indigo-400 dark:hover:text-indigo-400"
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* CONTEÚDO DA LEITURA (Texto Bíblico) */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-6 py-8 md:p-12 text-lg md:text-xl leading-loose text-slate-800 dark:text-[#d4d4d8] font-serif max-w-3xl mx-auto w-full scroll-smooth pb-32"
        >
          
          <h3 className="text-4xl font-extrabold mb-10 text-center font-sans tracking-tight opacity-20 dark:opacity-10 select-none">
            {currentBookName} {selectedChapter}
          </h3>

          <div className="space-y-4">
            {currentVerses.map((verse, idx) => (
              <div 
                key={idx} 
                className="group relative hover:bg-slate-50 dark:hover:bg-white/[0.02] p-3 -mx-3 rounded-2xl transition-colors cursor-text"
              >
                <p>
                  <sup className="text-[11px] font-bold text-indigo-500 dark:text-indigo-400 mr-3 select-none inline-block transform -translate-y-1">
                    {idx + 1}
                  </sup>
                  {verse}
                </p>
                {/* Botão de Highlight (Hover) */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity md:flex hidden">
                   <button 
                     onClick={() => handleHighlight(idx, verse)}
                     className="p-2.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-zinc-800 rounded-full shadow-lg border border-slate-100 dark:border-white/5 active:scale-90 transition-all" 
                     title="Marcar Versículo"
                   >
                     <BookmarkPlus className="w-5 h-5" />
                   </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Navegação Rápida no Fim do Capítulo (Visível primariamente no Desktop) */}
          <div className="mt-16 hidden md:flex items-center justify-between border-t border-slate-200 dark:border-zinc-800 pt-8">
            <Button 
              variant="secondary" 
              disabled={selectedChapter === 1}
              onClick={handlePrevChapter}
            >
              <ChevronLeft className="w-4 h-4 mr-2" /> Capítulo Anterior
            </Button>
            <Button 
              variant="secondary"
              disabled={selectedChapter === chaptersCount}
              onClick={handleNextChapter}
            >
              Próximo Capítulo <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* =========================================================
            BOTÕES FLUTUANTES (Exclusivo Mobile)
            ========================================================= */}
        <div className="sm:hidden absolute bottom-20 left-4 right-4 flex justify-between pointer-events-none z-30">
          <button 
            onClick={handlePrevChapter}
            disabled={selectedChapter === 1}
            className={cn(
              "pointer-events-auto flex items-center justify-center w-12 h-12 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200/80 dark:border-white/10 text-slate-700 dark:text-zinc-200 transition-all duration-300 active:scale-90",
              selectedChapter === 1 ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
            )}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button 
            onClick={handleNextChapter}
            disabled={selectedChapter === chaptersCount}
            className={cn(
              "pointer-events-auto flex items-center justify-center w-12 h-12 bg-indigo-600/95 backdrop-blur-xl rounded-full shadow-[0_8px_30px_rgb(99,102,241,0.3)] border border-indigo-500/50 text-white transition-all duration-300 active:scale-90",
              selectedChapter === chaptersCount ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"
            )}
          >
            <ChevronRight className="w-6 h-6 ml-0.5" />
          </button>
        </div>

      </Card>

      {/* =========================================================
          MENU DE NAVEGAÇÃO MOBILE (OVERLAY FULLSCREEN)
          ========================================================= */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 bg-white dark:bg-[#09090b] flex flex-col animate-in slide-in-from-bottom-full duration-300 lg:hidden">
          
          {/* Header do Overlay */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/5">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Navegação</h3>
            <button 
              onClick={() => setIsMobileNavOpen(false)}
              className="p-2 bg-slate-100 dark:bg-zinc-800 rounded-full text-slate-600 dark:text-zinc-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Abas (Livros / Capítulos) */}
          <div className="flex p-2 bg-slate-50 dark:bg-zinc-900/50 border-b border-slate-100 dark:border-white/5">
            <button 
              onClick={() => setMobileNavTab('books')}
              className={cn(
                "flex-1 py-2 text-sm font-bold rounded-lg transition-colors",
                mobileNavTab === 'books' ? "bg-white dark:bg-zinc-800 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-zinc-500"
              )}
            >
              Livros
            </button>
            <button 
              onClick={() => setMobileNavTab('chapters')}
              className={cn(
                "flex-1 py-2 text-sm font-bold rounded-lg transition-colors",
                mobileNavTab === 'chapters' ? "bg-white dark:bg-zinc-800 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-zinc-500"
              )}
            >
              Capítulos
            </button>
          </div>

          {/* Conteúdo Dinâmico do Overlay */}
          <div className="flex-1 overflow-y-auto p-4">
            
            {/* Lista de Livros */}
            {mobileNavTab === 'books' && (
              <div className="space-y-2 pb-10">
                <Input 
                  placeholder="Buscar livro..." 
                  icon={Search} 
                  className="mb-4 bg-slate-100 dark:bg-zinc-900 border-none" 
                  value={searchBook}
                  onChange={(e) => setSearchBook(e.target.value)}
                />
                {filteredBooks.map((livro) => {
                  const nomeLivro = DICC_LIVROS[livro.abbrev] || livro.abbrev.toUpperCase();
                  const isSelected = livro.originalIndex === selectedBookIndex;
                  return (
                    <button 
                      key={livro.abbrev} 
                      onClick={() => {
                        setSelectedBookIndex(livro.originalIndex);
                        setMobileNavTab('chapters'); // Vai para a aba de capítulos
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-4 rounded-xl text-left font-semibold border",
                        isSelected 
                          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300" 
                          : "border-slate-200 dark:border-white/5 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300"
                      )}
                    >
                      {nomeLivro}
                      <ChevronRight className={cn("w-5 h-5", isSelected ? "text-indigo-500" : "text-slate-300 dark:text-zinc-600")} />
                    </button>
                  )
                })}
              </div>
            )}

            {/* Grelha de Capítulos */}
            {mobileNavTab === 'chapters' && (
              <div>
                <h4 className="text-center font-bold text-slate-500 dark:text-zinc-400 mb-6 uppercase tracking-wider text-xs">
                  Escolha o Capítulo para {currentBookName}
                </h4>
                <div className="grid grid-cols-5 gap-3 pb-10">
                  {Array.from({ length: chaptersCount }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => {
                        setSelectedChapter(i + 1);
                        setIsMobileNavOpen(false); // Fecha o overlay e inicia a leitura
                      }}
                      className={cn(
                        "aspect-square rounded-2xl font-bold text-lg flex items-center justify-center transition-all duration-200",
                        selectedChapter === i + 1
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-105"
                          : "bg-white text-slate-700 border border-slate-200 active:bg-slate-100 dark:bg-zinc-900 dark:border-white/5 dark:text-zinc-300 dark:active:bg-zinc-800"
                      )}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        </div>
      )}

    </div>
  );
}