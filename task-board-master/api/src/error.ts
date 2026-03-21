/**
 * API错误结构
 */
export interface ApiError {
  code: string
  message: string
}

/**
 * 创建标准化的API错误
 * @param code - 错误代码
 * @param message - 错误消息
 * @returns ApiError
 */
export function createError(code: string, message: string): ApiError {
  return { code, message }
}

/**
 * 从Supabase错误或其他错误转换为标准API错误
 * @param error - 原始错误
 * @returns ApiError
 */
export function normalizeError(error: unknown): ApiError {
  if (error && typeof error === 'object') {
    // Supabase错误格式
    if ('code' in error && 'message' in error) {
      return {
        code: String((error as { code: unknown }).code),
        message: String((error as { message: unknown }).message),
      }
    }
    // 普通Error对象
    if (error instanceof Error) {
      return {
        code: 'unknown_error',
        message: error.message,
      }
    }
  }
  // 其他情况
  return {
    code: 'unknown_error',
    message: String(error) || '未知错误',
  }
}

/**
 * 抛出标准化的API错误
 * @param error - 原始错误
 */
export function throwApiError(error: unknown): never {
  throw normalizeError(error)
}
