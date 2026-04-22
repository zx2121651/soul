import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import { ChevronRight } from 'lucide-react';

export default function SettingsPrivacyPage() {
  const [onlineStatus, setOnlineStatus] = useState(true);
  const [nearby, setNearby] = useState(false);

  return (
    <div className="w-full h-full bg-[#12141d] flex flex-col">
      <PageHeader title="隐私设置" />
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        <div>
          <h3 className="text-gray-400 text-xs px-2 mb-2">个人资料可见性</h3>
          <div className="bg-[#1c1e2b] rounded-2xl overflow-hidden border border-white/5">
            <label className="flex items-center justify-between px-4 py-4 border-b border-white/5 cursor-pointer">
              <span className="text-white text-[15px]">隐藏在线状态</span>
              <input type="checkbox" checked={onlineStatus} onChange={(e) => setOnlineStatus(e.target.checked)} className="toggle-checkbox" />
            </label>
            <label className="flex items-center justify-between px-4 py-4 cursor-pointer">
              <span className="text-white text-[15px]">禁止附近的人搜索到我</span>
              <input type="checkbox" checked={nearby} onChange={(e) => setNearby(e.target.checked)} className="toggle-checkbox" />
            </label>
          </div>
        </div>

        <div>
          <h3 className="text-gray-400 text-xs px-2 mb-2">黑名单与权限</h3>
          <div className="bg-[#1c1e2b] rounded-2xl overflow-hidden border border-white/5">
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/5 active:bg-white/5 cursor-pointer">
              <span className="text-white text-[15px]">黑名单管理</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">0人</span>
                <ChevronRight size={18} className="text-gray-500" />
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-4 active:bg-white/5 cursor-pointer">
              <span className="text-white text-[15px]">不看Ta的瞬间</span>
              <div className="flex items-center gap-2">
                <ChevronRight size={18} className="text-gray-500" />
              </div>
            </div>
          </div>
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
