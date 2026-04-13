---
title: `openclaw docs`
tags: [entity, cli]
sourcePath: sources/github/openclaw/docs/cli/docs.md
ingestDate: 2026-04-13
type: documentation
---


# `openclaw docs`

Search the live docs index.

Arguments:

- `[query...]`: search terms to send to the live docs index

Examples:

```bash
openclaw docs
openclaw docs browser existing-session
openclaw docs sandbox allowHostControl
openclaw docs gateway token secretref
```

Notes:

- With no query, `openclaw docs` opens the live docs search entrypoint.
- Multi-word queries are passed through as one search request.