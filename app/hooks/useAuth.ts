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

// import { useState, useEffect, useCallback } from "react"
// import { router } from "expo-router"
// import * as AuthSession from "expo-auth-session"
// import * as WebBrowser from "expo-web-browser"
// import { supabase } from "../utils/supabase"
// import { log } from "../utils/logger"

// WebBrowser.maybeCompleteAuthSession()

// const VIPPS_SUBSCRIPTION_KEY = process.env.EXPO_PUBLIC_VIPPS_PRIMARY_SUBSCRIPTION_KEY
// const VIPPS_BASE_URL = "https://apitest.vipps.no"
// const VIPPS_AUTH_BASE_URL = `${VIPPS_BASE_URL}/access-management-1.0/access`
// const VIPPS_USERINFO_URL = `${VIPPS_BASE_URL}/vipps-userinfo-api/userinfo`

// const createBasicAuthHeader = (username: string, password: string) => {
//   const auth = `${username}:${password}`
//   return `Basic ${btoa(encodeURIComponent(auth).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(Number.parseInt(p1, 16))))}`
// }

// const vippsAuthConfig = {
//   clientId: process.env.EXPO_PUBLIC_VIPPS_CLIENT_ID as string,
//   scopes: ["openid", "name", "email", "phoneNumber", "address", "birthDate"],
//   redirectUri: AuthSession.makeRedirectUri({
//     scheme: "kvikk",
//     path: "auth",
//   }),
//   responseType: "code",
//   usePKCE: false,
// }

// const vippsAuthDiscovery = {
//   authorizationEndpoint: `${VIPPS_AUTH_BASE_URL}/oauth2/auth`,
//   tokenEndpoint: `${VIPPS_AUTH_BASE_URL}/oauth2/token`,
// }

