---
title: Doctor
tags: [concept, gateway]
sourcePath: sources/github/openclaw/docs/gateway/doctor.md
ingestDate: 2026-04-13
type: documentation
---


# Doctor

`openclaw doctor` is the repair + migration tool for OpenClaw. It fixes stale
config/state, checks health, and provides actionable repair steps.

## Quick start

```bash
openclaw doctor
```

### Headless / automation

```bash
openclaw doctor --yes
```

Accept defaults without prompting (including restart/service/sandbox repair steps when applicable).

```bash
openclaw doctor --repair
```

Apply recommended repairs without prompting (repairs + restarts where safe).

```bash
openclaw doctor --repair --force
```

Apply aggressive repairs too (overwrites custom supervisor configs).

```bash
openclaw doctor --non-interactive
```

Run without prompts and only apply safe migrations (config normalization + on-disk state moves). Skips restart/service/sandbox actions that require human confirmation.
Legacy state migrations run automatically when detected.

```bash
openclaw doctor --deep
```

Scan system services for extra gateway installs (launchd/systemd/schtasks).

If you want to review changes before writing, open the config file first:

```bash
cat ~/.openclaw/openclaw.json
```

## What it does (summary)

- Optional pre-flight update for git installs (interactive only).
- UI protocol freshness check (rebuilds Control UI when the protocol schema is newer).
- Health check + restart prompt.
- Skills status summary (eligible/missing/blocked) and plugin status.
- Config normalization for legacy values.
- Talk config migration from legacy flat `talk.*` fields into `talk.provider` + `talk.providers.<provider>`.
- Browser migration checks for legacy Chrome extension configs and Chrome MCP readiness.
- OpenCode provider override warnings (`models.providers.opencode` / `models.providers.opencode-go`).
- Codex OAuth shadowing warnings (`models.providers.openai-codex`).
- OAuth TLS prerequisites check for OpenAI Codex OAuth profiles.
- Legacy on-disk state migration (sessions/agent dir/WhatsApp auth).
- Legacy plugin manifest contract key migration (`speechProviders`, `realtimeTranscriptionProviders`, `realtimeVoiceProviders`, `mediaUnderstandingProviders`, `imageGenerationProviders`, `videoGenerationProviders`, `webFetchProviders`, `webSearchProviders` → `contracts`).
- Legacy cron store migration (`jobId`, `schedule.cron`, top-level delivery/payload fields, payload `provider`, simple `notify: true` webhook fallback jobs).
- Session lock file inspection and stale lock cleanup.
- State integrity and permissions checks (sessions, transcripts, state dir).
- Config file permission checks (chmod 600) when running locally.
- Model auth health: checks OAuth expiry, can refresh expiring tokens, and reports auth-profile cooldown/disabled states.
- Extra workspace dir detection (`~/openclaw`).
- Sandbox image repair when sandboxing is enabled.
- Legacy service migration and extra gateway detection.
- Matrix channel legacy state migration (in `--fix` / `--repair` mode).
- Gateway runtime checks (service installed but not running; cached launchd label).
- Channel status warnings (probed from the running gateway).
- Supervisor config audit (launchd/systemd/schtasks) with optional repair.
- Gateway runtime best-practice checks (Node vs Bun, version-manager paths).
- Gateway port collision diagnostics (default `18789`).
- Security warnings for open DM policies.
- Gateway auth checks for local token mode (offers token generation when no token source exists; does not overwrite token SecretRef configs).
- systemd linger check on Linux.
- Workspace bootstrap file size check (truncation/near-limit warnings for context files).
- Shell completion status check and auto-install/upgrade.
- Memory search embedding provider readiness check (local model, remote API key, or QMD binary).
- Source install checks (pnpm workspace mismatch, missing UI assets, missing tsx binary).
- Writes updated config + wizard metadata.

## Dreams UI backfill and reset

The Control UI Dreams scene includes **Backfill**, **Reset**, and **Clear Grounded**
actions for the grounded dreaming workflow. These actions use gateway
doctor-style RPC methods, but they are **not** part of `openclaw doctor` CLI
repair/migration.

What they do:

- **Backfill** scans historical `memory/YYYY-MM-DD.md` files in the active
  workspace, runs the grounded REM diary pass, and writes reversible backfill
  entries into `DREAMS.md`.
- **Reset** removes only those marked backfill diary entries from `DREAMS.md`.
- **Clear Grounded** removes only staged grounded-only short-term entries that
  came from historical replay and have not accumulated live recall or daily
  support yet.

What they do **not** do by themselves:

- they do not edit `MEMORY.md`
- they do not run full doctor migrations
- they do not automatically stage grounded candidates into the live short-term
  promotion store unless you explicitly run the staged CLI path first

If you want grounded historical replay to influence the normal deep promotion
lane, use the CLI flow instead:

```bash
openclaw memory rem-backfill --path ./memory --stage-short-term
```

