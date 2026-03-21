/**
 * 任务状态枚举
 */
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'inprogress',
  IN_REVIEW = 'inreview',
  DONE = 'done',
}

/**
 * 任务优先级枚举
 */
export enum TaskPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
}

/**
 * 任务接口
 */
export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  dueDate: string | null
  tag: string
  userId: string
  createdAt: number
}

/**
 * 看板列配置
 */
export interface BoardColumn {
  id: TaskStatus
  title: string
  color: string
}

/**
 * 筛选条件接口
 */
export interface FilterCriteria {
  search: string
  status: TaskStatus | null
  priority: TaskPriority | null
  tag: string | null
}

/**
 * 用户接口
 */
export interface User {
  id: string
  email: string | null
  isAnonymous: boolean
}

/**
 * 认证会话接口
 */
export interface AuthSession {
  accessToken: string
  refreshToken: string
  userId: string
  email: string | null
}

/**
 * 认证状态接口
 */
export interface AuthState {
  user: User | null
  session: AuthSession | null
  isAuthenticated: boolean
  isGuest: boolean
}

/**
 * 看板统计数据
 */
export interface BoardStats {
  total: number
  todo: number
  inProgress: number
  inReview: number
  done: number
  overdue: number
}

/**
 * 创建任务输入接口
 */
export interface CreateTaskInput {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: string
  tag?: string
}

/**
 * 更新任务输入接口
 */
export interface UpdateTaskInput {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: string | null
  tag?: string
}
