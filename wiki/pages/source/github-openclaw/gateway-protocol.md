---
title: Gateway protocol (WebSocket)
tags: [concept, gateway]
sourcePath: sources/github/openclaw/docs/gateway/protocol.md
ingestDate: 2026-04-13
type: documentation
---


# Gateway protocol (WebSocket)

The Gateway WS protocol is the **single control plane + node transport** for
OpenClaw. All clients (CLI, web UI, macOS app, iOS/Android nodes, headless
nodes) connect over WebSocket and declare their **role** + **scope** at
handshake time.

## Transport

- WebSocket, text frames with JSON payloads.
- First frame **must** be a `connect` request.

## Handshake (connect)

Gateway → Client (pre-connect challenge):

```json
{
  "type": "event",
  "event": "connect.challenge",
  "payload": { "nonce": "…", "ts": 1737264000000 }
}
```

Client → Gateway:

```json
{
  "type": "req",
  "id": "…",
  "method": "connect",
  "params": {
    "minProtocol": 3,
    "maxProtocol": 3,
    "client": {
      "id": "cli",
      "version": "1.2.3",
      "platform": "macos",
      "mode": "operator"
    },
    "role": "operator",
    "scopes": ["operator.read", "operator.write"],
    "caps": [],
    "commands": [],
    "permissions": {},
    "auth": { "token": "…" },
    "locale": "en-US",
    "userAgent": "openclaw-cli/1.2.3",
    "device": {
      "id": "device_fingerprint",
      "publicKey": "…",
      "signature": "…",
      "signedAt": 1737264000000,
      "nonce": "…"
    }
  }
}
```

Gateway → Client:

```json
{
  "type": "res",
  "id": "…",
  "ok": true,
  "payload": { "type": "hello-ok", "protocol": 3, "policy": { "tickIntervalMs": 15000 } }
}
```

When a device token is issued, `hello-ok` also includes:

```json
{
  "auth": {
    "deviceToken": "…",
    "role": "operator",
    "scopes": ["operator.read", "operator.write"]
  }
}
```

During trusted bootstrap handoff, `hello-ok.auth` may also include additional
bounded role entries in `deviceTokens`:

```json
{
  "auth": {
    "deviceToken": "…",
    "role": "node",
    "scopes": [],
    "deviceTokens": [
      {
        "deviceToken": "…",
        "role": "operator",
        "scopes": ["operator.approvals", "operator.read", "operator.talk.secrets", "operator.write"]
      }
    ]
  }
}
```

For the built-in node/operator bootstrap flow, the primary node token stays
`scopes: []` and any handed-off operator token stays bounded to the bootstrap
operator allowlist (`operator.approvals`, `operator.read`,
`operator.talk.secrets`, `operator.write`). Bootstrap scope checks stay
role-prefixed: operator entries only satisfy operator requests, and non-operator
roles still need scopes under their own role prefix.

### Node example

```json
{
  "type": "req",
  "id": "…",
  "method": "connect",
  "params": {
    "minProtocol": 3,
    "maxProtocol": 3,
    "client": {
      "id": "ios-node",
      "version": "1.2.3",
      "platform": "ios",
      "mode": "node"
    },
    "role": "node",
    "scopes": [],
    "caps": ["camera", "canvas", "screen", "location", "voice"],
    "commands": ["camera.snap", "canvas.navigate", "screen.record", "location.get"],
    "permissions": { "camera.capture": true, "screen.record": false },
    "auth": { "token": "…" },
    "locale": "en-US",
    "userAgent": "openclaw-ios/1.2.3",
    "device": {
      "id": "device_fingerprint",
      "publicKey": "…",
      "signature": "…",
      "signedAt": 1737264000000,
      "nonce": "…"
    }
  }
}
```

## Framing

- **Request**: `{type:"req", id, method, params}`
- **Response**: `{type:"res", id, ok, payload|error}`
- **Event**: `{type:"event", event, payload, seq?, stateVersion?}`

Side-effecting methods require **idempotency keys** (see schema).

## Roles + scopes

### Roles

- `operator` = control plane client (CLI/UI/automation).
- `node` = capability host (camera/screen/canvas/system.run).

### Scopes (operator)

Common scopes:

- `operator.read`
- `operator.write`
- `operator.admin`
- `operator.approvals`
- `operator.pairing`
- `operator.talk.secrets`

`talk.config` with `includeSecrets: true` requires `operator.talk.secrets`
(or `operator.admin`).

Plugin-registered gateway RPC methods may request their own operator scope, but
reserved core admin prefixes (`config.*`, `exec.approvals.*`, `wizard.*`,
`update.*`) always resolve to `operator.admin`.

Method scope is only the first gate. Some slash commands reached through
`chat.send` apply stricter command-level checks on top. For example, persistent
`/config set` and `/config unset` writes require `operator.admin`.

`node.pair.approve` also has an extra approval-time scope check on top of the
base method scope:

