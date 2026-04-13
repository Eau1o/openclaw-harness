---
title: Testing
tags: [concept, help]
sourcePath: sources/github/openclaw/docs/help/testing.md
ingestDate: 2026-04-13
type: documentation
---


# Testing

OpenClaw has three Vitest suites (unit/integration, e2e, live) and a small set of Docker runners.

This doc is a “how we test” guide:

- What each suite covers (and what it deliberately does _not_ cover)
- Which commands to run for common workflows (local, pre-push, debugging)
- How live tests discover credentials and select models/providers
- How to add regressions for real-world model/provider issues

## Quick start

Most days:

- Full gate (expected before push): `pnpm build && pnpm check && pnpm test`
- Faster local full-suite run on a roomy machine: `pnpm test:max`
- Direct Vitest watch loop: `pnpm test:watch`
- Direct file targeting now routes extension/channel paths too: `pnpm test extensions/discord/src/monitor/message-handler.preflight.test.ts`
- Prefer targeted runs first when you are iterating on a single failure.
- Docker-backed QA site: `pnpm qa:lab:up`
- Linux VM-backed QA lane: `pnpm openclaw qa suite --runner multipass --scenario channel-chat-baseline`

When you touch tests or want extra confidence:

- Coverage gate: `pnpm test:coverage`
- E2E suite: `pnpm test:e2e`

When debugging real providers/models (requires real creds):

- Live suite (models + gateway tool/image probes): `pnpm test:live`
- Target one live file quietly: `pnpm test:live -- src/agents/models.profiles.live.test.ts`

Tip: when you only need one failing case, prefer narrowing live tests via the allowlist env vars described below.

## QA-specific runners

These commands sit beside the main test suites when you need QA-lab realism:

- `pnpm openclaw qa suite`
  - Runs repo-backed QA scenarios directly on the host.
  - Runs multiple selected scenarios in parallel by default with isolated
    gateway workers, up to 64 workers or the selected scenario count. Use
    `--concurrency <count>` to tune the worker count, or `--concurrency 1` for
    the older serial lane.
- `pnpm openclaw qa suite --runner multipass`
  - Runs the same QA suite inside a disposable Multipass Linux VM.
  - Keeps the same scenario-selection behavior as `qa suite` on the host.
  - Reuses the same provider/model selection flags as `qa suite`.
  - Live runs forward the supported QA auth inputs that are practical for the guest:
    env-based provider keys, the QA live provider config path, and `CODEX_HOME`
    when present.
  - Output dirs must stay under the repo root so the guest can write back through
    the mounted workspace.
  - Writes the normal QA report + summary plus Multipass logs under
    `.artifacts/qa-e2e/...`.
- `pnpm qa:lab:up`
  - Starts the Docker-backed QA site for operator-style QA work.
- `pnpm openclaw qa matrix`
  - Runs the Matrix live QA lane against a disposable Docker-backed Tuwunel homeserver.
  - Provisions three temporary Matrix users (`driver`, `sut`, `observer`) plus one private room, then starts a QA gateway child with the real Matrix plugin as the SUT transport.
  - Uses the pinned stable Tuwunel image `ghcr.io/matrix-construct/tuwunel:v1.5.1` by default. Override with `OPENCLAW_QA_MATRIX_TUWUNEL_IMAGE` when you need to test a different image.
  - Matrix currently supports only `--credential-source env` because the lane provisions disposable users locally.
  - Writes a Matrix QA report, summary, and observed-events artifact under `.artifacts/qa-e2e/...`.
- `pnpm openclaw qa telegram`
  - Runs the Telegram live QA lane against a real private group using the driver and SUT bot tokens from env.
  - Requires `OPENCLAW_QA_TELEGRAM_GROUP_ID`, `OPENCLAW_QA_TELEGRAM_DRIVER_BOT_TOKEN`, and `OPENCLAW_QA_TELEGRAM_SUT_BOT_TOKEN`. The group id must be the numeric Telegram chat id.
  - Supports `--credential-source convex` for shared pooled credentials. Use env mode by default, or set `OPENCLAW_QA_CREDENTIAL_SOURCE=convex` to opt into pooled leases.
  - Requires two distinct bots in the same private group, with the SUT bot exposing a Telegram username.
  - For stable bot-to-bot observation, enable Bot-to-Bot Communication Mode in `@BotFather` for both bots and ensure the driver bot can observe group bot traffic.
  - Writes a Telegram QA report, summary, and observed-messages artifact under `.artifacts/qa-e2e/...`.

