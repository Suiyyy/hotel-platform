import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import Taro from '@tarojs/taro'

const STORAGE_KEY = 'hotel_history'
const MAX_HISTORY = 50

const HistoryContext = createContext(undefined)

export const useHistory = () => {
  const ctx = useContext(HistoryContext)
  if (!ctx) throw new Error('useHistory must be used within HistoryProvider')
  return ctx
}

const loadHistory = () => {
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

const saveHistory = (items) => {
  try {
    const data = JSON.stringify(items)
    if (process.env.TARO_ENV === 'weapp') {
      Taro.setStorageSync(STORAGE_KEY, data)
    } else if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, data)
    }
  } catch { /* ignore */ }
}

export const HistoryProvider = ({ children }) => {
  const [history, setHistory] = useState(loadHistory)

  useEffect(() => {
    saveHistory(history)
  }, [history])

  const addHistory = useCallback((hotelId) => {
    setHistory(prev => {
      const filtered = prev.filter(item => item.hotelId !== hotelId)
      const newItem = { hotelId, visitTime: new Date().toISOString() }
      return [newItem, ...filtered].slice(0, MAX_HISTORY)
    })
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
  }, [])

  return (
    <HistoryContext.Provider value={{ history, addHistory, clearHistory }}>
      {children}
    </HistoryContext.Provider>
  )
}
