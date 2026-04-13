---
title: Android App
type: entity
tags: [openclaw, entity, platform]
created: 2026-04-13
updated: 2026-04-13
sourcePaths: [wiki/sources/github/openclaw/docs/platforms/android.md]
---

# Android App

## 简介
Android app 是 OpenClaw 的配套节点应用。尚未公开发布（源代码可在 OpenClaw 仓库中获取）。

## 主要功能/特性
- 角色：配套节点应用（Android 不托管 Gateway）
- 需要 Gateway：在 macOS、Linux 或通过 WSL2 的 Windows 上运行
- 连接方式：通过 mDNS/NSD + WebSocket 连接 Gateway
- 设备配对：使用 `role: node`

## 配置方式
- 从源码构建：Java 17 + Android SDK（`./gradlew :app:assemblePlayDebug`）
- 安装：入门指南 + 配对
- Gateway：运行手册 + 配置

## 相关概念
- [[concept/gateway]]

## 相关实体
- [[entity/ios-app]]
- [[entity/macos-app]]
