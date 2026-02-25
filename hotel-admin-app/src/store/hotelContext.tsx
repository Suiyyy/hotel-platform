import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { mockHotels, mockUsers } from '../utils/mockData'
import { createHotel as createHotelApi, fetchHotels, patchHotel } from '../services/hotelApi'
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

  const [users, setUsers] = useState<IUser[]>(() => {
    const stored = localStorage.getItem('users')
    return stored ? (JSON.parse(stored) as IUser[]) : mockUsers
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
    localStorage.setItem('users', JSON.stringify(users))
  }, [users])

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser))
    } else {
      localStorage.removeItem('currentUser')
    }
  }, [currentUser])

  const login = (username: string, password: string): ILoginResult => {
    const user = users.find(u => u.username === username && u.password === password)
    if (user) {
      setCurrentUser(user)
      return { success: true, user }
    }
    return { success: false, message: '用户名或密码错误' }
  }

  const register = (username: string, password: string, role: IUser['role'] = 'user'): IRegisterResult => {
    const exists = users.find(u => u.username === username)
    if (exists) {
      return { success: false, message: '用户名已存在' }
    }
    const newUser: IUser = {
      id: Date.now().toString(),
      username,
      password,
      role
    }
    setUsers([...users, newUser])
    return { success: true }
  }

  const logout = (): void => {
    setCurrentUser(null)
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

  const value: IHotelContextValue = {
    hotels,
    users,
    currentUser,
    login,
    register,
    logout,
    addHotel,
    updateHotel,
    updateHotelStatus,
    toggleHotelOnline
  }

  return (
    <HotelContext.Provider value={value}>
      {children}
    </HotelContext.Provider>
  )
}
