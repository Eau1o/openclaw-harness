/**
 * 认证运行时层 - 中间件和路由处理
 */

import type { Request, Response, NextFunction } from 'express';
import type { AuthTokenPayload } from '../types/auth.js';
import { validateToken } from '../service/auth.js';

/** 扩展 Express Request 类型 */
declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

/** 认证中间件 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: '缺少认证令牌' });
      return;
    }

    const token = authHeader.substring(7);
    const payload = await validateToken(token);

    req.user = payload;
    next();
  } catch (error) {
    const errorCode = (error as Error & { code?: string }).code;
    const statusCode = errorCode === 'TOKEN_EXPIRED' ? 401 : 403;
    const message = errorCode === 'TOKEN_EXPIRED' ? '令牌已过期' : '无效的令牌';
    res.status(statusCode).json({ error: message, code: errorCode });
  }
}

/** 可选认证中间件（不强制要求登录） */
export async function optionalAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = await validateToken(token);
      req.user = payload;
    }

    next();
  } catch {
    // 忽略错误，继续执行
    next();
  }
}

/** 角色检查中间件工厂 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: '未认证' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: '权限不足' });
      return;
    }

    next();
  };
}

/** 登录路由处理 */
export async function loginHandler(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: '缺少邮箱或密码' });
      return;
    }

    const { login } = await import('../service/auth.js');
    const result = await login({ email, password });

    res.json(result);
  } catch (error) {
    const errorCode = (error as Error & { code?: string }).code;
    if (errorCode === 'INVALID_CREDENTIALS') {
      res.status(401).json({ error: '邮箱或密码错误' });
    } else {
      res.status(500).json({ error: '登录失败' });
    }
  }
}

/** 注册路由处理 */
export async function registerHandler(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: '缺少邮箱或密码' });
      return;
    }

    const { register } = await import('../service/auth.js');
    const result = await register({ email, password });

    res.status(201).json(result);
  } catch (error) {
    const errorCode = (error as Error & { code?: string }).code;
    if (errorCode === 'EMAIL_EXISTS') {
      res.status(409).json({ error: '该邮箱已注册' });
    } else if (errorCode === 'WEAK_PASSWORD') {
      res.status(400).json({ error: '密码强度不足' });
    } else {
      res.status(500).json({ error: '注册失败' });
    }
  }
}

/** Token 刷新路由处理 */
export async function refreshTokenHandler(req: Request, res: Response): Promise<void> {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: '缺少刷新令牌' });
      return;
    }

    const { refreshToken: refresh } = await import('../service/auth.js');
    const tokens = await refresh(refreshToken);

    res.json(tokens);
  } catch (error) {
    const errorCode = (error as Error & { code?: string }).code;
    if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'INVALID_TOKEN') {
      res.status(401).json({ error: '无效的刷新令牌' });
    } else {
      res.status(500).json({ error: '刷新失败' });
    }
  }
}

/** 获取当前用户信息 */
export async function meHandler(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: '未认证' });
    return;
  }

  res.json({
    userId: req.user.userId,
    email: req.user.email,
    role: req.user.role,
  });
}
