import React from 'react';

interface UserProfileHeaderProps {
  name: string;
  avatar?: string;
  bio?: string;
  coverImage?: string;
}

const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({
  name,
  avatar,
  bio,
  coverImage,
}) => {
  const defaultAvatar = 'https://api.dicebear.com/7.x/adventurer/svg?seed=Soul&backgroundColor=ffdfbf';

  return (
    <div className="relative w-full">
      {/* Background Cover Area */}
      <div className="h-[150px] w-full overflow-hidden relative">
        {coverImage ? (
          <img
            src={coverImage}
            alt="Profile Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80" />
        )}
      </div>

      {/* Avatar Section */}
      <div className="relative px-6">
        <div className="absolute -bottom-10 left-6">
          <div className="w-24 h-24 rounded-full border-4 border-white bg-[#12141d] overflow-hidden shadow-lg">
            <img
              src={avatar || defaultAvatar}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* User Info Section (Text) */}
      <div className="pt-12 px-6 pb-4">
        <h2 className="text-2xl font-bold text-white tracking-tight">
          {name}
        </h2>
        {bio && (
          <p className="mt-1 text-sm text-gray-400 leading-relaxed max-w-[80%]">
            {bio}
          </p>
        )}
      </div>
    </div>
  );
};

export default UserProfileHeader;
