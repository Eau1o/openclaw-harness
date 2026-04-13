---
title: Exec Tool
type: entity
tags: [openclaw, entity, tool]
created: 2026-04-13
updated: 2026-04-13
sourcePaths: [wiki/sources/github/openclaw/docs/tools/exec.md]
---

# Exec Tool

## 简介
`exec` 工具在工作区中执行 Shell 命令，支持前台和后台执行（通过 `process`）。后台会话按 Agent 隔离。

## 主要功能/特性
- Shell 命令执行，支持前台/后台执行
- `process` 工具用于管理后台会话
- `yieldMs`（默认 10000）：延迟后自动转入后台
- `timeout`（默认 1800s）：到期后终止
- `pty` 模式：TTY 所需 CLI 的伪终端
- `host` 路由：`auto | sandbox | gateway | node`
- `security`：`deny | allowlist | full` 强制模式
- `ask`：对 `gateway`/`node` 的审批提示
- `elevated`：通过配置的 host 路径逃离沙箱
- 审批由 `~/.openclaw/exec-approvals.json` 控制

## 配置方式
- 默认 host：`auto`（活跃时为 sandbox，否则为 gateway）
- `gateway`/`node` 审批通过 `~/.openclaw/exec-approvals.json`
- `node` 需要配对的 companion 应用或无头 node host

## 相关概念
- [[concept/tools]]
- [[concept/agent-workspace]]

## 相关实体
- [[entity/browser-tool]]
- [[entity/subagent-tool]]
