import { Layout, Menu, Button, Switch } from 'antd'
import { HomeOutlined, PlusOutlined, AuditOutlined, LogoutOutlined, BulbOutlined } from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useHotelStore } from '../store/hotelContext'
import { useTheme } from '../store/themeContext'

const { Header, Sider, Content } = Layout

const AdminLayout = () => {
  const { currentUser, logout } = useHotelStore()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const merchantItems = [
    { key: '/my-hotels', icon: <HomeOutlined />, label: '我的酒店' },
    { key: '/add-hotel', icon: <PlusOutlined />, label: '录入酒店' },
  ]

  const adminItems = [
    { key: '/audit', icon: <AuditOutlined />, label: '审核管理' },
  ]

  const menuItems = currentUser?.role === 'admin' ? adminItems : merchantItems

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="80">
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          color: '#fff',
          fontSize: 15,
          fontWeight: 600,
          letterSpacing: 1,
          borderBottom: '1px solid rgba(255,255,255,0.08)'
        }}>
          <span style={{ fontSize: 20 }}>🏨</span>
          <span>酒店管理平台</span>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{
          background: isDark ? '#141414' : '#fff',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 16,
          boxShadow: isDark
            ? '0 1px 4px rgba(0,0,0,0.3)'
            : '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
          zIndex: 1
        }}>
          <Switch
            checkedChildren={<BulbOutlined />}
            unCheckedChildren={<BulbOutlined />}
            checked={isDark}
            onChange={toggleTheme}
          />
          <span style={{ fontSize: 14, opacity: 0.85 }}>
            欢迎，{currentUser?.role === 'admin' ? '管理员' : '商户'} {currentUser?.username}
          </span>
          <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout}>退出</Button>
        </Header>
        <Content style={{ margin: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default AdminLayout
