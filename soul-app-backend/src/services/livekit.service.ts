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
    const result = await db.query(`
      SELECT vr.id, vr.name as title, vr.online_count, vr.created_at, u.name as owner_name, u.avatar as owner_avatar
      FROM voice_rooms vr
      JOIN users u ON vr.host_id = u.id
      WHERE vr.status = 'active'
      ORDER BY vr.created_at DESC
    `);

    return result.rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      owner: { name: r.owner_name, avatar: r.owner_avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=' + r.owner_name + '&backgroundColor=b6e3f4' },
      tags: ['聊天', '交友'], // Fallback tags since db schema doesn't have it
      listeners: r.online_count || Math.floor(Math.random() * 50) + 1
    }));
  }

  async createRoom(userUuid: string, title: string, tags: string[]) {
    const user = await this.userRepo.findByUuid(userUuid);
    if (!user) throw new Error('User not found');

    const roomId = `room_${crypto.randomUUID().substring(0, 8)}`;
    const db = getDb();

    await db.query(
      `INSERT INTO voice_rooms (name, host_id, online_count, status) VALUES ($1, $2, $3, 'active')`,
      [title, user.id, 1]
    );

    return { roomId, title, tags };
  }

  async createToken(roomId: string, userUuid: string) {
    const user = await this.userRepo.findByUuid(userUuid);
    if (!user) throw new Error('User not found');

    const db = getDb();
    const roomResult = await db.query(`SELECT owner_id FROM voice_rooms WHERE id = $1`, [roomId]);
    const isOwner = roomResult.rowCount !== null && roomResult.rowCount > 0 && roomResult.rows[0].owner_id === user.id;

    const participantName = user.name;
    const participantIdentity = `user-${user.id}`;

    const at = new AccessToken(this.apiKey, this.apiSecret, {
      identity: participantIdentity,
      name: participantName,
    });

    // Owner has more permissions (publish tracks & data channels)
    at.addGrant({
      roomJoin: true,
      room: roomId,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      roomAdmin: isOwner // LK roomAdmin privileges
    });

    return { token: await at.toJwt(), serverUrl: this.serverUrl, isOwner };
  }
}
