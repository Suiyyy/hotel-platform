import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import './index.css'
import App from './App'
import { HotelProvider } from './store/hotelContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HotelProvider>
      <ConfigProvider locale={zhCN}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ConfigProvider>
    </HotelProvider>
  </StrictMode>,
)
