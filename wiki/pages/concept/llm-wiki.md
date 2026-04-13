---
title: LLM Wiki
tags: [concept, methodology, knowledge-base, pattern]
created: 2026-04-13
updated: 2026-04-13
related: [knowledge-base, rag, obsidian]
---

# LLM Wiki

## 定义

LLM Wiki 是一种利用 LLM 构建和管理个人知识库的方法论模式。其核心思想是让 LLM **增量构建和维护一个持久的 wiki**——一个结构化的、相互链接的 Markdown 文件集合，介于用户和原始来源之间。

## 核心要点

- **持久累积**：知识只编译一次，然后保持最新，不需要每次查询时重新派生
- **结构化**：交叉引用已存在，矛盾已标记，综合分析反映所有读过的内容
- **自动化维护**：LLM 负责总结、交叉引用、归档、记账工作，人类不需做繁琐维护

## 与 RAG 的区别

| 方面 | RAG | LLM Wiki |
|------|-----|----------|
| 查询时 | 从原始文档检索相关片段 | 从已维护的 wiki 页面读取 |
| 知识积累 | 每次问题重新发现知识 | 知识持续累积和整合 |
| 矛盾处理 | 实时比对（可能遗漏） | 已标记，可追踪 |
| 多文档综合 | 每次重新拼凑 | 已综合，随时可用 |

> [!conflict]
> RAG 是"检索后再生成"，LLM Wiki 是"先编译再查询"——前者重查找，后者重积累。

## 三层架构

| 层级 | 说明 |
|------|------|
| **Raw sources** | 原始资料（文章、论文、书籍），不可变，LLM 只读 |
| **The wiki** | LLM 生成和维护的结构化页面（entity、concept、source、synthesis） |
| **The schema** | 规范文档（如 AGENTS.md），定义 wiki 结构和工作流程 |

## 核心操作

### Ingest — 摄入
将新来源添加到 wiki：读取 → 写摘要页 → 更新索引 → 更新相关 entity/concept → 追加日志。一个来源可能涉及 10-15 个页面。

### Query — 查询
从 wiki 读取相关页面 → 综合回答 → 引用来源。好的答案可以写回 wiki 作为新的 synthesis 页面。

### Lint — 体检
定期检查：矛盾内容、陈旧声明、孤儿页面、缺失概念、交叉引用、数据空白。

## 适用场景

- **个人**：目标、健康、心理、自我提升跟踪
- **研究**：深入一个主题数周/数月，构建综合 wiki
- **读书**：章节归档，构建角色、主题、情节的伴侣 wiki
- **团队**：LLM 维护的内部 wiki，来源包括 Slack、会议、文档
- **竞品分析、尽职调查、旅行计划、课程笔记**

## 为什么有效

维护知识库的繁琐在于 **bookkeeping**：更新交叉引用、保持摘要最新、标记矛盾、维护一致性。人类因负担增长快于价值而放弃 wiki。LLM 不会厌倦、不会忘记、一可以次修改多个文件。

## 关联

- [[concept/knowledge-base]] — 知识库概念
- [[concept/rag]] — 对比：RAG 模式
- [[entity/obsidian]] — 推荐工具：本地笔记 + 图谱视图

## 来源

- [[source/articles/llm-wiki]] — LLM Wiki 原版文档