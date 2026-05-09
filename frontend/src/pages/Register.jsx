import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'

export default function Register() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await api('/api/register', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      })
      navigate('/login', { replace: true, state: { registered: true } })
    } catch (err) {
      setError(err.message || '注册失败')
    }
  }

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <h1 className="auth-title">注册</h1>
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
              maxLength={50}
            />
          </label>
          <label className="field">
            <span className="field__label">密码（至少 6 位）</span>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              minLength={6}
              maxLength={128}
            />
          </label>
          {error ? <div className="error">{error}</div> : null}
          <button type="submit" className="btn btn--primary btn--block">
            注册
          </button>
        </form>
        <p className="auth-footer">
          已有账号？<Link to="/login">去登录</Link>
        </p>
      </div>
    </div>
  )
}
