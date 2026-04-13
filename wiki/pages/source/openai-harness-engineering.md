---
title: "Harness engineering: leveraging Codex in an agent-first world"
sourcePath: "https://openai.com/index/harness-engineering"
ingestDate: "2026-04-13"
type: "article"
tags:
  - "agent-first"
  - "codex"
  - "openai"
  - "engineering-velocity"
  - "knowledge-base"
---

# Harness engineering: leveraging Codex in an agent-first world

> **来源**: [OpenAI Blog](https://openai.com/index/harness-engineering)
> **发表时间**: 2026年4月（基于上下文推断）
> **核心团队**: OpenAI Codex 团队

## 核心论点

OpenAI 团队用 5 个月时间、3 名工程师驱动 Codex 构建了一个拥有约 **100 万行代码** 的产品，期间约 **1500 个 PR** 被合并，平均每人每天 3.5 个 PR。人类只负责"掌舵"，所有代码、测试、CI、文档、工具均为 Codex 编写。

**约束哲学**: 零人工编写代码。

## 关键发现

### 1. 环境比模型更重要

早期进展慢不是因为 Codex 能力不足，而是**环境配置不足**。Agent 缺乏必要的工具、抽象和内部结构。

→ 工程团队的核心工作变成了：为 Codex 构建能干活的环境

### 2. AGENTS.md 是目录，不是手册

"一站式 AGENTS.md" 方法失败了：
- 上下文是稀缺资源，巨型指令文件挤占了任务本身
- 太多指引等于没有指引
- 它会迅速腐坏

→ 正确的做法：**AGENTS.md = 目录（~100行），docs/ = 系统真相来源**

### 3. 知识必须进入仓库

从 Agent 视角看，**无法在上下文访问的东西 = 不存在**：
- Google Docs、Slack 讨论、人的脑子里知识 → Agent 看不到
- 仓库本地的版本化产物（代码、markdown、schema、可执行计划）→ Agent 可以访问

### 4. 严格架构边界是早期前提

通常你在有几百名工程师时才需要严格分层架构，但**在 Agent 时代，这是早期必要条件**：
- 每个业务域只能"向前"依赖（Types → Config → Repo → Service → Runtime → UI）
- 跨领域切面（认证、连接器、遥测）通过单一接口 Providers 注入
- 约束靠自定义 linter 机械执行

### 5. Golden Principles（黄金原则）

将人类品味编码为机械规则，持续执行：
1. 优先共享工具包而非手写辅助函数
2. 不做"YOLO 风格"数据探索，必须验证边界或依赖类型 SDK
3. 技术债务像高息贷款，小额持续偿还优于大额突击

### 6. Ralph Wiggum Loop

Agent 自我审查反馈循环：Codex 审查自己的变更 → 请求额外 Agent 审查 → 响应反馈 → 迭代直到所有 Agent 审查者满意。

### 7. Codex 现在可以端到端驱动新功能

给定单个 prompt，Codex 可以：
1. 验证代码库当前状态
2. 重现 bug
3. 录制失败视频
4. 实现修复
5. 验证修复
6. 录制解决视频
7. 打开 PR
8. 响应 Agent 和人类反馈
9. 检测并修复构建失败
10. 仅在需要判断时才升级给人类
11. 合并变更

## 关键概念

| 概念 | 说明 |
|------|------|
| [[concept/agent-first]] | 人类设计环境、指定意图、建立反馈循环；Agent 执行 |
| [[concept/knowledge-base]] | 仓库本地的结构化文档系统，作为 Agent 的知识来源 |
| [[concept/parse-dont-validate]] | 在边界解析数据形状，而非验证（来自 Alexey Scheglov） |
| [[concept/golden-principles]] | 将人类品味编码为机械可执行规则 |
| [[concept/technical-debt-hygiene]] | 技术债务持续小额偿还策略 |

## 关键实体

| 实体 | 关系 |
|------|------|
| [[entity/codex]] | OpenAI Codex Agent，核心执行者 |
| [[entity/openai]] | 发布方和团队所在组织 |

## 相关阅读

- [AGENTS.md 规范](https://agents.md/)
- [Architecture Documentation](https://matklad.github.io/2021/02/06/ARCHITECTURE.md.html)
- [Parse, Don't Validate](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/)
- [AI Is Forcing Us to Write Good Code](https://bits.logic.inc/p/ai-is-forcing-us-to-write-good-code)

---

> **我的评注**: 这篇文章是 Agent-First Engineering 的实践手册。核心理念"人类掌舵，Agent 执行"与 OpenClaw 的设计哲学高度一致。特别值得借鉴的是：知识库必须进入仓库（而非散落在各处的文档），以及严格架构约束不是负担而是 Agent 高效工作的前提。
