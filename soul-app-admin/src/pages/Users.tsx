import React, { useEffect, useState } from 'react';
import { Table, Avatar, Tag, Card, Typography } from 'antd';
import { api } from '../api/client';

const { Title } = Typography;

interface User {
  id: number;
  uuid: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  followers: number;
  following: number;
  created_at: string;
}

const Users: React.FC = () => {
  const [data, setData] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const fetchUsers = async (page: number, pageSize: number) => {
    setLoading(true);
    try {
      const res: any = await api.get('/admin/users', {
        params: {
          limit: pageSize,
          offset: (page - 1) * pageSize
        }
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
    fetchUsers(pagination.current, pagination.pageSize);
  }, [pagination]);

  const columns = [
    {
      title: '居民信息',
      key: 'user',
      render: (_: any, record: User) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar src={record.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${record.uuid}&backgroundColor=b6e3f4`} size="large" />
          <div>
            <div style={{ fontWeight: 'bold', color: '#e5e7eb' }}>{record.name}</div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>@{record.username}</div>
          </div>
        </div>
      )
    },
    {
      title: '性别/年龄',
      key: 'genderAge',
      render: (_: any, record: User) => (
        <Tag color={record.gender === 'female' ? 'magenta' : record.gender === 'male' ? 'blue' : 'default'}>
          {record.gender === 'female' ? '♀' : record.gender === 'male' ? '♂' : '?'} {record.age || '-'}
        </Tag>
      )
    },
    {
      title: '签名',
      dataIndex: 'bio',
      key: 'bio',
      ellipsis: true,
      render: (text: string) => <span style={{ color: '#d1d5db' }}>{text || '-'}</span>
    },
    {
      title: '粉丝/关注',
      key: 'social',
      render: (_: any, record: User) => (
        <span style={{ color: '#9ca3af' }}>{record.followers} / {record.following}</span>
      )
    },
    {
      title: '入驻时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text: string) => <span style={{ color: '#9ca3af' }}>{new Date(text).toLocaleDateString()}</span>
    }
  ];

  return (
    <div>
      <Title level={4} style={{ marginTop: 0, marginBottom: 24, fontWeight: 'bold' }}>星球居民管理</Title>
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

export default Users;
