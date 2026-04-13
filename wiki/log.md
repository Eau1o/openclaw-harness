# Wiki Log

## [2026-04-13] create | 首个 synthesis 页面
- 操作：创建 synthesis/wiki-build-day-one.md
- 内容：今日 wiki 构建工作的完整探索记录
- 包含：完成的工作、设计决策、当前规模、待完善事项
- 更新：_index.md（添加 Synthesis 分类）、WIKI.md（index.md 格式补充）

## [2026-04-13] refactor | index.md 移除 Sources 列表
- 操作：删除 index.md 中的 ## Sources (来源) 部分（422 条记录占用太多上下文）
- 变更：
  - index.md 从 522 行缩减到 87 行
  - 现在只保留 Concepts 和 Entities
  - Sources 页面不再列入 index，通过 concept/entity 页面的 sourcePath 追溯
- 同步更新：WIKI.md（index.md 格式规范，添加 note 说明）

## [2026-04-13] ingest | llm-wiki.md（补充 entity/concept）
- 操作：补充创建了相关 entity 和 concept 页面
- 新增：
  - concept/llm-wiki.md — LLM Wiki 方法论概念页
  - concept/knowledge-base.md — 知识库概念页
  - entity/obsidian.md — Obsidian 实体页
- 更新：_index.md（补充新增页面）

## [2026-04-13] ingest | llm-wiki.md
- 操作：摄入 LLM Wiki 方法论文章
- 来源文件：/home/admin_wsl/mymd/llm-wiki.md → wiki/sources/articles/llm-wiki.md
- 新增页面：wiki/pages/source/articles/llm-wiki.md
- 更新页面：_index.md（新增 Articles 分类）
- 矛盾标记：无
- 备注：LLM Wiki 模式的总纲文章，是本地 wiki 知识库的理论基础

## [2026-04-13] refactor | 简化来源架构
- 操作：明确 sources/ 为 git 仓库本身，不再是文件镜像副本
- 变更：
  - sources/ 下的目录直接是从 git clone 的仓库
  - ingest 从仓库的 sourceDir（如 docs/）实时读取
  - pages/source/ 是 ingest 后的 wiki 页面输出
- 同步更新：WIKI.md（架构图）、.schema.md（同步规范说明）
- 备注：减少了一次文件复制，sources/ 即原始仓库

## [2026-04-13] refactor | ingest_batch.py 移动到 skill 目录
- 操作：将 ingest_batch.py 从 workspace 根目录移动到 skills/wiki-lint/scripts/
- 原因：遵循 skill 规范，相关脚本放在调用它的 skill 目录下
- 同步更新：WIKI.md（工具支持表格）、wiki-lint/SKILL.md（依赖说明）

## [2026-04-13] refactor | source/ 目录结构
- 操作：按来源类型分子目录隔离
- 变更：将 422 个源文件从 `wiki/pages/source/` 迁移至 `wiki/pages/source/github-openclaw/`
- 更新文件：`_index.md`（所有 wikilink 路径更新为 `[[source/github-openclaw/xxx]]`）
- 同步更新：`WIKI.md`（补充子目录规范和命名约定）
- 备注：新摄入来源时，按 `github-{owner}-{repo}/`, `articles/`, `papers/`, `books/` 分类存放
- 操作：批量摄入 OpenClaw 官方文档
- 源文件数：422 个 .md 文件（已过滤 .generated/ 和 .i18n/ 目录）
- 新增页面：
  - 422 个 source/ 页面（`wiki/pages/source/`）
  - 1 个 _index.md（wiki 索引）
- 更新页面：无（首次摄入）
- 矛盾标记：无
- 备注：
  - 使用 slug 格式 `{dir}-{basename}` 避免文件名冲突
  - 内容截断至前 5000 字符
  - 批次处理：11 批次 × 40 文件 + 1 批次 × 22 文件
  - 发现 3 处日期提取错误（source 文件中日期格式不规范），已在 _index.md 中手工修正

## [2026-04-13] init | wiki created
- 操作：初始化 wiki 架构
- 页面：WIKI.md, wiki/.schema.md, wiki/pages/_index.md, wiki/log.md
- 备注：等待第一个 source 摄入

## [2026-04-13] ingest | openai-harness-engineering
- 操作：摄入 OpenAI Harness Engineering 博客文章
- 来源：https://openai.com/index/harness-engineering
- 新增页面：
  - source/openai-harness-engineering.md — 来源摘要
  - entity/codex.md（新建）— Codex 实体
  - concept/agent-first.md（新建）— Agent-First 工程范式
  - concept/golden-principles.md（新建）— 黄金原则
  - concept/parse-dont-validate.md（新建）— 类型解析哲学
  - concept/technical-debt-hygiene.md（新建）— 技术债务卫生
- 更新页面：_index.md（添加 Sources 分类和新页面）
- 矛盾标记：无

## [2026-04-13] ingest | 工程控制论 (Qian Xuesen)
- 操作：摄入钱学森《工程控制论》
- 来源：网络搜索（部分内容基于已有知识补充）
- 新增页面：
  - source/books/engineering-cybernetics-qianxuesen.md — 来源摘要
  - entity/qian-xuesen.md（新建）— 钱学森实体
  - concept/control-theory.md（新建）— 控制理论概念
- 更新页面：_index.md（添加新页面）
- 矛盾标记：无
- 备注：网络信息获取受限（多数百科/图书馆站点不可访问），部分细节基于训练数据补充，待核实
