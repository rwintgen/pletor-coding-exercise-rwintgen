import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { getMe } from './api/client'
import { Navbar } from './components/Navbar'
import { LoginPage } from './features/auth/LoginPage'
import { RegisterPage } from './features/auth/RegisterPage'
import { GalleryPage } from './features/gallery/GalleryPage'
import { useAuthStore } from './stores/auth'

/**
 * Root component. Sets up routing and re-validates the persisted token
 * on mount: if the token is rejected, the auth state is cleared.
 */
export default function App() {
  const { token, user, setUser, clear } = useAuthStore()

  useEffect(() => {
    if (token && !user) {
      getMe()
        .then(setUser)
        .catch(() => clear())
    }
  }, [token, user, setUser, clear])

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<GalleryPage />} />
        <Route
          path="/login"
          element={token ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={token ? <Navigate to="/" replace /> : <RegisterPage />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
