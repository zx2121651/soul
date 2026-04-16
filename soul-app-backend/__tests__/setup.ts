import redis from '../src/redis';

// Mock Redis by default for all tests to avoid connection errors
jest.mock('../src/redis', () => ({
  set: jest.fn().mockResolvedValue('OK'),
  get: jest.fn(),
  del: jest.fn(),
  on: jest.fn(),
  quit: jest.fn().mockResolvedValue('OK'),
  status: 'ready',
  multi: jest.fn().mockReturnValue({
    incr: jest.fn().mockReturnThis(),
    expire: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([])
  })
}));

afterAll(async () => {
  // Ensure any potential handles are closed
  await redis.quit();
});
