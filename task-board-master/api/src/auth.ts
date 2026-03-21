import { createAuthedClient, supabase } from './config'
import { throwApiError, createError } from './error'
import type {
  AuthSession,
  AuthUser,
  SignInInput,
  SignUpInput,
  SignUpResult,
} from './types'

function toAuthUser(user: { id: string; email?: string | null }): AuthUser {
  return {
    id: user.id,
    email: user.email ?? null,
  }
}

function toAuthSession(session: {
  access_token: string
  refresh_token: string
  user: { id: string; email?: string | null }
}): AuthSession {
  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    userId: session.user.id,
    email: session.user.email ?? null,
  }
}

/**
 * 用户注册
 * @param input - 注册信息
 * @returns SignUpResult
 */
export async function register(input: SignUpInput): Promise<SignUpResult> {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
  })

  if (error) {
    throwApiError(error)
  }

  if (!data.user) {
    throw createError('register_failed', '注册失败：未返回用户信息')
  }

  return {
    user: toAuthUser(data.user),
    session: data.session ? toAuthSession(data.session) : null,
    emailConfirmationSent: !data.session,
  }
}

/**
 * 用户注册（简化版）
 * @param input - 注册信息
 * @returns AuthUser
 */
export async function signUp(input: SignUpInput): Promise<AuthUser> {
  const result = await register(input)
  return result.user
}

/**
 * 用户登录
 * @param input - 登录信息
 * @returns AuthSession
 */
export async function signIn(input: SignInInput): Promise<AuthSession> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  })

  if (error) {
    throwApiError(error)
  }

  if (!data.session) {
    throw createError('login_failed', '登录失败：未返回会话信息')
  }

  return toAuthSession(data.session)
}

/**
 * 刷新会话
 * @param refreshToken - 刷新令牌
 * @returns AuthSession
 */
export async function refreshAuthSession(
  refreshToken: string
): Promise<AuthSession> {
  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  })

  if (error) {
    throwApiError(error)
  }

  if (!data.session) {
    throw createError('refresh_failed', '刷新会话失败：未返回会话信息')
  }

  return toAuthSession(data.session)
}

/**
 * 匿名登录
 * @returns AuthSession
 */
export async function signInAnonymously(): Promise<AuthSession> {
  const { data, error } = await supabase.auth.signInAnonymously()

  if (error) {
    throwApiError(error)
  }

  if (!data.session) {
    throw createError('anonymous_login_failed', '匿名登录失败：未返回会话信息')
  }

  return toAuthSession(data.session)
}

/**
 * 退出登录
 * @param accessToken - 访问令牌
 */
export async function signOut(accessToken: string): Promise<void> {
  const authedClient = createAuthedClient(accessToken)
  const { error } = await authedClient.auth.signOut()

  if (error) {
    throwApiError(error)
  }
}

/**
 * 获取当前用户
 * @param accessToken - 访问令牌
 * @returns AuthUser
 */
export async function getCurrentUser(accessToken: string): Promise<AuthUser> {
  const { data, error } = await supabase.auth.getUser(accessToken)

  if (error) {
    throwApiError(error)
  }

  if (!data.user) {
    throw createError('user_not_found', '未找到当前用户')
  }

  return toAuthUser(data.user)
}
