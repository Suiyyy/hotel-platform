import { createContext, useContext, useState, useEffect, useCallback, type PropsWithChildren } from 'react'
import Taro from '@tarojs/taro'

const STORAGE_KEY = 'hotel_history'
const MAX_HISTORY = 50

export interface IHistoryItem {
  hotelId: string
  visitTime: string
}

interface IHistoryContext {
  history: IHistoryItem[]
  addHistory: (hotelId: string) => void
  clearHistory: () => void
}

const HistoryContext = createContext<IHistoryContext | undefined>(undefined)

export const useHistory = (): IHistoryContext => {
  const ctx = useContext(HistoryContext)
  if (!ctx) throw new Error('useHistory must be used within HistoryProvider')
  return ctx
}

const loadHistory = (): IHistoryItem[] => {
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

const saveHistory = (items: IHistoryItem[]): void => {
  try {
    const data = JSON.stringify(items)
    if (process.env.TARO_ENV === 'weapp') {
      Taro.setStorageSync(STORAGE_KEY, data)
    } else if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, data)
    }
  } catch { /* ignore */ }
}

export const HistoryProvider = ({ children }: PropsWithChildren) => {
  const [history, setHistory] = useState<IHistoryItem[]>(loadHistory)

  useEffect(() => {
    saveHistory(history)
  }, [history])

  const addHistory = useCallback((hotelId: string) => {
    setHistory(prev => {
      const filtered = prev.filter(item => item.hotelId !== hotelId)
      const newItem: IHistoryItem = { hotelId, visitTime: new Date().toISOString() }
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
