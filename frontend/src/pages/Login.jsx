import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../AuthContext'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const registered = location.state?.registered

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const data = await api('/api/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      })
      login(data.access_token)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message || '登录失败')
    }
  }

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <h1 className="auth-title">登录</h1>
        {registered ? <div className="status">注册成功，请登录</div> : null}
        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field__label">用户名</span>
            <input
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              minLength={2}
            />
          </label>
          <label className="field">
            <span className="field__label">密码</span>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              minLength={6}
            />
          </label>
          {error ? <div className="error">{error}</div> : null}
          <button type="submit" className="btn btn--primary btn--block">
            登录
          </button>
        </form>
        <p className="auth-footer">
          没有账号？<Link to="/register">去注册</Link>
        </p>
      </div>
    </div>
  )
}
