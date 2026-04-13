# Wiki 知识库 — 进阶技巧

## 摄入技巧

### 批量摄入

```
摄入这个目录下的所有 pdf：~/Documents/papers/
```

批量摄入时 AI 会逐个处理，每完成一个会报告进度。

### 带优先级的摄入

```
先摄入这三篇：URL1, URL2, URL3
重点关注其中的 [具体问题] 相关内容
```

### 来源标注

如果 article 有 DOI、arxiv ID 或版本号，AI 会自动记录，方便后续引用。

---

## 查询技巧

### 限定范围

```
只在 concept 里查"注意力机制"
查 entity 里关于 [公司名] 的所有信息
```

### 组合查询

```
查一下 [主题]，然后把分析写回 wiki
```

AI 会先回答，再问你要不要保存。

### 对比查询

```
对比一下 [A] 和 [B] 在 [维度] 上的差异
```

AI 会生成对比表格，并写回 wiki 作为 synthesis。

---

## 维护技巧

### 定期体检

建议每周触发一次 `wiki-lint`，保持 wiki 健康。

### 矛盾处理

当 AI 报告矛盾时，告诉它：
- "A 来源更可靠，用 A 的说法"
- "两者都是对的，它们适用不同场景"
- "这个问题不需要解决，保留矛盾标注"

### 页面合并

如果两个页面高度重叠，告诉 AI：
```
[[entity/aaa]] 和 [[entity/bbb]] 是同一个东西，合并到 [目标页面]
```

---

## Obsidian 配合使用

### 实时浏览

摄入后说"打开 Obsidian"，在 graph view 中可以看到 wiki 的连接结构。

### 手动补充

你可以在 Obsidian 中直接编辑页面，AI 下次摄入时会识别并尊重你的修改。

### 图片处理

安装 Obsidian Web Clipper，clip 文章时用 Ctrl+Shift+D 下载图片到本地。

---

## 常见问题

### Q: wiki 太大了会慢吗？

A: 目前用 `_index.md` + grep 搜索在几百页内都很高效。超过 1000 页后建议加 qmd 搜索。

### Q: 可以导入已有的 Obsidian 笔记吗？

A: 可以，把笔记当作 source 摄入即可。AI 会提取内容并整合。

### Q: 可以只查 memory 不查 wiki 吗？

A: 目前的 query 逻辑是 wiki 优先。如果想只查 memory，用"查一下 memory"。

---

## 生态工具

| 工具 | 用途 |
|------|------|
| Obsidian Web Clipper | 快速收集网页文章 |
| qmd | 语义搜索（可选，大规模 wiki 用） |
| Marp | 生成幻灯片（从 wiki 内容） |
| Dataview | 动态查询（Obsidian 插件） |

---

## 相关文档

- [[GETTING_STARTED]] — 快速入门
- `WIKI.md` — 完整架构规范
