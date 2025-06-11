import { RolesType } from './roles';

export interface JwtPayload {
  sub: string;
  email: string;
  fullName?: string;
  role: RolesType;
}
