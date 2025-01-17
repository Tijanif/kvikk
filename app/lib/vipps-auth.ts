// import * as Crypto from 'expo-crypto'
// import * as WebBrowser from 'expo-web-browser'
// import * as SecureStore from 'expo-secure-store'

// const VIPPS_AUTH_ENDPOINT = process.env.EXPO_PUBLIC_AUTH_ENDPOINT!
// const VIPPS_TOKEN_ENDPOINT = process.env.EXPO_PUBLIC_TOKEN_ENDPOINT!
// const VIPPS_USERINFO_ENDPOINT = process.env.EXPO_PUBLIC_USERINFO_ENDPOINT!
// const VIPPS_CLIENT_ID = process.env.EXPO_PUBLIC_VIPPS_CLIENT_ID!

// // Use the exact URIs registered in Vipps portal
// const REDIRECT_URI = 'https://auth.kvikk.app/redirect'
// const APP_CALLBACK_URI = 'https://auth.kvikk.app/callback'

// async function generateRandomString(length: number): Promise<string> {
//   const randomBytes = await Crypto.getRandomBytesAsync(length)
//   return Array.from(randomBytes)
//     .map(byte => byte.toString(16).padStart(2, '0'))
//     .join('')
// }

// async function generateCodeChallenge(verifier: string): Promise<string> {
//   const data = new TextEncoder().encode(verifier)
//   const digest = await Crypto.digestStringAsync(
//     Crypto.CryptoDigestAlgorithm.SHA256,
//     verifier
//   )
//   return btoa(String.fromCharCode(...new Uint8Array(digest)))
//     .replace(/\+/g, '-')
//     .replace(/\//g, '_')
//     .replace(/=/g, '')
// }

// export async function initiateVippsLogin(): Promise<void> {
//   try {
//     const state = await generateRandomString(16)
//     const codeVerifier = await generateRandomString(32)
//     const codeChallenge = await generateCodeChallenge(codeVerifier)

//     await SecureStore.setItemAsync('pkce_params', JSON.stringify({
//       state,
//       codeVerifier,
//       timestamp: Date.now()
//     }))

//     const params = new URLSearchParams({
//       client_id: VIPPS_CLIENT_ID,
//       response_type: 'code',
//       scope: 'openid name email phoneNumber address birthDate',
//       redirect_uri: REDIRECT_URI,
//       app_callback_uri: APP_CALLBACK_URI,
//       requested_flow: 'app_to_app',
//       code_challenge: codeChallenge,
//       code_challenge_method: 'S256',
//       state: state,
//     })

//     const authUrl = `${VIPPS_AUTH_ENDPOINT}?${params.toString()}`
    
//     const result = await WebBrowser.openAuthSessionAsync(
//       authUrl,
//       REDIRECT_URI,
//       {
//         showInRecents: true,
//         preferEphemeralSession: true
//       }
//     )

//     if (result.type === 'cancel') {
//       throw new Error('User cancelled the login flow')
//     }
//   } catch (error) {
//     console.error('Error in initiateVippsLogin:', error)
//     throw error
//   }
// }

// export async function handleVippsRedirect(url: string): Promise<{
//   tokens: any
//   userInfo: any
// }> {
//   try {
//     const params = new URL(url).searchParams
//     const code = params.get('code')
//     const state = params.get('state')

//     if (!code || !state) {
//       throw new Error('Missing code or state from Vipps redirect')
//     }

//     const storedParamsJson = await SecureStore.getItemAsync('pkce_params')
//     if (!storedParamsJson) {
//       throw new Error('No stored PKCE parameters found')
//     }

//     const storedParams = JSON.parse(storedParamsJson)
//     if (storedParams.state !== state) {
//       throw new Error('State mismatch - possible CSRF attack')
//     }

//     const tokens = await exchangeCodeForTokens(code, storedParams.codeVerifier)
//     const userInfo = await fetchVippsUserInfo(tokens.access_token)

