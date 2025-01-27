import React, { useState, useEffect } from "react"
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native"
import { supabase } from "../utils/supabase"
import { useAuth } from "../hooks/useAuth"
import { log } from "../utils/logger"

type Profile = {
    id: string
    full_name: string
    email: string
    phone_number: string
    address: string
}

export default function ProfileScreen() {
    const { user } = useAuth()
    const [profile, setProfile] = useState<Profile | null>(null)
    const [isEditing, setIsEditing] = useState(false)

    useEffect(() => {
        if (user) {
            fetchProfile()
        }
    }, [user])

    const fetchProfile = async () => {
        try {
            const { data, error } = await supabase.from("users").select("*").eq("id", user?.id).single()

            if (error) throw error

            setProfile(data)
        } catch (error) {
            log("Error fetching profile:", error)
            Alert.alert("Error", "Failed to load profile. Please try again.")
        }
    }

    const handleUpdate = async () => {
        if (!profile) return

        try {
            const { error } = await supabase
                .from("users")
                .update({
                    full_name: profile.full_name,
                    phone_number: profile.phone_number,
                    address: profile.address,
                })
                .eq("id", user?.id)

            if (error) throw error

            Alert.alert("Success", "Profile updated successfully")
            setIsEditing(false)
        } catch (error) {
            log("Error updating profile:", error)
            Alert.alert("Error", "Failed to update profile. Please try again.")
        }
    }

    if (!profile) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text>Loading profile...</Text>
            </View>
        )
    }

    return (
        <ScrollView className="flex-1 bg-white p-4">
            <Text className="text-2xl font-bold mb-4">Your Profile</Text>
            <View className="space-y-4">
                <View>
                    <Text className="text-gray-600 mb-1">Full Name</Text>
                    <TextInput
                        className="border border-gray-300 rounded-md p-2"
                        value={profile.full_name}
                        onChangeText={(text) => setProfile({ ...profile, full_name: text })}
                        editable={isEditing}
                    />
                </View>
                <View>
                    <Text className="text-gray-600 mb-1">Email</Text>
                    <TextInput className="border border-gray-300 rounded-md p-2" value={profile.email} editable={false} />
                </View>
                <View>
                    <Text className="text-gray-600 mb-1">Phone Number</Text>
                    <TextInput
                        className="border border-gray-300 rounded-md p-2"
                        value={profile.phone_number}
                        onChangeText={(text) => setProfile({ ...profile, phone_number: text })}
                        editable={isEditing}
                    />
                </View>
                <View>
                    <Text className="text-gray-600 mb-1">Address</Text>
                    <TextInput
                        className="border border-gray-300 rounded-md p-2"
                        value={profile.address}
                        onChangeText={(text) => setProfile({ ...profile, address: text })}
                        editable={isEditing}
                        multiline
                    />
                </View>
            </View>
            {isEditing ? (
                <View className="flex-row justify-between mt-6">
                    <TouchableOpacity className="bg-gray-500 py-2 px-4 rounded-md" onPress={() => setIsEditing(false)}>
                        <Text className="text-white font-semibold">Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="bg-blue-500 py-2 px-4 rounded-md" onPress={handleUpdate}>
                        <Text className="text-white font-semibold">Save Changes</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity className="bg-blue-500 py-2 px-4 rounded-md mt-6" onPress={() => setIsEditing(true)}>
                    <Text className="text-white font-semibold text-center">Edit Profile</Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    )
}

