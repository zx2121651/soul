import { Router } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { authMiddleware } from '../middlewares/auth.middleware';
import { LiveKitService } from '../services/livekit.service';
import { ErrorCode } from '../utils/ErrorCodes';

const router = Router();
const livekitService = new LiveKitService();

router.get('/', (req, res) => {
  // 语音房大厅列表（目前返回静态或假表结构）
  sendSuccess(res, {
    rooms: [
      { id: 'music_room_1', title: '一起听周杰伦', listeners: 142, tags: ['音乐', '周杰伦'] },
      { id: 'chat_room_2', title: '失眠深夜杂谈', listeners: 56, tags: ['深夜', '树洞'] },
    ]
  });
});

router.post('/:roomId/join', authMiddleware, async (req, res, next) => {
  try {
    const roomId = req.params.roomId as string;
    const userUuid = req.user?.uuid || 'soul_123456';

    const { token, serverUrl } = await livekitService.createToken(roomId, userUuid);

    sendSuccess(res, { token, serverUrl }, '加入语音房成功');
  } catch (error: any) {
    if (error.message === 'User not found') return sendError(res, 404, undefined, ErrorCode.RESOURCE_NOT_FOUND);
    next(error);
  }
});

export default router;
