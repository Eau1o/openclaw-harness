---
title: Diffs
tags: [entity, tools]
sourcePath: sources/github/openclaw/docs/tools/diffs.md
ingestDate: 2026-04-13
type: documentation
---


# Diffs

`diffs` is an optional plugin tool with short built-in system guidance and a companion skill that turns change content into a read-only diff artifact for agents.

It accepts either:

- `before` and `after` text
- a unified `patch`

It can return:

- a gateway viewer URL for canvas presentation
- a rendered file path (PNG or PDF) for message delivery
- both outputs in one call

When enabled, the plugin prepends concise usage guidance into system-prompt space and also exposes a detailed skill for cases where the agent needs fuller instructions.

## Quick start

1. Enable the plugin.
2. Call `diffs` with `mode: "view"` for canvas-first flows.
3. Call `diffs` with `mode: "file"` for chat file delivery flows.
4. Call `diffs` with `mode: "both"` when you need both artifacts.

## Enable the plugin

```json5
{
  plugins: {
    entries: {
      diffs: {
        enabled: true,
      },
    },
  },
}
```

## Disable built-in system guidance

If you want to keep the `diffs` tool enabled but disable its built-in system-prompt guidance, set `plugins.entries.diffs.hooks.allowPromptInjection` to `false`:

```json5
{
  plugins: {
    entries: {
      diffs: {
        enabled: true,
        hooks: {
          allowPromptInjection: false,
        },
      },
    },
  },
}
```

This blocks the diffs plugin's `before_prompt_build` hook while keeping the plugin, tool, and companion skill available.

If you want to disable both the guidance and the tool, disable the plugin instead.

## Typical agent workflow

1. Agent calls `diffs`.
2. Agent reads `details` fields.
3. Agent either:
   - opens `details.viewerUrl` with `canvas present`
   - sends `details.filePath` with `message` using `path` or `filePath`
   - does both

## Input examples

Before and after:

```json
{
  "before": "# Hello\n\nOne",
  "after": "# Hello\n\nTwo",
  "path": "docs/example.md",
  "mode": "view"
}
```

Patch:

```json
{
  "patch": "diff --git a/src/example.ts b/src/example.ts\n--- a/src/example.ts\n+++ b/src/example.ts\n@@ -1 +1 @@\n-const x = 1;\n+const x = 2;\n",
  "mode": "both"
}
```

## Tool input reference

All fields are optional unless noted:

- `before` (`string`): original text. Required with `after` when `patch` is omitted.
- `after` (`string`): updated text. Required with `before` when `patch` is omitted.
- `patch` (`string`): unified diff text. Mutually exclusive with `before` and `after`.
- `path` (`string`): display filename for before and after mode.
- `lang` (`string`): language override hint for before and after mode. Unknown values fall back to plain text.
- `title` (`string`): viewer title override.
- `mode` (`"view" | "file" | "both"`): output mode. Defaults to plugin default `defaults.mode`.
  Deprecated alias: `"image"` behaves like `"file"` and is still accepted for backward compatibility.
- `theme` (`"light" | "dark"`): viewer theme. Defaults to plugin default `defaults.theme`.
- `layout` (`"unified" | "split"`): diff layout. Defaults to plugin default `defaults.layout`.
- `expandUnchanged` (`boolean`): expand unchanged sections when full context is available. Per-call option only (not a plugin default key).
- `fileFormat` (`"png" | "pdf"`): rendered file format. Defaults to plugin default `defaults.fileFormat`.
- `fileQuality` (`"standard" | "hq" | "print"`): quality preset for PNG or PDF rendering.
- `fileScale` (`number`): device scale override (`1`-`4`).
- `fileMaxWidth` (`number`): max render width in CSS pixels (`640`-`2400`).
- `ttlSeconds` (`number`): artifact TTL in seconds for viewer and standalone file outputs. Default 1800, max 21600.
- `baseUrl` (`string`): viewer URL origin override. Overrides plugin `viewerBaseUrl`. Must be `http` or `https`, no query/hash.

Legacy input aliases still accepted for backward compatibility:

- `format` -> `fileFormat`
- `imageFormat` -> `fileFormat`
- `imageQuality` -> `fileQuality`
- `imageScale` -> `fileScale`
- `imageMaxWidth` -> `fileMaxWidth`

Validation and limits:

