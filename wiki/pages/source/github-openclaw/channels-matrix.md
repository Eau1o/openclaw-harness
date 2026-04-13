---
title: Matrix
tags: [entity, channels]
sourcePath: sources/github/openclaw/docs/channels/matrix.md
ingestDate: 2026-04-13
type: documentation
---


# Matrix

Matrix is a bundled channel plugin for OpenClaw.
It uses the official `matrix-js-sdk` and supports DMs, rooms, threads, media, reactions, polls, location, and E2EE.

## Bundled plugin

Matrix ships as a bundled plugin in current OpenClaw releases, so normal
packaged builds do not need a separate install.

If you are on an older build or a custom install that excludes Matrix, install
it manually:

Install from npm:

```bash
openclaw plugins install @openclaw/matrix
```

Install from a local checkout:

```bash
openclaw plugins install ./path/to/local/matrix-plugin
```

See [Plugins](/tools/plugin) for plugin behavior and install rules.

## Setup

1. Ensure the Matrix plugin is available.
   - Current packaged OpenClaw releases already bundle it.
   - Older/custom installs can add it manually with the commands above.
2. Create a Matrix account on your homeserver.
3. Configure `channels.matrix` with either:
   - `homeserver` + `accessToken`, or
   - `homeserver` + `userId` + `password`.
4. Restart the gateway.
5. Start a DM with the bot or invite it to a room.
   - Fresh Matrix invites only work when `channels.matrix.autoJoin` allows them.

Interactive setup paths:

```bash
openclaw channels add
openclaw configure --section channels
```

The Matrix wizard asks for:

- homeserver URL
- auth method: access token or password
- user ID (password auth only)
- optional device name
- whether to enable E2EE
- whether to configure room access and invite auto-join

Key wizard behaviors:

- If Matrix auth env vars already exist and that account does not already have auth saved in config, the wizard offers an env shortcut to keep auth in env vars.
- Account names are normalized to the account ID. For example, `Ops Bot` becomes `ops-bot`.
- DM allowlist entries accept `@user:server` directly; display names only work when live directory lookup finds one exact match.
- Room allowlist entries accept room IDs and aliases directly. Prefer `!room:server` or `#alias:server`; unresolved names are ignored at runtime by allowlist resolution.
- In invite auto-join allowlist mode, use only stable invite targets: `!roomId:server`, `#alias:server`, or `*`. Plain room names are rejected.
- To resolve room names before saving, use `openclaw channels resolve --channel matrix "Project Room"`.

<Warning>
`channels.matrix.autoJoin` defaults to `off`.

If you leave it unset, the bot will not join invited rooms or fresh DM-style invites, so it will not appear in new groups or invited DMs unless you join manually first.

Set `autoJoin: "allowlist"` together with `autoJoinAllowlist` to restrict which invites it accepts, or set `autoJoin: "always"` if you want it to join every invite.

In `allowlist` mode, `autoJoinAllowlist` only accepts `!roomId:server`, `#alias:server`, or `*`.
</Warning>

Allowlist example:

```json5
{
  channels: {
    matrix: {
      autoJoin: "allowlist",
      autoJoinAllowlist: ["!ops:example.org", "#support:example.org"],
      groups: {
        "!ops:example.org": {
          requireMention: true,
        },
      },
    },
  },
}
```

Join every invite:

```json5
{
  channels: {
    matrix: {
      autoJoin: "always",
    },
  },
}
```

Minimal token-based setup:

```json5
{
  channels: {
    matrix: {
      enabled: true,
      homeserver: "https://matrix.example.org",
      accessToken: "syt_xxx",
      dm: { policy: "pairing" },
    },
  },
}
```

Password-based setup (token is cached after login):

```json5
{
  channels: {
    matrix: {
      enabled: true,
      homeserver: "https://matrix.example.org",
      userId: "@bot:example.org",
      password: "replace-me", // pragma: allowlist secret
      deviceName: "OpenClaw Gateway",
    },
  },
}
```

Matrix stores cached credentials in `~/.openclaw/credentials/matrix/`.
The default account uses `credentials.json`; named accounts use `credentials-<account>.json`.
When cached credentials exist there, OpenClaw treats Matrix as configured for setup, doctor, and channel-status discovery even if current auth is not set directly in config.

Environment variable equivalents (used when the config key is not set):

- `MATRIX_HOMESERVER`
- `MATRIX_ACCESS_TOKEN`
- `MATRIX_USER_ID`
- `MATRIX_PASSWORD`
- `MATRIX_DEVICE_ID`
- `MATRIX_DEVICE_NAME`

For non-default accounts, use account-scoped env vars:

- `MATRIX_<ACCOUNT_ID>_HOMESERVER`
- `MATRIX_<ACCOUNT_ID>_ACCESS_TOKEN`
- `MATRIX_<ACCOUNT_ID>_USER_ID`
- `MATRIX_<ACCOUNT_ID>_PASSWORD`
- `MATRIX_<ACCOUNT_ID>_DEVICE_ID`
- `MATRIX_<ACCOUNT_ID>_DEVICE_NAME`

