import { AccessToken } from 'livekit-server-sdk';
import { UserRepository } from '../repositories/user.repository';

export class LiveKitService {
  private userRepo = new UserRepository();

  // If you don't have keys configured, it will fail to sign, so we provide default mocks just to avoid server crash.
  // In a real app, these must be your actual livekit cloud/hosted keys.
  private apiKey = process.env.LIVEKIT_API_KEY || 'devkey';
  private apiSecret = process.env.LIVEKIT_API_SECRET || 'secret';
  public serverUrl = process.env.LIVEKIT_URL || 'wss://your-livekit-url.livekit.cloud';

  async createToken(roomName: string, userUuid: string) {
    const user = await this.userRepo.findByUuid(userUuid);
    if (!user) throw new Error('User not found');

    const participantName = user.name;
    const participantIdentity = `user-${user.id}`;

    const at = new AccessToken(this.apiKey, this.apiSecret, {
      identity: participantIdentity,
      name: participantName,
    });

    at.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true });

    return { token: await at.toJwt(), serverUrl: this.serverUrl };
  }
}
