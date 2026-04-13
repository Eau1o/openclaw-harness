# SKILL.md - subagent

## 用途
定义 subagent 运行时环境的行为规范。

## 技能说明
当 `sessions_spawn(runtime: "subagent")` 被调用时，此文件作为子代理的基础配置。

## 配置项

### 环境变量
- `OPENCLAW_WORKSPACE`：工作区根路径
- `OPENCLAW_SKILLS_DIR`：技能目录路径

### 工具访问
- 允许使用 `read`, `write`, `edit`, `exec`, `process` 等基础工具
- 禁止访问敏感路径（如 `~/.ssh/`, `/etc/shadow`）

### 安全限制
- 禁止删除系统文件
- 禁止修改系统环境变量
- 禁止执行 `rm -rf` 等危险命令

## 执行流程
1. 读取此文件作为基础配置
2. 继承父会话的工作区环境
3. 初始化工具访问权限

## 更新日志
- 2026-04-11：创建基础配置
