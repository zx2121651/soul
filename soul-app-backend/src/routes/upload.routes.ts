import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import { sendSuccess, sendError } from '../utils/response';
import { ErrorCode } from '../utils/ErrorCodes';
import OssService from '../services/OssService';

const router = Router();

/**
 * @route GET /api/upload/presigned-url
 * @desc Get a presigned URL for direct upload to OSS
 * @access Private
 */
router.get('/presigned-url', authMiddleware, async (req, res) => {
  const { fileName, mimeType } = req.query;

  if (!fileName || !mimeType) {
    return sendError(res, 400, 'fileName and mimeType are required', ErrorCode.VALIDATION_ERROR);
  }

  try {
    const user = req.user!;
    const timestamp = Date.now();
    // objectKey format: avatars/{uuid}/{timestamp}-{fileName}
    const objectKey = `avatars/${user.uuid}/${timestamp}-${fileName}`;

    const { uploadUrl, publicUrl } = await OssService.getPresignedUrl(
      objectKey,
      mimeType as string,
      300 // 5 minutes expiration
    );

    sendSuccess(res, {
      uploadUrl,
      objectKey,
      publicUrl,
    });
  } catch (error: any) {
    console.error('Failed to generate presigned URL:', error);
    sendError(res, 500, 'Failed to generate upload URL', ErrorCode.SYSTEM_ERROR);
  }
});

export default router;
