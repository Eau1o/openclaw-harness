---
title: Microsoft Teams
type: entity
tags: [openclaw, entity, channel]
created: 2026-04-13
updated: 2026-04-13
sourcePaths: [wiki/sources/github/openclaw/docs/channels/msteams.md]
---

# Microsoft Teams

## 简介
Microsoft Teams 是一个内置的 Channel 插件，使用 Bot Framework。支持文本 + DM 附件。频道/群组发送文件需要 `sharePointSiteId` + Graph 权限。

## 主要功能/特性
- 支持文本 + DM 附件
- 支持频道和群组
- 通过 Adaptive Cards 进行投票
- 通过 `sharePointSiteId` + Graph 权限发送文件（群聊）
- 消息操作需要明确的 `upload-file` 用于文件优先发送
- 捆绑插件（在当前版本中无需单独安装）

## 配置方式
- 捆绑在当前版本中；手动安装：`openclaw plugins install @openclaw/msteams`
- 通过 Bot Framework 配置
- 高级功能需要 Graph API 权限

## 相关概念
- [[concept/channels]]

## 相关实体
- [[entity/slack]]
- [[entity/feishu]]
