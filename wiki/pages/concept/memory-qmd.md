---
title: QMD Memory Engine
tags: [openclaw, concept]
created: 2026-04-13
updated: 2026-04-13
sourcePaths: [wiki/sources/github/openclaw/docs/concepts/memory-qmd.md]
---

# QMD Memory Engine

## 定义
QMD（Quantum Memory Database）是一个本地优先的搜索辅助进程，与 OpenClaw 协同运行。它在一个二进制文件中结合了 BM25、向量搜索和重排序，并能索引 workspace 记忆文件之外的内容。

## 核心要点
- **重排序和查询扩展**以获得更好的召回
- **索引额外目录**：项目文档、团队笔记、磁盘上的任何内容
- **索引会话记录**：召回早期对话
- **完全本地**：通过 Bun + node-llama-cpp 运行，自动下载 GGUF 模型
- **自动回退**：如果 QMD 不可用，无缝回退到 builtin engine
- **前提条件**：QMD npm 包、带扩展支持的 SQLite、QMD 在 gateway 的 PATH 上；macOS/Linux；Windows 通过 WSL2

## 相关概念
- [[concept/memory]]
- [[concept/memory-builtin]]

## 关联实体
