import * as Crypto from 'expo-crypto'
import * as WebBrowser from 'expo-web-browser'
import * as SecureStore from 'expo-secure-store'

const VIPPS_AUTH_ENDPOINT = process.env.EXPO_PUBLIC_AUTH_ENDPOINT!
const VIPPS_TOKEN_ENDPOINT = process.env.EXPO_PUBLIC_TOKEN_ENDPOINT!
const VIPPS_USERINFO_ENDPOINT = process.env.EXPO_PUBLIC_USERINFO_ENDPOINT!
const VIPPS_CLIENT_ID = process.env.EXPO_PUBLIC_VIPPS_CLIENT_ID!

// Use exact URIs as registered in Vipps portal
const APP_CALLBACK_URI = 'https://auth.kvikk.app/callback'
const REDIRECT_URI = 'https://auth.kvikk.app/redirect'

async function generateRandomString(length: number): Promise<string> {
  const randomBytes = await Crypto.getRandomBytesAsync(length)
  return Array.from(randomBytes)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')
}

async function generateCodeVerifier(): Promise<string> {
  return generateRandomString(32)
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier)
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    verifier
  )
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

async function storeAuthParams(params: { 
  state: string, 
  codeVerifier: string 
}): Promise<void> {
  await SecureStore.setItemAsync('authParams', JSON.stringify(params))
}

async function getAuthParams(): Promise<{ state: string, codeVerifier: string } | null> {
  const params = await SecureStore.getItemAsync('authParams')
  return params ? JSON.parse(params) : null
}

export async function initiateLogin(): Promise<void> {
  const state = await generateRandomString(16)
  const codeVerifier = await generateCodeVerifier()
  const codeChallenge = await generateCodeChallenge(codeVerifier)

  await storeAuthParams({ state, codeVerifier })

  const authUrl = `${VIPPS_AUTH_ENDPOINT}?` + new URLSearchParams({
    client_id: VIPPS_CLIENT_ID,
    response_type: 'code',
    scope: 'openid name email phoneNumber address birthDate',
    redirect_uri: REDIRECT_URI,
    app_callback_uri: APP_CALLBACK_URI,
    requested_flow: 'app_to_app',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state: state,
  })

  const result = await WebBrowser.openAuthSessionAsync(
    authUrl,
    'kvikk://'
  )

  if (result.type === 'cancel') {
    throw new Error('Authentication was cancelled')
  }
}

export async function handleRedirect(url: string): Promise<{ tokens: any, userInfo: any }> {
  const { state, code } = parseRedirectResult(url)

  const storedParams = await getAuthParams()
  if (!storedParams || storedParams.state !== state) {
    throw new Error('Invalid state parameter')
  }

  const tokens = await exchangeCodeForToken(code, storedParams.codeVerifier)
  const userInfo = await getUserInfo(tokens.access_token)

  return { tokens, userInfo }
}

function parseRedirectResult(url: string): { state: string, code: string } {
  const params = new URL(url).searchParams
  const state = params.get('state')
  const code = params.get('code')

  if (!state || !code) {
    throw new Error('Invalid redirect result')
  }

  return { state, code }
}

async function exchangeCodeForToken(code: string, codeVerifier: string): Promise<any> {
  const response = await fetch(VIPPS_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
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
    throw new Error(`Failed to exchange code for token: ${error}`)
  }

  return response.json()
}

async function getUserInfo(accessToken: string): Promise<any> {
  const response = await fetch(VIPPS_USERINFO_ENDPOINT, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get user info: ${error}`)
  }

  return response.json()
}