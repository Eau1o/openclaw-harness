---
title: Active Memory
tags: [openclaw, concept]
created: 2026-04-13
updated: 2026-04-13
sourcePaths: [wiki/sources/github/openclaw/docs/concepts/active-memory.md]
---

# Active Memory

## 定义
Active memory 是一个可选的、由插件管理的阻塞式 memory sub-agent，在符合条件的会话中主回复生成之前运行。它在主回复生成之前将相关记忆呈现出来，使系统更少被动响应、更多主动出击。

## 核心要点
- **主动召回**：在主回复生成之前呈现相关记忆（与被动系统不同，后者等待"记住这个"或显式搜索）
- **插件所有**：由 active-memory 插件管理
- **配置选项**：`enabled`、`agents`（如 `["main"]`）、`allowedChatTypes`（如 `["direct"]`）、`modelFallback`、`queryMode`、`promptStyle`
- **一次有限机会**：在符合条件的会话的主回复前运行一次

## 相关概念
- [[concept/memory]]
- [[concept/agent-loop]]

## 关联实体
