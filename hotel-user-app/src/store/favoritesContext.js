import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import Taro from '@tarojs/taro'

const STORAGE_KEY = 'hotel_favorites'

const FavoritesContext = createContext(undefined)

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider')
  return ctx
}

const loadFavorites = () => {
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

const saveFavorites = (ids) => {
  try {
    const data = JSON.stringify(ids)
    if (process.env.TARO_ENV === 'weapp') {
      Taro.setStorageSync(STORAGE_KEY, data)
    } else if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, data)
    }
  } catch { /* ignore */ }
}

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(loadFavorites)

  useEffect(() => {
    saveFavorites(favorites)
  }, [favorites])

  const isFavorite = useCallback(
    (hotelId) => favorites.includes(hotelId),
    [favorites]
  )

  const toggleFavorite = useCallback((hotelId) => {
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
