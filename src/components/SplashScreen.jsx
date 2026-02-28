import React, { useState, useEffect } from 'react';
import { Loader2, Church } from 'lucide-react'; // Pode trocar "Church" por outro ícone ou sua imagem
import Logo from '../assets/logo.png';
import LogoBlack from '../assets/logo-black.png'; // Importe a logo da sua plataforma (coloque a imagem na pasta assets)

/**
 * ============================================================================
 * COMPONENTE SPLASH SCREEN (TELA DE ABERTURA)
 * Copie este componente para o seu projeto (ex: components/SplashScreen.jsx)
 * ============================================================================
 */
export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* Container Principal */}
      <div className="flex flex-col items-center justify-center animate-in zoom-in-95 fade-in duration-700">
        
        {/* =====================================================
            ÁREA DA LOGO
            ===================================================== */}
        <div className="relative flex items-center justify-center mb-8">
          {/* Efeito de anel pulsante no fundo */}
          <div className="absolute inset-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute inset-0 w-24 h-24 bg-indigo-500/30 rounded-full animate-ping opacity-75 duration-1000"></div>
          {/* Logo light */}
          <img src={LogoBlack} alt="AD Cavallari" className="w-20 h-20 object-contain dark:hidden"/>
          {/* Logo dark */}
          <img src={Logo} alt="AD Cavallari" className="w-20 h-20 object-contain hidden dark:block"/>
        </div>

        {/* =====================================================
            TEXTO E INDICADOR DE CARREGAMENTO
            ===================================================== */}
        <div className="flex flex-col items-center space-y-4">
          
          <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
            Plataforma de Membros
          </h1>

          <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-900/50 px-4 py-2 rounded-full backdrop-blur-sm border border-slate-200/50 dark:border-white/5 shadow-sm">
            <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
            <span className="text-sm font-medium tracking-wide">
              Carregando plataforma...
            </span>
          </div>

        </div>

      </div>
      
      {/* Rodapé opcional (versão do app) */}
      <div className="absolute bottom-8 text-xs font-medium text-slate-400 dark:text-slate-500">
        Versão 1.0.0
      </div>

    </div>
  );
}