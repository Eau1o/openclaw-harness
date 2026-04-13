---
title: Plugin System
tags: [openclaw, concept]
created: 2026-04-13
updated: 2026-04-13
sourcePaths: [wiki/sources/github/openclaw/docs/plugins/architecture.md]
---

# Plugin System

## 定义
Plugin 是一个可以注册任意组合能力的包：Channels、模型提供商、工具、Skills、语音、实时转录、实时语音、媒体理解、图片生成、视频生成、网络获取、网络搜索等。

## 核心要点
- **能力模型**：插件注册到能力类型（文本推理、CLI 推理后端、语音、实时转录、实时语音、媒体理解、图片生成、音乐生成、视频生成、网络获取、网络搜索、channel/messaging）
- **捆绑插件**：随 OpenClaw 一起发布（原生）
- **外部插件**：由社区在 npm 上发布
- **仅钩子插件**：仍然完全支持；注册零能力但提供钩子/工具/服务的插件
- **Plugin SDK**：通过 `api.registerProvider()`、`api.registerChannel()` 等提供注册 API
- **能力稳定性**：内部能力特定表面正在发展；基于钩子的集成是兼容性基线

## 相关概念
- [[concept/tools]]
- [[concept/skills]]
- [[concept/channels]]
- [[concept/model-providers]]

## 关联实体
