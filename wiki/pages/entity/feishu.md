---
title: Feishu
type: entity
tags: [openclaw, entity, channel]
created: 2026-04-13
updated: 2026-04-13
sourcePaths: [wiki/sources/github/openclaw/docs/channels/feishu.md]
---

# Feishu

## 简介
Feishu（Lark）是一个内置的 Channel 插件，通过 WebSocket 事件订阅将 OpenClaw 连接到 Feishu/Lark 机器人。无需公共 Webhook URL。

## 主要功能/特性
- 通过 WebSocket 的 Feishu/Lark 机器人（无需公共 webhook）
- 捆绑插件（在当前版本中无需单独安装）
- 团队聊天和协作
- 消息接收和发送

## 配置方式
- 在 Feishu/Lark 创建机器人应用
- 捆绑在当前版本中；手动安装：`openclaw plugins install @openclaw/feishu`
- 两条设置路径：引导（`openclaw onboard`）或手动配置
- 使用机器人凭证配置 `channels.feishu`

## 相关概念
- [[concept/channels]]

## 相关实体
- [[entity/msteams]]
- [[entity/slack]]
