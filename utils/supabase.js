import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

console.log('URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log('KEY:', process.env.EXPO_PUBLIC_SUPABASE_KEY);

//RF-010 / RF-012 / RF-013 cria e exporta o cliente Supabase usado em todo o projeto
//para acesso ao banco de dados e autenticação de usuários
export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_KEY,
  {
    auth: {
      storage: AsyncStorage,   // persiste a sessão no dispositivo via AsyncStorage
      autoRefreshToken: true,  // renova o token automaticamente antes de expirar
      persistSession: true,    // mantém o usuário logado ao reabrir o app
      detectSessionInUrl: false,
    },
  }
)
