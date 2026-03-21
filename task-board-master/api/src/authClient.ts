import {
  getCurrentUser,
  refreshAuthSession,
  register,
  signIn,
  signInAnonymously,
  signOut,
} from './auth'
import type { AuthSession, AuthUser, SignInInput, SignUpInput, SignUpResult } from './types'

const SESSION_STORAGE_KEY = 'task_board_supabase_session'

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function getStoredSession(): AuthSession | null {
  if (!isBrowser()) {
    return null
  }

  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as AuthSession
  } catch {
    window.localStorage.removeItem(SESSION_STORAGE_KEY)
    return null
  }
}

export function saveSession(session: AuthSession): void {
  if (!isBrowser()) {
    return
  }
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  if (!isBrowser()) {
    return
  }
  window.localStorage.removeItem(SESSION_STORAGE_KEY)
}

export async function registerWithEmail(input: SignUpInput): Promise<SignUpResult> {
  const result = await register(input)
  if (result.session) {
    saveSession(result.session)
  }
  return result
}

export async function loginWithEmail(input: SignInInput): Promise<AuthSession> {
  const session = await signIn(input)
  saveSession(session)
  return session
}

export async function loginAnonymously(): Promise<AuthSession> {
  const session = await signInAnonymously()
  saveSession(session)
  return session
}

export async function logoutCurrentSession(): Promise<void> {
  const session = getStoredSession()
  if (session) {
    await signOut(session.accessToken)
  }
  clearSession()
}

export async function restoreCurrentUser(): Promise<AuthUser | null> {
  const session = getStoredSession()
  if (!session) {
    return null
  }

  try {
    return await getCurrentUser(session.accessToken)
  } catch {
    try {
      const nextSession = await refreshAuthSession(session.refreshToken)
      saveSession(nextSession)
      return await getCurrentUser(nextSession.accessToken)
    } catch {
      clearSession()
      return null
    }
  }
}
