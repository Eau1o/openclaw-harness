---
title: Telegram (Bot API)
tags: [entity, channels]
sourcePath: sources/github/openclaw/docs/channels/telegram.md
ingestDate: 2026-04-13
type: documentation
---


# Telegram (Bot API)

Status: production-ready for bot DMs + groups via grammY. Long polling is the default mode; webhook mode is optional.

<CardGroup cols={3}>
  <Card title="Pairing" icon="link" href="/channels/pairing">
    Default DM policy for Telegram is pairing.
  </Card>
  <Card title="Channel troubleshooting" icon="wrench" href="/channels/troubleshooting">
    Cross-channel diagnostics and repair playbooks.
  </Card>
  <Card title="Gateway configuration" icon="settings" href="/gateway/configuration">
    Full channel config patterns and examples.
  </Card>
</CardGroup>

## Quick setup

<Steps>
  <Step title="Create the bot token in BotFather">
    Open Telegram and chat with **@BotFather** (confirm the handle is exactly `@BotFather`).

    Run `/newbot`, follow prompts, and save the token.

  </Step>

  <Step title="Configure token and DM policy">

```json5
{
  channels: {
    telegram: {
      enabled: true,
      botToken: "123:abc",
      dmPolicy: "pairing",
      groups: { "*": { requireMention: true } },
    },
  },
}
```

    Env fallback: `TELEGRAM_BOT_TOKEN=...` (default account only).
    Telegram does **not** use `openclaw channels login telegram`; configure token in config/env, then start gateway.

  </Step>

  <Step title="Start gateway and approve first DM">

```bash
openclaw gateway
openclaw pairing list telegram
openclaw pairing approve telegram <CODE>
```

    Pairing codes expire after 1 hour.

  </Step>

  <Step title="Add the bot to a group">
    Add the bot to your group, then set `channels.telegram.groups` and `groupPolicy` to match your access model.
  </Step>
</Steps>

<Note>
Token resolution order is account-aware. In practice, config values win over env fallback, and `TELEGRAM_BOT_TOKEN` only applies to the default account.
</Note>

## Telegram side settings

<AccordionGroup>
  <Accordion title="Privacy mode and group visibility">
    Telegram bots default to **Privacy Mode**, which limits what group messages they receive.

    If the bot must see all group messages, either:

    - disable privacy mode via `/setprivacy`, or
    - make the bot a group admin.

    When toggling privacy mode, remove + re-add the bot in each group so Telegram applies the change.

  </Accordion>

  <Accordion title="Group permissions">
    Admin status is controlled in Telegram group settings.

    Admin bots receive all group messages, which is useful for always-on group behavior.

  </Accordion>

  <Accordion title="Helpful BotFather toggles">

    - `/setjoingroups` to allow/deny group adds
    - `/setprivacy` for group visibility behavior

  </Accordion>
</AccordionGroup>

## Access control and activation

<Tabs>
  <Tab title="DM policy">
    `channels.telegram.dmPolicy` controls direct message access:

    - `pairing` (default)
    - `allowlist` (requires at least one sender ID in `allowFrom`)
    - `open` (requires `allowFrom` to include `"*"`)
    - `disabled`

    `channels.telegram.allowFrom` accepts numeric Telegram user IDs. `telegram:` / `tg:` prefixes are accepted and normalized.
    `dmPolicy: "allowlist"` with empty `allowFrom` blocks all DMs and is rejected by config validation.
    Onboarding accepts `@username` input and resolves it to numeric IDs.
    If you upgraded and your config contains `@username` allowlist entries, run `openclaw doctor --fix` to resolve them (best-effort; requires a Telegram bot token).
    If you previously relied on pairing-store allowlist files, `openclaw doctor --fix` can recover entries into `channels.telegram.allowFrom` in allowlist flows (for example when `dmPolicy: "allowlist"` has no explicit IDs yet).

    For one-owner bots, prefer `dmPolicy: "allowlist"` with explicit numeric `allowFrom` IDs to keep access policy durable in config (instead of depending on previous pairing approvals).

    Common confusion: DM pairing approval does not mean "this sender is authorized everywhere".
    Pairing grants DM access only. Group sender authorization still comes from explicit config allowlists.
    If you want "I am authorized once and both DMs and group commands work", put your numeric Telegram user ID in `channels.telegram.allowFrom`.

    ### Finding your Telegram user ID

    Safer (no third-party bot):

    1. DM your bot.
    2. Run `openclaw logs --follow`.
    3. Read `from.id`.

    Official Bot API method:

