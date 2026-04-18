import OSS from 'ali-oss';
import { config } from '../utils/config';

export interface IOssProvider {
  uploadBuffer(buffer: Buffer, fileName: string, mimeType: string): Promise<string>;
}

export class AliyunOssProvider implements IOssProvider {
  private client: OSS;

  constructor() {
    if (!config.ACCESS_KEY_ID || !config.SECRET_ACCESS_KEY || !config.BUCKET_NAME || !config.REGION) {
      throw new Error('Aliyun OSS credentials or configuration missing');
    }

    this.client = new OSS({
      region: config.REGION,
      accessKeyId: config.ACCESS_KEY_ID,
      accessKeySecret: config.SECRET_ACCESS_KEY,
      bucket: config.BUCKET_NAME,
      secure: true,
    });
  }

  async uploadBuffer(buffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    try {
      const result = await this.client.put(fileName, buffer, {
        mime: mimeType,
        headers: {
          'Content-Type': mimeType,
        },
      });
      // ali-oss result.url contains the accessible URL
      return result.url;
    } catch (error: any) {
      console.error('Aliyun OSS upload failed:', error);
      throw new Error(`Failed to upload to Aliyun OSS: ${error.message}`);
    }
  }
}

export class MockOssProvider implements IOssProvider {
  async uploadBuffer(buffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    console.log(`[Mock OSS] Uploading ${fileName} (${mimeType}), size: ${buffer.length} bytes`);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    return `https://mock-oss.com/${fileName}`;
  }
}

export class OssService {
  private provider: IOssProvider;

  constructor() {
    const hasCredentials = !!(
      config.ACCESS_KEY_ID &&
      config.SECRET_ACCESS_KEY &&
      config.BUCKET_NAME &&
      config.REGION
    );

    if (hasCredentials) {
      this.provider = new AliyunOssProvider();
    } else {
      console.warn('OSS credentials not fully configured, using MockOssProvider');
      this.provider = new MockOssProvider();
    }
  }

  async uploadBuffer(buffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    return this.provider.uploadBuffer(buffer, fileName, mimeType);
  }
}

export default new OssService();
