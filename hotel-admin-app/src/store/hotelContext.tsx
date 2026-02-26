import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { mockHotels } from '../utils/mockData'
import {
  createHotel as createHotelApi,
  fetchHotels,
  patchHotel,
  loginApi,
  registerApi,
  setToken,
  clearToken,
  getToken
} from '../services/hotelApi'
import type { IHotel, IUser, ILoginResult, IRegisterResult, IHotelContextValue } from '../types/hotel'

const HotelContext = createContext<IHotelContextValue | undefined>(undefined)

export const useHotelStore = (): IHotelContextValue => {
  const ctx = useContext(HotelContext)
  if (!ctx) throw new Error('useHotelStore must be used within HotelProvider')
  return ctx
}

interface HotelProviderProps {
  children: ReactNode
}

export const HotelProvider = ({ children }: HotelProviderProps) => {
  const [hotels, setHotels] = useState<IHotel[]>(() => {
    const stored = localStorage.getItem('hotels')
    return stored ? (JSON.parse(stored) as IHotel[]) : mockHotels
  })

  const [currentUser, setCurrentUser] = useState<IUser | null>(() => {
    const stored = localStorage.getItem('currentUser')
    return stored ? (JSON.parse(stored) as IUser) : null
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

  const login = async (username: string, password: string): Promise<ILoginResult> => {
    try {
      const res = await loginApi(username, password)
      setToken(res.token)
      const user: IUser = { ...res.user, password: '' }
      setCurrentUser(user)
      return { success: true, user }
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : '登录失败' }
    }
  }

  const register = async (username: string, password: string, role: IUser['role'] = 'user'): Promise<IRegisterResult> => {
    try {
      await registerApi(username, password, role)
      return { success: true }
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : '注册失败' }
    }
  }

  const logout = (): void => {
    setCurrentUser(null)
    clearToken()
  }

  const addHotel = async (hotel: Partial<IHotel>): Promise<IHotel> => {
    const created = await createHotelApi(hotel)
    setHotels(prev => [...prev, created])
    return created
  }

  const updateHotel = async (hotelId: string, updatedData: Partial<IHotel>): Promise<IHotel> => {
    const updated = await patchHotel(hotelId, updatedData)
    setHotels(prev => prev.map(h => (h.id === hotelId ? updated : h)))
    return updated
  }

  const updateHotelStatus = async (hotelId: string, status: IHotel['status'], rejectReason = ''): Promise<IHotel> => {
    const updated = await patchHotel(hotelId, { status, rejectReason })
    setHotels(prev => prev.map(h => (h.id === hotelId ? updated : h)))
    return updated
  }

  const toggleHotelOnline = async (hotelId: string): Promise<IHotel> => {
    const current = hotels.find(h => h.id === hotelId)
    const updated = await patchHotel(hotelId, { isOnline: !current?.isOnline })
    setHotels(prev => prev.map(h => (h.id === hotelId ? updated : h)))
    return updated
  }

  const refreshHotels = async (): Promise<void> => {
    try {
      const remote = await fetchHotels()
      if (Array.isArray(remote)) setHotels(remote)
    } catch { /* ignore */ }
  }

  const value: IHotelContextValue = {
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
