import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage.jsx'
import MainPage from './pages/MainPage.jsx'
import './App.css'

// top-level app component, handles auth routing
function App() {
  // Replace with real auth persistence from localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('nomie_token'))

  const handleLogin = () => setIsLoggedIn(true)

  const handleLogout = () => {
    localStorage.removeItem('nomie_token')
    setIsLoggedIn(false)
  }

  // redirect to /login if not logged in, otherwise show main page
  return (
    <Routes>
      <Route
        path="/login"
        element={
          isLoggedIn
            ? <Navigate to="/" replace />
            : <LoginPage onLogin={handleLogin} />
        }
      />
      <Route
        path="/*"
        element={
          isLoggedIn
            ? <MainPage onLogout={handleLogout} />
            : <Navigate to="/login" replace />
        }
      />
    </Routes>
  )
}

export default App
