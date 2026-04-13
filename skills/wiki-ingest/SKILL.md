---
name: wiki-ingest
description: 将新来源摄入 Wiki 知识库，自动创建/更新页面、维护索引和日志
concurrency_safe: false
read_only: false
---

# wiki-ingest — 摄入新来源

## 功能描述

将新的原始资料（文章、论文、书籍摘录等）摄入 wiki 知识库。
LLM 自动完成：读取分析 → 创建/更新页面 → 维护索引 → 记录日志。

## 触发方式

用户说"摄入"、"ingest"、"添加来源"、"处理这个文件"时激活。

## 必要参数

| 参数 | 来源 | 说明 |
|------|------|------|
| `sourcePath` | 用户提供或从上下文推断 | 文件路径、URL 或粘贴的文本 |

## 可选参数

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `force` | false | 是否覆盖已存在的 source 页面 |
| `skipImages` | false | 是否跳过图片下载 |
| `batch` | false | 是否批量处理（多个文件） |

## 执行流程

### Step 1：接收并验证

```
1. 解析 sourcePath
2. 如果是 URL → 调用 web_fetch 获取内容
3. 如果是本地文件 → 读取文件内容
4. 如果是粘贴文本 → 直接使用
5. 验证：文件是否可读、编码是否正常
```

### Step 2：分析来源

```
1. 识别类型：article / paper / book / video / podcast / conversation
2. 提取元数据：标题、作者、日期、来源平台
3. 结构化提取：
   - 核心论点（1-3 句）
   - 关键实体（人/组织/产品/概念）
   - 关键概念（可定义的主题）
   - 与现有 wiki 的潜在关联
4. 标记：是否有矛盾信息、是否有待核实点
```

### Step 3：生成页面

```
1. 创建 source/ 页面
   - 路径：wiki/pages/source/{slug}.md
   - frontmatter 必填：title, tags, sourcePath, ingestDate, type
   - 内容：来源信息 + 关键摘录 + 我的评注

2. 检查 entity/ 是否需要新建或更新
   - 识别到的实体 → 检查是否存在
   - 存在 → 在相关段落追加引用
   - 不存在 → 创建新 entity/ 页面

3. 检查 concept/ 是否需要新建或更新
   - 同上逻辑

4. 更新 _index.md
   - 在对应分类下追加新页面
   - 保持字母序或时间序

5. 追加 log.md
   - 格式：## [YYYY-MM-DD] ingest | {标题}
   - 记录：操作类型、新增页面、更新页面、矛盾标记、待办
```

### Step 4：输出报告

```markdown
## Ingest 完成

**来源**：[标题](URL 或路径)
**类型**：[类型]
**摄入日期**：[今天]

### 新增页面
- [[source/slug]] — 来源摘要
- [[entity/xxx]]（新建）— 实体
- [[concept/xxx]]（新建）— 概念

### 更新页面
- [[entity/yyy]] — 新增引用
- [[_index]] — 已更新

### 矛盾标记
> [!conflict]
> （如有）

### 待办
- [ ] 待核实：xxx

---
要不要打开 Obsidian 看一下新页面？
```

## 错误处理

| 错误类型 | 处理方式 |
|----------|----------|
| 文件不存在 | 请求用户提供正确路径 |
| 无法解析内容 | 询问用户是否可以提供纯文本 |
| source 已存在 | 询问是否覆盖（默认不覆盖） |
| 网络获取失败 | 记录错误，建议用户手动下载后重试 |

## 示例对话

**用户**：把这个 article 摄入 wiki：https://example.com/llm-article

**助手**：
```
收到。正在抓取网页内容...
分析来源类型：article
提取标题：LLM Wiki Pattern
识别实体：LLM, Obsidian, Vannevar Bush
识别概念：knowledge-base, wikilink, RAG

正在创建页面：
- [[source/llm-wiki-pattern]] 
- [[entity/vannevar-bush]]（新建）
- [[concept/knowledge-base-pattern]]（新建）
- [[concept/associative-trail]]（新建）

更新 index 和 log...

## Ingest 完成

来源：LLM Wiki Pattern (https://example.com/llm-article)
新增：1 个 source 页面，3 个 entity/concept 页面
矛盾标记：无

---
[[wiki-ingest 更多用法]]
```

## 注意事项

1. **不要修改 sources/ 目录**——它永远保持原始不可变
2. **frontmatter 必须完整**——否则 index 和 lint 会出问题
3. **矛盾标记不要跳过**——诚实标注比假装一致更有价值
4. **先问再行动**——批量 ingest 前先确认用户意图

## 依赖 Skill

- `obsidian` — 如需在 Obsidian 中实时预览
- `wiki-index` — 如需重建完整索引（大型 ingest 后）

## 相关文件

- 入口规范：`WIKI.md`
- 机器规范：`wiki/.schema.md`
- 操作日志：`wiki/log.md`