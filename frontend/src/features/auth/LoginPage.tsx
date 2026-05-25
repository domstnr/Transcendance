import { useState, type FormEvent } from 'react'
import type { LoginRequest } from './types'
import { login } from './authService'
import { useAuth } from './AuthContext'

function LoginPage() {
    const auth = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError(null)
        setMessage(null)

        const trimmedEmail = email.trim()

        if (!trimmedEmail) {
            setError('Email is required.')
            return
        }

        if (!trimmedEmail.includes('@')) {
            setError('Enter a valid email address.')
            return
        }

        if (!password) {
            setError('Password is required.')
            return
        }

        try {
            setIsSubmitting(true)
            const credentials: LoginRequest = { email: trimmedEmail, password }
            const response = await login(credentials)
            auth.login(response.user)
            setMessage(response.message)
            console.log('login response', response)
        } catch (error) {
            console.log('login error', error)
            setError(error instanceof Error ? error.message : 'error: login request failed.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
      <div>
        <h1>Login</h1>

        <form onSubmit={handleSubmit} noValidate>
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

  export default LoginPage
