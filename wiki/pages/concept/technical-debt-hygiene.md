---
title: "Technical Debt Hygiene"
tags:
  - "technical-debt"
  - "code-quality"
  - "agent"
relatedSources:
  - "source/openai-harness-engineering"
---

# Technical Debt Hygiene（技术债务卫生）

将技术债务管理视为**高频小额定投**，而非低频大额突击。

## 核心比喻

技术债务像**高息贷款**：
- 复利增长快
- 小额频繁偿还优于大额延期
- 长期不还会导致系统瘫痪

## Codex 团队的实践

1. **每天**有后台 Codex 任务扫描偏差和坏模式
2. **每个 PR** 都要满足质量基线
3. **自动化** — 规则编码到 linter 后自动应用于所有新代码

## 与传统工程的对比

| 传统工程 | Agent-First |
|----------|-------------|
| 周五"清理日"（20% 时间）| 持续后台清理（几乎零人工）|
| 大版本重构 | 小额定向重构 PR |
| 债务累积数月 | 债务不过夜 |

## 在 OpenClaw 的对应

参考 [[docs/exec-plans/tech-debt-tracker.md]] — 技术债务追踪系统。

> 来源: [[source/openai-harness-engineering]]
