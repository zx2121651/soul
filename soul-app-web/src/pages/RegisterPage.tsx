import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Mars, Venus, ChevronLeft } from 'lucide-react';
import { validateNickname } from '../utils/validation';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [birthday, setBirthday] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const nicknameError = validateNickname(name);

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !username || !password) {
      setError('请填写完整的注册信息');
      return;
    }

    if (nicknameError) {
      setError(nicknameError);
      setStep(2);
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
      await api.post('/auth/register', {
        name,
        username,
        password,
        gender,
        birthday
      });

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
        <div className="flex items-center justify-between mb-8 w-full">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          ) : (
            <div className="w-10" />
          )}
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mb-2">
              <UserPlus className="w-6 h-6 text-cyan-400" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wider">
              {step === 1 ? '基础信息' : step === 2 ? '灵魂花名' : '账号设置'}
            </h1>
          </div>
          <div className="w-10 text-cyan-400 font-medium text-sm text-right">
            {step}/3
          </div>
        </div>

        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait" initial={false}>
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-full"
              >
                {/* Step 1 Content */}
                <div className="bg-[#1c1e2b] p-6 rounded-2xl shadow-xl border border-white/5 space-y-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-4 text-center">选择你的性别</label>
                    <div className="flex justify-center space-x-6">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setGender('male')}
                        className={`w-28 h-28 rounded-2xl flex flex-col items-center justify-center transition-all ${
                          gender === 'male'
                            ? 'bg-blue-500/20 border-2 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                            : 'bg-white/5 border border-white/10 text-gray-400 hover:border-white/20'
                        }`}
                      >
                        <Mars className={`w-10 h-10 mb-2 ${gender === 'male' ? 'text-blue-400' : ''}`} />
                        <span className={`text-sm font-medium ${gender === 'male' ? 'text-blue-400' : ''}`}>男生</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setGender('female')}
                        className={`w-28 h-28 rounded-2xl flex flex-col items-center justify-center transition-all ${
                          gender === 'female'
                            ? 'bg-pink-500/20 border-2 border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.3)]'
                            : 'bg-white/5 border border-white/10 text-gray-400 hover:border-white/20'
                        }`}
                      >
                        <Venus className={`w-10 h-10 mb-2 ${gender === 'female' ? 'text-pink-400' : ''}`} />
                        <span className={`text-sm font-medium ${gender === 'female' ? 'text-pink-400' : ''}`}>女生</span>
                      </motion.button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">你的生日</label>
                    <input
                      type="date"
                      value={birthday}
                      onChange={(e) => setBirthday(e.target.value)}
                      className="w-full bg-[#12141d] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                    />
                    {birthday && calculateAge(birthday) < 18 && (
                      <p className="mt-2 text-red-400 text-xs">未满 18 岁禁止注册 Soul</p>
                    )}
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    disabled={!gender || !birthday || calculateAge(birthday) < 18}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-[#12141d] font-bold py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
                  >
                    下一步
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-full"
              >
                <div className="bg-[#1c1e2b] p-6 rounded-2xl shadow-xl border border-white/5 flex flex-col items-center">
                  <div className="w-full mb-8">
                    <label className="block text-sm font-medium text-gray-400 mb-4 text-center">输入你的专属昵称...</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={12}
                        className={`w-full bg-transparent border-b-2 ${nicknameError ? 'border-red-500' : 'border-white/10 focus:border-cyan-500'} text-3xl text-center py-4 text-white focus:outline-none transition-colors`}
                        placeholder="专属昵称"
                        autoFocus
                      />
                      <div className="absolute right-0 bottom-2 text-xs text-gray-500">
                        {name.length}/12
                      </div>
                    </div>
                    {nicknameError && (
                      <p className="mt-4 text-red-500 text-sm text-center">{nicknameError}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!!nicknameError || !name}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-[#12141d] font-bold py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
                  >
                    下一步
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-full"
              >
                <form onSubmit={handleRegister} className="bg-[#1c1e2b] p-6 rounded-2xl shadow-xl border border-white/5">
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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
