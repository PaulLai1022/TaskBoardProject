# 前端 CRUD 使用指南（Supabase）

本文档用于指导前端如何调用 `api/src` 中已封装好的认证与任务 CRUD 函数。

## 1. 可用函数

从以下入口导出：

- `api/src/index.ts`

认证函数：

- `register({ email, password })`
- `signUp({ email, password })`
- `signIn({ email, password })`
- `signInAnonymously()`
- `refreshAuthSession(refreshToken)`
- `signOut(accessToken)`
- `getCurrentUser(accessToken)`

前端会话函数：

- `registerWithEmail({ email, password })`
- `loginWithEmail({ email, password })`
- `loginAnonymously()`
- `logoutCurrentSession()`
- `restoreCurrentUser()`
- `getStoredSession()`
- `saveSession(session)`
- `clearSession()`

任务函数：

- `getTasks(accessToken, { titleLike, status, statuses, tag })`
- `getTaskById(accessToken, id)`
- `createTask(accessToken, input)`
- `updateTask(accessToken, id, updates)`
- `deleteTask(accessToken, id)`
- `moveTaskStatus(accessToken, id, status)`

## 2. 数据字段说明

`tasks` 表核心字段：

- `id: uuid`
- `title: string`（必填）
- `status: 'todo' | 'inprogress' | 'inreview' | 'done'`
- `user_id: uuid`（自动绑定当前会话用户）
- `created_at: timestamp`（自动写入）
- `description: string | null`
- `priority: 'low' | 'normal' | 'high'`
- `due_date: string | null`（`YYYY-MM-DD`）
- `tag: string`（默认 `normal`）

## 3. 推荐调用流程

1. 注册：`registerWithEmail`（或匿名登录：`loginAnonymously`）
2. 登录：`loginWithEmail`，函数会自动缓存会话
3. 刷新页面后调用 `restoreCurrentUser` 恢复登录状态
4. 所有任务 CRUD 都传入 `getStoredSession()?.accessToken`

## 4. 前端示例

```ts
import {
  registerWithEmail,
  loginWithEmail,
  restoreCurrentUser,
  logoutCurrentSession,
  getStoredSession,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  moveTaskStatus,
  TaskStatus,
  TaskPriority,
} from '../api/src'

async function demoCrudFlow() {
  await registerWithEmail({
    email: 'demo@example.com',
    password: 'Demo123456',
  })

  await loginWithEmail({
    email: 'demo@example.com',
    password: 'Demo123456',
  })

  const currentUser = await restoreCurrentUser()
  if (!currentUser) {
    throw new Error('登录状态恢复失败')
  }

  const token = getStoredSession()?.accessToken
  if (!token) {
    throw new Error('缺少 accessToken')
  }

  const created = await createTask(token, {
    title: '联调前端 CRUD',
    description: '验证任务新增',
    status: TaskStatus.TODO,
    priority: TaskPriority.NORMAL,
    dueDate: '2026-03-31',
    tag: 'normal',
  })

  const list = await getTasks(token, {
    titleLike: 'CRUD',
    statuses: [TaskStatus.TODO, TaskStatus.IN_REVIEW],
    tag: 'normal',
  })

  const updated = await updateTask(token, created.id, {
    status: TaskStatus.IN_REVIEW,
    priority: TaskPriority.HIGH,
  })

  await moveTaskStatus(token, updated.id, TaskStatus.DONE)

  await deleteTask(token, updated.id)

  await logoutCurrentSession()

  return list
}
```

## 5. 常见问题

- 401/鉴权失败：确认 token 是否来自当前会话，且未过期
- 注册后无法直接登录：可能开启了邮箱验证，先去邮箱完成确认
- 查询不到数据：RLS 只允许读取当前用户自己的任务
- 插入失败：确认 `title` 必填，`status/priority` 取值合法
