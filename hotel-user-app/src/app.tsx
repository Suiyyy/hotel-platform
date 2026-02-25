import { PropsWithChildren } from 'react'
import { useLaunch } from '@tarojs/taro'
import { HotelProvider } from './store/hotelContext'
import { FavoritesProvider } from './store/favoritesContext'
import { HistoryProvider } from './store/historyContext'
import { ThemeProvider } from './store/themeContext'
import ErrorBoundary from './components/ErrorBoundary'

import './app.scss'

function App({ children }: PropsWithChildren<any>) {
  useLaunch(() => {
    // App initialized
  })

  return (
    <HotelProvider>
      <FavoritesProvider>
        <HistoryProvider>
          <ThemeProvider>
            <ErrorBoundary>{children}</ErrorBoundary>
          </ThemeProvider>
        </HistoryProvider>
      </FavoritesProvider>
    </HotelProvider>
  )
}

export default App
