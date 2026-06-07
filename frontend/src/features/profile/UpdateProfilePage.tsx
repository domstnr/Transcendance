import { useState, type FormEvent, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { disableTwoFactor, enableTwoFactor, setupTwoFactor, updateCurrentUser, uploadAvatar } from './profileService.ts'
import type { UpdateProfileRequest } from './types'
import { changePassword } from '../auth/authService'

const API_URL = import.meta.env.VITE_API_URL ?? ''

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
    const [twoFactorQrCode, setTwoFactorQrCode] = useState<string | null>(null)
    const [twoFactorCode, setTwoFactorCode] = useState('')
    const [twoFactorError, setTwoFactorError] = useState<string | null>(null)
    const [twoFactorMessage, setTwoFactorMessage] = useState<string | null>(null)
    const [isTwoFactorSubmitting, setIsTwoFactorSubmitting] = useState(false)

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

    async function handleTwoFactorSetup() {
        setTwoFactorError(null)
        setTwoFactorMessage(null)

        try {
            setIsTwoFactorSubmitting(true)
            const response = await setupTwoFactor()
            setTwoFactorQrCode(response.qrCodeDataUrl)
            setTwoFactorMessage('Scan the QR code, then enter the 6-digit code.')
        } catch (error) {
            setTwoFactorError(error instanceof Error ? error.message : '2FA setup failed.')
        } finally {
            setIsTwoFactorSubmitting(false)
        }
    }

    async function handleTwoFactorEnable(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setTwoFactorError(null)
        setTwoFactorMessage(null)

        const trimmedCode = twoFactorCode.trim()

        if (!/^\d{6}$/.test(trimmedCode)) {
            setTwoFactorError('Enter the 6-digit code from your authenticator app.')
            return
        }

        try {
            setIsTwoFactorSubmitting(true)
            const response = await enableTwoFactor(trimmedCode)
            setTwoFactorMessage(response.message)
            setTwoFactorQrCode(null)
            setTwoFactorCode('')
            await refreshUser()
        } catch (error) {
            setTwoFactorError(error instanceof Error ? error.message : '2FA activation failed.')
        } finally {
            setIsTwoFactorSubmitting(false)
        }
    }

    async function handleTwoFactorDisable() {
        const shouldDisable = window.confirm('Disable 2FA for your account?')

        if (!shouldDisable) {
            return
        }

        setTwoFactorError(null)
        setTwoFactorMessage(null)

        try {
            setIsTwoFactorSubmitting(true)
            const response = await disableTwoFactor()
            setTwoFactorQrCode(null)
            setTwoFactorCode('')
            setTwoFactorMessage(response.message)
            await refreshUser()
        } catch (error) {
            setTwoFactorError(error instanceof Error ? error.message : '2FA disable failed.')
        } finally {
            setIsTwoFactorSubmitting(false)
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
              {avatarError ? <div className="alert alert-danger text-error" role="alert">{avatarError}</div> : null}
              {avatarMessage ? <div className="alert alert-success text-success" role="alert">{avatarMessage}</div> : null}
              <button type="submit" className="btn btn-primary button" disabled={isAvatarSubmitting}>
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
                className="form-control"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                placeholder="Username"
              />
              {profileError ? <div className="alert alert-danger text-error" role="alert">{profileError}</div> : null}
              {profileMessage ? <div className="alert alert-success text-success" role="alert">{profileMessage}</div> : null}
              <button type="submit" className="btn btn-primary button" disabled={isProfileSubmitting}>
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
                className="form-control"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="Current password"
              />

              <label htmlFor="newPassword">New password</label>
              <input
                id="newPassword"
                type="password"
                className="form-control"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
                placeholder="New password"
              />

              <label htmlFor="confirmNewPassword">Confirm new password</label>
              <input
                id="confirmNewPassword"
                type="password"
                className="form-control"
                value={confirmNewPassword}
                onChange={(event) => setConfirmNewPassword(event.target.value)}
                autoComplete="new-password"
                placeholder="Confirm new password"
              />

              {passwordError ? <div className="alert alert-danger text-error" role="alert">{passwordError}</div> : null}
              {passwordMessage ? <div className="alert alert-success text-success" role="alert">{passwordMessage}</div> : null}
              <button type="submit" className="btn btn-primary button" disabled={isPasswordSubmitting}>
                {isPasswordSubmitting ? 'updating...' : 'change password'}
              </button>
            </div>
          </form>

          <form className="form" onSubmit={handleTwoFactorEnable} noValidate>
            <div className="field">
              <h2>Two-factor authentication</h2>

              {user.twoFactorEnabled ? (
                <>
                  <div className="alert alert-success text-success" role="alert">
                    2FA is enabled for your account.
                  </div>
                  <button
                    type="button"
                    className="btn item-button item-button--danger"
                    onClick={() => void handleTwoFactorDisable()}
                    disabled={isTwoFactorSubmitting}
                  >
                    {isTwoFactorSubmitting ? 'disabling...' : 'Disable 2FA'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn btn-primary button"
                    onClick={() => void handleTwoFactorSetup()}
                    disabled={isTwoFactorSubmitting}
                  >
                    {twoFactorQrCode ? 'Generate new QR code' : 'Setup 2FA'}
                  </button>

                  {twoFactorQrCode ? (
                    <>
                      <img className="two-factor-qr" src={twoFactorQrCode} alt="2FA QR code" />
                      <label htmlFor="twoFactorCode">Authenticator code</label>
                      <input
                        id="twoFactorCode"
                        type="text"
                        className="form-control"
                        value={twoFactorCode}
                        onChange={(event) => setTwoFactorCode(event.target.value)}
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="Enter 6-digit code"
                      />
                      <button type="submit" className="btn btn-primary button" disabled={isTwoFactorSubmitting}>
                        {isTwoFactorSubmitting ? 'confirming...' : 'Confirm 2FA'}
                      </button>
                    </>
                  ) : null}
                </>
              )}

              {twoFactorError ? <div className="alert alert-danger text-error" role="alert">{twoFactorError}</div> : null}
              {twoFactorMessage ? <div className="alert alert-success text-success" role="alert">{twoFactorMessage}</div> : null}
            </div>
          </form>
        </div>
      </div>
    )
}
export default UpdateProfilePage
