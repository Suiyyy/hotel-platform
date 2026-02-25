import { PropsWithChildren } from 'react'
import { useLaunch } from '@tarojs/taro'
import { HotelProvider } from './store/hotelContext'
import { FavoritesProvider } from './store/favoritesContext'

import './app.scss'

function App({ children }: PropsWithChildren<any>) {
  useLaunch(() => {
    console.log('App launched.')
  })

  return (
    <HotelProvider>
      <FavoritesProvider>{children}</FavoritesProvider>
    </HotelProvider>
  )
}

export default App
