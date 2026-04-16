import { SmsService, MockSmsProvider, AliyunSmsProvider } from '../src/services/SmsService';
import { SmsSendFailedException } from '../src/utils/exceptions';

describe('SmsService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should use MockSmsProvider by default (or when SMS_PROVIDER is mock)', async () => {
    process.env.SMS_PROVIDER = 'mock';
    const smsService = new SmsService();
    // @ts-ignore - accessing private member for testing
    expect(smsService.provider).toBeInstanceOf(MockSmsProvider);
  });

  it('should use AliyunSmsProvider when SMS_PROVIDER is aliyun', () => {
    process.env.SMS_PROVIDER = 'aliyun';
    process.env.ALIYUN_ACCESS_KEY_ID = 'test';
    process.env.ALIYUN_ACCESS_KEY_SECRET = 'test';

    const smsService = new SmsService();
    // @ts-ignore
    expect(smsService.provider).toBeInstanceOf(AliyunSmsProvider);
  });

  it('MockSmsProvider should send code successfully', async () => {
    const provider = new MockSmsProvider();
    await expect(provider.sendCode('1234567890', '1234')).resolves.toBeUndefined();
  });

  it('AliyunSmsProvider should throw if credentials missing', () => {
    process.env.ALIYUN_ACCESS_KEY_ID = '';
    process.env.ALIYUN_ACCESS_KEY_SECRET = '';

    expect(() => new AliyunSmsProvider()).toThrow('Aliyun credentials are not configured');
  });
});
