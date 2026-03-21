# Supabase 接入

## 目录

- `src/config.ts`：Supabase 客户端初始化
- `src/auth.ts`：注册、登录、登出、获取当前用户
- `src/authClient.ts`：前端会话缓存与登录态恢复
- `src/tasks.ts`：任务增删改查与状态流转
- `src/types.ts`：认证与任务类型定义
- `sql/001_init_tasks.sql`：任务表与 RLS 策略初始化

## 安装

```bash
cd api
npm install
```

## 配置环境变量

填写 `.env`

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## 执行 SQL 初始化

在 Supabase SQL Editor 执行 `sql/001_init_tasks.sql`。

`tasks` 表字段：

- `id uuid primary key`
- `title text not null`
- `status text`：`todo | inprogress | inreview | done`
- `user_id uuid`：自动绑定当前会话用户
- `created_at timestamptz`：自动写入
- `description text`
- `priority text`：`low | normal | high`
- `due_date date`
- `tag text not null default 'normal'`

## 认证接口

- `register({ email, password })`
- `signUp({ email, password })`
- `signIn({ email, password })`
- `signInAnonymously()`
- `refreshAuthSession(refreshToken)`
- `signOut(accessToken)`
- `getCurrentUser(accessToken)`

## 前端会话接口

- `registerWithEmail({ email, password })`
- `loginWithEmail({ email, password })`
- `loginAnonymously()`
- `logoutCurrentSession()`
- `restoreCurrentUser()`

## 任务接口

- `getTasks(accessToken, { titleLike, status, statuses, tag })`
- `getTaskById(accessToken, id)`
- `createTask(accessToken, { title, description, status, priority, dueDate, tag })`
- `updateTask(accessToken, id, updates)`
- `deleteTask(accessToken, id)`
- `moveTaskStatus(accessToken, id, status)`

## 示例

```ts
import {
  signIn,
  getTasks,
  createTask,
  moveTaskStatus,
  TaskStatus,
} from './src'

const session = await signIn({
  email: 'demo@example.com',
  password: 'your-password',
})

const list = await getTasks(session.accessToken, {
  titleLike: 'Supabase',
  statuses: [TaskStatus.TODO, TaskStatus.IN_REVIEW],
  tag: 'normal',
})

await createTask(session.accessToken, {
  title: '接入 Supabase',
  description: '完成任务存储和认证',
})

await moveTaskStatus(session.accessToken, list[0].id, TaskStatus.IN_PROGRESS)
```
