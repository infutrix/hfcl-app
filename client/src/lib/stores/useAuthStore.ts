import create from "zustand"
import { persist } from "zustand/middleware"

type AuthState = {
  token?: string | null
  setToken: (token?: string | null) => void
  logout: () => void
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (token) => {
        if (token) {
          try {
            localStorage.setItem("hfcl_access_token", token)
          } catch {}
        } else {
          try {
            localStorage.removeItem("hfcl_access_token")
          } catch {}
        }
        set({ token })
      },
      logout: () => {
        try {
          localStorage.removeItem("hfcl_access_token")
        } catch {}
        set({ token: null })
      },
    }),
    { name: "hfcl-auth" }
  )
)

export default useAuthStore
