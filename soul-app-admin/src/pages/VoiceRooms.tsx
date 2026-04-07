import React, { useEffect, useState } from 'react';
import { Table, Avatar, Tag, Card, Typography } from 'antd';
import { api } from '../api/client';
import { AudioOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface VoiceRoom {
  id: number;
  uuid: string;
  title: string;
  tags: string[];
  status: string;
  created_at: string;
  owner_name: string;
  owner_avatar: string;
}

const VoiceRooms: React.FC = () => {
  const [data, setData] = useState<VoiceRoom[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const fetchRooms = async (page: number, pageSize: number) => {
    setLoading(true);
    try {
      const res: any = await api.get('/admin/voicerooms', {
        params: { limit: pageSize, offset: (page - 1) * pageSize }
      });
      setData(res.items);
      setTotal(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms(pagination.current, pagination.pageSize);
  }, [pagination]);

  const columns = [
    {
      title: '派对主题',
      key: 'title',
      render: (_: any, record: VoiceRoom) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 40, height: 40, borderRadius: 8, background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AudioOutlined style={{ color: 'white', fontSize: 20 }} />
          </div>
          <div>
            <div style={{ fontWeight: 'bold', color: '#e5e7eb', fontSize: 16 }}>{record.title}</div>
            <div style={{ color: '#9ca3af', fontSize: 12 }}>Room ID: {record.uuid}</div>
          </div>
        </div>
      )
    },
    {
      title: '房主',
      key: 'owner',
      render: (_: any, record: VoiceRoom) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar src={record.owner_avatar} size="small" />
          <span style={{ color: '#d1d5db' }}>{record.owner_name}</span>
        </div>
      )
    },
    {
      title: '标签',
      key: 'tags',
      render: (_: any, record: VoiceRoom) => (
        <>
          {record.tags && record.tags.length > 0 ? (
            record.tags.map(tag => <Tag key={tag} color="cyan">#{tag}</Tag>)
          ) : (
            <span style={{ color: '#6b7280' }}>无标签</span>
          )}
        </>
      )
    },
    {
      title: '状态',
      key: 'status',
      render: (_: any, record: VoiceRoom) => (
        <Tag color={record.status === 'active' ? 'success' : 'default'}>
          {record.status === 'active' ? '进行中' : '已结束'}
        </Tag>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: string) => <span style={{ color: '#9ca3af' }}>{new Date(text).toLocaleString()}</span>
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <a style={{ color: '#ef4444' }}>强制解散</a>
      )
    }
  ];

  return (
    <div>
      <Title level={4} style={{ marginTop: 0, marginBottom: 24, fontWeight: 'bold' }}>异星派对管理</Title>
      <Card bordered={false} style={{ background: '#1c1e2b' }}>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            total,
            onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
            showSizeChanger: true
          }}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
};

export default VoiceRooms;
