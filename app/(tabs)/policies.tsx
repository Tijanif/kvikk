import React, { useEffect, useState } from "react"
import { View, Text, ScrollView, RefreshControl } from "react-native"
import { supabase } from "../../utils/supabase"
import { log } from "../../utils/logger"

type Policy = {
    id: string
    policy_number: string
    type: string
    status: string
    created_at: string
}

export default function PoliciesScreen() {
    const [policies, setPolicies] = useState<Policy[]>([])
    const [refreshing, setRefreshing] = useState(false)

    const fetchPolicies = async () => {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser()
            if (!user) throw new Error("No user found")

            const { data, error } = await supabase.from("policies").select("*").eq("user_id", user.id)

            if (error) throw error
            setPolicies(data || [])
        } catch (error) {
            log("Error fetching policies:", error)
        }
    }

    const onRefresh = async () => {
        setRefreshing(true)
        await fetchPolicies()
        setRefreshing(false)
    }

    useEffect(() => {
        fetchPolicies()
    }, [])

    return (
        <ScrollView
            className="flex-1 bg-white"
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View className="p-4">
                <Text className="text-2xl font-bold mb-4">Your Insurance Policies</Text>
                {policies.length === 0 ? (
                    <Text className="text-gray-500">No insurance policies found.</Text>
                ) : (
                    policies.map((policy) => (
                        <View key={policy.id} className="bg-gray-50 p-4 rounded-lg mb-4">
                            <Text className="font-semibold">Policy Number: {policy.policy_number}</Text>
                            <Text className="text-gray-600">Type: {policy.type}</Text>
                            <Text className="text-gray-600">Status: {policy.status}</Text>
                            <Text className="text-gray-400 text-sm">Created: {new Date(policy.created_at).toLocaleDateString()}</Text>
                        </View>
                    ))
                )}
            </View>
        </ScrollView>
    )
}

