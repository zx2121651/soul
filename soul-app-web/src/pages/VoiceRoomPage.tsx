import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  AudioConference,
  useConnectionState,

  DisconnectButton,
  TrackToggle,
  ConnectionQualityIndicator,
  Chat
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';
import { api } from '../api/client';
import { ChevronLeft, Headphones } from 'lucide-react';

export default function VoiceRoomPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [serverUrl, setServerUrl] = useState('');

  useEffect(() => {
    if (!id) return;
    api.post<{ token: string, serverUrl: string, isOwner: boolean }>(`/voicerooms/${id}/join`)
      .then((data) => {
        setToken(data.token);
        setServerUrl(data.serverUrl);
      })
      .catch(console.error);
  }, [id]);

  if (!token) {
    return (
      <div className="w-full h-full bg-[#12141d] flex flex-col items-center justify-center text-cyan-400">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="mt-4 font-bold tracking-widest text-sm">正在接入异星派对...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-b from-[#1c1c38] to-[#12141d] flex flex-col text-white">
      {/* 顶部导航栏 */}
      <div className="px-4 py-4 flex items-center justify-between shadow-sm z-10 border-b border-white/10">
        <button onClick={() => navigate('/explore', { replace: true })} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition">
          <ChevronLeft size={24} className="text-white" />
        </button>
        <div className="flex flex-col items-center">
          <span className="font-bold text-lg text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">房间: {id}</span>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="bg-white/10 px-2 py-0.5 rounded-full text-[10px] text-gray-300 flex items-center">
              <Headphones size={10} className="mr-1" /> 在听
            </span>
          </div>
        </div>
        <div className="w-10"></div>
      </div>

      <LiveKitRoom
        video={false}
        audio={true}
        token={token}
        serverUrl={serverUrl}
        connectOptions={{ autoSubscribe: true }}
        data-lk-theme="default"
        className="flex-1 flex flex-col w-full relative overflow-hidden"
        onDisconnected={() => navigate('/explore', { replace: true })}
      >
        <RoomContent />
      </LiveKitRoom>
    </div>
  );
}

function RoomContent() {
  const connectionState = useConnectionState();

  return (
    <div className="w-full h-full flex flex-col items-center justify-between">

      {/* 连接状态与网络指示器 */}
      <div className="w-full flex justify-between items-center px-6 pt-4">
        <div className="text-xs font-semibold tracking-wide flex items-center">
          {connectionState === 'connected' ? (
            <span className="flex items-center text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
              电波同步中
            </span>
          ) : (
            <span className="text-yellow-400">正在建立连接...</span>
          )}
        </div>
        <ConnectionQualityIndicator className="!bg-transparent !text-cyan-400" />
      </div>

      {/* 音频会议波形视图 */}
      <div className="flex-1 w-full mt-4 mb-2 overflow-y-auto no-scrollbar flex items-center justify-center relative">
         <AudioConference />
      </div>

      {/* 隐式音频轨道挂载 */}
      <RoomAudioRenderer />

      {/* 底部公屏聊天与麦克风控制区 */}
      <div className="w-full h-1/2 min-h-[300px] max-h-[400px] bg-black/40 backdrop-blur-xl border-t border-white/10 flex flex-col relative z-20">

        {/* LiveKit DataChannel Chat */}
        <div className="flex-1 overflow-hidden">
          <Chat />
        </div>

        {/* 底部控制台 */}
        <div className="w-full px-6 py-4 flex justify-between items-center bg-[#12141d]/80">

          <TrackToggle
            source={Track.Source.Microphone}
            className="lk-button !rounded-full !w-12 !h-12 flex items-center justify-center !bg-cyan-500/20 hover:!bg-cyan-500/40 !text-cyan-400 border border-cyan-500/30 transition-all"
          >
            {/* The TrackToggle automatically toggles mic based on LK state */}
          </TrackToggle>

          <DisconnectButton className="lk-button !bg-red-500/80 hover:!bg-red-600 transition !rounded-full shadow-lg !px-6 !py-2 text-sm border border-red-400/50">
            断开链接
          </DisconnectButton>
        </div>

      </div>
    </div>
  );
}
