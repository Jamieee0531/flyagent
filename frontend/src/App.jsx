import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage.jsx'
import MainPage from './pages/MainPage.jsx'
import './App.css'

function App() {
  // TODO: Replace with real auth logic
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleLogin = () => {
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
  }

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
