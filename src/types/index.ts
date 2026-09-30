// Core database types (will be expanded in Phase 3 with Prisma)

export type UserRole = 'citizen' | 'admin';

export interface User {
  id: string;
  name: string;
  phoneNumber: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Report {
  id: string;
  title: string;
  category: string;
  description: string;
  latitude: number;
  longitude: number;
  photoUrl?: string;
  status: 'open' | 'in_progress' | 'resolved';
  resolved: boolean;
  resolvedNotes?: string;
  resolvedAt?: Date;
  upvotes: number;
  userId: string;
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
