import React, { useEffect, useState } from 'react';
import { Table, Card, Button, message, Popconfirm, Tag, Space, Typography } from 'antd';
import { DeleteOutlined, AudioOutlined } from '@ant-design/icons';
import { api } from '../api/client';

const { Title } = Typography;

interface VoiceRoom {
  id: number;
  name: string;
  host_name: string;
  online_count: number;
  status: string;
  created_at: string;
}

const VoiceRooms: React.FC = () => {
  const [data, setData] = useState<VoiceRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // 获取语音房列表数据
  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/admin/voice-rooms');
      setData(res.items || []);
      setTotal(res.total || 0);
    } catch (err) {
      message.error('获取语音房列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // 删除(下架)语音房处理函数
  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/admin/voice-rooms/${id}`);
      message.success('语音房下架成功');
      // 删除成功后重新拉取列表
      fetchRooms();
    } catch (err) {
      message.error('删除语音房失败');
    }
  };

  const columns = [
    {
      title: '房间 ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '房间名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space>
          <AudioOutlined style={{ color: '#ec4899' }} />
          <span style={{ fontWeight: 500 }}>{text}</span>
        </Space>
      ),
    },
    {
      title: '房主昵称',
      dataIndex: 'host_name',
      key: 'host_name',
    },
    {
      title: '当前在线人数',
      dataIndex: 'online_count',
      key: 'online_count',
      render: (count: number) => (
        <Tag color="cyan">{count} 人在线</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '活跃中' : '已关闭'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: VoiceRoom) => (
        <Popconfirm
          title="强制下架房间"
          description="确定要下架并删除这个语音房吗？此操作不可恢复。"
          onConfirm={() => handleDelete(record.id)}
          okText="确定下架"
          cancelText="取消"
          okButtonProps={{ danger: true }}
        >
          <Button danger type="text" icon={<DeleteOutlined />}>
            下架房间
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0, fontWeight: 'bold' }}>异星派对 (语音房) 管理</Title>
      </div>
      <Card bordered={false} style={{ background: '#1c1e2b' }}>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{ total, pageSize: 50 }}
        />
      </Card>
    </div>
  );
};

export default VoiceRooms;
