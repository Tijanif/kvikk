
// import { Stack } from "expo-router";
// import { View, Text } from "react-native";
// import { supabase } from "~/utils/supabase";

// export default function Auth() {
//     return (

//         <View>
//             <Stack.Screen options={{ title: 'login' }} />
//             <Text>Login</Text>
//         </View>
//     );
// }

// import { View, Text, Image, Pressable } from 'react-native'
// import { Link, Stack } from 'expo-router'
// import useVippsAuth from '../hooks/useVippsAuth'

// export default function Login() {
//     const { signInWithVipps, loading, error } = useVippsAuth()

//     return (
//         <View className="flex-1 bg-[#0A0B1F] items-center justify-between py-10">
//             <Stack.Screen options={{ headerShown: false }} />

//             {/* Logo Section */}
//             <View className="flex-1 items-center justify-center">
//                 <Image
//                     source={{ uri: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-01-07%20at%2015.30.25-jjWbN1mrhGrMmgIrvBraSAXFCT3TTf.png" }}
//                     className="w-16 h-16"
//                     resizeMode="contain"
//                 />
//                 {error && (
//                     <Text className="text-red-500 mt-4 text-center px-4">
//                         {error}
//                     </Text>
//                 )}
//             </View>

//             {/* Buttons Section */}
//             <View className="w-full px-6 space-y-6">
//                 <View className="flex-row space-x-4">
//                     <Link href="/register" asChild className="flex-1">
//                         <Pressable className="bg-[#FF3B30] rounded-full py-4 items-center flex-1">
//                             <Text className="text-white text-xl font-medium">
//                                 Register
//                             </Text>
//                         </Pressable>
//                     </Link>

//                     <Pressable
//                         onPress={signInWithVipps}
//                         disabled={loading}
//                         className="bg-[#FF3B30] rounded-full py-4 items-center flex-1"
//                     >
//                         <Text className="text-white text-xl font-medium">
//                             {loading ? 'Loading...' : 'Continue with Vipps'}
//                         </Text>
//                     </Pressable>
//                 </View>

//                 <Link href="/" className="items-center">
//                     <Text className="text-white text-lg underline">
//                         Log in later
//                     </Text>
//                 </Link>
//             </View>
//         </View>
//     )
// }


import React from "react"
import { Button, View, Alert } from "react-native"
import * as AuthSession from "expo-auth-session"
import * as WebBrowser from "expo-web-browser"
import { router } from "expo-router"
import { supabase } from "../../utils/supabase"
import { log } from "../../utils/logger"

WebBrowser.maybeCompleteAuthSession()

const VIPPS_SUBSCRIPTION_KEY = process.env.EXPO_PUBLIC_VIPPS_PRIMARY_SUBSCRIPTION_KEY
const VIPPS_BASE_URL = "https://apitest.vipps.no"
const VIPPS_AUTH_BASE_URL = `${VIPPS_BASE_URL}/access-management-1.0/access`
const VIPPS_USERINFO_URL = `${VIPPS_BASE_URL}/vipps-userinfo-api/userinfo`

const createBasicAuthHeader = (username: string, password: string) => {
    const auth = `${username}:${password}`
    return `Basic ${btoa(encodeURIComponent(auth).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(Number.parseInt(p1, 16))))}`
}

const useVippsAuth = () => {
    const [request, response, promptAsync] = AuthSession.useAuthRequest(
        {
            clientId: process.env.EXPO_PUBLIC_VIPPS_CLIENT_ID as string,
            scopes: ["openid", "name", "email", "phoneNumber", "address", "birthDate"],
            redirectUri: AuthSession.makeRedirectUri({
                scheme: "kvikk",
                path: "auth",
            }),
            responseType: "code",
            usePKCE: false,
        },
        {
            authorizationEndpoint: `${VIPPS_AUTH_BASE_URL}/oauth2/auth`,
            tokenEndpoint: `${VIPPS_AUTH_BASE_URL}/oauth2/token`,
        },
    )

    return {
        request,
        response,
        promptAsync,
    }
}

const checkUserPolicies = async (userId: string) => {
    try {
        const { data: policies, error } = await supabase.from("policies").select("*").eq("user_id", userId)

        if (error) throw error

        return policies && policies.length > 0
    } catch (error) {
        log("Error checking user policies:", error)
        return false
    }
}

const LoginScreen = () => {
    const { promptAsync } = useVippsAuth()

    const handleVippsLogin = async () => {
        try {
            const result = await promptAsync()
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
                    redirect_uri: AuthSession.makeRedirectUri({
                        scheme: "kvikk",
                        path: "auth",
                    }),
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

                try {
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

                    // Check policies and redirect
                    const hasPolicies = await checkUserPolicies(session.user?.id as string)
                    if (hasPolicies) {
                        router.replace("/(tabs)/policies")
                    } else {
                        router.replace("/(tabs)")
                    }
                } catch (supabaseError) {
                    log("Supabase auth error:", supabaseError)
                    throw new Error("Failed to authenticate with Supabase")
                }
            }
        } catch (error) {
            log("Vipps login error:", error)
            Alert.alert("Authentication Error", "Failed to complete login. Please try again.", [{ text: "OK" }])
        }
    }

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Button title="Login with Vipps" onPress={handleVippsLogin} />
        </View>
    )
}

export default LoginScreen

