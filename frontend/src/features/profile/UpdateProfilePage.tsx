import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { updateCurrentUser } from './profileService.ts'
import type { UpdateProfileRequest } from './types'
import { changePassword } from '../auth/authService'

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
