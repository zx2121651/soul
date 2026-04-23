import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, apiClient } from '../api/client';
import PageHeader from '../components/PageHeader';
import type { MeDataResponse, UserProfile } from '../types';
import { Check, Camera, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { validateNickname } from '../utils/validation';
import { compressImage } from '../utils/imageUtils';
import Cropper from "react-cropper";
import type { ReactCropperElement } from "react-cropper";
import "cropperjs/dist/cropper.css";
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showCropper, setShowCropper] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [tempFileName, setTempFileName] = useState('');
  const [tempFileType, setTempFileType] = useState('');

  const cropperRef = useRef<ReactCropperElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initial fetch to get latest profile data
    api.get<MeDataResponse>('/users/me').then(data => {
      if (data.profile) {
        setProfile(data.profile);
        setName(data.profile.name);
        setBio(data.profile.bio || '');
        setAvatar(data.profile.avatar);
      }
    }).catch(err => {
      console.error('获取个人资料失败', err);
      // Fallback to store user if API fails
      if (user) {
        setName(user.name);
        setAvatar(user.avatar);
      }
    });
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTempFileName(file.name);
      setTempFileType(file.type);
      const reader = new FileReader();
      reader.onload = () => {
        setTempImage(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
    // Reset input value to allow selecting the same file again
    if (e.target) e.target.value = '';
  };

  const handleCrop = async () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) return;

    setShowCropper(false);
    setIsUploading(true);
    setUploadProgress(0);
    setError('');

    try {
      // 1. Get cropped blob
      const croppedCanvas = cropper.getCroppedCanvas();
      const blob = await new Promise<Blob | null>((resolve) =>
        croppedCanvas.toBlob((b) => resolve(b), tempFileType || 'image/jpeg', 0.9)
      );

      if (!blob) throw new Error('裁剪图片失败');

      // 2. Compress image
      const file = new File([blob], tempFileName || 'avatar.jpg', { type: tempFileType || 'image/jpeg' });
      const compressedFile = await compressImage(file);

      // 3. Get presigned URL
      const { uploadUrl, publicUrl } = await api.get<{ uploadUrl: string; publicUrl: string }>('/upload/presigned-url', {
        params: {
          fileName: compressedFile.name,
          mimeType: compressedFile.type
        }
      });

      // 4. Direct upload to OSS using axios (not the apiClient to avoid base URL and other interceptors if needed, though axios.put with absolute URL is fine)
      await axios.put(uploadUrl, compressedFile, {
        headers: {
          'Content-Type': compressedFile.type
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadProgress(percentCompleted);
        }
      });

      // 5. Update local state
      setAvatar(publicUrl);
    } catch (err: any) {
      console.error('上传头像失败', err);
      setError(err.message || '上传头像失败');
    } finally {
      setIsUploading(false);
      setTempImage(null);
    }
  };

  const handleSave = async () => {
    const nicknameErr = validateNickname(name);
    if (nicknameErr) {
      setError(nicknameErr);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result = await api.put<{ profile: UserProfile }>('/users/me', { name, bio, avatar });

      // Update local store
      updateUser({
        name: result.profile.name,
        avatar: result.profile.avatar
      });

      navigate(-1);
    } catch (err: any) {
      console.error('保存失败', err);
      setError(err.message || '保存失败');
    } finally {
      setLoading(false);
    }
  };

  if (!profile && !user) {
    return <div className="w-full h-full bg-[#12141d] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
    </div>;
  }

  return (
    <div className="w-full h-full bg-[#12141d] flex flex-col">
      <PageHeader
        title="编辑资料"
        rightAction={
          <button
            onClick={handleSave}
            disabled={loading || isUploading || !name.trim()}
            className="text-cyan-400 font-bold active:opacity-50 disabled:opacity-30"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Check size={24} />}
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <div className="flex flex-col items-center mb-10">
          <div
            className="w-24 h-24 rounded-full overflow-hidden border-[3px] border-[#1c1e2b] bg-gray-800 shadow-xl mb-4 relative cursor-pointer group"
            onClick={() => !isUploading && fileInputRef.current?.click()}
          >
             <img src={avatar} alt="avatar" className="w-full h-full object-cover" />

             {/* Upload Overlay */}
             <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <Camera className="text-white w-6 h-6 mb-1" />
               <span className="text-white text-[10px] font-bold">更换</span>
             </div>

             {/* Loading Mask */}
             {isUploading && (
               <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-10">
                 <div className="relative w-12 h-12 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="transparent"
                        className="text-white/20"
                      />
                      <circle
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="transparent"
                        strokeDasharray={125.6}
                        strokeDashoffset={125.6 - (125.6 * uploadProgress) / 100}
                        className="text-cyan-500 transition-all duration-300"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute text-[10px] text-white font-bold">{uploadProgress}%</span>
                 </div>
               </div>
             )}
          </div>
          <p className="text-gray-500 text-xs">星际公民的独特面孔</p>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-gray-400 text-sm font-medium ml-1">星际代号 (昵称)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={12}
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
              maxLength={100}
              className="bg-[#1c1e2b] text-white px-4 py-3 rounded-2xl outline-none border border-transparent focus:border-cyan-500/50 transition-colors resize-none"
              placeholder="用一段话向宇宙介绍你自己..."
            />
          </div>
        </div>
      </div>

      {/* Cropper Overlay */}
      <AnimatePresence>
        {showCropper && tempImage && (
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
                  onClick={() => { setShowCropper(false); setTempImage(null); }}
                  className="text-gray-400 hover:text-white"
                >
                  取消
                </button>
              </div>

              <div className="aspect-square bg-black overflow-hidden">
                <Cropper
                  src={tempImage}
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
                  onClick={() => { setShowCropper(false); setTempImage(null); }}
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
