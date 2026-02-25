import { useState } from 'react'
import { Form, Input, InputNumber, Select, Button, Card, message, Space, Divider, Row, Col } from 'antd'
import { useHotelStore } from '../../store/hotelContext'
import type { IRoomType } from '../../types/hotel'
import './index.css'

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

const HotelAddPage = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [roomTypes, setRoomTypes] = useState<IRoomType[]>([
    { id: '1', name: '', price: 0, area: 0, bedType: '' }
  ])
  const { addHotel } = useHotelStore()

  const handleSubmit = async (values: IHotelFormValues) => {
    setLoading(true)
    try {
      const hotelData = {
        ...values,
        roomTypes: roomTypes.filter(r => r.name && r.price > 0),
        rating: 4.5,
        distance: 2.0,
        facilities: values.facilities ? values.facilities.split(',').map(f => f.trim()) : []
      }

      await addHotel(hotelData)
      message.success('酒店信息录入成功，等待审核')
      form.resetFields()
      setRoomTypes([{ id: '1', name: '', price: 0, area: 0, bedType: '' }])
    } catch {
      message.error('录入失败')
    } finally {
      setLoading(false)
    }
  }

  const addRoomType = () => {
    setRoomTypes([
      ...roomTypes,
      { id: Date.now().toString(), name: '', price: 0, area: 0, bedType: '' }
    ])
  }

  const removeRoomType = (id: string) => {
    if (roomTypes.length > 1) {
      setRoomTypes(roomTypes.filter(r => r.id !== id))
    }
  }

  const updateRoomType = (id: string, field: keyof IRoomType, value: string | number) => {
    setRoomTypes(roomTypes.map(r =>
      r.id === id ? { ...r, [field]: value } : r
    ))
  }

  return (
    <div className="hotel-add-container">
      <h2>酒店信息录入</h2>
      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          size="large"
          initialValues={{
            star: 3,
            price: 200,
            phone: '010-12345678',
            openDate: '2024-01-01',
            imageUrl: 'https://picsum.photos/seed/new/400/300'
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="nameCn"
                label="酒店中文名"
                rules={[{ required: true, message: '请输入酒店中文名' }]}
              >
                <Input placeholder="请输入酒店中文名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="nameEn"
                label="酒店英文名"
              >
                <Input placeholder="请输入酒店英文名" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label="地址"
            rules={[{ required: true, message: '请输入地址' }]}
          >
            <Input placeholder="请输入酒店地址" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="star"
                label="星级"
                rules={[{ required: true, message: '请选择星级' }]}
              >
                <Select placeholder="请选择星级">
                  <Option value={3}>3星级</Option>
                  <Option value={4}>4星级</Option>
                  <Option value={5}>5星级</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="price"
                label="最低价格"
                rules={[{ required: true, message: '请输入价格' }]}
              >
                <InputNumber
                  min={0}
                  placeholder="价格"
                  style={{ width: '100%' }}
                  addonAfter="元"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="openDate"
                label="开业时间"
                rules={[{ required: true, message: '请输入开业时间' }]}
              >
                <Input placeholder="YYYY-MM-DD" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="联系电话"
                rules={[{ required: true, message: '请输入联系电话' }]}
              >
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="imageUrl"
                label="图片链接"
                rules={[{ required: true, message: '请输入图片链接' }]}
              >
                <Input placeholder="请输入图片链接" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="酒店简介"
          >
            <TextArea rows={4} placeholder="请输入酒店简介" />
          </Form.Item>

          <Form.Item
            name="facilities"
            label="设施服务（用逗号分隔）"
          >
            <Input placeholder="如：免费WiFi, 停车场, 健身房" />
          </Form.Item>

          <Divider>房型管理</Divider>

          {roomTypes.map((room) => (
            <div key={room.id} className="room-type-form">
              <Row gutter={16} align="middle">
                <Col span={6}>
                  <Input
                    placeholder="房型名称"
                    value={room.name}
                    onChange={(e) => updateRoomType(room.id, 'name', e.target.value)}
                  />
                </Col>
                <Col span={5}>
                  <InputNumber
                    placeholder="价格"
                    min={0}
                    value={room.price}
                    onChange={(value) => updateRoomType(room.id, 'price', value ?? 0)}
                    style={{ width: '100%' }}
                    addonAfter="元"
                  />
                </Col>
                <Col span={5}>
                  <InputNumber
                    placeholder="面积"
                    min={0}
                    value={room.area}
                    onChange={(value) => updateRoomType(room.id, 'area', value ?? 0)}
                    style={{ width: '100%' }}
                    addonAfter="㎡"
                  />
                </Col>
                <Col span={6}>
                  <Input
                    placeholder="床型"
                    value={room.bedType}
                    onChange={(e) => updateRoomType(room.id, 'bedType', e.target.value)}
                  />
                </Col>
                <Col span={2}>
                  <Button
                    danger
                    disabled={roomTypes.length === 1}
                    onClick={() => removeRoomType(room.id)}
                  >
                    删除
                  </Button>
                </Col>
              </Row>
            </div>
          ))}

          <Form.Item>
            <Button type="dashed" onClick={addRoomType} block>
              + 添加房型
            </Button>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading} size="large">
                提交审核
              </Button>
              <Button size="large" onClick={() => form.resetFields()}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default HotelAddPage
