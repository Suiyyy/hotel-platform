import { useState, useEffect, useRef } from 'react'
import { Table, Button, Tag, Card, message, Space, Image, Popconfirm, notification, Typography } from 'antd'
import { EditOutlined, DeleteOutlined, ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { fetchMyHotels, deleteHotel, getBaseUrl } from '../../services/hotelApi'
import './index.css'

const resolveImageUrl = (url) => {
  if (!url) return ''
  return url.startsWith('/') ? `${getBaseUrl()}${url}` : url
}

const HotelListPage = () => {
  const [myHotels, setMyHotels] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const wsRef = useRef(null)

  const loadHotels = async () => {
    setLoading(true)
    try {
      const data = await fetchMyHotels()
      setMyHotels(data)
    } catch {
      message.error('加载酒店列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHotels()

    const wsUrl = getBaseUrl().replace(/^http/, 'ws')
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'AUDIT_RESULT') {
          const isApproved = data.status === 'approved'
          notification[isApproved ? 'success' : 'error']({
            message: isApproved ? '审核通过' : '审核被拒绝',
            description: isApproved
              ? `您的「${data.hotelName}」已通过审核`
              : `您的「${data.hotelName}」被拒绝：${data.rejectReason}`,
            icon: isApproved
              ? <CheckCircleOutlined style={{ color: '#52c41a' }} />
              : <CloseCircleOutlined style={{ color: '#f5222d' }} />,
            placement: 'topRight',
            duration: 6,
          })
          loadHotels()
        }
      } catch { /* ignore */ }
    }

    return () => { try { ws.close() } catch { /* ignore */ } }
  }, [])

  const handleDelete = async (id) => {
    try {
      await deleteHotel(id)
      message.success('已下线')
      loadHotels()
    } catch {
      message.error('操作失败')
    }
  }

  const getStatusTag = (status) => {
    const map = { pending: { color: 'gold', text: '审核中' }, approved: { color: 'green', text: '已通过' }, rejected: { color: 'red', text: '已拒绝' } }
    const item = map[status] || { color: 'default', text: '未知' }
    return <Tag color={item.color}>{item.text}</Tag>
  }

  const columns = [
    {
      title: '图片',
      dataIndex: 'imageUrl',
      width: 100,
      render: (url) => <Image width={80} height={60} src={resolveImageUrl(url)} style={{ borderRadius: 4, objectFit: 'cover' }} />
    },
    { title: '酒店名称', dataIndex: 'nameCn', width: 200 },
    { title: '地址', dataIndex: 'address', ellipsis: true },
    { title: '星级', dataIndex: 'star', width: 80, render: (s) => `${s}星` },
    { title: '价格', dataIndex: 'price', width: 100, render: (p) => `¥${p}` },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status) => getStatusTag(status)
    },
    {
      title: '上线',
      dataIndex: 'isOnline',
      width: 80,
      render: (v) => <Tag color={v ? 'green' : 'default'}>{v ? '上线' : '下线'}</Tag>
    },
    {
      title: '操作',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => navigate(`/edit-hotel/${record.id}`)}>
            编辑
          </Button>
          {record.isOnline && (
            <Popconfirm title="确定要下线吗？" onConfirm={() => handleDelete(record.id)} okText="确定" cancelText="取消">
              <Button size="small" danger icon={<DeleteOutlined />}>下线</Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ]

  return (
    <div className="hotel-list-container">
      <Typography.Title level={4} className="page-title">我的酒店</Typography.Title>
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Button icon={<ReloadOutlined />} onClick={loadHotels} loading={loading}>刷新</Button>
        </div>
        <Table columns={columns} dataSource={myHotels} rowKey="id" loading={loading}
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 条` }}
          expandable={{
            expandedRowRender: (record) => record.rejectReason ? <p style={{ margin: 0, color: '#f5222d' }}>拒绝原因：{record.rejectReason}</p> : null,
            rowExpandable: (record) => record.status === 'rejected' && !!record.rejectReason
          }}
        />
      </Card>
    </div>
  )
}

export default HotelListPage
