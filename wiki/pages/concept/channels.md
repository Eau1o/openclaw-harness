---
title: Channels
tags: [openclaw, concept]
created: 2026-04-13
updated: 2026-04-13
sourcePaths: [wiki/sources/github/openclaw/docs/channels/index.md]
---

# Channels

## 定义
Channels 是将 OpenClaw 连接到消息平台的聊天集成。每个 Channel 通过 Gateway 连接，将消息路由到会话并回传回复。

## 核心要点
- **文本**在所有地方都支持；媒体和反应因频道而异
- **支持的频道**：BlueBubbles (iMessage)、Discord、Feishu、Google Chat、iMessage (legacy)、IRC、LINE、Matrix、Mattermost、MS Teams、Nextcloud Talk、Nostr、QQ Bot、Signal、Slack、Synology Chat、Telegram、Tlon、Twitch、Voice Call、WebChat、WhatsApp、Zalo、Zalo Personal
- **同时使用多个频道**：配置多个，OpenClaw 按聊天路由
- **DM 配对/允许列表**：为安全而强制执行
- **最快设置**：Telegram（简单 bot token）；WhatsApp 需要 QR 配对
- **群组行为**因频道而异

## 相关概念
- [[concept/gateway]]
- [[concept/session]]
- [[concept/plugins]]

## 关联实体
- [[entity/telegram]]
- [[entity/discord]]
- [[entity/slack]]
- [[entity/whatsapp]]
- [[entity/feishu]]
- [[entity/matrix]]
