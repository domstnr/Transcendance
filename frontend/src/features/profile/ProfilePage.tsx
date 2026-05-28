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
        <section>
        <div>
          <h1>Profile</h1>
          {user.avatarUrl ? (
              <img
                  src={`${API_URL}${user.avatarUrl}`}
                  alt="Avatar"
                  style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover' }}
              />
          ) : (
              <div style={{ width: 96, height: 96, borderRadius: '50%', background: '#ccc', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>
                  {user.username[0].toUpperCase()}
              </div>
          )}
          <p>Username: {user.username}</p>
          <p>User ID: {user.userId}</p>
        </div>
        <div>
          <button type="button" onClick={() => navigate('/profile/update')}>
            Update profile
          </button>
        </div>
        </section>
    )
}
export default ProfilePage
