import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { bootstrapApp } from './utils/bootstrap';
import React, { Suspense } from 'react';
const PlanetPage = React.lazy(() => import('./pages/PlanetPage'));
const ExplorePage = React.lazy(() => import('./pages/ExplorePage'));
const ChatPage = React.lazy(() => import('./pages/ChatPage'));
const MePage = React.lazy(() => import('./pages/MePage'));

const FallbackLoader = () => (
  <div className="w-full h-full flex items-center justify-center bg-[#171822]">
    <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

import BottomNavBar from './components/BottomNavBar';
import PostMomentEditor from './components/PostMomentEditor';

export default function App() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);



  // Bootstrap Environment (Dev Auth)
  useEffect(() => {
    bootstrapApp();
  }, []);



  return (
    <BrowserRouter>
      <div className="w-full h-screen bg-[#171822] overflow-hidden text-white font-sans selection:bg-cyan-500/30 selection:text-cyan-100 flex flex-col relative antialiased">

        <div className="flex-1 overflow-hidden relative">
          <Suspense fallback={<FallbackLoader />}>
          <Routes>
            <Route path="/" element={<Navigate to="/planet" replace />} />
            <Route path="/planet" element={<PlanetPage />} />
            <Route path="/explore" element={<ExplorePage onOpenEditor={() => setIsEditorOpen(true)} />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/me" element={<MePage onOpenEditor={() => setIsEditorOpen(true)} />} />
          </Routes>
          </Suspense>
        </div>

        <BottomNavBar onOpenEditor={() => setIsEditorOpen(true)} />

        <PostMomentEditor
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
        />
      </div>
    </BrowserRouter>
  );
}
