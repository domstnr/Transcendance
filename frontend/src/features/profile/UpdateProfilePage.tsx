import { useState, type FormEvent } from 'react'
import { useAuth } from '../auth/AuthContext'
import { updateCurrentUser } from './profileService.ts'
import type { UpdateProfileRequest } from './types'

function UpdateProfilePage() {
    const { user } = useAuth()
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    if (!user) {
        return <p>Loading profile...</p>
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError(null)
        setMessage(null)

        const trimmedUsername = username.trim()
        const trimmedEmail = email.trim()

        if (!trimmedUsername && !trimmedEmail) {
            setError('Provide at least one field to update.')
            return
        }

        if (trimmedEmail && !trimmedEmail.includes('@')) {
            setError('Enter a valid email address.')
            return
        }

        try {
            setIsSubmitting(true)
            const updateData: UpdateProfileRequest = {
                ...(trimmedUsername ? { username: trimmedUsername } : {}),
                ...(trimmedEmail ? { email: trimmedEmail } : {}),
            }
            const response = await updateCurrentUser(updateData)
            setMessage(response.message)
            console.log('update profile response', response)
        } catch (error) {
            console.log('update profile error', error)
            setError('update request failed. Check the console and network tab for details.')
        } finally {
            setIsSubmitting(false)
        }
    }
    return (
        <section>
        <h1>Update profile</h1>
        <form onSubmit={handleSubmit} noValidate>
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

          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
          </div>

          {error ? <p>{error}</p> : null}
          {message ? <p>{message}</p> : null}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'updating...' : 'update'}
          </button>
        </form>
        </section>
    )
}
export default UpdateProfilePage
