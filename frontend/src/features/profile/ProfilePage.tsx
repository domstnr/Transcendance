import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

function ProfilePage() {
    const { user } = useAuth()
    const navigate = useNavigate()

    if (!user) {
        return <p>Loading profile...</p>
    }

    return (
        <div id="wrapper" className="profile-page">
          <div id="principal">
            <h1 id="heading">Profile</h1>
            <div id="form">
              <div className="field">
                {user.avatarUrl ? (
                  <img
                    className="profile-avatar"
                    src={`${API_URL}${user.avatarUrl}`}
                    alt="Avatar"
                  />
                ) : (
                  <div className="profile-avatar-placeholder">
                    {user.username[0].toUpperCase()}
                  </div>
                )}
              </div>

              <div className="field">
                <p className="profile-text">
                  <span className="profile-label">Username:</span> {user.username}
                </p>
                <p className="profile-text">
                  <span className="profile-label">User ID:</span> {user.userId}
                </p>
              </div>

              <button type="button" className="button" onClick={() => navigate('/profile/update')}>
                Update profile
              </button>
            </div>
          </div>
        </div>
    )
}
export default ProfilePage
