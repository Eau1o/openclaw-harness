---
title: Streaming
tags: [openclaw, concept]
created: 2026-04-13
updated: 2026-04-13
sourcePaths: [wiki/sources/github/openclaw/docs/concepts/streaming.md]
---

# Streaming

## 定义
OpenClaw 有两个独立的流式输出层：块流式传输（助手写作时发出已完成的块）和预览流式传输（在 Telegram/Discord/Slack 上生成时更新临时预览消息）。目前没有真正的 token-delta 流式传输到 Channel 消息。

## 核心要点
- **块流式传输**：在可用时以粗粒度块发送 assistant 输出；块是正常的频道消息
- **预览流式传输**：基于消息的发送 + 在 Telegram/Discord/Slack 上编辑/追加
- **控制**：`agents.defaults.blockStreamingDefault`（`"on"`/`"off"`，默认关闭）；频道覆盖通过 `*.blockStreaming`
- **Break 模式**：`text_end`（每个文本结束时刷新）vs `message_end`（等待消息完成）
- **块配置**：`blockStreamingChunk` `{minChars, maxChars, breakPreference?}`、`blockStreamingCoalesce` `{minChars?, maxChars?, idleMs?}`
- **频道限制**：`*.textChunkLimit` 硬上限；`*.chunkMode`（`length` 或 `newline`）；Discord `maxLinesPerMessage`（默认 17）

## 相关概念
- [[concept/channels]]
- [[concept/gateway]]

## 关联实体
