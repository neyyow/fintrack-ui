import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/fintrack-logo.png'
import { Eye, EyeOff } from 'lucide-react'

export default function Register() {
  const { signUp, loading, error } = useAuth()
  const navigate = useNavigate()
const [username, setUsername] = useState('')
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [confirmPassword, setConfirmPassword] = useState('')
const [showPassword, setShowPassword] = useState(false)
const [showConfirmPassword, setShowConfirmPassword] = useState(false)
const [done, setDone] = useState(false)
const [passwordError, setPasswordError] = useState('')

  const handleSubmit = async (e) => {
  e.preventDefault()

  setPasswordError('')

  if (password !== confirmPassword) {
    setPasswordError('Passwords do not match.')
    return
  }

  const ok = await signUp(username, email, password)

  if (ok) {
    setDone(true)
    setTimeout(() => navigate('/login'), 1200)
  }
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
          <h2 className="text-xl font-semibold text-center mb-1">Open a ledger</h2>

          {error && (
            <p className="text-sm text-rust bg-rust/10 border border-rust/20 rounded-md px-3 py-2">
              {String(error)}
            </p>
          )}
          {passwordError && (
            <p className="text-sm text-rust bg-rust/10 border border-rust/20 rounded-md px-3 py-2">
              {passwordError}
            </p>
          )}
          {done && (
            <p className="text-sm text-pine-dark bg-pine/10 border border-pine/20 rounded-md px-3 py-2">
              Account created — taking you to sign in…
            </p>
          )}

          <div>
            <label className="label-field" htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              placeholder="juandelacruz"
            />
          </div>

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
                minLength={6}
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

          <div>
            <label className="label-field" htmlFor="confirmPassword">
              Confirm Password
            </label>

            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field pr-10"
                placeholder="••••••••"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-ink/50 hover:text-ink"
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? 'Creating account…' : 'Create account'}
          </button>

          <p className="text-center text-sm text-ink/60">
            Already have an account?{' '}
            <Link to="/login" className="text-pine-dark font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
