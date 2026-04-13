---
title: Telegram
type: entity
tags: [openclaw, entity, channel]
created: 2026-04-13
updated: 2026-04-13
sourcePaths: [wiki/sources/github/openclaw/docs/channels/telegram.md]
---

# Telegram

## 简介
Telegram 是一个可通过 grammY Bot API 投入生产的 Channel。支持机器人 DM + 群组。默认模式为长轮询；Webhook 模式可选。

## 主要功能/特性
- 通过 grammY 支持机器人 DM 和群组
- 长轮询（默认）和可选的 Webhook 模式
- 支持 Slash 命令
- 预览流式传输（生成时临时预览消息）
- DM 配对模式

## 配置方式
- 通过 @BotFather 创建机器人，获取 bot token
- 配置 `channels.telegram.enabled`、`botToken`、`dmPolicy`、`groups.requireMention`

## 相关概念
- [[concept/channels]]
- [[concept/streaming]]
- [[concept/retry-policy]]

## 相关实体
- [[entity/discord]]
- [[entity/slack]]
