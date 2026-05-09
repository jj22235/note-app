import { createContext, useContext, useMemo, useState, useEffect } from 'react'
import { getToken, saveToken } from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getToken())

  useEffect(() => {
    saveToken(token)
  }, [token])

  const login = (t) => setToken(t)
  const logout = () => setToken(null)

  const value = useMemo(
    () => ({
      token,
      login,
      logout,
      isAuthenticated: Boolean(token),
    }),
    [token],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth 必须在 AuthProvider 内使用')
  return ctx
}
