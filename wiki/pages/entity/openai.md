---
title: OpenAI
type: entity
tags: [openclaw, entity, provider]
created: 2026-04-13
updated: 2026-04-13
sourcePaths: [wiki/sources/github/openclaw/docs/providers/openai.md]
---

# OpenAI

## 简介
OpenAI 提供 GPT 模型 API，有两种认证方式：API key（直接访问 Platform）和 Codex 订阅（ChatGPT/Codex OAuth 登录）。

## 主要功能/特性
- API key 方式：`openai/*` 模型，按用量计费
- Codex OAuth 方式：`openai-codex/*` 模型，订阅访问
- OpenAI 在外部工具中明确支持订阅 OAuth
- 模型：GPT-4、GPT-4o、GPT-3.5、Codex 模型

## 配置方式
- API key：`openclaw onboard --auth-choice openai-api-key` 或直接传递 key
- Codex OAuth：通过 `openclaw models auth login --provider openai-codex` 的 OAuth 流程
- 模型格式：`provider/model`（如 `openai/gpt-4o`）

## 相关概念
- [[concept/model-providers]]
- [[concept/oauth]]

## 相关实体
- [[entity/anthropic]]
- [[entity/deepseek]]
- [[entity/google-gemini]]
