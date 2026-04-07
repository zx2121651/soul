import { UserRepository } from '../repositories/user.repository';
import { MomentRepository } from '../repositories/moment.repository';

export class UserService {
  private userRepo = new UserRepository();
  private momentRepo = new MomentRepository();

  async getMeProfile(uuid: string) {
    const user = await this.userRepo.findByUuid(uuid);
    if (!user) throw new Error('User not found');

    const moments = await this.momentRepo.findByUserId(user.id);

    return {
      profile: {
        name: user.name,
        id: user.uuid,
        avatar: user.avatar,
        followers: user.followers,
        following: user.following,
        visitors: user.visitors,
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
