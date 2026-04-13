/**
 * 认证配置
 * 从环境变量读取，提供默认值
 */

import type { AuthErrorCode } from '../types/auth.js';

/** JWT 配置 */
export const jwtConfig = {
  /** 访问令牌密钥（必须设置） */
  get secret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET 环境变量未设置');
    }
    return secret;
  },

  /** 刷新令牌密钥（必须设置，应与访问令牌不同） */
  get refreshSecret(): string {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET 环境变量未设置');
    }
    return secret;
  },

  /** 访问令牌过期时间（默认 15 分钟） */
  accessTokenExpiry: parseInt(process.env.JWT_ACCESS_EXPIRY ?? '900', 10),

  /** 刷新令牌过期时间（默认 7 天） */
  refreshTokenExpiry: parseInt(process.env.JWT_REFRESH_EXPIRY ?? '604800', 10),
} as const;

/** 密码哈希配置 */
export const passwordConfig = {
  /** bcrypt 轮数（默认 12，数字越大越安全但越慢） */
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS ?? '12', 10),

  /** 最小密码长度 */
  minLength: 8,

  /** 密码强度要求 */
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: false,
} as const;

/** 错误消息映射 */
export const authErrorMessages: Record<AuthErrorCode, string> = {
  INVALID_CREDENTIALS: '邮箱或密码错误',
  USER_NOT_FOUND: '用户不存在',
  EMAIL_EXISTS: '该邮箱已注册',
  INVALID_TOKEN: '无效的认证令牌',
  TOKEN_EXPIRED: '认证令牌已过期',
  WEAK_PASSWORD: '密码强度不足',
};
