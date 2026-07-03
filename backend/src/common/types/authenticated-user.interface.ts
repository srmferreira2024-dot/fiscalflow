import { UserRole } from '@prisma/client';

export interface AuthenticatedUser {
  userId: string;
  officeId: string;
  email: string;
  role: UserRole;
}
