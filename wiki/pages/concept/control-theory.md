---
title: "Control Theory"
tags:
  - "control-theory"
  - "cybernetics"
  - "systems-engineering"
  - "feedback"
relatedSources:
  - "source/books/engineering-cybernetics-qianxuesen"
---

# Control Theory (控制理论)

研究系统行为调节与优化的数学理论，是 [[entity/qian-xuesen]] 所著《[[source/books/engineering-cybernetics-qianxuesen]]》的核心理论基础。

## 核心概念

| 概念 | 说明 |
|------|------|
| **反馈 (Feedback)** | 系统输出返回影响后续输入，是控制论核心 |
| **稳定性 (Stability)** | 系统在扰动后返回平衡状态的能力 |
| **最优化 (Optimization)** | 在约束条件下寻求最优控制策略 |
| **自适应 (Adaptation)** | 系统根据环境变化自动调整 |

## 发展脉络

```
Wiener (1948) → Cybernetics
      ↓
钱学森 (1954) → 工程控制论
      ↓
现代控制理论 → 状态空间法、最优控制
      ↓
智能控制 → 模糊控制、神经网络、Agent系统
```

## 在 Agent 系统中的应用

| 控制理论概念 | Agent 系统实现 |
|-------------|---------------|
| 反馈回路 | [[concept/agent-loop]] — 推理循环中的自我修正 |
| 稳定性分析 | [[concept/technical-debt-hygiene]] — 系统健康度维护 |
| 最优控制 | [[concept/golden-principles]] — 编码规则约束优化 |
| 自适应系统 | [[concept/model-failover]] — 模型降级与切换 |

## 与 Agent-First Engineering 的关联

[[source/openai-harness-engineering]] 中 OpenAI 团队强调的"建立反馈循环"正是控制理论在软件工程中的实践：
- Ralph Wiggum Loop — 迭代审查反馈
- 持续技术债务清理 — 系统稳定性维护
- 环境暴露给 Agent — 完整的系统可观测性

> 来源: [[source/books/engineering-cybernetics-qianxuesen]]
