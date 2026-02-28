import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Search, Pin, PinOff, Trash2, Edit, X, Calendar, AlertCircle, Loader2, Bell, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Card, Badge, Button, Input } from '../components/ui';
import { cn } from '../lib/utils';

export default function Announcements() {
  const { profile, user } = useAuth();
  
  const [avisos, setAvisos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modais e Estados do Formulário
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [visibility, setVisibility] = useState('geral');
  const [sendPush, setSendPush] = useState(true);
  
  const [formData, setFormData] = useState({ title: '', content: '' });

  // Modal de Confirmação Estilizado
  const [confirmDialog, setConfirmDialog] = useState({ 
    isOpen: false, isLoading: false, title: '', message: '', 
    type: 'primary', confirmText: 'Confirmar', showCancel: true, onConfirm: null 
  });

  // Permissões
  const userRole = profile?.role || 'membro';
  const isAdminOrPastor = ['admin', 'pastor'].includes(userRole);
  const isLider = userRole === 'lider';
  const canManageAvisos = isAdminOrPastor || isLider;

  // Função para saber se a pessoa pode apagar ESTE aviso específico
  const canDeleteAviso = (aviso) => {
    if (!aviso) return false;
    if (isAdminOrPastor) return true;
    if (isLider) {
      if (aviso.created_by === user?.id) return true;
      if (aviso.ministry_target !== 'geral' && profile?.ministry?.includes(aviso.ministry_target)) return true;
    }
    return false;
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formatted = data.map(aviso => {
          const dateObj = new Date(aviso.created_at || new Date());
          return {
            id: aviso.id,
            title: aviso.title,
            desc: aviso.content,
            pinned: aviso.is_pinned,
            target: aviso.ministry_target === 'geral' ? 'Geral' : aviso.ministry_target,
            author: aviso.author_name || 'Equipe', 
            created_by: aviso.created_by,
            date: dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
          };
        });
        setAvisos(formatted);
      }
    } catch (error) {
      console.error("Erro ao buscar avisos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;
    
    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        type: 'aviso',
        ministry_target: visibility,
        is_pinned: isPinned,
        created_by: user?.id,
        author_name: profile?.full_name || 'Admin'
      };

      const { error } = await supabase.from('announcements').insert([payload]);
      if (error) throw error;

      if (sendPush) {
        await supabase.functions.invoke('send-push', {
          body: { 
            eventTitle: `📢 Aviso: ${formData.title}`, 
            eventMessage: formData.content 
          }
        }).catch(err => console.error("Erro ao enviar push:", err));
      }

      setFormData({ title: '', content: '' });
      setIsPinned(false);
      setVisibility('geral');
      setSendPush(true);
      setIsModalOpen(false);
      
      fetchAnnouncements();
    } catch (error) {
      console.error("Erro ao criar aviso:", error);
      setConfirmDialog({ 
        isOpen: true, isLoading: false, title: 'Erro ao Publicar', 
        message: error.message || 'Ocorreu um erro ao criar o aviso. Tente novamente.', 
        type: 'danger', confirmText: 'OK', showCancel: false, 
        onConfirm: () => setConfirmDialog(prev => ({...prev, isOpen: false}))
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePin = async (id, currentPinnedStatus) => {
    try {
      setAvisos(avisos.map(a => a.id === id ? { ...a, pinned: !currentPinnedStatus } : a));
      
      const { error } = await supabase
        .from('announcements')
        .update({ is_pinned: !currentPinnedStatus })
        .eq('id', id);

      if (error) throw error;
      fetchAnnouncements(); 
    } catch (error) {
      console.error("Erro ao fixar aviso:", error);
      fetchAnnouncements(); 
    }
  };

  const confirmDeleteAviso = (id) => {
    setConfirmDialog({
      isOpen: true,
      isLoading: false,
      title: 'Apagar Aviso',
      message: 'Tem a certeza que deseja apagar este aviso? Ele será removido do mural de todos os membros.',
      type: 'danger',
      confirmText: 'Apagar',
      showCancel: true,
      onConfirm: async () => {
        try {
          const { data, error } = await supabase.from('announcements').delete().eq('id', id).select();
          
          if (error) throw error;
          if (!data || data.length === 0) {
            throw new Error("O aviso não foi apagado. O Supabase bloqueou (Verifique as Permissões RLS de DELETE).");
          }
          
          setAvisos(prev => prev.filter(a => a.id !== id));
          setConfirmDialog(prev => ({...prev, isOpen: false}));
        } catch (error) {
          console.error("Erro detalhado ao apagar:", error);
          setConfirmDialog({
            isOpen: true, isLoading: false, title: 'Erro ao Apagar',
            message: error.message || 'Falha na exclusão. Contacte o suporte.',
            type: 'danger', confirmText: 'OK', showCancel: false,
            onConfirm: () => setConfirmDialog(prev => ({...prev, isOpen: false}))
          });
        }
      }
    });
  };

  // ⚠️ Fragmento principal adicionado para libertar os modais da área "animate-in"
  return (
    <>
      <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto pb-28 md:pb-10 relative">
        
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Megaphone className="w-8 h-8 text-indigo-500" />
              Quadro de Avisos
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm md:text-base">
              Mantenha-se atualizado com os últimos comunicados da igreja.
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Input placeholder="Pesquisar aviso..." icon={Search} className="h-12 w-full md:w-64" />
            {canManageAvisos && (
              <Button onClick={() => setIsModalOpen(true)} className="px-4 whitespace-nowrap shrink-0">
                <Plus className="w-5 h-5 md:mr-2" /> <span className="hidden md:block">Novo Aviso</span>
              </Button>
            )}
          </div>
        </div>

        {/* Lista de Avisos */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-14 text-slate-400 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-white/5">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-indigo-500" />
            <p className="text-sm font-medium">A carregar avisos...</p>
          </div>
        ) : avisos.length === 0 ? (
          <Card className="p-10 text-center flex flex-col items-center justify-center border-dashed border-slate-300 dark:border-slate-700">
            <Megaphone className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">Nenhum aviso publicado ainda.</p>
            {canManageAvisos && <Button onClick={() => setIsModalOpen(true)} variant="secondary" className="mt-4">Criar o Primeiro Aviso</Button>}
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {avisos.map((aviso) => (
              <Card 
                key={aviso.id} 
                className={cn(
                  "p-5 flex flex-col md:flex-row gap-4 items-start border-l-4 transition-colors", 
                  aviso.pinned 
                    ? "border-l-amber-500 bg-amber-50/80 dark:bg-slate-800/80 dark:border-l-amber-500 shadow-amber-500/10" 
                    : "border-l-transparent dark:border-l-transparent"
                )}
              >
                
                <div className={cn("p-3 rounded-xl shrink-0 mt-1", aviso.pinned ? "bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400")}>
                  <Megaphone className="w-6 h-6" />
                </div>
                
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white truncate">{aviso.title}</h4>
                    {aviso.pinned && <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-none px-2"><Pin className="w-3 h-3 mr-1" /> Fixado</Badge>}
                    {aviso.target !== "Geral" && <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 border-none px-2">{aviso.target}</Badge>}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4 whitespace-pre-wrap">
                    {aviso.desc}
                  </p>
                  <div className="flex items-center text-xs font-semibold text-slate-400 dark:text-slate-500 gap-4">
                    <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1" /> {aviso.date}</span>
                    <span className="flex items-center opacity-50">•</span>
                    <span>Por: {aviso.author}</span>
                  </div>
                </div>

                {/* Ações (Apenas visível se o utilizador puder gerir ESTE aviso específico) */}
                {canDeleteAviso(aviso) && (
                  <div className="flex md:flex-col gap-2 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800/80">
                    <Button variant="secondary" onClick={() => togglePin(aviso.id, aviso.pinned)} className="h-10 flex-1 md:flex-none px-3">
                      {aviso.pinned ? <><PinOff className="w-4 h-4 mr-2" /> Desfixar</> : <><Pin className="w-4 h-4 mr-2" /> Fixar</>}
                    </Button>
                    <Button variant="danger" onClick={() => confirmDeleteAviso(aviso.id)} className="h-10 flex-1 px-0 pt-2 pb-2"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* =========================================================
          MODAIS TOTALMENTE SOLTOS (Fora da div animate-in)
          ========================================================= */}
      
      {/* MODAL: NOVO AVISO COM NOTIFICAÇÃO PUSH */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => !isSubmitting && setIsModalOpen(false)}></div>
          <div className="relative bg-white dark:bg-slate-950 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-white/5 shrink-0">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-indigo-500" /> Publicar Aviso
              </h3>
              <button disabled={isSubmitting} onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-5 overflow-y-auto [&::-webkit-scrollbar]:hidden">
                
                <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-4 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Este aviso ficará visível no mural. Pode optar por enviar também uma notificação imediata para os telemóveis.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Título do Aviso</label>
                  <Input 
                    required
                    placeholder="Ex: Inscrições Abertas" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Mensagem</label>
                  <Input 
                    required
                    as="textarea" 
                    placeholder="Escreva os detalhes do aviso aqui..." 
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Público-Alvo</label>
                  <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                    <button type="button" onClick={() => setVisibility('geral')} className={cn("flex-1 py-2 text-sm font-bold rounded-lg transition-colors", visibility === 'geral' ? "bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400")}>Geral (Toda Igreja)</button>
                    <button type="button" onClick={() => setVisibility('ministerio')} className={cn("flex-1 py-2 text-sm font-bold rounded-lg transition-colors", visibility === 'ministerio' ? "bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400")}>Apenas Líderes</button>
                  </div>
                </div>

                {/* Toggles (Fixar e Notificar) */}
                <div className="space-y-3 mt-4">
                  <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-white/5 rounded-xl bg-slate-50 dark:bg-slate-900/50 cursor-pointer hover:border-indigo-500/50 transition-colors" onClick={() => setIsPinned(!isPinned)}>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">Fixar no Topo</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">O aviso ficará destacado primeiro que os outros no mural.</p>
                    </div>
                    <div className={cn("w-12 h-6 rounded-full flex items-center px-1 transition-colors", isPinned ? "bg-indigo-500" : "bg-slate-300 dark:bg-slate-700")}>
                      <div className={cn("w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300", isPinned ? "translate-x-6" : "translate-x-0")}></div>
                    </div>
                  </div>

                  {/* TOGGLE: NOTIFICAÇÕES PUSH */}
                  <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-white/5 rounded-xl bg-slate-50 dark:bg-slate-900/50 cursor-pointer hover:border-indigo-500/50 transition-colors" onClick={() => setSendPush(!sendPush)}>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5"><Bell className="w-4 h-4 text-indigo-500"/> Enviar Notificação Push</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Todos os membros vão receber um alerta sonoro no telemóvel.</p>
                    </div>
                    <div className={cn("w-12 h-6 rounded-full flex items-center px-1 transition-colors", sendPush ? "bg-indigo-500" : "bg-slate-300 dark:bg-slate-700")}>
                      <div className={cn("w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300", sendPush ? "translate-x-6" : "translate-x-0")}></div>
                    </div>
                  </div>
                </div>

              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-white/5 flex gap-3 justify-end shrink-0">
                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Cancelar</Button>
                <Button type="submit" isLoading={isSubmitting}>Publicar Agora</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL GLOBAL DE CONFIRMAÇÃO */}
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
                <Button variant="secondary" className="flex-1" disabled={confirmDialog.isLoading} onClick={() => setConfirmDialog({...confirmDialog, isOpen: false})}>
                  Cancelar
                </Button>
              )}
              <Button 
                variant={confirmDialog.type} 
                className="flex-1" 
                isLoading={confirmDialog.isLoading}
                onClick={async () => {
                  if (confirmDialog.onConfirm) {
                    setConfirmDialog(prev => ({...prev, isLoading: true}));
                    await confirmDialog.onConfirm();
                  } else {
                    setConfirmDialog(prev => ({...prev, isOpen: false}));
                  }
                }}
              >
                {confirmDialog.confirmText}
              </Button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}