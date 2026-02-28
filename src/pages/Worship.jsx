import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Calendar as CalendarIcon, ChevronRight, ChevronLeft, 
  ChevronsLeft, ChevronsRight, Plus, X, Search, Music, 
  Guitar, Link as LinkIcon, Loader2, Trash2, ExternalLink, Lightbulb, CheckCircle2, Library, Clock, Info
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Card, Badge, Button, Input } from '../components/ui';
import { cn } from '../lib/utils';

export default function Worship() {
  const { profile } = useAuth();
  
  const userRole = (profile?.role || 'membro').toLowerCase(); 
  const isAdminOrPastor = ['admin', 'pastor'].includes(userRole);
  const isLider = ['lider', 'líder'].includes(userRole) || isAdminOrPastor;

  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [activeDay, setActiveDay] = useState(today.getDate());
  
  const [events, setEvents] = useState([]);
  const [songsCatalog, setSongsCatalog] = useState([]);
  const [suggestions, setSuggestions] = useState([]); 
  const [setlists, setSetlists] = useState([]); 
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [isSetlistModalOpen, setIsSetlistModalOpen] = useState(false);
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const [isViewSuggestionsOpen, setIsViewSuggestionsOpen] = useState(false);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [isSongFormModalOpen, setIsSongFormModalOpen] = useState(false);

  const [editingSetlist, setEditingSetlist] = useState(null); 
  const [selectedEventId, setSelectedEventId] = useState('');
  const [worshipType, setWorshipType] = useState('banda'); 
  const [songsForm, setSongsForm] = useState([]);
  const [songCatalogForm, setSongCatalogForm] = useState({ id: null, title: '', artist: '', default_band_key: '', default_vocal_key: '', default_bpm: '', link: '' });
  const [suggestForm, setSuggestForm] = useState({ title: '', artist: '', notes: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [hasNewSuggestions, setHasNewSuggestions] = useState(false);
  const [selectedSongDetail, setSelectedSongDetail] = useState(null);

  // =========================================================================
  // FETCH DATA
  // =========================================================================
  useEffect(() => {
    fetchData();
  }, [currentDate.getMonth(), currentDate.getFullYear()]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: catalogData } = await supabase.from('songs').select('*').order('title');
      setSongsCatalog(catalogData || []);

      if (isLider) {
        const { data: reqData } = await supabase.from('song_suggestions').select('*').order('created_at', { ascending: false });
        setSuggestions(reqData || []);
        
        const storedSeenCount = parseInt(localStorage.getItem('@Worship:seenSuggestionsCount') || '0', 10);
        if ((reqData || []).length > storedSeenCount) {
          setHasNewSuggestions(true);
        }
      }

      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59).toISOString();
      
      const { data: eventsData } = await supabase.from('events').select('*').gte('date', firstDay).lte('date', lastDay).order('date', { ascending: true });
      
      const formattedEvents = (eventsData || []).map(ev => {
        const dateObj = new Date(ev.date);
        return {
          id: ev.id, title: ev.title, location: ev.location || 'Não informado',
          date: dateObj, time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          day: dateObj.getDate(), month: dateObj.getMonth(), year: dateObj.getFullYear()
        };
      });
      setEvents(formattedEvents);

      if (formattedEvents.length > 0) {
        const eventIds = formattedEvents.map(e => e.id);
        const { data: schedulesData } = await supabase.from('worship_schedules').select('*, worship_schedule_songs(*, songs(*))').in('event_id', eventIds);
        setSetlists(schedulesData || []);
      } else {
        setSetlists([]);
      }
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================================
  // CALENDÁRIO LOGIC
  // =========================================================================
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const daysOfWeek = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  const daysInMonthCount = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const startDayOffset = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const daysInMonth = Array.from({ length: daysInMonthCount }, (_, i) => i + 1);
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevYear = () => setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1));
  const nextYear = () => setCurrentDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1));
  const displayEvents = events.filter(ev => activeDay ? ev.day === activeDay : true);

  // =========================================================================
  // FUNÇÕES GERAIS
  // =========================================================================
  const openSongForm = (song = null) => { setSongCatalogForm(song || { id: null, title: '', artist: '', default_band_key: '', default_vocal_key: '', default_bpm: '', link: '' }); setIsSongFormModalOpen(true); };
  
  const saveCatalogSong = async (e) => {
    e.preventDefault(); if (!songCatalogForm.title.trim()) return alert("O nome da música é obrigatório."); setIsSaving(true);
    try {
      const payload = { title: songCatalogForm.title, artist: songCatalogForm.artist, default_band_key: songCatalogForm.default_band_key, default_vocal_key: songCatalogForm.default_vocal_key, default_bpm: songCatalogForm.default_bpm ? parseInt(songCatalogForm.default_bpm) : null, link: songCatalogForm.link };
      if (songCatalogForm.id) await supabase.from('songs').update(payload).eq('id', songCatalogForm.id); else await supabase.from('songs').insert([payload]);
      setIsSongFormModalOpen(false); fetchData();
    } catch (error) { console.error(error); } finally { setIsSaving(false); }
  };
  const deleteCatalogSong = async (id, e) => { e.preventDefault(); if (confirm("Remover do acervo?")) { await supabase.from('songs').delete().eq('id', id); fetchData(); } };

  const getEmptySongRow = () => ({ song_id: '', band_key: '', vocal_key: '', bpm: '', link: '', last_played: null, search: '' });
  const openSetlistModal = (event, existingSetlist = null) => {
    setSelectedEventId(event.id);
    if (existingSetlist) {
      setEditingSetlist(existingSetlist.id); setWorshipType(existingSetlist.worship_type || 'banda');
      const mappedSongs = (existingSetlist.worship_schedule_songs || []).map(s => ({ song_id: s.song_id, band_key: s.band_key || '', vocal_key: s.vocal_key || '', bpm: s.bpm || '', link: s.link || '', search: s.songs ? `${s.songs.title} - ${s.songs.artist}` : '', last_played: null }));
      setSongsForm(mappedSongs.length > 0 ? mappedSongs : [getEmptySongRow()]);
    } else {
      setEditingSetlist(null); setWorshipType('banda'); setSongsForm([getEmptySongRow()]);
    }
    setIsSetlistModalOpen(true);
  };

  const addSongRow = (e) => { e.preventDefault(); setSongsForm([...songsForm, getEmptySongRow()]); };
  const removeSongRow = (index, e) => { e.preventDefault(); const newForm = [...songsForm]; newForm.splice(index, 1); setSongsForm(newForm); };
  const updateSongField = (index, field, value) => { const newForm = [...songsForm]; newForm[index][field] = value; setSongsForm(newForm); };

  const handleSelectSong = async (index, songId) => {
    const song = songsCatalog.find(s => s.id === songId); if (!song) return;
    const newForm = [...songsForm];
    newForm[index] = { ...newForm[index], song_id: song.id, search: `${song.title} - ${song.artist || ''}`, band_key: song.default_band_key || '', vocal_key: song.default_vocal_key || '', bpm: song.default_bpm || '', link: song.link || '', last_played: 'Buscando...' };
    setSongsForm(newForm);
    try {
      const { data } = await supabase.from('worship_schedule_songs').select('worship_schedules(event_id, events(date))').eq('song_id', song.id).order('id', { ascending: false }).limit(1);
      newForm[index].last_played = (data && data.length > 0 && data[0].worship_schedules?.events?.date) ? new Date(data[0].worship_schedules.events.date).toLocaleDateString('pt-PT') : 'Nunca tocada';
      setSongsForm([...newForm]);
    } catch (e) { console.error(e); }
  };

  const saveSetlist = async (e) => {
    e.preventDefault(); const cleanSongs = songsForm.filter(s => s.song_id !== ''); if (cleanSongs.length === 0) return alert("Selecione pelo menos uma música."); setIsSaving(true);
    try {
      let scheduleId = editingSetlist;
      if (!scheduleId) {
        const { data, error } = await supabase.from('worship_schedules').insert([{ event_id: selectedEventId, worship_type: worshipType }]).select();
        if (error) throw error; scheduleId = data[0].id;
      } else {
        await supabase.from('worship_schedules').update({ worship_type: worshipType }).eq('id', scheduleId); await supabase.from('worship_schedule_songs').delete().eq('worship_schedule_id', scheduleId);
      }
      const songsToInsert = cleanSongs.map((s, idx) => ({ worship_schedule_id: scheduleId, song_id: s.song_id, band_key: s.band_key, vocal_key: s.vocal_key, bpm: s.bpm ? parseInt(s.bpm) : null, link: s.link, order_index: idx }));
      await supabase.from('worship_schedule_songs').insert(songsToInsert); setIsSetlistModalOpen(false); fetchData();
    } catch (error) { console.error(error); } finally { setIsSaving(false); }
  };

  const deleteSetlist = async (e) => { e.preventDefault(); if (confirm("Apagar escala?")) { setIsSaving(true); try { await supabase.from('worship_schedules').delete().eq('id', editingSetlist); setIsSetlistModalOpen(false); fetchData(); } catch (error) { console.error(error); } finally { setIsSaving(false); } } };

  const saveSuggestion = async (e) => { e.preventDefault(); if (!suggestForm.title.trim()) return; setIsSaving(true); try { await supabase.from('song_suggestions').insert([{ title: suggestForm.title, artist: suggestForm.artist, notes: suggestForm.notes, user_name: profile?.name || profile?.full_name || 'Membro' }]); setIsSuggestModalOpen(false); setSuggestForm({ title: '', artist: '', notes: '' }); fetchData(); } catch (error) { console.error(error); } finally { setIsSaving(false); } };
  const deleteSuggestion = async (id, e) => { e.preventDefault(); if (confirm("Remover sugestão?")) { await supabase.from('song_suggestions').delete().eq('id', id); fetchData(); } };
  const addSuggestionToCatalog = (req, e) => { e.preventDefault(); openSongForm({ id: null, title: req.title, artist: req.artist, default_band_key: '', default_vocal_key: '', default_bpm: '', link: '' }); setIsViewSuggestionsOpen(false); };
  
  const searchCifra = (song, artist, e) => { e.preventDefault(); window.open(`https://www.cifraclub.com.br/?q=${encodeURIComponent(`${song} ${artist || ''}`)}`, '_blank'); };
  const searchYouTube = (song, artist, type, e) => { e.preventDefault(); window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(`${song} ${artist || ''} ${type === 'playback' ? 'playback' : 'ao vivo'}`)}`, '_blank'); };

  const handleOpenSuggestions = () => {
    setIsViewSuggestionsOpen(true);
    setHasNewSuggestions(false);
    localStorage.setItem('@Worship:seenSuggestionsCount', suggestions.length.toString());
  };

  // =========================================================================
  // COMPONENTES INTERNOS
  // =========================================================================
  const SearchableSelect = ({ index, value, onSelect, catalog }) => {
    const [isOpen, setIsOpen] = useState(false); const [search, setSearch] = useState(value); const wrapperRef = useRef(null);
    useEffect(() => setSearch(value), [value]);
    useEffect(() => { const handleClickOutside = (event) => { if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false); }; document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside); }, []);
    const filtered = catalog.filter(s => `${s.title} ${s.artist}`.toLowerCase().includes(search.toLowerCase()));
    return (
      <div ref={wrapperRef} className="relative w-full">
        <Input placeholder="Pesquisar no acervo..." value={search} onChange={e => { setSearch(e.target.value); setIsOpen(true); }} onFocus={() => setIsOpen(true)} className="bg-white dark:bg-slate-950" />
        {isOpen && (
          <div className="absolute z-[200] w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-48 overflow-y-auto p-1">
            {filtered.length === 0 ? <div className="p-3 text-sm text-slate-500 text-center">Nenhuma música encontrada.</div> : filtered.map(s => (
                <button key={s.id} type="button" onClick={() => { onSelect(index, s.id); setIsOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg text-sm transition-colors">
                  <span className="font-bold text-slate-900 dark:text-white">{s.title}</span> <span className="text-slate-500 dark:text-slate-400 ml-2">{s.artist}</span>
                </button>
              ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto pb-28 md:pb-10 px-4 sm:px-6 lg:px-8 mt-6">
      
      {/* HEADER E AÇÕES */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Music className="w-7 h-7 md:w-8 md:h-8 text-indigo-500 shrink-0" /> Escalas de Louvor
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gira as escalas, músicas e tons para cada culto.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {isLider && (
            <>
              <Button onClick={() => setIsCatalogModalOpen(true)} variant="secondary" className="flex-1 md:flex-none h-12">
                <Library className="w-5 h-5 md:mr-2" /> <span className="hidden md:block">Acervo de Músicas</span>
              </Button>
              <Button onClick={handleOpenSuggestions} variant="secondary" className="flex-1 md:flex-none h-12 relative">
                <Lightbulb className="w-5 h-5 md:mr-2" /> <span className="hidden md:block">Ver Sugestões</span>
                {hasNewSuggestions && <span className="absolute top-2 right-3 md:-top-1 md:-right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 shadow-sm animate-pulse" />}
              </Button>
            </>
          )}
          <Button onClick={() => setIsSuggestModalOpen(true)} className="flex-1 md:flex-none h-12 bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20">
            <Plus className="w-5 h-5 md:mr-2" /> <span className="hidden md:block">Sugerir Música</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* CALENDÁRIO */}
        <Card className="lg:col-span-1 p-4 md:p-6 sticky top-24 order-2 lg:order-1 w-full border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-1">
              <button onClick={prevYear} className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded hover:bg-slate-100 dark:hover:bg-slate-800"><ChevronsLeft className="w-5 h-5" /></button>
              <button onClick={prevMonth} className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded hover:bg-slate-100 dark:hover:bg-slate-800"><ChevronLeft className="w-5 h-5" /></button>
            </div>
            <h3 className="font-bold text-sm md:text-[15px] text-slate-900 dark:text-white uppercase tracking-wider truncate px-1 text-center flex-1">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <div className="flex gap-1">
              <button onClick={nextMonth} className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded hover:bg-slate-100 dark:hover:bg-slate-800"><ChevronRight className="w-5 h-5" /></button>
              <button onClick={nextYear} className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded hover:bg-slate-100 dark:hover:bg-slate-800"><ChevronsRight className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {daysOfWeek.map((d, i) => <div key={i} className="text-xs font-bold text-slate-400 dark:text-slate-500 py-1">{d}</div>)}
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: startDayOffset }).map((_, i) => <div key={`empty-${i}`} />)}
            {daysInMonth.map((day) => {
              const dayEvents = events.filter(e => e.day === day);
              const hasEvent = dayEvents.length > 0;
              const hasSetlist = dayEvents.some(ev => setlists.find(s => s.event_id === ev.id));
              const isSelected = activeDay === day;
              
              return (
                <button 
                  key={day} onClick={() => setActiveDay(activeDay === day ? null : day)}
                  className={cn("relative aspect-square rounded-xl flex items-center justify-center text-sm font-semibold transition-all duration-200", isSelected ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30 scale-105" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800", hasSetlist && !isSelected ? "font-bold text-indigo-600 dark:text-indigo-400" : hasEvent && !isSelected ? "font-bold text-slate-900 dark:text-white" : "")}
                >
                  {day}
                  {hasEvent && !isSelected && <span className={cn("absolute bottom-1 w-1 h-1 rounded-full", hasSetlist ? "bg-indigo-500" : "bg-slate-300 dark:bg-slate-600")}></span>}
                </button>
              )
            })}
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center flex flex-col gap-2">
            <div className="flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 mr-1"></span> Evento</span>
              <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-indigo-500 mr-1"></span> Escala Definida</span>
            </div>
            <Button variant="ghost" onClick={() => setActiveDay(null)} className="w-full text-xs h-9 mt-2">Ver todos os eventos</Button>
          </div>
        </Card>

        {/* LISTA DE LOUVORES E EVENTOS */}
        <div className="lg:col-span-2 space-y-6 order-1 lg:order-2 w-full min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-sm flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 shrink-0" />
              <span className="truncate">{activeDay ? `Escalas de ${activeDay} de ${monthNames[currentDate.getMonth()]}` : `Mês de ${monthNames[currentDate.getMonth()]}`}</span>
            </h3>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-14 text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full"><Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-500" /></div>
          ) : displayEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 text-center border-dashed border-2 rounded-2xl border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50 w-full">
              <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-300 dark:text-slate-600 shadow-sm"><CalendarIcon className="w-8 h-8" /></div>
              <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Nenhum evento</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm mb-6">Não há eventos da igreja marcados para esta data.</p>
              {activeDay && <Button onClick={() => setActiveDay(null)} variant="secondary" className="h-10">Ver todo o mês</Button>}
            </div>
          ) : (
            <div className="space-y-8 w-full min-w-0">
              {displayEvents.map(event => {
                const eventSetlist = setlists.find(s => s.event_id === event.id);
                
                return (
                  <div key={event.id} className="space-y-4 w-full min-w-0 animate-in slide-in-from-bottom-4">
                    {/* Cabeçalho do Evento */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="primary">{event.time}</Badge>
                          {eventSetlist && <Badge variant="success"><CheckCircle2 className="w-3 h-3 mr-1" /> Louvor Definido</Badge>}
                        </div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{event.title}</h2>
                      </div>
                      
                      {isLider && (
                        <Button onClick={() => openSetlistModal(event, eventSetlist)} variant={eventSetlist ? "secondary" : "primary"} className="w-full md:w-auto h-10 text-sm">
                          {eventSetlist ? "Editar Repertório" : <><Plus className="w-4 h-4 mr-2" /> Criar Repertório</>}
                        </Button>
                      )}
                    </div>

                    {/* Exibição da Escala */}
                    {eventSetlist ? (
                      <Card className="p-0 overflow-hidden shadow-lg border-slate-200 dark:border-slate-800">
                        <div className={cn("px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 text-sm font-bold", eventSetlist.worship_type === 'banda' ? "bg-indigo-50/50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400" : "bg-violet-50/50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400")}>
                          {eventSetlist.worship_type === 'banda' ? <Guitar className="w-4 h-4" /> : <Play className="w-4 h-4" />} Modalidade: {eventSetlist.worship_type === 'banda' ? 'Banda ao Vivo' : 'Playback'}
                        </div>

                        <div className="w-full">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
                                <th className="p-4 font-semibold text-xs text-slate-500 dark:text-slate-400 w-12 text-center">#</th>
                                <th className="p-4 font-semibold text-xs text-slate-500 dark:text-slate-400">MÚSICA & ARTISTA</th>
                                
                                {eventSetlist.worship_type === 'banda' && (
                                  <>
                                    <th className="p-4 font-semibold text-xs text-slate-500 dark:text-slate-400 text-center hidden md:table-cell">T. BANDA</th>
                                    <th className="p-4 font-semibold text-xs text-slate-500 dark:text-slate-400 text-center hidden md:table-cell">T. VOCAL</th>
                                    <th className="p-4 font-semibold text-xs text-slate-500 dark:text-slate-400 text-center hidden md:table-cell">BPM</th>
                                  </>
                                )}
                                <th className="p-4 font-semibold text-xs text-slate-500 dark:text-slate-400 text-right md:hidden">INFO</th>
                                <th className="p-4 font-semibold text-xs text-slate-500 dark:text-slate-400 text-right hidden md:table-cell">AÇÕES</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                              {(eventSetlist.worship_schedule_songs || []).map((row, i) => {
                                const songInfo = row.songs || {};
                                return (
                                  <tr key={row.id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                    <td className="p-4 text-center text-slate-400 dark:text-slate-500 font-mono text-sm">{i+1}</td>
                                    <td className="p-4">
                                      <p className="font-bold text-slate-900 dark:text-white text-sm md:text-base">{songInfo.title}</p>
                                      {songInfo.artist && <p className="text-xs text-slate-500 dark:text-slate-400">{songInfo.artist}</p>}
                                    </td>
                                    
                                    {eventSetlist.worship_type === 'banda' && (
                                      <>
                                        <td className="p-4 text-center hidden md:table-cell">{row.band_key ? <Badge>{row.band_key}</Badge> : '-'}</td>
                                        <td className="p-4 text-center hidden md:table-cell">{row.vocal_key ? <Badge variant="primary">{row.vocal_key}</Badge> : '-'}</td>
                                        <td className="p-4 text-center text-slate-600 dark:text-slate-400 font-mono text-sm hidden md:table-cell">{row.bpm || '-'}</td>
                                      </>
                                    )}
                                    
                                    <td className="p-4 text-right md:hidden">
                                      <Button variant="secondary" onClick={() => setSelectedSongDetail({ row, songInfo, type: eventSetlist.worship_type })} className="h-9 px-3 text-xs w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                        <Info className="w-3.5 h-3.5 mr-1" /> Info
                                      </Button>
                                    </td>

                                    <td className="p-4 text-right hidden md:table-cell">
                                      <div className="flex justify-end gap-2">
                                        {eventSetlist.worship_type === 'banda' ? (
                                          <>
                                            <Button variant="ghost" onClick={(e) => searchYouTube(songInfo.title, songInfo.artist, 'banda', e)} className="h-8 w-8 px-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10" title="Ouvir no YouTube"><Play className="w-4 h-4" /></Button>
                                            <Button variant="secondary" onClick={(e) => searchCifra(songInfo.title, songInfo.artist, e)} className="h-8 px-3 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700" title="Buscar Cifra/Letra"><Search className="w-3.5 h-3.5 mr-1" /> Cifra</Button>
                                          </>
                                        ) : (
                                          <Button variant="secondary" onClick={(e) => { e.preventDefault(); if(row.link || songInfo.link) window.open(row.link || songInfo.link, '_blank'); else searchYouTube(songInfo.title, songInfo.artist, 'playback', e); }} className="h-8 px-3 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" title="Abrir Playback"><Play className="w-3.5 h-3.5 mr-1" /> Playback</Button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      </Card>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                        <Music className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-3" />
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Nenhum louvor definido para este evento ainda.</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* =========================================================
          MODAL 0: INFORMAÇÕES DA MÚSICA (Exclusivo Mobile)
          ========================================================= */}
      {selectedSongDetail && (
        <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-4 sm:p-0 md:hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedSongDetail(null)}></div>
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 border border-slate-200 dark:border-slate-800 pb-safe">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start bg-slate-50/50 dark:bg-slate-950/50">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">{selectedSongDetail.songInfo.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{selectedSongDetail.songInfo.artist}</p>
              </div>
              <button onClick={() => setSelectedSongDetail(null)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-5 space-y-5 bg-white dark:bg-slate-900">
              {selectedSongDetail.type === 'banda' && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Banda</span>
                    <span className="font-bold text-lg text-slate-800 dark:text-slate-200">{selectedSongDetail.row.band_key || '-'}</span>
                  </div>
                  <div className="bg-indigo-50/50 dark:bg-indigo-500/5 p-3 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 text-center">
                    <span className="block text-[10px] font-bold text-indigo-400 uppercase mb-1">Vocal</span>
                    <span className="font-bold text-lg text-indigo-700 dark:text-indigo-400">{selectedSongDetail.row.vocal_key || '-'}</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">BPM</span>
                    <span className="font-bold text-lg text-slate-800 dark:text-slate-200">{selectedSongDetail.row.bpm || '-'}</span>
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-2">
                {selectedSongDetail.type === 'banda' ? (
                  <>
                    <Button variant="secondary" onClick={(e) => { setSelectedSongDetail(null); searchCifra(selectedSongDetail.songInfo.title, selectedSongDetail.songInfo.artist, e); }} className="w-full h-12 justify-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <Search className="w-4 h-4 mr-2" /> Buscar Cifra / Letra
                    </Button>
                    <Button variant="danger" onClick={(e) => { setSelectedSongDetail(null); searchYouTube(selectedSongDetail.songInfo.title, selectedSongDetail.songInfo.artist, 'banda', e); }} className="w-full h-12 justify-center bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                      <Play className="w-4 h-4 mr-2" /> Ouvir Original no YouTube
                    </Button>
                  </>
                ) : (
                  <Button onClick={(e) => { 
                    e.preventDefault(); 
                    setSelectedSongDetail(null);
                    if(selectedSongDetail.row.link || selectedSongDetail.songInfo.link) window.open(selectedSongDetail.row.link || selectedSongDetail.songInfo.link, '_blank'); 
                    else searchYouTube(selectedSongDetail.songInfo.title, selectedSongDetail.songInfo.artist, 'playback', e); 
                  }} className="w-full h-12 justify-center bg-indigo-600 hover:bg-indigo-500 text-white">
                    <Play className="w-4 h-4 mr-2" /> Abrir Playback
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 1: ACERVO GERAL DE MÚSICAS
          ========================================================= */}
      {isCatalogModalOpen && isLider && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setIsCatalogModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2"><Library className="w-5 h-5 text-indigo-500" /> Acervo da Igreja</h3>
                <p className="text-sm text-slate-500 mt-1">Músicas cadastradas com tons oficiais para a equipe.</p>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={() => openSongForm()} className="h-10 text-sm hidden sm:inline-flex"><Plus className="w-4 h-4 mr-2" /> Nova Música</Button>
                <Button onClick={() => openSongForm()} className="h-10 w-10 p-0 sm:hidden"><Plus className="w-5 h-5" /></Button>
                <button onClick={() => setIsCatalogModalOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-full transition-colors"><X className="w-5 h-5" /></button>
              </div>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto bg-slate-50/30 dark:bg-slate-900">
              <div className="mb-4">
                <Input placeholder="Buscar no acervo..." icon={Search} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-white dark:bg-slate-950" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {songsCatalog.filter(s => `${s.title} ${s.artist}`.toLowerCase().includes(searchTerm.toLowerCase())).map(song => (
                  <div key={song.id} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex justify-between items-start hover:border-indigo-500/50 transition-all group shadow-sm">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-lg">{song.title}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{song.artist || 'Sem Artista'}</p>
                      <div className="flex gap-2 text-xs font-bold text-slate-500 flex-wrap">
                        {song.default_band_key && <Badge variant="secondary">Banda: {song.default_band_key}</Badge>}
                        {song.default_vocal_key && <Badge variant="primary">Voz: {song.default_vocal_key}</Badge>}
                        {song.default_bpm && <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">BPM: {song.default_bpm}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.preventDefault(); openSongForm(song); }} className="p-2 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"><ExternalLink className="w-4 h-4" /></button>
                      <button onClick={(e) => deleteCatalogSong(song.id, e)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: FORMULÁRIO DE NOVA/EDITAR MÚSICA
          ========================================================= */}
      {isSongFormModalOpen && isLider && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => !isSaving && setIsSongFormModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/50">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white"><Music className="w-5 h-5 inline mr-2 text-indigo-500" /> {songCatalogForm.id ? 'Editar Música' : 'Nova Música'}</h3>
              <button onClick={() => setIsSongFormModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-100 dark:bg-slate-800 p-2 rounded-full"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={saveCatalogSong}>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1 space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">Nome *</label><Input required value={songCatalogForm.title} onChange={e => setSongCatalogForm({...songCatalogForm, title: e.target.value})} /></div>
                  <div className="col-span-2 md:col-span-1 space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">Artista</label><Input value={songCatalogForm.artist} onChange={e => setSongCatalogForm({...songCatalogForm, artist: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">T. Banda</label><Input placeholder="Ex: E" value={songCatalogForm.default_band_key} onChange={e => setSongCatalogForm({...songCatalogForm, default_band_key: e.target.value})} className="font-mono text-center" /></div>
                  <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">T. Voz</label><Input placeholder="Ex: G" value={songCatalogForm.default_vocal_key} onChange={e => setSongCatalogForm({...songCatalogForm, default_vocal_key: e.target.value})} className="font-mono text-center" /></div>
                  <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">BPM</label><Input type="number" placeholder="120" value={songCatalogForm.default_bpm} onChange={e => setSongCatalogForm({...songCatalogForm, default_bpm: e.target.value})} className="font-mono text-center" /></div>
                </div>
                <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">Link de Referência</label><Input placeholder="YouTube, Spotify..." icon={LinkIcon} value={songCatalogForm.link} onChange={e => setSongCatalogForm({...songCatalogForm, link: e.target.value})} /></div>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <Button variant="secondary" onClick={(e) => { e.preventDefault(); setIsSongFormModalOpen(false); }}>Cancelar</Button>
                <Button type="submit" isLoading={isSaving}>Salvar Música</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 3: CRIAR/EDITAR ESCALA
          ========================================================= */}
      {isSetlistModalOpen && isLider && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 md:p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => !isSaving && setIsSetlistModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800">
            
            <div className="flex justify-between items-center p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
              <div>
                <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2"><Music className="w-5 h-5 text-indigo-500" /> {editingSetlist ? 'Editar Repertório' : 'Criar Repertório'}</h3>
                <p className="text-xs text-slate-500 mt-1 hidden md:block">Busque as músicas do acervo e altere os tons se precisar.</p>
              </div>
              <button disabled={isSaving} onClick={() => setIsSetlistModalOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={saveSetlist} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-4 md:p-6 space-y-6 overflow-y-auto">
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full max-w-sm mx-auto">
                  
                  {/* BOTÕES CORRIGIDOS COM FLEXBOX E ÍCONES PADRONIZADOS */}
                  <button onClick={(e) => { e.preventDefault(); setWorshipType('banda'); }} className={cn("flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all", worshipType === 'banda' ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200")}>
                    <Guitar className="w-4 h-4" /> Banda ao Vivo
                  </button>
                  <button onClick={(e) => { e.preventDefault(); setWorshipType('playback'); }} className={cn("flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all", worshipType === 'playback' ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200")}>
                    <Play className="w-4 h-4" /> Playback
                  </button>

                </div>

                <div className="space-y-4">
                  {songsForm.map((songRow, index) => (
                    <div key={index} className="relative bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="absolute -left-2 -top-2 md:-left-3 md:-top-3 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">{index + 1}</div>
                      
                      <div className="flex gap-3 items-end">
                        <div className="flex-1">
                          <label className="text-[10px] md:text-xs font-bold text-slate-500 uppercase ml-1 block mb-1">Buscar Música no Acervo</label>
                          <SearchableSelect index={index} value={songRow.search} catalog={songsCatalog} onSelect={handleSelectSong} />
                        </div>
                        {songRow.last_played && (
                          <div className="hidden md:flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-500/10 px-3 py-2 rounded-lg mb-0.5 border border-indigo-200 dark:border-indigo-500/20">
                            <Clock className="w-3.5 h-3.5" /> Última vez: {songRow.last_played}
                          </div>
                        )}
                      </div>

                      {songRow.song_id && (
                        worshipType === 'banda' ? (
                          <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-3 pt-3 mt-3 border-t border-slate-200 dark:border-slate-800/60">
                            <div><label className="text-[10px] font-bold text-slate-400 block ml-1 mb-1 truncate">T. Banda</label><Input value={songRow.band_key} onChange={e => updateSongField(index, 'band_key', e.target.value)} className="font-mono text-center h-10 bg-white dark:bg-slate-900 px-2" /></div>
                            <div><label className="text-[10px] font-bold text-slate-400 block ml-1 mb-1 truncate">T. Voz</label><Input value={songRow.vocal_key} onChange={e => updateSongField(index, 'vocal_key', e.target.value)} className="font-mono text-center h-10 bg-white dark:bg-slate-900 px-2" /></div>
                            <div><label className="text-[10px] font-bold text-slate-400 block ml-1 mb-1 truncate">BPM</label><Input type="number" value={songRow.bpm} onChange={e => updateSongField(index, 'bpm', e.target.value)} className="font-mono text-center h-10 bg-white dark:bg-slate-900 px-2" /></div>
                            <div className="col-span-3 md:col-span-1 flex justify-end items-end mt-2 md:mt-0"><button onClick={(e) => removeSongRow(index, e)} className="h-10 px-4 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 transition-colors w-full flex items-center justify-center"><Trash2 className="w-4 h-4 mr-2 md:mr-0" /> <span className="md:hidden text-sm font-bold">Remover</span></button></div>
                          </div>
                        ) : (
                          <div className="flex flex-col md:flex-row gap-3 pt-3 mt-3 border-t border-slate-200 dark:border-slate-800/60">
                            <Input placeholder="Link do Playback (opcional)" icon={LinkIcon} value={songRow.link} onChange={e => updateSongField(index, 'link', e.target.value)} className="flex-1 h-10 bg-white dark:bg-slate-900" />
                            <button onClick={(e) => removeSongRow(index, e)} className="h-10 px-4 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 flex items-center justify-center"><Trash2 className="w-4 h-4 mr-2 md:mr-0" /> <span className="md:hidden text-sm font-bold">Remover</span></button>
                          </div>
                        )
                      )}
                    </div>
                  ))}
                  <Button variant="ghost" onClick={addSongRow} className="w-full border-2 border-dashed border-slate-200 dark:border-slate-800 h-14 text-indigo-600 dark:text-indigo-400"><Plus className="w-5 h-5 mr-2" /> Nova Linha</Button>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 flex flex-col-reverse sm:flex-row gap-3 justify-between">
                <Button variant="danger" onClick={deleteSetlist} disabled={!editingSetlist || isSaving}>Apagar Escala</Button>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="secondary" onClick={(e) => { e.preventDefault(); setIsSetlistModalOpen(false); }} disabled={isSaving}>Cancelar</Button>
                  <Button type="submit" isLoading={isSaving}>Salvar Repertório</Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 4: SUGERIR MÚSICA
          ========================================================= */}
      {isSuggestModalOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => !isSaving && setIsSuggestModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50"><h3 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white"><Lightbulb className="w-5 h-5 text-amber-500" /> Sugerir Música</h3></div>
            <form onSubmit={saveSuggestion}>
              <div className="p-6 space-y-4">
                <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">Nome da Música *</label><Input value={suggestForm.title} onChange={e => setSuggestForm({...suggestForm, title: e.target.value})} required /></div>
                <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">Artista Original</label><Input value={suggestForm.artist} onChange={e => setSuggestForm({...suggestForm, artist: e.target.value})} /></div>
                <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">Por que tocar essa música?</label><Input as="textarea" rows={3} value={suggestForm.notes} onChange={e => setSuggestForm({...suggestForm, notes: e.target.value})} /></div>
              </div>
              <div className="p-6 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <Button variant="secondary" onClick={(e) => { e.preventDefault(); setIsSuggestModalOpen(false); }}>Cancelar</Button>
                <Button type="submit" isLoading={isSaving} className="bg-emerald-600 hover:bg-emerald-500">Enviar</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 5: VER SUGESTÕES
          ========================================================= */}
      {isViewSuggestionsOpen && isLider && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setIsViewSuggestionsOpen(false)}></div>
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-slate-200 dark:border-slate-800">
            <div className="p-5 md:p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between bg-slate-50/50 dark:bg-slate-950/50">
              <h3 className="text-xl font-bold flex gap-2 text-slate-900 dark:text-white"><Lightbulb className="w-5 h-5 text-amber-500" /> Caixa de Sugestões</h3>
              <button onClick={() => setIsViewSuggestionsOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 md:p-6 overflow-y-auto space-y-4 bg-slate-50/30 dark:bg-slate-900">
              {suggestions.length === 0 ? (
                <div className="text-center py-10"><Lightbulb className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" /><p className="text-slate-500 dark:text-slate-400">Nenhuma sugestão no momento.</p></div>
              ) : (
                suggestions.map((req) => (
                  <div key={req.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm relative">
                    <div className="flex justify-between items-start mb-2">
                      <div><h4 className="font-bold text-lg text-slate-900 dark:text-white">{req.title}</h4><p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">{req.artist}</p></div>
                      <button onClick={(e) => deleteSuggestion(req.id, e)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    {req.notes && <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-xl text-sm text-amber-800 dark:text-amber-200 italic">"{req.notes}"</div>}
                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-400">Por: {req.user_name}</span>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button variant="ghost" onClick={(e) => searchYouTube(req.title, req.artist, 'banda', e)} className="h-10 sm:h-8 px-3 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"><Play className="w-3.5 h-3.5 mr-1" /> Ouvir</Button>
                        <Button onClick={(e) => addSuggestionToCatalog(req, e)} className="h-10 sm:h-8 px-3 text-xs bg-indigo-600 hover:bg-indigo-500 text-white"><Plus className="w-3.5 h-3.5 mr-1" /> Add ao Acervo</Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}