---
title: Delegates
tags: [openclaw, concept]
created: 2026-04-13
updated: 2026-04-13
sourcePaths: [wiki/sources/github/openclaw/docs/concepts/delegate-architecture.md]
---

# Delegates

## 定义
Delegate 是一个拥有自己身份（邮箱、显示名、日历）的 OpenClaw Agent，在明确的委托权限下代表组织中的一个或多个人类行事。Agent 绝不会冒充人类——它以自己的账户发送、读取和调度。

## 核心要点
- **自有凭据**：delegate 有自己的凭据，而个人模式是 agent 使用你的凭据
- **可问责性**：消息来自 delegate，而不是人类
- **常驻指令**：`AGENTS.md` 中的规则，指定 agent 哪些可以自主执行，哪些需要人类批准
- **Cron 作业**：定期执行 recurring autonomous work
- **组织部署**：将 multi-agent 路由从个人使用扩展到组织
- **信任边界**：组织策略 vs 个人信任边界

## 相关概念
- [[concept/multi-agent]]
- [[concept/oauth]]

## 关联实体
