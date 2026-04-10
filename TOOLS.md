# TOOLS.md - 工具与环境

## 当前环境
- 操作系统：WSL (Ubuntu) on Windows
- Shell：bash
- 工作区路径：~/.openclaw/workspace
- OpenClaw 版本：2026.4.9

## 可用工具

### 文件操作
- 读取：`cat`, `head`, `tail`, `ls`
- 编辑：`nano`, `vim`
- 查找：`grep`, `find`

### OpenClaw 专用命令
| 命令 | 用途 |
|------|------|
| `openclaw gateway start/stop/restart` | 网关管理 |
| `openclaw status` | 查看状态 |
| `openclaw logs --follow` | 实时日志 |
| `openclaw skills list` | 查看技能 |
| `openclaw agents list` | 查看 Agent |

## 路径约定
- 日志文件：`/tmp/openclaw/openclaw-$(date +%F).log`
- 技能目录：`~/.openclaw/workspace/skills/`
- 知识库：`~/.openclaw/workspace/docs/`

## 注意事项
- 执行长时间任务时，告知用户预计耗时
- 使用相对路径时，基于当前工作区目录