import { useState } from 'react';
import PageHeader from '../components/PageHeader';

export default function SettingsNotificationPage() {
  const [likes, setLikes] = useState(true);
  const [comments, setComments] = useState(true);
  const [messages, setMessages] = useState(true);
  const [system, setSystem] = useState(true);

  return (
    <div className="w-full h-full bg-[#12141d] flex flex-col">
      <PageHeader title="消息通知" />
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        <div>
          <h3 className="text-gray-400 text-xs px-2 mb-2">互动消息</h3>
          <div className="bg-[#1c1e2b] rounded-2xl overflow-hidden border border-white/5">
            <label className="flex items-center justify-between px-4 py-4 border-b border-white/5 cursor-pointer">
              <span className="text-white text-[15px]">赞与收藏</span>
              <input type="checkbox" checked={likes} onChange={(e) => setLikes(e.target.checked)} className="toggle-checkbox" />
            </label>
            <label className="flex items-center justify-between px-4 py-4 cursor-pointer">
              <span className="text-white text-[15px]">新评论与回复</span>
              <input type="checkbox" checked={comments} onChange={(e) => setComments(e.target.checked)} className="toggle-checkbox" />
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-gray-400 text-xs px-2 mb-2">私信与群聊</h3>
          <div className="bg-[#1c1e2b] rounded-2xl overflow-hidden border border-white/5">
            <label className="flex items-center justify-between px-4 py-4 border-b border-white/5 cursor-pointer">
              <span className="text-white text-[15px]">新私聊消息提醒</span>
              <input type="checkbox" checked={messages} onChange={(e) => setMessages(e.target.checked)} className="toggle-checkbox" />
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-gray-400 text-xs px-2 mb-2">系统广播</h3>
          <div className="bg-[#1c1e2b] rounded-2xl overflow-hidden border border-white/5">
            <label className="flex items-center justify-between px-4 py-4 cursor-pointer">
              <span className="text-white text-[15px]">系统及活动通知</span>
              <input type="checkbox" checked={system} onChange={(e) => setSystem(e.target.checked)} className="toggle-checkbox" />
            </label>
          </div>
          <p className="text-gray-500 text-xs px-2 mt-2">关闭后可能会错过重要的账号状态变化信息</p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .toggle-checkbox {
          appearance: none;
          width: 40px;
          height: 24px;
          background: #374151;
          border-radius: 12px;
          position: relative;
          cursor: pointer;
          outline: none;
          transition: background-color 0.3s;
        }
        .toggle-checkbox::after {
          content: '';
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          background: #fff;
          border-radius: 50%;
          transition: transform 0.3s;
        }
        .toggle-checkbox:checked {
          background: #22d3ee;
        }
        .toggle-checkbox:checked::after {
          transform: translateX(16px);
        }
      `}} />
    </div>
  );
}
