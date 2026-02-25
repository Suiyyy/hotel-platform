import { Layout, Menu, Button } from 'antd'
import { HomeOutlined, PlusOutlined, AuditOutlined, LogoutOutlined } from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useHotelStore } from '../store/hotelContext'
import type { MenuProps } from 'antd'

const { Header, Sider, Content } = Layout

const AdminLayout = () => {
  const { currentUser, logout } = useHotelStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const merchantItems: MenuProps['items'] = [
    { key: '/my-hotels', icon: <HomeOutlined />, label: '我的酒店' },
    { key: '/add-hotel', icon: <PlusOutlined />, label: '录入酒店' },
  ]

  const adminItems: MenuProps['items'] = [
    { key: '/audit', icon: <AuditOutlined />, label: '审核管理' },
  ]

  const menuItems = currentUser?.role === 'admin' ? adminItems : merchantItems

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="80">
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
          酒店管理平台
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
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <span>欢迎，{currentUser?.role === 'admin' ? '管理员' : '商户'} {currentUser?.username}</span>
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
