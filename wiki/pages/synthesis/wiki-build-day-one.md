---
title: 本地 Wiki 知识库构建 — 首日总结
tags: [synthesis, meta, llm-wiki, openclaw]
created: 2026-04-13
updated: 2026-04-13
derivedFrom: [concept/llm-wiki, concept/knowledge-base, WIKI.md, wiki/log.md]
---

# 本地 Wiki 知识库构建 — 首日总结

## 背景

基于 LLM Wiki 方法论（[[concept/llm-wiki]]）构建本地知识库。使用 OpenClaw 作为 Agent， wiki 页面存储在本地 Markdown 文件中。

## 今日完成的工作

### 1. 框架初始化
- 创建 `WIKI.md`（维护规范）+ `wiki/.schema.md`（机器可读规范）
- 定义三层架构：Raw sources → The wiki → The schema
- 明确四种页面类型：entity / concept / source / synthesis

### 2. 批量摄入 OpenClaw 文档
- 从 `wiki/sources/github/openclaw/docs/` 摄入 422 个 .md 文件
- 按子目录分组存储在 `wiki/pages/source/github-openclaw/`
- 生成 slug 避免文件名冲突

### 3. 架构简化与调整
- 将 sources/ 明确为 git 仓库本身（而非文件镜像副本）
- `pages/source/` 按来源分组：`github-openclaw/`、`articles/` 等
- 移动 `ingest_batch.py` 到 `skills/wiki-lint/scripts/`

### 4. Git 同步机制
- 添加 `wiki/.sync-state.json` 记录每个仓库的同步状态
- 在 wiki-lint 中增加 Step 0：来源同步检查
- 支持增量更新（`--update` 参数覆盖已有页面）

### 5. 页面中文化
- entity/ 21 个页面：简介 → 中文
- concept/ 23 个页面：定义 + 核心要点 + 主要功能 → 中文
- 规则：描述性内容中文，命令/代码/专有名词/英文

### 6. 摄入 LLM Wiki 方法论文档
- 源文件：`/home/admin_wsl/mymd/llm-wiki.md` → `sources/articles/llm-wiki.md`
- 创建三层页面：
  - `source/articles/llm-wiki.md` — 原始内容 + frontmatter + blockquote 标注
  - `concept/llm-wiki.md` — LLM 综合理解的方法论概念页
  - `concept/knowledge-base.md` — 知识库概念页
  - `entity/obsidian.md` — 推荐工具实体页

### 7. index.md 优化
- 移除 Sources 列表（422 条太占上下文）
- 现在只保留 Concepts 和 Entities（87 行 vs 原 522 行）
- 查询 Sources 通过 concept/entity 页面的 `sourcePath` 追溯

## 关键设计决策

### 决策 1：sources/ vs pages/source/ 的关系
- `sources/` = 原始文件（git 仓库或本地 .md）
- `pages/source/` = 原始内容 + frontmatter（来源摘要）
- 两者都有必要：sources 是原料，pages/source 是成品

### 决策 2：source/ 页面的职责
- source/ = 原始内容 + frontmatter + blockquote 标注（保留原文精华）
- concept/ = LLM 综合理解（结构化、有关联、可跨文档综合）
- 不能把 source/ 做成了 concept/ 的半个版本

### 决策 3：index.md 结构优化
- 移除 Sources 列表（422 条太占上下文）
- 现在保留 Concepts、Entities、Synthesis
- Sources 通过 concept/entity 页面的 `sourcePath` 追溯

## 当前 Wiki 规模

| 类型 | 数量 | 说明 |
|------|------|------|
| entity/ | 22 个 | Channels(8) + Providers(6) + Platforms(4) + Tools(4) |
| concept/ | 25 个 | OpenClaw 概念(23) + llm-wiki + knowledge-base |
| source/github-openclaw/ | 422 个 | OpenClaw 官方文档 |
| source/articles/ | 1 个 | llm-wiki 方法论文档 |
| synthesis/ | 0 个 | 暂无（探索结果累积区） |

## 待完善事项

- [ ] 安装 Obsidian，设置图谱视图
- [ ] 添加语义搜索支持（qmd）
- [ ] 补充 memory-builtin / memory-qmd 的 entity 页面（它们是 tools，不是 concept）
- [ ] 建立每周 lint Cron 任务

## 相关文档

- 维护规范：[[WIKI.md]]
- 机器规范：[[wiki/.schema.md]]
- 操作日志：[[wiki/log.md]]
- 方法论：[[concept/llm-wiki]]