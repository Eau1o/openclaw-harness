# 执行计划：添加用户认证功能

## 目标
实现完整的用户认证系统，支持注册、登录、Token 刷新。

## 分层实现顺序（严格遵循依赖方向）

### 1. Types 层 ✅ 已完成
**文件**: `src/types/auth.ts`
- [x] 定义 `User` 类型
- [x] 定义 `AuthToken` 类型
- [x] 定义 `LoginRequest` / `RegisterRequest` 类型
- [x] 定义认证相关错误类型

### 2. Config 层 ✅ 已完成
**文件**: `src/config/auth.ts`
- [x] JWT 密钥配置
- [x] Token 过期时间配置
- [x] 密码哈希强度配置

### 3. Repo 层 ✅ 已完成
**文件**: `src/repo/user.ts`
- [x] 用户表 Schema 定义
- [x] `createUser()` - 创建用户
- [x] `findUserByEmail()` - 邮箱查找
- [x] `findUserById()` - ID 查找

### 4. Service 层 ✅ 已完成
**文件**: `src/service/auth.ts`
- [x] `register()` - 注册逻辑（密码哈希）
- [x] `login()` - 登录验证
- [x] `refreshToken()` - Token 刷新
- [x] `validateToken()` - Token 校验

### 5. Runtime 层 ✅ 已完成
**文件**: `src/runtime/auth.ts`
- [x] 认证中间件
- [x] 登录/注册路由处理
- [x] Token 刷新路由处理

## 依赖检查
- [x] Types 无依赖
- [x] Config 依赖 Types（单向）
- [x] Repo 依赖 Types、Config
- [x] Service 依赖 Types、Config、Repo
- [x] Runtime 依赖 Types、Config、Repo、Service

## 依赖安装

```bash
npm install bcrypt jsonwebtoken
npm install -D @types/bcrypt @types/jsonwebtoken @types/express
```

## 环境变量

```bash
# JWT 密钥（生产环境必须设置强密钥）
JWT_SECRET=your-secret-key-min-32-chars-long
JWT_REFRESH_SECRET=your-refresh-secret-different-from-above

# Token 过期时间（秒，可选，有默认值）
JWT_ACCESS_EXPIRY=900      # 15 分钟
JWT_REFRESH_EXPIRY=604800  # 7 天

# 密码哈希强度（可选，默认 12）
BCRYPT_ROUNDS=12
```

## 技术债务
- TD-002: Token 刷新机制已基础实现，需补充刷新令牌轮换策略

## 进度
- 状态: ✅ 已完成
- 当前步骤: 完成
- 创建时间: 2026-04-10
- 最后更新: 2026-04-10
