import React, { useState } from 'react';
import { Home, MapPin, Sun, Moon, User, Settings, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Input, Button } from '../components/ui';
import { Link } from 'react-router-dom';

export default function Login() {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estados para capturar o que o usuário digita
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { theme, toggleTheme } = useTheme();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await signIn(email, password);
      // Se sucesso, o AuthContext atualiza e o redirecionamento ocorre via rotas
    } catch (err) {
      console.error(err);
      setError("E-mail ou palavra-passe incorretos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-slate-50 dark:bg-[#09090b]">
      {/* Painel Esquerdo - Branding */}
      <div className="hidden lg:flex relative w-1/2 items-center justify-center overflow-hidden bg-zinc-900 border-r border-slate-200 dark:border-white/5 shadow-2xl z-10">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1438283173091-5dbf5c5a3206?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/40 to-violet-900/40 mix-blend-multiply"></div>

        <div className="relative z-10 w-full max-w-lg p-12 text-white">
          <div className="flex items-center gap-3 mb-12">
            <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-3 rounded-2xl shadow-xl shadow-indigo-500/30 border border-indigo-400/20">
              <Home className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">AD Cavallari</h1>
          </div>
          <blockquote className="space-y-6 text-3xl font-medium leading-tight tracking-tight">
            "Um lugar de paz, adoração e comunhão. Conecte-se com a nossa família e acompanhe a igreja onde quer que você esteja."
          </blockquote>
          <div className="mt-12 flex items-center gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
            <div className="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <p className="font-semibold text-lg text-white">Jardim Cavallari</p>
              <p className="text-indigo-200 text-sm">Marília, SP</p>
            </div>
          </div>
        </div>
      </div>

      {/* Painel Direito - Formulário */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-24 relative">
        <div className="absolute top-6 right-6">
          <button onClick={toggleTheme} className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-indigo-600 shadow-sm border border-slate-200 dark:border-white/5 transition-colors">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <div className="mx-auto w-full max-w-sm lg:max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/30">
              <Home className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight dark:text-white text-slate-900">AD Cavallari</h1>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">Bem-vindo de volta</h2>
            <p className="text-slate-500 dark:text-zinc-400 text-base">Insira suas credenciais para acessar o hub.</p>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            
            {/* Aviso de Erro Visual */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-center animate-in fade-in">
                <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <Input 
              label="E-mail" 
              type="email" 
              placeholder="seu@email.com" 
              icon={User} 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <Input 
              label="Senha" 
              type="password" 
              placeholder="••••••••" 
              icon={Settings} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="flex items-center justify-between text-sm mt-2">
              <label className="flex items-center text-slate-600 dark:text-zinc-400 cursor-pointer group">
                <div className="relative flex items-center justify-center mr-2">
                  <input type="checkbox" className="peer appearance-none w-5 h-5 border-2 border-slate-300 dark:border-zinc-700 rounded transition-colors checked:border-indigo-600 checked:bg-indigo-600 cursor-pointer" />
                  <CheckCircle2 className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                </div>
                Lembrar-me
              </label>
              <a href="#" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-semibold transition-colors">Esqueceu a senha?</a>
            </div>

            <Button type="submit" className="w-full mt-6 h-14 text-lg" isLoading={loading}>
              Entrar no Hub
            </Button>
            
            <div className="mt-8 text-center text-sm text-slate-500 dark:text-zinc-400">
              Ainda não tem cadastro?{' '}
              <Link to="/register" className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors">
                Criar uma conta
              </Link>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}