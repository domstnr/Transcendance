import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
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
      <div id="wrapper"> {/* shared wrapper avec login */}
        <div id="principal"> {/* shared carte blanche */}
          <h1 id="heading">Register</h1> {/* shared titre */}

          <form id="form" onSubmit={handleSubmit} noValidate>
            <div id="inputdiv" className="field"> {/* shared conteneur de champs */}
              <div className="field"> {/* email/username wrapper */}
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  className="form-control"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                  placeholder="Choose a username"
                />
              </div>

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
                  autoComplete="new-password"
                  placeholder="Choose a password"
                />
              </div>

              {error ? <div id="error-2" className="alert alert-danger" role="alert">{error}</div> : null}
              {message ? <div id="message-2" className="alert alert-success" role="alert">{message}</div> : null}

              <button id="button" type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Création...' : 'Register'}
              </button>
            </div>
          </form>

          <p id="padding">
            <span>Already have an account?</span>{' '}
            <Link to="/login" id="link">Login</Link>
          </p>
        </div>
      </div>
    )
}

export default RegisterPage
