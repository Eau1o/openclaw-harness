---
title: Anthropic
type: entity
tags: [openclaw, entity, provider]
created: 2026-04-13
updated: 2026-04-13
sourcePaths: [wiki/sources/github/openclaw/docs/providers/anthropic.md]
---

# Anthropic

## 简介
Anthropic 构建了 Claude 模型系列。OpenClaw 支持两种认证方式：API key（直接访问 API，按用量计费）和 Claude CLI（复用同一主机上已登录的 Claude CLI）。

## 主要功能/特性
- API key 方式：`anthropic/*` 模型，按用量计费
- Claude CLI 方式：复用现有 Claude CLI 登录
- 支持模型：Claude 3.5 Sonnet、Claude 3 Opus、Claude 3 Haiku 等
- 支持 Prompt caching
- Claude Code CLI 使用已获 Anthropic 员工认可

## 配置方式
- API key：`openclaw onboard --auth-choice anthropic-api-key`
- Claude CLI：使用 Claude CLI 认证选项引导
- 通过 `ANTHROPIC_API_KEY` 环境变量认证
- 模型格式：`anthropic/claude-opus-4-6`

## 相关概念
- [[concept/model-providers]]
- [[concept/session-pruning]]

## 相关实体
- [[entity/openai]]
- [[entity/deepseek]]
- [[entity/google-gemini]]
