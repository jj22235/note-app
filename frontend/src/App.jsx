import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import NotesPage from './pages/NotesPage'
import NoteEdit from './pages/NoteEdit'
import NoteView from './pages/NoteView'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <NotesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notes/:id"
        element={
          <ProtectedRoute>
            <NoteView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notes/:id/edit"
        element={
          <ProtectedRoute>
            <NoteEdit />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
