import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/Login'
import HotelAddPage from './pages/HotelAdd'
import HotelListPage from './pages/HotelList'
import HotelEditPage from './pages/HotelEdit'
import HotelAuditPage from './pages/HotelAudit'
import AdminLayout from './layouts/AdminLayout'
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
    return <>{children}</>
  }

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={
          currentUser ? (
            currentUser.role === 'admin' ? (
              <Navigate to="/audit" replace />
            ) : (
              <Navigate to="/my-hotels" replace />
            )
          ) : (
            <LoginPage />
          )
        } />

        <Route element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="/add-hotel" element={<HotelAddPage />} />
          <Route path="/my-hotels" element={<HotelListPage />} />
          <Route path="/edit-hotel/:id" element={<HotelEditPage />} />
        </Route>

        <Route element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="/audit" element={<HotelAuditPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
