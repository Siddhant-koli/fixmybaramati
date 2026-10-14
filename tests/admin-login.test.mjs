import assert from 'node:assert/strict';
import test from 'node:test';

import { authenticateAdminByName, normalizeAdminName } from '../src/lib/admin-login.ts';

const adminAccount = (overrides = {}) => ({
  id: 'admin-id',
  fullName: 'Sandesh Koli',
  mobile: '9000000000',
  passwordHash: 'stored-hash',
  role: 'ADMIN',
  ...overrides,
});

test('normalizes case, compatibility characters, and whitespace', () => {
  assert.equal(normalizeAdminName('  SANDESH   Koli  '), 'sandesh koli');
  assert.equal(normalizeAdminName('Ｓａｎｄｅｓｈ Koli'), 'sandesh koli');
});

test('authenticates one matching ADMIN after verifying the password', async () => {
  const admin = adminAccount();
  let compared = false;
  const result = await authenticateAdminByName(
    [admin],
    '  sandesh   koli ',
    'correct-password',
    async (password, hash) => {
      compared = true;
      return password === 'correct-password' && hash === admin.passwordHash;
    }
  );

  assert.equal(result, admin);
  assert.equal(compared, true);
});

test('rejects an invalid password', async () => {
  const result = await authenticateAdminByName(
    [adminAccount()],
    'Sandesh Koli',
    'incorrect-password',
    async () => false
  );

  assert.equal(result, null);
});

test('rejects an unknown name without checking a password', async () => {
  let compared = false;
  const result = await authenticateAdminByName(
    [adminAccount()],
    'Unknown Administrator',
    'any-password',
    async () => {
      compared = true;
      return true;
    }
  );

  assert.equal(result, null);
  assert.equal(compared, false);
});

test('rejects duplicate normalized ADMIN names without choosing one', async () => {
  let compared = false;
  const result = await authenticateAdminByName(
    [
      adminAccount(),
      adminAccount({ id: 'second-admin', fullName: ' SANDESH   KOLI ' }),
    ],
    'Sandesh Koli',
    'any-password',
    async () => {
      compared = true;
      return true;
    }
  );

  assert.equal(result, null);
  assert.equal(compared, false);
});

test('rejects citizen credentials in administrator mode', async () => {
  const result = await authenticateAdminByName(
    [adminAccount({ role: 'CITIZEN' })],
    'Sandesh Koli',
    'citizen-password',
    async () => true
  );

  assert.equal(result, null);
});