//     await SecureStore.deleteItemAsync('pkce_params')

//     return { tokens, userInfo }
//   } catch (error) {
//     console.error('Error in handleVippsRedirect:', error)
//     throw error
//   }
// }

// async function exchangeCodeForTokens(code: string, codeVerifier: string): Promise<any> {
//   const response = await fetch(VIPPS_TOKEN_ENDPOINT, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/x-www-form-urlencoded',
//     },
//     body: new URLSearchParams({
//       grant_type: 'authorization_code',
//       client_id: VIPPS_CLIENT_ID,
//       code,
//       redirect_uri: REDIRECT_URI,
//       code_verifier: codeVerifier,
//     }),
//   })

//   if (!response.ok) {
//     const errorText = await response.text()
//     throw new Error(`Token exchange failed: ${errorText}`)
//   }

//   return response.json()
// }

// async function fetchVippsUserInfo(accessToken: string): Promise<any> {
//   const response = await fetch(VIPPS_USERINFO_ENDPOINT, {
//     headers: {
//       'Authorization': `Bearer ${accessToken}`,
//     },
//   })

//   if (!response.ok) {
//     const errorText = await response.text()
//     throw new Error(`Failed to fetch user info: ${errorText}`)
//   }

//   return response.json()
// }



import * as Crypto from 'expo-crypto'
import * as WebBrowser from 'expo-web-browser'
import * as SecureStore from 'expo-secure-store'
import * as Linking from 'expo-linking'
import { Platform } from 'react-native'

const VIPPS_AUTH_ENDPOINT = process.env.EXPO_PUBLIC_AUTH_ENDPOINT!
const VIPPS_TOKEN_ENDPOINT = process.env.EXPO_PUBLIC_TOKEN_ENDPOINT!
const VIPPS_USERINFO_ENDPOINT = process.env.EXPO_PUBLIC_USERINFO_ENDPOINT!
const VIPPS_CLIENT_ID = process.env.EXPO_PUBLIC_VIPPS_CLIENT_ID!

// // Use the exact URIs as configured in Vipps portal
// const REDIRECT_URI = 'https://auth.kvikk.app/redirect'
// const APP_CALLBACK_URI = 'https://auth.kvikk.app/callback'

// // Interface for auth params storage
// interface StoredAuthParams {
//   state: string
//   codeVerifier: string
//   timestamp: number
// }

// async function generateRandomString(length: number): Promise<string> {
//   const randomBytes = await Crypto.getRandomBytesAsync(length)
//   return Array.from(randomBytes)
//     .map(byte => byte.toString(16).padStart(2, '0'))
//     .join('')
// }

// async function generateCodeChallenge(verifier: string): Promise<string> {
//   const data = new TextEncoder().encode(verifier)
//   const digest = await Crypto.digestStringAsync(
//     Crypto.CryptoDigestAlgorithm.SHA256,
//     verifier
//   )
//   return btoa(String.fromCharCode(...new Uint8Array(digest)))
//     .replace(/\+/g, '-')
//     .replace(/\//g, '_')
//     .replace(/=/g, '')
// }

// async function storeAuthParams(params: StoredAuthParams): Promise<void> {
//   await SecureStore.setItemAsync('vipps_auth_params', JSON.stringify(params))
// }

// async function getStoredAuthParams(): Promise<StoredAuthParams | null> {
//   const stored = await SecureStore.getItemAsync('vipps_auth_params')
//   return stored ? JSON.parse(stored) : null
// }

// export async function initiateVippsLogin(): Promise<void> {
//   try {
//     const state = await generateRandomString(16)
//     const codeVerifier = await generateRandomString(32)
//     const codeChallenge = await generateCodeChallenge(codeVerifier)

//     // Store auth params for later verification
//     await storeAuthParams({
//       state,
//       codeVerifier,
//       timestamp: Date.now()
//     })