That stages grounded durable candidates into the short-term dreaming store while
keeping `DREAMS.md` as the review surface.

## Detailed behavior and rationale

### 0) Optional update (git installs)

If this is a git checkout and doctor is running interactively, it offers to
update (fetch/rebase/build) before running doctor.

### 1) Config normalization

If the config contains legacy value shapes (for example `messages.ackReaction`
without a channel-specific override), doctor normalizes them into the current
schema.

That includes legacy Talk flat fields. Current public Talk config is
`talk.provider` + `talk.providers.<provider>`. Doctor rewrites old
`talk.voiceId` / `talk.voiceAliases` / `talk.modelId` / `talk.outputFormat` /
`talk.apiKey` shapes into the provider map.

### 2) Legacy config key migrations

When the config contains deprecated keys, other commands refuse to run and ask
you to run `openclaw doctor`.

Doctor will:

- Explain which legacy keys were found.
- Show the migration it applied.
- Rewrite `~/.openclaw/openclaw.json` with the updated schema.

The Gateway also auto-runs doctor migrations on startup when it detects a
legacy config format, so stale configs are repaired without manual intervention.
Cron job store migrations are handled by `openclaw doctor --fix`.

Current migrations:

- `routing.allowFrom` → `channels.whatsapp.allowFrom`
- `routing.groupChat.requireMention` → `channels.whatsapp/telegram/imessage.groups."*".requireMention`
- `routing.groupChat.historyLimit` → `messages.groupChat.historyLimit`
- `routing.groupChat.mentionPatterns` → `messages.groupChat.mentionPatterns`
- `routing.queue` → `messages.queue`
- `routing.bindings` → top-level `bindings`
- `routing.agents`/`routing.defaultAgentId` → `agents.list` + `agents.list[].default`
- legacy `talk.voiceId`/`talk.voiceAliases`/`talk.modelId`/`talk.outputFormat`/`talk.apiKey` → `talk.provider` + `talk.providers.<provider>`
- `routing.agentToAgent` → `tools.agentToAgent`
- `routing.transcribeAudio` → `tools.media.audio.models`
- `messages.tts.<provider>` (`openai`/`elevenlabs`/`microsoft`/`edge`) → `messages.tts.providers.<provider>`
- `channels.discord.voice.tts.<provider>` (`openai`/`elevenlabs`/`microsoft`/`edge`) → `channels.discord.voice.tts.providers.<provider>`
- `channels.discord.accounts.<id>.voice.tts.<provider>` (`openai`/`elevenlabs`/`microsoft`/`edge`) → `channels.discord.accounts.<id>.voice.tts.providers.<provider>`
- `plugins.entries.voice-call.config.tts.<provider>` (`openai`/`elevenlabs`/`microsoft`/`edge`) → `plugins.entries.voice-call.config.tts.providers.<provider>`
- `plugins.entries.voice-call.config.provider: "log"` → `"mock"`
- `plugins.entries.voice-call.config.twilio.from` → `plugins.entries.voice-call.config.fromNumber`
- `plugins.entries.voice-call.config.streaming.sttProvider` → `plugins.entries.voice-call.config.streaming.provider`
- `plugins.entries.voice-call.config.streaming.openaiApiKey|sttModel|silenceDurationMs|vadThreshold`
  → `plugins.entries.voice-call.config.streaming.providers.openai.*`
- `bindings[].match.accountID` → `bindings[].match.accountId`
- For channels with named `accounts` but lingering single-account top-level channel values, move those account-scoped values into the promoted account chosen for that channel (`accounts.default` for most channels; Matrix can preserve an existing matching named/default target)
- `identity` → `agents.list[].identity`
- `agent.*` → `agents.defaults` + `tools.*` (tools/elevated/exec/sandbox/subagents)
- `agent.model`/`allowedModels`/`modelAliases`/`modelFallbacks`/`imageModelFallbacks`
  → `agents.defaults.models` + `agents.defaults.model.primary/fallbacks` + `agents.defaults.imageModel.primary/fallbacks`
- `browser.ssrfPolicy.allowPrivateNetwork` → `browser.ssrfPolicy.dangerouslyAllowPrivateNetwork`
- `browser.profiles.*.driver: "extension"` → `"existing-session"`
- remove `browser.relayBindHost` (legacy extension relay setting)

Doctor warnings also include account-default guidance for multi-account channels:

- If two or more `channels.<channel>.accounts` entries are configured without `channels.<channel>.defaultAccount` or `accounts.default`, doctor warns that fallback routing can pick an unexpected account.
- If `channels.<channel>.defaultAccount` is set to an unknown account ID, doctor warns and lists configured account IDs.

### 2b) OpenCode provider overrides

If you’ve added `models.providers.opencode`, `opencode-zen`, or `opencode-go`
manually, it overrides the built-in OpenCode catalog from `@mariozechner/pi-ai`.
That can force models onto the wrong API or zero out costs. Doctor warns so you
can remove the override and restore per-model API routing + costs.

