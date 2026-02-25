import { useState, useEffect } from 'react'
import { Form, Input, InputNumber, Select, Button, Card, message, Space, Divider, Row, Col, Spin } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { patchHotel } from '../../services/hotelApi'
import { useHotelStore } from '../../store/hotelContext'
import type { IRoomType } from '../../types/hotel'
import '../HotelAdd/index.css'

const { Option } = Select
const { TextArea } = Input

interface IHotelFormValues {
  nameCn: string
  nameEn?: string
  address: string
  star: number
  price: number
  openDate: string
  phone: string
  imageUrl: string
  description?: string
  facilities?: string
}

const HotelEditPage = () => {
  const { id } = useParams<{ id: string }>()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [roomTypes, setRoomTypes] = useState<IRoomType[]>([])
  const { hotels, currentUser, logout } = useHotelStore()
  const navigate = useNavigate()

  const hotel = hotels.find(h => h.id === id)

  useEffect(() => {
    if (hotel) {
      form.setFieldsValue({
        nameCn: hotel.nameCn,
        nameEn: hotel.nameEn,
        address: hotel.address,
        star: hotel.star,
        price: hotel.price,
        openDate: hotel.openDate,
        phone: hotel.phone,
        imageUrl: hotel.imageUrl,
        description: hotel.description,
        facilities: hotel.facilities?.join(', ')
      })
      setRoomTypes(hotel.roomTypes?.length ? hotel.roomTypes : [{ id: '1', name: '', price: 0, area: 0, bedType: '' }])
    }
  }, [hotel, form])

  const handleSubmit = async (values: IHotelFormValues) => {
    if (!id) return
    setLoading(true)
    try {
      await patchHotel(id, {
        ...values,
        roomTypes: roomTypes.filter(r => r.name && r.price > 0),
        facilities: values.facilities ? values.facilities.split(',').map(f => f.trim()) : []
      })
      message.success('酒店信息已更新')
      navigate('/my-hotels')
    } catch {
      message.error('更新失败')
    } finally {
      setLoading(false)
    }
  }

  const addRoomType = () => {
    setRoomTypes([...roomTypes, { id: Date.now().toString(), name: '', price: 0, area: 0, bedType: '' }])
  }

  const removeRoomType = (rid: string) => {
    if (roomTypes.length > 1) setRoomTypes(roomTypes.filter(r => r.id !== rid))
  }

  const updateRoomType = (rid: string, field: keyof IRoomType, value: string | number) => {
    setRoomTypes(roomTypes.map(r => r.id === rid ? { ...r, [field]: value } : r))
  }

  const handleLogout = () => { logout(); navigate('/') }

  if (!hotel) {
    return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" tip="加载中..." /></div>
  }

  return (
    <div className="hotel-add-container">
      <div className="page-header">
        <h1>编辑酒店信息</h1>
        <div className="user-info">
          <span>欢迎，{currentUser?.username}</span>
          <Button type="link" onClick={() => navigate('/my-hotels')}>返回列表</Button>
          <Button type="link" onClick={handleLogout}>退出</Button>
        </div>
      </div>

      <Card>
        <Form form={form} layout="vertical" onFinish={handleSubmit} size="large">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="nameCn" label="酒店中文名" rules={[{ required: true, message: '请输入酒店中文名' }]}>
                <Input placeholder="请输入酒店中文名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="nameEn" label="酒店英文名">
                <Input placeholder="请输入酒店英文名" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="address" label="地址" rules={[{ required: true, message: '请输入地址' }]}>
            <Input placeholder="请输入酒店地址" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="star" label="星级" rules={[{ required: true, message: '请选择星级' }]}>
                <Select placeholder="请选择星级">
                  <Option value={3}>3星级</Option>
                  <Option value={4}>4星级</Option>
                  <Option value={5}>5星级</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="price" label="最低价格" rules={[{ required: true, message: '请输入价格' }]}>
                <InputNumber min={0} placeholder="价格" style={{ width: '100%' }} addonAfter="元" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="openDate" label="开业时间" rules={[{ required: true, message: '请输入开业时间' }]}>
                <Input placeholder="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phone" label="联系电话" rules={[{ required: true, message: '请输入联系电话' }]}>
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="imageUrl" label="图片链接" rules={[{ required: true, message: '请输入图片链接' }]}>
                <Input placeholder="请输入图片链接" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="酒店简介">
            <TextArea rows={4} placeholder="请输入酒店简介" />
          </Form.Item>

          <Form.Item name="facilities" label="设施服务（用逗号分隔）">
            <Input placeholder="如：免费WiFi, 停车场, 健身房" />
          </Form.Item>

          <Divider>房型管理</Divider>

          {roomTypes.map((room) => (
            <div key={room.id} className="room-type-form">
              <Row gutter={16} align="middle">
                <Col span={6}>
                  <Input placeholder="房型名称" value={room.name} onChange={(e) => updateRoomType(room.id, 'name', e.target.value)} />
                </Col>
                <Col span={5}>
                  <InputNumber placeholder="价格" min={0} value={room.price} onChange={(v) => updateRoomType(room.id, 'price', v ?? 0)} style={{ width: '100%' }} addonAfter="元" />
                </Col>
                <Col span={5}>
                  <InputNumber placeholder="面积" min={0} value={room.area} onChange={(v) => updateRoomType(room.id, 'area', v ?? 0)} style={{ width: '100%' }} addonAfter="㎡" />
                </Col>
                <Col span={6}>
                  <Input placeholder="床型" value={room.bedType} onChange={(e) => updateRoomType(room.id, 'bedType', e.target.value)} />
                </Col>
                <Col span={2}>
                  <Button danger disabled={roomTypes.length === 1} onClick={() => removeRoomType(room.id)}>删除</Button>
                </Col>
              </Row>
            </div>
          ))}

          <Form.Item>
            <Button type="dashed" onClick={addRoomType} block>+ 添加房型</Button>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading} size="large">保存修改</Button>
              <Button size="large" onClick={() => navigate('/my-hotels')}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default HotelEditPage
