---
title: Gateway
tags: [openclaw, concept]
created: 2026-04-13
updated: 2026-04-13
sourcePaths: [wiki/sources/github/openclaw/docs/gateway/index.md]
---

# Gateway

## 定义
Gateway 是 OpenClaw 的常驻服务，负责路由、控制平面和 Channel 连接。它作为单一多路复用进程运行，提供 WebSocket 控制/RPC、HTTP API（包括 OpenAI 兼容端点）和 Control UI。

## 核心要点
- **单一进程**：用于路由、控制平面和所有频道连接
- **多路复用端口** 提供：WebSocket 控制/RPC、OpenAI 兼容 HTTP API（`/v1/models`、`/v1/chat/completions`、`/v1/embeddings`、`/v1/responses`、`/tools/invoke`）和控制 UI/hooks
- **默认绑定模式**：`loopback`；默认需要认证（通过 `gateway.auth.token`/`gateway.auth.password` 的共享密钥）
- **配置重载**：监视活动配置文件路径；默认使用 `hybrid` 重载模式
- **健康检查**：`openclaw gateway status` → `Runtime: running` + `RPC probe: ok`
- **频道探测**：`openclaw channels status --probe` 对每个账户运行实时探测

## 相关概念
- [[concept/agent]]
- [[concept/session]]
- [[concept/channels]]
- [[concept/plugins]]

## 关联实体
- [[entity/gateway]]
