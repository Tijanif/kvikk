import React, { useEffect } from "react"
import { View, Text, TouchableOpacity, Image } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useStore } from "../store/useStore"
import { useAuth } from "../hooks/useAuth"
import { router } from "expo-router"

export default function CoverageScreen() {
    const { user, coverage, fetchUserProfile, fetchUserCoverage } = useStore()
    const { user: authUser } = useAuth()

    useEffect(() => {
        if (authUser?.id) {
            fetchUserProfile(authUser.id)
            fetchUserCoverage(authUser.id)
        }
    }, [authUser])

    const handleBuyInsurance = () => {
        router.push("/buy-insurance")
    }

    return (
        <LinearGradient colors={["#1a1a2e", "#16213e"]} className="flex-1">
            <View className="flex-1 p-4">
                {/* Logo */}
                <Image
                    source={{
                        uri: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-01-07%20at%2015.30.32-KJQXLPw0oqyo1aMzYa7OSNNQyNxYA3.png",
                    }}
                    className="w-12 h-12 mb-4"
                />

                {/* Price */}
                <Text className="text-white text-2xl font-bold mb-6">Starting from 119,-</Text>

                {/* Coverage Status Card */}
                <View className="bg-[#2a2a4a] rounded-xl p-4 mb-4">
                    <Text className="text-white text-2xl font-bold">
                        {coverage ? "You are covered!" : "You are currently not covered."}
                    </Text>
                </View>

                {/* Insurance Info Card */}
                <View className="bg-[#2a2a4a] rounded-xl p-4">
                    <Text className="text-white text-3xl font-bold mb-2">Smart travel insurance</Text>

                    {coverage ? (
                        <View className="space-y-2">
                            <Text className="text-gray-300">Valid until: {new Date(coverage.end_date).toLocaleDateString()}</Text>
                            <Text className="text-gray-300">Type: {coverage.type}</Text>
                            <TouchableOpacity
                                onPress={() => router.push("/coverage-details")}
                                className="bg-[#2a2a4a] border border-white rounded-lg py-2 px-4 mt-2"
                            >
                                <Text className="text-white text-center">View Details</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            <Text className="text-gray-300 mb-4">Secure your next travel with Smart travel insurance</Text>
                            <TouchableOpacity onPress={handleBuyInsurance} className="bg-[#ff3b30] rounded-lg py-3 px-6">
                                <Text className="text-white text-center text-lg font-semibold">Buy insurance</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        </LinearGradient>
    )
}

