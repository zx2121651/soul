export interface UserProfile {
  id: string | number;
  name: string;
  avatar: string;
  bio?: string;
  followers?: number;
  following?: number;
  visitors?: number;
  gender?: 'male' | 'female';
  age?: number;
  isOnline?: boolean;
}

export interface MomentData {
  id: number;
  type: 'text' | 'image';
  content?: string;
  url?: string;
  user_id?: number;
  created_at?: string;
}

export interface MeDataResponse {
  profile: UserProfile;
  moments: MomentData[];
}

export interface ExploreBanner {
  id: number;
  title: string;
  bg: string;
  emoji: string;
}

export interface ChatMessage {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  isOfficial: boolean;
}
