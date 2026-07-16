import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/fintrack-logo.png'
import { Eye, EyeOff } from 'lucide-react'
import GoogleSignInButton from '../components/GoogleSignInButton'

export default function Login() {
  const { signIn, signInWithGoogle, loading, error } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ok = await signIn(email, password)
    if (ok) navigate('/')
  }

  const handleGoogleCredential = async (idToken) => {
    const ok = await signInWithGoogle(idToken)
    if (ok) navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img
            src={logo}
            style={{ width: '200px', height: 'auto' }}
            alt="FinTrack Logo"
            className="w-24 h-24 mx-auto mb-4"
          />

          <h1 className="font-display text-4xl text-pine-dark tracking-tight">
            FinTrack
          </h1>

          <p className="text-ink/50 text-sm mt-1 font-mono">
            Personal Financial Tracker
          </p>
        </div>

        <form onSubmit={handleSubmit} className="ledger-card p-7 space-y-5">
          <h2 className="text-xl font-semibold text-center mb-1">Welcome back</h2>

          {error && (
            <p className="text-sm text-rust bg-rust/10 border border-rust/20 rounded-md px-3 py-2">
              {String(error)}
            </p>
          )}

          <div>
            <label className="label-field" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="label-field" htmlFor="password">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pr-10"
                placeholder="••••••••"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-ink/50 hover:text-ink"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          <div className="flex items-center gap-3 py-1">
            <div className="h-px flex-1 bg-pine/15" />
            <span className="text-xs text-ink/40">or</span>
            <div className="h-px flex-1 bg-pine/15" />
          </div>

          <GoogleSignInButton onCredential={handleGoogleCredential} />

          <p className="text-center text-sm text-ink/60">
            New to FinTrack?{' '}
            <Link to="/register" className="text-pine-dark font-medium hover:underline">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
