---
title: WhatsApp (Web channel)
tags: [entity, channels]
sourcePath: sources/github/openclaw/docs/channels/whatsapp.md
ingestDate: 2026-04-13
type: documentation
---


# WhatsApp (Web channel)

Status: production-ready via WhatsApp Web (Baileys). Gateway owns linked session(s).

## Install (on demand)

- Onboarding (`openclaw onboard`) and `openclaw channels add --channel whatsapp`
  prompt to install the WhatsApp plugin the first time you select it.
- `openclaw channels login --channel whatsapp` also offers the install flow when
  the plugin is not present yet.
- Dev channel + git checkout: defaults to the local plugin path.
- Stable/Beta: defaults to the npm package `@openclaw/whatsapp`.

Manual install stays available:

```bash
openclaw plugins install @openclaw/whatsapp
```

<CardGroup cols={3}>
  <Card title="Pairing" icon="link" href="/channels/pairing">
    Default DM policy is pairing for unknown senders.
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
  <Step title="Configure WhatsApp access policy">

```json5
{
  channels: {
    whatsapp: {
      dmPolicy: "pairing",
      allowFrom: ["+15551234567"],
      groupPolicy: "allowlist",
      groupAllowFrom: ["+15551234567"],
    },
  },
}
```

  </Step>

  <Step title="Link WhatsApp (QR)">

```bash
openclaw channels login --channel whatsapp
```

    For a specific account:

```bash
openclaw channels login --channel whatsapp --account work
```

  </Step>

  <Step title="Start the gateway">

```bash
openclaw gateway
```

  </Step>

  <Step title="Approve first pairing request (if using pairing mode)">

```bash
openclaw pairing list whatsapp
openclaw pairing approve whatsapp <CODE>
```

    Pairing requests expire after 1 hour. Pending requests are capped at 3 per channel.

  </Step>
</Steps>

<Note>
OpenClaw recommends running WhatsApp on a separate number when possible. (The channel metadata and setup flow are optimized for that setup, but personal-number setups are also supported.)
</Note>

## Deployment patterns

<AccordionGroup>
  <Accordion title="Dedicated number (recommended)">
    This is the cleanest operational mode:

    - separate WhatsApp identity for OpenClaw
    - clearer DM allowlists and routing boundaries
    - lower chance of self-chat confusion

    Minimal policy pattern:

    ```json5
    {
      channels: {
        whatsapp: {
          dmPolicy: "allowlist",
          allowFrom: ["+15551234567"],
        },
      },
    }
    ```

  </Accordion>

  <Accordion title="Personal-number fallback">
    Onboarding supports personal-number mode and writes a self-chat-friendly baseline:

    - `dmPolicy: "allowlist"`
    - `allowFrom` includes your personal number
    - `selfChatMode: true`

    In runtime, self-chat protections key off the linked self number and `allowFrom`.

  </Accordion>

  <Accordion title="WhatsApp Web-only channel scope">
    The messaging platform channel is WhatsApp Web-based (`Baileys`) in current OpenClaw channel architecture.

    There is no separate Twilio WhatsApp messaging channel in the built-in chat-channel registry.

  </Accordion>
</AccordionGroup>

## Runtime model

- Gateway owns the WhatsApp socket and reconnect loop.
- Outbound sends require an active WhatsApp listener for the target account.
- Status and broadcast chats are ignored (`@status`, `@broadcast`).
- Direct chats use DM session rules (`session.dmScope`; default `main` collapses DMs to the agent main session).
- Group sessions are isolated (`agent:<agentId>:whatsapp:group:<jid>`).
- WhatsApp Web transport honors standard proxy environment variables on the gateway host (`HTTPS_PROXY`, `HTTP_PROXY`, `NO_PROXY` / lowercase variants). Prefer host-level proxy config over channel-specific WhatsApp proxy settings.

## Access control and activation

