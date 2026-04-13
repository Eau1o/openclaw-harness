---
title: iOS App
type: entity
tags: [openclaw, entity, platform]
created: 2026-04-13
updated: 2026-04-13
sourcePaths: [wiki/sources/github/openclaw/docs/platforms/ios.md]
---

# iOS App

## 简介
iOS app 是 OpenClaw 的移动端配套应用，与 Gateway 主机配对以提供随时随地访问能力。

## 主要功能/特性
- OpenClaw 的移动端配套应用
- 与 Gateway 主机配对
- Node 角色：通过 mDNS/NSD + WebSocket 连接 Gateway
- 需要 Gateway（在 macOS、Linux 或通过 WSL2 的 Windows 上运行）

## 配置方式
- 安装：入门指南 + 配对
- 通过 mDNS/NSD + WebSocket 连接 Gateway
- 使用设备配对（`role: node`）

## 相关概念
- [[concept/gateway]]

## 相关实体
- [[entity/macos-app]]
- [[entity/android-app]]
