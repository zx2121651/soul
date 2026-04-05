import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LiveKitRoom, RoomAudioRenderer, AudioConference, useConnectionState, DisconnectButton } from '@livekit/components-react';
import '@livekit/components-styles';
import { api } from '../api/client';
import { ChevronLeft, Headphones } from 'lucide-react';

export default function VoiceRoomPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [serverUrl, setServerUrl] = useState('');

  useEffect(() => {
    if (!id) return;
    // 获取进入房间的 token
    api.post<{ token: string, serverUrl: string }>(`/voicerooms/${id}/join`)
      .then((data) => {
        setToken(data.token);
        setServerUrl(data.serverUrl);
      })
      .catch(console.error);
  }, [id]);

  if (!token) {
    return (
      <div className="w-full h-full bg-[#12141d] flex items-center justify-center text-cyan-400">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-4 font-bold tracking-widest">正在接入异星派对...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-b from-[#1c1c38] to-[#12141d] flex flex-col text-white">
      {/* 顶部导航栏 */}
      <div className="px-4 py-4 flex items-center justify-between shadow-sm z-10">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition">
          <ChevronLeft size={24} className="text-white" />
        </button>
        <div className="flex flex-col items-center">
          <span className="font-bold text-lg text-cyan-400">房间: {id}</span>
          <div className="flex items-center text-xs text-gray-400 mt-1">
            <Headphones size={12} className="mr-1" /> LiveKit Audio
          </div>
        </div>
        <div className="w-10"></div>
      </div>

      {/* 核心 LiveKit 容器 */}
      <LiveKitRoom
        video={false}
        audio={true}
        token={token}
        serverUrl={serverUrl}
        connectOptions={{ autoSubscribe: true }}
        data-lk-theme="default"
        className="flex-1 flex flex-col items-center justify-center p-4 relative"
      >
        <RoomContent />
      </LiveKitRoom>
    </div>
  );
}

function RoomContent() {
  const connectionState = useConnectionState();


  return (
    <div className="w-full h-full flex flex-col items-center justify-between pb-8 pt-4">
      {/* 状态指示器 */}
      <div className="text-sm font-semibold tracking-wide">
        {connectionState === 'connected' ? (
          <span className="text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]">连线成功 · 宇宙电波同步中</span>
        ) : (
          <span className="text-yellow-400">正在建立星际连接...</span>
        )}
      </div>

      {/* LiveKit 自带的音频会议预设 UI (网格展示说话人) */}
      <div className="flex-1 w-full max-w-sm mt-8 overflow-y-auto no-scrollbar">
         {/* AudioConference 自动展示参与者的声音波形和麦克风状态 */}
        <AudioConference />
      </div>

      {/* 渲染音频轨道 (隐式必备) */}
      <RoomAudioRenderer />

      {/* 底部控制台 */}
      <div className="w-full flex justify-center mt-6">
        <DisconnectButton className="lk-button !bg-red-500 hover:!bg-red-600 transition !rounded-full shadow-lg !px-8 !py-3">
          断开连接
        </DisconnectButton>
      </div>
    </div>
  );
}
