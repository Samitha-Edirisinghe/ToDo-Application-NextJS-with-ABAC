import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, getUserByEmail, getUserById } from './db';
import { User, AuthResponse, LoginCredentials, SignupData } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: Omit<User, 'password'>): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse | null> {
  const user = await getUserByEmail(credentials.email);
  
  if (!user) {
    return null;
  }
  
  const isValidPassword = await verifyPassword(credentials.password, user.password);
  
  if (!isValidPassword) {
    return null;
  }
  
  const { password, ...userWithoutPassword } = user;
  const token = generateToken(userWithoutPassword);
  
  return {
    user: userWithoutPassword,
    token,
  };
}

export async function signup(data: SignupData): Promise<AuthResponse | null> {
  const existingUser = await getUserByEmail(data.email);
  
  if (existingUser) {
    throw new Error('User already exists');
  }
  
  const hashedPassword = await hashPassword(data.password);
  const role = data.role || 'user';
  
  const user = await createUser({
    email: data.email,
    name: data.name,
    password: hashedPassword,
    role,
  });
  
  const token = generateToken(user);
  
  return {
    user,
    token,
  };
}

export async function getCurrentUser(token?: string): Promise<Omit<User, 'password'> | null> {
  if (!token) return null;
  
  const decoded = verifyToken(token);
  if (!decoded) return null;
  
  return getUserById(decoded.id);
}