<Tabs>
  <Tab title="DM policy">
    `channels.whatsapp.dmPolicy` controls direct chat access:

    - `pairing` (default)
    - `allowlist`
    - `open` (requires `allowFrom` to include `"*"`)
    - `disabled`

    `allowFrom` accepts E.164-style numbers (normalized internally).

    Multi-account override: `channels.whatsapp.accounts.<id>.dmPolicy` (and `allowFrom`) take precedence over channel-level defaults for that account.

    Runtime behavior details:

    - pairings are persisted in channel allow-store and merged with configured `allowFrom`
    - if no allowlist is configured, the linked self number is allowed by default
    - outbound `fromMe` DMs are never auto-paired

  </Tab>

  <Tab title="Group policy + allowlists">
    Group access has two layers:

    1. **Group membership allowlist** (`channels.whatsapp.groups`)
       - if `groups` is omitted, all groups are eligible
       - if `groups` is present, it acts as a group allowlist (`"*"` allowed)

    2. **Group sender policy** (`channels.whatsapp.groupPolicy` + `groupAllowFrom`)
       - `open`: sender allowlist bypassed
       - `allowlist`: sender must match `groupAllowFrom` (or `*`)
       - `disabled`: block all group inbound

    Sender allowlist fallback:

    - if `groupAllowFrom` is unset, runtime falls back to `allowFrom` when available
    - sender allowlists are evaluated before mention/reply activation

    Note: if no `channels.whatsapp` block exists at all, runtime group-policy fallback is `allowlist` (with a warning log), even if `channels.defaults.groupPolicy` is set.

  </Tab>

  <Tab title="Mentions + /activation">
    Group replies require mention by default.

    Mention detection includes:

    - explicit WhatsApp mentions of the bot identity
    - configured mention regex patterns (`agents.list[].groupChat.mentionPatterns`, fallback `messages.groupChat.mentionPatterns`)
    - implicit reply-to-bot detection (reply sender matches bot identity)

    Security note:

    - quote/reply only satisfies mention gating; it does **not** grant sender authorization
    - with `groupPolicy: "allowlist"`, non-allowlisted senders are still blocked even if they reply to an allowlisted user's message

    Session-level activation command:

    - `/activation mention`
    - `/activation always`

    `activation` updates session state (not global config). It is owner-gated.

  </Tab>
</Tabs>

## Personal-number and self-chat behavior

When the linked self number is also present in `allowFrom`, WhatsApp self-chat safeguards activate:

- skip read receipts for self-chat turns
- ignore mention-JID auto-trigger behavior that would otherwise ping yourself
- if `messages.responsePrefix` is unset, self-chat replies default to `[{identity.name}]` or `[openclaw]`

## Message normalization and context

<AccordionGroup>
  <Accordion title="Inbound envelope + reply context">
    Incoming WhatsApp messages are wrapped in the shared inbound envelope.

    If a quoted reply exists, context is appended in this form:

    ```text
    [Replying to <sender> id:<stanzaId>]
    <quoted body or media placeholder>
    [/Replying]
    ```

    Reply metadata fields are also populated when available (`ReplyToId`, `ReplyToBody`, `ReplyToSender`, sender JID/E.164).

  </Accordion>

  <Accordion title="Media placeholders and location/contact extraction">
    Media-only inbound messages are normalized with placeholders such as:

    - `<media:image>`
    - `<media:video>`
    - `<media:audio>`
    - `<media:document>`
    - `<media:sticker>`

    Location and contact payloads are normalized into textual context before routing.

  </Accordion>

  <Accordion title="Pending group history injection">
    For groups, unprocessed messages can be buffered and injected as context when the bot is finally triggered.

    - default limit: `50`
    - config: `channels.whatsapp.historyLimit`
    - fallback: `messages.groupChat.historyLimit`
    - `0` disables

    Injection markers:

    - `[Chat messages since your last reply - for context]`
    - `[Current message - respond to this]`

  </Accordion>

  <Accordion title="Read receipts">
    Read receipts are enabled by default for accepted inbound WhatsApp messages.

    Disable globally:

    ```json5
    {
      channels: {
        whatsapp: {
          sendReadReceipts: false,
        },
      },
    }
    ```

    Per-account override:

    ```json5
    {
      channels: {
        whatsapp: {
          accounts: {
            work: {
              sendReadReceipts: false,
            },
          },
        },
      },
    }
    ```

    Self-chat turns skip read receipts even when globally enabled.

  </Accordion>
</AccordionGroup>