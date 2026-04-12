import PageHeader from '../components/PageHeader';
import { ChevronRight } from 'lucide-react';

export default function SettingsAccountPage() {
  return (
    <div className="w-full h-full bg-[#12141d] flex flex-col">
      <PageHeader title="账号与安全" />
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div className="bg-[#1c1e2b] rounded-2xl overflow-hidden border border-white/5">
          <div className="flex items-center justify-between px-4 py-4 border-b border-white/5 active:bg-white/5 cursor-pointer">
            <span className="text-white text-[15px]">手机号绑定</span>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">138****8888</span>
              <ChevronRight size={18} className="text-gray-500" />
            </div>
          </div>
          <div className="flex items-center justify-between px-4 py-4 border-b border-white/5 active:bg-white/5 cursor-pointer">
            <span className="text-white text-[15px]">登录密码</span>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">已设置</span>
              <ChevronRight size={18} className="text-gray-500" />
            </div>
          </div>
          <div className="flex items-center justify-between px-4 py-4 active:bg-white/5 cursor-pointer">
            <span className="text-white text-[15px]">社交账号绑定</span>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm">未绑定</span>
              <ChevronRight size={18} className="text-gray-500" />
            </div>
          </div>
        </div>

        <div className="bg-[#1c1e2b] rounded-2xl overflow-hidden border border-white/5 mt-6">
          <div className="flex items-center justify-between px-4 py-4 active:bg-white/5 cursor-pointer">
            <span className="text-red-400 text-[15px]">注销账号</span>
            <ChevronRight size={18} className="text-gray-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
