import React, { useState } from 'react';
import { 
  MessageSquare, Search, Phone, Video, MoreVertical, 
  Send, Mic, Smile, Paperclip, ArrowLeft, Camera, Lock, CheckCheck
} from 'lucide-react';

export default function Chat() {
  // No mobile, se for null mostra a lista. Se tiver um ID, mostra apenas o chat.
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');

  // Perfil fictício do utilizador atual
  const profile = { id: 'meu_id', full_name: 'Irmão João' };

  // =========================================================================
  // DADOS MOCKADOS
  // =========================================================================
  const filters = ['Todos', 'Não lidas', 'Favoritos', 'Grupos'];

  const contacts = [
    { id: 1, name: 'Pr. Marcos Cavallari', role: 'Pastor', lastMsg: 'A campanha vai durar os 7 dias completos, começando amanhã e terminando no culto de domingo.', time: '10:45', unread: 2, online: true },
    { id: 2, name: 'Grupo de Louvor', role: 'Ministério', lastMsg: 'Ana: O ensaio está marcado para as 15h.', time: 'Ontem', unread: 0, online: false },
    { id: 3, name: 'Pr. Antônio (Obreiros)', role: 'Líder', lastMsg: 'Tudo certo com a escala de domingo.', time: 'Ontem', unread: 1, online: true },
    { id: 4, name: 'Secretaria AD Cavallari', role: 'Administração', lastMsg: 'Seu cadastro foi atualizado com sucesso.', time: 'Segunda', unread: 0, online: false },
    { id: 5, name: 'Irmã Maria', role: 'Membro', lastMsg: 'Amém! Deus abençoe. Estaremos lá com certeza para glorificar ao Senhor e adorar com toda a igreja!', time: '12/11/2023', unread: 0, online: false },
  ];

  const messages = [
    { id: 1, text: 'A paz do Senhor, Pastor!', senderId: 'meu_id', time: '10:30', status: 'read' },
    { id: 2, text: 'Gostaria de tirar uma dúvida sobre a campanha de jejum. Ela começa amanhã mesmo?', senderId: 'meu_id', time: '10:30', status: 'read' },
    { id: 3, text: 'A paz, meu irmão! Claro, pode perguntar.', senderId: 1, time: '10:35' },
    { id: 4, text: 'Sim, a campanha vai durar os 7 dias completos, começando amanhã e terminando no culto de domingo.', senderId: 1, time: '10:45' },
  ];

  const currentContact = contacts.find(c => c.id === activeChat);

  return (
    /* Mantida a correção Mobile: Contentor fixed prende-se entre o topo e o bottom. 
       Cores ajustadas para o Navy Blue Profundo (slate-950) */
    <div className="fixed top-[72px] bottom-[90px] left-0 right-0 z-20 md:static md:h-[calc(100vh-10rem)] flex md:gap-6 w-full max-w-7xl mx-auto overflow-hidden bg-slate-50 dark:bg-slate-950 md:bg-transparent">
      
      {/* =========================================
          LISTA DE CONTACTOS (Sidebar)
          ========================================= */}
      <div className={`flex-col p-0 overflow-hidden shrink-0 w-full md:w-[380px] bg-white dark:bg-slate-900 md:border md:border-slate-200/60 md:dark:border-white/5 md:rounded-3xl md:shadow-lg ${activeChat !== null ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Header da Lista */}
        <div className="p-4 pb-2 border-b border-slate-100 dark:border-white/5 bg-white/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
              <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-500" /> Mensagens
            </h2>
            <div className="flex gap-2">
              <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <Camera className="w-5 h-5" />
              </button>
              <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="relative w-full mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Procurar conversas..." 
              className="flex h-10 w-full rounded-xl border-none bg-slate-100 dark:bg-slate-950 px-4 pl-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-slate-100 transition-shadow min-w-0"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scroll-smooth [&::-webkit-scrollbar]:hidden">
            {filters.map(filter => (
              <button 
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeFilter === filter 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-600/20 dark:text-blue-400' 
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
        
        {/* Lista de Conversas */}
        <div className="overflow-y-auto flex-1 p-2 bg-slate-50/50 dark:bg-slate-900/30 w-full">
          {contacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => setActiveChat(contact.id)}
              className={`w-full flex items-center p-3 rounded-2xl text-left transition-all duration-200 group overflow-hidden ${
                activeChat === contact.id ? 'bg-slate-100 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="relative shrink-0 mr-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${activeChat === contact.id ? 'bg-blue-600 text-white' : 'bg-blue-100 dark:bg-slate-800 text-blue-700 dark:text-slate-300'}`}>
                  {contact.name.charAt(0)}
                </div>
                {contact.online && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>}
              </div>

              <div className="flex-1 min-w-0 py-1 flex flex-col justify-center border-none">
                <div className="flex items-center justify-between mb-0.5 min-w-0">
                  <h4 className={`font-semibold text-[15px] truncate pr-2 min-w-0 ${activeChat === contact.id ? 'text-slate-900 dark:text-white' : 'text-slate-900 dark:text-slate-100'}`}>
                    {contact.name}
                  </h4>
                  <span className={`text-xs whitespace-nowrap shrink-0 font-medium ${activeChat === contact.id ? 'text-blue-600 dark:text-blue-400' : contact.unread > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}>
                    {contact.time}
                  </span>
                </div>
                
                {/* min-w-0 CRUCIAL aqui para não alargar a página */}
                <div className="flex items-center justify-between gap-2 w-full min-w-0">
                  <p className={`text-sm truncate flex-1 min-w-0 ${activeChat === contact.id ? 'text-slate-700 dark:text-slate-300' : contact.unread > 0 ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                    {contact.lastMsg}
                  </p>
                  
                  {contact.unread > 0 && activeChat !== contact.id && (
                    <div className="shrink-0 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm shadow-blue-500/40">
                      {contact.unread}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* =========================================
          JANELA DE CHAT
          ========================================= */}
      <div className={`flex-1 flex-col p-0 overflow-hidden bg-slate-50 dark:bg-slate-950 md:border md:border-slate-200/60 md:dark:border-white/5 md:rounded-3xl md:shadow-lg relative ${activeChat === null ? 'hidden md:flex md:items-center md:justify-center' : 'flex'}`}>
        
        {!activeChat ? (
          // Tela vazia no Desktop
          <div className="flex flex-col items-center justify-center text-center p-6 text-slate-400 dark:text-slate-500 z-10 w-full h-full">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">Seu Chat Ministerial</h3>
            <p className="max-w-sm text-sm">Selecione uma conversa ao lado para enviar mensagens aos seus líderes e ministérios.</p>
          </div>
        ) : (
          <>
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-80 dark:opacity-[0.03] bg-fixed pointer-events-none"></div>

            {/* Cabeçalho do Chat */}
            <div className="flex items-center justify-between p-3 md:p-4 border-b border-slate-200/80 dark:border-white/5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-10 shrink-0 shadow-sm md:shadow-none">
              <div className="flex items-center gap-2 md:gap-3 min-w-0">
                <button 
                  onClick={() => setActiveChat(null)}
                  className="md:hidden p-2 -ml-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>

                <div className="flex items-center gap-3 cursor-pointer p-1 rounded-xl min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-blue-100 dark:bg-slate-800 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-lg">
                      {currentContact?.name.charAt(0)}
                    </div>
                    {currentContact?.online && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>}
                  </div>
                  <div className="min-w-0 flex flex-col justify-center">
                    <h3 className="font-bold text-slate-900 dark:text-white leading-tight truncate pr-2">{currentContact?.name}</h3>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium truncate">{currentContact?.online ? 'online' : currentContact?.role}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1 md:gap-2 mr-1 shrink-0">
                <button className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden sm:block">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Área de Mensagens (Scroll) */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 z-10 w-full">
              {messages.map((msg) => {
                const isMe = msg.senderId === profile?.id;
                return (
                  <div key={msg.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`
                      max-w-[85%] md:max-w-[70%] rounded-2xl p-3 md:p-4 shadow-sm relative flex flex-col
                      ${isMe 
                        ? 'bg-blue-600 text-white rounded-tr-sm shadow-blue-500/20' 
                        : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 text-slate-800 dark:text-slate-200 rounded-tl-sm shadow-slate-200/50 dark:shadow-none'
                      }
                    `}>
                      {/* Triângulo direcional (Tail) */}
                      <div className={`absolute top-0 w-3 h-3 ${isMe ? '-right-2 bg-blue-600' : '-left-2 bg-white dark:bg-slate-800'} [clip-path:polygon(0_0,100%_0,0_100%)] ${isMe ? 'rotate-90' : 'rotate-0'}`}></div>

                      <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap pr-12 pb-2">
                        {msg.text}
                      </p>
                      
                      {/* Hora e Visto de leitura dentro da bolha no canto inferior direito */}
                      <div className={`absolute bottom-1.5 right-2.5 flex items-center gap-1 text-[10px] font-medium ${isMe ? 'text-blue-200' : 'text-slate-400 dark:text-slate-400'}`}>
                        {msg.time}
                        {isMe && (
                          <CheckCheck className={`w-3.5 h-3.5 ${msg.status === 'read' ? 'text-blue-300' : 'text-slate-400'}`} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input de Nova Mensagem */}
            <div className="p-3 md:p-4 border-t border-slate-200/80 dark:border-white/5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex items-end gap-2 md:gap-3 z-10 shrink-0">
              
              <button className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors hidden sm:block pb-3">
                <Smile className="w-6 h-6" />
              </button>
              <button className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors pb-3">
                <Paperclip className="w-5 h-5" />
              </button>
              
              <textarea 
                rows="1"
                placeholder="Digite uma mensagem..." 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/5 rounded-3xl py-3.5 px-5 text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none max-h-32 min-w-0 shadow-inner"
                style={{ height: 'auto' }}
              />
              
              <button 
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90 shrink-0 mb-0.5 ${
                  message.trim() ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 shadow-none'
                }`}
                onClick={() => { if(message.trim()) setMessage(''); }}
                disabled={!message.trim()}
              >
                <Send className="w-5 h-5 ml-1" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}