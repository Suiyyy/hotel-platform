import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import './index.css'
import App from './App'
import { HotelProvider } from './store/hotelContext'
import { ThemeProvider, useTheme } from './store/themeContext'
import ErrorBoundary from './components/ErrorBoundary'

const ThemedApp = () => {
  const { isDark } = useTheme()

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <BrowserRouter>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </BrowserRouter>
    </ConfigProvider>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HotelProvider>
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </HotelProvider>
  </StrictMode>,
)