Live transport lanes share one standard contract so new transports do not drift:

`qa-channel` remains the broad synthetic QA suite and is not part of the live
transport coverage matrix.

| Lane     | Canary | Mention gating | Allowlist block | Top-level reply | Restart resume | Thread follow-up | Thread isolation | Reaction observation | Help command |
| -------- | ------ | -------------- | --------------- | --------------- | -------------- | ---------------- | ---------------- | -------------------- | ------------ |
| Matrix   | x      | x              | x               | x               | x              | x                | x                | x                    |              |
| Telegram | x      |                |                 |                 |                |                  |                  |                      | x            |

### Shared Telegram credentials via Convex (v1)

When `--credential-source convex` (or `OPENCLAW_QA_CREDENTIAL_SOURCE=convex`) is enabled for
`openclaw qa telegram`, QA lab acquires an exclusive lease from a Convex-backed pool, heartbeats
that lease while the lane is running, and releases the lease on shutdown.

Reference Convex project scaffold:

- `qa/convex-credential-broker/`

Required env vars:

- `OPENCLAW_QA_CONVEX_SITE_URL` (for example `https://your-deployment.convex.site`)
- One secret for the selected role:
  - `OPENCLAW_QA_CONVEX_SECRET_MAINTAINER` for `maintainer`
  - `OPENCLAW_QA_CONVEX_SECRET_CI` for `ci`
- Credential role selection:
  - CLI: `--credential-role maintainer|ci`
  - Env default: `OPENCLAW_QA_CREDENTIAL_ROLE` (defaults to `maintainer`)

Optional env vars:

- `OPENCLAW_QA_CREDENTIAL_LEASE_TTL_MS` (default `1200000`)
- `OPENCLAW_QA_CREDENTIAL_HEARTBEAT_INTERVAL_MS` (default `30000`)
- `OPENCLAW_QA_CREDENTIAL_ACQUIRE_TIMEOUT_MS` (default `90000`)
- `OPENCLAW_QA_CREDENTIAL_HTTP_TIMEOUT_MS` (default `15000`)
- `OPENCLAW_QA_CONVEX_ENDPOINT_PREFIX` (default `/qa-credentials/v1`)
- `OPENCLAW_QA_CREDENTIAL_OWNER_ID` (optional trace id)
- `OPENCLAW_QA_ALLOW_INSECURE_HTTP=1` allows loopback `http://` Convex URLs for local-only development.

`OPENCLAW_QA_CONVEX_SITE_URL` should use `https://` in normal operation.

Maintainer admin commands (pool add/remove/list) require
`OPENCLAW_QA_CONVEX_SECRET_MAINTAINER` specifically.

CLI helpers for maintainers:

```bash
pnpm openclaw qa credentials add --kind telegram --payload-file qa/telegram-credential.json
pnpm openclaw qa credentials list --kind telegram
pnpm openclaw qa credentials remove --credential-id <credential-id>
```

Use `--json` for machine-readable output in scripts and CI utilities.

Default endpoint contract (`OPENCLAW_QA_CONVEX_SITE_URL` + `/qa-credentials/v1`):

- `POST /acquire`
  - Request: `{ kind, ownerId, actorRole, leaseTtlMs, heartbeatIntervalMs }`
  - Success: `{ status: "ok", credentialId, leaseToken, payload, leaseTtlMs?, heartbeatIntervalMs? }`
  - Exhausted/retryable: `{ status: "error", code: "POOL_EXHAUSTED" | "NO_CREDENTIAL_AVAILABLE", ... }`
- `POST /heartbeat`
  - Request: `{ kind, ownerId, actorRole, credentialId, leaseToken, leaseTtlMs }`
  - Success: `{ status: "ok" }` (or empty `2xx`)
- `POST /release`
  - Request: `{ kind, ownerId, actorRole, credentialId, leaseToken }`
  - Success: `{ status: "ok" }` (or empty `2xx`)
- `POST /admin/add` (maintainer secret only)
  - Request: `{ kind, actorId, payload, note?, status? }`
  - Success: `{ status: "ok", credential }`
- `POST /admin/remove` (maintainer secret only)
  - Request: `{ credentialId, actorId }`
  - Success: `{ status: "ok", changed, credential }`
  - Active lease guard: `{ status: "error", code: "LEASE_ACTIVE", ... }`
