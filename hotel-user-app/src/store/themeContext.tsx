import { createContext, useContext, useState, useEffect, useCallback, type PropsWithChildren } from 'react'
import Taro from '@tarojs/taro'

const STORAGE_KEY = 'hotel_theme'

type Theme = 'light' | 'dark'

interface IThemeContext {
  theme: Theme
  isDark: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<IThemeContext | undefined>(undefined)

export const useTheme = (): IThemeContext => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

const loadTheme = (): Theme => {
  try {
    if (process.env.TARO_ENV === 'weapp') {
      return (Taro.getStorageSync(STORAGE_KEY) as Theme) || 'light'
    } else if (typeof localStorage !== 'undefined') {
      return (localStorage.getItem(STORAGE_KEY) as Theme) || 'light'
    }
  } catch { /* ignore */ }
  return 'light'
}

const saveTheme = (theme: Theme): void => {
  try {
    if (process.env.TARO_ENV === 'weapp') {
      Taro.setStorageSync(STORAGE_KEY, theme)
    } else if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, theme)
    }
  } catch { /* ignore */ }
}

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const [theme, setTheme] = useState<Theme>(loadTheme)

  useEffect(() => {
    saveTheme(theme)
    // 设置根元素 class 以应用 CSS 变量
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme)
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
