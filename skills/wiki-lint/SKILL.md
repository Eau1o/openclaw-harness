---
name: wiki-lint
description: 对 Wiki 知识库进行全面体检，检测断链、孤儿页面、矛盾内容、过期信息
concurrency_safe: false
read_only: false
---

# wiki-lint — Wiki 体检与维护

## 功能描述

对 wiki 知识库进行全面体检，检测问题并提出修复建议。
包括：断链、孤儿页面、矛盾内容、过期信息、缺失引用。

## 触发方式

- 用户明确说"lint"、"体检"、"检查 wiki"
- Cron 定时触发（建议每周一次）
- 摄入来源时自动进行一次小规模检查

## 执行流程

### Step 0：确认范围

```
小型检查（ingest 后自动）：
- 检查新页面与相关页面的连通性
- 检查新页面的 frontmatter 是否完整
- 耗时：< 30 秒

全面检查（Cron 或手动触发）：
- 检查所有连通性问题
- 检查所有时效性问题
- 检查一致性和完整性
- 耗时：视 wiki 规模而定（100 页约 1-2 分钟）
```

### Step 0：来源同步检查（全面 lint 时执行）

```
A. 扫描 wiki/sources/github/ 下所有含 .git 的仓库目录
B. 对每个仓库：
   - 执行 git fetch 更新 remote ref
   - 获取当前 HEAD commit
   - 对比 .sync-state.json 中记录的 lastCommit
C. 如有更新：
   - 重新 ingest 该仓库（使用 --update 覆盖已有页面）
   - 更新 .sync-state.json 的 lastCommit 和 lastSync
   - 报告同步结果（X 个仓库有更新，Y 个页面被覆盖）
D. 如无更新：
   - 报告："所有仓库已是最新状态"
```

> [!note]
> 小型检查（ingest 后自动）不执行同步检查。
> 全面检查（Cron 或手动触发）时，先同步再 lint。

### Step 1：连通性检查

```
A. 检查所有 wikilink 引用
   - 扫描 wiki/pages/**/*.md
   - 提取所有 [[...]] 格式的链接
   - 比对目标页面是否存在
   - 输出：断链列表

B. 检查孤儿页面
   - 统计每个页面的 inbound links
   - 识别没有任何页面引用的 entity/concept
   - 注意：synthesis 页可以有 0 inbound（用户主动探索）
   - 输出：孤儿页面列表

C. 检查孤立目录
   - 是否有 entity/ 下没有任何 source 引用的页面
   - 是否有 concept/ 下从未被任何页面引用的页面
```

### Step 2：时效性检查

```
A. 检查过期信息
   - 标记 frontmatter updated > 180 天未更新的实体
   - 标记 tagged with [archived] 或 [outdated] 的页面
   - 标记超过 30 天未处理的 > [!todo]

B. 检查来源时效性
   - 如果知道来源日期，检查是否 > 5 年
   - 标注可能过时的 source 页面
```

### Step 3：一致性检查

```
A. 检查矛盾标记
   - 查找所有 > [!conflict] 块
   - 检查矛盾是否已解决（状态：已验证/已修正）
   - 未解决的矛盾按时间排列

B. 检查同一实体的描述一致性
   - 同一 entity 在不同页面的描述是否一致
   - 同一 concept 的定义是否有冲突

C. 检查 tags 规范性
   - 有无拼写错误
   - 有无重复 tags
   - tags 命名是否一致（lowercase / kebab-case）
```

### Step 4：完整性检查

```
A. 检查 _index.md 是否与实际页面一致
   - 扫描所有页面
   - 比对 index 中的记录
   - 输出：缺失索引、多余索引

B. 检查应有但缺失的页面
   - 引用某 concept 但没有专属页面
   - 某个 source 没有摘要页
   - 高频提及的实体但没有 entity 页面
```

### Step 5：生成报告

```markdown
## Wiki Lint 报告

**检查时间**：[YYYY-MM-DD HH:mm]
**Wiki 规模**：X 个页面
**检查类型**：小型 / 全面

---

### 🔴 需要立即处理

#### 断链（X 个）
- [[entity/xxx]] → [[entity/yyy]]（不存在）
- [[concept/zzz]] → [[concept/wwww]]（不存在）

#### 矛盾（X 个）
> [!conflict]
> [[source/aaa]] vs [[source/bbb]]：关于 [主题] 的说法不一致
> 状态：未解决

---

### 🟡 建议处理

#### 孤儿页面（X 个）
- [[entity/old-topic]] — 180 天未更新，无引用

#### 过期信息（X 个）
- [[concept/xxx]] — 上次更新：2025-01-01（>180 天）

#### 缺失索引（X 个）
- [[entity/yyy]] 在 _index.md 中缺失

---

### 🟢 整体评价

**连通性**：X% 的引用有效
**时效性**：X 个页面需要更新
**一致性**：发现 X 处矛盾
**完整性**：index 覆盖率 X%

---

### 建议行动

1. 修复断链（优先级：高）
2. 解决最旧的矛盾（优先级：高）
3. 处理孤儿页面或删除或补充引用（优先级：中）
4. 更新长期未动的页面（优先级：低）

---
是否要我自动修复可以安全修复的问题？
```

### Step 6：执行修复（如用户授权）

```
可自动修复（低风险）：
- [x] 修复断链（创建空页面或修正链接）
- [x] 补充 _index.md 缺失项
- [x] 清理 _index.md 多余项
- [x] 规范化 tags 拼写
- [x] 追加 [!todo] 处理提醒

需要用户确认：
- [ ] 删除孤儿页面
- [ ] 解决矛盾
- [ ] 合并重复页面
- [ ] 删除过期内容
```

## 自动化配置

### Cron 任务建议

```json
{
  "name": "wiki-weekly-lint",
  "schedule": { "kind": "cron", "expr": "0 9 * * 1", "tz": "Asia/Shanghai" },
  "payload": { "kind": "agentTurn", "message": "对 wiki 进行全面体检，执行 wiki-lint skill。" },
  "sessionTarget": "isolated",
  "delivery": { "mode": "announce" }
}
```

## 注意事项

1. **不要自动删除内容**——孤儿页面和过期页面由用户决定
2. **矛盾标记不要自行裁决**——由用户判断哪个来源更可靠
3. **报告要可操作**——每个问题都要有明确的修复建议
4. **记录修复历史**——每次 lint 的结论和行动记入 log.md

## 依赖 Skill / 脚本

- `scripts/ingest_batch.py` — 批量 ingest 脚本，用于同步 git 仓库来源
  - 用法：`python scripts/ingest_batch.py --repo <path> --output <subdir> [--update]`
  - 位置：`skills/wiki-lint/scripts/ingest_batch.py`
- 无其他外部依赖

## 相关文件

- 入口规范：`WIKI.md`
- 机器规范：`wiki/.schema.md`
- 操作日志：`wiki/log.md`