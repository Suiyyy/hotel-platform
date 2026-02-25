import { useState } from 'react'
import { Form, Input, Button, Card, message, Tabs, Radio } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useHotelStore } from '../../store/hotelContext'
import type { IUser } from '../../types/hotel'
import './index.css'

interface ILoginFormValues {
  username: string
  password: string
}

interface IRegisterFormValues {
  username: string
  password: string
  confirmPassword: string
  role: IUser['role']
}

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('login')
  const [loading, setLoading] = useState(false)
  const { login, register } = useHotelStore()
  const navigate = useNavigate()

  const handleLogin = async (values: ILoginFormValues) => {
    setLoading(true)
    try {
      const result = await login(values.username, values.password)
      if (result.success) {
        message.success('登录成功')
        if (result.user?.role === 'admin') {
          navigate('/audit')
        } else {
          navigate('/add-hotel')
        }
      } else {
        message.error(result.message)
      }
    } catch {
      message.error('登录失败')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (values: IRegisterFormValues) => {
    setLoading(true)
    try {
      const result = await register(values.username, values.password, values.role)
      if (result.success) {
        message.success('注册成功，请登录')
        setActiveTab('login')
      } else {
        message.error(result.message)
      }
    } catch {
      message.error('注册失败')
    } finally {
      setLoading(false)
    }
  }

  const items = [
    {
      key: 'login',
      label: '登录',
      children: (
        <div>
          <Form
            name="login"
            onFinish={handleLogin}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="用户名"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="密码"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
              >
                登录
              </Button>
            </Form.Item>
          </Form>
          <div className="login-tips">
            <p>测试账号：</p>
            <p>管理员：admin / 123456</p>
            <p>商户：user / 123456</p>
          </div>
        </div>
      ),
    },
    {
      key: 'register',
      label: '注册',
      children: (
        <div>
          <Form
            name="register"
            onFinish={handleRegister}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[
                { required: true, message: '请输入用户名' },
                { min: 3, message: '用户名至少3个字符' }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="用户名"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6个字符' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="密码"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: '请确认密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'))
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="确认密码"
              />
            </Form.Item>

            <Form.Item
              name="role"
              initialValue="user"
              label="注册角色"
              rules={[{ required: true, message: '请选择角色' }]}
            >
              <Radio.Group>
                <Radio value="user">商户（录入/管理酒店）</Radio>
                <Radio value="admin">管理员（审核酒店）</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
              >
                注册
              </Button>
            </Form.Item>
          </Form>
        </div>
      ),
    },
  ]

  return (
    <div className="login-container">
      <Card className="login-card" title="酒店预订平台管理端">
        <Tabs activeKey={activeTab} onChange={setActiveTab} centered items={items} />
      </Card>
    </div>
  )
}

export default LoginPage
