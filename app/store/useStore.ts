import { create } from "zustand"
import { supabase } from "../utils/supabase"

interface UserProfile {
  id: string
  email: string
  full_name: string
  phone_number: string
  address: string
  vipps_sub: string
}

interface Coverage {
  id: string
  user_id: string
  status: "active" | "expired" | "pending"
  start_date: string
  end_date: string
  type: string
  price: number
}

interface Store {
  user: UserProfile | null
  coverage: Coverage | null
  isLoading: boolean
  setUser: (user: UserProfile | null) => void
  setCoverage: (coverage: Coverage | null) => void
  fetchUserProfile: (userId: string) => Promise<void>
  fetchUserCoverage: (userId: string) => Promise<void>
}

export const useStore = create<Store>((set) => ({
  user: null,
  coverage: null,
  isLoading: false,

  setUser: (user) => set({ user }),
  setCoverage: (coverage) => set({ coverage }),

  fetchUserProfile: async (userId) => {
    try {
      set({ isLoading: true })
      const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

      if (error) throw error
      set({ user: data })
    } catch (error) {
      console.error("Error fetching user profile:", error)
    } finally {
      set({ isLoading: false })
    }
  },

  fetchUserCoverage: async (userId) => {
    try {
      set({ isLoading: true })
      const { data, error } = await supabase
        .from("coverage")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== "PGRST116") throw error
      set({ coverage: data || null })
    } catch (error) {
      console.error("Error fetching coverage:", error)
      set({ coverage: null })
    } finally {
      set({ isLoading: false })
    }
  },
}))


