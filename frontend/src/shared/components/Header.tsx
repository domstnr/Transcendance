import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'
import logo from '../../assets/transauction2.svg'

function Header() {
    const { isAuthenticated, logout, user } = useAuth()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        function handleDocumentClick(event: MouseEvent) {
            if (!menuRef.current?.contains(event.target as Node)) {
                setIsMenuOpen(false)
            }
        }

        document.addEventListener('mousedown', handleDocumentClick)
        return () => document.removeEventListener('mousedown', handleDocumentClick)
    }, [])

    if (!isAuthenticated) {
        return null
    }

    const handleLogout = async () => {
        const shouldLogout = window.confirm('Do you really want to log out?')

        if (!shouldLogout) {
            return
        }

        await logout()
        setIsMenuOpen(false)
    }

    return (
        <header className="app-header">
            <div className="app-header-inner">
                <Link to="/" className="app-header-brand" aria-label="Transauction home">
                    <img className="app-header-logo" src={logo} alt="Transauction" />
                </Link>

                <div className="app-header-actions">
                    <div className="app-header-menu" ref={menuRef}>
                        <button
                            type="button"
                            className="app-header-user"
                            aria-haspopup="menu"
                            aria-expanded={isMenuOpen}
                            onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
                        >
                            {user?.username ?? 'Account'}
                        </button>
                        {isMenuOpen ? (
                            <nav className="app-header-menu-panel" aria-label="User navigation">
                                <Link to="/profile" className="app-header-menu-link" onClick={() => setIsMenuOpen(false)}>
                                    Profile
                                </Link>
                                <Link to="/friends" className="app-header-menu-link" onClick={() => setIsMenuOpen(false)}>
                                    Friends
                                </Link>
                                <button type="button" className="app-header-menu-link app-header-menu-logout" onClick={() => void handleLogout()}>
                                    Logout
                                </button>
                            </nav>
                        ) : null}
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header
