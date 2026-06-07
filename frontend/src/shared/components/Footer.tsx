import { Link } from 'react-router-dom'

function Footer() {
    return (
        <footer className="app-footer">
            <nav className="app-footer-nav" aria-label="Footer navigation">
                <Link to="/privacy" className="app-footer-link">Privacy</Link>
                <span className="app-footer-sep">|</span>
                <Link to="/terms" className="app-footer-link">Terms</Link>
                <span className="app-footer-sep">|</span>
                <Link to="/status" className="app-footer-link">Status</Link>
            </nav>
        </footer>
    )
}

export default Footer
