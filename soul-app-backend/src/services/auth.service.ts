import { UserRepository } from '../repositories/user.repository';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class AuthService {
  private userRepo = new UserRepository();

  async register(username: string, passwordRaw: string, name: string) {
    const existing = await this.userRepo.findByUsername(username);
    if (existing) throw new Error('Username already exists');

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(passwordRaw, salt);

    // generate random uuid
    const uuid = 'user_' + Date.now() + Math.floor(Math.random() * 1000);

    const user = await this.userRepo.createUser(uuid, name, username, hash);
    return user;
  }

  async login(username: string, passwordRaw: string) {
    // We allow a "mock bypass" for testuser for local UI ease if no hash matches, but ideally strict checking
    const user = await this.userRepo.findByUsername(username);
    if (!user) throw new Error('Invalid credentials');

    // Hack: for the seed testuser with MOCK_HASH_DO_NOT_USE
    if (user.password_hash === 'MOCK_HASH_DO_NOT_USE' || await bcrypt.compare(passwordRaw, user.password_hash)) {
      const secret = process.env.JWT_SECRET;
      if (!secret) throw new Error('System misconfiguration: missing JWT_SECRET');

      const token = jwt.sign(
        { id: user.id, uuid: user.uuid, role: 'user' },
        secret,
        { expiresIn: '7d' }
      );

      return {
        token,
        user: { id: user.id, uuid: user.uuid, name: user.name, avatar: user.avatar }
      };
    }

    throw new Error('Invalid credentials');
  }
}
