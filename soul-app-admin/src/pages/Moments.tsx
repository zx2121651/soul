import React, { useEffect, useState } from 'react';
import { Table, Avatar, Tag, Card, Typography, Image, Space } from 'antd';
import { api } from '../api/client';
import { HeartOutlined, MessageOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

interface Moment {
  id: number;
  uuid: string;
  content: string;
  type: 'text' | 'image' | 'voice';
  media_urls: string[];
  likes: number;
  comments: number;
  created_at: string;
  author_name: string;
  author_avatar: string;
}

const Moments: React.FC = () => {
  const [data, setData] = useState<Moment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

  const fetchMoments = async (page: number, pageSize: number) => {
    setLoading(true);
    try {
      const res: any = await api.get('/admin/moments', {
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
    fetchMoments(pagination.current, pagination.pageSize);
  }, [pagination]);

  const columns = [
    {
      title: '发布者',
      key: 'author',
      width: 200,
      render: (_: any, record: Moment) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar src={record.author_avatar} size="small" />
          <span style={{ color: '#e5e7eb', fontWeight: 500 }}>{record.author_name}</span>
        </div>
      )
    },
    {
      title: '内容',
      key: 'content',
      width: 400,
      render: (_: any, record: Moment) => (
        <div>
          <Paragraph ellipsis={{ rows: 2 }} style={{ color: '#d1d5db', marginBottom: 8, maxWidth: 350 }}>
            {record.content}
          </Paragraph>
          {record.type === 'image' && record.media_urls && record.media_urls.length > 0 && (
            <Space>
              {record.media_urls.slice(0, 3).map((url, idx) => (
                <Image key={idx} src={url} width={40} height={40} style={{ borderRadius: 4, objectFit: 'cover' }} />
              ))}
              {record.media_urls.length > 3 && <Tag>+{record.media_urls.length - 3}</Tag>}
            </Space>
          )}
          {record.type === 'voice' && (
            <Tag color="cyan">声音瞬间</Tag>
          )}
        </div>
      )
    },
    {
      title: '互动数据',
      key: 'stats',
      width: 150,
      render: (_: any, record: Moment) => (
        <Space size="middle" style={{ color: '#9ca3af' }}>
          <span><HeartOutlined style={{ color: '#ec4899' }} /> {record.likes}</span>
          <span><MessageOutlined style={{ color: '#3b82f6' }} /> {record.comments}</span>
        </Space>
      )
    },
    {
      title: '发布时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (text: string) => <span style={{ color: '#9ca3af' }}>{new Date(text).toLocaleString()}</span>
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: () => (
        <a style={{ color: '#ef4444' }}>删除</a>
      )
    }
  ];

  return (
    <div>
      <Title level={4} style={{ marginTop: 0, marginBottom: 24, fontWeight: 'bold' }}>瞬间广场审核</Title>
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
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};

export default Moments;
