import React, { useEffect, useState } from 'react';
import { Table, Card, Button, message, Popconfirm, Tag, Avatar, Typography, Segmented, Drawer, Descriptions, List, Image } from 'antd';
import { UserOutlined, CheckCircleOutlined, StopOutlined, EyeOutlined } from '@ant-design/icons';
import { api } from '../api/client';

const { Title } = Typography;

interface UserData {
  id: number;
  uuid: string;
  name: string;
  phone: string;
  avatar: string;
  bio: string;
  created_at: string;
}

const Users: React.FC = () => {
  const [data, setData] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentStatus, setCurrentStatus] = useState<string>('active');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerUser, setDrawerUser] = useState<UserData | null>(null);
  const [drawerMoments, setDrawerMoments] = useState<any[]>([]);

  // 获取星球居民(用户)列表
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res: any = await api.get(`/admin/users?status=${currentStatus}`);
      setData(res.items || []);
      setTotal(res.total || 0);
    } catch (err) {
      message.error('获取星球居民列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentStatus]);


  const showUserDetail = async (user: UserData) => {
    setDrawerUser(user);
    setDrawerVisible(true);
    // 拉取该用户的历史动态
    try {
      const res: any = await api.get(`/admin/moments?userId=${user.id}`);
      setDrawerMoments(res.items || []);
    } catch (err) {
      message.error('无法获取该居民的历史瞬间');
    }
  };


  // 恢复(解封)用户处理函数
  const handleRestore = async (id: number) => {
    try {
      await api.post(`/admin/users/${id}/restore`);
      message.success('该居民已成功解封并恢复访问权限');
      fetchUsers();
    } catch (err) {
      message.error('解封操作失败');
    }
  };

  // 封禁(逻辑删除)用户处理函数
  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/admin/users/${id}`);
      message.success('该居民已被成功封禁');
      // 删除成功后重新拉取列表
      fetchUsers();
    } catch (err) {
      message.error('封禁操作失败');
    }
  };

  const columns = [
    {
      title: '居民 ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '头像',
      dataIndex: 'avatar',
      key: 'avatar',
      width: 80,
      render: (avatar: string) => <Avatar src={avatar} icon={<UserOutlined />} />
    },
    {
      title: '昵称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span style={{ fontWeight: 500, color: '#22d3ee' }}>{text}</span>
    },
    {
      title: '唯一 UUID',
      dataIndex: 'uuid',
      key: 'uuid',
      render: (uuid: string) => <Tag color="blue">{uuid}</Tag>
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '个人签名',
      dataIndex: 'bio',
      key: 'bio',
      ellipsis: true,
      render: (bio: string) => <span style={{ color: '#9ca3af' }}>{bio || '这个人很神秘，什么都没写'}</span>
    },
    {
      title: '入驻时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: UserData) => {
        if (currentStatus === 'banned') {
          return (
            <Popconfirm
              title="解除封禁"
              description="确定要解封该用户，恢复其所有星际权限吗？"
              onConfirm={() => handleRestore(record.id)}
              okText="确认解封"
              cancelText="取消"
            >
              <Button type="text" style={{ color: '#10b981' }} icon={<CheckCircleOutlined />}>
                一键解封
              </Button>
            </Popconfirm>
          );
        }
        return (
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button type="text" icon={<EyeOutlined />} style={{ color: '#22d3ee' }} onClick={() => showUserDetail(record)}>
              深度审查
            </Button>
            <Popconfirm
              title="警告：封禁该居民"
              description="确定要封禁这个星球居民吗？其账号将被冻结。"
              onConfirm={() => handleDelete(record.id)}
              okText="确认封禁"
              cancelText="取消"
              okButtonProps={{ danger: true }}
            >
              <Button danger type="text" icon={<StopOutlined />}>
                封禁冻结
              </Button>
            </Popconfirm>
          </div>
        );
        return (
          <Popconfirm
            title="警告：封禁该居民"
            description="确定要封禁这个星球居民吗？其账号将被冻结。"
            onConfirm={() => handleDelete(record.id)}
            okText="确认封禁"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button danger type="text" icon={<StopOutlined />}>
              封禁冻结
            </Button>
          </Popconfirm>
        );
      },
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0, fontWeight: 'bold' }}>星球居民 (用户) 管理</Title>
        <Segmented
          options={[
            { label: '正常居民', value: 'active' },
            { label: '已封禁名单', value: 'banned' },
          ]}
          value={currentStatus}
          onChange={(value) => setCurrentStatus(value as string)}
          style={{ background: '#111827', color: '#9ca3af' }}
        />
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

      {/* 用户深度审查抽屉 */}
      <Drawer
        title={<span style={{ color: '#e5e7eb' }}>🛸 星球居民深度审查档案</span>}
        placement="right"
        width={500}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        styles={{ body: { background: '#12141d', color: '#e5e7eb' }, header: { background: '#1c1e2b', borderBottom: '1px solid #374151' } }}
      >
        {drawerUser && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar src={drawerUser.avatar} size={80} style={{ border: '2px solid #22d3ee', marginBottom: 12 }} />
              <h2 style={{ color: '#fff', margin: 0 }}>{drawerUser.name}</h2>
              <Tag color="blue" style={{ marginTop: 8 }}>UUID: {drawerUser.uuid}</Tag>
            </div>

            <Descriptions title={<span style={{ color: '#22d3ee' }}>基础数据</span>} column={1} labelStyle={{ color: '#9ca3af' }} contentStyle={{ color: '#e5e7eb', fontWeight: 'bold' }}>
              <Descriptions.Item label="入驻时间">{new Date(drawerUser.created_at).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="绑定手机">{drawerUser.phone}</Descriptions.Item>
              <Descriptions.Item label="个性签名">{drawerUser.bio || '（无签名）'}</Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 32 }}>
              <h3 style={{ color: '#22d3ee', marginBottom: 16, fontSize: '16px', fontWeight: 'bold' }}>历史瞬间追踪 ({drawerMoments.length})</h3>
              <List
                itemLayout="vertical"
                dataSource={drawerMoments}
                renderItem={(item: any) => (
                  <List.Item
                    key={item.id}
                    style={{ background: '#1c1e2b', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #374151' }}
                  >
                    <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '8px' }}>
                      动态 ID: {item.id} | 发布于: {new Date(item.created_at).toLocaleString()}
                    </div>
                    <div style={{ color: '#fff', marginBottom: '12px' }}>{item.content || '（无文本内容）'}</div>
                    {item.media_urls && (
                      <Image width={100} height={100} src={item.media_urls} style={{ borderRadius: '8px', objectFit: 'cover' }} />
                    )}
                    <div style={{ marginTop: '12px', display: 'flex', gap: '16px', color: '#ec4899', fontSize: '12px', fontWeight: 'bold' }}>
                       <span>❤️ {item.likes}</span>
                       <span style={{ color: '#6b7280' }}>状态: {item.status === 'active' ? '正常' : '已下架'}</span>
                    </div>
                  </List.Item>
                )}
              />
            </div>
          </>
        )}
      </Drawer>

    </div>
  );
};

export default Users;
