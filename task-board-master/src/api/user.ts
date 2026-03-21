import { supabase } from '../../api/src/config'
import type { User } from '@/types'

/**
 * 获取当前用户信息（包含isAnonymous字段）
 * 通过调用Supabase的getUser接口获取is_anonymous字段
 * @param accessToken - 访问令牌
 * @returns User | null
 */
export async function getCurrentUserWithAnonymous(accessToken: string): Promise<User | null> {
  const { data, error } = await supabase.auth.getUser(accessToken)

  if (error || !data.user) {
    return null
  }

  return {
    id: data.user.id,
    email: data.user.email ?? null,
    isAnonymous: data.user.is_anonymous ?? false,
  }
}
