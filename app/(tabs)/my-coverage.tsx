import React, { useEffect } from "react"
import { View, Text, TouchableOpacity, Image, SafeAreaView } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useStore } from "../store/useStore"
import { useAuth } from "../hooks/useAuth"
import { router } from "expo-router"

export default function MyCoverageScreen() {
    const { user, loading } = useAuth()
    const { coverage, fetchUserProfile, fetchUserCoverage } = useStore()

    useEffect(() => {
        if (user) {
            fetchUserProfile(user.id)
            fetchUserCoverage(user.id)
        }
    }, [user])

    const handleBuyInsurance = () => {
        router.push("/buy-insurance")
    }

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text>Loading...</Text>
            </View>
        )
    }

    return (
        <LinearGradient colors={["#1a1a2e", "#16213e"]} className="flex-1">
            <SafeAreaView className="flex-1">
                <View className="flex-1 px-4 pt-4">
                    {/* Logo */}
                    <View className="mb-8">
                        {/* <Image source={require("../../assets/logo.png")} className="w-12 h-12" resizeMode="contain" /> */}
                    </View>

                    {/* Price */}
                    <Text className="text-white text-2xl font-bold mb-6">Starting from 119,-</Text>

                    {/* Coverage Status Card */}
                    <View className="bg-[#2a2a4a] rounded-2xl p-6 mb-4 shadow-lg">
                        <Text className="text-white text-3xl font-bold">
                            {coverage ? "You are covered!" : "You are currently not covered."}
                        </Text>
                    </View>

                    {/* Smart Travel Insurance Card */}
                    <View className="bg-[#2a2a4a] rounded-2xl p-6 shadow-lg">
                        <Text className="text-white text-3xl font-bold mb-3">Smart travel insurance</Text>

                        {coverage ? (
                            <View>
                                <Text className="text-gray-300 text-lg mb-4">
                                    Your insurance is active until {new Date(coverage.end_date).toLocaleDateString()}
                                </Text>
                                <TouchableOpacity
                                    onPress={() => router.push("/coverage-details")}
                                    className="bg-transparent border border-white rounded-xl py-3"
                                >
                                    <Text className="text-white text-center text-lg font-semibold">View Details</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View>
                                <Text className="text-gray-300 text-lg mb-4">Secure your next travel with Smart travel insurance</Text>
                                <TouchableOpacity onPress={handleBuyInsurance} className="bg-[#ff3b30] rounded-xl py-3">
                                    <Text className="text-white text-center text-lg font-semibold">Buy insurance</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </SafeAreaView>
        </LinearGradient>
    )
}

