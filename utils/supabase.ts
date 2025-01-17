import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});


// import { createClient } from '@supabase/supabase-js'
// import * as SecureStore from 'expo-secure-store'
// import { Platform } from 'react-native'

// // SecureStore is not available on web, so we'll use localStorage
// const ExpoSecureStoreAdapter = {
//   getItem: (key: string) => {
//     return SecureStore.getItemAsync(key)
//   },
//   setItem: (key: string, value: string) => {
//     return SecureStore.setItemAsync(key, value)
//   },
//   removeItem: (key: string) => {
//     return SecureStore.deleteItemAsync(key)
//   },
// }

// const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
// const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

// export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
//   auth: {
//     storage: Platform.OS === 'web' 
//       ? localStorage 
//       : ExpoSecureStoreAdapter,
//     autoRefreshToken: true,
//     persistSession: true,
//     detectSessionInUrl: false,
//   },
// })