//     const params = new URLSearchParams({
//       client_id: VIPPS_CLIENT_ID,
//       response_type: 'code',
//       scope: 'openid name email phoneNumber address birthDate',
//       redirect_uri: REDIRECT_URI,
//       app_callback_uri: APP_CALLBACK_URI,
//       requested_flow: 'app_to_app', // Explicitly request app-to-app flow
//       code_challenge: codeChallenge,
//       code_challenge_method: 'S256',
//       state: state
//     })

//     const authUrl = `${VIPPS_AUTH_ENDPOINT}?${params.toString()}`
//     console.log('Opening Vipps auth URL:', authUrl)

//     if (Platform.OS === 'ios' || Platform.OS === 'android') {
//       // For mobile, directly open the URL which should trigger the Vipps app
//       await Linking.openURL(authUrl)
//     } else {
//       // Fallback for web or development
//       const result = await WebBrowser.openAuthSessionAsync(authUrl, REDIRECT_URI)
//       if (result.type === 'cancel') {
//         throw new Error('Authentication cancelled')
//       }
//     }
//   } catch (error) {
//     console.error('Error initiating Vipps login:', error)
//     throw error
//   }
// }

// export async function handleAppCallback(url: string): Promise<void> {
//   try {
//     const params = Linking.parse(url).queryParams as { state?: string, resume_uri?: string }
    
//     const storedParams = await getStoredAuthParams()
//     if (!storedParams || storedParams.state !== params.state) {
//       throw new Error('Invalid state parameter')
//     }

//     if (params.resume_uri) {
//       // Resume the authentication flow
//       await Linking.openURL(params.resume_uri)
//     }
//   } catch (error) {
//     console.error('Error handling app callback:', error)
//     throw error
//   }
// }

// export async function handleRedirect(url: string): Promise<{ tokens: any, userInfo: any }> {
//   try {
//     const params = Linking.parse(url).queryParams as { code?: string, state?: string }
    
//     if (!params.code || !params.state) {
//       throw new Error('Missing required parameters from redirect')
//     }

//     const storedParams = await getStoredAuthParams()
//     if (!storedParams || storedParams.state !== params.state) {
//       throw new Error('Invalid state parameter')
//     }

//     // Check if the stored parameters haven't expired (15 minutes)
//     if (Date.now() - storedParams.timestamp > 15 * 60 * 1000) {
//       throw new Error('Authentication flow expired')
//     }

//     const tokens = await exchangeCodeForTokens(params.code, storedParams.codeVerifier)
//     const userInfo = await fetchUserInfo(tokens.access_token)

//     // Clean up stored params
//     await SecureStore.deleteItemAsync('vipps_auth_params')

//     return { tokens, userInfo }
//   } catch (error) {
//     console.error('Error handling redirect:', error)
//     throw error
//   }
// }

// async function exchangeCodeForTokens(code: string, codeVerifier: string): Promise<any> {
//   const response = await fetch(VIPPS_TOKEN_ENDPOINT, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/x-www-form-urlencoded',
//     },
//     body: new URLSearchParams({
//       grant_type: 'authorization_code',
//       client_id: VIPPS_CLIENT_ID,
//       code,
//       redirect_uri: REDIRECT_URI,
//       code_verifier: codeVerifier,
//     }),
//   })

//   if (!response.ok) {
//     const error = await response.text()
//     throw new Error(`Token exchange failed: ${error}`)
//   }

//   return response.json()
// }

// async function fetchUserInfo(accessToken: string): Promise<any> {
//   const response = await fetch(VIPPS_USERINFO_ENDPOINT, {
//     headers: {
//       'Authorization': `Bearer ${accessToken}`,
//     },
//   })

//   if (!response.ok) {
//     const error = await response.text()
//     throw new Error(`Failed to fetch user info: ${error}`)
//   }

//   return response.json()
// }

// Use the exact URIs as configured in Vipps portal
const REDIRECT_URI = 'https://auth.kvikk.app/redirect'
const APP_CALLBACK_URI = 'https://auth.kvikk.app/callback'

