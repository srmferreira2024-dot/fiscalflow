import { UserRole } from '@prisma/client';

export interface AuthUserView {
  id: string;
  officeId: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResult {
  user: AuthUserView;
  accessToken: string;
  refreshToken: string;
}