- `POST /admin/list` (maintainer secret only)
  - Request: `{ kind?, status?, includePayload?, limit? }`
  - Success: `{ status: "ok", credentials, count }`

Payload shape for Telegram kind:

- `{ groupId: string, driverToken: string, sutToken: string }`
- `groupId` must be a numeric Telegram chat id string.
- `admin/add` validates this shape for `kind: "telegram"` and rejects malformed payloads.

### Adding a channel to QA

Adding a channel to the markdown QA system requires exactly two things:

1. A transport adapter for the channel.
2. A scenario pack that exercises the channel contract.

Do not add a channel-specific QA runner when the shared `qa-lab` runner can
own the flow.

`qa-lab` owns the shared mechanics:

- suite startup and teardown
- worker concurrency
- artifact writing
- report generation
- scenario execution
- compatibility aliases for older `qa-channel` scenarios

The channel adapter owns the transport contract:

- how the gateway is configured for that transport
- how readiness is checked
- how inbound events are injected
- how outbound messages are observed
- how transcripts and normalized transport state are exposed
- how transport-backed actions are executed
- how transport-specific reset or cleanup is handled

The minimum adoption bar for a new channel is:

1. Implement the transport adapter on the shared `qa-lab` seam.
2. Register the adapter in the transport registry.
3. Keep transport-specific mechanics inside the adapter or the channel harness.
4. Author or adapt markdown scenarios under `qa/scenarios/`.
5. Use the generic scenario helpers for new scenarios.
6. Keep existing compatibility aliases working unless the repo is doing an intentional migration.

The decision rule is strict:

- If behavior can be expressed once in `qa-lab`, put it in `qa-lab`.
- If behavior depends on one channel transport, keep it in that adapter or plugin harness.
- If a scenario needs a new capability that more than one channel can use, add a generic helper instead of a channel-specific branch in `suite.ts`.
- If a behavior is only meaningful for one transport, keep the scenario transport-specific and make that explicit in the scenario contract.

Preferred generic helper names for new scenarios are:

- `waitForTransportReady`
- `waitForChannelReady`
- `injectInboundMessage`
- `injectOutboundMessage`
- `waitForTransportOutboundMessage`
- `waitForChannelOutboundMessage`
- `waitForNoTransportOutbound`
- `getTransportSnapshot`
- `readTransportMessage`
- `readTransportTranscript`
- `formatTransportTranscript`
- `resetTransport`

Compatibility aliases remain available for existing scenarios, including:

- `waitForQaChannelReady`
- `waitForOutboundMessage`
- `waitForNoOutbound`
- `formatConversationTranscript`
- `resetBus`

New channel work should use the generic helper names.
Compatibility aliases exist to avoid a flag day migration, not as the model for
new scenario authoring.

## Test suites (what runs where)

Think of the suites as “increasing realism” (and increasing flakiness/cost):

### Unit / integration (default)

- Command: `pnpm test`
- Config: ten sequential shard runs (`vitest.full-*.config.ts`) over the existing scoped Vitest projects
- Files: core/unit inventories under `src/**/*.test.ts`, `packages/**/*.test.ts`, `test/**/*.test.ts`, and the whitelisted `ui` node tests covered by `vitest.unit.config.ts`
- Scope:
  - Pure unit tests
  - In-process integration tests (gateway auth, routing, tooling, parsing, config)
  - Deterministic regressions for known bugs
- Expectations:
  - Runs in CI
  - No real keys required
  - Should be fast and stable
- Projects note:
  - Untargeted `pnpm test` now runs eleven smaller shard configs (`core-unit-src`, `core-unit-security`, `core-unit-ui`, `core-unit-support`, `core-support-boundary`, `core-contracts`, `core-bundled`, `core-runtime`, `agentic`, `auto-reply`, `extensions`) instead of one giant native root-project process. This cuts peak RSS on loaded machines and avoids auto-reply/extension work starving unrelated suites.
  - `pnpm test --watch` still uses the native root `vitest.config.ts` project graph, because a multi-shard watch loop is not practical.
  - `pnpm test`, `pnpm test:watch`, and `pnpm test:perf:imports` route explicit file/directory targets through scoped lanes first, so `pnpm test extensions/discord/src/monitor/message-handler.preflight.test.ts` avoids paying the full root project startup tax.
  - `pnpm test:changed` expands changed git paths into the same scoped lanes when the diff only touches routable source/test files; config/setup edits still fall back to the broad root-project rerun.
  - Import-light unit tests from agents, commands, plugins, auto-reply helpers, `plugin-sdk`, and similar pure utility areas route through the `unit-fast` lane, which skips `test/setup-openclaw-runtime.ts`; stateful/runtime-heavy files stay on the existing lanes.
  - Selected `plugin-sdk` and `commands` helper source files also map changed-mode runs to explicit sibling tests in those light lanes, so helper edits avoid rerunning the full heavy suite for that directory.
  - `auto-reply` now has three dedicated buckets: top-level core helpers, top-level `reply.*` integration tests, and the `src/auto-reply/reply/**` subtree. This keeps the heaviest reply harness work off the cheap status/chunk/token tests.
