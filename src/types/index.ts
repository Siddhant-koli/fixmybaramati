// Core database types (will be expanded in Phase 3 with Prisma)

export type UserRole = 'CITIZEN' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  phoneNumber: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Admin {
  id: string;
  adminId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
