import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // ⚠️ IMPORTAÇÃO ADICIONADA AQUI!
import { 
  Search, Calendar as CalendarIcon, Clock, ChevronRight, 
  Plus, X, MapPin, ChevronsLeft, ChevronsRight, ChevronLeft, 
  Info, CalendarPlus, Loader2, Edit2, Trash2, Settings, Megaphone, AlertCircle, Save
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Card, Badge, Button, Input } from '../components/ui';
import { cn } from '../lib/utils';

export default function Agenda() {
  const { profile, user } = useAuth();
  const location = useLocation(); // ⚠️ HOOK PARA LER O ID ENVIADO PELO DASHBOARD
  
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingRoutine, setIsGeneratingRoutine] = useState(false);
  
  // Modais e Seleções
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [isRoutineConfigOpen, setIsRoutineConfigOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null); 
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [confirmDialog, setConfirmDialog] = useState({ 
    isOpen: false, isLoading: false, title: '', message: '', type: 'primary', confirmText: 'Confirmar', showCancel: true, onConfirm: null 
  });

  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [activeDay, setActiveDay] = useState(new Date().getDate());
  
  const initialFormState = { 
    title: '', date: '', time: '', location: 'Nave Principal', description: '', type: 'Culto', ministry_target: 'geral', createAnnouncement: false 
  };
  const [formData, setFormData] = useState(initialFormState);

  const defaultRoutineSettings = {
    seg: { label: 'Segunda (Oração)', title: 'Culto de Oração', time: '20:00', type: 'Culto', location: 'Nave Principal', desc: 'Reunião semanal de oração da igreja.' },
    qua: { label: 'Quarta (Ensino)', title: 'Culto de Ensino', time: '19:30', type: 'Culto', location: 'Nave Principal', desc: 'Culto de ensino da Palavra de Deus.' },
    sex: { label: 'Sexta (Oração)', title: 'Culto de Oração e Libertação', time: '19:30', type: 'Culto', location: 'Nave Principal', desc: 'Culto dedicado à oração.' },
    dom_ebd: { label: 'Domingo (EBD)', title: 'Escola Bíblica Dominical', time: '09:00', type: 'Ensino', location: 'Nave Principal', desc: 'Estudo da Palavra separado por turmas.' },
    dom_fam: { label: 'Domingo (Família)', title: 'Culto da Família', time: '18:30', type: 'Culto', location: 'Nave Principal', desc: 'Culto principal de celebração com toda a família.' },
    esp_1sem: { label: '1ª Sem (Seg-Sex)', title: 'Semana de Oração', time: '22:30', type: 'Culto', location: 'Nave Principal', desc: 'Oração especial da primeira semana.' },
    esp_1sab: { label: '1º Sábado (Ceia)', title: 'Culto de Santa Ceia', time: '19:00', type: 'Culto', location: 'Alternado', desc: 'Celebração da Santa Ceia do Senhor.' },
    esp_2dom: { label: '2º Dom (Missões)', title: 'Culto de Missões', time: '18:30', type: 'Culto', location: 'Nave Principal', desc: 'Culto especial dedicado à obra missionária.' },
    esp_3ter: { label: '3ª Terça (Sede)', title: 'Culto de Ensino', time: '19:30', type: 'Ensino', location: 'Templo Sede', desc: 'Culto de Ensino no Templo Sede.' }
  };
  const [routineSettings, setRoutineSettings] = useState(defaultRoutineSettings);

  const userRole = profile?.role || 'membro';
  const userMinistries = profile?.ministry || [];
  const isAdminOrPastor = ['admin', 'pastor'].includes(userRole);
  const isLider = userRole === 'lider';
  
  const canManageEvent = (ev) => {
    if (!ev) return false;
    if (isAdminOrPastor) return true;
    if (isLider) {
      if (ev.created_by === user?.id) return true;
      if (ev.ministry_target !== 'geral' && userMinistries.includes(ev.ministry_target)) return true;
    }
    return false;
  };

  const canCreateEvents = isAdminOrPastor || isLider;

  const buildTimezoneSafeISOString = (dateStr, timeStr) => {
    const localDate = new Date(`${dateStr}T${timeStr}:00`);
    const offsetMinutes = -localDate.getTimezoneOffset();
    const sign = offsetMinutes >= 0 ? '+' : '-';
    const absOffset = Math.abs(offsetMinutes);
    const pad = (num) => String(num).padStart(2, '0');
    const offsetString = `${sign}${pad(Math.floor(absOffset / 60))}:${pad(absOffset % 60)}`;
    return `${dateStr}T${timeStr}:00${offsetString}`;
  };

  useEffect(() => {
    setIsLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchEventsForMonth(currentDate.getMonth(), currentDate.getFullYear());
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [currentDate.getMonth(), currentDate.getFullYear()]);

  const fetchEventsForMonth = async (month, year) => {
    try {
      const firstDay = new Date(year, month, 1).toISOString();
      const lastDay = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('date', firstDay)
        .lte('date', lastDay)
        .order('date', { ascending: true });
      
      if (error) throw error;

      if (data) {
        const formatted = data.map(ev => {
          const dateObj = new Date(ev.date);
          const weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
          return {
            id: ev.id, title: ev.title, type: ev.type || 'Evento', ministry_target: ev.ministry_target || 'geral',
            location: ev.location || 'Não informado', description: ev.description || '', created_by: ev.created_by,
            date: `${weekDays[dateObj.getDay()]}, ${dateObj.toLocaleDateString()}`,
            rawDate: dateObj.toISOString().split('T')[0], 
            time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            day: dateObj.getDate(), month: dateObj.getMonth(), year: dateObj.getFullYear()
          };
        });
        setEvents(formatted);

        // ⚠️ MÁGICA DE ABERTURA AUTOMÁTICA
        // Se a pessoa veio do Dashboard e clicou num evento específico
        if (location.state && location.state.openEventId) {
          const targetEvent = formatted.find(e => e.id === location.state.openEventId);
          if (targetEvent) {
            setSelectedEvent(targetEvent); // Abre o Pop-up
            setActiveDay(targetEvent.day); // Move o calendário para o dia certo
            // Limpa o estado da navegação para não reabrir se ele atualizar a página (F5)
            window.history.replaceState({}, document.title);
          }
        }
      }
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const eventTimestamp = buildTimezoneSafeISOString(formData.date, formData.time);
      const eventPayload = {
        title: formData.title, date: eventTimestamp, location: formData.location, description: formData.description,
        type: formData.type, ministry_target: formData.ministry_target, created_by: user?.id 
      };

      if (isEditMode && selectedEvent) {
        const { error } = await supabase.from('events').update(eventPayload).eq('id', selectedEvent.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('events').insert([eventPayload]);
        if (error) throw error;
      }

      if (formData.createAnnouncement) {
        const prefix = isEditMode ? 'Atualização:' : 'Novo Evento:';
        const displayDate = formData.date.split('-').reverse().join('/');
        
        const { error: annError } = await supabase.from('announcements').insert([{
          title: `${prefix} ${formData.title}`,
          content: `Data: ${displayDate} às ${formData.time}\nLocal: ${formData.location}\n\n${formData.description}`,
          type: 'evento', ministry_target: formData.ministry_target, is_pinned: false, created_by: user?.id
        }]);
        if (annError) console.error("Erro ao criar aviso:", annError);

        await supabase.functions.invoke('send-push', {
          body: { eventTitle: `${prefix} ${formData.title}`, eventMessage: `${displayDate} às ${formData.time} - ${formData.location}` }
        }).catch(err => console.error("Erro ao enviar push:", err));
      }

      setFormData(initialFormState); setSelectedEvent(null); setIsEditMode(false); setIsNewEventModalOpen(false);
      fetchEventsForMonth(currentDate.getMonth(), currentDate.getFullYear());
    } catch (error) {
      setConfirmDialog({ 
        isOpen: true, isLoading: false, title: 'Erro ao Salvar', message: error.message || 'Verifique os dados e tente novamente.', 
        type: 'danger', confirmText: 'OK', showCancel: false, onConfirm: () => setConfirmDialog(prev => ({...prev, isOpen: false}))
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteEvent = (id) => {
    setConfirmDialog({
      isOpen: true, isLoading: false, title: 'Apagar Evento', message: 'Tem a certeza que deseja apagar este evento? Esta ação não pode ser desfeita.',
      type: 'danger', confirmText: 'Apagar', showCancel: true,
      onConfirm: async () => {
        try {
          const titleToDelete = selectedEvent.title;
          const dateToDelete = selectedEvent.date;

          const { data, error } = await supabase.from('events').delete().eq('id', id).select();
          
          if (error) throw error; 
          if (!data || data.length === 0) throw new Error("O evento não foi apagado. Falta a Política de DELETE na tabela events.");
          
          supabase.functions.invoke('send-push', {
            body: { eventTitle: `Evento Cancelado`, eventMessage: `O evento "${titleToDelete}" de ${dateToDelete} foi cancelado.` }
          }).catch(console.error);

          setEvents(prev => prev.filter(e => e.id !== id));
          setSelectedEvent(null); 
          setIsEditMode(false);
          fetchEventsForMonth(currentDate.getMonth(), currentDate.getFullYear());
          setConfirmDialog(prev => ({...prev, isOpen: false}));
        } catch (error) {
          setConfirmDialog({
            isOpen: true, isLoading: false, title: 'Erro ao Apagar', message: error.message || 'Falha na exclusão. Contacte o suporte.',
            type: 'danger', confirmText: 'OK', showCancel: false, onConfirm: () => setConfirmDialog(prev => ({...prev, isOpen: false}))
          });
        }
      }
    });
  };

  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
    return outputArray;
  };

  const handleSetReminder = async (event) => {
    // 1. Verifica se o navegador suporta notificações
    if (!('Notification' in window)) {
      setConfirmDialog({
        isOpen: true, isLoading: false, title: 'Não Suportado', message: 'O seu dispositivo não suporta notificações nativas.',
        type: 'danger', confirmText: 'OK', showCancel: false, onConfirm: () => setConfirmDialog(prev => ({...prev, isOpen: false}))
      });
      return;
    }

    try {
      // 2. Pede permissão ao utilizador
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Permissão negada.');
      }

      const publicVapidKey = 'BJSF3kTzfj9mdgUn2HpLfUTaeHTIzNweXVdNJUwIeci8Mrgh6Yu_WneYo6Uw3YwABAt4V_XGSVqkk3GsM_UdVU4';

      // 3. Se a chave ainda for a padrão ou não houver Service Worker ativo, faz uma notificação LOCAL.
      if (publicVapidKey === 'BJSF3kTzfj9mdgUn2HpLfUTaeHTIzNweXVdNJUwIeci8Mrgh6Yu_WneYo6Uw3YwABAt4V_XGSVqkk3GsM_UdVU4' || !('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
        
        // Dispara uma notificação nativa do sistema
        new Notification('🔔 Lembrete Ativado!', { 
          body: `Você ativou o lembrete para o evento "${event.title}".`, 
          icon: '/vite.svg' 
        });

        setConfirmDialog({
          isOpen: true, isLoading: false, title: 'Lembrete Ativado (Local)', message: 'A sua notificação foi ativada com sucesso neste dispositivo!',
          type: 'primary', confirmText: 'Excelente', showCancel: false, onConfirm: () => setConfirmDialog(prev => ({...prev, isOpen: false}))
        });
        return;
      }

      // 4. Lógica REAL de Push Notifications (Para quando a chave for configurada e o PWA estiver ativo)
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
      });

      const { error } = await supabase.from('push_subscriptions').insert([{ user_id: user.id, subscription }]);
      if (error) throw error;

      new Notification('🔔 Notificações Push Ativas!', { body: `Avisaremos sobre o evento "${event.title}".`, icon: '/vite.svg' });

      setConfirmDialog({
        isOpen: true, isLoading: false, title: 'Lembrete Ativado', message: 'Receberá uma notificação no telemóvel quando houver novidades sobre este evento!',
        type: 'primary', confirmText: 'Excelente', showCancel: false, onConfirm: () => setConfirmDialog(prev => ({...prev, isOpen: false}))
      });

    } catch (error) {
      setConfirmDialog({
        isOpen: true, isLoading: false, title: 'Aviso', message: 'Não foi possível ativar as notificações.',
        type: 'danger', confirmText: 'Entendido', showCancel: false, onConfirm: () => setConfirmDialog(prev => ({...prev, isOpen: false}))
      });
    }
  };

  const confirmGenerateRoutine = () => {
    const year = currentDate.getFullYear();
    setConfirmDialog({
      isOpen: true, isLoading: false, title: 'Confirmar Geração',
      message: `Isto irá gerar os eventos padrão para ${year}. Continuar?`, type: 'primary', confirmText: 'Gerar Rotina', showCancel: true,
      onConfirm: async () => { setIsRoutineConfigOpen(false); await handleGenerateYearlyRoutine(year); }
    });
  };

  const handleGenerateYearlyRoutine = async (year) => {
    setIsGeneratingRoutine(true);
    const routineEvents = [];
    const settings = routineSettings;

    const addEvent = (dateString, template) => {
      routineEvents.push({
        title: template.title, date: buildTimezoneSafeISOString(dateString, template.time), 
        type: template.type, location: template.location, description: template.desc, ministry_target: 'geral', created_by: user?.id
      });
    };

    for (let month = 0; month < 12; month++) {
      const daysInM = new Date(year, month + 1, 0).getDate();
      let dayCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

      for (let day = 1; day <= daysInM; day++) {
        const dateObj = new Date(year, month, day);
        const dayOfWeek = dateObj.getDay(); 
        const dateString = dateObj.toISOString().split('T')[0];
        
        dayCounts[dayOfWeek]++;
        const count = dayCounts[dayOfWeek];

        if (day <= 7 && dayOfWeek >= 1 && dayOfWeek <= 5) addEvent(dateString, settings.esp_1sem);
        if (dayOfWeek === 1) addEvent(dateString, settings.seg);
        if (dayOfWeek === 3) addEvent(dateString, settings.qua);
        if (dayOfWeek === 5) addEvent(dateString, settings.sex);
        if (dayOfWeek === 6 && count === 1) {
          const isTemploSede = [0, 3, 5, 9].includes(month);
          addEvent(dateString, { ...settings.esp_1sab, location: isTemploSede ? 'Templo Sede' : 'Nave Principal' });
        }
        if (dayOfWeek === 0) {
          addEvent(dateString, settings.dom_ebd);
          if (count === 2) addEvent(dateString, settings.esp_2dom);
          else addEvent(dateString, settings.dom_fam);
        }
        if (dayOfWeek === 2 && count === 3) addEvent(dateString, settings.esp_3ter);
      }
    }

    try {
      const { error } = await supabase.from('events').insert(routineEvents);
      if (error) throw error;
      await fetchEventsForMonth(currentDate.getMonth(), currentDate.getFullYear());
      setConfirmDialog({ 
        isOpen: true, isLoading: false, title: 'Sucesso', message: `Criados ${routineEvents.length} eventos para ${year}.`, 
        type: 'primary', confirmText: 'Concluir', showCancel: false, onConfirm: () => setConfirmDialog(prev => ({...prev, isOpen: false}))
      });
    } catch (error) {
      setConfirmDialog({ 
        isOpen: true, isLoading: false, title: 'Erro', message: error.message || 'Erro ao gerar rotina.', 
        type: 'danger', confirmText: 'OK', showCancel: false, onConfirm: () => setConfirmDialog(prev => ({...prev, isOpen: false}))
      });
    } finally {
      setIsGeneratingRoutine(false);
    }
  };

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const daysOfWeek = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  const daysInMonthCount = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const startDayOffset = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const daysInMonth = Array.from({ length: daysInMonthCount }, (_, i) => i + 1);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevYear = () => setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1));
  const nextYear = () => setCurrentDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1));

  const openNewEventModal = () => { setFormData(initialFormState); setIsEditMode(false); setIsNewEventModalOpen(true); };
  const openEditEventModal = () => {
    setFormData({
      title: selectedEvent.title, date: selectedEvent.rawDate, time: selectedEvent.time,
      location: selectedEvent.location, description: selectedEvent.description, type: selectedEvent.type,
      ministry_target: selectedEvent.ministry_target, createAnnouncement: false
    });
    setIsEditMode(true);
  };

  const updateRoutineSetting = (key, field, value) => {
    setRoutineSettings(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  };

  return (
    <>
      <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto pb-28 md:pb-10 relative">
        
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Agenda</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Gira os eventos e acompanhe a programação da igreja.</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {isAdminOrPastor && (
              <Button variant="secondary" onClick={() => setIsRoutineConfigOpen(true)} isLoading={isGeneratingRoutine} className="px-4 shrink-0 border border-slate-200 dark:border-white/10">
                <Settings className="w-4 h-4 mr-2" /> Gerar Rotina {currentDate.getFullYear()}
              </Button>
            )}
            {canCreateEvents && (
              <Button onClick={openNewEventModal} className="px-4 shrink-0">
                <Plus className="w-5 h-5 md:mr-2" /> <span className="hidden md:block">Novo Evento</span>
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* CALENDÁRIO INTERATIVO */}
          <Card className="lg:col-span-1 p-5 md:p-6 h-fit order-2 lg:order-1 border-transparent dark:border-white/5">
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-1">
                <button onClick={prevYear} className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded hover:bg-slate-100 dark:hover:bg-slate-800"><ChevronsLeft className="w-5 h-5" /></button>
                <button onClick={prevMonth} className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded hover:bg-slate-100 dark:hover:bg-slate-800"><ChevronLeft className="w-5 h-5" /></button>
              </div>
              <h3 className="font-bold text-[15px] text-slate-900 dark:text-white uppercase tracking-wider">
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
                const hasEvent = events.some(e => e.day === day);
                const isSelected = activeDay === day;
                return (
                  <button 
                    key={day} 
                    onClick={() => setActiveDay(day)} 
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
          </Card>

          {/* LISTA DE EVENTOS (LAZY LOADING) */}
          <div className="lg:col-span-2 space-y-4 order-1 lg:order-2">
            <div className="flex justify-between items-center px-1 mb-2">
              <h3 className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-sm">
                Eventos de {monthNames[currentDate.getMonth()]}
              </h3>
              <Input placeholder="Buscar evento..." icon={Search} className="h-9 w-40 md:w-56 text-xs" />
            </div>
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-14 text-slate-400 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-white/5">
                <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-500" />
                <p className="text-sm font-medium">A carregar eventos...</p>
              </div>
            ) : events.length === 0 ? (
              <Card className="p-10 text-center flex flex-col items-center justify-center border-dashed border-slate-300 dark:border-white/10">
                <CalendarIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhum evento programado para este mês.</p>
                {isAdminOrPastor && <p className="text-xs text-slate-400 mt-2">Clique em "Gerar Rotina" para preencher automaticamente.</p>}
              </Card>
            ) : (
              events.filter(e => e.day === activeDay || !activeDay).length === 0 ? (
                 <Card className="p-10 text-center flex flex-col items-center justify-center border-dashed border-slate-300 dark:border-white/10">
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhum evento para o dia selecionado.</p>
                  <button onClick={() => setActiveDay(null)} className="text-indigo-500 text-sm mt-2 hover:underline">Ver todos do mês</button>
                </Card>
              ) :
              events.filter(e => !activeDay || e.day === activeDay).map(ev => (
                <Card key={ev.id} hover onClick={() => setSelectedEvent(ev)} className="flex gap-4 p-4 md:p-5 items-center group cursor-pointer border-slate-200/60 dark:border-white/5">
                  <div className="flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-900/80 rounded-2xl p-3 min-w-[70px] border border-slate-200 dark:border-white/5 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 transition-colors">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{monthNames[ev.month].substring(0,3)}</span>
                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 leading-tight">{ev.day}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-lg text-slate-900 dark:text-white leading-tight truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{ev.title}</h4>
                    <div className="flex flex-wrap items-center text-sm text-slate-500 dark:text-slate-400 mt-1.5 gap-x-4 gap-y-1 font-medium">
                      <span className="flex items-center whitespace-nowrap"><Clock className="w-3.5 h-3.5 mr-1.5" /> {ev.time}</span>
                      <span className="flex items-center whitespace-nowrap"><MapPin className="w-3.5 h-3.5 mr-1.5" /> {ev.location}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 shrink-0 group-hover:translate-x-1 transition-transform" />
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MODAL CONFIG ROTINA */}
      {isRoutineConfigOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setIsRoutineConfigOpen(false)}></div>
          <div className="relative bg-white dark:bg-slate-950 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-white/5 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-500" /> Configurar Rotina Anual ({currentDate.getFullYear()})
                </h3>
              </div>
              <button onClick={() => setIsRoutineConfigOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 md:p-6 space-y-8 overflow-y-auto [&::-webkit-scrollbar]:hidden flex-1 bg-slate-50/30 dark:bg-slate-900/20">
              <div>
                <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-xs mb-3 pl-1">Rotina Semanal</h4>
                <div className="space-y-4">
                  {['seg', 'qua', 'sex', 'dom_ebd', 'dom_fam'].map(key => (
                    <div key={key} className="flex flex-col gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-sm hover:border-indigo-500/30 transition-colors">
                      <div className="font-bold text-sm text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-white/5 pb-2">{routineSettings[key].label}</div>
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 w-full">
                        <div className="sm:col-span-5"><Input placeholder="Título" value={routineSettings[key].title} onChange={(e) => updateRoutineSetting(key, 'title', e.target.value)} /></div>
                        <div className="sm:col-span-4"><Input placeholder="Local" icon={MapPin} value={routineSettings[key].location} onChange={(e) => updateRoutineSetting(key, 'location', e.target.value)} /></div>
                        <div className="sm:col-span-3"><Input type="time" icon={Clock} value={routineSettings[key].time} onChange={(e) => updateRoutineSetting(key, 'time', e.target.value)} /></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-xs mb-3 pl-1">Eventos Especiais Mensais</h4>
                <div className="space-y-4">
                  {['esp_1sem', 'esp_1sab', 'esp_2dom', 'esp_3ter'].map(key => (
                    <div key={key} className="flex flex-col gap-3 p-4 rounded-2xl bg-indigo-50/30 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/10 shadow-sm">
                      <div className="font-bold text-sm text-indigo-700 dark:text-indigo-400 border-b border-indigo-100 dark:border-indigo-500/10 pb-2">{routineSettings[key].label}</div>
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 w-full">
                        <div className="sm:col-span-5"><Input placeholder="Título" value={routineSettings[key].title} onChange={(e) => updateRoutineSetting(key, 'title', e.target.value)} /></div>
                        <div className="sm:col-span-4"><Input placeholder="Local" icon={MapPin} value={routineSettings[key].location} onChange={(e) => updateRoutineSetting(key, 'location', e.target.value)} disabled={key === 'esp_1sab'} /></div>
                        <div className="sm:col-span-3"><Input type="time" icon={Clock} value={routineSettings[key].time} onChange={(e) => updateRoutineSetting(key, 'time', e.target.value)} /></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-white/5 flex gap-3 justify-end shrink-0">
              <Button type="button" variant="secondary" onClick={() => setIsRoutineConfigOpen(false)}>Cancelar</Button>
              <Button type="button" onClick={confirmGenerateRoutine}><CalendarPlus className="w-4 h-4 mr-2" /> Gerar Eventos</Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL GLOBAL CONFIRMAÇÃO */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => !confirmDialog.isLoading && setConfirmDialog({...confirmDialog, isOpen: false})}></div>
          <div className="relative bg-white dark:bg-slate-950 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 ${confirmDialog.type === 'danger' ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' : 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'}`}>
                {confirmDialog.type === 'danger' ? <AlertCircle className="w-8 h-8" /> : <Settings className="w-8 h-8" />}
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{confirmDialog.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{confirmDialog.message}</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 flex gap-3 border-t border-slate-100 dark:border-white/5">
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

      {/* MODAL EVENTO */}
      {(selectedEvent || isNewEventModalOpen) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => { setSelectedEvent(null); setIsNewEventModalOpen(false); setIsEditMode(false); }}></div>
          
          <div className="relative bg-white dark:bg-slate-950 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {selectedEvent && !isEditMode ? (
              <>
                <div className="relative p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50 overflow-hidden shrink-0">
                  <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4"><CalendarIcon className="w-24 h-24 text-indigo-500" /></div>
                  <div className="relative z-10 flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 px-2">{selectedEvent.type}</Badge>
                        {selectedEvent.ministry_target !== 'geral' && <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 px-2">{selectedEvent.ministry_target}</Badge>}
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight pr-4">{selectedEvent.title}</h3>
                    </div>
                    <button onClick={() => setSelectedEvent(null)} className="p-2 bg-white dark:bg-slate-800 text-slate-500 rounded-full shadow-sm border border-slate-200 dark:border-white/10 shrink-0"><X className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto [&::-webkit-scrollbar]:hidden">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 shrink-0"><CalendarIcon className="w-5 h-5" /></div>
                      <div><p className="text-xs font-bold text-slate-400 uppercase">Data</p><p className="font-semibold text-sm">{selectedEvent.day} de {monthNames[selectedEvent.month]}</p></div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 shrink-0"><Clock className="w-5 h-5" /></div>
                      <div><p className="text-xs font-bold text-slate-400 uppercase">Horário</p><p className="font-semibold text-sm">{selectedEvent.time}</p></div>
                    </div>
                    <div className="flex items-start gap-3 col-span-2">
                      <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 shrink-0"><MapPin className="w-5 h-5" /></div>
                      <div><p className="text-xs font-bold text-slate-400 uppercase">Local</p><p className="font-semibold text-sm">{selectedEvent.location}</p></div>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-white/5">
                    <h4 className="flex items-center gap-2 text-sm font-bold mb-2"><Info className="w-4 h-4 text-indigo-500" /> Detalhes</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{selectedEvent.description || 'Nenhuma descrição fornecida.'}</p>
                  </div>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-white/5 flex gap-3 shrink-0">
                  {canManageEvent(selectedEvent) ? (
                    <>
                      <Button variant="danger" className="w-auto px-4" onClick={() => confirmDeleteEvent(selectedEvent.id)}><Trash2 className="w-4 h-4" /></Button>
                      <Button variant="secondary" className="flex-1" onClick={openEditEventModal}><Edit2 className="w-4 h-4 mr-2" /> Editar Evento</Button>
                    </>
                  ) : (
                    <Button className="w-full" onClick={() => handleSetReminder(selectedEvent)}><CalendarPlus className="w-4 h-4 mr-2" /> Ativar Lembrete</Button>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-white/5 shrink-0">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {isEditMode ? <Edit2 className="w-5 h-5 text-amber-500" /> : <CalendarIcon className="w-5 h-5 text-indigo-500" />}
                    {isEditMode ? 'Editar Evento' : 'Novo Evento'}
                  </h3>
                  <button disabled={isSubmitting} onClick={() => { setIsNewEventModalOpen(false); setSelectedEvent(null); setIsEditMode(false); }} className="p-2 bg-slate-100 dark:bg-slate-900 text-slate-500 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSaveEvent} className="flex flex-col flex-1 overflow-hidden">
                  <div className="p-6 space-y-5 overflow-y-auto [&::-webkit-scrollbar]:hidden">
                    <div className="space-y-1.5"><label className="text-sm font-semibold ml-1">Título do Evento</label><Input required placeholder="Ex: Ensaio Geral" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5"><label className="text-sm font-semibold ml-1">Data</label><Input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} /></div>
                      <div className="space-y-1.5"><label className="text-sm font-semibold ml-1">Horário (Local)</label><Input required type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} /></div>
                    </div>
                    <div className="space-y-1.5"><label className="text-sm font-semibold ml-1">Localização</label><Input required icon={MapPin} placeholder="Ex: Nave Principal" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold ml-1">Tipo de Evento</label>
                        <select className="flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-100" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                          <option value="Culto">Culto</option><option value="Ensino">Ensino</option><option value="Ensaio">Ensaio</option><option value="Reunião">Reunião</option><option value="Evento">Evento Especial</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold ml-1">Público-Alvo</label>
                        <select className="flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-100" value={formData.ministry_target} onChange={e => setFormData({...formData, ministry_target: e.target.value})}>
                          <option value="geral">Geral (Toda Igreja)</option><option value="Jovens">Jovens</option><option value="Senhoras">Senhoras</option><option value="Louvor">Louvor</option><option value="Infantil">Infantil</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1.5"><label className="text-sm font-semibold ml-1">Descrição</label><Input as="textarea" placeholder="Detalhes do evento..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="min-h-[80px]" /></div>
                    <div className="pt-2">
                      <label className="flex items-center text-slate-700 dark:text-slate-300 cursor-pointer group bg-indigo-50 dark:bg-indigo-500/10 p-3 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
                        <div className="relative flex items-center justify-center mr-3">
                          <input type="checkbox" className="peer appearance-none w-5 h-5 border-2 border-indigo-300 dark:border-indigo-700 rounded transition-colors checked:border-indigo-600 checked:bg-indigo-600 cursor-pointer" checked={formData.createAnnouncement} onChange={(e) => setFormData({...formData, createAnnouncement: e.target.checked})} />
                          <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <div>
                          <p className="font-semibold text-sm flex items-center gap-1.5"><Megaphone className="w-4 h-4 text-indigo-500"/> {isEditMode ? 'Notificar Alteração' : 'Notificar / Criar Aviso'}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Criar aviso no mural e disparar notificação Push.</p>
                        </div>
                      </label>
                    </div>
                  </div>
                  <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-white/5 flex gap-3 justify-end shrink-0">
                    <Button type="button" variant="secondary" onClick={() => { setIsNewEventModalOpen(false); if(isEditMode) setSelectedEvent(null); setIsEditMode(false); }} disabled={isSubmitting}>Cancelar</Button>
                    <Button type="submit" isLoading={isSubmitting}><Save className="w-4 h-4 mr-2"/> {isEditMode ? 'Guardar' : 'Agendar Evento'}</Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}