import { useAuth } from '../auth/AuthContext'

function ProfilePage() {
    const { user } = useAuth()

    if (!user) {
        return <p>Loading profile...</p>
    }

    return (
        <section>
        <h1>Profile</h1>
        <p>Username: {user.username}</p>
        <p>User ID: {user.userId}</p>
        </section>
    )
}
export default ProfilePage
