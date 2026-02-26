import { useState, useMemo, useEffect, useRef } from 'react'
import { Table, Button, Tag, Modal, Input, message, Space, Card, Popconfirm, Image, Tabs, notification } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { CheckOutlined, CloseOutlined, PoweroffOutlined, SearchOutlined, BellOutlined } from '@ant-design/icons'
import { useHotelStore } from '../../store/hotelContext'
import { getBaseUrl, fetchHotels } from '../../services/hotelApi'
import type { IHotel } from '../../types/hotel'
import './index.css'

const { TextArea } = Input

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected'

const HotelAuditPage = () => {
  const [rejectModalVisible, setRejectModalVisible] = useState(false)
  const [currentHotel, setCurrentHotel] = useState<IHotel | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchKeyword, setSearchKeyword] = useState('')
  const { hotels, updateHotelStatus, toggleHotelOnline, refreshHotels } = useHotelStore()
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const wsUrl = getBaseUrl().replace(/^http/, 'ws')
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'NEW_HOTEL') {
          notification.info({
            message: '新酒店待审核',
            description: `商家提交了「${data.hotelName}」，请及时审核`,
            icon: <BellOutlined style={{ color: '#faad14' }} />,
            placement: 'topRight',
            duration: 5,
          })
          refreshHotels()
        }
      } catch { /* ignore */ }
    }

    return () => { ws.close() }
  }, [])

  const filteredHotels = useMemo(() => {
    let list = hotels
    if (statusFilter !== 'all') {
      list = list.filter(h => h.status === statusFilter)
    }
    if (searchKeyword.trim()) {
      const kw = searchKeyword.trim().toLowerCase()
      list = list.filter(h => h.nameCn.toLowerCase().includes(kw) || h.address.toLowerCase().includes(kw))
    }
    return list
  }, [hotels, statusFilter, searchKeyword])

  const statusCounts = useMemo(() => ({
    all: hotels.length,
    pending: hotels.filter(h => h.status === 'pending').length,
    approved: hotels.filter(h => h.status === 'approved').length,
    rejected: hotels.filter(h => h.status === 'rejected').length
  }), [hotels])

  const getStatusTag = (status: IHotel['status']) => {
    const map = { pending: { color: 'gold', text: '审核中' }, approved: { color: 'green', text: '已通过' }, rejected: { color: 'red', text: '已拒绝' } }
    const item = map[status] || { color: 'default', text: '未知' }
    return <Tag color={item.color}>{item.text}</Tag>
  }

  const handleApprove = async (hotelId: string) => {
    try {
      await updateHotelStatus(hotelId, 'approved')
      message.success('审核通过')
    } catch {
      message.error('操作失败')
    }
  }

  const handleRejectClick = (hotel: IHotel) => {
    setCurrentHotel(hotel)
    setRejectReason('')
    setRejectModalVisible(true)
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      message.error('请输入拒绝原因')
      return
    }
    try {
      await updateHotelStatus(currentHotel!.id, 'rejected', rejectReason)
      setRejectModalVisible(false)
      message.success('已拒绝')
    } catch {
      message.error('操作失败')
    }
  }

  const handleToggleOnline = async (hotelId: string) => {
    try {
      await toggleHotelOnline(hotelId)
      message.success('状态已更新')
    } catch {
      message.error('操作失败')
    }
  }

  const resolveImageUrl = (url: string) => {
    if (!url) return ''
    return url.startsWith('/') ? `${getBaseUrl()}${url}` : url
  }

  const columns: ColumnsType<IHotel> = [
    {
      title: '酒店图片',
      dataIndex: 'imageUrl',
      width: 120,
      render: (imageUrl: string) => (
        <Image width={80} height={60} src={resolveImageUrl(imageUrl)} style={{ borderRadius: 4, objectFit: 'cover' }} />
      ),
    },
    { title: '酒店名称', dataIndex: 'nameCn', width: 200 },
    { title: '地址', dataIndex: 'address', ellipsis: true },
    { title: '星级', dataIndex: 'star', width: 80, render: (star: number) => `${star}星级` },
    { title: '价格', dataIndex: 'price', width: 100, render: (price: number) => `¥${price}` },
    { title: '审核状态', dataIndex: 'status', width: 100, render: (status: IHotel['status']) => getStatusTag(status) },
    {
      title: '上线状态',
      dataIndex: 'isOnline',
      width: 100,
      render: (isOnline: boolean) => (
        <Tag color={isOnline ? 'green' : 'default'}>{isOnline ? '已上线' : '已下线'}</Tag>
      ),
    },
    {
      title: '操作',
      width: 300,
      render: (_, record) => (
        <Space size="small">
          {record.status === 'pending' && (
            <>
              <Button type="primary" size="small" icon={<CheckOutlined />} onClick={() => handleApprove(record.id)}>通过</Button>
              <Button danger size="small" icon={<CloseOutlined />} onClick={() => handleRejectClick(record)}>拒绝</Button>
            </>
          )}
          {record.status === 'approved' && (
            <Popconfirm
              title={record.isOnline ? '确定要下线吗？（软删除）' : '确定要上线吗？'}
              onConfirm={() => handleToggleOnline(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button size="small" type={record.isOnline ? 'default' : 'primary'} icon={<PoweroffOutlined />}>
                {record.isOnline ? '下线' : '恢复上线'}
              </Button>
            </Popconfirm>
          )}
          {record.status === 'rejected' && (
            <Tag color="orange">原因: {record.rejectReason}</Tag>
          )}
        </Space>
      ),
    },
  ]

  const tabItems = [
    { key: 'all', label: `全部 (${statusCounts.all})` },
    { key: 'pending', label: `待审核 (${statusCounts.pending})` },
    { key: 'approved', label: `已通过 (${statusCounts.approved})` },
    { key: 'rejected', label: `已拒绝 (${statusCounts.rejected})` },
  ]

  return (
    <div className="hotel-audit-container">
      <h2>酒店审核管理</h2>
      <Card>
        <Tabs activeKey={statusFilter} onChange={(k) => setStatusFilter(k as StatusFilter)} items={tabItems} />
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="搜索酒店名称或地址"
            prefix={<SearchOutlined />}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
        </div>
        <Table
          columns={columns}
          dataSource={filteredHotels}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>

      <Modal
        title="拒绝原因（必填）"
        open={rejectModalVisible}
        onOk={handleReject}
        onCancel={() => setRejectModalVisible(false)}
        okText="确认拒绝"
        cancelText="取消"
      >
        <TextArea
          rows={4}
          placeholder="请输入拒绝原因（必填）"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>
    </div>
  )
}

export default HotelAuditPage
