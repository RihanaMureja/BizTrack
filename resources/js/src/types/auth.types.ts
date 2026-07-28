export type UserRole = 'admin' | 'owner' | 'cashier' | 'customer';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  company?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  password: string;
  role?: UserRole;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: User;
  redirectTo?: string;
}

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<AuthResult>;
  register: (payload: RegisterPayload) => Promise<AuthResult>;
  logout: () => void;
  getRoleHome: () => string;
}
