export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'inprogress',
  IN_REVIEW = 'inreview',
  DONE = 'done',
}

export enum TaskPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
}

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

export interface TaskRow {
  id: string
  user_id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  tag: string
  created_at: string
  updated_at: string
}

export interface AuthSession {
  accessToken: string
  refreshToken: string
  userId: string
  email: string | null
}

export interface AuthUser {
  id: string
  email: string | null
}

export interface SignUpInput {
  email: string
  password: string
}

export interface SignInInput {
  email: string
  password: string
}

export interface SignUpResult {
  user: AuthUser
  session: AuthSession | null
  emailConfirmationSent: boolean
}

export interface CreateTaskInput {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: string
  tag?: string
}

export interface UpdateTaskInput {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: string | null
  tag?: string
}

export interface TaskQueryInput {
  titleLike?: string
  status?: TaskStatus
  statuses?: TaskStatus[]
  tag?: string
}
