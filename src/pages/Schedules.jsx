import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar as CalendarIcon, Clock, Users, Music, Video, Shield, 
  ChevronRight, AlertCircle, ClipboardList, ChevronLeft, 
  ChevronsLeft, ChevronsRight, Plus, Edit2, Trash2, X, Save, Loader2, MapPin, Settings
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Card, Badge, Button, Input } from '../components/ui';
import { cn } from '../lib/utils';

// 💎 COMPONENTE SELECT PREMIUM CUSTOMIZADO
const CustomSelect = ({ value, onChange, options, placeholder, error, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={cn("relative w-full", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full h-12 rounded-xl border bg-slate-50 px-4 py-2 text-sm text-left transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:bg-[#131B2C]",
          error ? "border-red-300 dark:border-red-500/50" : "border-slate-200 dark:border-slate-700",
          !selectedOption ? "text-slate-500 dark:text-slate-400" : "text-slate-900 dark:text-slate-100"
        )}
      >
        <span className="truncate block pr-2">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronRight className={cn("w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0", isOpen && "rotate-90")} />
      </button>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-1.5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700/50 rounded-xl shadow-xl max-h-56 overflow-y-auto py-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full animate-in fade-in zoom-in-95 duration-100 origin-top">
          {options.length === 0 ? (
             <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">Nenhuma opção disponível</div>
          ) : (
            options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={cn(
                  "w-full text-left px-4 py-2.5 text-sm transition-colors",
                  value === opt.value 
                    ? "bg-indigo-50 dark:bg-blue-600/90 text-indigo-700 dark:text-white font-medium" 
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80"
                )}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                {opt.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default function Schedules() {
  const { profile, user } = useAuth();
  
  // =========================================================================
  // ESTADOS GERAIS DE PERMISSÃO
  // =========================================================================
  const userRole = (profile?.role || 'membro').toLowerCase(); 
  const isAdminOrPastor = ['admin', 'pastor'].includes(userRole);
  const isLider = ['lider', 'líder'].includes(userRole);

  const [ministries, setMinistries] = useState([]);
  const [activeTab, setActiveTab] = useState(null);

  // Estados de Dados
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [activeDay, setActiveDay] = useState(today.getDate());
  
  const [events, setEvents] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [ministryMembers, setMinistryMembers] = useState([]); 
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState({ id: null, eventId: null, ministryId: null });
  const [scheduleForm, setScheduleForm] = useState([{ role: '', user_id: '' }]);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, isLoading: false, title: '', message: '', type: 'primary', confirmText: 'Confirmar', showCancel: true, onConfirm: null });

  // =========================================================================
  // 1. CARREGAR MINISTÉRIOS DA BASE DE DADOS
  // =========================================================================
  useEffect(() => {
    const fetchMinistries = async () => {
      try {
        const { data, error } = await supabase.from('ministries').select('id, name').order('name');
        if (error) throw error;

        if (data && data.length > 0) {
          let visibleMinistriesData = data;
          
          if (!isAdminOrPastor) {
            const currentUserId = profile?.id || user?.id;
            let myMinistryIds = [];
            let myMinistryRoles = [];
            
            if (currentUserId) {
              const { data: myMinData } = await supabase.from('ministry_members').select('ministry_id, role').eq('user_id', currentUserId);
              myMinistryIds = myMinData?.map(m => m.ministry_id).filter(Boolean) || [];
              myMinistryRoles = myMinData?.map(m => (m.role || '').toLowerCase()).filter(Boolean) || [];
            }
            
            const profileMinistriesStr = profile?.ministries || []; 
            
            visibleMinistriesData = data.filter(m => 
              myMinistryIds.includes(m.id) || 
              myMinistryRoles.includes(m.name.toLowerCase()) ||
              profileMinistriesStr.includes(m.name) ||
              profileMinistriesStr.map(s => s.toLowerCase()).includes(m.name.toLowerCase())
            );
          }

          const formattedMinistries = visibleMinistriesData.map(m => {
            const nameLower = m.name.toLowerCase();
            let icon = Shield; let color = 'text-emerald-500'; let bg = 'bg-emerald-500/10 border-emerald-500/20'; let solidBg = 'bg-emerald-500'; 
            if (nameLower.includes('louvor') || nameLower.includes('musica')) { icon = Music; color = 'text-violet-500'; bg = 'bg-violet-500/10 border-violet-500/20'; solidBg = 'bg-violet-500'; }
            else if (nameLower.includes('midia') || nameLower.includes('mídia')) { icon = Video; color = 'text-blue-500'; bg = 'bg-blue-500/10 border-blue-500/20'; solidBg = 'bg-blue-500'; }
            else if (nameLower.includes('infantil') || nameLower.includes('criança')) { icon = Users; color = 'text-pink-500'; bg = 'bg-pink-500/10 border-pink-500/20'; solidBg = 'bg-pink-500'; }
            return { id: m.id, label: m.name, icon, color, bg, solidBg };
          });

          setMinistries(formattedMinistries);
          if (formattedMinistries.length > 0) setActiveTab(formattedMinistries[0].id);
        }
      } catch (err) {
        console.error("Erro ao buscar ministérios:", err);
      }
    };
    fetchMinistries();
  }, [isAdminOrPastor, profile?.id, user?.id, profile?.ministries]);

  // =========================================================================
  // 2. BUSCAR MEMBROS DO MINISTÉRIO SELECIONADO
  // =========================================================================
  useEffect(() => {
    const fetchMembersForMinistry = async () => {
      if (!activeTab) return;
      try {
        const { data: mmData, error: mmError } = await supabase.from('ministry_members').select('user_id').eq('ministry_id', activeTab);
        if (mmError) throw mmError;

        if (mmData && mmData.length > 0) {
          const userIds = mmData.map(m => m.user_id);
          const { data: profilesData, error: profError } = await supabase.from('profiles').select('id, name').in('id', userIds).order('name');
          if (profError) throw profError;
          setMinistryMembers(profilesData || []);
        } else {
          setMinistryMembers([]); 
        }
      } catch (err) {
        console.error("Erro ao buscar membros:", err);
      }
    };
    fetchMembersForMinistry();
  }, [activeTab]);

  // =========================================================================
  // 3. BUSCAR EVENTOS E ESCALAS DO MÊS
  // =========================================================================
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchEventsAndSchedules(currentDate.getMonth(), currentDate.getFullYear());
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [currentDate.getMonth(), currentDate.getFullYear()]);

  const fetchEventsAndSchedules = async (month, year) => {
    setIsLoading(true);
    try {
      const firstDay = new Date(year, month, 1).toISOString();
      const lastDay = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

      const { data: eventsData, error: eventsError } = await supabase.from('events').select('*').gte('date', firstDay).lte('date', lastDay).order('date', { ascending: true });
      if (eventsError) throw eventsError;

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
        const { data: schedulesData, error: schedulesError } = await supabase.from('schedules').select('*').in('event_id', eventIds);
        if (schedulesError) throw schedulesError;
        setSchedules(schedulesData || []);
      } else {
        setSchedules([]);
      }
    } catch (error) {
      console.error("Erro ao buscar escalas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================================
  // LÓGICA DE CALENDÁRIO
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

  const canEditCurrentTab = isAdminOrPastor || isLider;
  const displayEvents = events.filter(ev => activeDay ? ev.day === activeDay : true);

  // =========================================================================
  // MODAL E FORMULÁRIO
  // =========================================================================
  const openScheduleModal = (eventId, ministryId) => {
    const currentSchedule = schedules.find(s => s.event_id === eventId && s.ministry_id === ministryId);
    if (currentSchedule && currentSchedule.members && currentSchedule.members.length > 0) {
      setEditingSchedule({ id: currentSchedule.id, eventId, ministryId });
      setScheduleForm(currentSchedule.members);
    } else {
      setEditingSchedule({ id: null, eventId, ministryId });
      setScheduleForm([{ role: '', user_id: '' }]);
    }
    setIsModalOpen(true);
  };

  // ADICIONADO: e.preventDefault() para evitar que o form seja submetido
  const addMemberRow = (e) => {
    if (e) e.preventDefault();
    setScheduleForm([...scheduleForm, { role: '', user_id: '' }]);
  };

  // ADICIONADO: e.preventDefault() por precaução
  const removeMemberRow = (index, e) => {
    if (e) e.preventDefault();
    const newForm = [...scheduleForm]; 
    newForm.splice(index, 1); 
    setScheduleForm(newForm); 
  };
  
  const updateMemberRow = (index, field, value) => { 
    const newForm = [...scheduleForm]; 
    newForm[index][field] = value; 
    setScheduleForm(newForm); 
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    const cleanMembers = scheduleForm.filter(m => m.role.trim() !== '' && m.user_id !== '');
    
    if (cleanMembers.length === 0) {
      setConfirmDialog({ isOpen: true, isLoading: false, title: 'Atenção', message: 'Preencha pelo menos um membro ou utilize o botão de "Apagar Escala".', type: 'danger', confirmText: 'OK', showCancel: false, onConfirm: () => setConfirmDialog(prev => ({...prev, isOpen: false}))});
      return;
    }

    setIsSaving(true);
    try {
      if (editingSchedule.id) {
        const { error } = await supabase.from('schedules').update({ members: cleanMembers }).eq('id', editingSchedule.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('schedules').insert([{ event_id: editingSchedule.eventId, ministry_id: editingSchedule.ministryId, members: cleanMembers }]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      await fetchEventsAndSchedules(currentDate.getMonth(), currentDate.getFullYear());
    } catch (error) {
      setConfirmDialog({ isOpen: true, isLoading: false, title: 'Erro ao Salvar', message: error.message || 'Falha ao guardar.', type: 'danger', confirmText: 'OK', showCancel: false, onConfirm: () => setConfirmDialog(prev => ({...prev, isOpen: false}))});
    } finally {
      setIsSaving(false);
    }
  };

  // ADICIONADO: e.preventDefault() para evitar submissão indesejada
  const confirmDeleteSchedule = (e) => {
    if (e) e.preventDefault();
    setConfirmDialog({
      isOpen: true, isLoading: false, title: 'Limpar Escala', message: 'Deseja remover todas as pessoas escaladas?', type: 'danger', confirmText: 'Sim, Apagar', showCancel: true,
      onConfirm: async () => {
        try {
          const { error } = await supabase.from('schedules').delete().eq('event_id', editingSchedule.eventId).eq('ministry_id', editingSchedule.ministryId);
          if (error) throw error;
          setIsModalOpen(false);
          await fetchEventsAndSchedules(currentDate.getMonth(), currentDate.getFullYear());
          setConfirmDialog(prev => ({...prev, isOpen: false}));
        } catch (error) {
          setConfirmDialog({ isOpen: true, isLoading: false, title: 'Erro', message: error.message || 'Falha na exclusão.', type: 'danger', confirmText: 'OK', showCancel: false, onConfirm: () => setConfirmDialog(prev => ({...prev, isOpen: false}))});
        }
      }
    });
  };

  const getUserName = (userId) => {
    const member = ministryMembers.find(m => m.id === userId);
    // REMOVIDO: m.full_name já que sabemos que essa coluna não existe na sua base de dados
    return member ? (member.name || 'Membro') : 'Membro Desconhecido';
  };

  // REMOVIDO: m.full_name
  const selectOptions = ministryMembers.map(m => ({ value: m.id, label: m.name || 'Sem Nome' }));

  if (ministries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] max-w-lg mx-auto text-center px-4">
        {isLoading ? <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" /> : (
          <>
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 border border-slate-200 dark:border-white/5"><Shield className="w-10 h-10 text-slate-400" /></div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Sem Acesso ou Nenhum Ministério</h2>
            <p className="text-slate-500 mb-4">Você não possui permissão para ver escalas de ministérios ou nenhum foi criado ainda.</p>
            <Button variant="secondary" onClick={() => window.history.back()}>Voltar Atrás</Button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-[100vw] overflow-x-hidden min-h-screen pb-28 md:pb-10">
      <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* CABEÇALHO */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ClipboardList className="w-7 h-7 md:w-8 md:h-8 text-indigo-500 shrink-0" />
            <span className="truncate">Escalas de Serviço</span>
          </h2>
        </div>

        {/* ÁREA DE ABAS */}
        {ministries.length > 1 && (
          <div className="w-full relative mb-6 md:mb-0">
            <div className="grid grid-cols-2 gap-2 md:flex md:gap-2 md:overflow-x-auto md:pb-px md:snap-x w-full md:border-b border-slate-200/50 dark:border-slate-800/50">
              {ministries.map((min) => {
                const isActive = activeTab === min.id;
                return (
                  <button
                    key={min.id}
                    onClick={() => setActiveTab(min.id)}
                    className={cn(
                      "flex items-center justify-center md:justify-start gap-2 px-3 md:px-5 py-3 md:py-3 font-bold text-[13px] md:text-sm transition-all snap-center shrink-0 min-w-0",
                      "rounded-xl border md:border-0 md:rounded-b-none md:rounded-t-xl",
                      isActive 
                        ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30 shadow-sm md:border-t md:border-x md:bg-white md:dark:bg-[#0f172a] md:border-slate-200 md:dark:border-slate-800 md:shadow-none md:relative md:z-10 md:translate-y-[1px]" 
                        : "bg-white dark:bg-[#131B2C] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 md:border-t md:border-x md:bg-transparent md:dark:bg-transparent md:border-transparent md:dark:border-transparent md:hover:bg-slate-100 md:dark:hover:bg-slate-800/50"
                    )}
                  >
                    <min.icon className={cn("w-4 h-4 shrink-0", isActive ? min.color : "text-slate-400")} />
                    <span className="truncate">{min.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start w-full">
          
          {/* CALENDÁRIO */}
          <Card className="lg:col-span-1 p-4 md:p-6 sticky top-24 border-transparent dark:border-slate-800/80 order-2 lg:order-1 w-full max-w-full">
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-1 shrink-0">
                <button onClick={prevYear} className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded hover:bg-slate-100 dark:hover:bg-slate-800"><ChevronsLeft className="w-5 h-5" /></button>
                <button onClick={prevMonth} className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded hover:bg-slate-100 dark:hover:bg-slate-800"><ChevronLeft className="w-5 h-5" /></button>
              </div>
              <h3 className="font-bold text-sm md:text-[15px] text-slate-900 dark:text-white uppercase tracking-wider truncate px-1 text-center flex-1">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <div className="flex gap-1 shrink-0">
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
                const hasEvent = events.some(ev => ev.day === day);
                const isSelected = activeDay === day;
                return (
                  <button 
                    key={day}
                    onClick={() => setActiveDay(activeDay === day ? null : day)}
                    className={cn(
                      "relative aspect-square rounded-xl flex items-center justify-center text-sm font-semibold transition-all duration-200",
                      isSelected ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30 scale-105" : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
                      hasEvent && !isSelected && "font-bold text-indigo-600 dark:text-indigo-400"
                    )}
                  >
                    {day}
                    {hasEvent && !isSelected && <span className="absolute bottom-1 w-1 h-1 bg-indigo-500 rounded-full"></span>}
                  </button>
                )
              })}
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 text-center">
              <Button variant="ghost" onClick={() => setActiveDay(null)} className="w-full text-xs h-9">Ver todos os eventos</Button>
            </div>
          </Card>

          {/* LISTA DE EVENTOS E ESCALAS */}
          <div className="lg:col-span-2 space-y-6 order-1 lg:order-2 w-full max-w-full min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-sm flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 shrink-0" />
                <span className="truncate">{activeDay ? `Escalas de ${activeDay} de ${monthNames[currentDate.getMonth()]}` : `Mês de ${monthNames[currentDate.getMonth()]}`}</span>
              </h3>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-14 text-slate-400 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-white/5 w-full">
                <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-500" />
              </div>
            ) : displayEvents.length === 0 ? (
              <Card className="flex flex-col items-center justify-center p-10 text-center border-dashed border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 w-full">
                <div className="w-16 h-16 bg-slate-100 dark:bg-[#131B2C] rounded-full flex items-center justify-center mb-4 text-slate-300 dark:text-slate-600"><CalendarIcon className="w-8 h-8" /></div>
                <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Sem eventos</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm mb-6">Não há eventos agendados para este dia.</p>
                {activeDay && <Button onClick={() => setActiveDay(null)} variant="secondary">Ver todo o mês</Button>}
              </Card>
            ) : (
              <div className="space-y-6 w-full max-w-full min-w-0">
                {displayEvents.map(event => {
                  const eventSchedule = schedules.find(sch => sch.event_id === event.id && sch.ministry_id === activeTab);
                  const membersList = eventSchedule?.members || [];
                  const activeColorInfo = ministries.find(m => m.id === activeTab);
                  const hasSchedules = membersList.length > 0;

                  return (
                    <div key={event.id} className="space-y-3 w-full max-w-full min-w-0">
                      <div className="flex items-center gap-4 pl-1 mb-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm shrink-0">{daysOfWeek[event.date.getDay()]}, {event.day} de {monthNames[event.month]}</span>
                        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
                      </div>

                      <Card className="p-0 overflow-hidden border-slate-200/60 dark:border-slate-800 relative w-full max-w-full">
                        <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", activeColorInfo?.solidBg || "bg-emerald-500")}></div>
                        
                        <div className="px-4 md:px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#131B2C]/80 flex flex-col md:flex-row md:items-center justify-between gap-3 w-full">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-slate-900 dark:text-white text-base md:text-lg truncate">{event.title}</h4>
                            <div className="flex flex-wrap items-center text-slate-500 dark:text-slate-400 text-sm mt-1 gap-x-4 gap-y-1">
                              <span className="flex items-center min-w-0"><Clock className="w-3.5 h-3.5 mr-1.5 shrink-0" /> <span className="truncate">{event.time}</span></span>
                              <span className="flex items-center min-w-0"><MapPin className="w-3.5 h-3.5 mr-1.5 shrink-0" /> <span className="truncate">{event.location}</span></span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 self-start md:self-auto shrink-0 mt-1 md:mt-0">
                            {canEditCurrentTab && (
                              <button 
                                onClick={() => openScheduleModal(event.id, activeTab)}
                                className={cn(
                                  "py-2 px-3 rounded-lg transition-colors border shrink-0 flex items-center text-xs font-bold",
                                  hasSchedules 
                                    ? "text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20" 
                                    : "text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20"
                                )}
                              >
                                {hasSchedules ? (
                                  <><Edit2 className="w-3.5 h-3.5 mr-1" /> Editar Equipe</>
                                ) : (
                                  <><Plus className="w-3.5 h-3.5 mr-1"/> Definir Equipe</>
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="p-4 md:p-5 bg-white dark:bg-[#0f172a] w-full">
                          {!hasSchedules ? (
                            <div className="text-center py-6 text-slate-400 dark:text-slate-500">
                              <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">Nenhuma escala definida.</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 w-full">
                              {membersList.map((sch, idx) => {
                                const memberName = getUserName(sch.user_id);
                                return (
                                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 bg-slate-50/50 dark:bg-[#131B2C] transition-colors group min-w-0">
                                    <div className="flex flex-col min-w-0 pr-3">
                                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5 truncate">{sch.role}</span>
                                      <span className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">{memberName}</span>
                                    </div>
                                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0", activeColorInfo?.bg, activeColorInfo?.color)}>
                                      {memberName.charAt(0).toUpperCase()}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </Card>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL GLOBAL CONFIRMAÇÃO */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => !confirmDialog.isLoading && setConfirmDialog({...confirmDialog, isOpen: false})}></div>
          <div className="relative bg-white dark:bg-[#0f172a] w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border dark:border-slate-800">
            <div className="p-6 text-center">
              <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 ${confirmDialog.type === 'danger' ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' : 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'}`}>
                {confirmDialog.type === 'danger' ? <AlertCircle className="w-8 h-8" /> : <Settings className="w-8 h-8" />}
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{confirmDialog.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{confirmDialog.message}</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-[#131B2C] flex gap-3 border-t border-slate-100 dark:border-slate-800">
              {confirmDialog.showCancel && (
                <Button variant="secondary" className="flex-1" disabled={confirmDialog.isLoading} onClick={() => setConfirmDialog({...confirmDialog, isOpen: false})}>Cancelar</Button>
              )}
              <Button variant={confirmDialog.type} className="flex-1" isLoading={confirmDialog.isLoading} onClick={async () => {
                if (confirmDialog.onConfirm) { setConfirmDialog(prev => ({...prev, isLoading: true})); await confirmDialog.onConfirm(); }
                else setConfirmDialog(prev => ({...prev, isOpen: false}));
              }}>
                {confirmDialog.confirmText}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CRIAR / EDITAR ESCALA COM O NOVO SELECT PREMIUM */}
      {isModalOpen && canEditCurrentTab && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 md:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => !isSaving && setIsModalOpen(false)}></div>
          
          <div className="relative bg-white dark:bg-[#0f172a] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] border dark:border-slate-800">
            
            <div className="flex justify-between items-center p-5 md:p-6 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-[#131B2C]">
              <div className="min-w-0 pr-4">
                <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 truncate">
                  <ClipboardList className="w-5 h-5 text-indigo-500 shrink-0" />
                  <span className="truncate">Gerir Equipa</span>
                </h3>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider truncate">
                  {ministries.find(m => m.id === editingSchedule.ministryId)?.label}
                </p>
              </div>
              <button disabled={isSaving} onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-full transition-colors shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-4 md:p-6 space-y-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                
                {scheduleForm.map((row, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-3 items-start animate-in slide-in-from-left-2 p-4 sm:p-0 rounded-xl bg-slate-50/50 sm:bg-transparent dark:bg-[#131B2C] sm:dark:bg-transparent w-full">
                    
                    <div className="flex-1 w-full space-y-1.5 min-w-0">
                      <label className="sm:hidden text-xs font-bold text-slate-500 uppercase ml-1">Função</label>
                      {index === 0 && <label className="hidden sm:block text-xs font-bold text-slate-500 uppercase ml-1">Função</label>}
                      <Input 
                        placeholder="Ex: Teclado" 
                        value={row.role}
                        onChange={e => updateMemberRow(index, 'role', e.target.value)}
                        required={row.user_id !== ''} 
                      />
                    </div>
                    
                    <div className="flex-1 w-full space-y-1.5 min-w-0">
                      <label className="sm:hidden text-xs font-bold text-slate-500 uppercase ml-1 mt-2">Membro</label>
                      {index === 0 && <label className="hidden sm:block text-xs font-bold text-slate-500 uppercase ml-1">Membro</label>}
                      
                      <CustomSelect 
                        value={row.user_id}
                        onChange={(val) => updateMemberRow(index, 'user_id', val)}
                        options={selectOptions}
                        placeholder="Selecione um membro..."
                        error={row.role !== '' && row.user_id === ''}
                      />
                      
                      {ministryMembers.length === 0 && (
                        <p className="text-[10px] text-red-500 mt-1 ml-1">Nenhum membro registado neste ministério.</p>
                      )}
                    </div>
                    
                    <div className={cn("pt-1.5 w-full sm:w-auto flex justify-end shrink-0", index === 0 ? "sm:mt-5" : "")}>
                      <button 
                        type="button" 
                        onClick={(e) => removeMemberRow(index, e)}
                        disabled={scheduleForm.length === 1}
                        className="h-12 w-full sm:w-12 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 disabled:opacity-30 transition-colors border border-transparent dark:border-red-500/10"
                      >
                        <Trash2 className="w-4 h-4 sm:mr-0 mr-2" />
                        <span className="sm:hidden font-semibold text-sm">Remover Membro</span>
                      </button>
                    </div>

                  </div>
                ))}

                {/* ADICIONADO: e.preventDefault() na chamada da função  */}
                <Button type="button" variant="ghost" onClick={addMemberRow} className="w-full mt-2 border-2 border-dashed border-slate-200 dark:border-slate-800 h-12 bg-transparent hover:bg-slate-50 dark:hover:bg-[#131B2C]">
                  <Plus className="w-4 h-4 mr-2" /> Adicionar mais uma pessoa
                </Button>

              </div>

              <div className="p-4 md:p-6 bg-slate-50 dark:bg-[#131B2C] border-t border-slate-100 dark:border-slate-800 flex flex-col-reverse sm:flex-row gap-3 justify-between shrink-0">
                <Button type="button" variant="danger" onClick={confirmDeleteSchedule} disabled={isSaving || schedules.filter(s => s.event_id === editingSchedule.eventId && s.ministry_id === editingSchedule.ministryId).length === 0}>
                  Limpar Escala
                </Button>
                
                <div className="flex gap-3">
                  {/* ADICIONADO: e.preventDefault() para não submeter ao clicar em cancelar */}
                  <Button type="button" variant="secondary" className="flex-1" onClick={(e) => { e.preventDefault(); setIsModalOpen(false); }} disabled={isSaving}>Cancelar</Button>
                  
                  {/* ESSE É O ÚNICO QUE DEVE TER TYPE="SUBMIT" */}
                  <Button type="submit" className="flex-1" isLoading={isSaving}><Save className="w-4 h-4 mr-2 hidden sm:block" /> Guardar Escala</Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}