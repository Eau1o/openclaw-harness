---
title: Agent Workspace
tags: [openclaw, concept]
created: 2026-04-13
updated: 2026-04-13
sourcePaths: [wiki/sources/github/openclaw/docs/concepts/agent-workspace.md]
---

# Agent Workspace

## 定义
Workspace 是 Agent 的家——唯一用于文件工具和 workspace 上下文的 工作目录。它与 `~/.openclaw/` 分开，后者存储配置、凭据和会话。

## 核心要点
- **默认位置**：`~/.openclaw/workspace`；基于配置：`~/.openclaw/workspace-<profile>`
- **不是硬沙箱**：相对路径相对于 workspace 解析，但绝对路径可以到达其他位置（除非启用沙箱）
- **沙箱模式**：当 `agents.defaults.sandbox` 启用且 `workspaceAccess` 不是 `"rw"` 时，工具在 `~/.openclaw/sandboxes` 下的沙箱 workspace 内操作
- **设置**：`openclaw onboard`、`openclaw configure` 或 `openclaw setup` 创建 workspace 和 bootstrap 文件
- **Bootstrap 文件**：`AGENTS.md`、`SOUL.md`、`TOOLS.md`、`BOOTSTRAP.md`、`IDENTITY.md`、`USER.md`
- **保持私密**：将 workspace 视为记忆；它包含 agent 指令和个人上下文

## 相关概念
- [[concept/agent]]
- [[concept/memory]]

## 关联实体
