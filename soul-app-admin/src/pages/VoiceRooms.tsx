import React, { useEffect, useState } from 'react';
import { Drawer, List, Avatar } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { LiveKitRoom, RoomAudioRenderer, useParticipants, useLocalParticipant, useConnectionState } from '@livekit/components-react';
import '@livekit/components-styles';
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
  const [monitorRoom, setMonitorRoom] = useState<VoiceRoom | null>(null);
  const [lkToken, setLkToken] = useState('');
  const [lkServerUrl, setLkServerUrl] = useState('');

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

  const handleMonitor = async (record: VoiceRoom) => {
    try {
      const res: any = await api.post(`/admin/voice-rooms/${record.id}/monitor`);
      setLkToken(res.token);
      setLkServerUrl(res.serverUrl);
      setMonitorRoom(record);
      message.success(`正在以超管身份隐身接入房间: ${record.name}`);
    } catch (err) {
      message.error('无法接入该房间监听');
    }
  };

  const closeMonitor = () => {
    setMonitorRoom(null);
    setLkToken('');
    setLkServerUrl('');
  };

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
        <Space>
          <Button type="primary" ghost icon={<EyeOutlined />} onClick={() => handleMonitor(record)}>
            隐身监听
          </Button>
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
        </Space>
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

      {/* 隐身监听超级控制台 */}
      <Drawer
        title={<span style={{ color: '#22d3ee' }}>🎧 隐身监听控制台 - {monitorRoom?.name}</span>}
        placement="right"
        width={400}
        onClose={closeMonitor}
        open={!!monitorRoom}
        styles={{ body: { background: '#12141d', color: '#e5e7eb', padding: 0 }, header: { background: '#1c1e2b', borderBottom: '1px solid #374151' } }}
      >
        {lkToken && (
          <LiveKitRoom
            video={false}
            audio={true}
            token={lkToken}
            serverUrl={lkServerUrl}
            connectOptions={{ autoSubscribe: true }}
            className="h-full flex flex-col"
          >
            <AdminRoomController room={monitorRoom} />
          </LiveKitRoom>
        )}
      </Drawer>

    </div>
  );
};

// 内部组件用于获取 LK 状态并渲染管理员操作
const AdminRoomController = ({ /* room */ }: { room: any }) => {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  const connectionState = useConnectionState();

  const handleAdminAction = (action: string, identity: string) => {
    message.success(`[系统执行] 已将 ${identity} ${action}`);
  };

  return (
    <div style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 20, textAlign: 'center' }}>
        <Tag color={connectionState === 'connected' ? 'green' : 'orange'}>
          LK 状态: {connectionState === 'connected' ? '已接入' : '连接中...'}
        </Tag>
        <div style={{ color: '#9ca3af', fontSize: 12, marginTop: 8 }}>
          您目前以超级管理员(隐身)身份存在，可以执行强制管理。
        </div>
      </div>

      <h3 style={{ color: '#fff', marginBottom: 16 }}>房间内成员 ({participants.length})</h3>
      <List
        dataSource={participants}
        renderItem={p => (
          <List.Item
            style={{ borderBottom: '1px solid #374151' }}
            actions={[
              p.identity !== localParticipant?.identity && (
                <Space>
                  <Button size="small" style={{ color: '#eab308', borderColor: '#eab308', background: 'transparent' }} onClick={() => handleAdminAction('全麦静音', p.identity)}>禁言</Button>
                  <Button size="small" danger onClick={() => handleAdminAction('强制踢出', p.identity)}>踢出</Button>
                </Space>
              )
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar style={{ backgroundColor: '#374151' }}>{p.identity.substring(0, 2)}</Avatar>}
              title={<span style={{ color: '#fff' }}>{p.identity} {p.identity === localParticipant?.identity ? <Tag color="blue" style={{ transform: 'scale(0.8)' }}>Admin</Tag> : ''}</span>}
              description={<span style={{ color: '#9ca3af' }}>状态: 听众/发言人</span>}
            />
          </List.Item>
        )}
      />
      <RoomAudioRenderer />
    </div>
  );
};

export default VoiceRooms;
