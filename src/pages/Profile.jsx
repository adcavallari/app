import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, Shield, Music, Camera, 
  Edit2, Key, Bell, LogOut, Calendar, ChevronRight,
  X, Upload, Trash2, ToggleRight, ToggleLeft, Loader2,
  Users, Baby, Video, Heart, BookOpen, CheckCircle2, AlertCircle
} from 'lucide-react';
import { Card, Badge, Button, Input } from '../components/ui';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase'; // <-- Importe a sua instância do Supabase

export default function Profile() {
  const { profile: authProfile, signOut } = useAuth();
  const { theme } = useTheme();
  
  const [isEditing, setIsEditing] = useState(false);
  const [activeModal, setActiveModal] = useState(null); 

  // Sistema de Alertas (Toast)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Estados de Banco de Dados
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [dbProfile, setDbProfile] = useState(null);

  // Dados do formulário
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });

  const [passwordData, setPasswordData] = useState({
    new: '',
    confirm: ''
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false
  });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message, type }), 4000);
  };

  // =========================================================================
  // INTEGRAÇÃO COM BANCO DE DADOS (SUPABASE)
  // =========================================================================

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!authProfile?.id) return;
      
      try {
        setIsLoadingProfile(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authProfile.id)
          .single();

        if (error) throw error;

        if (data) {
          setDbProfile(data);
          setFormData({
            name: data.name || '',
            phone: data.phone || '',
          });
          // Nota: Certifique-se de criar essas colunas (boolean) no seu Supabase
          setNotifications({
            email: data.notify_email ?? true,
            push: data.notify_push ?? true,
            sms: data.notify_sms ?? false,
          });
        }
      } catch (error) {
        showToast("Erro ao carregar perfil.", "error");
        console.error(error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfileData();
  }, [authProfile?.id]);

  // Salvar Edição de Perfil
  const handleSaveProfile = async () => {
    if (!authProfile?.id) return;

    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          phone: formData.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', authProfile.id);

      if (error) throw error;

      setDbProfile(prev => ({ ...prev, name: formData.name, phone: formData.phone }));
      setIsEditing(false);
      showToast("Perfil atualizado com sucesso!", "success");

    } catch (error) {
      showToast("Falha ao salvar perfil.", "error");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  // Salvar Nova Senha
  const handleUpdatePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      showToast("As senhas não coincidem.", "error");
      return;
    }
    if (passwordData.new.length < 6) {
      showToast("A senha deve ter no mínimo 6 caracteres.", "error");
      return;
    }

    try {
      setIsSavingPassword(true);
      
      // Chamada real para o Supabase Auth
      const { error } = await supabase.auth.updateUser({ 
        password: passwordData.new 
      });

      if (error) throw error;

      showToast("Palavra-passe atualizada com sucesso!", "success");
      setPasswordData({ new: '', confirm: '' });
      closeModal();

    } catch (error) {
      showToast(error.message || "Erro ao atualizar senha.", "error");
      console.error(error);
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Alternar Notificações em Tempo Real
  const toggleNotification = async (key) => {
    if (!authProfile?.id) return;

    const newValue = !notifications[key];
    
    // Atualização Otimista na Interface
    setNotifications(prev => ({ ...prev, [key]: newValue }));

    try {
      // Mapeamento dinâmico: a coluna no banco deve ser notify_email, notify_push, etc.
      const column = `notify_${key}`; 
      
      const { error } = await supabase
        .from('profiles')
        .update({ [column]: newValue })
        .eq('id', authProfile.id);

      if (error) {
        // Reverte em caso de erro
        setNotifications(prev => ({ ...prev, [key]: !newValue }));
        throw error;
      }
      
      // Opcional: mostrar toast a cada alteração
      // showToast("Preferência atualizada.", "success");

    } catch (error) {
      showToast("Erro ao salvar preferência.", "error");
      console.error(error);
    }
  };

  // =========================================================================
  // HELPERS
  // =========================================================================

  const getRoleLabel = (role) => {
    const roles = {
      admin: { label: 'Administrador', color: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' },
      pastor: { label: 'Pastor', color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' },
      lider: { label: 'Líder', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' },
      membro: { label: 'Membro', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
    };
    return roles[role?.toLowerCase()] || roles.membro;
  };

  const roleInfo = getRoleLabel(dbProfile?.role || 'membro');
  
  const closeModal = () => {
    setActiveModal(null);
    setPasswordData({ new: '', confirm: '' });
  };

  const formatMemberSince = (dateString) => {
    if (!dateString) return 'Data não informada';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace('.', '');
  };

  // Define um ícone dinâmico baseado no nome do ministério
  const getMinistryIcon = (ministryName) => {
    const lowerName = ministryName.toLowerCase();
    if (lowerName.includes('louvor') || lowerName.includes('música')) return Music;
    if (lowerName.includes('jovem') || lowerName.includes('jovens') || lowerName.includes('adolescentes')) return Users;
    if (lowerName.includes('infantil') || lowerName.includes('criança') || lowerName.includes('kids')) return Baby;
    if (lowerName.includes('mídia') || lowerName.includes('comunicação') || lowerName.includes('video')) return Video;
    if (lowerName.includes('ensino') || lowerName.includes('ebd') || lowerName.includes('escola')) return BookOpen;
    if (lowerName.includes('diaconia') || lowerName.includes('acolhimento')) return Heart;
    return Shield; // Ícone padrão
  };

  if (isLoadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4 animate-in fade-in">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-slate-500 dark:text-slate-400">Carregando perfil...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto pb-28 md:pb-10 relative">
      
      {/* Sistema de Toast Customizado */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right-8 fade-in duration-300">
          <div className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border backdrop-blur-md",
            toast.type === 'success' 
              ? "bg-emerald-50/90 border-emerald-200 text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400" 
              : "bg-red-50/90 border-red-200 text-red-800 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400"
          )}>
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-medium text-sm">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Meu Perfil</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Gerencie suas informações e preferências de conta.</p>
        </div>
        <Button 
          variant={isEditing ? 'secondary' : 'primary'} 
          onClick={() => {
            if (isEditing) {
              setFormData({ name: dbProfile.name, phone: dbProfile.phone });
            }
            setIsEditing(!isEditing);
          }} 
          className="w-full md:w-auto px-4"
        >
          {isEditing ? 'Cancelar Edição' : <><Edit2 className="w-4 h-4 mr-2" /> Editar Perfil</>}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* =========================================================
            COLUNA ESQUERDA: FOTO E INFORMAÇÕES BÁSICAS
            ========================================================= */}
        <div className="space-y-6">
          <Card className="flex flex-col items-center text-center p-8">
            <div className="relative group mb-4">
              {dbProfile?.photo_url ? (
                <img src={dbProfile.photo_url} alt="Perfil" className="w-28 h-28 rounded-full object-cover shadow-xl shadow-indigo-500/30 border-4 border-white dark:border-slate-800" />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-indigo-500/30 border-4 border-white dark:border-slate-800">
                  {dbProfile?.name?.charAt(0) || 'U'}
                </div>
              )}
              
              <button 
                onClick={() => setActiveModal('avatar')}
                className="absolute bottom-0 right-0 p-2.5 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group-hover:scale-110"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{dbProfile?.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{dbProfile?.email}</p>
            
            <Badge className={cn("px-3 py-1 text-xs border-none", roleInfo.color)}>
              <Shield className="w-3 h-3 mr-1.5" /> {roleInfo.label}
            </Badge>

            <div className="w-full h-px bg-slate-100 dark:bg-white/5 my-6"></div>

            <div className="w-full flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
              <span className="flex items-center"><Calendar className="w-4 h-4 mr-2" /> Membro desde</span>
              <span className="font-semibold text-slate-900 dark:text-white capitalize">
                {formatMemberSince(dbProfile?.member_since)}
              </span>
            </div>
          </Card>

          {/* Ministérios */}
          <Card className="p-0 overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider">Meus Ministérios</h4>
            </div>
            <div className="p-2">
              {dbProfile?.ministry ? (
                dbProfile.ministry.split(',').map((ministryName, idx) => {
                  const MinistryIcon = getMinistryIcon(ministryName);
                  return (
                    <div key={idx} className="flex items-center p-3 gap-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
                        <MinistryIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm text-slate-900 dark:text-white capitalize">{ministryName.trim()}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-sm text-slate-500">
                  Nenhum ministério vinculado.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* =========================================================
            COLUNA DIREITA: DADOS DO FORMULÁRIO E CONFIGURAÇÕES
            ========================================================= */}
        <div className="lg:col-span-2 space-y-6">
          
          <Card className="p-6 md:p-8">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Dados Pessoais</h3>
            
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Nome Completo</label>
                  <Input 
                    icon={User} 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    disabled={!isEditing || isSaving}
                    className={(!isEditing || isSaving) ? "opacity-70 cursor-not-allowed" : ""}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Telemóvel / WhatsApp</label>
                  <Input 
                    icon={Phone} 
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    disabled={!isEditing || isSaving}
                    className={(!isEditing || isSaving) ? "opacity-70 cursor-not-allowed" : ""}
                  />
                </div>
              </div>

              {/* Campo E-mail Bloqueado Sempre */}
              <div className="space-y-1.5 relative">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Endereço de E-mail</label>
                <div className="relative group">
                  <Input 
                    icon={Mail} 
                    value={dbProfile?.email || ''} 
                    readOnly
                    disabled={true}
                    className="opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-800/50"
                  />
                  {isEditing && (
                    <div className="absolute top-1/2 -translate-y-1/2 right-3 text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      O E-mail não pode ser alterado
                    </div>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="pt-4 flex justify-end animate-in fade-in duration-300">
                  <Button 
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="min-w-[180px]"
                  >
                    {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</> : 'Guardar Alterações'}
                  </Button>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider">Segurança & Preferências</h4>
            </div>
            
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              <div 
                onClick={() => setActiveModal('password')}
                className="p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">Alterar Palavra-passe</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Atualize a sua credencial de acesso</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:translate-x-1 transition-transform" />
              </div>

              <div 
                onClick={() => setActiveModal('notifications')}
                className="p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">Notificações</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Gerir alertas de eventos e escalas</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Card>

          <Button 
            variant="danger" 
            onClick={() => {
              // Custom Confirm Logic could go here, but for now it logs out
              signOut();
            }} 
            className="w-full h-14"
          >
            <LogOut className="w-5 h-5 mr-2" /> Encerrar Sessão
          </Button>

        </div>
      </div>

      {/* =========================================================
          MODAIS (POP-UPS) DE PERFIL
          ========================================================= */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={closeModal}></div>
          <div className="relative bg-white dark:bg-slate-950 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-white/5 shrink-0">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {activeModal === 'password' && <><Key className="w-5 h-5 text-indigo-500" /> Alterar Palavra-passe</>}
                {activeModal === 'notifications' && <><Bell className="w-5 h-5 text-indigo-500" /> Preferências de Notificação</>}
                {activeModal === 'avatar' && <><Camera className="w-5 h-5 text-indigo-500" /> Alterar Foto de Perfil</>}
              </h3>
              <button onClick={closeModal} className="p-2 bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto [&::-webkit-scrollbar]:hidden">
              
              {/* === CONTEÚDO: PALAVRA-PASSE === */}
              {activeModal === 'password' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Nova Palavra-passe</label>
                    <Input 
                      type="password" 
                      placeholder="Mínimo de 6 caracteres" 
                      icon={Key}
                      value={passwordData.new}
                      onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
                      disabled={isSavingPassword}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Confirmar Nova Palavra-passe</label>
                    <Input 
                      type="password" 
                      placeholder="Repita a nova palavra-passe" 
                      icon={Key}
                      value={passwordData.confirm}
                      onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
                      disabled={isSavingPassword}
                    />
                  </div>
                  <div className="pt-2">
                    <Button onClick={handleUpdatePassword} disabled={isSavingPassword} className="w-full">
                      {isSavingPassword ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Atualizando...</> : 'Atualizar Palavra-passe'}
                    </Button>
                  </div>
                </div>
              )}

              {/* === CONTEÚDO: NOTIFICAÇÕES === */}
              {activeModal === 'notifications' && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    Suas preferências são salvas automaticamente ao clicar.
                  </p>
                  <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-white/5 rounded-xl bg-slate-50 dark:bg-slate-900/50 cursor-pointer hover:border-indigo-500/50 transition-colors" onClick={() => toggleNotification('email')}>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">Notificações por E-mail</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Avisos e escalas semanais</p>
                    </div>
                    <button className={cn("transition-colors", notifications.email ? "text-indigo-500" : "text-slate-400")}>
                      {notifications.email ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-white/5 rounded-xl bg-slate-50 dark:bg-slate-900/50 cursor-pointer hover:border-indigo-500/50 transition-colors" onClick={() => toggleNotification('push')}>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">Notificações no Hub</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Alertas de mensagens e murais</p>
                    </div>
                    <button className={cn("transition-colors", notifications.push ? "text-indigo-500" : "text-slate-400")}>
                      {notifications.push ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-white/5 rounded-xl bg-slate-50 dark:bg-slate-900/50 cursor-pointer hover:border-indigo-500/50 transition-colors" onClick={() => toggleNotification('sms')}>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">Notificações por SMS</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Lembretes urgentes (apenas líderes)</p>
                    </div>
                    <button className={cn("transition-colors", notifications.sms ? "text-indigo-500" : "text-slate-400")}>
                      {notifications.sms ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
                    </button>
                  </div>
                </div>
              )}

              {/* === CONTEÚDO: FOTO DE PERFIL === */}
              {activeModal === 'avatar' && (
                <div className="flex flex-col items-center justify-center space-y-6 py-4">
                  {dbProfile?.photo_url ? (
                    <img src={dbProfile.photo_url} alt="Perfil" className="w-32 h-32 rounded-full object-cover shadow-xl shadow-indigo-500/30" />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-4xl font-bold text-white shadow-xl shadow-indigo-500/30">
                      {dbProfile?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-3 w-full">
                    <Button className="w-full h-12">
                      <Upload className="w-4 h-4 mr-2" /> Fazer Upload de Foto
                    </Button>
                    <Button variant="danger" className="w-full h-12 bg-white dark:bg-slate-900">
                      <Trash2 className="w-4 h-4 mr-2" /> Remover Foto Atual
                    </Button>
                  </div>
                </div>
              )}

            </div>

            {/* Rodapé Dinâmico das Modais */}
            {activeModal !== 'password' && (
              <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-white/5 flex gap-3 justify-end shrink-0">
                <Button variant="secondary" onClick={closeModal}>{activeModal === 'notifications' ? 'Fechar' : 'Cancelar'}</Button>
                {activeModal === 'avatar' && <Button onClick={closeModal}>Salvar Foto</Button>}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}