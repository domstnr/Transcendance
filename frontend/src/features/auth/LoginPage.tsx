import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
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

    function handleGitHubLogin() {
        const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID
        const redirectUri = import.meta.env.VITE_GITHUB_CALLBACK
        const scope = 'read:user user:email'
        const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`
        window.location.href = githubAuthUrl
    }

    return (
      <div id="wrapper">
        <div id="principal">
          <h1 id="heading">Login</h1>

          <form id="form" onSubmit={handleSubmit} noValidate>
            <div id="inputdiv" className="field">
              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  placeholder="Enter your email"
                />
              </div>

              <div className="field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                />
              </div>

              {error ? (
                <div id="error-2" className="alert alert-danger" role="alert">
                  {error}
                </div>
              ) : null}
              {message ? (
                <div id="message-2" className="alert alert-success" role="alert">
                  {message}
                </div>
              ) : null}

            <button id="button" type="button" onClick={handleGitHubLogin}>Login with GitHub</button>
              <button
                id="button"
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing in...' : 'Login'}
              </button>
            </div>
          </form>

          <p id="padding">
            <span>Don&apos;t have an account ?</span>{' '}
            <Link to="/register" id="link">
              Register
            </Link>
          </p>
        </div>
      </div>
    )
}

export default LoginPage
