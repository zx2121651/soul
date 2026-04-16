import request from 'supertest';
import app from '../src/app';
import { AuthService } from '../src/services/auth.service';

jest.mock('../src/services/auth.service');

describe('POST /api/auth/send-code', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if phone is missing', async () => {
    const res = await request(app).post('/api/auth/send-code').send({});
    expect(res.status).toBe(400);
    expect(res.body.code).toBe(2001); // VALIDATION_ERROR
  });

  it('should return 400 if phone is invalid', async () => {
    const res = await request(app).post('/api/auth/send-code').send({ phone: '123' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe(2001);
  });

  it('should return 200 and success message for valid phone (11-digit)', async () => {
    const sendOtpSpy = jest.spyOn(AuthService.prototype, 'sendOtp').mockResolvedValue(undefined);

    const res = await request(app).post('/api/auth/send-code').send({ phone: '13812345678' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      code: 0,
      message: '验证码发送成功',
      data: null
    });
    expect(sendOtpSpy).toHaveBeenCalledWith('13812345678');
  });

  it('should return 200 for valid E.164 phone', async () => {
    const sendOtpSpy = jest.spyOn(AuthService.prototype, 'sendOtp').mockResolvedValue(undefined);

    const res = await request(app).post('/api/auth/send-code').send({ phone: '+8613812345678' });

    expect(res.status).toBe(200);
    expect(sendOtpSpy).toHaveBeenCalledWith('+8613812345678');
  });

  it('should return 500 if sendOtp fails', async () => {
    jest.spyOn(AuthService.prototype, 'sendOtp').mockRejectedValue(new Error('Sms failed'));

    const res = await request(app).post('/api/auth/send-code').send({ phone: '13812345678' });

    expect(res.status).toBe(500);
  });
});
