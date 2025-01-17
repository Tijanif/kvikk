// import { useState, useEffect } from 'react'
// import { router } from 'expo-router'
// import * as WebBrowser from 'expo-web-browser'
// import * as Linking from 'expo-linking'
// import * as vippsAuth from '../../utils/vipps-auth'
// import { supabase } from '../../utils/supabase'

//  function useVippsAuth() {
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   useEffect(() => {
//     WebBrowser.warmUpAsync()
//     return () => {
//       WebBrowser.coolDownAsync()
//     }
//   }, [])

//   useEffect(() => {
//     const handleDeepLink = async (event: Linking.EventType) => {
//       if (event.url.includes('kvikk://')) {
//         try {
//           setLoading(true)
//           const { tokens, userInfo } = await vippsAuth.handleRedirect(event.url)
//           await handleVippsLogin(userInfo, tokens)
//         } catch (err) {
//           setError(err instanceof Error ? err.message : 'An error occurred')
//         } finally {
//           setLoading(false)
//         }
//       }
//     }

//     const subscription = Linking.addEventListener('url', handleDeepLink)

//     return () => {
//       subscription.remove()
//     }
//   }, [])

//   const handleVippsLogin = async (userInfo: any, tokens: any) => {
//     try {
//       const { data: existingUser, error: fetchError } = await supabase
//         .from('profiles')
//         .select()
//         .eq('vipps_sub', userInfo.sub)
//         .single()

//       if (fetchError && fetchError.code !== 'PGRST116') {
//         throw fetchError
//       }

//       if (!existingUser) {
//         const { data, error: signUpError } = await supabase.auth.signUp({
//           email: userInfo.email,
//           password: tokens.access_token,
//           options: {
//             data: {
//               name: userInfo.name,
//               phone: userInfo.phoneNumber,
//               vipps_sub: userInfo.sub,
//             },
//           },
//         })

//         if (signUpError) throw signUpError
//       } else {
//         const { error: signInError } = await supabase.auth.signInWithPassword({
//           email: userInfo.email,
//           password: tokens.access_token,
//         })

//         if (signInError) throw signInError
//       }

//       router.replace('/(tabs)')
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'An error occurred')
//     }
//   }

//   const signInWithVipps = async () => {
//     try {
//       setLoading(true)
//       setError(null)
//       await vippsAuth.initiateLogin()
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'An error occurred')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return {
//     signInWithVipps,
//     loading,
//     error,
//   }
// }

// export default useVippsAuth;

// import { useState, useEffect } from 'react'
// import { router } from 'expo-router'
// import * as Linking from 'expo-linking'
// import { initiateVippsLogin, handleRedirect } from '../lib/vipps-auth'
// import { supabase } from '../../utils/supabase'

// export default function useVippsAuth() {
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   useEffect(() => {
//     const subscription = Linking.addEventListener('url', ({ url }) => {
//       handleDeepLink(url)
//     })

//     return () => {
//       subscription.remove()
//     }
//   }, [])

//   const handleDeepLink = async (url: string) => {
//     try {
//       setLoading(true)
      
//       const { tokens, userInfo } = await handleRedirect(url)
//       await handleVippsLogin(userInfo, tokens)
//     } catch (err) {
//       console.error('Deep link handling error:', err)
//       setError(err instanceof Error ? err.message : 'An error occurred')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleVippsLogin = async (userInfo: any, tokens: any) => {
//     try {
//       const { data: existingUser, error: fetchError } = await supabase
//         .from('users')
//         .select()
//         .eq('vipps_sub', userInfo.sub)
//         .single()

//       if (fetchError && fetchError.code !== 'PGRST116') {
//         throw fetchError
//       }

//       if (!existingUser) {
//         const { data: authData, error: signUpError } = await supabase.auth.signUp({
//           email: userInfo.email,
//           password: tokens.access_token,
//           options: {
//             data: {
//               vipps_sub: userInfo.sub
//             }
//           }
//         })

//         if (signUpError) throw signUpError

//         const { error: insertError } = await supabase
//           .from('users')
//           .insert({
//             id: authData.user?.id,
//             email: userInfo.email,
//             full_name: userInfo.name,
//             phone_number: userInfo.phone_number,
//             address: `${userInfo.address.street_address}, ${userInfo.address.postal_code} ${userInfo.address.region}`,
//             vipps_sub: userInfo.sub
//           })

//         if (insertError) throw insertError
//       } else {
//         const { error: signInError } = await supabase.auth.signInWithPassword({
//           email: userInfo.email,
//           password: tokens.access_token,
//         })

//         if (signInError) throw signInError

//         const { error: updateError } = await supabase
//           .from('users')
//           .update({
//             full_name: userInfo.name,
//             phone_number: userInfo.phone_number,
//             address: `${userInfo.address.street_address}, ${userInfo.address.postal_code} ${userInfo.address.region}`,
//             updated_at: new Date().toISOString()
//           })
//           .eq('vipps_sub', userInfo.sub)

//         if (updateError) throw updateError
//       }

//       router.replace('/(tabs)')
//     } catch (err) {
//       console.error('Vipps login error:', err)
//       throw err
//     }
//   }

//   const signInWithVipps = async () => {
//     try {
//       setLoading(true)
//       setError(null)
//       await initiateVippsLogin()
//     } catch (err) {
//       console.error('Sign in error:', err)
//       setError(err instanceof Error ? err.message : 'An error occurred')
//     } finally {
//       setLoading(false)
//     }
//   }

//   return {
//     signInWithVipps,
//     loading,
//     error,
//   }
// }

import { useState, useEffect } from 'react'
import { router } from 'expo-router'
import * as Linking from 'expo-linking'
import * as vippsAuth from '../lib/vipps-auth'
import { supabase } from '../../utils/supabase'

export default function useVippsAuth() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
  
    const handleVippsLogin = async (userInfo: any, tokens: any) => {
      try {
        const { data: existingUser } = await supabase
          .from('users')
          .select()
          .eq('vipps_sub', userInfo.sub)
          .single()
  
        if (!existingUser) {
          const { data, error: signUpError } = await supabase.auth.signUp({
            email: userInfo.email,
            password: tokens.access_token,
            options: {
              data: {
                vipps_sub: userInfo.sub,
              },
            },
          })
  
          if (signUpError) throw signUpError
  
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: data.user?.id,
              email: userInfo.email,
              full_name: userInfo.name,
              phone_number: userInfo.phone_number,
              address: `${userInfo.address.street_address}, ${userInfo.address.postal_code} ${userInfo.address.region}`,
              vipps_sub: userInfo.sub,
            })
  
          if (insertError) throw insertError
        } else {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: userInfo.email,
            password: tokens.access_token,
          })
  
          if (signInError) throw signInError
        }
  
        router.replace('/(tabs)')
      } catch (err) {
        console.error('Vipps login error:', err)
        throw err
      }
    }
  
    const signInWithVipps = async () => {
      try {
        setLoading(true)
        setError(null)
        const { tokens, userInfo } = await vippsAuth.initiateVippsLogin()
        await handleVippsLogin(userInfo, tokens)
      } catch (err) {
        console.error('Sign in error:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }
  
    return {
      signInWithVipps,
      loading,
      error,
    }
  }