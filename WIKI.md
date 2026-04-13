# WIKI.md — 本地 Wiki 知识库维护规范

> 本文件是 LLM Wiki 模式在 OpenClaw 中的落地实现。
> 核心原则：LLM 作为"程序员"负责所有维护工作，人类作为"产品经理"负责提问和审核。

---

## 架构概览

```
wiki/
├── sources/              # 原始来源
│   ├── github/           # Git 仓库（直接 clone 的仓库）
│   │   └── {name}/       # 直接从 git 仓库读取，不复制文件
│   ├── books/            # 书籍 .md 文件（非 git）
│   ├── articles/         # 文章 .md 文件（非 git）
│   └── papers/           # 论文 .md 文件（非 git）
├── pages/                # LLM 生成的 wiki 页面
│   ├── entity/           # 实体页（人物/地点/工具/产品）
│   ├── concept/          # 概念页（主题/方法论/理论）
│   ├── source/           # 来源摘要页（按来源分组）
│   │   ├── github-openclaw/   # GitHub 仓库（从 git 实时 ingest）
│   │   ├── books/              # 书籍来源
│   │   ├── articles/           # 文章来源
│   │   └── papers/            # 论文来源
│   ├── synthesis/        # 综合分析页
│   └── _index.md         # wiki 索引（自动生成）
├── .schema.md             # 本 wiki 的详细规范
├── .sync-state.json       # Git 仓库同步状态
└── log.md                 # 操作日志
```

---

## 三层职责

| 层级 | 位置 | 负责人 | 说明 |
|------|------|--------|------|
| Raw sources | `wiki/sources/` | 人类 | 不可变，来源凭证 |
| Wiki pages | `wiki/pages/` | LLM | 全权维护，跨引用 |
| Schema | `WIKI.md` + `wiki/.schema.md` | 人类+LLM 共演化 | 规范约定 |

---

## 页面类型规范

### entity/ — 实体页
- 命名：` kebab-case`（如 `openai-gpt-4.md`）
- 包含：定义、属性、关联实体、最新动态
- frontmatter：`tags`, `created`, `updated`, `aliases`

### concept/ — 概念页
- 命名：简洁标题（如 `retrieval-augmented-generation.md`）
- 包含：定义、核心要点、相关概念、常见误解
- frontmatter：`tags`, `created`, `updated`, `related`

### source/ — 来源摘要页
- **按来源分组子目录**，避免文件名冲突
- 命名规范：`{source-type}/{original-filename}`
  - GitHub 仓库：`github-{owner}-{repo}/{slug}`（如 `github-openclaw/AGENTS`）
  - 文章：`articles/{source}-{slug}`
  - 论文：`papers/{title-slug}`
  - 书籍：`books/{title-slug}`
- 包含：来源信息、关键摘录、主要观点、我的评注
- frontmatter：`tags`, `sourcePath`, `ingestDate`, `type`

### synthesis/ — 综合分析页
- 命名：描述性标题（如 `comparison-llm-context-windows.md`）
- 包含：分析结论、对比表格、可行动建议
- frontmatter：`tags`, `created`, `updated`, `derivedFrom`

---

## 核心工作流

### Ingest — 摄入新来源

```
1. 接收 source 文件路径或 URL
2. 读取 source 内容
3. 识别关键实体和概念
4. 创建/更新 source/ 页面
5. 更新相关 entity/ 和 concept/ 页面
6. 更新 _index.md
7. 追加 log.md 记录
8. 报告：新增/修改了哪些页面，潜在矛盾点
```

### Query — 查询知识库

```
1. 读取 _index.md 定位相关页面
2. 读取相关 page 内容
3. 综合回答，附带 [[wikilink]] 引用
4. 如果回答有价值，问用户是否写回 wiki 作为 synthesis/ 页面
```

### Lint — 体检（建议每周一次）

