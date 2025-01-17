
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

import { View, Text, Image, Pressable } from 'react-native'
import { Link, Stack } from 'expo-router'
import useVippsAuth from '../hooks/useVippsAuth'

export default function Login() {
    const { signInWithVipps, loading, error } = useVippsAuth()

    return (
        <View className="flex-1 bg-[#0A0B1F] items-center justify-between py-10">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Logo Section */}
            <View className="flex-1 items-center justify-center">
                <Image
                    source={{ uri: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-01-07%20at%2015.30.25-jjWbN1mrhGrMmgIrvBraSAXFCT3TTf.png" }}
                    className="w-16 h-16"
                    resizeMode="contain"
                />
                {error && (
                    <Text className="text-red-500 mt-4 text-center px-4">
                        {error}
                    </Text>
                )}
            </View>

            {/* Buttons Section */}
            <View className="w-full px-6 space-y-6">
                <View className="flex-row space-x-4">
                    <Link href="/register" asChild className="flex-1">
                        <Pressable className="bg-[#FF3B30] rounded-full py-4 items-center flex-1">
                            <Text className="text-white text-xl font-medium">
                                Register
                            </Text>
                        </Pressable>
                    </Link>

                    <Pressable
                        onPress={signInWithVipps}
                        disabled={loading}
                        className="bg-[#FF3B30] rounded-full py-4 items-center flex-1"
                    >
                        <Text className="text-white text-xl font-medium">
                            {loading ? 'Loading...' : 'Continue with Vipps'}
                        </Text>
                    </Pressable>
                </View>

                <Link href="/" className="items-center">
                    <Text className="text-white text-lg underline">
                        Log in later
                    </Text>
                </Link>
            </View>
        </View>
    )
}