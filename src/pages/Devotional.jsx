import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, Plus, Archive, Edit2, Trash2, Clock, 
  Calendar as CalendarIcon, X, Save, BookMarked, AlignLeft, Search
} from 'lucide-react';
import { Card, Badge, Button, Input } from '../components/ui';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

// Dicionário com todos os livros da Bíblia e a sua quantidade exata de capítulos
const BIBLE_BOOKS = [
  { name: "Gênesis", abbrev: "gn", chapters: 50 }, { name: "Êxodo", abbrev: "ex", chapters: 40 },
  { name: "Levítico", abbrev: "lv", chapters: 27 }, { name: "Números", abbrev: "nm", chapters: 36 },
  { name: "Deuteronômio", abbrev: "dt", chapters: 34 }, { name: "Josué", abbrev: "js", chapters: 24 },
  { name: "Juízes", abbrev: "jz", chapters: 21 }, { name: "Rute", abbrev: "rt", chapters: 4 },
  { name: "1 Samuel", abbrev: "1sm", chapters: 31 }, { name: "2 Samuel", abbrev: "2sm", chapters: 24 },
  { name: "1 Reis", abbrev: "1rs", chapters: 22 }, { name: "2 Reis", abbrev: "2rs", chapters: 25 },
  { name: "1 Crônicas", abbrev: "1cr", chapters: 29 }, { name: "2 Crônicas", abbrev: "2cr", chapters: 36 },
  { name: "Esdras", abbrev: "ed", chapters: 10 }, { name: "Neemias", abbrev: "ne", chapters: 13 },
  { name: "Ester", abbrev: "et", chapters: 10 }, { name: "Jó", abbrev: "jó", chapters: 42 },
  { name: "Salmos", abbrev: "sl", chapters: 150 }, { name: "Provérbios", abbrev: "pv", chapters: 31 },
  { name: "Eclesiastes", abbrev: "ec", chapters: 12 }, { name: "Cânticos", abbrev: "ct", chapters: 8 },
  { name: "Isaías", abbrev: "is", chapters: 66 }, { name: "Jeremias", abbrev: "jr", chapters: 52 },
  { name: "Lamentações", abbrev: "lm", chapters: 5 }, { name: "Ezequiel", abbrev: "ez", chapters: 48 },
  { name: "Daniel", abbrev: "dn", chapters: 12 }, { name: "Oséias", abbrev: "os", chapters: 14 },
  { name: "Joel", abbrev: "jl", chapters: 3 }, { name: "Amós", abbrev: "am", chapters: 9 },
  { name: "Obadias", abbrev: "ob", chapters: 1 }, { name: "Jonas", abbrev: "jn", chapters: 4 },
  { name: "Miquéias", abbrev: "mq", chapters: 7 }, { name: "Naum", abbrev: "na", chapters: 3 },
  { name: "Habacuque", abbrev: "hc", chapters: 3 }, { name: "Sofonias", abbrev: "sf", chapters: 3 },
  { name: "Ageu", abbrev: "ag", chapters: 2 }, { name: "Zacarias", abbrev: "zc", chapters: 14 },
  { name: "Malaquias", abbrev: "ml", chapters: 4 }, { name: "Mateus", abbrev: "mt", chapters: 28 },
  { name: "Marcos", abbrev: "mc", chapters: 16 }, { name: "Lucas", abbrev: "lc", chapters: 24 },
  { name: "João", abbrev: "jo", chapters: 21 }, { name: "Atos", abbrev: "at", chapters: 28 },
  { name: "Romanos", abbrev: "rm", chapters: 16 }, { name: "1 Coríntios", abbrev: "1co", chapters: 16 },
  { name: "2 Coríntios", abbrev: "2co", chapters: 13 }, { name: "Gálatas", abbrev: "gl", chapters: 6 },
  { name: "Efésios", abbrev: "ef", chapters: 6 }, { name: "Filipenses", abbrev: "fp", chapters: 4 },
  { name: "Colossenses", abbrev: "cl", chapters: 4 }, { name: "1 Tessalonicenses", abbrev: "1ts", chapters: 5 },
  { name: "2 Tessalonicenses", abbrev: "2ts", chapters: 3 }, { name: "1 Timóteo", abbrev: "1tm", chapters: 6 },
  { name: "2 Timóteo", abbrev: "2tm", chapters: 4 }, { name: "Tito", abbrev: "tt", chapters: 3 },
  { name: "Filemom", abbrev: "fm", chapters: 1 }, { name: "Hebreus", abbrev: "hb", chapters: 13 },
  { name: "Tiago", abbrev: "tg", chapters: 5 }, { name: "1 Pedro", abbrev: "1pe", chapters: 5 },
  { name: "2 Pedro", abbrev: "2pe", chapters: 3 }, { name: "1 João", abbrev: "1jo", chapters: 5 },
  { name: "2 João", abbrev: "2jo", chapters: 1 }, { name: "3 João", abbrev: "3jo", chapters: 1 },
  { name: "Judas", abbrev: "jd", chapters: 1 }, { name: "Apocalipse", abbrev: "ap", chapters: 22 }
];

