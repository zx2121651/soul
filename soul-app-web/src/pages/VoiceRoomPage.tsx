import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  AudioConference,
  useConnectionState,
  useParticipants,
  useLocalParticipant,

  DisconnectButton,
  TrackToggle,
  ConnectionQualityIndicator,
  Chat
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';
import { api } from '../api/client';
import { ChevronLeft, Headphones, Users, Gift, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VoiceRoomPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [serverUrl, setServerUrl] = useState('');
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.post<{ token: string, serverUrl: string, isOwner: boolean }>(`/voicerooms/${id}/join`)
      .then((data) => {
        setToken(data.token);
        setServerUrl(data.serverUrl);
        setIsOwner(data.isOwner);
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
        <RoomContent isOwner={isOwner} />
      </LiveKitRoom>
    </div>
  );
}

function RoomContent({ isOwner }: { isOwner: boolean }) {
  const connectionState = useConnectionState();
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();

  const [showUsers, setShowUsers] = useState(false);
  const [showGifts, setShowGifts] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const handleAction = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2000);
  };

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
          <div className="flex items-center gap-4">
            <button onClick={() => setShowUsers(true)} className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white">
              <Users size={20} />
              <span className="absolute -top-1 -right-1 bg-cyan-500 text-[#12141d] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {participants.length}
              </span>
            </button>
            <button onClick={() => setShowGifts(true)} className="p-2 rounded-full bg-pink-500/20 border border-pink-500/30 hover:bg-pink-500/40 transition-colors text-pink-400">
              <Gift size={20} />
            </button>
          </div>

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


      {/* Toast Message */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-24 left-1/2 z-[400] bg-white/10 backdrop-blur-xl border border-white/20 text-white px-4 py-2 rounded-full text-sm shadow-xl whitespace-nowrap"
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 用户列表抽屉 */}
      <AnimatePresence>
        {showUsers && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowUsers(false)} className="fixed inset-0 bg-black/60 z-[350] backdrop-blur-sm" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="fixed bottom-0 left-0 right-0 bg-[#1c1e2b] z-[400] rounded-t-3xl border-t border-white/10 overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.5)] max-h-[60vh] flex flex-col">
              <div className="flex justify-between items-center p-4 border-b border-white/5">
                <h3 className="text-white font-bold">房间听众 ({participants.length})</h3>
                <button onClick={() => setShowUsers(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {participants.map(p => (
                  <div key={p.identity} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white overflow-hidden border border-white/10">
                         {p.identity.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium flex items-center gap-2">
                           {p.identity}
                           {p.identity === localParticipant?.identity && <span className="bg-cyan-500/20 text-cyan-400 text-[10px] px-1.5 rounded">我</span>}
                        </div>
                        <div className="text-gray-500 text-xs">麦上</div>
                      </div>
                    </div>
                    {isOwner && p.identity !== localParticipant?.identity && (
                      <div className="flex gap-2">
                        <button onClick={() => handleAction(`已将 ${p.identity} 静音下麦`)} className="px-3 py-1 rounded bg-yellow-500/20 text-yellow-500 text-xs font-bold border border-yellow-500/30 active:scale-95">下麦</button>
                        <button onClick={() => handleAction(`已将 ${p.identity} 踢出房间`)} className="px-3 py-1 rounded bg-red-500/20 text-red-500 text-xs font-bold border border-red-500/30 active:scale-95">踢出</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 礼物面板 */}
      <AnimatePresence>
        {showGifts && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowGifts(false)} className="fixed inset-0 bg-black/60 z-[350] backdrop-blur-sm" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="fixed bottom-0 left-0 right-0 bg-[#1c1e2b] z-[400] rounded-t-3xl border-t border-white/10 overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
              <div className="flex justify-between items-center p-4 border-b border-white/5">
                <h3 className="text-white font-bold">送礼物</h3>
                <button onClick={() => setShowGifts(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
              </div>
              <div className="grid grid-cols-4 gap-4 p-6">
                {[
                  { name: '星球玫瑰', icon: '🌹', color: 'bg-red-500/20' },
                  { name: '甜甜圈', icon: '🍩', color: 'bg-pink-500/20' },
                  { name: '星际飞船', icon: '🚀', color: 'bg-blue-500/20' },
                  { name: '皇冠', icon: '👑', color: 'bg-yellow-500/20' },
                  { name: '魔法棒', icon: '🪄', color: 'bg-purple-500/20' },
                  { name: '钻石', icon: '💎', color: 'bg-cyan-500/20' },
                  { name: '外星人', icon: '👽', color: 'bg-green-500/20' },
                  { name: '比心', icon: '🫰', color: 'bg-orange-500/20' }
                ].map(gift => (
                  <div key={gift.name} onClick={() => { setShowGifts(false); handleAction(`全服广播：送出了 ${gift.name} ${gift.icon}`); }} className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform group">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${gift.color} border border-white/5 group-hover:border-white/20`}>
                      {gift.icon}
                    </div>
                    <span className="text-xs text-gray-400">{gift.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      </div>
    </div>
  );
}
