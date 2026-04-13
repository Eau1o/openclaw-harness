---
title: Browser Tool
type: entity
tags: [openclaw, entity, tool]
created: 2026-04-13
updated: 2026-04-13
sourcePaths: [wiki/sources/github/openclaw/docs/tools/browser.md]
---

# Browser Tool

## 简介
OpenClaw 可以运行一个专用的 Chrome/Brave/Edge/Chromium 配置 profile，由 Agent 控制，与你的个人浏览器隔离，并通过 Gateway 内的本地控制服务管理（仅限回环地址）。

## 主要功能/特性
- 独立的 Agent 专用浏览器配置（`openclaw` 主题，橙色强调色）
- 确定性的 Tab 控制（列表/打开/聚焦/关闭）
- Agent 操作：点击、输入、拖拽、选择
- 快照、截图、PDF
- 可选的多配置支持（`openclaw`、`work`、`remote` 等）
- 内置 `user` 配置通过 Chrome MCP 附加到真实已登录的 Chrome 会话
- 不是用户的日常浏览器——安全隔离的 Agent 自动化界面

## 配置方式
```bash
openclaw browser --browser-profile openclaw status
openclaw browser --browser-profile openclaw start
openclaw browser --browser-profile openclaw open https://example.com
openclaw browser --browser-profile openclaw snapshot
```

## 相关概念
- [[concept/tools]]

## 相关实体
- [[entity/exec-tool]]
- [[entity/subagent-tool]]
