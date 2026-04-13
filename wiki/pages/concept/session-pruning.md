---
title: Session Pruning
tags: [openclaw, concept]
created: 2026-04-13
updated: 2026-04-13
sourcePaths: [wiki/sources/github/openclaw/docs/concepts/session-pruning.md]
---

# Session Pruning

## 定义
Session pruning 在每次 LLM 调用前从上下文中修剪旧的工具结果以减少上下文膨胀。它仅在内存中操作，不会修改磁盘上的会话记录。

## 核心要点
- **目的**：减少累积工具输出（exec 结果、文件读取、搜索结果）导致的上下文窗口膨胀；降低成本并延迟 compaction
- **Anthropic prompt caching**：修剪在 TTL 过期后减少缓存写入大小，直接降低成本
- **工作原理**：等待缓存 TTL（默认 5 分钟）→ 找到旧的工具结果 → 软修剪过大的（保留 head+tail + `...`）→ 硬清除其余 → 重置 TTL
- **遗留图像清理**：逐字节保留 3 个最近的完成轮次；较旧的图像块替换为 `[image data removed]`
- **智能默认**：为 Anthropic OAuth/token auth（1小时心跳）和 API key（30 分钟心跳）自动启用

## 相关概念
- [[concept/session]]
- [[concept/context]]
- [[concept/compaction]]

## 关联实体
