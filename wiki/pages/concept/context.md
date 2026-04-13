---
title: Context
tags: [openclaw, concept]
created: 2026-04-13
updated: 2026-04-13
sourcePaths: [wiki/sources/github/openclaw/docs/concepts/context.md]
---

# Context

## 定义
"Context"是 OpenClaw 给模型运行发送的所有内容——受模型的上下文窗口（Token 限制）约束。它由 System prompt、会话历史和工具调用/结果 + 附件组成。

## 核心要点
- **System prompt**（OpenClaw 构建）：规则、工具、技能列表、时间/运行时、注入的 workspace 文件
- **对话历史**：当前会话中的消息
- **工具调用/结果 + 附件**：命令输出、文件读取、图像/音频
- **Memory vs Context**：memory 存储在磁盘上，以后重新加载；context 是当前窗口中的内容
- **检查命令**：`/status`（快速窗口满度）、`/context list`（注入 + 大小）、`/context detail`（深度分解）、`/usage tokens`、`/compact`
- **Slash 命令**：见 `/tools/slash-commands`、`/reference/token-use`、`/concepts/compaction`

## 相关概念
- [[concept/system-prompt]]
- [[concept/session-pruning]]
- [[concept/memory]]

## 关联实体
