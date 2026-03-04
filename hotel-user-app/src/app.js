import { useLaunch } from '@tarojs/taro'
import { HotelProvider } from './store/hotelContext'
import { FavoritesProvider } from './store/favoritesContext'
import { HistoryProvider } from './store/historyContext'

import './app.scss'

function App({ children }) {
  useLaunch(() => {
    // App initialized
  })

  return (
    <HotelProvider>
      <FavoritesProvider>
        <HistoryProvider>
          {children}
        </HistoryProvider>
      </FavoritesProvider>
    </HotelProvider>
  )
}

export default App
