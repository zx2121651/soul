import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import React, { Suspense } from 'react';

// Lazy load pages
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const PlanetPage = React.lazy(() => import('./pages/PlanetPage'));
const ExplorePage = React.lazy(() => import('./pages/ExplorePage'));
const ChatPage = React.lazy(() => import('./pages/ChatPage'));
const MePage = React.lazy(() => import('./pages/MePage'));
const MomentDetailPage = React.lazy(() => import('./pages/MomentDetailPage'));
const UserProfilePage = React.lazy(() => import('./pages/UserProfilePage'));
const EditProfilePage = React.lazy(() => import('./pages/EditProfilePage'));
const VoiceRoomPage = React.lazy(() => import('./pages/VoiceRoomPage'));

// Layout components
import BottomNavBar from './components/BottomNavBar';
import TopBar from './components/TopBar';
import PostMomentEditor from './components/PostMomentEditor';

const FallbackLoader = () => (
  <div className="w-full h-full flex items-center justify-center bg-[#171822]">
    <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// 受保护的路由高阶组件：检查本地是否存在 token
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('soul_token');
  if (!token) {
    // 拦截到登录页
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// 页面包裹布局组件 (包含导航栏等公用UI)
const MainLayout = ({ children, onOpenEditor }: { children: React.ReactNode, onOpenEditor: () => void }) => {
  return (
    <>
      <TopBar />
      <div className="flex-1 overflow-hidden relative">
        <Suspense fallback={<FallbackLoader />}>
          {children}
        </Suspense>
      </div>
      <BottomNavBar onOpenEditor={onOpenEditor} />
    </>
  );
};

export default function App() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // 注释掉了之前的开发者模式一键自动登录机制
  // useEffect(() => {
  //   bootstrapApp();
  // }, []);

  return (
    <BrowserRouter>
      <div className="w-full h-screen bg-[#171822] overflow-hidden text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-100 flex flex-col relative antialiased">
        <Routes>
          {/* 公开路由 (登录/注册) */}
          <Route path="/login" element={
            <Suspense fallback={<FallbackLoader />}><LoginPage /></Suspense>
          } />
          <Route path="/register" element={
            <Suspense fallback={<FallbackLoader />}><RegisterPage /></Suspense>
          } />

          {/* 受保护的主应用路由体系 */}
          <Route path="/*" element={
            <ProtectedRoute>
              <MainLayout onOpenEditor={() => setIsEditorOpen(true)}>
                <Routes>
                  <Route path="/" element={<Navigate to="/planet" replace />} />
                  <Route path="/planet" element={<PlanetPage />} />
                  <Route path="/explore" element={<ExplorePage />} />
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/me" element={<MePage onOpenEditor={() => setIsEditorOpen(true)} />} />
                  <Route path="/moment/:id" element={<MomentDetailPage />} />
                  <Route path="/user/:id" element={<UserProfilePage />} />
                  <Route path="/edit-profile" element={<EditProfilePage />} />
                  <Route path="/voiceroom/:id" element={<VoiceRoomPage />} />
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          } />
        </Routes>

        {/* 全局组件：发布瞬间 */}
        <PostMomentEditor
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
        />
      </div>
    </BrowserRouter>
  );
}
