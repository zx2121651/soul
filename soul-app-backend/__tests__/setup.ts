import redis from '../src/redis';

// Mock Redis by default for all tests to avoid connection errors
jest.mock('../src/redis', () => ({
  set: jest.fn().mockResolvedValue('OK'),
  get: jest.fn(),
  del: jest.fn(),
  on: jest.fn(),
  call: jest.fn().mockImplementation((command, ...args) => {
    const cmd = command.toLowerCase();
    if (cmd === 'script') {
      return Promise.resolve('mock-sha');
    }
    if (cmd === 'evalsha' || cmd === 'eval') {
      return Promise.resolve([1, Date.now() + 1000]); // [current, resetTime]
    }
    return Promise.resolve();
  }),
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
