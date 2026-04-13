---
title: Codex Harness
tags: [entity, plugins]
sourcePath: sources/github/openclaw/docs/plugins/codex-harness.md
ingestDate: 2026-04-13
type: documentation
---


# Codex Harness

The bundled `codex` plugin lets OpenClaw run embedded agent turns through the
Codex app-server instead of the built-in PI harness.

Use this when you want Codex to own the low-level agent session: model
discovery, native thread resume, native compaction, and app-server execution.
OpenClaw still owns chat channels, session files, model selection, tools,
approvals, media delivery, and the visible transcript mirror.

The harness is off by default. It is selected only when the `codex` plugin is
enabled and the resolved model is a `codex/*` model, or when you explicitly
force `embeddedHarness.runtime: "codex"` or `OPENCLAW_AGENT_RUNTIME=codex`.
If you never configure `codex/*`, existing PI, OpenAI, Anthropic, Gemini, local,
and custom-provider runs keep their current behavior.

## Pick the right model prefix

OpenClaw has separate routes for OpenAI and Codex-shaped access:

| Model ref              | Runtime path                                 | Use when                                                                |
| ---------------------- | -------------------------------------------- | ----------------------------------------------------------------------- |
| `openai/gpt-5.4`       | OpenAI provider through OpenClaw/PI plumbing | You want direct OpenAI Platform API access with `OPENAI_API_KEY`.       |
| `openai-codex/gpt-5.4` | OpenAI Codex OAuth provider through PI       | You want ChatGPT/Codex OAuth without the Codex app-server harness.      |
| `codex/gpt-5.4`        | Bundled Codex provider plus Codex harness    | You want native Codex app-server execution for the embedded agent turn. |

The Codex harness only claims `codex/*` model refs. Existing `openai/*`,
`openai-codex/*`, Anthropic, Gemini, xAI, local, and custom provider refs keep
their normal paths.

## Requirements

- OpenClaw with the bundled `codex` plugin available.
- Codex app-server `0.118.0` or newer.
- Codex auth available to the app-server process.

The plugin blocks older or unversioned app-server handshakes. That keeps
OpenClaw on the protocol surface it has been tested against.

For live and Docker smoke tests, auth usually comes from `OPENAI_API_KEY`, plus
optional Codex CLI files such as `~/.codex/auth.json` and
`~/.codex/config.toml`. Use the same auth material your local Codex app-server
uses.

## Minimal config

Use `codex/gpt-5.4`, enable the bundled plugin, and force the `codex` harness:

```json5
{
  plugins: {
    entries: {
      codex: {
        enabled: true,
      },
    },
  },
  agents: {
    defaults: {
      model: "codex/gpt-5.4",
      embeddedHarness: {
        runtime: "codex",
        fallback: "none",
      },
    },
  },
}
```

If your config uses `plugins.allow`, include `codex` there too:

```json5
{
  plugins: {
    allow: ["codex"],
    entries: {
      codex: {
        enabled: true,
      },
    },
  },
}
```

Setting `agents.defaults.model` or an agent model to `codex/<model>` also
auto-enables the bundled `codex` plugin. The explicit plugin entry is still
useful in shared configs because it makes the deployment intent obvious.

## Add Codex without replacing other models

Keep `runtime: "auto"` when you want Codex for `codex/*` models and PI for
everything else:

```json5
{
  plugins: {
    entries: {
      codex: {
        enabled: true,
      },
    },
  },
  agents: {
    defaults: {
      model: {
        primary: "codex/gpt-5.4",
        fallbacks: ["openai/gpt-5.4", "anthropic/claude-opus-4-6"],
      },
      models: {
        "codex/gpt-5.4": { alias: "codex" },
        "codex/gpt-5.4-mini": { alias: "codex-mini" },
        "openai/gpt-5.4": { alias: "gpt" },
        "anthropic/claude-opus-4-6": { alias: "opus" },
      },
      embeddedHarness: {
        runtime: "auto",
        fallback: "pi",
      },
    },
  },
}
```

With this shape:

- `/model codex` or `/model codex/gpt-5.4` uses the Codex app-server harness.
- `/model gpt` or `/model openai/gpt-5.4` uses the OpenAI provider path.
- `/model opus` uses the Anthropic provider path.
- If a non-Codex model is selected, PI remains the compatibility harness.

## Codex-only deployments

Disable PI fallback when you need to prove that every embedded agent turn uses
the Codex harness:

```json5
{
  agents: {
    defaults: {
      model: "codex/gpt-5.4",
      embeddedHarness: {
        runtime: "codex",
        fallback: "none",
      },
    },
  },
}
```

Environment override:

```bash
OPENCLAW_AGENT_RUNTIME=codex \
OPENCLAW_AGENT_HARNESS_FALLBACK=none \
openclaw gateway run
```

With fallback disabled, OpenClaw fails early if the Codex plugin is disabled,
the requested model is not a `codex/*` ref, the app-server is too old, or the
app-server cannot start.

## Per-agent Codex

You can make one agent Codex-only while the default agent keeps normal
auto-selection:

```json5
{
  agents: {
    defaults: {
      embeddedHarness: {
        runtime: "auto",
        fallback: "pi",
      },
    },
    list: [
      {
        id: "main",
        default: true,
        model: "anthropic/claude-opus-4-6",
      },
      {
        id: "codex",
        name: "Codex",
        model: "codex/gpt-5.4",
        embeddedHarness: {
          runtime: "codex",
          fallback: "none",
        },
      },
    ],
  },
}
```

Use normal session commands to switch agents and models. `/new` creates a fresh
OpenClaw session and the Codex harness creates or resumes its sidecar app-server
thread as needed. `/reset` clears the OpenClaw session binding for that thread.

## Model discovery

By default, the Codex plugin asks the app-server for available models. If
discovery fails or times out, it uses the bundled fallback catalog:

- `codex/gpt-5.4`
- `codex/gpt-5.4-mini`
- `codex/gpt-5.2`

You can tune discovery under `plugins.entries.codex.config.discovery`:

```json5
{
  plugins: {
    entries: {
      codex: {
        enabled: true,
        config: {
          discovery: {
            enabled: true,
            timeoutMs: 2500,
          },
        },
      },
    },
  },
}
```

Disable discovery when you want startup to avoid probing Codex and stick to the
fallback catalog:

```json5
{
  plugins: {
    entries: {
      codex: {
        enabled: true,
        config: {
          discovery: {
            enabled: false,
          },
        },
      },
    },
  },
}
```

## App-server connection and policy

By default, the plugin starts Codex locally with:

```bash
codex app-server --listen stdio://
```

You can keep that default and only tune Codex native policy:

```json5
{
  plugins: {
    entries: {
      codex: {
        enabled: true,
        config: {
          appServer: {
            approvalPolicy: "on-request",
            sandbox: "workspace-write",
            serviceTier: "priority",
          },
        },
      },
    },
  },
}
```

For an already-running app-server, use WebSocket transport:

```json5
{
  plugins: {
    entries: {
      codex: {
        enabled: true,
        config: {
          appServer: {
            transport: "websocket",
            url: "ws://127.0.0.1:39175",
            authToken: "${CODEX_APP_SERVER_TOKEN}",
            requestTimeoutMs: 60000,
          },
        },
      },
    },
  },
}
```
