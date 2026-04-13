---
title: "Codex"
entityType: "platform"
tags:
  - "openai"
  - "agent"
  - "code-generation"
relatedSources:
  - "source/openai-harness-engineering"
---

# Codex

OpenAI 开发的 AI 软件工程 Agent，核心执行者。

## 关键能力

- 端到端驱动新功能（验证 → 重现 bug → 修复 → PR → 合并）
- 使用标准开发工具（gh, local scripts, repository-embedded skills）
- 支持 Chrome DevTools Protocol，可驱动浏览器、录制视频
- 可查询日志（LogQL）和指标（PromQL）

## 在 OpenClaw 中的对应

Codex 是 OpenAI 的 Harness Engineering 实践主体。其"人类掌舵、Agent 执行"模式与 [[concept/agent-first]] 完全一致。

> 来源: [[source/openai-harness-engineering]]
