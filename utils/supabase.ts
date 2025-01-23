import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// // Function to create or update user in Supabase
// export const createOrUpdateUser = async (vippsUserInfo: any) => {
//   try {
//     // First, try to sign up the user
//     const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
//       email: vippsUserInfo.email,
//       password: crypto.randomUUID(), // Generate a random password
//       options: {
//         data: {
//           name: vippsUserInfo.name,
//           phone: vippsUserInfo.phoneNumber,
//           vipps_sub: vippsUserInfo.sub, // Store Vipps user ID
//         },
//       },
//     })

//     if (signUpError && signUpError.message.includes('already registered')) {
//       // If user exists, sign in instead
//       const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
//         email: vippsUserInfo.email,
//         password: '', // You'll need to implement a password recovery flow
//       })

//       if (signInError) throw signInError
//       return signInData
//     }

//     if (signUpError) throw signUpError
//     return signUpData
//   } catch (error) {
//     console.error('Error in createOrUpdateUser:', error)
//     throw error
//   }
// }
