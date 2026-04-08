import React, { useEffect, useState } from 'react';
import { Table, Card, Button, message, Popconfirm, Tag, Avatar, Space, Typography, Image } from 'antd';
import { DeleteOutlined, PictureOutlined, AudioOutlined, FileTextOutlined } from '@ant-design/icons';
import { api } from '../api/client';

const { Title, Paragraph } = Typography;

interface MomentData {
  id: number;
  content: string;
  type: string;
  media_urls: string;
  likes: number;
  created_at: string;
  author_name: string;
  author_avatar: string;
}

const Moments: React.FC = () => {
  const [data, setData] = useState<MomentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // 获取瞬间动态列表
  const fetchMoments = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/admin/moments');
      setData(res.items || []);
      setTotal(res.total || 0);
    } catch (err) {
      message.error('获取动态列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoments();
  }, []);

  // 删除(下架)违规动态处理函数
  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/admin/moments/${id}`);
      message.success('该违规动态已被强制下架');
      // 删除成功后重新拉取列表
      fetchMoments();
    } catch (err) {
      message.error('下架动态失败');
    }
  };

  const getTypeTag = (type: string) => {
    switch (type) {
      case 'image': return <Tag icon={<PictureOutlined />} color="purple">图文</Tag>;
      case 'voice': return <Tag icon={<AudioOutlined />} color="cyan">语音</Tag>;
      default: return <Tag icon={<FileTextOutlined />} color="blue">纯文字</Tag>;
    }
  };

  const columns = [
    {
      title: '动态 ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '发布者',
      key: 'author',
      width: 150,
      render: (_: any, record: MomentData) => (
        <Space>
          <Avatar src={record.author_avatar} />
          <span style={{ color: '#22d3ee' }}>{record.author_name}</span>
        </Space>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => getTypeTag(type)
    },
    {
      title: '内容详情',
      key: 'content',
      render: (_: any, record: MomentData) => (
        <div style={{ maxWidth: 400 }}>
          <Paragraph ellipsis={{ rows: 2, expandable: true, symbol: '展开' }} style={{ marginBottom: record.media_urls ? 8 : 0 }}>
            {record.content || '无文字内容'}
          </Paragraph>
          {record.media_urls && record.type === 'image' && (
            <Image
              width={80}
              height={80}
              src={record.media_urls}
              style={{ borderRadius: 8, objectFit: 'cover' }}
              fallback="https://via.placeholder.com/80?text=Error"
            />
          )}
        </div>
      )
    },
    {
      title: '获赞数',
      dataIndex: 'likes',
      key: 'likes',
      width: 100,
      render: (likes: number) => <span style={{ color: '#ec4899', fontWeight: 'bold' }}>{likes} ❤️</span>
    },
    {
      title: '发布时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: MomentData) => (
        <Popconfirm
          title="强制下架动态"
          description="该动态疑似违规，确定要强制下架并删除吗？"
          onConfirm={() => handleDelete(record.id)}
          okText="确认下架"
          cancelText="取消"
          okButtonProps={{ danger: true }}
        >
          <Button danger type="text" icon={<DeleteOutlined />}>
            下架
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0, fontWeight: 'bold' }}>瞬间广场 (动态) 审查</Title>
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

export default Moments;
