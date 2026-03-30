export interface UserNode {
  id: string;
  name: string;
  avatarUrl: string;
  matchPercentage: number;
  theta: number;
  phi: number;
  radius: number;
  isSelf?: boolean;
}
