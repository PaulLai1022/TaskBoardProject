import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('缺少环境变量 VITE_SUPABASE_URL')
}

if (!supabaseAnonKey) {
  throw new Error('缺少环境变量 VITE_SUPABASE_ANON_KEY')
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey)

/**
 * 创建带认证的Supabase客户端
 * @param accessToken - 用户访问令牌
 * @returns SupabaseClient
 */
export function createAuthedClient(accessToken: string): SupabaseClient {
  return createClient(supabaseUrl as string, supabaseAnonKey as string, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  })
}
