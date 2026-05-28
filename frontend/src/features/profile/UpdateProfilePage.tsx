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
        <section>
        <h1>Update profile</h1>

        <h2>Avatar</h2>
        {user.avatarUrl && (
            <img
                src={`${API_URL}${user.avatarUrl}`}
                alt="Current avatar"
                style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', display: 'inline-block', marginBottom: 8 }}
            />
        )}
        <form onSubmit={handleAvatarSubmit} noValidate>
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={(e: ChangeEvent<HTMLInputElement>) => setAvatarFile(e.target.files?.[0] ?? null)}
          />
          {avatarError ? <p style={{ color: 'red' }}>{avatarError}</p> : null}
          {avatarMessage ? <p style={{ color: 'green' }}>{avatarMessage}</p> : null}
          <button type="submit" disabled={isAvatarSubmitting}>
            {isAvatarSubmitting ? 'uploading...' : 'upload avatar'}
          </button>
        </form>
        <form onSubmit={handleProfileSubmit} noValidate>
          <div>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
            />
          </div>

          {profileError ? <p>{profileError}</p> : null}
          {profileMessage ? <p>{profileMessage}</p> : null}

          <button type="submit" disabled={isProfileSubmitting}>
            {isProfileSubmitting ? 'updating...' : 'update'}
          </button>
        </form>

        <h2>Change password</h2>
        <form onSubmit={handlePasswordSubmit} noValidate>
          <div>
            <label htmlFor="currentPassword">Current password</label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              autoComplete="current-password"
            />
          </div>

          <div>
            <label htmlFor="newPassword">New password</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
            />
          </div>

          <div>
            <label htmlFor="confirmNewPassword">Confirm new password</label>
            <input
              id="confirmNewPassword"
              type="password"
              value={confirmNewPassword}
              onChange={(event) => setConfirmNewPassword(event.target.value)}
              autoComplete="new-password"
            />
          </div>

          {passwordError ? <p>{passwordError}</p> : null}
          {passwordMessage ? <p>{passwordMessage}</p> : null}

          <button type="submit" disabled={isPasswordSubmitting}>
            {isPasswordSubmitting ? 'updating...' : 'change password'}
          </button>
        </form>
        </section>
    )
}
export default UpdateProfilePage
