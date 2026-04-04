import { UserRepository } from '../repositories/user.repository';
import { MomentRepository } from '../repositories/moment.repository';

export class MomentService {
  private userRepo = new UserRepository();
  private momentRepo = new MomentRepository();

  async createMoment(userUuid: string, type: string, content: string | null, url: string | null) {
    const user = await this.userRepo.findByUuid(userUuid);
    if (!user) throw new Error('User not found');

    return await this.momentRepo.create(user.id, type, content, url);
  }
}
