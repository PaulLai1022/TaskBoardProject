import { Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import './index.scss'

/**
 * Layout component
 * Contains header and child route outlet
 * @returns JSX.Element
 */
export default function Layout() {
  const { user, isGuest, logout } = useAuthStore()

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="header-left">
          <h1 className="header-title">Task Board</h1>
        </div>
        <div className="header-right">
          <div className="user-info">
            <span className="user-name">
              {isGuest ? 'Guest' : user?.email}
            </span>
            <button className="btn-logout" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
