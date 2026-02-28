import React, { useState } from 'react';
import { Home, Mail, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Input, Button } from '../components/ui';

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (resetError) throw resetError;

      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err.message || "Ocorreu um erro ao tentar enviar o e-mail de recuperação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-slate-50 dark:bg-slate-950 items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/30">
            <Home className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
            Recuperar Senha
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Insira o seu e-mail para receber um link de redefinição.
          </p>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 p-8 rounded-3xl shadow-xl">
          
          {success ? (
            <div className="text-center space-y-4 animate-in fade-in duration-300">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">E-mail Enviado!</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Enviámos as instruções de recuperação para <strong className="text-slate-700 dark:text-slate-300">{email}</strong>. Por favor, verifique a sua caixa de entrada e a pasta de spam.
              </p>
              <div className="pt-4">
                <Link to="/login" className="inline-flex items-center justify-center w-full h-12 rounded-xl font-semibold bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 transition-colors">
                  Voltar para o Login
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleResetPassword}>
              
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-center animate-in fade-in">
                  <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">E-mail da sua conta</label>
                <Input 
                  type="email" 
                  placeholder="seu@email.com" 
                  icon={Mail} 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>

              <Button type="submit" className="w-full mt-2 h-14 text-lg" isLoading={loading}>
                Enviar Link de Recuperação
              </Button>
            </form>
          )}

        </div>

        {/* Link Voltar se não estiver no estado de sucesso */}
        {!success && (
          <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center">
            <Link to="/login" className="flex items-center hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Lembrei-me da senha, voltar ao Login
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}