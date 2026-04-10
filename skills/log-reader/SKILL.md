---
name: log-reader
description: 读取和分析 OpenClaw 网关日志，用于故障诊断和性能分析
---

# 日志阅读 Skill

## 用途
当用户要求查看日志、排查问题、分析错误时触发。

## 日志位置
- **Gateway 文件日志**：`/tmp/openclaw/openclaw-YYYY-MM-DD.log`
- **会话日志**：`~/.openclaw/agents/*/sessions/*.jsonl`

## 查看日志命令

```bash
# 实时跟踪日志
openclaw logs --follow

# 查看最近 50 行
tail -50 /tmp/openclaw/openclaw-$(date +%F).log

# 查看错误日志
grep -i error /tmp/openclaw/openclaw-$(date +%F).log | tail -20
```

## 输出格式
分析日志后，输出：
1. 错误摘要（错误类型、出现次数）
2. 关键事件时间线
3. 建议的修复措施