```
1. 扫描所有 pages/ 页面
2. 检测：矛盾内容、孤儿页面、断链、过期信息
3. 检测：存在引用但无专属页面的概念
4. 输出：问题清单 + 修复建议
5. 在用户确认后执行修复
```

---

## 文件格式规范

### frontmatter 示例

```yaml
---
title: OpenAI GPT-4
tags: [llm, openai, gpt-series, foundation-model]
aliases: [gpt4, GPT-4]
created: 2026-04-01
updated: 2026-04-13
sources: [wiki/sources/articles/openai-gpt4-paper.md]
---

# OpenAI GPT-4

## 基本信息
- 发布日期：2023-03-14
- 参数量：~1.76T（未公开，推测）
-上下文窗口：128k tokens

## 核心能力
- [[concept/chain-of-thought]] 推理
- [[concept/retrieval-augmented-generation]] 支持

## 与旧版本对比
> [!conflict]
> GPT-4 的多模态能力在 GPT-3.5 中完全不存在（2026-04-13 确认）

## 关联
- [[entity/openai]] — 开发商
- [[concept/large-language-model]] — 所属类别
```

### wikilink 格式
- 页面内链接：`[[entity/openai-gpt-4]]`
- 同一目录下：`[[./another-page]]`
- 跨目录：`[[concept/large-language-model]]`

### index.md 格式

```markdown
# Wiki Index

*最后更新：YYYY-MM-DD*

## Concepts（概念）

> [!info]
> 共创建 **X** 个概念页面。

| 页面 | 说明 |
|------|------|
| [[concept/xxx]] | 概念说明 |

## Entities（实体）

> [!info]
> 共创建 **X** 个实体页面。

### 分类1

| 页面 | 说明 |
|------|------|
| [[entity/xxx]] | 实体说明 |

## Synthesis（综合）

> [!info]
> 用户探索的累积 — 有价值的分析、对比、结论可写回 wiki。

| 页面 | 说明 |
|------|------|
| [[synthesis/xxx]] | 分析/对比/结论 |

---
*最后更新：YYYY-MM-DD*
```

> [!note]
> Sources 页面不再列入 index.md，避免占用上下文。
> 需要查询 source 页面时，直接从相关 concept/entity 页面的 sourcePath 追溯。

### log.md 格式

```markdown
# Wiki Log

## [2026-04-13] ingest | llm-wiki.md
- 操作：摄入新来源
- 新增页面：source/llm-wiki.md, entity/llm-wiki-pattern
- 更新页面：concept/knowledge-base, _index.md
- 矛盾标记：无
- 备注：核心参考文档，wiki 模式的总纲

## [2026-04-13] lint | weekly
- 操作：每周体检
- 发现问题：2 个孤儿页面，1 处过期引用
- 已修复：否（待确认）
```

---

## 与 OpenClaw 系统的集成

### Memory 同步
- 每次 ingest 后，关键知识点同步写入 `memory_search`
- query 时优先查 wiki 再查 memory

### Cron 任务
- 每周一 09:00：触发 wiki-lint
- 每日 09:30：检查 sources/ 是否有新增文件

### TaskFlow
- ingest/query/lint 封装为可组合的 TaskFlow 步骤
- 支持大规模 batch ingest

---

## 工具支持

| 工具 | 用途 |
|------|------|
| `obsidian` skill | 浏览和编辑 wiki（在 Obsidian 中实时查看） |
| `wiki-ingest` skill | 摄入新来源 |
| `wiki-query` skill | 查询知识库 |
| `wiki-lint` skill | 体检和维护（含 git 仓库同步检查） |
| `scripts/ingest_batch.py` | 批量 ingest git 仓库来源（wiki-lint 内部调用） |
| qmd（可选） | 大规模 wiki 的语义搜索 |

---

## 演化规则

- `WIKI.md` 和 `wiki/.schema.md` 共同演化
- 当新约定产生时，先讨论，再更新 schema
- 所有变更记录在 `log.md`
- 重大架构调整需用户确认
