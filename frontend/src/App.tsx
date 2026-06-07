import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './features/auth/ProtectedRoute'
import Header from './shared/components/Header'
import Footer from './shared/components/Footer'
import LoginPage from './features/auth/LoginPage'
import RegisterPage from './features/auth/RegisterPage'
import ProfilePage from './features/profile/ProfilePage'
import UpdateProfilePage from './features/profile/UpdateProfilePage'
import ChatPage from './features/chat/ChatPage'
import FriendsPage from './features/friends/FriendsPage'
import FriendRequestsPage from './features/friends/FriendRequestsPage'
import UserSearchPage from './features/friends/UserSearchPage'
import PublicProfilePage from './features/profile/PublicProfilePage'
import StatusPage from './features/health/StatusPage'
import PrivacyPolicyPage from './features/legal/PrivacyPolicyPage'
import TermsOfServicePage from './features/legal/TermsOfServicePage'
import './App.css'

function App() {
  return (
    <>
      <Header />
      <Routes>
      <Route
        path="/" 
        element={
          <ProtectedRoute>
            <section className="home-section">
              <h1>Transcendance</h1>
              <p>Marketplace platform coming soon.</p>
            </section>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile" 
        element={
          <ProtectedRoute>
           <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/update" 
        element={
          <ProtectedRoute>
           <UpdateProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/auction/:auctionId/chat"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/friends"
        element={<ProtectedRoute><FriendsPage /></ProtectedRoute>}
      />
      <Route
        path="/friends/requests"
        element={<ProtectedRoute><FriendRequestsPage /></ProtectedRoute>}
      />
      <Route
        path="/friends/search"
        element={<ProtectedRoute><UserSearchPage /></ProtectedRoute>}
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/user/:userId"
        element={
          <ProtectedRoute>
            <PublicProfilePage />
          </ProtectedRoute>
        }
      />
      <Route path="/status" element={<StatusPage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsOfServicePage />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App
