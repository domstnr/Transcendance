import { Link } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'

  function Header() {
    const { isAuthenticated, logout } = useAuth()

    return (
      <header>
        { isAuthenticated ? (
            <button type="button" onClick={logout}>Logout</button>
        ) : (
            <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            </>
        )}
      </header>
    )
  }
  export default Header

