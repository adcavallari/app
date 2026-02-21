import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Button = ({ children, variant = 'primary', className, isLoading, ...props }) => {
  const base = "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-95";
  const variants = {
    primary: "bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-500/25 border border-indigo-500/50",
    secondary: "bg-white/10 text-slate-900 hover:bg-slate-100 dark:bg-zinc-800/50 dark:text-zinc-100 dark:hover:bg-zinc-700/50 backdrop-blur-md border border-slate-200 dark:border-white/5",
    ghost: "text-slate-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-100",
    danger: "bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 border border-red-500/20"
  };
  return (
    <button className={cn(base, variants[variant], "h-12 px-6", className)} disabled={isLoading} {...props}>
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
};

export const Input = React.forwardRef(({ className, label, icon: Icon, error, ...props }, ref) => (
  <div className="flex flex-col space-y-1.5 w-full">
    {label && <label className="text-sm font-medium text-slate-700 dark:text-zinc-300 ml-1">{label}</label>}
    <div className="relative">
      {Icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500"><Icon className="w-5 h-5" /></div>}
      <input
        ref={ref}
        className={cn(
          "flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:border-white/10 dark:bg-zinc-900/50 dark:text-zinc-100 dark:placeholder:text-zinc-600",
          Icon && "pl-10", error && "border-red-500 focus:ring-red-500", className
        )}
        {...props}
      />
    </div>
    {error && <span className="text-sm text-red-500 ml-1">{error}</span>}
  </div>
));

export const Select = React.forwardRef(({ className, label, options = [], ...props }, ref) => (
  <div className="flex flex-col space-y-1.5 w-full">
    {label && <label className="text-sm font-medium text-slate-700 dark:text-zinc-300 ml-1">{label}</label>}
    <select
      ref={ref}
      className={cn(
        "flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:border-white/10 dark:bg-zinc-900/50 dark:text-zinc-100",
        className
      )}
      {...props}
    >
      {options.map((opt, i) => (
        <option key={i} value={opt.value} className="bg-white dark:bg-zinc-900">{opt.label}</option>
      ))}
    </select>
  </div>
));

export const Card = ({ children, className, hover = false }) => (
  <div className={cn(
    "rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-zinc-900/60",
    hover && "transition-all duration-300 hover:shadow-lg hover:-translate-y-1 dark:hover:border-white/10 hover:shadow-indigo-500/5",
    className
  )}>
    {children}
  </div>
);

export const Badge = ({ children, variant = 'default', className }) => {
  const variants = {
    default: "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300",
    primary: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
    danger: "bg-red-500 text-white border-none animate-pulse",
    secondary: "bg-white/20 text-indigo-50 hover:bg-white/30 backdrop-blur-md"
  };
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold", variants[variant], className)}>
      {children}
    </span>
  );
};