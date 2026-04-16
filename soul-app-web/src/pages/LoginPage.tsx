import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/planet';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('请输入账号和密码');
      return;
    }

    setLoading(true);
    try {
      // 调用后端登录接口
      const data = await api.post<{ token: string }>('/auth/login', { username, password });

      if (data && data.token) {
        // 成功后将 token 存入 store (及其持久化 localStorage)
        useAuthStore.getState().setToken(data.token);
        // 跳转到重定向页面或主页
        navigate(redirectPath);
      } else {
        setError('登录失败：未收到 Token');
      }
    } catch (err: unknown) {
      setError((err as Error).message || '登录失败，请检查账号和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen bg-[#12141d] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* 动态星空背景效果 (可选) */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1c1e2b] via-[#12141d] to-[#12141d] opacity-50"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mb-4">
            <Compass className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-wider">Soul 登录</h1>
          <p className="text-gray-400 mt-2 text-sm">寻找宇宙中同频的灵魂</p>
        </div>

        <form onSubmit={handleLogin} className="bg-[#1c1e2b] p-6 rounded-2xl shadow-xl shadow-cyan-900/10 border border-white/5">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">账号 (Username)</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#12141d] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                placeholder="请输入您的账号"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">密码 (Password)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#12141d] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                placeholder="请输入密码"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-8 bg-cyan-500 hover:bg-cyan-400 text-[#12141d] font-bold py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/20 ${loading ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'}`}
          >
            {loading ? '正在连接星球...' : '登录'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            还没有账号？
            <Link to="/register" className="text-cyan-400 hover:text-cyan-300 ml-1 font-medium transition-colors">
              立即注册
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
