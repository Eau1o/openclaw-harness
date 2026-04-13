---
title: Exec approvals
tags: [entity, tools]
sourcePath: sources/github/openclaw/docs/tools/exec-approvals.md
ingestDate: 2026-04-13
type: documentation
---


# Exec approvals

Exec approvals are the **companion app / node host guardrail** for letting a sandboxed agent run
commands on a real host (`gateway` or `node`). Think of it like a safety interlock:
commands are allowed only when policy + allowlist + (optional) user approval all agree.
Exec approvals are **in addition** to tool policy and elevated gating (unless elevated is set to `full`, which skips approvals).
Effective policy is the **stricter** of `tools.exec.*` and approvals defaults; if an approvals field is omitted, the `tools.exec` value is used.
Host exec also uses the local approvals state on that machine. A host-local
`ask: "always"` in `~/.openclaw/exec-approvals.json` keeps prompting even if
session or config defaults request `ask: "on-miss"`.
Use `openclaw approvals get`, `openclaw approvals get --gateway`, or
`openclaw approvals get --node <id|name|ip>` to inspect the requested policy,
host policy sources, and the effective result.
For the local machine, `openclaw exec-policy show` exposes the same merged view and
`openclaw exec-policy set|preset` can synchronize the local requested policy with the
local host approvals file in one step. When a local scope requests `host=node`,
`openclaw exec-policy show` reports that scope as node-managed at runtime instead of
pretending the local approvals file is the effective source of truth.

If the companion app UI is **not available**, any request that requires a prompt is
resolved by the **ask fallback** (default: deny).

Native chat approval clients can also expose channel-specific affordances on the
pending approval message. For example, Matrix can seed reaction shortcuts on the
approval prompt (`✅` allow once, `❌` deny, and `♾️` allow always when available)
while still leaving the `/approve ...` commands in the message as a fallback.

## Where it applies

Exec approvals are enforced locally on the execution host:

- **gateway host** → `openclaw` process on the gateway machine
- **node host** → node runner (macOS companion app or headless node host)

Trust model note:

- Gateway-authenticated callers are trusted operators for that Gateway.
- Paired nodes extend that trusted operator capability onto the node host.
- Exec approvals reduce accidental execution risk, but are not a per-user auth boundary.
- Approved node-host runs bind canonical execution context: canonical cwd, exact argv, env
  binding when present, and pinned executable path when applicable.
- For shell scripts and direct interpreter/runtime file invocations, OpenClaw also tries to bind
  one concrete local file operand. If that bound file changes after approval but before execution,
  the run is denied instead of executing drifted content.
- This file binding is intentionally best-effort, not a complete semantic model of every
  interpreter/runtime loader path. If approval mode cannot identify exactly one concrete local
  file to bind, it refuses to mint an approval-backed run instead of pretending full coverage.

macOS split:

- **node host service** forwards `system.run` to the **macOS app** over local IPC.
- **macOS app** enforces approvals + executes the command in UI context.

## Settings and storage

Approvals live in a local JSON file on the execution host:

`~/.openclaw/exec-approvals.json`

Example schema:

```json
{
  "version": 1,
  "socket": {
    "path": "~/.openclaw/exec-approvals.sock",
    "token": "base64url-token"
  },
  "defaults": {
    "security": "deny",
    "ask": "on-miss",
    "askFallback": "deny",
    "autoAllowSkills": false
  },
  "agents": {
    "main": {
      "security": "allowlist",
      "ask": "on-miss",
      "askFallback": "deny",
      "autoAllowSkills": true,
      "allowlist": [
        {
          "id": "B0C8C0B3-2C2D-4F8A-9A3C-5A4B3C2D1E0F",
          "pattern": "~/Projects/**/bin/rg",
          "lastUsedAt": 1737150000000,
          "lastUsedCommand": "rg -n TODO",
          "lastResolvedPath": "/Users/user/Projects/.../bin/rg"
        }
      ]
    }
  }
}
```

## No-approval "YOLO" mode

