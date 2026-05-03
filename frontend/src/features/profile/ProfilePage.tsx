import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

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
