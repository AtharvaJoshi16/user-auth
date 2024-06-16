import { ROLES } from "../constants/roles";

export interface User {
  id: string;
  email: string;
  role: ROLES;
  password: string;
  isVerified: boolean;
}
