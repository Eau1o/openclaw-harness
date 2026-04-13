---
title: "Golden Principles"
tags:
  - "code-quality"
  - "agent"
  - "engineering-norms"
relatedSources:
  - "source/openai-harness-engineering"
---

# Golden Principles（黄金原则）

将人类工程品味**编码为机械可执行的规则**，持续应用于每一行代码。

## 核心规则

1. **优先共享工具包** — 集中不变量，而非分散手写辅助函数
2. **不做 YOLO 风格数据探索** — 必须验证边界或依赖类型 SDK，禁止猜测数据形状
3. **技术债务持续偿还** — 小额高频偿还优于大额突击（类似垃圾回收）

## 执行机制

- 自定义 linter + CI 任务持续扫描偏差
- 后台 Codex 任务定期扫描、更新质量评级、发起定向重构 PR
- 大部分 PR 可在 1 分钟内审查并自动合并

## 效果

人类品味被**一次编码、持续强制**，不仅适用于当前代码，还适用于未来所有 Codex 运行和其他 Agent（如 Aardvark）。

> 来源: [[source/openai-harness-engineering]]
