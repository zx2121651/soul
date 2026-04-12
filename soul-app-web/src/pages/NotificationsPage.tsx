import { useState, useEffect } from 'react';
import { api } from '../api/client';
import PageHeader from '../components/PageHeader';
import { Bell, Heart, MessageCircle, UserPlus, Settings } from 'lucide-react';

interface NotificationItem {
  id: number;
  type: 'like' | 'comment' | 'follow' | 'system';
  text: string;
  time: string;
  isRead: boolean;
}

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ notifications: NotificationItem[] }>('/notifications')
      .then(res => {
        setNotifications(res.notifications || []);
      })
      .catch(err => console.error('获取通知失败', err))
      .finally(() => setLoading(false));
  }, []);

  const getIcon = (type: string) => {
    switch(type) {
      case 'like': return <Heart size={20} className="text-pink-500 fill-pink-500" />;
      case 'comment': return <MessageCircle size={20} className="text-blue-400" />;
      case 'follow': return <UserPlus size={20} className="text-cyan-400" />;
      case 'system': return <Bell size={20} className="text-purple-400" />;
      default: return <Bell size={20} className="text-gray-400" />;
    }
  };

  const getBgColor = (type: string) => {
    switch(type) {
      case 'like': return 'bg-pink-500/10';
      case 'comment': return 'bg-blue-400/10';
      case 'follow': return 'bg-cyan-400/10';
      case 'system': return 'bg-purple-400/10';
      default: return 'bg-gray-500/10';
    }
  };

  return (
    <div className="w-full h-full bg-[#12141d] flex flex-col relative overflow-hidden">
      <PageHeader
        title="消息通知"
        rightAction={<Settings size={20} className="text-gray-400 hover:text-white transition-colors" />}
      />

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-4 pb-24">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-gray-500 py-20">
            <Bell size={48} className="opacity-20 mb-4" />
            <p>这里静悄悄的，暂无新消息</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(item => (
              <div
                key={item.id}
                className={`w-full bg-[#1c1e2b] rounded-2xl p-4 flex gap-4 items-center active:scale-95 transition-transform cursor-pointer border ${item.isRead ? 'border-transparent opacity-60' : 'border-white/5'} shadow-sm`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${getBgColor(item.type)}`}>
                  {getIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`text-[15px] line-clamp-2 leading-snug ${item.isRead ? 'text-gray-400' : 'text-white font-medium'}`}>
                    {item.text}
                  </p>
                  <span className="text-gray-500 text-xs mt-1 block">{item.time}</span>
                </div>

                {!item.isRead && (
                  <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] shrink-0"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
