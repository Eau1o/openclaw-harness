---
title: Memory System
tags: [openclaw, concept]
created: 2026-04-13
updated: 2026-04-13
sourcePaths: [wiki/sources/github/openclaw/docs/concepts/memory.md]
---

# Memory System

## 定义
OpenClaw 通过在 Agent 的 workspace 中写入纯 Markdown 文件来记忆。模型只"记住"保存到磁盘的内容——没有隐藏状态。

## 核心要点
- **`MEMORY.md`**：长期记忆，持久的事实/偏好/决策；在每个 DM 会话开始时加载
- **`memory/YYYY-MM-DD.md`**：每日笔记；今天和昨天的笔记自动加载
- **`DREAMS.md`**（实验性）：Dream Diary 和 dreaming sweep summaries，用于人类审查
- **Memory 工具**：`memory_search`（语义搜索）、`memory_get`（读取特定文件/行范围）
- **Memory Wiki 插件**：可选的 `memory-wiki` 插件添加确定性页面结构、矛盾跟踪和 wiki 原生工具（`wiki_search`、`wiki_get`、`wiki_apply`、`wiki_lint`）
- **混合搜索**：当配置了 embedding provider 时，结合向量相似度 + 关键词匹配；自动检测 OpenAI、Gemini、Voyage 或 Mistral 密钥

## 相关概念
- [[concept/context]]
- [[concept/agent]]
- [[concept/memory-builtin]]
- [[concept/memory-qmd]]

## 关联实体
