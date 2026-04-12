import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { bootstrapApp } from './utils/bootstrap';
import React, { Suspense } from 'react';

const PlanetPage = React.lazy(() => import('./pages/PlanetPage'));
const ExplorePage = React.lazy(() => import('./pages/ExplorePage'));
const ChatPage = React.lazy(() => import('./pages/ChatPage'));
const MePage = React.lazy(() => import('./pages/MePage'));
const MomentDetailPage = React.lazy(() => import('./pages/MomentDetailPage'));
const UserProfilePage = React.lazy(() => import('./pages/UserProfilePage'));
const EditProfilePage = React.lazy(() => import('./pages/EditProfilePage'));
const VoiceRoomPage = React.lazy(() => import('./pages/VoiceRoomPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const NotificationsPage = React.lazy(() => import('./pages/NotificationsPage'));
const UserListPage = React.lazy(() => import('./pages/UserListPage'));
const SettingsAccountPage = React.lazy(() => import('./pages/SettingsAccountPage'));
const SettingsNotificationPage = React.lazy(() => import('./pages/SettingsNotificationPage'));
const SettingsPrivacyPage = React.lazy(() => import('./pages/SettingsPrivacyPage'));
const SettingsHelpPage = React.lazy(() => import('./pages/SettingsHelpPage'));

const FallbackLoader = () => (
  <div className="w-full h-full flex items-center justify-center bg-[#171822]">
    <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

import BottomNavBar from './components/BottomNavBar';
import TopBar from './components/TopBar';
import PostMomentEditor from './components/PostMomentEditor';

// AuthGuard 路由守卫
const RequireAuth = ({ children }: { children: React.ReactElement }) => {
  const token = localStorage.getItem('soul_token');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

// 避免在登录注册页显示导航栏
const AppLayout = () => {
  const location = useLocation();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const hideNavs = ['/login', '/register'].includes(location.pathname);

  return (
    <div className="w-full h-screen bg-[#171822] overflow-hidden text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-100 flex flex-col relative antialiased">
      {!hideNavs && <TopBar />}

      <div className="flex-1 overflow-hidden relative">
        <Suspense fallback={<FallbackLoader />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route path="/" element={<Navigate to="/planet" replace />} />

            {/* 需要登录访问的页面 */}
            <Route path="/planet" element={<RequireAuth><PlanetPage /></RequireAuth>} />
            <Route path="/explore" element={<RequireAuth><ExplorePage /></RequireAuth>} />
            <Route path="/chat" element={<RequireAuth><ChatPage /></RequireAuth>} />
            <Route path="/me" element={<RequireAuth><MePage onOpenEditor={() => setIsEditorOpen(true)} /></RequireAuth>} />
            <Route path="/moment/:id" element={<RequireAuth><MomentDetailPage /></RequireAuth>} />
            <Route path="/user/:id" element={<RequireAuth><UserProfilePage /></RequireAuth>} />
            <Route path="/user/:id/:type" element={<RequireAuth><UserListPage /></RequireAuth>} />
            <Route path="/edit-profile" element={<RequireAuth><EditProfilePage /></RequireAuth>} />
            <Route path="/voiceroom/:id" element={<RequireAuth><VoiceRoomPage /></RequireAuth>} />
            <Route path="/notifications" element={<RequireAuth><NotificationsPage /></RequireAuth>} />
            <Route path="/settings/account" element={<RequireAuth><SettingsAccountPage /></RequireAuth>} />
            <Route path="/settings/notifications" element={<RequireAuth><SettingsNotificationPage /></RequireAuth>} />
            <Route path="/settings/privacy" element={<RequireAuth><SettingsPrivacyPage /></RequireAuth>} />
            <Route path="/settings/help" element={<RequireAuth><SettingsHelpPage /></RequireAuth>} />
          </Routes>
        </Suspense>
      </div>

      {!hideNavs && <BottomNavBar onOpenEditor={() => setIsEditorOpen(true)} />}

      <PostMomentEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
      />
    </div>
  );
};

export default function App() {
  // Bootstrap Environment (Dev Auth modified)
  useEffect(() => {
    bootstrapApp();
  }, []);

  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
