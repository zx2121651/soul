import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !username || !password) {
      setError('请填写完整的注册信息');
      return;
    }
    if (username.length < 3) {
      setError('账号至少需要3个字符');
      return;
    }
    if (password.length < 6) {
      setError('密码至少需要6个字符');
      return;
    }

    setLoading(true);
    try {
      // 1. 调用后端注册接口
      await api.post('/auth/register', { name, username, password });

      // 2. 注册成功后自动登录以获取 token
      const loginData = await api.post<{ token: string }>('/auth/login', { username, password });

      if (loginData && loginData.token) {
        localStorage.setItem('soul_token', loginData.token);
        // 跳转到主页
        navigate('/planet');
      } else {
        // 如果自动登录失败，跳转到登录页手动登录
        navigate('/login');
      }
    } catch (err: unknown) {
      setError((err as Error).message || '注册失败，该账号可能已被占用');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen bg-[#12141d] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1c1e2b] via-[#12141d] to-[#12141d] opacity-50"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-wider">注册 Soul</h1>
          <p className="text-gray-400 mt-2 text-sm">构建你的星球档案</p>
        </div>

        <form onSubmit={handleRegister} className="bg-[#1c1e2b] p-6 rounded-2xl shadow-xl shadow-cyan-900/10 border border-white/5">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">星球昵称 (Name)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#12141d] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                placeholder="你希望大家怎么称呼你"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">账号 (Username)</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#12141d] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                placeholder="用于登录 (至少3个字符)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">密码 (Password)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#12141d] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                placeholder="设置密码 (至少6个字符)"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-8 bg-cyan-500 hover:bg-cyan-400 text-[#12141d] font-bold py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/20 ${loading ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'}`}
          >
            {loading ? '档案生成中...' : '立即注册'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            已有账号？
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 ml-1 font-medium transition-colors">
              直接登录
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
