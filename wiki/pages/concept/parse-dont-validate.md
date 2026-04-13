---
title: "Parse, Don't Validate"
tags:
  - "type-safety"
  - "data-validation"
  - "architecture"
relatedSources:
  - "source/openai-harness-engineering"
externalLinks:
  - "[Parse, Don't Validate — Lexi Lambda](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/)"
---

# Parse, Don't Validate

一种数据类型处理哲学：**在边界处解析数据形状，而非仅做验证**。

## 核心思想

验证只告诉你数据**当前**是否有效，解析则将数据**提升**为更可信的类型。

```
// 验证（返回 boolean）
function processUserData(input: unknown): void {
  if (isValidUser(input)) { ... }
}

// 解析（返回具体类型，或抛出）
function processUserData(input: unknown): User {
  return parseUser(input); // 失败则异常
}
```

## 在 Agent 系统中的重要性

Codex 团队禁止"YOLO 风格"数据探索，要求：
- 依赖类型 SDK 而非猜测形状
- 在系统边界强制解析

这确保 Agent 不会基于错误假设构建整个子系统。

## OpenClaw 相关

[[entity/exec-tool]] 执行命令时，解析命令输出比简单验证更重要。

> 来源: [[source/openai-harness-engineering]]
