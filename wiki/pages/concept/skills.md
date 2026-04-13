---
title: Skills
tags: [openclaw, concept]
created: 2026-04-13
updated: 2026-04-13
sourcePaths: [wiki/sources/github/openclaw/docs/tools/skills.md]
---

# Skills

## 定义
Skill 是一个注入到 System prompt 中的 Markdown 文件（`SKILL.md`），为 Agent 提供有效使用工具的上下文、约束和分步指导。Skills 位于 workspace、共享文件夹中，或打包在插件内。

## 核心要点
- **三层架构**：工具（agent 调用的）→ Skills（何时/如何使用）→ 插件（打包一切）
- **加载位置**（最高优先级）：workspace `<workspace>/skills`、项目 `~/.agents/skills`、个人 `~/.agents/skills`、managed/local `~/.openclaw/skills`、捆绑的、通过 `skills.load.extraDirs` 的额外目录
- **Skill 门控**：skills 可以通过 Gateway 配置中的 `skills` 按 config/env 门控
- **每个 agent 的 skills**：`agents.defaults.skills` 用于共享基线；`agents.list[].skills` 用于每个 agent 的覆盖
- **Skill 允许列表**：`agents.defaults.skills` 和每个 agent 的 skill 允许列表通过 `agents.list[].skills`

## 相关概念
- [[concept/tools]]
- [[concept/plugins]]
- [[concept/agent]]

## 关联实体