export default function Devotional() {
  const { user } = useAuth();
  const navigate = typeof useNavigate !== 'undefined' ? useNavigate() : useNavigateMock();
  
  const todayObj = new Date();
  const todayString = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;

  // =====================================================================
  // ESTADOS GERAIS E MODAIS
  // =====================================================================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [viewingNote, setViewingNote] = useState(null);
  
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [historySearch, setHistorySearch] = useState('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [openDropdown, setOpenDropdown] = useState(null); // Controla os dropdowns customizados ('book', 'chapter')

  // Estado do Formulário reflete a estrutura da sua BD
  const [formData, setFormData] = useState({ 
    book: 'Mateus', 
    chapter: 1, 
    notes: '' 
  });

  const [devotionals, setDevotionals] = useState([]);

  // =====================================================================
  // BUSCAR DADOS NO SUPABASE
  // =====================================================================
  useEffect(() => {
    if (user) {
      fetchDevotionals();
    }
  }, [user]);

  const fetchDevotionals = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('personal_devotionals')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        setDevotionals(data);
      }
    } catch (error) {
      console.error('Erro ao buscar devocionais:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Ordenação extra no frontend
  const sortedNotes = [...devotionals].sort((a, b) => {
    const dateA = new Date(a.created_at || a.date);
    const dateB = new Date(b.created_at || b.date);
    return dateB - dateA;
  });

  const recentNotes = sortedNotes.slice(0, 6);

  const filteredHistory = sortedNotes.filter(item => {
    const searchLower = historySearch.toLowerCase();
    const reference = `${item.book} ${item.chapter}`.toLowerCase();
    return reference.includes(searchLower) || (item.notes && item.notes.toLowerCase().includes(searchLower));
  });

  // =====================================================================
  // FUNÇÕES UTILITÁRIAS
  // =====================================================================
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return 'Sem data';
    if (dateStr === todayString) return 'Hoje';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const [y, m, d] = parts;
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${d} de ${months[parseInt(m) - 1]}`;
  };

  // Formatar hora com base no created_at
  const formatTimeFromCreatedAt = (createdAtString) => {
    if (!createdAtString) return '';
    try {
      const date = new Date(createdAtString);
      return date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  const getReferenceString = (item) => {
    return `${item.book} ${item.chapter}`;
  };

  const getChaptersForBook = (bookName) => {
    const book = BIBLE_BOOKS.find(b => b.name === bookName);
    return book ? book.chapters : 1;
  };

  // =====================================================================
  // CÁLCULO DA PRÓXIMA LEITURA
  // =====================================================================
  let nextBookName = 'Gênesis';
  let nextChapter = 1;
  let nextBookAbbrev = 'gn';

  if (sortedNotes.length > 0) {
    const lastNote = sortedNotes[0];
    const currentBookObj = BIBLE_BOOKS.find(b => b.name === lastNote.book);
    
    if (currentBookObj) {
      nextBookName = currentBookObj.name;
      nextChapter = parseInt(lastNote.chapter) + 1;
      nextBookAbbrev = currentBookObj.abbrev;

      if (nextChapter > currentBookObj.chapters) {
        const currentBookIndex = BIBLE_BOOKS.findIndex(b => b.name === lastNote.book);
        if (currentBookIndex < BIBLE_BOOKS.length - 1) {
          const nextBookObj = BIBLE_BOOKS[currentBookIndex + 1];
          nextBookAbbrev = nextBookObj.abbrev;
          nextBookName = nextBookObj.name;
          nextChapter = 1;
        } else {
          nextBookAbbrev = BIBLE_BOOKS[0].abbrev;
          nextBookName = BIBLE_BOOKS[0].name;
          nextChapter = 1;
        }
      }
    }
  }

  // =====================================================================
  // AÇÕES CRUD NO SUPABASE
  // =====================================================================
  
  const handleContinueReading = () => {
    navigate('/bible', { 
      state: { book: nextBookAbbrev, chapter: nextChapter } 
    });
  };

  const handleOpenNew = () => {
    setFormData({ book: nextBookName, chapter: nextChapter, notes: '' });
    setEditingNoteId(null);
    setOpenDropdown(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item, e) => {
    if (e) e.stopPropagation();
    setFormData({ 
      book: item.book, 
      chapter: item.chapter, 
      notes: item.notes 
    });
    setEditingNoteId(item.id);
    setOpenDropdown(null);
    setIsModalOpen(true);
    setViewingNote(null);
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (window.confirm('Tem a certeza que quer apagar esta anotação? Esta ação não pode ser desfeita.')) {
      try {
        const { error } = await supabase
          .from('personal_devotionals')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setDevotionals(prev => prev.filter(item => item.id !== id));
        setViewingNote(null);
      } catch (error) {
        console.error('Erro ao apagar devocional:', error.message);
        alert('Erro ao apagar devocional. Tente novamente.');
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.notes.trim()) return;

    setIsSaving(true);

    // Payload de acordo com as colunas da sua tabela
    const notePayload = {
      user_id: user.id,
      date: todayString,
      book: formData.book,
      chapter: formData.chapter,
      notes: formData.notes
      // created_at e id são gerados pelo Supabase
    };

    try {
      if (editingNoteId) {
        // Atualizar existente
        const { data, error } = await supabase
          .from('personal_devotionals')
          .update(notePayload)
          .eq('id', editingNoteId)
          .select()
          .single();

        if (error) throw error;

        if (data) {
          setDevotionals(prev => prev.map(n => n.id === editingNoteId ? data : n));
        }
      } else {
        // Criar novo
        const { data, error } = await supabase
          .from('personal_devotionals')
          .insert([notePayload])
          .select()
          .single();

        if (error) throw error;

        if (data) {
          setDevotionals(prev => [data, ...prev]);
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao salvar devocional:', error.message);
      alert('Erro ao salvar devocional. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto pb-28 md:pb-10">
        
        {/* ===============================
            CABEÇALHO DA PÁGINA
            =============================== */}
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-indigo-500" /> Meu Devocional
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            O seu diário de leitura bíblica. Registe tudo o que Deus falar consigo.
          </p>
        </div>

        {/* ===============================
            BARRA DE AÇÕES (Linha no Topo)
            =============================== */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900/80 backdrop-blur-md p-4 md:p-5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
          
          <div className="flex flex-col sm:flex-row items-center w-full lg:w-auto gap-3 p-2 sm:pl-5 rounded-xl">
            <span className="text-lg font-semibold text-slate-600 dark:text-slate-300 text-center sm:text-left">
              Próxima leitura: <span className="text-indigo-600 dark:text-indigo-400 font-bold ml-1">{nextBookName} {nextChapter}</span>
            </span>
            <Button 
              onClick={handleContinueReading}
              className="w-full sm:w-auto h-10 px-5 shadow-indigo-500/25"
            >
              <BookOpen className="w-4 h-4 mr-2" /> Continuar
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
            <Button 
              variant="secondary" 
              onClick={() => setIsHistoryModalOpen(true)}
              className="w-full sm:w-auto h-12 bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-white/5"
            >
              <Archive className="w-5 h-5 mr-2" /> Ver Histórico
            </Button>
            <Button onClick={handleOpenNew} className="w-full sm:w-auto h-12 shadow-indigo-500/25">
              <Plus className="w-5 h-5 mr-2" /> Novo Devocional
            </Button>
          </div>
          
        </div>

        {/* ===============================
            GRELHA DE CARDS RECENTES
            =============================== */}
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-sm flex items-center gap-2">
              <BookMarked className="w-4 h-4" />
              Anotações Recentes
            </h3>
            <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400">
              {devotionals.length} Total
            </Badge>
          </div>

          {isLoading ? (
             <div className="flex flex-col items-center justify-center p-12 text-slate-500">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-4"></div>
               <p>A carregar os seus devocionais...</p>
             </div>
          ) : recentNotes.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/30">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-300 dark:text-slate-600">
                <AlignLeft className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">O seu diário está vazio</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm leading-relaxed mb-6">
                Comece hoje mesmo a registar as suas reflexões diárias na Palavra de Deus.
              </p>
              <Button onClick={handleOpenNew}>
                <Plus className="w-4 h-4 mr-2" /> Criar a Primeira Anotação
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {recentNotes.map((item) => {
                const isToday = item.date === todayString;
                
                return (
                  <Card 
                    key={item.id} 
                    hover 
                    onClick={() => setViewingNote(item)}
                    className="p-0 overflow-hidden flex flex-col h-full border-slate-200/80 dark:border-white/5 group"
                  >
                    <div className={cn("h-1.5 w-full", isToday ? "bg-indigo-500" : "bg-slate-300 dark:bg-slate-700")}></div>
                    
                    <div className="p-5 md:p-6 flex-1 flex flex-col relative">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-col gap-1.5">
                          <Badge className={cn("w-fit font-bold", isToday ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400" : "bg-slate-100 dark:bg-slate-800")}>
                            <CalendarIcon className="w-3 h-3 mr-1.5" /> {formatDisplayDate(item.date)}
                          </Badge>
                          <h4 className="font-bold text-xl text-slate-900 dark:text-white leading-tight line-clamp-1">
                            {getReferenceString(item)}
                          </h4>
                        </div>
                        
                        {isToday && (
                          <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity absolute right-4 top-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl p-1 shadow-sm border border-slate-100 dark:border-white/5">
                            <button 
                              onClick={(e) => handleOpenEdit(item, e)}
                              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 dark:hover:text-indigo-400 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => handleDelete(item.id, e)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 dark:hover:text-red-400 rounded-lg transition-colors"
                              title="Apagar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[15px] line-clamp-4 flex-1 whitespace-pre-wrap">
                        {item.notes}
                      </p>

                      <div className="mt-5 flex items-center justify-between text-xs font-semibold text-slate-400 dark:text-slate-500 pt-4 border-t border-slate-100 dark:border-white/5">
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {formatTimeFromCreatedAt(item.created_at)}</span>
                        <span className="text-indigo-500 font-bold group-hover:underline">Ler tudo</span>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* =========================================================
          MODAL: LER DEVOCIONAL COMPLETO
          ========================================================= */}
      {viewingNote && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setViewingNote(null)}></div>
          
          <div className="relative bg-white dark:bg-slate-950 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-start p-6 border-b border-slate-100 dark:border-white/5 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <Badge className={cn("mb-3", viewingNote.date === todayString ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400" : "bg-slate-200 dark:bg-slate-800")}>
                  {formatDisplayDate(viewingNote.date)} às {formatTimeFromCreatedAt(viewingNote.created_at)}
                </Badge>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-indigo-500" />
                  {getReferenceString(viewingNote)}
                </h3>
              </div>
              <button onClick={() => setViewingNote(null)} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-800">
              <p className="text-slate-700 dark:text-slate-200 text-[16px] leading-loose whitespace-pre-wrap break-words">
                {viewingNote.notes}
              </p>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-white/5 flex gap-3 justify-end shrink-0">
              {viewingNote.date === todayString && (
                <>
                  <Button variant="danger" onClick={(e) => handleDelete(viewingNote.id, e)}>
                    <Trash2 className="w-4 h-4 mr-2" /> Apagar
                  </Button>
                  <Button variant="secondary" onClick={(e) => handleOpenEdit(viewingNote, e)}>
                    <Edit2 className="w-4 h-4 mr-2" /> Editar
                  </Button>
                </>
              )}
              <Button onClick={() => setViewingNote(null)}>Fechar</Button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: HISTÓRICO DE DEVOCIONAIS
          ========================================================= */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setIsHistoryModalOpen(false)}></div>
          
          <div className="relative bg-white dark:bg-slate-950 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col h-[85vh]">
            
            <div className="p-6 border-b border-slate-100 dark:border-white/5 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Archive className="w-5 h-5 text-indigo-500" /> Histórico Completo
                </h3>
                <button onClick={() => setIsHistoryModalOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <Input 
                icon={Search} 
                placeholder="Pesquisar por livro, capítulo ou palavras do texto..." 
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="bg-white dark:bg-slate-900 shadow-sm"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30 dark:bg-transparent [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-800">
              {filteredHistory.length === 0 ? (
                <div className="text-center text-slate-500 py-10">Nenhum devocional encontrado.</div>
              ) : (
                filteredHistory.map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => setViewingNote(item)}
                    className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl hover:border-indigo-500/50 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {getReferenceString(item)}
                      </h4>
                      <Badge className="bg-slate-100 dark:bg-slate-800 font-semibold">
                        {formatDisplayDate(item.date)}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                      {item.notes}
                    </p>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: CRIAR / EDITAR ANOTAÇÃO
          ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative bg-white dark:bg-slate-950 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-white/5 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-500" />
                  {editingNoteId ? 'Editar Anotação' : 'Novo Devocional'}
                </h3>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
                  Data de Hoje
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-5 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                
                {/* Linha de Referência Bíblica (Dropdowns Customizados) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full relative">
                  
                  {/* Backdrop invisível para fechar os dropdowns ao clicar fora */}
                  {openDropdown && (
                    <div className="fixed inset-0 z-[130]" onClick={() => setOpenDropdown(null)}></div>
                  )}

                  <div className="space-y-1.5 min-w-0 relative z-[140]">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Livro</label>
                    <button
                      type="button"
                      onClick={() => setOpenDropdown(openDropdown === 'book' ? null : 'book')}
                      className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2 text-[15px] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100 shadow-sm transition-colors text-left"
                    >
                      <span className="truncate">{formData.book}</span>
                      <ChevronDownIcon className={cn("w-4 h-4 text-slate-400 transition-transform", openDropdown === 'book' && "rotate-180")} />
                    </button>
                    
                    {openDropdown === 'book' && (
                      <div className="absolute top-full mt-2 w-full max-h-[40vh] sm:max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white py-2 shadow-xl dark:border-white/10 dark:bg-slate-900 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {BIBLE_BOOKS.map(book => (
                          <button
                            key={book.name}
                            type="button"
                            onClick={() => {
                              setFormData({...formData, book: book.name, chapter: 1});
                              setOpenDropdown(null);
                            }}
                            className={cn(
                              "w-full px-4 py-3 text-left text-[15px] transition-colors",
                              formData.book === book.name ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 font-semibold" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                            )}
                          >
                            {book.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 min-w-0 relative z-[135]">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Capítulo</label>
                    <button
                      type="button"
                      onClick={() => setOpenDropdown(openDropdown === 'chapter' ? null : 'chapter')}
                      className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2 text-[15px] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100 shadow-sm transition-colors text-left"
                    >
                      <span className="truncate">{formData.chapter}</span>
                      <ChevronDownIcon className={cn("w-4 h-4 text-slate-400 transition-transform", openDropdown === 'chapter' && "rotate-180")} />
                    </button>
                    
                    {openDropdown === 'chapter' && (
                      <div className="absolute top-full mt-2 w-full max-h-[40vh] sm:max-h-60 overflow-y-auto rounded-xl border border-slate-200 bg-white py-2 shadow-xl dark:border-white/10 dark:bg-slate-900 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {Array.from({ length: getChaptersForBook(formData.book) }, (_, i) => (
                          <button
                            key={i + 1}
                            type="button"
                            onClick={() => {
                              setFormData({...formData, chapter: i + 1});
                              setOpenDropdown(null);
                            }}
                            className={cn(
                              "w-full px-4 py-3 text-left text-[15px] transition-colors",
                              formData.chapter === i + 1 || formData.chapter === String(i + 1) ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 font-semibold" : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                            )}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 flex-1 flex flex-col h-full min-h-[250px]">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                    O que Deus falou consigo?
                  </label>
                  <Input 
                    required
                    as="textarea"
                    placeholder="Escreva a sua reflexão, versículos, estudo ou oração aqui..." 
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                    className="flex-1 min-h-[200px]"
                  />
                </div>

              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-white/5 flex gap-3 justify-end shrink-0">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'A guardar...' : <><Save className="w-4 h-4 mr-2" /> Guardar Anotação</>}
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}

    </>
  );
}

// Ícone Utilitário Interno
const ChevronDownIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);