import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import api from '../api/client'
import E from '../api/endpoints'

const AuthContext = createContext(null)

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'))
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser)
  const [loading, setLoading] = useState(!!localStorage.getItem('token'))

  const persist = (u) => {
    setUser(u)
    if (u) localStorage.setItem('user', JSON.stringify(u))
    else localStorage.removeItem('user')
  }

  const login = async (email, password) => {
    const { data } = await api.post(E.login, { email, password })
    const token = data.token
    const u = data.user || data
    localStorage.setItem('token', token)
    persist(u)
    return u
  }

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    persist(null)
  }, [])

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get(E.me)
      persist(data.user || data)
    } catch {
      logout()
    } finally {
      setLoading(false)
    }
  }, [logout])

  useEffect(() => {
    if (localStorage.getItem('token')) refresh()
    else setLoading(false)
  }, [refresh])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