- commandless requests: `operator.pairing`
- requests with non-exec node commands: `operator.pairing` + `operator.write`
- requests that include `system.run`, `system.run.prepare`, or `system.which`:
  `operator.pairing` + `operator.admin`

### Caps/commands/permissions (node)

Nodes declare capability claims at connect time:

- `caps`: high-level capability categories.
- `commands`: command allowlist for invoke.
- `permissions`: granular toggles (e.g. `screen.record`, `camera.capture`).

The Gateway treats these as **claims** and enforces server-side allowlists.

## Presence

- `system-presence` returns entries keyed by device identity.
- Presence entries include `deviceId`, `roles`, and `scopes` so UIs can show a single row per device
  even when it connects as both **operator** and **node**.

## Common RPC method families

This page is not a generated full dump, but the public WS surface is broader
than the handshake/auth examples above. These are the main method families the
Gateway exposes today.

`hello-ok.features.methods` is a conservative discovery list built from
`src/gateway/server-methods-list.ts` plus loaded plugin/channel method exports.
Treat it as feature discovery, not as a generated dump of every callable helper
implemented in `src/gateway/server-methods/*.ts`.

### System and identity

- `health` returns the cached or freshly probed gateway health snapshot.
- `status` returns the `/status`-style gateway summary; sensitive fields are
  included only for admin-scoped operator clients.
- `gateway.identity.get` returns the gateway device identity used by relay and
  pairing flows.
- `system-presence` returns the current presence snapshot for connected
  operator/node devices.
- `system-event` appends a system event and can update/broadcast presence
  context.
- `last-heartbeat` returns the latest persisted heartbeat event.
- `set-heartbeats` toggles heartbeat processing on the gateway.

### Models and usage

- `models.list` returns the runtime-allowed model catalog.
- `usage.status` returns provider usage windows/remaining quota summaries.
- `usage.cost` returns aggregated cost usage summaries for a date range.
- `doctor.memory.status` returns vector-memory / embedding readiness for the
  active default agent workspace.
- `sessions.usage` returns per-session usage summaries.
- `sessions.usage.timeseries` returns timeseries usage for one session.
- `sessions.usage.logs` returns usage log entries for one session.

### Channels and login helpers

- `channels.status` returns built-in + bundled channel/plugin status summaries.
- `channels.logout` logs out a specific channel/account where the channel
  supports logout.
- `web.login.start` starts a QR/web login flow for the current QR-capable web
  channel provider.
- `web.login.wait` waits for that QR/web login flow to complete and starts the
  channel on success.
- `push.test` sends a test APNs push to a registered iOS node.
- `voicewake.get` returns the stored wake-word triggers.
- `voicewake.set` updates wake-word triggers and broadcasts the change.

### Messaging and logs

- `send` is the direct outbound-delivery RPC for channel/account/thread-targeted
  sends outside the chat runner.
- `logs.tail` returns the configured gateway file-log tail with cursor/limit and
  max-byte controls.

### Talk and TTS

- `talk.config` returns the effective Talk config payload; `includeSecrets`
  requires `operator.talk.secrets` (or `operator.admin`).
- `talk.mode` sets/broadcasts the current Talk mode state for WebChat/Control UI
  clients.
- `talk.speak` synthesizes speech through the active Talk speech provider.
- `tts.status` returns TTS enabled state, active provider, fallback providers,
  and provider config state.
- `tts.providers` returns the visible TTS provider inventory.
- `tts.enable` and `tts.disable` toggle TTS prefs state.
- `tts.setProvider` updates the preferred TTS provider.
- `tts.convert` runs one-shot text-to-speech conversion.

### Secrets, config, update, and wizard

- `secrets.reload` re-resolves active SecretRefs and swaps runtime secret state
  only on full success.
- `secrets.resolve` resolves command-target secret assignments for a specific
  command/target set.
- `config.get` returns the current config snapshot and hash.
- `config.set` writes a validated config payload.
- `config.patch` merges a partial config update.
- `config.apply` validates + replaces the full config payload.
- `config.schema` returns the live config schema payload used by Control UI and
  CLI tooling: schema, `uiHints`, version, and generation metadata, including
  plugin + channel schema metadata when the runtime can load it. The schema
  includes field `title` / `description` metadata derived from the same labels
  and help text used by the UI, including nested object, wildcard, array-item,
  and `anyOf` / `oneOf` / `allOf` composition branches when matching field
  documentation exists.
- `config.schema.lookup` returns a path-scoped lookup payload for one config
  path: normalized path, a shallow schema node, matched hint + `hintPath`, and
  immediate child summaries for UI/CLI drill-down.
  - Lookup schema nodes keep the user-facing docs and common validation fields:
    `title`, `description`, `type`, `enum`, `const`, `format`, `pattern`,
    numeric/string/array/object bounds, and boolean flags like
    `additionalProperties`, `deprecated`, `readOnly`, `writeOnly`.