import { PropsWithChildren } from 'react'
import { useLaunch } from '@tarojs/taro'
import { HotelProvider } from './store/hotelContext'
import { FavoritesProvider } from './store/favoritesContext'
import { HistoryProvider } from './store/historyContext'

import './app.scss'

function App({ children }: PropsWithChildren<any>) {
  useLaunch(() => {
    console.log('App launched.')
  })

  return (
    <HotelProvider>
      <FavoritesProvider>
        <HistoryProvider>{children}</HistoryProvider>
      </FavoritesProvider>
    </HotelProvider>
  )
}

export default App
