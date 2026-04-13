# 系统架构

## 分层依赖（严格单向）

```
Types → Config → Repo → Service → Runtime → UI
```

| 层级 | 职责 | 目录 |
|------|------|------|
| Types | 类型定义、接口契约、数据模型 | src/types |
| Config | 配置读取、环境变量、默认值 | src/config |
| Repo | 数据访问、外部API、持久化 | src/repo |
| Service | 业务逻辑、流程编排 | src/service |
| Runtime | 运行时编排、Agent生命周期 | src/runtime |

### 依赖规则
- 每层只能依赖其下层
- 跨层调用通过接口抽象
- 横切关注点（认证、日志、遥测）只能通过 Providers 接口访问

## 核心模块

### Types (src/types)
- 定义所有数据结构和接口
- 与业务无关，纯类型定义
- 被所有上层引用

### Config (src/config)
- 环境变量读取
- 配置文件解析
- 提供类型安全的配置访问

### Repo (src/repo)
- 外部数据源访问
- API 调用封装
- 缓存策略实现

### Service (src/service)
- 业务逻辑实现
- 流程编排
- 多 Repo 组合

### Runtime (src/runtime)
- Agent 生命周期管理
- 任务调度
- 状态管理

## 横切关注点

认证、日志、遥测只能通过 Providers 接口访问，禁止硬编码。

## 技术边界

- 不引入重量级 ORM
- 优先使用文件系统作为存储
- 记忆系统基于 Markdown 文件
