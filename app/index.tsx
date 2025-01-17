import { View, Text, Image, Pressable } from 'react-native'
import { Link } from 'expo-router'

export default function LandingPage() {
    return (
        <View className="flex-1 bg-[#0A0B1F] items-center justify-between py-10">
            {/* Logo Section */}
            <View className="flex-1 items-center justify-center">
                <Image
                    source={{ uri: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-01-07%20at%2015.30.16-0rlNvVzaQxGBwfrtlVUoW8CpL9raLZ.png" }}
                    className="w-16 h-16"
                    resizeMode="contain"
                />
                <Text className="text-white text-4xl mt-6 font-light">
                    Travel insurance
                </Text>
                <Text className="text-white text-2xl mt-4 font-light">
                    As it should be
                </Text>
            </View>

            {/* Get Started Button */}
            <Link href="/login" asChild>
                <Pressable className="bg-[#FF3B30] rounded-full w-[80%] py-4 items-center">
                    <Text className="text-white text-xl font-medium">
                        Get started
                    </Text>
                </Pressable>
            </Link>
        </View>
    )
}