import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import PageHeader from '../components/PageHeader';
import type { MeDataResponse, UserProfile } from '../types';
import { Check } from 'lucide-react';

export default function EditProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get<MeDataResponse>('/users/me').then(data => {
      if (data.profile) {
        setProfile(data.profile);
        setName(data.profile.name);
        setBio(data.profile.bio || '');
        setAvatar(data.profile.avatar);
      }
    });
  }, []);

  const handleSave = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await api.put('/users/me/profile', { name, bio, avatar });
      navigate(-1);
    } catch (err) {
      console.error('保存失败', err);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return <div className="w-full h-full bg-[#12141d]" />;
  }

  return (
    <div className="w-full h-full bg-[#12141d] flex flex-col">
      <PageHeader
        title="编辑资料"
        rightAction={
          <button onClick={handleSave} disabled={loading || !name.trim()} className="text-cyan-400 font-bold active:opacity-50">
            {loading ? '...' : <Check size={24} />}
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="flex flex-col items-center mb-10">
          <div className="w-24 h-24 rounded-full overflow-hidden border-[3px] border-[#1c1e2b] bg-gray-800 shadow-xl mb-4 relative">
             <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
               <span className="text-white text-xs font-bold">更换</span>
             </div>
          </div>
          <p className="text-gray-500 text-xs">点击更换头像 (暂不可用)</p>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-gray-400 text-sm font-medium ml-1">星际代号 (昵称)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[#1c1e2b] text-white px-4 py-3 rounded-2xl outline-none border border-transparent focus:border-cyan-500/50 transition-colors"
              placeholder="请输入你的专属昵称"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-gray-400 text-sm font-medium ml-1">个人签名 (Bio)</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="bg-[#1c1e2b] text-white px-4 py-3 rounded-2xl outline-none border border-transparent focus:border-cyan-500/50 transition-colors resize-none"
              placeholder="用一段话向宇宙介绍你自己..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
