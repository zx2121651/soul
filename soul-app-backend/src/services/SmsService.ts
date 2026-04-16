import { SmsSendFailedException } from '../utils/exceptions';
// @ts-ignore
import SMSClient from '@alicloud/sms-sdk';

export interface ISmsProvider {
  sendCode(phone: string, code: string): Promise<void>;
}

export class AliyunSmsProvider implements ISmsProvider {
  private client: any;
  private signName: string;
  private templateCode: string;

  constructor() {
    const accessKeyId = process.env.ALIYUN_ACCESS_KEY_ID;
    const secretAccessKey = process.env.ALIYUN_ACCESS_KEY_SECRET;
    this.signName = process.env.ALIYUN_SMS_SIGN_NAME || '';
    this.templateCode = process.env.ALIYUN_SMS_TEMPLATE_CODE || '';

    if (!accessKeyId || !secretAccessKey) {
      throw new Error('Aliyun credentials are not configured');
    }

    this.client = new SMSClient({ accessKeyId, secretAccessKey });
  }

  async sendCode(phone: string, code: string): Promise<void> {
    try {
      const res = await this.client.sendSMS({
        PhoneNumbers: phone,
        SignName: this.signName,
        TemplateCode: this.templateCode,
        TemplateParam: JSON.stringify({ code }),
      });

      if (res.Code !== 'OK') {
        throw new Error(res.Message || 'Unknown error from Aliyun');
      }
    } catch (error: any) {
      console.error('Aliyun SMS send failed:', error);
      throw new SmsSendFailedException(
        `Failed to send SMS via Aliyun: ${error.message}`,
        error.status || 500
      );
    }
  }
}

export class MockSmsProvider implements ISmsProvider {
  async sendCode(phone: string, code: string): Promise<void> {
    console.log(`[Mock SMS] Sending code ${code} to ${phone}`);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

export class SmsService {
  private provider: ISmsProvider;

  constructor() {
    const providerType = process.env.SMS_PROVIDER || 'mock';

    if (providerType === 'aliyun') {
      this.provider = new AliyunSmsProvider();
    } else {
      this.provider = new MockSmsProvider();
    }
  }

  async sendCode(phone: string, code: string): Promise<void> {
    return this.provider.sendCode(phone, code);
  }
}
