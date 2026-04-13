---
title: Tools
tags: [openclaw, concept]
created: 2026-04-13
updated: 2026-04-13
sourcePaths: [wiki/sources/github/openclaw/docs/tools/index.md]
---

# Tools

## 定义
Tools 是 Agent 调用以执行超出文本生成范围的操作的带类型函数——读取文件、运行命令、浏览网页、发送消息以及与设备交互。OpenClaw 内置工具，插件可以注册更多工具。

## 核心要点
- **内置工具**：`exec`/`process`（shell）、`code_execution`（沙箱 Python）、`browser`（Chromium）、`web_search`/`web_fetch`、`read`/`write`/`edit`（文件 I/O）、`apply_patch`、`message`、`image`/`image_generate`、`music_generate`、`video_generate`、`tts`、`sessions_*`/`subagents`/`agents_list`
- **工具 schema**：作为结构化函数定义发送给模型
- **Skills** 教 agent 何时和如何有效使用工具（markdown `SKILL.md` 文件）
- **插件** 将工具、频道、provider、skills 和其他能力打包在一起
- **`TOOLS.md`**：用户维护的关于工具应该如何使用的指导（不是存在哪些工具）

## 相关概念
- [[concept/skills]]
- [[concept/plugins]]
- [[concept/agent]]

## 关联实体
- [[entity/browser-tool]]
- [[entity/exec-tool]]
- [[entity/subagent-tool]]
