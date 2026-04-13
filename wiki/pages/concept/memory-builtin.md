---
title: Builtin Memory Engine
tags: [openclaw, concept]
created: 2026-04-13
updated: 2026-04-13
sourcePaths: [wiki/sources/github/openclaw/docs/concepts/memory-builtin.md]
---

# Builtin Memory Engine

## 定义
Builtin engine 是 OpenClaw 的默认记忆后端。它将记忆索引存储在每个 Agent 的 SQLite 数据库中，无需额外依赖。它提供关键词、向量和混合搜索。

## 核心要点
- **关键词搜索**：FTS5 全文索引，使用 BM25 评分
- **向量搜索**：通过任何支持的 provider 的 embeddings（自动检测：OpenAI、Gemini、Voyage、Mistral）
- **混合搜索**：结合关键词 + 向量以获得最佳结果
- **CJK 支持**：中文、日文、韩文的三元组分词
- **sqlite-vec 加速**：可选的数据库内向量查询
- **无需配置**：自动检测来自 API 密钥的 embedding provider

## 相关概念
- [[concept/memory]]
- [[concept/memory-qmd]]

## 关联实体
