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
import CallbackPage from './features/auth/GithubCallback.tsx'
import ItemDetailsPage from './features/item/ItemDetailsPage'
import PrivacyPolicyPage from './features/legal/PrivacyPolicyPage'
import TermsOfServicePage from './features/legal/TermsOfServicePage'
import logo from './assets/transauction2.svg'
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
              <img className="home-logo" src={logo} alt="Transauction" />
              <div className="home-copy">
                <p>
                  Transauction is an auction website designed for friends. Its goal is to let users share, browse, and auction items in a simple and social space.
                </p>
                <p>
                  In the Friends section, users can search for friends, add them, remove them, and access their items by clicking on their profile name. This makes it easy to see what friends are currently offering for auction.
                </p>
                <p>
                  In the Profile section, users can manage their account, update their information, upload a profile picture, add their own items, and put them up for auction. Each user has a personal space to showcase their items and participate in auctions.
                </p>
                <p>
                  A Marketplace section is planned for the future. It will include a search bar to help users find items and browse available auctions more easily.
                </p>
              </div>
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
      <Route
        path="/item/:itemId"
        element={
          <ProtectedRoute>
            <ItemDetailsPage />
          </ProtectedRoute>
        }
      />
      <Route path="/status" element={<StatusPage />} />
      <Route path="/auth/callback" element={<CallbackPage />} />
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsOfServicePage />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App
