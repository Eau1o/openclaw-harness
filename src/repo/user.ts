/**
 * 用户数据访问层
 * 实际项目中应替换为真实数据库操作
 */

import type { User, UserRole } from '../types/auth.js';

/** 内存存储（临时实现） */
const users = new Map<string, User>();

/** 用户表 Schema 定义（用于数据库迁移） */
export const userSchema = {
  tableName: 'users',
  columns: {
    id: { type: 'uuid', primaryKey: true },
    email: { type: 'varchar', length: 255, unique: true, nullable: false },
    passwordHash: { type: 'varchar', length: 255, nullable: false },
    role: { type: 'enum', values: ['admin', 'user'], default: 'user' },
    createdAt: { type: 'timestamp', default: 'now()' },
    updatedAt: { type: 'timestamp', default: 'now()' },
  },
} as const;

/** 创建用户 */
export async function createUser(
  email: string,
  passwordHash: string,
  role: UserRole = 'user'
): Promise<User> {
  const id = crypto.randomUUID();
  const now = new Date();

  const user: User = {
    id,
    email: email.toLowerCase().trim(),
    passwordHash,
    role,
    createdAt: now,
    updatedAt: now,
  };

  users.set(id, user);
  return user;
}

/** 通过邮箱查找用户 */
export async function findUserByEmail(email: string): Promise<User | null> {
  const normalizedEmail = email.toLowerCase().trim();
  for (const user of users.values()) {
    if (user.email === normalizedEmail) {
      return user;
    }
  }
  return null;
}

/** 通过 ID 查找用户 */
export async function findUserById(id: string): Promise<User | null> {
  return users.get(id) ?? null;
}

/** 更新用户密码 */
export async function updateUserPassword(
  userId: string,
  newPasswordHash: string
): Promise<boolean> {
  const user = users.get(userId);
  if (!user) return false;

  user.passwordHash = newPasswordHash;
  user.updatedAt = new Date();
  return true;
}

/** 仅用于测试：清空所有用户 */
export function clearUsers(): void {
  users.clear();
}