- Embedded runner note:
  - When you change message-tool discovery inputs or compaction runtime context,
    keep both levels of coverage.
  - Add focused helper regressions for pure routing/normalization boundaries.
  - Also keep the embedded runner integration suites healthy:
    `src/agents/pi-embedded-runner/compact.hooks.test.ts`,
    `src/agents/pi-embedded-runner/run.overflow-compaction.test.ts`, and
    `src/agents/pi-embedded-runner/run.overflow-compaction.loop.test.ts`.
  - Those suites verify that scoped ids and compaction behavior still flow
    through the real `run.ts` / `compact.ts` paths; helper-only tests are not a
    sufficient substitute for those integration paths.
- Pool note:
  - Base Vitest config now defaults to `threads`.
  - The shared Vitest config also fixes `isolate: false` and uses the non-isolated runner across the root projects, e2e, and live configs.
  - The root UI lane keeps its `jsdom` setup and optimizer, but now runs on the shared non-isolated runner too.
  - Each `pnpm test` shard inherits the same `threads` + `isolate: false` defaults from the shared Vitest config.
  - The shared `scripts/run-vitest.mjs` launcher now also adds `--no-maglev` for Vitest child Node processes by default to reduce V8 compile churn during big local runs. Set `OPENCLAW_VITEST_ENABLE_MAGLEV=1` if you need to compare against stock V8 behavior.
- Fast-local iteration note:
  - `pnpm test:changed` routes through scoped lanes when the changed paths map cleanly to a smaller suite.
  - `pnpm test:max` and `pnpm test:changed:max` keep the same routing behavior, just with a higher worker cap.
  - Local worker auto-scaling is intentionally conservative now and also backs off when the host load average is already high, so multiple concurrent Vitest runs do less damage by default.
  - The base Vitest config marks the projects/config files as `forceRerunTriggers` so changed-mode reruns stay correct when test wiring changes.
  - The config keeps `OPENCLAW_VITEST_FS_MODULE_CACHE` enabled on supported hosts; set `OPENCLAW_VITEST_FS_MODULE_CACHE_PATH=/abs/path` if you want one explicit cache location for direct profiling.
- Perf-debug note:
  - `pnpm test:perf:imports` enables Vitest import-duration reporting plus import-breakdown output.
  - `pnpm test:perf:imports:changed` scopes the same profiling view to files changed since `origin/main`.
- `pnpm test:perf:changed:bench -- --ref <git-ref>` compares routed `test:changed` against the native root-project path for that committed diff and prints wall time plus macOS max RSS.
- `pnpm test:perf:changed:bench -- --worktree` benchmarks the current dirty tree by routing the changed file list through `scripts/test-projects.mjs` and the root Vitest config.
  - `pnpm test:perf:profile:main` writes a main-thread CPU profile for Vitest/Vite startup and transform overhead.
  - `pnpm test:perf:profile:runner` writes runner CPU+heap profiles for the unit suite with file parallelism disabled.

### E2E (gateway smoke)

- Command: `pnpm test:e2e`
- Config: `vitest.e2e.config.ts`
- Files: `src/**/*.e2e.test.ts`, `test/**/*.e2e.test.ts`
- Runtime defaults:
  - Uses Vitest `threads` with `isolate: false`, matching the rest of the repo.
  - Uses adaptive workers (CI: up to 2, local: 1 by default).
  - Runs in silent mode by default to reduce console I/O overhead.
- Useful overrides:
  - `OPENCLAW_E2E_WORKERS=<n>` to force worker count (capped at 16).
  - `OPENCLAW_E2E_VERBOSE=1` to re-enable verbose console output.
- Scope:
  - Multi-instance gateway end-to-end behavior
  - WebSocket/HTTP surfaces, node pairing, and heavier networking