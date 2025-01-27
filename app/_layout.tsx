import '../global.css';

import { useEffect } from "react"
import { Slot, useRouter } from "expo-router"
import { useAuth } from "../app/hooks/useAuth"

export default function RootLayout() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace("/(tabs)")
      } else {
        router.replace("/(auth)/login")
      }
    }
  }, [user, loading, router]) // Added router to dependencies

  if (loading) {
    // You might want to show a loading screen here
    return null
  }

  return <Slot />
}

