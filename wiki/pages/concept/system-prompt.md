---
title: System Prompt
tags: [openclaw, concept]
created: 2026-04-13
updated: 2026-04-13
sourcePaths: [wiki/sources/github/openclaw/docs/concepts/system-prompt.md]
---

# System Prompt

## 定义
OpenClaw 为每次 Agent 运行构建自定义 System prompt。该 prompt 由 OpenClaw 自有，不使用 pi-coding-agent 默认 prompt。Provider 插件可以通过稳定前缀和动态后缀贡献缓存感知的 prompt 指导。

## 核心要点
- **OpenClaw 自有**：prompt 结构有意紧凑，有固定部分
- **Provider 贡献**：可以替换命名的核心部分（`interaction_style`、`tool_call_style`、`execution_bias`）、注入稳定前缀（高于缓存边界）或动态后缀（低于缓存边界）
- **Prompt 部分**：工具、安全、Skills、OpenClaw 自我更新、Workspace、文档、Workspace 文件（注入）、沙箱、当前日期和时间、回复标签、心跳、运行时、推理
- **Self-Update 部分**：仅在明确用户请求时引导使用 `config.schema.lookup`、`config.patch`、`config.apply` 和 `update.run`；`gateway` 工具拒绝重写 `tools.exec.ask`/`tools.exec.security`
- **长期工作指导**：使用 cron 而非 exec sleep 循环；依赖 push-based completion wake；使用 `process` 获取日志/状态/干预

## 相关概念
- [[concept/context]]
- [[concept/agent]]

## 关联实体
