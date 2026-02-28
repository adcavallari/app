import React, { useState, useEffect } from 'react';
import { Home, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Input, Button } from '../components/ui';

export default function UpdatePassword() {
  // Use o hook real no seu projeto: const navigate = useNavigate();
  const navigate = useNavigate(); 
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Verifica se o utilizador chegou aqui através de um link de recuperação válido
  useEffect(() => {
    // O Supabase processa o token no hash da URL e dispara um evento
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        console.log('Modo de recuperação de palavra-passe ativado.');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('As palavras-passe não coincidem.');
      return;
    }

    if (password.length < 6) {
      setError('A palavra-passe deve ter pelo menos 6 caracteres.');
      return;
    }

    setLoading(true);
    
    try {
      // Atualiza a palavra-passe do utilizador autenticado pelo token de recuperação
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;

      setSuccess(true);
      
      // Redireciona para o login após 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      console.error(err);
      setError(err.message || "Ocorreu um erro ao tentar redefinir a palavra-passe.");
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
            Nova Palavra-passe
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Crie uma nova credencial segura para a sua conta.
          </p>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 p-8 rounded-3xl shadow-xl">
          
          {success ? (
            <div className="text-center space-y-4 animate-in fade-in duration-300">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Palavra-passe Atualizada!</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                A sua palavra-passe foi redefinida com sucesso. Vai ser redirecionado para o ecrã de Login em instantes.
              </p>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleUpdatePassword}>
              
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-center animate-in fade-in">
                  <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Nova Palavra-passe</label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  icon={Lock} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  minLength={6}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Confirmar Nova Palavra-passe</label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  icon={Lock} 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required 
                  minLength={6}
                />
              </div>

              <Button type="submit" className="w-full mt-4 h-14 text-lg" isLoading={loading}>
                Guardar e Entrar
              </Button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}