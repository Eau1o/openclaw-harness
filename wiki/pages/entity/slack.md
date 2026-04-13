---
title: Slack
type: entity
tags: [openclaw, entity, channel]
created: 2026-04-13
updated: 2026-04-13
sourcePaths: [wiki/sources/github/openclaw/docs/channels/slack.md]
---

# Slack

## 简介
Slack 是一个可通过 Slack app 集成投入生产的 Channel。支持 DM + 频道。默认模式为 Socket Mode；也支持 HTTP Request URL。

## 主要功能/特性
- 通过 Slack app 集成支持 DM 和频道
- Socket Mode（默认）和 HTTP Request URL 模式
- App-Level Token（`xapp-...`），需要 `connections:write` scope
- Bot Token（`xoxb-...`）
- 支持 Slash 命令
- 支持预览流式传输

## 配置方式
- 在 api.slack.com/apps 从 manifest 创建 Slack app
- 生成带有 `connections:write` 的 App-Level Token
- 安装 app 并复制 Bot Token
- 配置 `channels.slack.enabled`、`mode`、`appToken`、`botToken`

## 相关概念
- [[concept/channels]]
- [[concept/streaming]]

## 相关实体
- [[entity/discord]]
- [[entity/telegram]]
