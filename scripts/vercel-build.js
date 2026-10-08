const { spawnSync } = require('node:child_process');

const isVercelProduction =
  process.env.VERCEL === '1' && process.env.VERCEL_ENV === 'production';

const run = (modulePath, args) => {
  const result = spawnSync(process.execPath, [require.resolve(modulePath), ...args], {
    env: process.env,
    stdio: 'inherit',
  });

  if (result.error) {
    console.error(`Failed to start ${modulePath}: ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

if (isVercelProduction) {
  if (!process.env.DATABASE_URL) {
    console.error('Production migrations require DATABASE_URL in the Vercel environment.');
    process.exit(1);
  }

  run('prisma/build/index.js', ['migrate', 'deploy']);
}

run('next/dist/bin/next', ['build']);
