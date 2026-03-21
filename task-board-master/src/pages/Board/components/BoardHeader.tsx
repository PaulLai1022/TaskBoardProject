import { useAuthStore } from '@/store/authStore'

/**
 * 看板头部组件
 * 包含标题和用户信息
 */
export default function BoardHeader() {
  const { user, isGuest, logout } = useAuthStore()

  return (
    <div className="board-header">
      <div className="board-header-left">
        <h1 className="board-title">任务看板</h1>
      </div>

      <div className="board-header-right">
        <div className="user-info">
          <span className="user-name">
            {isGuest ? '游客' : user?.email}
          </span>
          {!isGuest && (
            <button className="btn-logout" onClick={logout}>
              登出
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
