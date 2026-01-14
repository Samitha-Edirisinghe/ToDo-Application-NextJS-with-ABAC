export type UserRole = 'user' | 'manager' | 'admin';
export type TodoStatus = 'draft' | 'in_progress' | 'completed';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export interface Todo {
  id: string;
  title: string;
  description: string | null;
  status: TodoStatus;
  user_id: string;
  user?: User;
  created_at: Date;
  updated_at: Date;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData extends LoginCredentials {
  name: string;
  role?: UserRole;
}

export interface CreateTodoData {
  title: string;
  description?: string;
  status?: TodoStatus;
}

export interface UpdateTodoData extends Partial<CreateTodoData> {
  id: string;
}

export interface ABACPermissions {
  canViewAll: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canDeleteAny: boolean;
}