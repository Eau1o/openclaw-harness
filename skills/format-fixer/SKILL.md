---
name: format-fixer
description: 根据脚本报错信息，修复输出格式问题
---

# 格式修复 Skill

## 触发条件
当用户说"格式报错"、"修复输出格式"或粘贴了 `check-output-format.sh` 的报错信息时触发。

## 处理流程

1. 读取报错信息
2. 识别报错类型：
   - "不是有效的 JSON 格式" → 检查引号、逗号、括号
   - "缺少 success 字段" → 添加 success 字段
   - "success=true 时缺少 data" → 添加 data 字段
   - "error 对象缺少 xxx" → 补全 error 字段
3. 按报错中的"修复方法"修正输出
4. 重新输出符合格式的 JSON

## 标准错误码（供参考）

| 错误码 | 使用场景 |
|--------|----------|
| `FILE_NOT_FOUND` | 文件不存在 |
| `LAYER_VIOLATION` | 架构分层违规 |
| `PERMISSION_DENIED` | 权限不足 |
| `TIMEOUT` | 超时 |
| `UNKNOWN_ERROR` | 未知错误 |

## 输出格式

修复后必须输出符合规范的 JSON。
