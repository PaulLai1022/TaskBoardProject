import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { type AuthState } from '@/types'
import {
  registerWithEmail,
  loginWithEmail,
  loginAnonymously,
  logoutCurrentSession,
  getStoredSession,
} from '@/api'
import { getCurrentUserWithAnonymous } from '@/api/user'

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<boolean>
  guestLogin: () => Promise<void>
  logout: () => Promise<void>
  restoreSession: () => Promise<void>
  getAccessToken: () => string | null
}

/**
 * User authentication state management store
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isGuest: false,

      /**
       * User login
       */
      login: async (email: string, password: string) => {
        const session = await loginWithEmail({ email, password })
        const user = await getCurrentUserWithAnonymous(session.accessToken)
        set({
          user: user || {
            id: session.userId,
            email: session.email,
            isAnonymous: false,
          },
          session,
          isAuthenticated: true,
          isGuest: user?.isAnonymous ?? false,
        })
      },

      /**
       * User registration
       * Returns true after successful registration, does not auto-login
       */
      register: async (email: string, password: string) => {
        await registerWithEmail({ email, password })
        // Registration successful, return true for user to login manually
        return true
      },

      /**
       * Guest login
       */
      guestLogin: async () => {
        const session = await loginAnonymously()
        const user = await getCurrentUserWithAnonymous(session.accessToken)
        set({
          user: user || {
            id: session.userId,
            email: session.email,
            isAnonymous: true,
          },
          session,
          isAuthenticated: true,
          isGuest: user?.isAnonymous ?? true,
        })
      },

      /**
       * User logout
       */
      logout: async () => {
        try {
          await logoutCurrentSession()
        } catch (error) {
          console.error('Logout failed:', error)
        } finally {
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isGuest: false,
          })
        }
      },

      /**
       * Restore session
       * Determines if user is guest based on isAnonymous field from API
       */
      restoreSession: async () => {
        try {
          const session = getStoredSession()
          if (session) {
            const user = await getCurrentUserWithAnonymous(session.accessToken)
            if (user) {
              set({
                user,
                session,
                isAuthenticated: true,
                isGuest: user.isAnonymous,
              })
            }
          }
        } catch (error) {
          console.error('Session restore failed:', error)
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isGuest: false,
          })
        }
      },

      /**
       * Get access token
       */
      getAccessToken: () => {
        return get().session?.accessToken || null
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
        isGuest: state.isGuest,
      }),
    }
  )
)
