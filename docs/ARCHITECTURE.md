
# 系统架构

## 分层依赖（严格单向）

Types → Config → Repo → Service → Runtime → UI

- Types: 类型定义
- Config: 配置读取
- Repo: 数据访问
- Service: 业务逻辑
- Runtime: 运行时编排
- UI: 界面层

## 横切关注点

认证、日志、遥测只能通过 Providers 接口访问。