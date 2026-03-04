import { useState, useEffect } from 'react'
import { Form, Input, InputNumber, Select, Button, Card, message, Space, Divider, Row, Col, Spin, Upload, Checkbox, Typography } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { patchHotel, getBaseUrl, aiPolish } from '../../services/hotelApi'
import { useHotelStore } from '../../store/hotelContext'
import '../HotelAdd/index.css'

const { Option } = Select
const { TextArea } = Input

const FACILITY_OPTIONS = [
  '免费WiFi', '停车场', '健身房', '游泳池', '餐厅',
  '商务中心', '洗衣服务', '行李寄存', '接机服务', '儿童乐园',
  'SPA', '私人沙滩', '会议室', '无烟楼层', '24小时前台'
]

const HotelEditPage = () => {
  const { id } = useParams()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [polishing, setPolishing] = useState(false)
  const [fileList, setFileList] = useState([])
  const [roomTypes, setRoomTypes] = useState([])
  const { hotels } = useHotelStore()
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
        facilities: hotel.facilities || []
      })
      setRoomTypes(hotel.roomTypes?.length ? hotel.roomTypes : [{ id: '1', name: '', price: 0, area: 0, bedType: '' }])

      if (hotel.imageUrl) {
        const imgUrl = hotel.imageUrl.startsWith('http')
          ? hotel.imageUrl
          : `${getBaseUrl()}${hotel.imageUrl}`
        setFileList([{
          uid: '-1',
          name: 'hotel-image',
          status: 'done',
          url: imgUrl,
        }])
      }
    }
  }, [hotel, form])

  const handleSubmit = async (values) => {
    if (!id) return
    setLoading(true)
    try {
      await patchHotel(id, {
        ...values,
        roomTypes: roomTypes.filter(r => r.name && r.price > 0),
        facilities: values.facilities || []
      })
      message.success('酒店信息已更新')
      navigate('/my-hotels')
    } catch {
      message.error('更新失败')
    } finally {
      setLoading(false)
    }
  }

  const handleUploadChange = (info) => {
    setFileList(info.fileList)
    const file = info.fileList[0]
    if (file?.status === 'done' && file.response?.url) {
      form.setFieldsValue({ imageUrl: file.response.url })
    }
    if (file?.status === 'error') {
      message.error('图片上传失败')
    }
  }

  const handlePolish = async () => {
    const desc = form.getFieldValue('description')
    if (!desc?.trim()) {
      message.warning('请先输入酒店简介')
      return
    }
    setPolishing(true)
    try {
      const { result, fallback } = await aiPolish(desc)
      form.setFieldsValue({ description: result })
      if (fallback) {
        message.info('AI 暂时不可用，已返回原文')
      } else {
        message.success('润色完成')
      }
    } catch {
      message.error('润色失败')
    } finally {
      setPolishing(false)
    }
  }

  const addRoomType = () => {
    setRoomTypes([...roomTypes, { id: Date.now().toString(), name: '', price: 0, area: 0, bedType: '' }])
  }

  const removeRoomType = (rid) => {
    if (roomTypes.length > 1) setRoomTypes(roomTypes.filter(r => r.id !== rid))
  }

  const updateRoomType = (rid, field, value) => {
    setRoomTypes(roomTypes.map(r => r.id === rid ? { ...r, [field]: value } : r))
  }

  if (!hotel) {
    return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" tip="加载中..." /></div>
  }

  return (
    <div className="hotel-add-container">
      <Typography.Title level={4} className="page-title">编辑酒店信息</Typography.Title>
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
              <Form.Item name="imageUrl" label="酒店图片" rules={[{ required: true, message: '请上传酒店图片' }]}>
                <Input type="hidden" />
              </Form.Item>
              <Upload
                action={`${getBaseUrl()}/upload`}
                name="file"
                listType="picture-card"
                maxCount={1}
                fileList={fileList}
                onChange={handleUploadChange}
                accept="image/*"
              >
                {fileList.length < 1 && (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>上传图片</div>
                  </div>
                )}
              </Upload>
            </Col>
          </Row>

          <Form.Item name="description" label="酒店简介">
            <TextArea rows={4} placeholder="请输入酒店简介" />
          </Form.Item>
          <Button className="ai-polish-btn" size="small" loading={polishing} onClick={handlePolish}>
            AI 润色
          </Button>

          <Form.Item name="facilities" label="设施服务" style={{ marginTop: 16 }}>
            <Checkbox.Group className="facility-checkbox-group">
              {FACILITY_OPTIONS.map(f => (
                <Checkbox key={f} value={f}>{f}</Checkbox>
              ))}
            </Checkbox.Group>
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
