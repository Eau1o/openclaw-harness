#!/bin/bash
# 检查 Agent 输出是否符合标准 JSON 格式
# 错误信息包含修复指令，让 Agent 能理解并修正

INPUT=$(cat)

# 检查1：是否为有效 JSON
if ! echo "$INPUT" | jq -e . > /dev/null 2>&1; then
  echo "❌ 错误：输出不是有效的 JSON 格式"
  echo ""
  echo "✅ 修复方法："
  echo "   1. 确保输出是一个完整的 JSON 对象"
  echo "   2. 使用双引号包裹所有键名和字符串值"
  echo "   3. 不要在 JSON 末尾添加逗号"
  echo "   4. 布尔值使用 true/false（小写，无引号）"
  echo ""
  echo "📖 正确示例："
  echo '   {"success": true, "data": {"result": "ok"}, "durationMs": 123}'
  exit 1
fi

# 检查2：是否有 success 字段
if ! echo "$INPUT" | jq -e '.success != null' > /dev/null 2>&1; then
  echo "❌ 错误：缺少 success 字段"
  echo ""
  echo "✅ 修复方法：在 JSON 根对象中添加 success 字段"
  echo "   - 成功时：\"success\": true"
  echo "   - 失败时：\"success\": false"
  echo ""
  echo "📖 正确示例："
  echo '   {"success": true, "data": {...}}'
  echo '   {"success": false, "error": {...}}'
  exit 1
fi

SUCCESS=$(echo "$INPUT" | jq -r '.success')

if [ "$SUCCESS" = "true" ]; then
  # 成功时检查 data 字段
  if ! echo "$INPUT" | jq -e '.data != null' > /dev/null 2>&1; then
    echo "❌ 错误：success=true 时必须包含 data 字段"
    echo ""
    echo "✅ 修复方法：在 JSON 根对象中添加 data 字段"
    echo "   data 字段应包含实际返回的数据"
    echo ""
    echo "📖 正确示例："
    echo '   {"success": true, "data": {"users": [...]}, "durationMs": 123}'
    exit 1
  fi
else
  # 失败时检查 error 字段
  if ! echo "$INPUT" | jq -e '.error != null' > /dev/null 2>&1; then
    echo "❌ 错误：success=false 时必须包含 error 字段"
    echo ""
    echo "✅ 修复方法：在 JSON 根对象中添加 error 对象"
    echo "   error 对象必须包含："
    echo "     - code: 错误码（字符串）"
    echo "     - message: 可读描述（字符串）"
    echo "     - retryable: 是否可重试（布尔值）"
    echo ""
    echo "📖 正确示例："
    echo '   {"success": false, "error": {"code": "FILE_NOT_FOUND", "message": "文件不存在", "retryable": false}, "durationMs": 45}'
    exit 1
  fi
  
  # 检查 error 对象的字段
  for field in code message retryable; do
    if ! echo "$INPUT" | jq -e ".error.$field != null" > /dev/null 2>&1; then
      echo "❌ 错误：error 对象缺少 $field 字段"
      echo ""
      echo "✅ 修复方法：在 error 对象中添加 $field 字段"
      echo "   - code: 使用标准错误码（如 FILE_NOT_FOUND、LAYER_VIOLATION）"
      echo "   - message: 描述具体问题"
      echo "   - retryable: 根据错误类型设为 true 或 false"
      exit 1
    fi
  done
fi

echo "✅ 输出格式符合规范"
exit 0