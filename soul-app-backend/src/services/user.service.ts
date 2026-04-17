import { UserRepository } from '../repositories/user.repository';
import { MomentRepository } from '../repositories/moment.repository';

export class UserService {
  private userRepo = new UserRepository();
  private momentRepo = new MomentRepository();

  async getMeProfile(userId: number) {
    const user = await this.userRepo.findProfileById(userId);
    if (!user) throw new Error('User not found');

    const rawMoments = await this.momentRepo.findByUserId(userId, userId);
    const moments = rawMoments.map((m: any) => ({
      id: m.id,
      text: m.content,
      image: m.url,
      time: new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      initialLikes: 0,
      comments: 0
    }));

    let interests: string[] = [];
    if (user.interests) {
      try {
        interests = JSON.parse(user.interests);
      } catch (e) {
        interests = [];
      }
    }

    return {
      profile: {
        ...user,
        interests,
        // Keep compatibility with front-end if needed, but the primary goal is clear structure
        id: user.uuid,
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
