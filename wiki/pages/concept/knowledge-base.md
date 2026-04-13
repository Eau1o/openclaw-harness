---
title: Knowledge Base
tags: [concept, knowledge-management, information-retrieval]
created: 2026-04-13
updated: 2026-04-13
related: [llm-wiki, rag, memory]
---

# Knowledge Base

## 定义

知识库是一个结构化的信息集合，用于存储、检索和管理知识。与简单的文档存储不同，知识库强调**知识之间的关联和可查询性**。

## 知识库的类型

| 类型 | 说明 | 示例 |
|------|------|------|
| **文档型** | 以文档为核心，检索时找到整个文档 | 传统 RAG |
| **结构化** | 以实体和关系为核心，形成知识图谱 | 知识图谱 |
| **混合** | 结合文档检索和结构化知识 | LLM Wiki |

## 与 LLM Wiki 的关系

LLM Wiki 是一种**混合型知识库**实现：
- 从 Raw sources 提取知识
- 构建 entity/concept 结构化页面
- 通过 wikilink 建立关联
- LLM 持续维护和更新

## 关联

- [[concept/llm-wiki]] — LLM Wiki 模式
- [[concept/rag]] — RAG 模式（对比）
- [[concept/memory]] — 记忆系统