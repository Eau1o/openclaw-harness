---
title: WhatsApp
type: entity
tags: [openclaw, entity, channel]
created: 2026-04-13
updated: 2026-04-13
sourcePaths: [wiki/sources/github/openclaw/docs/channels/whatsapp.md]
---

# WhatsApp

## 简介
WhatsApp 通过 WhatsApp Web（Baileys）已可投入生产。Gateway 拥有链接的会话。需要 QR 配对；在磁盘上存储的状态比其他 Channel 更多。

## 主要功能/特性
- 通过 Baileys 库的 WhatsApp Web 协议
- DM：对未知发送者需要配对策略
- 支持群组
- 支持媒体（照片、音频、视频）
- QR 码配对流程

## 配置方式
- 安装插件：`openclaw plugins install @openclaw/whatsapp`
- 引导：`openclaw onboard` 或 `openclaw channels add --channel whatsapp`
- 登录：`openclaw channels login --channel whatsapp` 进行 QR 配对
- 配置 `channels.whatsapp.enabled`、`dmPolicy`

## 相关概念
- [[concept/channels]]

## 相关实体
- [[entity/telegram]]
- [[entity/signal]]
