#!/bin/bash
# 运行 Agent 并自动重试格式修复

AGENT_OUTPUT=$(openclaw agent run main -m "$1" 2>/dev/null)

echo "$AGENT_OUTPUT" | ./check-output-format.sh

if [ $? -ne 0 ]; then
  echo ""
  echo "⚠️ 格式不符合规范，正在请求 Agent 修复..."
  
  # 将错误信息发给 Agent 要求修复
  ERROR_MSG=$(echo "$AGENT_OUTPUT" | ./check-output-format.sh 2>&1)
  
  FIXED_OUTPUT=$(openclaw agent run main -m "之前的输出格式有误，请根据以下错误信息修复：\n\n$ERROR_MSG\n\n按 format-fixer skill 的要求输出正确的 JSON")
  
  echo "$FIXED_OUTPUT"
fi
