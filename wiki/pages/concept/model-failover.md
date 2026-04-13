---
title: Model Failover
tags: [openclaw, concept]
created: 2026-04-13
updated: 2026-04-13
sourcePaths: [wiki/sources/github/openclaw/docs/concepts/model-failover.md]
---

# Model Failover

## 定义
OpenClaw 以两个阶段处理提供商/模型故障：首先在当前提供商内轮转认证配置文件，然后回退到 `agents.defaults.model.fallbacks` 中的下一个模型。

## 核心要点
- **阶段 1**：在当前 provider 内轮转认证配置文件
- **阶段 2**：回退到配置中下一个模型
- **候选链顺序**：活跃会话模型 → 配置的 `agents.defaults.model.fallbacks` → 配置的主要模型
- **回退持久化**：选择的回退覆盖在重试前持久化，以便其他会话读取者看到相同的 provider/model
- **回滚**：如果回退候选失败，仅在字段仍与失败候选匹配时回滚回退拥有的会话覆盖字段
- **冷却探测**：探测失败 provider 的文档化运行时行为

## 相关概念
- [[concept/model-providers]]
- [[concept/session]]

## 关联实体
