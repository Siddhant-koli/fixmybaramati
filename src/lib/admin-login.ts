export type AdminLoginCandidate = {
  id: string;
  fullName: string;
  mobile: string;
  passwordHash: string;
  role: string;
};

export function normalizeAdminName(name: string) {
  return name.normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('en-US');
}

export async function authenticateAdminByName(
  admins: readonly AdminLoginCandidate[],
  fullName: string,
  password: string,
  verifyPassword: (password: string, passwordHash: string) => Promise<boolean>
) {
  const normalizedName = normalizeAdminName(fullName);
  if (!normalizedName) return null;

  const matches = admins.filter(
    (admin) =>
      admin.role === 'ADMIN' && normalizeAdminName(admin.fullName) === normalizedName
  );
  if (matches.length !== 1) return null;

  const [admin] = matches;
  return (await verifyPassword(password, admin.passwordHash)) ? admin : null;
}
