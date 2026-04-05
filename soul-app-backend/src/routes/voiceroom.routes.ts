import { Router } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { authMiddleware } from '../middlewares/auth.middleware';
import { LiveKitService } from '../services/livekit.service';
import { ErrorCode } from '../utils/ErrorCodes';

const router = Router();
const livekitService = new LiveKitService();

router.get('/', async (req, res, next) => {
  try {
    const rooms = await livekitService.getActiveRooms();
    sendSuccess(res, { rooms });
  } catch (error) {
    next(error);
  }
});

router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { title, tags } = req.body;
    const userUuid = req.user?.uuid || 'soul_123456';
    if (!title) return sendError(res, 400, 'Title is required', ErrorCode.VALIDATION_ERROR);

    const result = await livekitService.createRoom(userUuid, title, tags || []);
    sendSuccess(res, result, '房间创建成功');
  } catch (error: any) {
    next(error);
  }
});

router.post('/:roomId/join', authMiddleware, async (req, res, next) => {
  try {
    const roomId = req.params.roomId as string;
    const userUuid = req.user?.uuid || 'soul_123456';

    const { token, serverUrl, isOwner } = await livekitService.createToken(roomId, userUuid);

    sendSuccess(res, { token, serverUrl, isOwner, roomId }, '加入语音房成功');
  } catch (error: any) {
    if (error.message === 'User not found') return sendError(res, 404, undefined, ErrorCode.RESOURCE_NOT_FOUND);
    next(error);
  }
});

export default router;
