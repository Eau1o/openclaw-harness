---
title: Ollama
type: entity
tags: [openclaw, entity, provider]
created: 2026-04-13
updated: 2026-04-13
sourcePaths: [wiki/sources/github/openclaw/docs/providers/ollama.md]
---

# Ollama

## 简介
Ollama 是一个本地 LLM 运行时，可轻松在本地运行开源模型。OpenClaw 与 Ollama 的原生 API（`/api/chat`）集成，支持流式输出和工具调用。

## 主要功能/特性
- 本地 LLM 运行时，支持开源模型
- 原生 API 集成（`/api/chat`）——不是 `/v1` OpenAI 兼容 URL
- 支持流式输出和工具调用
- 通过 `OLLAMA_API_KEY` 自动发现本地 Ollama 模型
- 云端 + 本地或仅本地模式
- 支持 GGUF 模型

## 配置方式
- 使用原生 Ollama API URL：`baseUrl: "http://host:11434"`（无 `/v1`）
- 不要使用 `/v1` OpenAI 兼容 URL（会破坏工具调用）
- 引导：`openclaw onboard`，从 provider 列表中选择 Ollama
- 设置 `OLLAMA_API_KEY` 用于自动发现

## 相关概念
- [[concept/model-providers]]

## 相关实体
- [[entity/deepseek]]
- [[entity/openai]]
