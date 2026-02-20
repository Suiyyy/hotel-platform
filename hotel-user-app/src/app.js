
import { useLaunch } from '@tarojs/taro'
import { HotelProvider } from './store/hotelContext'
import './app.scss'

function App({ children }) {

  useLaunch(() => {
    console.log('App launched.')
  })

  return (
    <HotelProvider>
      {children}
    </HotelProvider>
  )
}

export default App
