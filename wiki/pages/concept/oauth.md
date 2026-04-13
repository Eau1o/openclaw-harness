---
title: OAuth Authentication
tags: [openclaw, concept]
created: 2026-04-13
updated: 2026-04-13
sourcePaths: [wiki/sources/github/openclaw/docs/concepts/oauth.md]
---

# OAuth Authentication

## 定义
OpenClaw 通过 OAuth 支持提供商的订阅认证（尤其是 OpenAI Codex / ChatGPT OAuth）。OAuth 提供商在登录/刷新流程中生成 refresh token，当颁发新 token 时可能会使旧 token 失效。

## 核心要点
- **OpenAI Codex OAuth**：明确支持在 OpenClaw 等外部工具中使用
- **PKCE token exchange**：安全的 OAuth flow 用于 token exchange
- **Token 存储**：tokens 安全存储；provider 插件可以通过 `openclaw models auth login --provider <id>` 提供自己的 OAuth 或 API key flow
- **Anthropic**：API key 是更安全的推荐路径；Claude CLI / 订阅认证现在按 Anthropic 员工允许
- **多个账户**：通过 profiles + per-session overrides 处理

## 相关概念
- [[concept/model-providers]]
- [[concept/delegates]]

## 关联实体
