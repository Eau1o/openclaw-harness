---
title: Model Providers
tags: [openclaw, concept]
created: 2026-04-13
updated: 2026-04-13
sourcePaths: [wiki/sources/github/openclaw/docs/concepts/model-providers.md]
---

# Model Providers

## 定义
Model providers 是提供文本推理、图片生成、音乐生成、视频生成等的 LLM 集成。OpenClaw 支持 `provider/model` 引用格式（如 `opencode/claude-opus-4-6`），并使用 Provider 插件来标准化传输、配置、模型 ID 和运行时行为。

## 核心要点
- **模型引用**：`provider/model` 格式；`agents.defaults.models` 充当允许列表
- **CLI 助手**：`openclaw onboard`、`openclaw models list`、`openclaw models set <provider/model>`
- **Provider 插件钩子**：`normalizeModelId`、`normalizeTransport`、`normalizeConfig`、`createStreamFn`、`createEmbeddingProvider` 以及更多
- **认证路由**：API key、OAuth、环境变量、通用基于环境的探测
- **回退规则**：记录在 `/concepts/model-failover`
- **Provider manifests**：可以声明 `providerAuthEnvVars` 和 `providerAuthAliases` 用于基于环境的认证探测
- **Codex 配对**：捆绑的 `codex` provider 与 Codex agent harness 配对；使用 `codex/gpt-*` 用于 Codex 自有的登录/发现/线程恢复

## 相关概念
- [[concept/agent]]
- [[concept/model-failover]]
- [[concept/plugins]]

## 关联实体
- [[entity/openai]]
- [[entity/anthropic]]
- [[entity/deepseek]]
- [[entity/google-gemini]]
- [[entity/ollama]]
- [[entity/minimax]]
