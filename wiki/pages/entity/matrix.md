---
title: Matrix
type: entity
tags: [openclaw, entity, channel]
created: 2026-04-13
updated: 2026-04-13
sourcePaths: [wiki/sources/github/openclaw/docs/channels/matrix.md]
---

# Matrix

## 简介
Matrix 是一个内置的 Channel 插件，使用官方 `matrix-js-sdk`。支持 DM、房间、线程、媒体、表情反应、投票、位置共享和端到端加密（E2EE）。

## 主要功能/特性
- 支持 DM、房间、线程
- 媒体分享
- 表情反应和投票
- 位置共享
- 端到端加密（E2EE）
- 捆绑插件（在当前版本中无需单独安装）
- 通过 `channels.matrix.autoJoin` 自动加入

## 配置方式
- 在 homeserver 上创建 Matrix 账户
- 使用 `homeserver` + `accessToken` 或 `userId` + `password` 配置 `channels.matrix`
- 重启 gateway
- 需要时手动安装：`openclaw plugins install @openclaw/matrix`

## 相关概念
- [[concept/channels]]

## 相关实体
- [[entity/slack]]
- [[entity/telegram]]
