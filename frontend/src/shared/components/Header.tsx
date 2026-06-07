import { NavLink } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'
import logo from '../../assets/transauction2.svg'

function Header() {
    const { isAuthenticated, logout, user } = useAuth()

    if (!isAuthenticated) {
        return null
    }

    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        isActive ? 'app-header-link app-header-link--active' : 'app-header-link'

    return (
        <header className="app-header">
            <div className="app-header-inner">
                <NavLink to="/" className="app-header-brand" aria-label="Transcendance home">
                    <img className="app-header-logo" src={logo} alt="Transauction" />
                </NavLink>

                <nav className="app-header-nav" aria-label="Primary navigation">
                    <NavLink to="/" className={navLinkClass} end>
                        Home
                    </NavLink>
                    <NavLink to="/profile" className={navLinkClass}>
                        Profile
                    </NavLink>
                    <NavLink to="/friends" className={navLinkClass}>
                        Friends
                    </NavLink>
                </nav>

                <div className="app-header-actions">
                    {user ? <span className="app-header-user">{user.username}</span> : null}
                    <button type="button" className="app-header-logout" onClick={() => void logout()}>
                        Logout
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Header
