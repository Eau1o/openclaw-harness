---
title: Agent Runtime
tags: [openclaw, concept]
created: 2026-04-13
updated: 2026-04-13
sourcePaths: [wiki/sources/github/openclaw/docs/concepts/agent.md]
---

# Agent Runtime

## 定义
OpenClaw 运行一个基于 Pi agent core 构建的单一嵌入式 Agent 运行时，提供模型、工具和 prompt 管道。会话管理、发现、工具接线和 Channel 交付是 OpenClaw 在该核心之上自有的层次。

## 核心要点
- **Workspace**：OpenClaw 使用单一 agent workspace 目录作为 agent 的唯一工作目录（`cwd`），用于工具和上下文
- **Bootstrap 文件**：首次轮次注入：`AGENTS.md`、`SOUL.md`、`TOOLS.md`、`BOOTSTRAP.md`、`IDENTITY.md`、`USER.md`
- **内置工具**（read/exec/edit/write 等）根据工具策略始终可用
- **Skills** 从 workspace、project、personal、managed/local 和捆绑位置加载
- 运行时基于 Pi agent core 构建；OpenClaw 拥有会话管理、发现和频道交付

## 相关概念
- [[concept/session]]
- [[concept/memory]]
- [[concept/tools]]
- [[concept/skills]]
- [[concept/gateway]]

## 关联实体
- [[entity/gateway]]
