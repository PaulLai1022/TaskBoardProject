import { createAuthedClient } from './config'
import { throwApiError } from './error'
import type {
  CreateTaskInput,
  Task,
  TaskQueryInput,
  TaskPriority,
  TaskRow,
  TaskStatus,
  UpdateTaskInput,
} from './types'

/**
 * 将数据库行转换为Task对象
 * @param row - 数据库行
 * @returns Task
 */
function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    dueDate: row.due_date,
    tag: row.tag,
    userId: row.user_id,
    createdAt: new Date(row.created_at).getTime(),
  }
}

/**
 * 获取任务列表
 * @param accessToken - 访问令牌
 * @param filters - 筛选条件
 * @returns Task[]
 */
export async function getTasks(
  accessToken: string,
  filters?: TaskQueryInput
): Promise<Task[]> {
  const authedClient = createAuthedClient(accessToken)
  let request = authedClient.from('tasks').select('*')

  const titleLike = filters?.titleLike?.trim()
  if (titleLike) {
    request = request.ilike('title', `%${titleLike}%`)
  }

  if (filters?.status) {
    request = request.eq('status', filters.status)
  }

  const statuses = filters?.statuses?.filter((item) => !!item) ?? []
  if (statuses.length > 0) {
    request = request.in('status', statuses)
  }

  const tag = filters?.tag?.trim()
  if (tag) {
    request = request.eq('tag', tag)
  }

  const { data, error } = await request.order('created_at', { ascending: false })

  if (error) {
    throwApiError(error)
  }

  return (data ?? []).map((row: TaskRow) => toTask(row))
}

/**
 * 获取单个任务
 * @param accessToken - 访问令牌
 * @param id - 任务ID
 * @returns Task
 */
export async function getTaskById(
  accessToken: string,
  id: string
): Promise<Task> {
  const authedClient = createAuthedClient(accessToken)
  const { data, error } = await authedClient
    .from('tasks')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throwApiError(error)
  }

  return toTask(data as TaskRow)
}

/**
 * 创建任务
 * @param accessToken - 访问令牌
 * @param input - 任务输入
 * @returns Task
 */
export async function createTask(
  accessToken: string,
  input: CreateTaskInput
): Promise<Task> {
  const authedClient = createAuthedClient(accessToken)
  const payload = {
    title: input.title,
    description: typeof input.description === 'undefined' ? null : input.description,
    status: input.status ?? 'todo',
    priority: input.priority ?? 'normal',
    due_date: input.dueDate ?? null,
    tag: input.tag ?? 'normal',
  }

  const { data, error } = await authedClient
    .from('tasks')
    .insert(payload)
    .select('*')
    .single()

  if (error) {
    throwApiError(error)
  }

  return toTask(data as TaskRow)
}

/**
 * 更新任务
 * @param accessToken - 访问令牌
 * @param id - 任务ID
 * @param updates - 更新内容
 * @returns Task
 */
export async function updateTask(
  accessToken: string,
  id: string,
  updates: UpdateTaskInput
): Promise<Task> {
  const authedClient = createAuthedClient(accessToken)
  const payload: Partial<{
    title: string
    description: string | null
    status: TaskStatus
    priority: TaskPriority
    due_date: string | null
    tag: string
  }> = {}

  if (typeof updates.title !== 'undefined') {
    payload.title = updates.title
  }

  if (typeof updates.description !== 'undefined') {
    payload.description = updates.description
  }

  if (typeof updates.status !== 'undefined') {
    payload.status = updates.status
  }

  if (typeof updates.priority !== 'undefined') {
    payload.priority = updates.priority
  }

  if (typeof updates.dueDate !== 'undefined') {
    payload.due_date = updates.dueDate
  }

  if (typeof updates.tag !== 'undefined') {
    payload.tag = updates.tag
  }

  const { data, error } = await authedClient
    .from('tasks')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    throwApiError(error)
  }

  return toTask(data as TaskRow)
}

/**
 * 删除任务
 * @param accessToken - 访问令牌
 * @param id - 任务ID
 */
export async function deleteTask(accessToken: string, id: string): Promise<void> {
  const authedClient = createAuthedClient(accessToken)
  const { error } = await authedClient.from('tasks').delete().eq('id', id)

  if (error) {
    throwApiError(error)
  }
}

/**
 * 移动任务状态
 * @param accessToken - 访问令牌
 * @param id - 任务ID
 * @param status - 新状态
 * @returns Task
 */
export async function moveTaskStatus(
  accessToken: string,
  id: string,
  status: TaskStatus
): Promise<Task> {
  return updateTask(accessToken, id, { status })
}
