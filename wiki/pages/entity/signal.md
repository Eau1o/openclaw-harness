---
title: Signal
type: entity
tags: [openclaw, entity, channel]
created: 2026-04-13
updated: 2026-04-13
sourcePaths: [wiki/sources/github/openclaw/docs/channels/signal.md]
---

# Signal

## 简介
Signal 是一个外部 CLI 集成。Gateway 通过 HTTP JSON-RPC + SSE 与 `signal-cli` 通信。注重隐私的 Channel。

## 主要功能/特性
- 通过 `signal-cli` 的外部 CLI 集成
- HTTP JSON-RPC + SSE 通信
- 注重隐私的消息传递
- QR 链接或 SMS 注册路径
- 配对审批流程

## 配置方式
- 需要单独的 Signal 号码作为机器人
- 安装 `signal-cli`（JVM 构建需要 Java）
- 两条设置路径：QR 链接（`signal-cli link -n "OpenClaw"`）或 SMS 注册（需要 captcha）
- 配置 `channels.signal.enabled`、`account`、`cliPath`、`dmPolicy`
- 配对审批：`openclaw pairing approve signal <CODE>`

## 相关概念
- [[concept/channels]]

## 相关实体
- [[entity/whatsapp]]
- [[entity/telegram]]