### 2c) Browser migration and Chrome MCP readiness

If your browser config still points at the removed Chrome extension path, doctor
normalizes it to the current host-local Chrome MCP attach model:

- `browser.profiles.*.driver: "extension"` becomes `"existing-session"`
- `browser.relayBindHost` is removed

Doctor also audits the host-local Chrome MCP path when you use `defaultProfile:
"user"` or a configured `existing-session` profile:

- checks whether Google Chrome is installed on the same host for default
  auto-connect profiles
- checks the detected Chrome version and warns when it is below Chrome 144
- reminds you to enable remote debugging in the browser inspect page (for
  example `chrome://inspect/#remote-debugging`, `brave://inspect/#remote-debugging`,
  or `edge://inspect/#remote-debugging`)

Doctor cannot enable the Chrome-side setting for you. Host-local Chrome MCP
still requires:

- a Chromium-based browser 144+ on the gateway/node host
- the browser running locally
- remote debugging enabled in that browser
- approving the first attach consent prompt in the browser

Readiness here is only about local attach prerequisites. Existing-session keeps
the current Chrome MCP route limits; advanced routes like `responsebody`, PDF
export, download interception, and batch actions still require a managed
browser or raw CDP profile.

This check does **not** apply to Docker, sandbox, remote-browser, or other
headless flows. Those continue to use raw CDP.

### 2d) OAuth TLS prerequisites

When an OpenAI Codex OAuth profile is configured, doctor probes the OpenAI
authorization endpoint to verify that the local Node/OpenSSL TLS stack can
validate the certificate chain. If the probe fails with a certificate error (for
example `UNABLE_TO_GET_ISSUER_CERT_LOCALLY`, expired cert, or self-signed cert),
doctor prints platform-specific fix guidance. On macOS with a Homebrew Node, the
fix is usually `brew postinstall ca-certificates`. With `--deep`, the probe runs
even if the gateway is healthy.

### 2c) Codex OAuth provider overrides

If you previously added legacy OpenAI transport settings under
`models.providers.openai-codex`, they can shadow the built-in Codex OAuth
provider path that newer releases use automatically. Doctor warns when it sees
those old transport settings alongside Codex OAuth so you can remove or rewrite
the stale transport override and get the built-in routing/fallback behavior
back. Custom proxies and header-only overrides are still supported and do not
trigger this warning.

### 3) Legacy state migrations (disk layout)

Doctor can migrate older on-disk layouts into the current structure:

- Sessions store + transcripts:
  - from `~/.openclaw/sessions/` to `~/.openclaw/agents/<agentId>/sessions/`
- Agent dir:
  - from `~/.openclaw/agent/` to `~/.openclaw/agents/<agentId>/agent/`
- WhatsApp auth state (Baileys):
  - from legacy `~/.openclaw/credentials/*.json` (except `oauth.json`)
  - to `~/.openclaw/credentials/whatsapp/<accountId>/...` (default account id: `default`)

These migrations are best-effort and idempotent; doctor will emit warnings when
it leaves any legacy folders behind as backups. The Gateway/CLI also auto-migrates
the legacy sessions + agent dir on startup so history/auth/models land in the
per-agent path without a manual doctor run. WhatsApp auth is intentionally only
migrated via `openclaw doctor`. Talk provider/provider-map normalization now
compares by structural equality, so key-order-only diffs no longer trigger
repeat no-op `doctor --fix` changes.

### 3a) Legacy plugin manifest migrations

Doctor scans all installed plugin manifests for deprecated top-level capability
keys (`speechProviders`, `realtimeTranscriptionProviders`,
`realtimeVoiceProviders`, `mediaUnderstandingProviders`,
`imageGenerationProviders`, `videoGenerationProviders`, `webFetchProviders`,
`webSearchProviders`). When found, it offers to move them into the `contracts`
object and rewrite the manifest file in-place. This migration is idempotent;
if the `contracts` key already has the same values, the legacy key is removed
without duplicating the data.

### 3b) Legacy cron store migrations

Doctor also checks the cron job store (`~/.openclaw/cron/jobs.json` by default,
or `cron.store` when overridden) for old job shapes that the scheduler still
accepts for compatibility.

Current cron cleanups include:

- `jobId` → `id`
- `schedule.cron` → `schedule.expr`
- top-level payload fields (`message`, `model`, `thinking`, ...) → `payload`
- top-level delivery fields (`deliver`, `channel`, `to`, `provider`, ...) → `delivery`
- payload `provider` delivery aliases → explicit `delivery.channel`
- simple legacy `notify: true` webhook fallback jobs → explicit `delivery.mode="webhook"` with `delivery.to=cron.webhook`

Doctor only auto-migrates `notify: true` jobs when it can do so without
changing behavior. If a job combines legacy notify fallback with an existing