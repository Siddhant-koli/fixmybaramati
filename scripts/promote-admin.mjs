import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

dotenv.config({ path: '.env.local' });

const mobile = process.argv[2] ?? '';
if (!/^[6-9]\d{9}$/.test(mobile)) {
  console.error('Usage: npm run admin:promote -- <10-digit-mobile-number>');
  process.exit(2);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is required.');
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

try {
  const user = await prisma.user.update({
    where: { mobile },
    data: { role: 'ADMIN' },
    select: { fullName: true, mobile: true },
  });
  console.log(`Administrator access granted to ${user.fullName} (${user.mobile}).`);
} catch (error) {
  if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
    console.error('No account exists with that mobile number.');
  } else {
    console.error('Unable to grant administrator access. Verify the database and migration.');
  }
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}