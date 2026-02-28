import React from 'react';
import { MapPin, Clock, Phone, Mail, Navigation, Car } from 'lucide-react';

export default function Location() {
  
  const destination = "Avenida Maria Fernandes Cavallari, 2399, Marília, SP"; 
  
  // URL do iframe do Google Maps baseada no endereço real
  const mapIframeUrl = "https://maps.google.com/maps?q=Avenida%20Maria%20Fernandes%20Cavalari,%202399,%20Mar%C3%ADlia,%20SP&t=&z=16&ie=UTF8&iwloc=&output=embed";

  const openWaze = () => {
    window.open(`https://waze.com/ul?q=${encodeURIComponent(destination)}`, '_blank');
  };

  const openGoogleMaps = () => {
    window.open(`https://maps.google.com/?q=${encodeURIComponent(destination)}`, '_blank');
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto pb-10">
      
      {/* Cabeçalho */}
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <MapPin className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />
          Nossa Igreja
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm md:text-base">
          Estamos de portas abertas para receber você e a sua família.
        </p>
      </div>

      {/* =========================================
          MAPA INTERATIVO E NAVEGAÇÃO (Movido para cima)
          ========================================= */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-3xl overflow-hidden shadow-lg">
        
        {/* Iframe do Mapa */}
        <div className="w-full h-64 md:h-96 relative bg-slate-200 dark:bg-slate-800">
          <iframe 
            title="Mapa AD Cavallari"
            src={mapIframeUrl} 
            className="w-full h-full border-0 dark:invert-[.9] dark:hue-rotate-180 dark:contrast-125 transition-all duration-300"
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>

        {/* Botões Waze / Maps com Logos customizadas */}
        <div className="p-6 md:p-8">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4 text-center">Navegar até à Igreja</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Botão Google Maps */}
            <button 
              onClick={openGoogleMaps} 
              className="flex items-center justify-center w-full h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:border-blue-500/50 hover:bg-white dark:hover:bg-slate-700 transition-all group shadow-sm active:scale-95"
            >
              <svg className="w-6 h-6 mr-3 text-slate-400 group-hover:text-blue-500 transition-colors" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/>
              </svg>
              <span className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Google Maps
              </span>
            </button>
            
            {/* Botão Waze */}
            <button 
              onClick={openWaze} 
              className="flex items-center justify-center w-full h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:border-blue-500/50 hover:bg-white dark:hover:bg-slate-700 transition-all group shadow-sm active:scale-95"
            >
              <svg className="w-6 h-6 mr-3 text-slate-400 group-hover:text-blue-500 transition-colors" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5.002,12C5.002,8.14 8.142,5 12.002,5C15.862,5 19.002,8.14 19.002,12C19.002,15.86 15.862,19 12.002,19C11.182,19 10.402,18.84 9.682,18.57L5.002,20L5.782,16.1C5.272,14.89 5.002,13.48 5.002,12Z" fill="currentColor"/>
                <circle cx="9.5" cy="10.5" r="1.5" fill="var(--tw-bg-opacity, white)" className="text-white dark:text-slate-800" />
                <circle cx="14.5" cy="10.5" r="1.5" fill="var(--tw-bg-opacity, white)" className="text-white dark:text-slate-800" />
              </svg>
              <span className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Usar Waze
              </span>
            </button>

          </div>
        </div>
      </div>

      {/* =========================================
          INFORMAÇÕES DE CONTATO E HORÁRIOS (Movido para baixo)
          ========================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-3xl p-5 shadow-sm hover:border-blue-500/30 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
            <Phone className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white mb-1">Telefone</h3>
          <p className="text-slate-700 dark:text-slate-300 font-medium">(14) 0000-0000</p>
          <p className="text-xs text-rose-500 dark:text-rose-400 font-medium mt-1">Estamos sem telefone no momento!</p>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-3xl p-5 shadow-sm hover:border-blue-500/30 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
            <Mail className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white mb-1">Email</h3>
          <p className="text-slate-700 dark:text-slate-300 font-medium text-sm sm:text-base truncate">ad.cavallri@gmail.com</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">Respondemos em até 24h</p>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-3xl p-5 shadow-sm hover:border-blue-500/30 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
            <MapPin className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white mb-1">Endereço</h3>
          <p className="text-slate-700 dark:text-slate-300 font-medium text-sm">Av. Maria Fernandes Cavalari, 2399</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Jardim Cavallari, Marília-SP</p>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-white/5 rounded-3xl p-5 shadow-sm hover:border-blue-500/30 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white mb-1">Horários</h3>
          <p className="text-slate-700 dark:text-slate-300 font-medium text-sm">Dom: 9h00 e 18h30</p>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 space-y-0.5">
            <p>Terça: 15h00</p>
            <p>Quarta: 20h00</p>
            <p>Sexta: 19h45</p>
          </div>
        </div>

      </div>

      {/* Redes Sociais */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 px-2 uppercase tracking-wider text-sm">
          Siga-nos nas Redes Sociais
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          
          <a href="https://www.facebook.com/ad.cavallari/" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/60 dark:border-white/5 hover:border-blue-500 hover:shadow-lg dark:hover:bg-slate-800 transition-all active:scale-95 group">
            <svg className="w-8 h-8 text-slate-400 group-hover:text-[#1877F2] transition-colors" viewBox="0 0 24 24">
              <path fill="currentColor" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span className="font-bold text-sm text-slate-700 dark:text-slate-300">Facebook</span>
          </a>

          <a href="https://www.instagram.com/ad.cavallari/" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/60 dark:border-white/5 hover:border-pink-500 hover:shadow-lg dark:hover:bg-slate-800 transition-all active:scale-95 group">
            <svg className="w-8 h-8 text-slate-400 group-hover:text-[#E4405F] transition-colors" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            <span className="font-bold text-sm text-slate-700 dark:text-slate-300">Instagram</span>
          </a>

          <a href="https://www.youtube.com/@ADCavallari" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/60 dark:border-white/5 hover:border-red-500 hover:shadow-lg dark:hover:bg-slate-800 transition-all active:scale-95 group">
            <svg className="w-8 h-8 text-slate-400 group-hover:text-[#FF0000] transition-colors" viewBox="0 0 24 24">
              <path fill="currentColor" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <span className="font-bold text-sm text-slate-700 dark:text-slate-300">YouTube</span>
          </a>

          <a href="https://www.tiktok.com/@ad.cavallari" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/60 dark:border-white/5 hover:border-slate-900 dark:hover:border-white hover:shadow-lg dark:hover:bg-slate-800 transition-all active:scale-95 group">
            <svg className="w-8 h-8 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" viewBox="0 0 24 24">
              <path fill="currentColor" d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-3.77-1.105zm0 0V6.79a4.831 4.831 0 0 1-3.77-1.105z"/>
            </svg>
            <span className="font-bold text-sm text-slate-700 dark:text-slate-300">TikTok</span>
          </a>

        </div>
      </div>

    </div>
  );
}