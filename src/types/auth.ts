/**
 * 用户认证相关类型定义
 */

/** 用户角色 */
export type UserRole = 'admin' | 'user';

/** 用户 */
export interface User {
  id: string;
  email: string;
  passwordHash: string; // 存储哈希值，永不存储明文
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

/** 认证 Token 载荷 */
export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number; // 签发时间
  exp: number; // 过期时间
}

/** 认证 Token 对 */
export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // 秒
}

/** 登录请求 */
export interface LoginRequest {
  email: string;
  password: string;
}

/** 注册请求 */
export interface RegisterRequest {
  email: string;
  password: string;
}

/** 认证响应 */
export interface AuthResponse {
  user: Omit<User, 'passwordHash'>; // 不返回密码哈希
  token: AuthToken;
}

/** 认证错误类型 */
export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code: AuthErrorCode
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/** 认证错误码 */
export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'   // 邮箱或密码错误
  | 'USER_NOT_FOUND'        // 用户不存在
  | 'EMAIL_EXISTS'          // 邮箱已注册
  | 'INVALID_TOKEN'         // Token 无效
  | 'TOKEN_EXPIRED'         // Token 过期
  | 'WEAK_PASSWORD';        // 密码强度不足
