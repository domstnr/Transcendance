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

    return (
      <div id="wrapper"> {/* wrapper principal requis par le CSS GrapesJS */}
        <div id="principal"> {/* carte blanche centrale du formulaire */}
          <h1 id="heading">Login</h1> {/* titre stylé par le CSS GrapesJS */}

          <form id="form" onSubmit={handleSubmit} noValidate>
            <div id="inputdiv" className="field"> {/* conteneur de champs, utilisé par le CSS */}
              <div className="field"> {/* wrapper du champ email */}
                <label htmlFor="email">Email</label>
                <input
                  id="email" /* id attendu par le CSS exporté */
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  placeholder="Enter your email"
                />
              </div>

              <div className="field"> {/* wrapper du champ mot de passe */}
                <label htmlFor="password">Password</label>
                <input
                  id="password" /* id attendu par le CSS exporté */
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                />
              </div>

              {error ? <div id="error-2">{error}</div> : null} {/* message d'erreur stylé */}
              {message ? <div id="message-2">{message}</div> : null} {/* message de succès stylé */}

              <button id="button" type="submit" disabled={isSubmitting}> {/* bouton stylé */}
                {isSubmitting ? 'Signing in...' : 'Login'}
              </button>
            </div>
          </form>

          <p id="padding"> {/* pied de page du formulaire */}
            <span>Don't have an account ?</span>{' '}
            <Link to="/register" id="link">Register</Link> {/* lien stylé */}
          </p>
        </div>
      </div>
    )
}

export default LoginPage
