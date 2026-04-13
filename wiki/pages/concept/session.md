---
title: Session Management
tags: [openclaw, concept]
created: 2026-04-13
updated: 2026-04-13
sourcePaths: [wiki/sources/github/openclaw/docs/concepts/session.md]
---

# Session Management

## 定义
OpenClaw 将对话组织成会话。每条消息根据其来源（DM、群聊、cron 任务、Webhook 等）被路由到对应的会话。

## 核心要点
- **DM 隔离**：默认所有 DM 共享一个会话；`session.dmScope` 选项：`main`（默认）、`per-peer`、`per-channel-peer`、`per-account-channel-peer`
- **群聊**：默认按群组隔离
- **Cron 作业**：每次运行全新会话
- **Webhook**：按钩子隔离
- **Multi-agent**：每个 agent 有自己的 workspace、`agentDir` 和会话存储在 `~/.openclaw/agents/<agentId>/sessions`
- **身份链接**：`session.identityLinks` 可以链接一个人跨频道的身份以共享一个会话

## 相关概念
- [[concept/agent]]
- [[concept/session-pruning]]
- [[concept/context]]

## 关联实体
