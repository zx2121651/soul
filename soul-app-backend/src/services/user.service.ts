import { UserRepository } from '../repositories/user.repository';
import { MomentRepository } from '../repositories/moment.repository';

export class UserService {
  private userRepo = new UserRepository();
  private momentRepo = new MomentRepository();

  async getMeProfile(uuid: string) {
    const user = await this.userRepo.findByUuid(uuid);
    if (!user) throw new Error('User not found');

    const rawMoments = await this.momentRepo.findByUserId(user.id, user.id);
    const moments = rawMoments.map((m: any) => ({
      id: m.id,
      text: m.content,
      image: m.url,
      time: new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      initialLikes: 0,
      comments: 0
    }));

    return {
      profile: {
        name: user.name,
        id: user.uuid,
        avatar: user.avatar,
        followers: user.followersCount || Math.floor(Math.random() * 500),
        following: user.followingCount || Math.floor(Math.random() * 300),
        visitors: user.visitorsCount || Math.floor(Math.random() * 100),
        bio: user.bio
      },
      moments
    };
  }

  async followUser(followerUuid: string, targetId: number) {
    const user = await this.userRepo.findByUuid(followerUuid);
    if (!user) throw new Error('User not found');
    await this.userRepo.follow(user.id, targetId);
    return { success: true };
  }

  async unfollowUser(followerUuid: string, targetId: number) {
    const user = await this.userRepo.findByUuid(followerUuid);
    if (!user) throw new Error('User not found');
    await this.userRepo.unfollow(user.id, targetId);
    return { success: true };
  }

  async search(query: string) {
    return await this.userRepo.searchUsers(query);
  }

  async getTopUsers() {
    return await this.userRepo.getLeaderboard();
  }
}
