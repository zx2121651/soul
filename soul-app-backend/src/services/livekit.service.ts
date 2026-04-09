import { AccessToken } from 'livekit-server-sdk';
import { UserRepository } from '../repositories/user.repository';
import { getDb } from '../db';
import crypto from 'crypto';

export class LiveKitService {
  private userRepo = new UserRepository();
  private apiKey = process.env.LIVEKIT_API_KEY || 'devkey';
  private apiSecret = process.env.LIVEKIT_API_SECRET || 'secret';
  public serverUrl = process.env.LIVEKIT_URL || 'wss://your-livekit-url.livekit.cloud';

  async getActiveRooms() {
    const db = getDb();
    const rooms = await db.voiceRoom.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
      include: { host: { select: { name: true, avatar: true } } }
    });

    return rooms.map(r => ({
      id: r.id,
      title: r.name,
      owner: { name: r.host.name, avatar: r.host.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=' + r.host.name },
      tags: ['聊天', '交友'],
      listeners: r.onlineCount || Math.floor(Math.random() * 50) + 1
    }));
  }

  async createRoom(userUuid: string, title: string, tags: string[]) {
    const user = await this.userRepo.findByUuid(userUuid);
    if (!user) throw new Error('User not found');

    const db = getDb();
    const newRoom = await db.voiceRoom.create({
      data: {
        name: title,
        hostId: user.id,
        onlineCount: 1,
        tags: JSON.stringify(tags),
        status: 'active'
      }
    });

    return { roomId: newRoom.id, title, tags };
  }

  async createToken(roomId: string, userUuid: string) {
    const user = await this.userRepo.findByUuid(userUuid);
    if (!user) throw new Error('User not found');

    const db = getDb();
    const room = await db.voiceRoom.findUnique({ where: { id: parseInt(roomId) } });
    const isOwner = room && room.hostId === user.id;

    const participantName = user.name;
    const participantIdentity = `user-${user.id}`;

    const at = new AccessToken(this.apiKey, this.apiSecret, {
      identity: participantIdentity,
      name: participantName,
    });

    at.addGrant({
      roomJoin: true,
      room: roomId,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      roomAdmin: !!isOwner
    });

    return { token: await at.toJwt(), serverUrl: this.serverUrl, isOwner };
  }
}
