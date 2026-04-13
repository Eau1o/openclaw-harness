---
title: Agent Loop
tags: [openclaw, concept]
created: 2026-04-13
updated: 2026-04-13
sourcePaths: [wiki/sources/github/openclaw/docs/concepts/agent-loop.md]
---

# Agent Loop

## 定义
Agent loop 是核心推理循环，Agent 在其中接收 prompt、生成工具调用或文本、接收结果，并持续运行直到达到停止条件。

## 核心要点
- 基于 Pi agent core 构建（模型、工具、prompt 管道）
- 接收上下文（系统 prompt + 对话历史 + 工具结果）
- 在每轮生成工具调用或文本回复
- 工具结果反馈到下一轮的上下文
- 停止条件：最终文本响应、max turns、错误

## 相关概念
- [[concept/agent]]
- [[concept/context]]
- [[concept/tools]]

## 关联实体