If you want host exec to run without approval prompts, you must open **both** policy layers:

- requested exec policy in OpenClaw config (`tools.exec.*`)
- host-local approvals policy in `~/.openclaw/exec-approvals.json`

This is now the default host behavior unless you tighten it explicitly:

- `tools.exec.security`: `full` on `gateway`/`node`
- `tools.exec.ask`: `off`
- host `askFallback`: `full`

Important distinction:

- `tools.exec.host=auto` chooses where exec runs: sandbox when available, otherwise gateway.
- YOLO chooses how host exec is approved: `security=full` plus `ask=off`.
- In YOLO mode, OpenClaw does not add a separate heuristic command-obfuscation approval gate on top of the configured host exec policy.
- `auto` does not make gateway routing a free override from a sandboxed session. A per-call `host=node` request is allowed from `auto`, and `host=gateway` is only allowed from `auto` when no sandbox runtime is active. If you want a stable non-auto default, set `tools.exec.host` or use `/exec host=...` explicitly.

If you want a more conservative setup, tighten either layer back to `allowlist` / `on-miss`
or `deny`.

Persistent gateway-host "never prompt" setup:

```bash
openclaw config set tools.exec.host gateway
openclaw config set tools.exec.security full
openclaw config set tools.exec.ask off
openclaw gateway restart
```

Then set the host approvals file to match:

```bash
openclaw approvals set --stdin <<'EOF'
{
  version: 1,
  defaults: {
    security: "full",
    ask: "off",
    askFallback: "full"
  }
}
EOF
```

Local shortcut for the same gateway-host policy on the current machine:

```bash
openclaw exec-policy preset yolo
```

That local shortcut updates both:

- local `tools.exec.host/security/ask`
- local `~/.openclaw/exec-approvals.json` defaults

It is intentionally local-only. If you need to change gateway-host or node-host approvals
remotely, continue using `openclaw approvals set --gateway` or
`openclaw approvals set --node <id|name|ip>`.

For a node host, apply the same approvals file on that node instead:

```bash
openclaw approvals set --node <id|name|ip> --stdin <<'EOF'
{
  version: 1,
  defaults: {
    security: "full",
    ask: "off",
    askFallback: "full"
  }
}
EOF
```

Important local-only limitation:

- `openclaw exec-policy` does not synchronize node approvals
- `openclaw exec-policy set --host node` is rejected
- node exec approvals are fetched from the node at runtime, so node-targeted updates must use `openclaw approvals --node ...`

Session-only shortcut:

- `/exec security=full ask=off` changes only the current session.
- `/elevated full` is a break-glass shortcut that also skips exec approvals for that session.

If the host approvals file stays stricter than config, the stricter host policy still wins.

## Policy knobs

### Security (`exec.security`)

- **deny**: block all host exec requests.
- **allowlist**: allow only allowlisted commands.
- **full**: allow everything (equivalent to elevated).

### Ask (`exec.ask`)

- **off**: never prompt.
- **on-miss**: prompt only when allowlist does not match.
- **always**: prompt on every command.
- `allow-always` durable trust does not suppress prompts when effective ask mode is `always`

### Ask fallback (`askFallback`)

If a prompt is required but no UI is reachable, fallback decides:

- **deny**: block.
- **allowlist**: allow only if allowlist matches.
- **full**: allow.

### Inline interpreter eval hardening (`tools.exec.strictInlineEval`)

When `tools.exec.strictInlineEval=true`, OpenClaw treats inline code-eval forms as approval-only even if the interpreter binary itself is allowlisted.

Examples:

- `python -c`
- `node -e`, `node --eval`, `node -p`
- `ruby -e`
- `perl -e`, `perl -E`
- `php -r`
- `lua -e`
- `osascript -e`

This is defense-in-depth for interpreter loaders that do not map cleanly to one stable file operand. In strict mode:

- these commands still need explicit approval;
- `allow-always` does not persist new allowlist entries for them automatically.

## Allowlist (per agent)

