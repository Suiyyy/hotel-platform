import { createContext, useContext, useState, useEffect } from 'react'
import { mockHotels } from '../utils/mockData'
import {
  createHotel as createHotelApi,
  fetchHotels,
  patchHotel,
  loginApi,
  registerApi,
  setToken,
  clearToken,
} from '../services/hotelApi'

const HotelContext = createContext(undefined)

export const useHotelStore = () => {
  const ctx = useContext(HotelContext)
  if (!ctx) throw new Error('useHotelStore must be used within HotelProvider')
  return ctx
}

export const HotelProvider = ({ children }) => {
  const [hotels, setHotels] = useState(() => {
    const stored = localStorage.getItem('hotels')
    return stored ? JSON.parse(stored) : mockHotels
  })

  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem('currentUser')
    return stored ? JSON.parse(stored) : null
  })

  useEffect(() => {
    localStorage.setItem('hotels', JSON.stringify(hotels))
  }, [hotels])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const remote = await fetchHotels()
        if (!cancelled && Array.isArray(remote)) setHotels(remote)
      } catch {
        // ignore: fallback to localStorage/mock
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser))
    } else {
      localStorage.removeItem('currentUser')
    }
  }, [currentUser])

  const login = async (username, password) => {
    try {
      const res = await loginApi(username, password)
      setToken(res.token)
      const user = { ...res.user, password: '' }
      setCurrentUser(user)
      // Refresh hotels from API now that we have a token
      try {
        const remote = await fetchHotels()
        if (Array.isArray(remote)) setHotels(remote)
      } catch { /* ignore */ }
      return { success: true, user }
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : '登录失败' }
    }
  }

  const register = async (username, password, role = 'user') => {
    try {
      await registerApi(username, password, role)
      return { success: true }
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : '注册失败' }
    }
  }

  const logout = () => {
    setCurrentUser(null)
    clearToken()
  }

  const addHotel = async (hotel) => {
    const created = await createHotelApi(hotel)
    setHotels(prev => [...prev, created])
    return created
  }

  const updateHotel = async (hotelId, updatedData) => {
    const updated = await patchHotel(hotelId, updatedData)
    setHotels(prev => prev.map(h => (h.id === hotelId ? updated : h)))
    return updated
  }

  const updateHotelStatus = async (hotelId, status, rejectReason = '') => {
    const updated = await patchHotel(hotelId, { status, rejectReason })
    setHotels(prev => prev.map(h => (h.id === hotelId ? updated : h)))
    return updated
  }

  const toggleHotelOnline = async (hotelId) => {
    const current = hotels.find(h => h.id === hotelId)
    const updated = await patchHotel(hotelId, { isOnline: !current?.isOnline })
    setHotels(prev => prev.map(h => (h.id === hotelId ? updated : h)))
    return updated
  }

  const refreshHotels = async () => {
    try {
      const remote = await fetchHotels()
      if (Array.isArray(remote)) setHotels(remote)
    } catch { /* ignore */ }
  }

  const value = {
    hotels,
    users: [],
    currentUser,
    login,
    register,
    logout,
    addHotel,
    updateHotel,
    updateHotelStatus,
    toggleHotelOnline,
    refreshHotels
  }

  return (
    <HotelContext.Provider value={value}>
      {children}
    </HotelContext.Provider>
  )
}
