import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuthStore } from '../store/useAuthStore';
import type { User } from '../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Mars, Venus, ChevronLeft, Camera, Send } from 'lucide-react';
import { validateNickname } from '../utils/validation';
import InterestTagCloud from '../components/InterestTagCloud';
import PhoneInput from '../components/common/PhoneInput';
import OtpInput from '../components/common/OtpInput';
import { useCountdown } from '../hooks/useCountdown';
import Cropper from "react-cropper";
import type { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";

const DEFAULT_AVATARS = [
  '/assets/avatars/avatar1.svg',
  '/assets/avatars/avatar2.svg',
  '/assets/avatars/avatar3.svg',
  '/assets/avatars/avatar4.svg',
  '/assets/avatars/avatar5.svg',
  '/assets/avatars/avatar6.svg',
];

const AVAILABLE_TAGS = [
  '摇滚', '健身', '二次元', '原神', '咖啡', '旅行', '摄影', '音乐',
  '美食', '游戏', '读书', '电影', '运动', '数码', '宠物', '潜水',
  '滑雪', '撸铁', '国漫', '朋克', '剧本杀', '密室', '盲盒', '潮鞋'
];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [registerToken, setRegisterToken] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [birthday, setBirthday] = useState('');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(DEFAULT_AVATARS[0]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const { count, isCounting, start: startCountdown } = useCountdown(60);

  const handleToggleInterest = (tag: string) => {
    setSelectedInterests(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cropper states
  const [image, setImage] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const cropperRef = useRef<ReactCropperElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSendCode = async () => {
    if (!phone || phone.length < 11) {
      setError('请输入正确的手机号');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/send-code', { phone });
      startCountdown();
      setStep(2);
    } catch (err: any) {
      setError(err.message || '发送验证码失败');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (code: string) => {
    setError('');
    setLoading(true);
    try {
      const result = await api.post<any>('/auth/login', { phone, code });
      if (result.requiresRegistration) {
        setRegisterToken(result.registerToken);
        setStep(3);
      } else if (result.token) {
        // User already registered, just login
        useAuthStore.getState().login(result.token, result.user);
        navigate('/planet');
      }
    } catch (err: any) {
      setError(err.message || '验证失败');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCrop = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      setAvatar(cropper.getCroppedCanvas().toDataURL());
      setShowCropper(false);
      setImage(null);
    }
  };

  const handleRegister = async () => {
    setError('');

    if (!name || !registerToken) {
      setError('请填写完整的注册信息');
      return;
    }

    if (nicknameError) {
      setError(nicknameError);
      setStep(4);
      return;
    }

    setLoading(true);
    try {
      // Register with token
      const result = await api.post<{ token: string; user: User }>('/auth/register', {
        registerToken,
        gender,
        birthday,
        nickname: name,
        avatarBase64: avatar.startsWith('data:') ? avatar : undefined,
        interests: selectedInterests
      });

      if (result && result.token) {
        useAuthStore.getState().login(result.token, result.user);
        navigate('/planet');
      } else {
        navigate('/login');
      }
    } catch (err: unknown) {
      setError((err as Error).message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  const stepTitles = [
    '手机号',
    '验证码',
    '基础信息',
    '灵魂花名',
    '选择头像',
    '兴趣星球'
  ];

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
              {stepTitles[step - 1]}
            </h1>
          </div>
          <div className="w-10 text-cyan-400 font-medium text-sm text-right">
            {step}/6
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
                <div className="bg-[#1c1e2b] p-6 rounded-2xl shadow-xl border border-white/5 space-y-6">
                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                      {error}
                    </div>
                  )}
                  <p className="text-gray-400 text-sm text-center">请输入您的手机号以开始注册</p>
                  <PhoneInput
                    value={phone}
                    onChange={setPhone}
                    placeholder="请输入手机号"
                  />
                  <button
                    onClick={handleSendCode}
                    disabled={phone.length < 11 || loading}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-[#12141d] font-bold py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {loading ? '发送中...' : '获取验证码'}
                    <Send size={18} />
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
                <div className="bg-[#1c1e2b] p-6 rounded-2xl shadow-xl border border-white/5 space-y-6 text-center">
                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                      {error}
                    </div>
                  )}
                  <p className="text-gray-400 text-sm">
                    验证码已发送至 <span className="text-white">+86 {phone}</span>
                  </p>
                  <div className="flex justify-center">
                    <OtpInput onComplete={handleVerifyOtp} />
                  </div>
                  <button
                    disabled={isCounting || loading}
                    onClick={handleSendCode}
                    className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
                  >
                    {isCounting ? `${count}秒后可重发` : '重新发送验证码'}
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
                    onClick={() => setStep(4)}
                    disabled={!gender || !birthday || calculateAge(birthday) < 18}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-[#12141d] font-bold py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
                  >
                    下一步
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
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
                    onClick={() => setStep(5)}
                    disabled={!!nicknameError || !name}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-[#12141d] font-bold py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
                  >
                    下一步
                  </button>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-full"
              >
                <div className="bg-[#1c1e2b] p-6 rounded-2xl shadow-xl border border-white/5 flex flex-col items-center">
                  <div className="relative mb-6 group">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-cyan-500/50 group-hover:border-cyan-500 transition-colors">
                      <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-[#12141d] shadow-lg hover:bg-cyan-400 transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-8">
                    {DEFAULT_AVATARS.map((src, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setAvatar(src)}
                        className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                          avatar === src ? 'border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={src} alt={`Default ${index}`} className="w-full h-full object-cover" />
                      </motion.button>
                    ))}
                  </div>

                  <button
                    onClick={() => setStep(6)}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-[#12141d] font-bold py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
                  >
                    下一步
                  </button>
                </div>
              </motion.div>
            )}

            {step === 6 && (
              <motion.div
                key="step6"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-full h-full flex flex-col"
              >
                <div className="bg-[#1c1e2b] p-6 rounded-2xl shadow-xl border border-white/5 flex flex-col items-center">
                  <p className="text-gray-400 text-sm mb-2 text-center">
                    挑选至少 3 个标签，生成你的“灵魂算法引力”
                  </p>

                  <div className="w-full h-[320px] mb-6">
                    <InterestTagCloud
                      tags={AVAILABLE_TAGS}
                      selectedTags={selectedInterests}
                      onToggleTag={handleToggleInterest}
                    />
                  </div>

                  <div className="w-full flex justify-between items-center mb-6 px-2">
                    <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">已选择</span>
                    <span className={`text-sm font-medium ${selectedInterests.length >= 3 ? 'text-pink-500' : 'text-cyan-400'}`}>
                      {selectedInterests.length}/3
                    </span>
                  </div>

                  <button
                    onClick={handleRegister}
                    disabled={selectedInterests.length < 3 || loading}
                    className={`w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-[#12141d] font-bold py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/20 ${loading ? 'opacity-70' : 'active:scale-[0.98]'}`}
                  >
                    {loading ? '档案生成中...' : (selectedInterests.length < 3 ? `还需选择 ${3 - selectedInterests.length} 个` : '开启星球旅程')}
                  </button>
                </div>
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

      {/* Cropper Overlay */}
      <AnimatePresence>
        {showCropper && image && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
          >
            <div className="w-full max-w-md bg-[#1c1e2b] rounded-2xl overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-white font-medium">裁剪头像</h3>
                <button
                  onClick={() => { setShowCropper(false); setImage(null); }}
                  className="text-gray-400 hover:text-white"
                >
                  取消
                </button>
              </div>

              <div className="aspect-square bg-black overflow-hidden">
                <Cropper
                  src={image}
                  style={{ height: '100%', width: '100%' }}
                  initialAspectRatio={1}
                  aspectRatio={1}
                  guides={true}
                  ref={cropperRef}
                  viewMode={1}
                  background={false}
                  responsive={true}
                  autoCropArea={1}
                  checkOrientation={false}
                />
              </div>

              <div className="p-4 flex gap-4">
                <button
                  onClick={() => { setShowCropper(false); setImage(null); }}
                  className="flex-1 px-4 py-2 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleCrop}
                  className="flex-1 px-4 py-2 rounded-xl bg-cyan-500 text-[#12141d] font-bold hover:bg-cyan-400 transition-colors"
                >
                  确定
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