async function base64URLEncode(buffer: ArrayBuffer): Promise<string> {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }
  
  async function generateCodeVerifier(): Promise<string> {
    const randomBytes = await Crypto.getRandomBytesAsync(32)
    return base64URLEncode(randomBytes)
  }
  
  async function generateCodeChallenge(verifier: string): Promise<string> {
    const data = new TextEncoder().encode(verifier)
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      verifier
    )
    return base64URLEncode(hash)
  }
  
  async function generateState(): Promise<string> {
    const randomBytes = await Crypto.getRandomBytesAsync(16)
    return base64URLEncode(randomBytes)
  }
  
  async function storeAuthParams(params: { 
    state: string, 
    codeVerifier: string 
  }): Promise<void> {
    await SecureStore.setItemAsync('vipps_auth_params', JSON.stringify(params))
  }
  
  async function getStoredAuthParams(): Promise<{ state: string, codeVerifier: string } | null> {
    const stored = await SecureStore.getItemAsync('vipps_auth_params')
    return stored ? JSON.parse(stored) : null
  }
  
  export async function initiateVippsLogin(): Promise<void> {
    try {
      const state = await generateState()
      const codeVerifier = await generateCodeVerifier()
      const codeChallenge = await generateCodeChallenge(codeVerifier)
  
      await storeAuthParams({ state, codeVerifier })
  
      const authUrl = `${VIPPS_AUTH_ENDPOINT}?${new URLSearchParams({
        client_id: VIPPS_CLIENT_ID,
        response_type: 'code',
        scope: 'openid name email phoneNumber address birthDate',
        redirect_uri: REDIRECT_URI,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        state: state
      }).toString()}`
  
      console.log('Opening Vipps auth URL:', authUrl)
  
      const result = await WebBrowser.openAuthSessionAsync(authUrl, REDIRECT_URI)
  
      if (result.type === 'success' && result.url) {
        return handleRedirect(result.url)
      } else {
        throw new Error('Authentication was cancelled or failed')
      }
    } catch (error) {
      console.error('Error initiating Vipps login:', error)
      throw error
    }
  }
  
  export async function handleRedirect(url: string): Promise<{ tokens: any, userInfo: any }> {
    try {
      const parsed = Linking.parse(url)
      const { code, state } = parsed.queryParams as { code?: string, state?: string }
  
      if (!code || !state) {
        throw new Error('Missing code or state parameter')
      }
  
      const storedParams = await getStoredAuthParams()
      if (!storedParams || storedParams.state !== state) {
        throw new Error('Invalid state parameter')
      }
  
      const tokens = await exchangeCodeForTokens(code, storedParams.codeVerifier)
      const userInfo = await fetchUserInfo(tokens.access_token)
  
      await SecureStore.deleteItemAsync('vipps_auth_params')
  
      return { tokens, userInfo }
    } catch (error) {
      console.error('Error handling redirect:', error)
      throw error
    }
  }
  
  async function exchangeCodeForTokens(code: string, codeVerifier: string): Promise<any> {
    const response = await fetch(VIPPS_TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Ocp-Apim-Subscription-Key': process.env.EXPO_PUBLIC_VIPPS_PRIMARY_SUBSCRIPTION_KEY!
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: VIPPS_CLIENT_ID,
        code,
        redirect_uri: REDIRECT_URI,
        code_verifier: codeVerifier,
      }),
    })
  
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Token exchange failed: ${error}`)
    }
  
    return response.json()
  }
  
  async function fetchUserInfo(accessToken: string): Promise<any> {
    const response = await fetch(VIPPS_USERINFO_ENDPOINT, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Ocp-Apim-Subscription-Key': process.env.EXPO_PUBLIC_VIPPS_PRIMARY_SUBSCRIPTION_KEY!
      },
    })
  
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to fetch user info: ${error}`)
    }
  
    return response.json()
  }
  