# AGENTS.md - 工作区知识地图

## 知识索引

| 内容 | 文件位置 |
|------|----------|
| 架构分层规则 | docs/ARCHITECTURE.md |
| 设计决策记录 | docs/DESIGN.md |
| 当前执行计划 | docs/exec-plans/active/ |
| 已完成计划 | docs/exec-plans/completed/ |
| 技术债务清单 | docs/exec-plans/tech-debt-tracker.md |
| 产品规格 | docs/product-specs/ |
| 质量评分 | docs/QUALITY_SCORE.md |

## 铁律

1. **所有决策必须写入上述 Markdown 文件**
2. **执行任务前，先读取相关文档**
3. **任务完成后，更新对应的文档**
4. **发现临时方案，立即写入 tech-debt-tracker.md**

## 工作流

```
收到任务 → 读取相关 docs/ → 检查债务表 → 制定计划 → 执行 → 更新文档
```

## 上下文加载规则

### 分层加载
- 每次对话开始时，只加载 AGENTS.md、SOUL.md、USER.md
- 深层知识（docs/）按需读取，不要一次性全读

### 子任务隔离
当任务包含多个独立子问题时：
1. 对每个子问题，创建临时思考记录（不污染主上下文）
2. 分别处理，只将结果返回主上下文
3. 最后在主上下文中合并结果

## 计划管理

### 多步骤任务（≥3步）必须在 docs/exec-plans/active/ 创建计划文件
- 每完成一步，更新计划文件
- 计划文件作为"待办事项列表"
- 完成后移动到 completed/

### 计划文件格式
```markdown
# 计划：任务名称
- 状态：进行中
- 创建日期：YYYY-MM-DD

## 步骤
- [ ] 步骤1
- [ ] 步骤2（进行中）
- [ ] 步骤3

## 当前
正在执行...
```
