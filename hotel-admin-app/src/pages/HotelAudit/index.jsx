import { useState } from 'react';
import { Table, Button, Tag, Modal, Input, message, Space, Card, Popconfirm, Image } from 'antd';
import { CheckOutlined, CloseOutlined, PoweroffOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useHotelStore } from '../../store/hotelContext';
import './index.css';

const { TextArea } = Input;

const HotelAuditPage = () => {
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [currentHotel, setCurrentHotel] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const { hotels, updateHotelStatus, toggleHotelOnline, currentUser, logout } = useHotelStore();
  const navigate = useNavigate();

  const getStatusTag = (status) => {
    switch (status) {
      case 'pending':
        return <Tag color="gold">审核中</Tag>;
      case 'approved':
        return <Tag color="green">已通过</Tag>;
      case 'rejected':
        return <Tag color="red">已拒绝</Tag>;
      default:
        return <Tag>未知</Tag>;
    }
  };

  const handleApprove = (hotelId) => {
    updateHotelStatus(hotelId, 'approved');
    message.success('审核通过');
  };

  const handleRejectClick = (hotel) => {
    setCurrentHotel(hotel);
    setRejectReason('');
    setRejectModalVisible(true);
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      message.error('请输入拒绝原因');
      return;
    }
    updateHotelStatus(currentHotel.id, 'rejected', rejectReason);
    setRejectModalVisible(false);
    message.success('已拒绝');
  };

  const handleToggleOnline = (hotelId) => {
    toggleHotelOnline(hotelId);
    message.success('状态已更新');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const columns = [
    {
      title: '酒店图片',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 120,
      render: (imageUrl) => (
        <Image
          width={80}
          height={60}
          src={imageUrl}
          style={{ borderRadius: 4, objectFit: 'cover' }}
        />
      ),
    },
    {
      title: '酒店名称',
      dataIndex: 'nameCn',
      key: 'nameCn',
      width: 200,
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
    },
    {
      title: '星级',
      dataIndex: 'star',
      key: 'star',
      width: 80,
      render: (star) => `${star}星级`,
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price) => `¥${price}`,
    },
    {
      title: '审核状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => getStatusTag(status),
    },
    {
      title: '上线状态',
      dataIndex: 'isOnline',
      key: 'isOnline',
      width: 100,
      render: (isOnline, record) => (
        <Tag color={isOnline ? 'green' : 'default'}>
          {isOnline ? '已上线' : '已下线'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 280,
      render: (_, record) => (
        <Space size="small">
          {record.status === 'pending' && (
            <>
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record.id)}
              >
                通过
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseOutlined />}
                onClick={() => handleRejectClick(record)}
              >
                拒绝
              </Button>
            </>
          )}
          {record.status === 'approved' && (
            <Popconfirm
              title={record.isOnline ? '确定要下线吗？' : '确定要上线吗？'}
              onConfirm={() => handleToggleOnline(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                size="small"
                type={record.isOnline ? 'default' : 'primary'}
                icon={<PoweroffOutlined />}
              >
                {record.isOnline ? '下线' : '上线'}
              </Button>
            </Popconfirm>
          )}
          {record.status === 'rejected' && (
            <Tag color="orange">
              原因: {record.rejectReason}
            </Tag>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="hotel-audit-container">
      <div className="page-header">
        <h1>酒店审核管理</h1>
        <div className="user-info">
          <span>欢迎，管理员 {currentUser?.username}</span>
          <Button type="link" onClick={handleLogout}>退出</Button>
        </div>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={hotels}
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
        title="拒绝原因"
        open={rejectModalVisible}
        onOk={handleReject}
        onCancel={() => setRejectModalVisible(false)}
        okText="确认"
        cancelText="取消"
      >
        <TextArea
          rows={4}
          placeholder="请输入拒绝原因"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default HotelAuditPage;
