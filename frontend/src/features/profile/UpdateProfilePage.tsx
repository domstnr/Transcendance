import { useState, type FormEvent, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { updateCurrentUser, uploadAvatar } from './profileService.ts'
import type { UpdateProfileRequest } from './types'
import { changePassword } from '../auth/authService'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

function UpdateProfilePage() {
    const { user, refreshUser } = useAuth()
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [profileError, setProfileError] = useState<string | null>(null)
    const [profileMessage, setProfileMessage] = useState<string | null>(null)
    const [isProfileSubmitting, setIsProfileSubmitting] = useState(false)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmNewPassword, setConfirmNewPassword] = useState('')
    const [passwordError, setPasswordError] = useState<string | null>(null)
    const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
    const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false)
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [avatarError, setAvatarError] = useState<string | null>(null)
    const [avatarMessage, setAvatarMessage] = useState<string | null>(null)
    const [isAvatarSubmitting, setIsAvatarSubmitting] = useState(false)

    if (!user) {
        return <p>Loading profile...</p>
    }

    async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setProfileError(null)
        setProfileMessage(null)

        const trimmedUsername = username.trim()

        if (!trimmedUsername) {
            setProfileError('Provide a username to update.')
            return
        }

        try {
            setIsProfileSubmitting(true)
            const updateData: UpdateProfileRequest = {
                username: trimmedUsername,
            }
            const response = await updateCurrentUser(updateData)
            setProfileMessage(response.message)
            await refreshUser()
            console.log('update profile response', response)
        } catch (error) {
            console.log('update profile error', error)
            setProfileError(error instanceof Error ? error.message : 'error: update request failed.')
        } finally {
            setIsProfileSubmitting(false)
        }
    }

    async function handleAvatarSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setAvatarError(null)
        setAvatarMessage(null)
        if (!avatarFile) {
            setAvatarError('Select an image file first.')
            return
        }
        try {
            setIsAvatarSubmitting(true)
            const response = await uploadAvatar(avatarFile)
            setAvatarMessage(response.message)
            setAvatarFile(null)
            await refreshUser()
        } catch (error) {
            setAvatarError(error instanceof Error ? error.message : 'Upload failed.')
        } finally {
            setIsAvatarSubmitting(false)
        }
    }

    async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setPasswordError(null)
        setPasswordMessage(null)

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            setPasswordError('Please fill all password fields.')
            return
        }

        if (newPassword !== confirmNewPassword) {
            setPasswordError('New password confirmation does not match.')
            return
        }

        try {
            setIsPasswordSubmitting(true)
            const response = await changePassword({
                currentPassword,
                newPassword,
            })
            setPasswordMessage(response.message)
            window.dispatchEvent(new Event('auth:logout'))
            navigate('/login', { replace: true })
        } catch (error) {
            console.log('change password error', error)
            setPasswordError(error instanceof Error ? error.message : 'Password update failed.')
        } finally {
            setIsPasswordSubmitting(false)
        }
    }

    return (
      <div id="wrapper" className="profile-page">
        <div id="principal">
          <h1 id="heading">Update profile</h1>

          <form className="form" onSubmit={handleAvatarSubmit} noValidate>
            <div className="field">
              <h2>Avatar</h2>
              {user.avatarUrl ? (
                <img
                  className="profile-avatar profile-avatar-small"
                  src={`${API_URL}${user.avatarUrl}`}
                  alt="Current avatar"
                />
              ) : (
                <div className="profile-avatar-placeholder">
                  {user.username[0].toUpperCase()}
                </div>
              )}

              <label htmlFor="avatar-file" className="file-input-label">
                Choose file
                <input
                  id="avatar-file"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setAvatarFile(e.target.files?.[0] ?? null)}
                />
              </label>
              {avatarFile ? <div className="file-name">{avatarFile.name}</div> : null}
              {avatarError ? <div className="text-error">{avatarError}</div> : null}
              {avatarMessage ? <div className="text-success">{avatarMessage}</div> : null}
              <button type="submit" className="button" disabled={isAvatarSubmitting}>
                {isAvatarSubmitting ? 'uploading...' : 'upload avatar'}
              </button>
            </div>
          </form>

          <form className="form" onSubmit={handleProfileSubmit} noValidate>
            <div className="field">
              <h2>Profile</h2>
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                placeholder="Username"
              />
              {profileError ? <div className="text-error">{profileError}</div> : null}
              {profileMessage ? <div className="text-success">{profileMessage}</div> : null}
              <button type="submit" className="button" disabled={isProfileSubmitting}>
                {isProfileSubmitting ? 'updating...' : 'update'}
              </button>
            </div>
          </form>

          <form className="form" onSubmit={handlePasswordSubmit} noValidate>
            <div className="field">
              <h2>Change password</h2>
              <label htmlFor="currentPassword">Current password</label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="Current password"
              />

              <label htmlFor="newPassword">New password</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
                placeholder="New password"
              />

              <label htmlFor="confirmNewPassword">Confirm new password</label>
              <input
                id="confirmNewPassword"
                type="password"
                value={confirmNewPassword}
                onChange={(event) => setConfirmNewPassword(event.target.value)}
                autoComplete="new-password"
                placeholder="Confirm new password"
              />

              {passwordError ? <div className="text-error">{passwordError}</div> : null}
              {passwordMessage ? <div className="text-success">{passwordMessage}</div> : null}
              <button type="submit" className="button" disabled={isPasswordSubmitting}>
                {isPasswordSubmitting ? 'updating...' : 'change password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
}
export default UpdateProfilePage
