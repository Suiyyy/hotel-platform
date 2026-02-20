import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/Login'
import HotelAddPage from './pages/HotelAdd'
import HotelAuditPage from './pages/HotelAudit'
import { useHotelStore } from './store/hotelContext'
import './App.css'

function App() {
  const { currentUser } = useHotelStore()

  const ProtectedRoute = ({ children, requiredRole }) => {
    if (!currentUser) {
      return <Navigate to="/" replace />
    }
    if (requiredRole && currentUser.role !== requiredRole) {
      return <Navigate to="/" replace />
    }
    return children
  }

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={
          currentUser ? (
            currentUser.role === 'admin' ? (
              <Navigate to="/audit" replace />
            ) : (
              <Navigate to="/add-hotel" replace />
            )
          ) : (
            <LoginPage />
          )
        } />
        
        <Route path="/add-hotel" element={
          <ProtectedRoute>
            <HotelAddPage />
          </ProtectedRoute>
        } />
        
        <Route path="/audit" element={
          <ProtectedRoute requiredRole="admin">
            <HotelAuditPage />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
