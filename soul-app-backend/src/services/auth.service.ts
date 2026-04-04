import { UserRepository } from '../repositories/user.repository';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export class AuthService {
  private userRepo = new UserRepository();

  async register(username: string, passwordRaw: string, name: string) {
    const existing = await this.userRepo.findByUsername(username);
    if (existing) throw new Error('Username already exists');

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(passwordRaw, salt);

    // generate random uuid
    const uuid = crypto.randomUUID();

    const user = await this.userRepo.createUser(uuid, name, username, hash);
    return user;
  }

  async login(username: string, passwordRaw: string) {
    const user = await this.userRepo.findByUsername(username);
    if (!user) throw new Error('Invalid credentials');

    if (await bcrypt.compare(passwordRaw, user.password_hash)) {
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
