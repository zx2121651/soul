import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT || '6379');

const redis = new Redis({
  host: redisHost,
  port: redisPort,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: null
});

redis.on('error', (err) => {
  console.error('Redis Error:', err);
});

redis.on('connect', () => {
  console.log('✅ Successfully connected to Redis.');
});

export default redis;
