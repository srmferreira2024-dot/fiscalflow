import { UserRole } from '@prisma/client';

export interface UserView {
  id: string;
  officeId: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: Date | null;
}
