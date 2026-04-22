import PageHeader from '../components/PageHeader';
import { ChevronRight, FileText, Info, HelpCircle } from 'lucide-react';

export default function SettingsHelpPage() {
  return (
    <div className="w-full h-full bg-[#12141d] flex flex-col">
      <PageHeader title="帮助与反馈" />
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

        <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-4 rounded-2xl border border-cyan-500/30 flex items-center justify-between mb-6">
          <div className="flex flex-col gap-1">
            <span className="text-white font-bold">在线客服</span>
            <span className="text-cyan-400 text-xs">服务时间: 9:00 - 24:00</span>
          </div>
          <button className="bg-cyan-500 text-[#12141d] px-4 py-1.5 rounded-full text-sm font-bold shadow-md active:scale-95 transition-transform">
            去咨询
          </button>
        </div>

        <div className="bg-[#1c1e2b] rounded-2xl overflow-hidden border border-white/5">
          <div className="flex items-center justify-between px-4 py-4 border-b border-white/5 active:bg-white/5 cursor-pointer">
            <div className="flex items-center gap-3">
              <HelpCircle size={18} className="text-cyan-400" />
              <span className="text-white text-[15px]">常见问题 FAQ</span>
            </div>
            <ChevronRight size={18} className="text-gray-500" />
          </div>
          <div className="flex items-center justify-between px-4 py-4 border-b border-white/5 active:bg-white/5 cursor-pointer">
            <div className="flex items-center gap-3">
              <FileText size={18} className="text-purple-400" />
              <span className="text-white text-[15px]">功能反馈 / 报 Bug</span>
            </div>
            <ChevronRight size={18} className="text-gray-500" />
          </div>
          <div className="flex items-center justify-between px-4 py-4 active:bg-white/5 cursor-pointer">
            <div className="flex items-center gap-3">
              <Info size={18} className="text-gray-400" />
              <span className="text-white text-[15px]">关于 Soul App</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm">v1.0.0</span>
              <ChevronRight size={18} className="text-gray-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
