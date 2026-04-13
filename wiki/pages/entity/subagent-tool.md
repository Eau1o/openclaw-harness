---
title: Subagent Tool
type: entity
tags: [openclaw, entity, tool]
created: 2026-04-13
updated: 2026-04-13
sourcePaths: [wiki/sources/github/openclaw/docs/tools/subagents.md]
---

# Subagent Tool

## 简介
Sub-agent 是从现有 Agent 运行中派生的后台 Agent 运行。它们在自己的会话中运行（`agent:<agentId>:subagent:<uuid>`），并将结果汇报给请求者的聊天频道。

## 主要功能/特性
- 在自己会话中运行的后台 agent（`agent:<agentId>:subagent:<uuid>`）
- 结果汇报给请求者聊天
- 作为后台任务跟踪
- `/subagents` slash 命令用于检查和控制
- 线程绑定控制，用于支持持久线程的频道

## 主要命令
- `/subagents list` — list active sub-agents
- `/subagents kill <id|#|all>` — kill sub-agent
- `/subagents log <id|#>` — view logs
- `/subagents info <id|#>` — run metadata
- `/subagents send <id|#> <msg>` — send message
- `/subagents steer <id|#> <msg>` — steer sub-agent
- `/subagents spawn <agentId> <task>` — spawn new sub-agent

## 相关概念
- [[concept/tools]]
- [[concept/multi-agent]]

## 相关实体
- [[entity/exec-tool]]
- [[entity/browser-tool]]
