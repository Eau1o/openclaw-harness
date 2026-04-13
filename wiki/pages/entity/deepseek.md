---
title: DeepSeek
type: entity
tags: [openclaw, entity, provider]
created: 2026-04-13
updated: 2026-04-13
sourcePaths: [wiki/sources/github/openclaw/docs/providers/deepseek.md]
---

# DeepSeek

## 简介
DeepSeek 提供功能强大的 AI 模型，采用 OpenAI 兼容 API。

## 主要功能/特性
- OpenAI 兼容 API（`https://api.deepseek.com`）
- 认证：`DEEPSEEK_API_KEY`
- Provider：`deepseek`
- 模型：DeepSeek Chat、DeepSeek Coder

## 配置方式
- API key：`openclaw onboard --auth-choice deepseek-api-key`
- 设置默认模型：`deepseek/deepseek-chat`
- 验证：`openclaw models list --provider deepseek`

## 相关概念
- [[concept/model-providers]]

## 相关实体
- [[entity/openai]]
- [[entity/anthropic]]
- [[entity/ollama]]
