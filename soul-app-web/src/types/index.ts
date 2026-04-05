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

export interface TrendingTopic {
  id: number;
  name: string;
  icon: string;
}

export interface Post {
  id: number;
  user: {
    name: string;
    avatar: string;
  };
  content: string;
  type: string;
  tags: string[];
  likes: number;
  coverImage?: string;
  voiceDuration?: string;
}

export interface ExploreResponse {
  banners: ExploreBanner[];
  trendingTopics: TrendingTopic[];
  posts: Post[];
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

export interface PinnedUser {
  id: number;
  name: string;
  avatar: string;
  isOnline: boolean;
}

export interface ChatResponse {
  chats: ChatMessage[];
  pinnedUsers: PinnedUser[];
}

export interface NodeData {
  id: number;
  position: any; // THREE.Vector3 specific
  name: string;
  match: number;
  color: string;
  isSelf?: boolean;
  phase: number;
  speed: number;
  amplitude: number;
}

export interface PlanetResponse {
  nodes: NodeData[];
}
