import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('请输入用户名和密码');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await api.post<{token: string}>('/auth/login', { username, password });
      if (data && data.token) {
        localStorage.setItem('soul_token', data.token);
        navigate('/planet', { replace: true });
      }
    } catch (err: any) {
      setError(err.message || '登录失败，请检查账号密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#12141d] relative overflow-hidden text-white">
      {/* 装饰性背景 */}
      <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="z-10 w-full max-w-sm px-8 flex flex-col items-center">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl font-black tracking-widest text-cyan-400 mb-2 drop-shadow-[0_0_15px_rgba(34,211,238,0.4)]"
        >
          SOUL
        </motion.div>
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-gray-400 mb-12 tracking-wide"
        >
          跟随灵魂找到你
        </motion.div>

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-5">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <input
              type="text"
              placeholder="请输入用户名/手机号"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#1c1e2b] text-white px-5 py-4 rounded-2xl outline-none border border-transparent focus:border-cyan-500/50 transition-colors shadow-inner placeholder-gray-600"
            />
          </motion.div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <input
              type="password"
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1c1e2b] text-white px-5 py-4 rounded-2xl outline-none border border-transparent focus:border-cyan-500/50 transition-colors shadow-inner placeholder-gray-600"
            />
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-400 text-xs px-2"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4"
          >
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-[#12141d] font-bold text-base py-4 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.3)] active:scale-95 transition-all disabled:opacity-70 flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-[#12141d] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                '登录星球'
              )}
            </button>
          </motion.div>
        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex items-center gap-2 text-sm"
        >
          <span className="text-gray-500">还没有船票？</span>
          <Link to="/register" className="text-cyan-400 font-bold hover:underline">
            立即注册
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