```bash
curl "https://api.telegram.org/bot<bot_token>/getUpdates"
```

    Third-party method (less private): `@userinfobot` or `@getidsbot`.

  </Tab>

  <Tab title="Group policy and allowlists">
    Two controls apply together:

    1. **Which groups are allowed** (`channels.telegram.groups`)
       - no `groups` config:
         - with `groupPolicy: "open"`: any group can pass group-ID checks
         - with `groupPolicy: "allowlist"` (default): groups are blocked until you add `groups` entries (or `"*"`)
       - `groups` configured: acts as allowlist (explicit IDs or `"*"`)

    2. **Which senders are allowed in groups** (`channels.telegram.groupPolicy`)
       - `open`
       - `allowlist` (default)
       - `disabled`

    `groupAllowFrom` is used for group sender filtering. If not set, Telegram falls back to `allowFrom`.
    `groupAllowFrom` entries should be numeric Telegram user IDs (`telegram:` / `tg:` prefixes are normalized).
    Do not put Telegram group or supergroup chat IDs in `groupAllowFrom`. Negative chat IDs belong under `channels.telegram.groups`.
    Non-numeric entries are ignored for sender authorization.
    Security boundary (`2026.2.25+`): group sender auth does **not** inherit DM pairing-store approvals.
    Pairing stays DM-only. For groups, set `groupAllowFrom` or per-group/per-topic `allowFrom`.
    If `groupAllowFrom` is unset, Telegram falls back to config `allowFrom`, not the pairing store.
    Practical pattern for one-owner bots: set your user ID in `channels.telegram.allowFrom`, leave `groupAllowFrom` unset, and allow the target groups under `channels.telegram.groups`.
    Runtime note: if `channels.telegram` is completely missing, runtime defaults to fail-closed `groupPolicy="allowlist"` unless `channels.defaults.groupPolicy` is explicitly set.

    Example: allow any member in one specific group:

```json5
{
  channels: {
    telegram: {
      groups: {
        "-1001234567890": {
          groupPolicy: "open",
          requireMention: false,
        },
      },
    },
  },
}
```

    Example: allow only specific users inside one specific group:

```json5
{
  channels: {
    telegram: {
      groups: {
        "-1001234567890": {
          requireMention: true,
          allowFrom: ["8734062810", "745123456"],
        },
      },
    },
  },
}
```

    <Warning>
      Common mistake: `groupAllowFrom` is not a Telegram group allowlist.

      - Put negative Telegram group or supergroup chat IDs like `-1001234567890` under `channels.telegram.groups`.
      - Put Telegram user IDs like `8734062810` under `groupAllowFrom` when you want to limit which people inside an allowed group can trigger the bot.
      - Use `groupAllowFrom: ["*"]` only when you want any member of an allowed group to be able to talk to the bot.
    </Warning>

  </Tab>

  <Tab title="Mention behavior">
    Group replies require mention by default.

    Mention can come from:

    - native `@botusername` mention, or
    - mention patterns in:
      - `agents.list[].groupChat.mentionPatterns`
      - `messages.groupChat.mentionPatterns`

    Session-level command toggles:

    - `/activation always`
    - `/activation mention`

    These update session state only. Use config for persistence.

    Persistent config example:

```json5
{
  channels: {
    telegram: {
      groups: {
        "*": { requireMention: false },
      },
    },
  },
}
```

    Getting the group chat ID:

    - forward a group message to `@userinfobot` / `@getidsbot`
    - or read `chat.id` from `openclaw logs --follow`
    - or inspect Bot API `getUpdates`

  </Tab>
</Tabs>

## Runtime behavior

- Telegram is owned by the gateway process.
- Routing is deterministic: Telegram inbound replies back to Telegram (the model does not pick channels).
- Inbound messages normalize into the shared channel envelope with reply metadata and media placeholders.
- Group sessions are isolated by group ID. Forum topics append `:topic:<threadId>` to keep topics isolated.
- DM messages can carry `message_thread_id`; OpenClaw routes them with thread-aware session keys and preserves thread ID for replies.
- Long polling uses grammY runner with per-chat/per-thread sequencing. Overall runner sink concurrency uses `agents.defaults.maxConcurrent`.
- Telegram Bot API has no read-receipt support (`sendReadReceipts` does not apply).

## Feature reference

<AccordionGroup>
  <Accordion title="Live stream preview (message edits)">
    OpenClaw can stream partial replies in real time:

    - direct chats: preview message + `editMessageText`
    - groups/topics: preview message + `editMessageText`

    Requirement:

    - `channels.telegram.streaming` is `off | partial | block | progress` (default: `partial`)
    - `progress` maps to `partial` on Telegram (compat with cross-channel naming)
    - legacy `channels.telegram.streamMode` and boolean `streaming` values are auto-mapped

    For text-only replies:

    - DM: OpenClaw keeps the same preview message and performs a final edit in place (no second message)
    - group/topic: OpenClaw keeps the same preview message and performs a final edit in place (no second message)

    For complex replies (for example media payloads), OpenClaw falls back to normal final delivery and then cleans up the preview message.

    Preview streaming is separate from block streaming. When block streaming is explicitly enabled for Telegram, OpenClaw skips the preview stream to avoid double-streaming.

    If native draft transport is unavailable/rejected, OpenClaw automatically falls back to `sendMessage` + `editMessageText`.

    Telegram-only reasoning stream:

    - `/reasoning stream` sends reasoning to the live preview while generating
    - final answer is sent without reasoning text

  </Accordion>

  <Accordion title="Formatting and HTML fallback">
    Outbound text uses Telegram `parse_mode: "HTML"`.

    - Markdown-ish text is rendered to Telegram-safe HTML.
    - Raw model HTML is escaped to reduce Telegram parse failures.
    - If Telegram rejects parsed HTML, OpenClaw retries as plain text.

    Link previews are enabled by default and can be disabled with `channels.telegram.linkPreview: false`.

  </Accordion>