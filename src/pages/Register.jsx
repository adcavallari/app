import React, { useState, useEffect } from 'react';
import { 
  MapPin, Sun, Moon, User, Settings, CheckCircle2, 
  AlertCircle, Mail, ArrowLeft, Loader2, Church
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Input, Button } from '../components/ui';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Logo from '../assets/logo.png';
import LogoBlack from '../assets/logo-black.png';

export default function Auth() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  
  // Controles de View e Carregamento
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Sistema de Toasts
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Dados do Formulário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Carrega a preferência de "Lembrar-me" ao abrir a página
  useEffect(() => {
    const savedRememberMe = localStorage.getItem('@Worship:rememberMe') === 'true';
    const savedEmail = localStorage.getItem('@Worship:savedEmail');
    
    if (savedRememberMe) {
      setRememberMe(true);
      if (savedEmail) setEmail(savedEmail);
    }
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message, type }), 4000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await signIn(email, password);
      
      // Lógica do "Lembrar-me"
      if (rememberMe) {
        localStorage.setItem('@Worship:rememberMe', 'true');
        localStorage.setItem('@Worship:savedEmail', email);
      } else {
        localStorage.removeItem('@Worship:rememberMe');
        localStorage.removeItem('@Worship:savedEmail');
        // Nota: Para forçar o Supabase a esquecer a sessão ao fechar a aba se "rememberMe" for falso, 
        // seria necessário configurar o supabase client com sessionStorage. 
        // A lógica acima garante a experiência visual e limpeza de e-mail.
      }

      showToast("Sessão iniciada com sucesso!", "success");
      navigate('/dashboard');
      
    } catch (err) {
      console.error(err);
      showToast("E-mail ou palavra-passe incorretos.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (password.length < 6) {
        throw new Error("A senha deve ter no mínimo 6 caracteres.");
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      });

      if (signUpError) throw signUpError;

      showToast("Conta criada! Verifique o seu e-mail para confirmar.", "success");
      
      // Limpa os campos e volta para o Login
      setPassword('');
      setIsRegistering(false);

    } catch (err) {
      console.error(err);
      showToast(err.message || "Erro ao criar conta.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-slate-50 dark:bg-slate relative">
      
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

      {/* Painel Esquerdo - Branding (Visível apenas em Desktop) */}
      <div className="hidden lg:flex relative w-1/2 items-center justify-center overflow-hidden bg-zinc-900 border-r border-slate-200 dark:border-white/5 shadow-2xl z-10">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1438283173091-5dbf5c5a3206?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/40 to-violet-900/40 mix-blend-multiply"></div>

        <div className="relative z-10 w-full max-w-lg p-12 text-white">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
              <img src={Logo} alt="AD Cavallari" className="w-20 h-20 object-contain" /> 
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">AD CAVALLARI</h1>
          </div>
          <blockquote className="space-y-6 text-3xl font-medium leading-tight tracking-tight">
            "Um lugar de paz, adoração e comunhão. Conecte-se com a nossa família onde quer que você esteja."
          </blockquote>
          <div className="mt-12 flex items-center gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
            <div className="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <p className="font-semibold text-lg text-white leading-tight">Av. Maria Fernandes Cavallari, 2399</p>
              <p className="text-indigo-200 text-sm mt-0.5">Jardim Cavallari - Marília, SP</p>
            </div>
          </div>
        </div>
      </div>

      {/* Painel Direito - Formulários (Login ou Registo) */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-24 relative overflow-y-auto">
        
        {/* Botão de Tema Movel/Absoluto */}
        <div className="absolute top-6 right-6">
          <button onClick={toggleTheme} className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-indigo-600 shadow-sm border border-slate-200 dark:border-white/5 transition-colors">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          
          {/* Logo Mobile */}
          <div className="lg:hidden flex flex-col items-center gap-3 mb-10 justify-center animate-in fade-in duration-700">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-2">
              <img src={theme === 'dark' ? Logo : LogoBlack} alt="AD Cavallari" className="w-20 h-20 object-contain"/>
            </div>
            <h1 className="text-2xl font-bold tracking-tight dark:text-white text-slate-900">AD CAVALLARI</h1>
          </div>

          {/* =================================================================
              VISÃO DE LOGIN
              ================================================================= */}
          {!isRegistering ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-10 text-center lg:text-left">
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">Bem-vindo de volta</h2>
                <p className="text-slate-500 dark:text-zinc-400 text-base">Insira suas credenciais para acessar a plataforma.</p>
              </div>

              <form className="space-y-5" onSubmit={handleLogin}>
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
                  label="Palavra-passe" 
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
                      <input 
                        type="checkbox" 
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="peer appearance-none w-5 h-5 border-2 border-slate-300 dark:border-zinc-700 rounded transition-colors checked:border-indigo-600 checked:bg-indigo-600 cursor-pointer" 
                      />
                      <CheckCircle2 className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                    </div>
                    Lembrar-me
                  </label>
                  <Link to="/forgot-password" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-semibold transition-colors">Esqueceu a senha?</Link>
                </div>

                <Button type="submit" className="w-full mt-6 h-14 text-lg" isLoading={loading}>
                  Entrar na Plataforma
                </Button>
                
                <div className="mt-8 text-center text-sm text-slate-500 dark:text-zinc-400">
                  Ainda não tem cadastro?{' '}
                  <button type="button" onClick={() => { setIsRegistering(true); setPassword(''); }} className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors">
                    Criar uma conta
                  </button>
                </div>
              </form>
            </div>
          ) : (
            
          /* =================================================================
             VISÃO DE REGISTO
             ================================================================= */
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="mb-8 text-center lg:text-left">
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3">Criar Conta</h2>
                <p className="text-slate-500 dark:text-zinc-400 text-base">Junte-se à família AD CAVALLARI.</p>
              </div>

              <form className="space-y-5" onSubmit={handleRegister}>
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

                <div className="space-y-1">
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
                </div>

                <Button type="submit" className="w-full mt-6 h-14 text-lg" isLoading={loading}>
                  Registar Conta
                </Button>

                <div className="mt-8 text-center flex items-center justify-center">
                  <button type="button" onClick={() => { setIsRegistering(false); setPassword(''); }} className="flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar para o Login
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}