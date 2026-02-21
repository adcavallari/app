import React, { useState } from 'react';
import { Home, User, Settings, Mail, AlertCircle, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Input, Button } from '../components/ui';

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Cria o usuário e guarda o Nome Completo nos metadados
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (signUpError) throw signUpError;

      // Se der certo, avisa o usuário (no Supabase o e-mail de confirmação é enviado por padrão)
      alert("Conta criada com sucesso! Verifique a sua caixa de entrada para confirmar o e-mail.");
      navigate('/login');

    } catch (err) {
      console.error(err);
      setError(err.message || "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-slate-50 dark:bg-[#09090b] items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/30">
            <Home className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
            Criar Conta
          </h1>
          <p className="text-slate-500 dark:text-zinc-400">
            Junte-se à família AD Cavallari
          </p>
        </div>

        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 p-8 rounded-3xl shadow-xl">
          <form className="space-y-5" onSubmit={handleRegister}>
            
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-center">
                <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <Input 
              label="Nome Completo" 
              type="text" 
              placeholder="João da Silva" 
              icon={User} 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required 
            />

            <Input 
              label="E-mail" 
              type="email" 
              placeholder="seu@email.com" 
              icon={Mail} 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />

            <Input 
              label="Palavra-passe" 
              type="password" 
              placeholder="••••••••" 
              icon={Settings} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              minLength={6}
            />
            <p className="text-xs text-slate-500 dark:text-zinc-500 ml-1">Mínimo de 6 caracteres.</p>

            <Button type="submit" className="w-full mt-2 h-14 text-lg" isLoading={loading}>
              Registar
            </Button>
          </form>
        </div>

        <div className="mt-8 text-center text-sm text-slate-500 dark:text-zinc-400 flex items-center justify-center">
          <Link to="/login" className="flex items-center hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para o Login
          </Link>
        </div>
      </div>
    </div>
  );
}