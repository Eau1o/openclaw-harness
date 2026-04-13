/**
 * 认证业务逻辑层
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type {
  User,
  AuthToken,
  AuthTokenPayload,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  AuthError,
  AuthErrorCode,
} from '../types/auth.js';
import { jwtConfig, passwordConfig, authErrorMessages } from '../config/auth.js';
import { createUser, findUserByEmail, findUserById } from '../repo/user.js';

/** 创建 AuthError */
function createAuthError(code: AuthErrorCode): AuthError {
  const error = new Error(authErrorMessages[code]) as AuthError;
  error.name = 'AuthError';
  error.code = code;
  return error;
}

/** 验证密码强度 */
function validatePasswordStrength(password: string): boolean {
  if (password.length < passwordConfig.minLength) return false;
  if (passwordConfig.requireUppercase && !/[A-Z]/.test(password)) return false;
  if (passwordConfig.requireLowercase && !/[a-z]/.test(password)) return false;
  if (passwordConfig.requireNumber && !/[0-9]/.test(password)) return false;
  if (passwordConfig.requireSpecialChar && !/[!@#$%^&*]/.test(password)) return false;
  return true;
}

/** 生成 Token */
function generateTokens(user: User): AuthToken {
  const payload: Omit<AuthTokenPayload, 'iat' | 'exp'> = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.accessTokenExpiry,
  });

  const refreshToken = jwt.sign(payload, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshTokenExpiry,
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: jwtConfig.accessTokenExpiry,
  };
}

/** 注册用户 */
export async function register(request: RegisterRequest): Promise<AuthResponse> {
  // 检查邮箱是否已存在
  const existingUser = await findUserByEmail(request.email);
  if (existingUser) {
    throw createAuthError('EMAIL_EXISTS');
  }

  // 验证密码强度
  if (!validatePasswordStrength(request.password)) {
    throw createAuthError('WEAK_PASSWORD');
  }

  // 哈希密码
  const passwordHash = await bcrypt.hash(request.password, passwordConfig.bcryptRounds);

  // 创建用户
  const user = await createUser(request.email, passwordHash);

  // 生成 Token
  const token = generateTokens(user);

  // 返回（不包含 passwordHash）
  const { passwordHash: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
}

/** 登录 */
export async function login(request: LoginRequest): Promise<AuthResponse> {
  // 查找用户
  const user = await findUserByEmail(request.email);
  if (!user) {
    throw createAuthError('INVALID_CREDENTIALS');
  }

  // 验证密码
  const isValid = await bcrypt.compare(request.password, user.passwordHash);
  if (!isValid) {
    throw createAuthError('INVALID_CREDENTIALS');
  }

  // 生成 Token
  const token = generateTokens(user);

  // 返回（不包含 passwordHash）
  const { passwordHash: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
}

/** 验证 Token */
export async function validateToken(token: string): Promise<AuthTokenPayload> {
  try {
    const payload = jwt.verify(token, jwtConfig.secret) as AuthTokenPayload;
    // 确认用户仍然存在
    const user = await findUserById(payload.userId);
    if (!user) {
      throw createAuthError('USER_NOT_FOUND');
    }
    return payload;
  } catch (error) {
    if (error instanceof Error && error.name === 'TokenExpiredError') {
      throw createAuthError('TOKEN_EXPIRED');
    }
    throw createAuthError('INVALID_TOKEN');
  }
}

/** 刷新 Token（技术债务 TD-002：待实现） */
export async function refreshToken(refreshToken: string): Promise<AuthToken> {
  try {
    const payload = jwt.verify(refreshToken, jwtConfig.refreshSecret) as AuthTokenPayload;
    const user = await findUserById(payload.userId);
    if (!user) {
      throw createAuthError('USER_NOT_FOUND');
    }
    return generateTokens(user);
  } catch (error) {
    if (error instanceof Error && error.name === 'TokenExpiredError') {
      throw createAuthError('TOKEN_EXPIRED');
    }
    throw createAuthError('INVALID_TOKEN');
  }
}
