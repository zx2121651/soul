import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  // 开发环境下打开 log 可以看到执行的 SQL
  // log: ['query', 'info', 'warn', 'error'],
});

export function getDb() {
  return prisma;
}

export async function initDb() {
  try {
    await prisma.$connect();
    console.log('✅ Successfully connected to Database via Prisma.');
  } catch (err) {
    console.error('❌ Could not connect to Database via Prisma.', err);
    process.exit(1);
  }
}
