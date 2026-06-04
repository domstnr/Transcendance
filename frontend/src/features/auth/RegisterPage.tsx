import { useState, type FormEvent } from 'react'
import { register } from './authService'
import type { RegisterRequest } from './types'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function RegisterPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError(null)
        setMessage(null)

        const trimmedEmail = email.trim()
        const trimmedUsername = username.trim()

        if (!trimmedUsername) {
            setError('Username is required.')
            return
        }

        if (!trimmedEmail) {
            setError('Email is required.')
            return
        }

        if (!EMAIL_PATTERN.test(trimmedEmail)) {
            setError('Enter a valid email address.')
            return
        }

        if (!password) {
            setError('Password is required.')
            return
        }

        try {
            setIsSubmitting(true)
            const credentials: RegisterRequest = {
                email: trimmedEmail,
                username: trimmedUsername,
                password,
            }
            const response = await register(credentials)
            setMessage(response.message)
        } catch (error) {
            setError(error instanceof Error ? error.message : 'error: register request failed.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
      <div>
        <h1>Register</h1>

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

          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error ? <p>{error}</p> : null}
          {message ? <p>{message}</p> : null}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    )
  }

  export default RegisterPage
