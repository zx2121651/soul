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
}
