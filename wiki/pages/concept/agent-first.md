---
title: "Agent-First Engineering"
tags:
  - "agent"
  - "engineering-velocity"
  - "codex"
relatedSources:
  - "source/openai-harness-engineering"
---

# Agent-First Engineering

一种软件开发范式：**人类负责设计环境、指定意图、建立反馈循环；Agent 负责执行所有代码编写任务。**

## 核心原则

1. **零人工编写代码** — 所有代码、测试、CI、文档、工具均由 Agent 生成
2. **人类在更高抽象层工作** — 优先级、验收标准、结果验证
3. **环境优先于模型** — 为 Agent 构建能干活的环境比选择更强模型更重要

## 关键实践

| 实践 | 说明 |
|------|------|
| [[concept/knowledge-base]] | 仓库本地的结构化文档，Agent 的知识来源 |
| [[concept/golden-principles]] | 将人类品味编码为机械规则 |
| 环境深度优先 | 把应用 UI、日志、指标暴露给 Agent 直接读取 |

## 与 OpenClaw 的关系

OpenClaw 的 [[concept/agent-loop]] 和 [[concept/agent-workspace]] 设计体现了 Agent-First 思想：Agent 在受控环境中执行，人在更高层抽象做决策。

> 来源: [[source/openai-harness-engineering]]
