import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import type { ApiError } from '@/api'
import './index.scss'

/**
 * Login page component
 * Supports email/password login, registration, and guest login
 */
export default function Login() {
  const navigate = useNavigate()
  const { login, register, guestLogin } = useAuthStore()
  
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  /**
   * Get error message from ApiError object
   */
  const getErrorMessage = (err: unknown): string => {
    if (err && typeof err === 'object') {
      if ('message' in err) {
        return String((err as ApiError).message)
      }
    }
    if (err instanceof Error) {
      return err.message
    }
    return String(err) || 'Unknown error'
  }

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (isLogin) {
        await login(email, password)
        navigate('/')
      } else {
        await register(email, password)
        setSuccess('Registration successful, please login')
        setIsLogin(true)
        setPassword('')
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  /**
   * Handle guest login
   */
  const handleGuestLogin = async () => {
    setError('')
    setSuccess('')
    setLoading(true)
    
    try {
      await guestLogin()
      navigate('/')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  /**
   * Toggle login/register mode
   */
  const toggleMode = () => {
    setIsLogin(!isLogin)
    setError('')
    setSuccess('')
    setEmail('')
    setPassword('')
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Task Board</h1>
          <p>{isLogin ? 'Login to your account' : 'Create new account'}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              minLength={6}
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        <div className="login-footer">
          <button
            type="button"
            className="btn-link"
            onClick={toggleMode}
            disabled={loading}
          >
            {isLogin ? 'No account? Register now' : 'Already have an account? Login'}
          </button>

          <div className="divider">
            <span>OR</span>
          </div>

          <button
            type="button"
            className="btn-guest"
            onClick={handleGuestLogin}
            disabled={loading}
          >
            Guest Login
          </button>
        </div>
      </div>
    </div>
  )
}