Example for account `ops`:

- `MATRIX_OPS_HOMESERVER`
- `MATRIX_OPS_ACCESS_TOKEN`

For normalized account ID `ops-bot`, use:

- `MATRIX_OPS_X2D_BOT_HOMESERVER`
- `MATRIX_OPS_X2D_BOT_ACCESS_TOKEN`

Matrix escapes punctuation in account IDs to keep scoped env vars collision-free.
For example, `-` becomes `_X2D_`, so `ops-prod` maps to `MATRIX_OPS_X2D_PROD_*`.

The interactive wizard only offers the env-var shortcut when those auth env vars are already present and the selected account does not already have Matrix auth saved in config.

## Configuration example

This is a practical baseline config with DM pairing, room allowlist, and E2EE enabled:

```json5
{
  channels: {
    matrix: {
      enabled: true,
      homeserver: "https://matrix.example.org",
      accessToken: "syt_xxx",
      encryption: true,

      dm: {
        policy: "pairing",
        sessionScope: "per-room",
        threadReplies: "off",
      },

      groupPolicy: "allowlist",
      groupAllowFrom: ["@admin:example.org"],
      groups: {
        "!roomid:example.org": {
          requireMention: true,
        },
      },

      autoJoin: "allowlist",
      autoJoinAllowlist: ["!roomid:example.org"],
      threadReplies: "inbound",
      replyToMode: "off",
      streaming: "partial",
    },
  },
}
```

`autoJoin` applies to all Matrix invites, including DM-style invites. OpenClaw cannot reliably
classify an invited room as a DM or group at invite time, so all invites go through `autoJoin`
first. `dm.policy` applies after the bot has joined and the room is classified as a DM.

## Streaming previews

Matrix reply streaming is opt-in.

Set `channels.matrix.streaming` to `"partial"` when you want OpenClaw to send a single live preview
reply, edit that preview in place while the model is generating text, and then finalize it when the
reply is done:

```json5
{
  channels: {
    matrix: {
      streaming: "partial",
    },
  },
}
```

- `streaming: "off"` is the default. OpenClaw waits for the final reply and sends it once.
- `streaming: "partial"` creates one editable preview message for the current assistant block using normal Matrix text messages. This preserves Matrix's legacy preview-first notification behavior, so stock clients may notify on the first streamed preview text instead of the finished block.
- `streaming: "quiet"` creates one editable quiet preview notice for the current assistant block. Use this only when you also configure recipient push rules for finalized preview edits.
- `blockStreaming: true` enables separate Matrix progress messages. With preview streaming enabled, Matrix keeps the live draft for the current block and preserves completed blocks as separate messages.
- When preview streaming is on and `blockStreaming` is off, Matrix edits the live draft in place and finalizes that same event when the block or turn finishes.
- If the preview no longer fits in one Matrix event, OpenClaw stops preview streaming and falls back to normal final delivery.
- Media replies still send attachments normally. If a stale preview can no longer be reused safely, OpenClaw redacts it before sending the final media reply.
- Preview edits cost extra Matrix API calls. Leave streaming off if you want the most conservative rate-limit behavior.

`blockStreaming` does not enable draft previews by itself.
Use `streaming: "partial"` or `streaming: "quiet"` for preview edits; then add `blockStreaming: true` only if you also want completed assistant blocks to remain visible as separate progress messages.

If you need stock Matrix notifications without custom push rules, use `streaming: "partial"` for preview-first behavior or leave `streaming` off for final-only delivery. With `streaming: "off"`:

- `blockStreaming: true` sends each finished block as a normal notifying Matrix message.
- `blockStreaming: false` sends only the final completed reply as a normal notifying Matrix message.

### Self-hosted push rules for quiet finalized previews

If you run your own Matrix infrastructure and want quiet previews to notify only when a block or
final reply is done, set `streaming: "quiet"` and add a per-user push rule for finalized preview edits.

This is usually a recipient-user setup, not a homeserver-global config change:

Quick map before you start:

- recipient user = the person who should receive the notification
- bot user = the OpenClaw Matrix account that sends the reply
- use the recipient user's access token for the API calls below
- match `sender` in the push rule against the bot user's full MXID

1. Configure OpenClaw to use quiet previews:

```json5
{
  channels: {
    matrix: {
      streaming: "quiet",
    },
  },
}
```

2. Make sure the recipient account already receives normal Matrix push notifications. Quiet preview
   rules only work if that user already has working pushers/devices.

3. Get the recipient user's access token.
   - Use the receiving user's token, not the bot's token.
   - Reusing an existing client session token is usually easiest.
   - If you need to mint a fresh token, you can log in through the standard Matrix Client-Server API:

```bash
curl -sS -X POST \
  "https://matrix.example.org/_matrix/client/v3/login" \
  -H "Content-Type: application/json" \
  --data '{
    "type": "m.login.password",
    "identifier": {
      "type": "m.id.user",
      "user": "@alice:example.org"
    },
    "password": "REDACTED"
  }'
```

4. Verify the recipient account already has pushers:
