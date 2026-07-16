import React, { useEffect, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import {
  getProfile,
  updateProfile,
  changePassword
} from '../api/auth'

export default function Settings() {
  const [originalUsername, setOriginalUsername] = useState('')
  const [originalEmail, setOriginalEmail] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      const data = await getProfile()
      setUsername(data.username)
      setEmail(data.email)
      setOriginalUsername(data.username)
      setOriginalEmail(data.email)
    } catch {
      setErrorMessage('Failed to load profile.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()

    setSaving(true)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      await updateProfile(username, email)
      setSuccessMessage('✔ Profile updated successfully!')
      setOriginalUsername(username)
      setOriginalEmail(email)
    } catch (err) {
      setErrorMessage(err.response?.data || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault()

    setPasswordSaving(true)
    setPasswordSuccess('')
    setPasswordError('')

    try {
      await changePassword(
        currentPassword,
        newPassword,
        confirmPassword
      )

      setPasswordSuccess('✔ Password changed successfully!')

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPasswordError(
      err.response?.data || 'Failed to change password.'
    )
    } finally {
      setPasswordSaving(false)
    }
  }

  if (loading) {
    return <p>Loading profile...</p>
  }
  
  const hasChanges =
  username !== originalUsername ||
  email !== originalEmail
  return (
    <div>
      <h1 className="text-3xl font-semibold mb-2">
        Settings
      </h1>

      <p className="text-ink/55 mb-8">
        Manage your profile and account settings.
      </p>

      <form
        onSubmit={handleSubmit}
        className="ledger-card p-6 space-y-5 max-w-xl"
      >
        <h2 className="text-xl font-semibold">
          Profile Information
        </h2>
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-full bg-pine-dark text-white flex items-center justify-center text-3xl font-bold shadow">
              {username ? username.charAt(0).toUpperCase() : "?"}
            </div>

            <h3 className="mt-4 text-lg font-semibold">
              {username}
            </h3>

            <p className="text-sm text-ink/60">
              {email}
            </p>
          </div>
        {successMessage && (
          <div className="rounded-md border border-green-300 bg-green-50 text-green-700 px-4 py-3">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="rounded-md border border-red-300 bg-red-50 text-red-700 px-4 py-3">
            {errorMessage}
          </div>
        )}

        <div>
          <label className="label-field">
            Username
          </label>

          <input
            className="input-field"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div>
          <label className="label-field">
            Email
          </label>

          <input
            type="email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button
            type="submit"
            disabled={saving || !hasChanges}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
      <form
        onSubmit={handlePasswordSubmit}
        className="ledger-card p-6 space-y-5 max-w-xl mt-8"
      >
        <h2 className="text-xl font-semibold">
          Change Password
        </h2>

        {passwordSuccess && (
          <div className="rounded-md border border-green-300 bg-green-50 text-green-700 px-4 py-3">
            {passwordSuccess}
          </div>
        )}

        {passwordError && (
          <div className="rounded-md border border-red-300 bg-red-50 text-red-700 px-4 py-3">
            {passwordError}
          </div>
        )}

        <div>
          <label className="label-field">
            Current Password
          </label>

         <div className="relative">
            <input
              type={showCurrentPassword ? "text" : "password"}
              className="input-field pr-10"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />

            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-ink/50 hover:text-ink"
            >
              {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="label-field">
            New Password
          </label>

          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              className="input-field pr-10"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-ink/50 hover:text-ink"
            >
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="label-field">
            Confirm New Password
          </label>

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="input-field pr-10"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-ink/50 hover:text-ink"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={passwordSaving}
          className="btn-primary"
        >
          {passwordSaving ? 'Changing Password...' : 'Change Password'}
        </button>
      </form>
    </div>
  )
}