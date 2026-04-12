import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || !password) {
      setError('请填写所有必填信息');
      return;
    }

    if (password.length < 6) {
      setError('密码长度不能少于6位');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/register', { name, username, password });
      // 注册成功，可以选择自动登录或者跳转登录页
      navigate('/login', { replace: true, state: { message: '注册成功，请登录' } });
    } catch (err: any) {
      setError(err.message || '注册失败，请更换用户名重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#12141d] relative overflow-hidden text-white">
      {/* 装饰性背景 */}
      <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-cyan-600/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="z-10 w-full max-w-sm px-8 flex flex-col items-center">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-2xl font-black tracking-widest text-white mb-2"
        >
          领取船票
        </motion.div>
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-sm text-cyan-400 mb-10 tracking-wide"
        >
          欢迎来到灵魂星球
        </motion.div>

        <form onSubmit={handleRegister} className="w-full flex flex-col gap-4">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <input
              type="text"
              placeholder="请输入你的星际代号 (昵称)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#1c1e2b] text-white px-5 py-4 rounded-2xl outline-none border border-transparent focus:border-purple-500/50 transition-colors shadow-inner placeholder-gray-600"
            />
          </motion.div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <input
              type="text"
              placeholder="设置登录账号 (至少3个字符)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#1c1e2b] text-white px-5 py-4 rounded-2xl outline-none border border-transparent focus:border-purple-500/50 transition-colors shadow-inner placeholder-gray-600"
            />
          </motion.div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <input
              type="password"
              placeholder="设置登录密码 (至少6位)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#1c1e2b] text-white px-5 py-4 rounded-2xl outline-none border border-transparent focus:border-purple-500/50 transition-colors shadow-inner placeholder-gray-600"
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
            transition={{ delay: 0.5 }}
            className="mt-4"
          >
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold text-base py-4 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.3)] active:scale-95 transition-all disabled:opacity-70 flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                '注册并登船'
              )}
            </button>
          </motion.div>
        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex items-center gap-2 text-sm"
        >
          <span className="text-gray-500">已经有账号了？</span>
          <Link to="/login" className="text-purple-400 font-bold hover:underline">
            直接登录
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
