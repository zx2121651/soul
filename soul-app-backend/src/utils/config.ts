import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3001').transform(Number),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  JWT_SECRET: z.string().default('soul-secret'),

  // OSS Configuration
  ACCESS_KEY_ID: z.string().optional(),
  SECRET_ACCESS_KEY: z.string().optional(),
  BUCKET_NAME: z.string().optional(),
  REGION: z.string().optional(),

  // SMS Configuration
  SMS_PROVIDER: z.enum(['aliyun', 'mock']).default('mock'),
  ALIYUN_ACCESS_KEY_ID: z.string().optional(),
  ALIYUN_ACCESS_KEY_SECRET: z.string().optional(),
  ALIYUN_SMS_SIGN_NAME: z.string().optional(),
  ALIYUN_SMS_TEMPLATE_CODE: z.string().optional(),

  // Redis Configuration
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379').transform(Number),

  // Mock
  MOCK_ROUTES_ENABLED: z.string().default('false').transform(v => v === 'true'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const config = parsed.data;
