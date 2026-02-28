import { createClient } from '@supabase/supabase-js';

// 1. Criamos um gerenciador de memória inteligente!
const customStorage = {
  getItem: (key) => {
    // Verifica se o utilizador marcou a caixa "Lembrar-me" lá no Auth.jsx
    const rememberMe = localStorage.getItem('@Worship:rememberMe') === 'true';
    
    // Se marcou, carrega o token da memória de longo prazo (localStorage). 
    // Se não marcou, carrega da memória temporária (sessionStorage).
    return rememberMe ? localStorage.getItem(key) : sessionStorage.getItem(key);
  },
  
  setItem: (key, value) => {
    const rememberMe = localStorage.getItem('@Worship:rememberMe') === 'true';
    
    if (rememberMe) {
      localStorage.setItem(key, value);
    } else {
      // Se ele NÃO quiser ser lembrado, removemos qualquer rastro do localStorage
      localStorage.removeItem(key);
    }
    
    // Guardamos sempre no sessionStorage para que ele não deslogue ao apertar F5 (refresh da aba)
    sessionStorage.setItem(key, value);
  },
  
  removeItem: (key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }
};

// 2. Coloque as suas variáveis de ambiente aqui (como já devia estar)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 3. Injetamos a nossa regra dentro do Supabase!
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage, // <-- É AQUI QUE A MÁGICA ACONTECE!
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
