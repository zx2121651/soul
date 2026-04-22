import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import PageHeader from '../components/PageHeader';

interface UserItem {
  id: number;
  name: string;
  avatar: string;
  bio: string;
}

export default function UserListPage() {
  const { id, type } = useParams<{ id: string, type: string }>(); // type expects 'followers' | 'following'
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  const title = type === 'followers' ? '粉丝列表' : '关注列表';

  useEffect(() => {
    if (!id || !type) return;

    api.get<{ users: UserItem[] }>(`/users/${id}/${type}`)
      .then(res => setUsers(res.users || []))
      .catch(err => console.error('获取用户列表失败', err))
      .finally(() => setLoading(false));
  }, [id, type]);

  return (
    <div className="w-full h-full bg-[#12141d] flex flex-col relative overflow-hidden">
      <PageHeader title={title} />

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-4 pb-24">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-gray-500 py-20">
            <div className="text-4xl mb-4 opacity-40">📭</div>
            <p>这里静悄悄的，暂无数据</p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map(user => (
              <div
                key={user.id}
                onClick={() => navigate(`/user/${user.id}`)}
                className="w-full bg-[#1c1e2b] rounded-2xl p-4 flex gap-4 items-center active:scale-95 transition-transform cursor-pointer border border-white/5 hover:bg-white/5"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-800 shrink-0 border border-white/10">
                  <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-white text-sm font-bold truncate">{user.name}</h4>
                  <p className="text-gray-400 text-xs truncate mt-1">
                    {user.bio || '这个人很神秘，什么都没写'}
                  </p>
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); navigate(`/user/${user.id}`); }}
                  className="px-4 py-1.5 rounded-full bg-white/10 text-white text-xs font-medium border border-white/10 hover:bg-white/20 active:bg-white/30"
                >
                  去主页
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
