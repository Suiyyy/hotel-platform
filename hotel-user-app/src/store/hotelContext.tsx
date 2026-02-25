import { createContext, useContext, useState, useEffect, type PropsWithChildren } from 'react'
import Taro from '@tarojs/taro'
import { mockHotels } from '../utils/mockData'
import { fetchPublicHotels } from '../services/hotelApi'
import type { IHotel, ISearchParams, IHotelContextValue } from '../types/hotel'

const HotelContext = createContext<IHotelContextValue | undefined>(undefined)

export const useHotelStore = (): IHotelContextValue => {
  const ctx = useContext(HotelContext)
  if (!ctx) throw new Error('useHotelStore must be used within HotelProvider')
  return ctx
}

const getStorage = (key: string): string | null => {
  try {
    if (process.env.TARO_ENV === 'weapp') {
      return Taro.getStorageSync(key) || null
    } else if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key)
    }
  } catch (error) {
    console.error('获取存储失败:', error)
  }
  return null
}

const setStorage = (key: string, value: string): void => {
  try {
    if (process.env.TARO_ENV === 'weapp') {
      Taro.setStorageSync(key, value)
    } else if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value)
    }
  } catch (error) {
    console.error('设置存储失败:', error)
  }
}

export const HotelProvider = ({ children }: PropsWithChildren) => {
  const [hotels, setHotels] = useState<IHotel[]>(() => {
    const stored = getStorage('hotels')
    return stored ? JSON.parse(stored) : mockHotels
  })

  const [searchParams, setSearchParams] = useState<ISearchParams>({
    keyword: '',
    checkInDate: '',
    checkOutDate: ''
  })

  useEffect(() => {
    setStorage('hotels', JSON.stringify(hotels))
  }, [hotels])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const remote = await fetchPublicHotels()
        if (!cancelled && Array.isArray(remote) && remote.length > 0) {
          setHotels(remote)
        }
      } catch {
        // fallback to storage/mock
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const getApprovedOnlineHotels = (): IHotel[] => {
    return hotels.filter(h => h.status === 'approved' && h.isOnline)
  }

  const getHotelById = (id: string): IHotel | undefined => {
    return hotels.find(h => h.id === id)
  }

  const addHotel = (hotel: Partial<IHotel>): void => {
    const newHotel: IHotel = {
      ...hotel,
      id: Date.now().toString(),
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
      status: 'pending',
      isOnline: false,
      rejectReason: ''
    } as IHotel
    setHotels([...hotels, newHotel])
  }

  const updateHotel = (hotelId: string, updatedData: Partial<IHotel>): void => {
    setHotels(hotels.map(hotel =>
      hotel.id === hotelId
        ? { ...hotel, ...updatedData, updateTime: new Date().toISOString() }
        : hotel
    ))
  }

  const updateHotelStatus = (hotelId: string, status: IHotel['status'], rejectReason = ''): void => {
    setHotels(hotels.map(hotel =>
      hotel.id === hotelId
        ? { ...hotel, status, rejectReason, updateTime: new Date().toISOString() }
        : hotel
    ))
  }

  const toggleHotelOnline = (hotelId: string): void => {
    setHotels(hotels.map(hotel =>
      hotel.id === hotelId
        ? { ...hotel, isOnline: !hotel.isOnline, updateTime: new Date().toISOString() }
        : hotel
    ))
  }

  const searchHotels = (params: ISearchParams): void => {
    setSearchParams(params)
  }

  const value: IHotelContextValue = {
    hotels,
    searchParams,
    getApprovedOnlineHotels,
    getHotelById,
    addHotel,
    updateHotel,
    updateHotelStatus,
    toggleHotelOnline,
    searchHotels
  }

  return (
    <HotelContext.Provider value={value}>
      {children}
    </HotelContext.Provider>
  )
}
