---
title: Retry Policy
tags: [openclaw, concept]
created: 2026-04-13
updated: 2026-04-13
sourcePaths: [wiki/sources/github/openclaw/docs/concepts/retry.md]
---

# Retry Policy

## 定义
OpenClaw 对每个 HTTP 请求实施重试策略（而非每个多步骤流程），通过仅重试当前步骤来保持顺序，并避免非幂等操作的重复。

## 核心要点
- **默认设置**：3 次尝试，最大延迟上限 30000 ms，jitter 0.1（10%）
- **Provider 默认值**：Telegram 最小延迟 400 ms，Discord 最小延迟 500 ms
- **Discord**：仅在 HTTP 429（rate-limit）时重试；当可用时使用 Discord `retry_after`，否则指数退避
- **Telegram**：在临时错误时重试（429、timeout、connect/reset/closed、暂时不可用）；当可用时使用 `retry_after`；Markdown 解析错误回退到纯文本（不重试）
- **非幂等**：避免重复非幂等操作

## 相关概念
- [[concept/model-failover]]
- [[concept/channels]]

## 关联实体
- [[entity/discord]]
- [[entity/telegram]]
