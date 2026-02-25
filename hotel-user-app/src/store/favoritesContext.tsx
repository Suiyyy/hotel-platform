import { createContext, useContext, useState, useEffect, useCallback, type PropsWithChildren } from 'react'
import Taro from '@tarojs/taro'

const STORAGE_KEY = 'hotel_favorites'

interface IFavoritesContext {
  favorites: string[]
  isFavorite: (hotelId: string) => boolean
  toggleFavorite: (hotelId: string) => void
}

const FavoritesContext = createContext<IFavoritesContext | undefined>(undefined)

export const useFavorites = (): IFavoritesContext => {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider')
  return ctx
}

const loadFavorites = (): string[] => {
  try {
    if (process.env.TARO_ENV === 'weapp') {
      const data = Taro.getStorageSync(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } else if (typeof localStorage !== 'undefined') {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    }
  } catch { /* ignore */ }
  return []
}

const saveFavorites = (ids: string[]): void => {
  try {
    const data = JSON.stringify(ids)
    if (process.env.TARO_ENV === 'weapp') {
      Taro.setStorageSync(STORAGE_KEY, data)
    } else if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, data)
    }
  } catch { /* ignore */ }
}

export const FavoritesProvider = ({ children }: PropsWithChildren) => {
  const [favorites, setFavorites] = useState<string[]>(loadFavorites)

  useEffect(() => {
    saveFavorites(favorites)
  }, [favorites])

  const isFavorite = useCallback(
    (hotelId: string) => favorites.includes(hotelId),
    [favorites]
  )

  const toggleFavorite = useCallback((hotelId: string) => {
    setFavorites(prev =>
      prev.includes(hotelId)
        ? prev.filter(id => id !== hotelId)
        : [...prev, hotelId]
    )
  }, [])

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  )
}
