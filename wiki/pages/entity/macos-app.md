---
title: macOS App
type: entity
tags: [openclaw, entity, platform]
created: 2026-04-13
updated: 2026-04-13
sourcePaths: [wiki/sources/github/openclaw/docs/platforms/macos.md]
---

# macOS App

## 简介
macOS app 是 OpenClaw 的菜单栏配套应用。它负责 TCC 提示授权，管理/连接本地 Gateway，并将 macOS 能力作为 node 暴露。

## 主要功能/特性
- 菜单栏配套应用，带原生通知
- TCC 提示所有权：通知、可访问性、屏幕录制、麦克风、语音识别、自动化/AppleScript
- 运行或连接 Gateway（本地或远程）
- 暴露 macOS 工具：Canvas、Camera、屏幕录制、`system.run`
- 可选的 PeekabooBridge 用于 UI 自动化
- 通过 npm/pnpm/bun 安装全局 CLI（`openclaw`）
- **本地模式**（默认）：附加到本地 Gateway 或启用 launchd 服务
- **远程模式**：通过 SSH/Tailscale 连接 Gateway；启动 node host 服务

## 配置方式
- Gateway 发现优先使用 Tailscale MagicDNS 名称而非原始 tailnet IP
- 每用户 LaunchAgent：`ai.openclaw.gateway`
- 通过 `openclaw gateway install`（launchd）管理

## 相关概念
- [[concept/gateway]]

## 相关实体
- [[entity/ios-app]]
- [[entity/android-app]]
- [[entity/linux-app]]
