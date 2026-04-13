---
title: MiniMax
type: entity
tags: [openclaw, entity, provider]
created: 2026-04-13
updated: 2026-04-13
sourcePaths: [wiki/sources/github/openclaw/docs/providers/minimax.md]
---

# MiniMax

## 简介
MiniMax 是一个中国 AI 提供商，默认使用 MiniMax M2.7，内置支持语音合成、图像理解、音乐生成、视频生成和网络搜索。

## 主要功能/特性
- 默认模型：MiniMax M2.7（推理）
- 通过 T2A v2 捆绑语音合成
- 通过 `MiniMax-VL-01` 捆绑图像理解
- 通过 `music-2.5+` 捆绑音乐生成
- 通过 MiniMax Coding Plan search API 捆绑 `web_search`
- Provider 分流：`minimax`（API key）vs `minimax-portal`（OAuth）

## 主要模型
| Model | Type |
| ----- | ---- |
| `MiniMax-M2.7` | Chat (reasoning) |
| `MiniMax-M2.7-highspeed` | Chat (reasoning) |
| `MiniMax-VL-01` | Vision |
| `image-01` | Image generation |
| `MiniMax-Hailuo-2.3` | Video generation |

## 配置方式
- 认证：`MINIMAX_API_KEY`
- Provider：`minimax` 或 `minimax-portal`

## 相关概念
- [[concept/model-providers]]

## 相关实体
- [[entity/google-gemini]]
