---
title: Google Gemini
type: entity
tags: [openclaw, entity, provider]
created: 2026-04-13
updated: 2026-04-13
sourcePaths: [wiki/sources/github/openclaw/docs/providers/google.md]
---

# Google Gemini

## 简介
Google 插件提供通过 Google AI Studio 访问 Gemini 模型的能力，还支持图片生成、媒体理解（图像/音频/视频）以及通过 Gemini Grounding 进行网络搜索。

## 主要功能/特性
- 文本推理：通过 Google AI Studio 的 Gemini 模型
- 认证：`GEMINI_API_KEY` 或 `GOOGLE_API_KEY`
- 替代方案：`google-gemini-cli` provider（OAuth）
- 支持图片生成
- 媒体理解（图像/音频/视频）
- 通过 Gemini Grounding 进行网络搜索

## 配置方式
- API key：`openclaw onboard --auth-choice gemini-api-key`
- OAuth：`openclaw onboard --auth-choice gemini-cli-oauth`
- Provider ID：`google`
- 替代 provider：`google-gemini-cli` 用于 OAuth

## 相关概念
- [[concept/model-providers]]

## 相关实体
- [[entity/openai]]
- [[entity/anthropic]]
