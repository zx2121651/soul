import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import MainLayout from './layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Moments from './pages/Moments';
import VoiceRooms from './pages/VoiceRooms';

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#22d3ee', // Soul Cyan
          colorBgBase: '#12141d', // 深空背景
          colorBgContainer: '#1c1e2b', // 卡片/容器背景
          colorBgElevated: '#2a2c3d', // 弹出层背景
          borderRadius: 12, // 年轻化大圆角
          wireframe: false,
          colorTextBase: '#e5e7eb', // 柔和的白色文本
          fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif",
        },
        components: {
          Layout: {
            headerBg: 'rgba(28, 30, 43, 0.8)',
            siderBg: '#171822',
            bodyBg: '#12141d',
          },
          Menu: {
            darkItemBg: '#171822',
            darkItemSelectedBg: 'rgba(34, 211, 238, 0.15)',
            darkItemSelectedColor: '#22d3ee',
          },
          Card: {
            colorBorderSecondary: 'rgba(255, 255, 255, 0.08)',
          }
        }
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="moments" element={<Moments />} />
            <Route path="voicerooms" element={<VoiceRooms />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
