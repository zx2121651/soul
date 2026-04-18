import { Router } from 'express';
import OssService from '../services/OssService';

const router = Router();

router.post('/upload-test', async (req, res) => {
  try {
    // For test purposes, we'll use a small transparent 1x1 pixel PNG buffer
    // or just a string buffer if the client doesn't send anything.
    const testBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64'
    );
    const fileName = `debug/test-${Date.now()}.png`;
    const url = await OssService.uploadBuffer(testBuffer, fileName, 'image/png');

    res.json({
      success: true,
      url,
      message: 'Upload successful (debug)'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
