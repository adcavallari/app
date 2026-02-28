import React from 'react';
import { cn } from '../../lib/utils'; // Certifique-se que o caminho está correto para o seu utils.js

// ==========================================
// CARD COMPONENT
// ==========================================
export const Card = ({ children, className, hover, onClick }) => (
  <div 
    onClick={onClick} 
    className={cn(
      "rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm backdrop-blur-xl",
      "dark:border-slate-800/80 dark:bg-slate-900/80", // <-- Atualizado para Navy Blue
      hover && "transition-all duration-300 hover:shadow-lg hover:-translate-y-1 dark:hover:border-blue-500/30 hover:shadow-blue-500/5",
      className
    )}
  >
    {children}
  </div>
);

// ==========================================
// BADGE COMPONENT
// ==========================================
export const Badge = ({ children, variant = 'default', className }) => {
  const variants = {
    default: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    primary: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
    danger: "bg-red-500 text-white border-none shadow-sm",
    secondary: "bg-white/20 text-slate-700 dark:text-slate-200 hover:bg-white/30 backdrop-blur-md dark:bg-slate-800"
  };
  
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold", variants[variant], className)}>
      {children}
    </span>
  );
};

// ==========================================
// BUTTON COMPONENT
// ==========================================
export const Button = ({ children, variant = 'primary', className, onClick, disabled }) => {
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/20 dark:shadow-none",
    secondary: "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700",
    ghost: "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800",
    danger: "bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:bg-red-500/20 dark:text-red-400"
  };
  
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:pointer-events-none active:scale-95 h-12 px-6 transition-all", 
        variants[variant], 
        className
      )}
    >
      {children}
    </button>
  );
};

// ==========================================
// INPUT COMPONENT
// ==========================================
export const Input = ({ className, icon: Icon, ...props }) => (
  <div className="relative w-full">
    {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />}
    <input 
      className={cn(
        "flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-blue-500/50",
        "dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-100 dark:placeholder:text-slate-500", // <-- Atualizado
        Icon && "pl-10", 
        className
      )} 
      {...props} 
    />
  </div>
);