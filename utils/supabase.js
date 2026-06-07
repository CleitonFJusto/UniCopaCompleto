import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'
<<<<<<< HEAD
console.log('URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log('KEY:', process.env.EXPO_PUBLIC_SUPABASE_KEY);
=======
>>>>>>> 915d4b4b2630d363ffadd2ae92bade891c9efacb

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_KEY,
  {
<<<<<<< HEAD
    
=======
>>>>>>> 915d4b4b2630d363ffadd2ae92bade891c9efacb
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  })