Allowlists are **per agent**. If multiple agents exist, switch which agent you’re
editing in the macOS app. Patterns are **case-insensitive glob matches**.
Patterns should resolve to **binary paths** (basename-only entries are ignored).
Legacy `agents.default` entries are migrated to `agents.main` on load.
Shell chains such as `echo ok && pwd` still need every top-level segment to satisfy allowlist rules.

Examples:

- `~/Projects/**/bin/peekaboo`
- `~/.local/bin/*`
- `/opt/homebrew/bin/rg`

Each allowlist entry tracks:

- **id** stable UUID used for UI identity (optional)
- **last used** timestamp
- **last used command**
- **last resolved path**

## Auto-allow skill CLIs

When **Auto-allow skill CLIs** is enabled, executables referenced by known skills
are treated as allowlisted on nodes (macOS node or headless node host). This uses
`skills.bins` over the Gateway RPC to fetch the skill bin list. Disable this if you want strict manual allowlists.

Important trust notes:

- This is an **implicit convenience allowlist**, separate from manual path allowlist entries.
- It is intended for trusted operator environments where Gateway and node are in the same trust boundary.
- If you require strict explicit trust, keep `autoAllowSkills: false` and use manual path allowlist entries only.

## Safe bins (stdin-only)

`tools.exec.safeBins` defines a small list of **stdin-only** binaries (for example `cut`)
that can run in allowlist mode **without** explicit allowlist entries. Safe bins reject
positional file args and path-like tokens, so they can only operate on the incoming stream.
Treat this as a narrow fast-path for stream filters, not a general trust list.
Do **not** add interpreter or runtime binaries (for example `python3`, `node`, `ruby`, `bash`, `sh`, `zsh`) to `safeBins`.
If a command can evaluate code, execute subcommands, or read files by design, prefer explicit allowlist entries and keep approval prompts enabled.
Custom safe bins must define an explicit profile in `tools.exec.safeBinProfiles.<bin>`.
Validation is deterministic from argv shape only (no host filesystem existence checks), which
prevents file-existence oracle behavior from allow/deny differences.
File-oriented options are denied for default safe bins (for example `sort -o`, `sort --output`,
`sort --files0-from`, `sort --compress-program`, `sort --random-source`,
`sort --temporary-directory`/`-T`, `wc --files0-from`, `jq -f/--from-file`,
`grep -f/--file`).
Safe bins also enforce explicit per-binary flag policy for options that break stdin-only
behavior (for example `sort -o/--output/--compress-program` and grep recursive flags).
Long options are validated fail-closed in safe-bin mode: unknown flags and ambiguous
abbreviations are rejected.
Denied flags by safe-bin profile:

[//]: # "SAFE_BIN_DENIED_FLAGS:START"

- `grep`: `--dereference-recursive`, `--directories`, `--exclude-from`, `--file`, `--recursive`, `-R`, `-d`, `-f`, `-r`
- `jq`: `--argfile`, `--from-file`, `--library-path`, `--rawfile`, `--slurpfile`, `-L`, `-f`
- `sort`: `--compress-program`, `--files0-from`, `--output`, `--random-source`, `--temporary-directory`, `-T`, `-o`
- `wc`: `--files0-from`

[//]: # "SAFE_BIN_DENIED_FLAGS:END"

Safe bins also force argv tokens to be treated as **literal text** at execution time (no globbing
and no `$VARS` expansion) for stdin-only segments, so patterns like `*` or `$HOME/...` cannot be
used to smuggle file reads.
Safe bins must also resolve from trusted binary directories (system defaults plus optional
`tools.exec.safeBinTrustedDirs`). `PATH` entries are never auto-trusted.
Default trusted safe-bin directories are intentionally minimal: `/bin`, `/usr/bin`.
If your safe-bin executable lives in package-manager/user paths (for example
`/opt/homebrew/bin`, `/usr/local/bin`, `/opt/local/bin`, `/snap/bin`), add them explicitly
to `tools.exec.safeBinTrustedDirs`.
Shell chaining and redirections are not auto-allowed in allowlist mode.