import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, Badge } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  MessageOutlined,
  AudioOutlined,
  NotificationOutlined,
  BellOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={240}
        style={{ borderRight: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          overflow: 'hidden'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 900,
            fontSize: collapsed ? '18px' : '24px',
            letterSpacing: '2px',
            transition: 'all 0.3s'
          }}>
            SOUL<span style={{ fontSize: collapsed ? '12px' : '14px', marginLeft: 4, color: '#e5e7eb', WebkitTextFillColor: '#e5e7eb' }}>OS</span>
          </div>
        </div>
        <Menu
          theme="dark"
          selectedKeys={[location.pathname]}
          mode="inline"
          onClick={({ key }) => navigate(key)}
          style={{ marginTop: 16, borderRight: 'none' }}
          items={[
            { key: '/', icon: <DashboardOutlined />, label: '元宇宙枢纽' },
            { key: '/users', icon: <UserOutlined />, label: '星球居民' },
            { key: '/moments', icon: <MessageOutlined />, label: '瞬间广场' },
            { key: '/voicerooms', icon: <AudioOutlined />, label: '异星派对' },
            { key: '/announcements', icon: <NotificationOutlined />, label: '系统广播' },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div style={{ color: '#fff', fontSize: 18, cursor: 'pointer' }} onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>

          <Space size="large">
            <Badge dot color="#22d3ee">
              <BellOutlined style={{ fontSize: 20, color: '#9ca3af', cursor: 'pointer' }} />
            </Badge>
            <Dropdown menu={{ items: [{ key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true }] }}>
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 8 }}>
                <Avatar src="https://api.dicebear.com/7.x/adventurer/svg?seed=admin&backgroundColor=b6e3f4" />
                <span style={{ color: '#e5e7eb', fontWeight: 500 }}>管理员</span>
              </div>
            </Dropdown>
          </Space>
        </Header>
        <Content style={{ margin: '24px 24px 0', overflow: 'initial' }}>
          <div style={{
            minHeight: 'calc(100vh - 112px)',
          }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
