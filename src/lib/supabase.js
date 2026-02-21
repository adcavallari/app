import { createClient } from '@supabase/supabase-js'

// Configuração do cliente Supabase utilizando variáveis de ambiente do Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validação básica para garantir que as chaves existam
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('As variáveis de ambiente do Supabase não foram encontradas.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)