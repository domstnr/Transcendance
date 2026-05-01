import { Routes, Route } from 'react-router-dom'
import Header from './shared/components/Header'
import LoginPage from './features/auth/LoginPage'
import RegisterPage from './features/auth/RegisterPage'
import ProtectedRoute from './features/auth/ProtectedRoute'
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
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </>
  )
}

export default App
