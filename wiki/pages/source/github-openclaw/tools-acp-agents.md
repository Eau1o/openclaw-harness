---
title: ACP agents
tags: [entity, tools]
sourcePath: sources/github/openclaw/docs/tools/acp-agents.md
ingestDate: 2026-04-13
type: documentation
---


# ACP agents

[Agent Client Protocol (ACP)](https://agentclientprotocol.com/) sessions let OpenClaw run external coding harnesses (for example Pi, Claude Code, Codex, Cursor, Copilot, OpenClaw ACP, OpenCode, Gemini CLI, and other supported ACPX harnesses) through an ACP backend plugin.

If you ask OpenClaw in plain language to "run this in Codex" or "start Claude Code in a thread", OpenClaw should route that request to the ACP runtime (not the native sub-agent runtime). Each ACP session spawn is tracked as a [background task](/automation/tasks).

If you want Codex or Claude Code to connect as an external MCP client directly
to existing OpenClaw channel conversations, use [`openclaw mcp serve`](/cli/mcp)
instead of ACP.

## Which page do I want?

There are three nearby surfaces that are easy to confuse:

| You want to...                                                                     | Use this                              | Notes                                                                                                       |
| ---------------------------------------------------------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Run Codex, Claude Code, Gemini CLI, or another external harness _through_ OpenClaw | This page: ACP agents                 | Chat-bound sessions, `/acp spawn`, `sessions_spawn({ runtime: "acp" })`, background tasks, runtime controls |
| Expose an OpenClaw Gateway session _as_ an ACP server for an editor or client      | [`openclaw acp`](/cli/acp)            | Bridge mode. IDE/client talks ACP to OpenClaw over stdio/WebSocket                                          |
| Reuse a local AI CLI as a text-only fallback model                                 | [CLI Backends](/gateway/cli-backends) | Not ACP. No OpenClaw tools, no ACP controls, no harness runtime                                             |

## Does this work out of the box?

Usually, yes.

- Fresh installs now ship the bundled `acpx` runtime plugin enabled by default.
- The bundled `acpx` plugin prefers its plugin-local pinned `acpx` binary.
- On startup, OpenClaw probes that binary and self-repairs it if needed.
- Start with `/acp doctor` if you want a fast readiness check.

What can still happen on first use:

- A target harness adapter may be fetched on demand with `npx` the first time you use that harness.
- Vendor auth still has to exist on the host for that harness.
- If the host has no npm/network access, first-run adapter fetches can fail until caches are pre-warmed or the adapter is installed another way.

Examples:

- `/acp spawn codex`: OpenClaw should be ready to bootstrap `acpx`, but the Codex ACP adapter may still need a first-run fetch.
- `/acp spawn claude`: same story for the Claude ACP adapter, plus Claude-side auth on that host.

## Fast operator flow

Use this when you want a practical `/acp` runbook:

1. Spawn a session:
   - `/acp spawn codex --bind here`
   - `/acp spawn codex --mode persistent --thread auto`
2. Work in the bound conversation or thread (or target that session key explicitly).
3. Check runtime state:
   - `/acp status`
4. Tune runtime options as needed:
   - `/acp model <provider/model>`
   - `/acp permissions <profile>`
   - `/acp timeout <seconds>`
5. Nudge an active session without replacing context:
   - `/acp steer tighten logging and continue`
6. Stop work:
   - `/acp cancel` (stop current turn), or
   - `/acp close` (close session + remove bindings)

## Quick start for humans

Examples of natural requests:

- "Bind this Discord channel to Codex."
- "Start a persistent Codex session in a thread here and keep it focused."
- "Run this as a one-shot Claude Code ACP session and summarize the result."
- "Bind this iMessage chat to Codex and keep follow-ups in the same workspace."
- "Use Gemini CLI for this task in a thread, then keep follow-ups in that same thread."

What OpenClaw should do:

1. Pick `runtime: "acp"`.
2. Resolve the requested harness target (`agentId`, for example `codex`).
3. If current-conversation binding is requested and the active channel supports it, bind the ACP session to that conversation.
4. Otherwise, if thread binding is requested and the current channel supports it, bind the ACP session to the thread.
5. Route follow-up bound messages to that same ACP session until unfocused/closed/expired.

## ACP versus sub-agents

Use ACP when you want an external harness runtime. Use sub-agents when you want OpenClaw-native delegated runs.

| Area          | ACP session                           | Sub-agent run                      |
| ------------- | ------------------------------------- | ---------------------------------- |
| Runtime       | ACP backend plugin (for example acpx) | OpenClaw native sub-agent runtime  |
| Session key   | `agent:<agentId>:acp:<uuid>`          | `agent:<agentId>:subagent:<uuid>`  |
| Main commands | `/acp ...`                            | `/subagents ...`                   |
| Spawn tool    | `sessions_spawn` with `runtime:"acp"` | `sessions_spawn` (default runtime) |

See also [Sub-agents](/tools/subagents).

## How ACP runs Claude Code

For Claude Code through ACP, the stack is:

1. OpenClaw ACP session control plane
2. bundled `acpx` runtime plugin
3. Claude ACP adapter
4. Claude-side runtime/session machinery

Important distinction:

- ACP Claude is a harness session with ACP controls, session resume, background-task tracking, and optional conversation/thread binding.
- CLI backends are separate text-only local fallback runtimes. See [CLI Backends](/gateway/cli-backends).

For operators, the practical rule is:

- want `/acp spawn`, bindable sessions, runtime controls, or persistent harness work: use ACP
- want simple local text fallback through the raw CLI: use CLI backends

## Bound sessions

### Current-conversation binds

Use `/acp spawn <harness> --bind here` when you want the current conversation to become a durable ACP workspace without creating a child thread.

Behavior:

- OpenClaw keeps owning the channel transport, auth, safety, and delivery.
- The current conversation is pinned to the spawned ACP session key.
- Follow-up messages in that conversation route to the same ACP session.
- `/new` and `/reset` reset the same bound ACP session in place.
- `/acp close` closes the session and removes the current-conversation binding.

What this means in practice:

- `--bind here` keeps the same chat surface. On Discord, the current channel stays the current channel.
- `--bind here` can still create a new ACP session if you are spawning fresh work. The bind attaches that session to the current conversation.
- `--bind here` does not create a child Discord thread or Telegram topic by itself.
- The ACP runtime can still have its own working directory (`cwd`) or backend-managed workspace on disk. That runtime workspace is separate from the chat surface and does not imply a new messaging thread.
- If you spawn to a different ACP agent and do not pass `--cwd`, OpenClaw inherits the **target agent's** workspace by default, not the requester's.
- If that inherited workspace path is missing (`ENOENT`/`ENOTDIR`), OpenClaw falls back to the backend default cwd instead of silently reusing the wrong tree.
- If the inherited workspace exists but cannot be accessed (for example `EACCES`), spawn returns the real access error instead of dropping `cwd`.

Mental model:

- chat surface: where people keep talking (`Discord channel`, `Telegram topic`, `iMessage chat`)
- ACP session: the durable Codex/Claude/Gemini runtime state OpenClaw routes to
- child thread/topic: an optional extra messaging surface created only by `--thread ...`
- runtime workspace: the filesystem location where the harness runs (`cwd`, repo checkout, backend workspace)

Examples:

- `/acp spawn codex --bind here`: keep this chat, spawn or attach a Codex ACP session, and route future messages here to it
- `/acp spawn codex --thread auto`: OpenClaw may create a child thread/topic and bind the ACP session there
- `/acp spawn codex --bind here --cwd /workspace/repo`: same chat binding as above, but Codex runs in `/workspace/repo`

Current-conversation binding support:

- Chat/message channels that advertise current-conversation binding support can use `--bind here` through the shared conversation-binding path.
- Channels with custom thread/topic semantics can still provide channel-specific canonicalization behind the same shared interface.
- `--bind here` always means "bind the current conversation in place".
- Generic current-conversation binds use the shared OpenClaw binding store and survive normal gateway restarts.

Notes:

- `--bind here` and `--thread ...` are mutually exclusive on `/acp spawn`.
- On Discord, `--bind here` binds the current channel or thread in place. `spawnAcpSessions` is only required when OpenClaw needs to create a child thread for `--thread auto|here`.
- If the active channel does not expose current-conversation ACP bindings, OpenClaw returns a clear unsupported message.
- `resume` and "new session" questions are ACP-session questions, not channel questions. You can reuse or replace runtime state without changing the current chat surface.

### Thread-bound sessions

When thread bindings are enabled for a channel adapter, ACP sessions can be bound to threads:

- OpenClaw binds a thread to a target ACP session.
- Follow-up messages in that thread route to the bound ACP session.
- ACP output is delivered back to the same thread.
- Unfocus/close/archive/idle-timeout or max-age expiry removes the binding.

Thread binding support is adapter-specific. If the active channel adapter does not support thread bindings, OpenClaw returns a clear unsupported/unavailable message.

Required feature flags for thread-bound ACP:

- `acp.enabled=true`
- `acp.dispatch.enabled` is on by default (set `false` to pause ACP dispatch)
- Channel-adapter ACP thread-spawn flag enabled (adapter-specific)
  - Discord: `channels.discord.threadBindings.spawnAcpSessions=true`
  - Telegram: `channels.telegram.threadBindings.spawnAcpSessions=true`

### Thread supporting channels

- Any channel adapter that exposes session/thread binding capability.
- Current built-in support:
  - Discord threads/channels
  - Telegram topics (forum topics in groups/supergroups and DM topics)
- Plugin channels can add support through the same binding interface.

## Channel specific settings

For non-ephemeral workflows, configure persistent ACP bindings in top-level `bindings[]` entries.

### Binding model

- `bindings[].type="acp"` marks a persistent ACP conversation binding.
- `bindings[].match` identifies the target conversation:
  - Discord channel or thread: `match.channel="discord"` + `match.peer.id="<channelOrThreadId>"`
  - Telegram forum topic: `match.channel="telegram"` + `match.peer.id="<chatId>:topic:<topicId>"`
  - BlueBubbles DM/group chat: `match.channel="bluebubbles"` + `match.peer.id="<handle|chat_id:*|chat_guid:*|chat_identifier:*>"`
    Prefer `chat_id:*` or `chat_identifier:*` for stable group bindings.
  - iMessage DM/group chat: `match.channel="imessage"` + `match.peer.id="<handle|chat_id:*|chat_guid:*|chat_identifier:*>"`
    Prefer `chat_id:*` for stable group bindings.
- `bindings[].agentId` is the owning OpenClaw agent id.
- Optional ACP overrides live under `bindings[].acp`:
  - `mode` (`persistent` or `oneshot`)
  - `label`
  - `cwd`
  - `backend`

### Runtime defaults per agent

Use `agents.list[].runtime` to define ACP defaults once per agent:

- `agents.list[].runtime.type="acp"`
- `agents.list[].runtime.acp.agent` (harness id, for example `codex` or `claude`)
- `agents.list[].runtime.acp.backend`
- `agents.list[].runtime.acp.mode`
- `agents.list[].runtime.acp.cwd`

Override precedence for ACP bound sessions:

1. `bindings[].acp.*`
2. `agents.list[].runtime.acp.*`
3. global ACP defaults (for example `acp.backend`)

Example:

```json5
{
  agents: {
    list: [
      {
        id: "codex",
        runtime: {
          type: "acp",
          acp: {
            agent: "codex",
            backend: "acpx",
            mode: "persistent",
            cwd: "/workspace/openclaw",
          },
        },
      },
      {
        id: "claude",
        runtime: {
          type: "acp",
          acp: { agent: "claude", backend: "acpx", mode: "persistent" },
        },
      },
    ],
  },
  bindings: [
    {
      type: "acp",
      agentId: "codex",
      match: {
        channel: "discord",
        accountId: "default",
        peer: { kind: "channel", id: "222222222222222222" },
      },
      acp: { label: "codex-main" },
    },
    {
      type: "acp",
      agentId: "claude",
      match: {
        channel: "telegram",
        accountId: "default",
        peer: { kind: "group", id: "-1001234567890:topic:42" },
      },
      acp: { cwd: "/workspace/repo-b" },
    },
    {
      type: "route",
      agentId: "main",
      match: { channel: "discord", accountId: "default" },
    },
    {
      type: "route",
      agentId: "main",
      match: { channel: "telegram", accountId: "default" },
    },
  ],
  channels: {
    discord: {
      guilds: {
        "111111111111111111": {
          channels: {
            "222222222222222222": { requireMention: false },
          },
        },
      },
    },
    telegram: {
      groups: {
        "-1001234567890": {
          topics: { "42": { requireMention: false } },
        },