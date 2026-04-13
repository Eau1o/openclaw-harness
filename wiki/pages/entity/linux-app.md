---
title: Linux App
type: entity
tags: [openclaw, entity, platform]
created: 2026-04-13
updated: 2026-04-13
sourcePaths: [wiki/sources/github/openclaw/docs/platforms/linux.md]
---

# Linux App

## 简介
Linux 上完全支持 Gateway，推荐使用 Node 作为运行时。本地 Linux 配套应用已在规划中。

## 主要功能/特性
- Linux 上完全支持 Gateway
- 推荐使用 Node 24（Node 22 LTS 仍然可用）
- 不推荐 Bun（WhatsApp/Telegram 问题）
- VPS 快捷路径：安装 Node，`npm i -g openclaw@latest`，`openclaw onboard --install-daemon`
- SSH 隧道用于本地访问：`ssh -N -L 18789:127.0.0.1:18789 <user>@<host>`

## 配置方式
- 安装 Node 24（推荐）或 Node 22 LTS
- `npm i -g openclaw@latest`
- `openclaw onboard --install-daemon`
- 通过共享密钥认证（默认使用 token）

## 相关概念
- [[concept/gateway]]

## 相关实体
- [[entity/macos-app]]
- [[entity/android-app]]
- [[entity/ios-app]]
