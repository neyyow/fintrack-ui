import React, { createContext, useContext, useState, useCallback } from 'react'
import * as authApi from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('fintrack_user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const signIn = useCallback(async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const data = await authApi.login(email, password)
      const nextUser = { userId: data.UserId ?? data.userId, email: data.Email ?? data.email }
      localStorage.setItem('fintrack_token', data.Token ?? data.token)
      localStorage.setItem('fintrack_user', JSON.stringify(nextUser))
      setUser(nextUser)
      return true
    } catch (err) {
      setError(err.response?.data ?? 'Invalid email or password')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const signUp = useCallback(async (username, email, password) => {
    setLoading(true)
    setError(null)
    try {
      await authApi.register(username, email, password)
      return true
    } catch (err) {
      setError(err.response?.data ?? 'Could not create your account')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const signOut = useCallback(() => {
    localStorage.removeItem('fintrack_token')
    localStorage.removeItem('fintrack_user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signUp, signOut, setError }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
