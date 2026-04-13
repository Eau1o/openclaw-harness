---
title: Discord
type: entity
tags: [openclaw, entity, channel]
created: 2026-04-13
updated: 2026-04-13
sourcePaths: [wiki/sources/github/openclaw/docs/channels/discord.md]
---

# Discord

## 简介
Discord 是一个内置的 Channel 插件，使用官方 Discord Bot API 和 Gateway。支持 DM 和公会频道。

## 主要功能/特性
- 通过官方 Discord gateway 的 DM 和公会频道
- 支持 Slash 命令
- 角色允许列表和名称到 ID 匹配（需要 Server Members Intent）
- Presence 更新（可选；需要 Presence Intent）
- 消息内容（需要 Message Content Intent）
- 支持阻止流式传输和预览流式传输

## 配置方式
- 在 Discord Developer Portal 创建 Discord 应用 + 机器人
- 启用特权 Intent：Message Content Intent（必需）、Server Members Intent（推荐）、Presence Intent（可选）
- 使用机器人 token、DM 策略、群组设置配置 `channels.discord`

## 相关概念
- [[concept/channels]]
- [[concept/streaming]]
- [[concept/retry-policy]]

## 相关实体
- [[entity/slack]]
- [[entity/telegram]]