// export function useAuth() {
//   const [user, setUser] = useState(null)
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   useEffect(() => {
//     const {
//       data: { subscription },
//     } = supabase.auth.onAuthStateChange((_event, session) => {
//       setUser(session?.user ?? null)
//     })

//     return () => subscription.unsubscribe()
//   }, [])

//   const checkUserPolicies = async (userId: string) => {
//     try {
//       const { data: policies, error } = await supabase.from("policies").select("*").eq("user_id", userId)

//       if (error) throw error

//       return policies && policies.length > 0
//     } catch (error) {
//       log("Error checking user policies:", error)
//       return false
//     }
//   }

//   const signInWithVipps = useCallback(async () => {
//     try {
//       setLoading(true)
//       setError(null)

//       const request = await AuthSession.loadAsync(vippsAuthConfig, vippsAuthDiscovery)
//       const result = await request.promptAsync()

//       log("Auth result:", result)

//       if (result.type === "success" && result.params.code) {
//         const tokenEndpoint = `${VIPPS_AUTH_BASE_URL}/oauth2/token`

//         const basicAuth = createBasicAuthHeader(
//           process.env.EXPO_PUBLIC_VIPPS_CLIENT_ID as string,
//           process.env.EXPO_PUBLIC_VIPPS_CLIENT_SECRET as string,
//         )

//         const body = new URLSearchParams({
//           grant_type: "authorization_code",
//           code: result.params.code,
//           redirect_uri: vippsAuthConfig.redirectUri,
//         })

//         const headers = {
//           "Content-Type": "application/x-www-form-urlencoded",
//           Authorization: basicAuth,
//           "Ocp-Apim-Subscription-Key": VIPPS_SUBSCRIPTION_KEY,
//           "Vipps-System-Name": "kvikk_app",
//           "Vipps-System-Version": "1.0.0",
//         }

//         const tokenResponse = await fetch(tokenEndpoint, {
//           method: "POST",
//           headers: headers,
//           body: body.toString(),
//         })

//         if (!tokenResponse.ok) {
//           const errorData = await tokenResponse.json()
//           throw new Error(`Token exchange failed: ${errorData.error_description || errorData.error}`)
//         }

//         const tokens = await tokenResponse.json()

//         const userInfoHeaders = {
//           Authorization: `Bearer ${tokens.access_token}`,
//           "Ocp-Apim-Subscription-Key": VIPPS_SUBSCRIPTION_KEY,
//           "Content-Type": "application/json",
//           "Vipps-System-Name": "kvikk_app",
//           "Vipps-System-Version": "1.0.0",
//         }

//         const userInfoResponse = await fetch(VIPPS_USERINFO_URL, {
//           method: "GET",
//           headers: userInfoHeaders,
//         })

//         if (!userInfoResponse.ok) {
//           const errorText = await userInfoResponse.text()
//           throw new Error(`Failed to fetch user info: ${errorText}`)
//         }

//         const userInfo = await userInfoResponse.json()
//         log("User info:", userInfo)

//         const vippsSub = userInfo.sub
//         let session

//         // Sign in or sign up the user with Supabase using Vipps sub as password
//         const { data, error: authError } = await supabase.auth.signInWithPassword({
//           email: userInfo.email,
//           password: vippsSub,
//         })

//         if (authError) {
//           if (authError.message.includes("Invalid login credentials")) {
//             // User doesn't exist, sign them up
//             const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
//               email: userInfo.email,
//               password: vippsSub,
//             })

//             if (signUpError) throw signUpError
//             session = signUpData.session
//             log("New user signed up:", signUpData)
//           } else {
//             throw authError
//           }
//         } else {
//           session = data.session
//           log("User authenticated:", data)
//         }

//         const { data: existingUser, error: userCheckError } = await supabase
//           .from("users")
//           .select("id")
//           .eq("vipps_sub", userInfo.sub)
//           .single()

//         if (userCheckError && userCheckError.code !== "PGRST116") {
//           throw userCheckError
//         }

//         if (!existingUser) {
//           // If user doesn't exist, create a new user profile
//           const { error: insertError } = await supabase.from("users").insert({
//             id: session.user?.id,
//             email: userInfo.email,
//             full_name: userInfo.name,
//             phone_number: userInfo.phone_number,
//             address: userInfo.address?.formatted || "",
//             vipps_sub: userInfo.sub,
//           })

//           if (insertError) throw insertError
//         }

//         // Check policies and redirect
//         const hasPolicies = await checkUserPolicies(session.user?.id as string)
//         if (hasPolicies) {
//           router.replace("/(tabs)/policies")
//         } else {
//           router.replace("/(tabs)")
//         }
//       }
//     } catch (err) {
//       console.error("Sign in error:", err)
//       setError(err instanceof Error ? err.message : "An error occurred")
//     } finally {
//       setLoading(false)
//     }
//   }, [])

//   return {
//     user,
//     loading,
//     error,
//     signInWithVipps,
//   }
// }

import { useState, useEffect, useCallback } from "react"
import { router } from "expo-router"
import * as AuthSession from "expo-auth-session"
import * as WebBrowser from "expo-web-browser"
import * as SecureStore from "expo-secure-store"
import * as LocalAuthentication from "expo-local-authentication"
import { supabase } from "../utils/supabase"
import { log } from "../utils/logger"

WebBrowser.maybeCompleteAuthSession()

const VIPPS_SUBSCRIPTION_KEY = process.env.EXPO_PUBLIC_VIPPS_PRIMARY_SUBSCRIPTION_KEY
const VIPPS_BASE_URL = "https://apitest.vipps.no"
const VIPPS_AUTH_BASE_URL = `${VIPPS_BASE_URL}/access-management-1.0/access`
const VIPPS_USERINFO_URL = `${VIPPS_BASE_URL}/vipps-userinfo-api/userinfo`

const createBasicAuthHeader = (username: string, password: string) => {
  const auth = `${username}:${password}`
  return `Basic ${btoa(encodeURIComponent(auth).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(Number.parseInt(p1, 16))))}`
}

const vippsAuthConfig = {
  clientId: process.env.EXPO_PUBLIC_VIPPS_CLIENT_ID as string,
  scopes: ["openid", "name", "email", "phoneNumber", "address", "birthDate"],
  redirectUri: AuthSession.makeRedirectUri({
    scheme: "kvikk",
    path: "auth",
  }),
  responseType: "code",
  usePKCE: false,
}

const vippsAuthDiscovery = {
  authorizationEndpoint: `${VIPPS_AUTH_BASE_URL}/oauth2/auth`,
  tokenEndpoint: `${VIPPS_AUTH_BASE_URL}/oauth2/token`,
}

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkExistingSession()
  }, [])

  const checkExistingSession = async () => {
    try {
      const session = await SecureStore.getItemAsync("userSession")
      if (session) {
        const parsedSession = JSON.parse(session)
        const {
          data: { user },
        } = await supabase.auth.getUser(parsedSession.access_token)
        if (user) {
          setUser(user)
          router.replace("/(tabs)")
        } else {
          // Invalid session, clear it
          await SecureStore.deleteItemAsync("userSession")
        }
      }
    } catch (error) {
      console.error("Error checking existing session:", error)
    } finally {
      setLoading(false)
    }
  }

  const signInWithBiometrics = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync()
      if (!compatible) {
        throw new Error("Biometric authentication is not available on this device")
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to access your account",
        fallbackLabel: "Use passcode",
      })

      if (result.success) {
        const session = await SecureStore.getItemAsync("userSession")
        if (session) {
          const parsedSession = JSON.parse(session)
          const { data, error } = await supabase.auth.setSession(parsedSession)
          if (error) throw error
          setUser(data.user)
          router.replace("/(tabs)")
        } else {
          throw new Error("No existing session found")
        }
      } else {
        throw new Error("Biometric authentication failed")
      }
    } catch (error) {
      console.error("Biometric sign-in error:", error)
      setError(error.message)
    }
  }

  const signInWithVipps = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const request = await AuthSession.loadAsync(vippsAuthConfig, vippsAuthDiscovery)
      const result = await request.promptAsync()

      log("Auth result:", result)

      if (result.type === "success" && result.params.code) {
        const tokenEndpoint = `${VIPPS_AUTH_BASE_URL}/oauth2/token`

        const basicAuth = createBasicAuthHeader(
          process.env.EXPO_PUBLIC_VIPPS_CLIENT_ID as string,
          process.env.EXPO_PUBLIC_VIPPS_CLIENT_SECRET as string,
        )

        const body = new URLSearchParams({
          grant_type: "authorization_code",
          code: result.params.code,
          redirect_uri: vippsAuthConfig.redirectUri,
        })

        const headers = {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: basicAuth,
          "Ocp-Apim-Subscription-Key": VIPPS_SUBSCRIPTION_KEY,
          "Vipps-System-Name": "kvikk_app",
          "Vipps-System-Version": "1.0.0",
        }

        const tokenResponse = await fetch(tokenEndpoint, {
          method: "POST",
          headers: headers,
          body: body.toString(),
        })

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json()
          throw new Error(`Token exchange failed: ${errorData.error_description || errorData.error}`)
        }

        const tokens = await tokenResponse.json()

        const userInfoHeaders = {
          Authorization: `Bearer ${tokens.access_token}`,
          "Ocp-Apim-Subscription-Key": VIPPS_SUBSCRIPTION_KEY,
          "Content-Type": "application/json",
          "Vipps-System-Name": "kvikk_app",
          "Vipps-System-Version": "1.0.0",
        }

        const userInfoResponse = await fetch(VIPPS_USERINFO_URL, {
          method: "GET",
          headers: userInfoHeaders,
        })

        if (!userInfoResponse.ok) {
          const errorText = await userInfoResponse.text()
          throw new Error(`Failed to fetch user info: ${errorText}`)
        }

        const userInfo = await userInfoResponse.json()
        log("User info:", userInfo)

        const vippsSub = userInfo.sub
        let session

        // Sign in or sign up the user with Supabase using Vipps sub as password
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: userInfo.email,
          password: vippsSub,
        })

        if (authError) {
          if (authError.message.includes("Invalid login credentials")) {
            // User doesn't exist, sign them up
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email: userInfo.email,
              password: vippsSub,
            })

            if (signUpError) throw signUpError
            session = signUpData.session
            log("New user signed up:", signUpData)
          } else {
            throw authError
          }
        } else {
          session = data.session
          log("User authenticated:", data)
        }

        const { data: existingUser, error: userCheckError } = await supabase
          .from("users")
          .select("id")
          .eq("vipps_sub", userInfo.sub)
          .single()

        if (userCheckError && userCheckError.code !== "PGRST116") {
          throw userCheckError
        }

        if (!existingUser) {
          // If user doesn't exist, create a new user profile
          const { error: insertError } = await supabase.from("users").insert({
            id: session.user?.id,
            email: userInfo.email,
            full_name: userInfo.name,
            phone_number: userInfo.phone_number,
            address: userInfo.address?.formatted || "",
            vipps_sub: userInfo.sub,
          })

          if (insertError) throw insertError
        }

        // Store the session securely
        await SecureStore.setItemAsync("userSession", JSON.stringify(session))

        setUser(session.user)
        router.replace("/(tabs)")
      }
    } catch (err) {
      console.error("Sign in error:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      await SecureStore.deleteItemAsync("userSession")
      setUser(null)
      router.replace("/(auth)/login")
    } catch (error) {
      console.error("Sign out error:", error)
      setError("Failed to sign out")
    }
  }

  return {
    user,
    loading,
    error,
    signInWithVipps,
    signInWithBiometrics,
    signOut,
  }
}