- `before` and `after` each max 512 KiB.
- `patch` max 2 MiB.
- `path` max 2048 bytes.
- `lang` max 128 bytes.
- `title` max 1024 bytes.
- Patch complexity cap: max 128 files and 120000 total lines.
- `patch` and `before` or `after` together are rejected.
- Rendered file safety limits (apply to PNG and PDF):
  - `fileQuality: "standard"`: max 8 MP (8,000,000 rendered pixels).
  - `fileQuality: "hq"`: max 14 MP (14,000,000 rendered pixels).
  - `fileQuality: "print"`: max 24 MP (24,000,000 rendered pixels).
  - PDF also has a max of 50 pages.

## Output details contract

The tool returns structured metadata under `details`.

Shared fields for modes that create a viewer:

- `artifactId`
- `viewerUrl`
- `viewerPath`
- `title`
- `expiresAt`
- `inputKind`
- `fileCount`
- `mode`
- `context` (`agentId`, `sessionId`, `messageChannel`, `agentAccountId` when available)

File fields when PNG or PDF is rendered:

- `artifactId`
- `expiresAt`
- `filePath`
- `path` (same value as `filePath`, for message tool compatibility)
- `fileBytes`
- `fileFormat`
- `fileQuality`
- `fileScale`
- `fileMaxWidth`

Compatibility aliases also returned for existing callers:

- `format` (same value as `fileFormat`)
- `imagePath` (same value as `filePath`)
- `imageBytes` (same value as `fileBytes`)
- `imageQuality` (same value as `fileQuality`)
- `imageScale` (same value as `fileScale`)
- `imageMaxWidth` (same value as `fileMaxWidth`)

Mode behavior summary:

- `mode: "view"`: viewer fields only.
- `mode: "file"`: file fields only, no viewer artifact.
- `mode: "both"`: viewer fields plus file fields. If file rendering fails, viewer still returns with `fileError` and compatibility alias `imageError`.

## Collapsed unchanged sections

- The viewer can show rows like `N unmodified lines`.
- Expand controls on those rows are conditional and not guaranteed for every input kind.
- Expand controls appear when the rendered diff has expandable context data, which is typical for before and after input.
- For many unified patch inputs, omitted context bodies are not available in the parsed patch hunks, so the row can appear without expand controls. This is expected behavior.
- `expandUnchanged` applies only when expandable context exists.

## Plugin defaults

Set plugin-wide defaults in `~/.openclaw/openclaw.json`:

```json5
{
  plugins: {
    entries: {
      diffs: {
        enabled: true,
        config: {
          defaults: {
            fontFamily: "Fira Code",
            fontSize: 15,
            lineSpacing: 1.6,
            layout: "unified",
            showLineNumbers: true,
            diffIndicators: "bars",
            wordWrap: true,
            background: true,
            theme: "dark",
            fileFormat: "png",
            fileQuality: "standard",
            fileScale: 2,
            fileMaxWidth: 960,
            mode: "both",
          },
        },
      },
    },
  },
}
```

Supported defaults:

- `fontFamily`
- `fontSize`
- `lineSpacing`
- `layout`
- `showLineNumbers`
- `diffIndicators`
- `wordWrap`
- `background`
- `theme`
- `fileFormat`
- `fileQuality`
- `fileScale`
- `fileMaxWidth`
- `mode`

Explicit tool parameters override these defaults.

Persistent viewer URL config:

- `viewerBaseUrl` (`string`, optional)
  - Plugin-owned fallback for returned viewer links when a tool call does not pass `baseUrl`.
  - Must be `http` or `https`, no query/hash.

Example:

```json5
{
  plugins: {
    entries: {
      diffs: {
        enabled: true,
        config: {
          viewerBaseUrl: "https://gateway.example.com/openclaw",
        },
      },
    },
  },
}
```

## Security config

- `security.allowRemoteViewer` (`boolean`, default `false`)
  - `false`: non-loopback requests to viewer routes are denied.
  - `true`: remote viewers are allowed if tokenized path is valid.

Example:

```json5
{
  plugins: {
    entries: {
      diffs: {
        enabled: true,
        config: {
          security: {
            allowRemoteViewer: false,
          },
        },
      },
    },
  },
}
```

## Artifact lifecycle and storage

- Artifacts are stored under the temp subfolder: `$TMPDIR/openclaw-diffs`.
- Viewer artifact metadata contains:
  - random artifact ID (20 hex chars)
  - random token (48 hex chars)
  - `createdAt` and `expiresAt`
  - stored `viewer.html` path
- Default artifact TTL is 30 minutes when not specified.
- Maximum accepted viewer TTL is 6 hours.