import { RolesType } from './roles';

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  role: RolesType;
}
