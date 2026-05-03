import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './features/auth/ProtectedRoute'
import Header from './shared/components/Header'
import LoginPage from './features/auth/LoginPage'
import RegisterPage from './features/auth/RegisterPage'
import ProfilePage from './features/profile/ProfilePage'
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
            <div>
              <h1>Transcendance</h1>
              <p>Marketplace platform coming soon.</p>
            </div>
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
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </>
  )
}

export default App
