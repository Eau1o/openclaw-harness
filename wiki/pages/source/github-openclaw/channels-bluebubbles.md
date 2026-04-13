---
title: BlueBubbles (macOS REST)
tags: [entity, channels]
sourcePath: sources/github/openclaw/docs/channels/bluebubbles.md
ingestDate: 2026-04-13
type: documentation
---


# BlueBubbles (macOS REST)

Status: bundled plugin that talks to the BlueBubbles macOS server over HTTP. **Recommended for iMessage integration** due to its richer API and easier setup compared to the legacy imsg channel.

## Bundled plugin

Current OpenClaw releases bundle BlueBubbles, so normal packaged builds do not
need a separate `openclaw plugins install` step.

## Overview

- Runs on macOS via the BlueBubbles helper app ([bluebubbles.app](https://bluebubbles.app)).
- Recommended/tested: macOS Sequoia (15). macOS Tahoe (26) works; edit is currently broken on Tahoe, and group icon updates may report success but not sync.
- OpenClaw talks to it through its REST API (`GET /api/v1/ping`, `POST /message/text`, `POST /chat/:id/*`).
- Incoming messages arrive via webhooks; outgoing replies, typing indicators, read receipts, and tapbacks are REST calls.
- Attachments and stickers are ingested as inbound media (and surfaced to the agent when possible).
- Pairing/allowlist works the same way as other channels (`/channels/pairing` etc) with `channels.bluebubbles.allowFrom` + pairing codes.
- Reactions are surfaced as system events just like Slack/Telegram so agents can "mention" them before replying.
- Advanced features: edit, unsend, reply threading, message effects, group management.

## Quick start

1. Install the BlueBubbles server on your Mac (follow the instructions at [bluebubbles.app/install](https://bluebubbles.app/install)).
2. In the BlueBubbles config, enable the web API and set a password.
3. Run `openclaw onboard` and select BlueBubbles, or configure manually:

   ```json5
   {
     channels: {
       bluebubbles: {
         enabled: true,
         serverUrl: "http://192.168.1.100:1234",
         password: "example-password",
         webhookPath: "/bluebubbles-webhook",
       },
     },
   }
   ```

4. Point BlueBubbles webhooks to your gateway (example: `https://your-gateway-host:3000/bluebubbles-webhook?password=<password>`).
5. Start the gateway; it will register the webhook handler and start pairing.

Security note:

- Always set a webhook password.
- Webhook authentication is always required. OpenClaw rejects BlueBubbles webhook requests unless they include a password/guid that matches `channels.bluebubbles.password` (for example `?password=<password>` or `x-password`), regardless of loopback/proxy topology.
- Password authentication is checked before reading/parsing full webhook bodies.

## Keeping Messages.app alive (VM / headless setups)

Some macOS VM / always-on setups can end up with Messages.app going “idle” (incoming events stop until the app is opened/foregrounded). A simple workaround is to **poke Messages every 5 minutes** using an AppleScript + LaunchAgent.

### 1) Save the AppleScript

Save this as:

- `~/Scripts/poke-messages.scpt`

Example script (non-interactive; does not steal focus):

```applescript
try
  tell application "Messages"
    if not running then
      launch
    end if

    -- Touch the scripting interface to keep the process responsive.
    set _chatCount to (count of chats)
  end tell
on error
  -- Ignore transient failures (first-run prompts, locked session, etc).
end try
```

### 2) Install a LaunchAgent

Save this as:

- `~/Library/LaunchAgents/com.user.poke-messages.plist`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>com.user.poke-messages</string>

    <key>ProgramArguments</key>
    <array>
      <string>/bin/bash</string>
      <string>-lc</string>
      <string>/usr/bin/osascript &quot;$HOME/Scripts/poke-messages.scpt&quot;</string>
    </array>

    <key>RunAtLoad</key>
    <true/>

    <key>StartInterval</key>
    <integer>300</integer>

    <key>StandardOutPath</key>
    <string>/tmp/poke-messages.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/poke-messages.err</string>
  </dict>
</plist>
```

Notes:

- This runs **every 300 seconds** and **on login**.
- The first run may trigger macOS **Automation** prompts (`osascript` → Messages). Approve them in the same user session that runs the LaunchAgent.

Load it:

```bash
launchctl unload ~/Library/LaunchAgents/com.user.poke-messages.plist 2>/dev/null || true
launchctl load ~/Library/LaunchAgents/com.user.poke-messages.plist
```

## Onboarding

BlueBubbles is available in interactive onboarding:

```
openclaw onboard
```

The wizard prompts for:

- **Server URL** (required): BlueBubbles server address (e.g., `http://192.168.1.100:1234`)
- **Password** (required): API password from BlueBubbles Server settings
- **Webhook path** (optional): Defaults to `/bluebubbles-webhook`
- **DM policy**: pairing, allowlist, open, or disabled
- **Allow list**: Phone numbers, emails, or chat targets

You can also add BlueBubbles via CLI:

```
openclaw channels add bluebubbles --http-url http://192.168.1.100:1234 --password <password>
```

## Access control (DMs + groups)

DMs:

- Default: `channels.bluebubbles.dmPolicy = "pairing"`.
- Unknown senders receive a pairing code; messages are ignored until approved (codes expire after 1 hour).
- Approve via:
  - `openclaw pairing list bluebubbles`
  - `openclaw pairing approve bluebubbles <CODE>`
- Pairing is the default token exchange. Details: [Pairing](/channels/pairing)

Groups:

- `channels.bluebubbles.groupPolicy = open | allowlist | disabled` (default: `allowlist`).
- `channels.bluebubbles.groupAllowFrom` controls who can trigger in groups when `allowlist` is set.

### Contact name enrichment (macOS, optional)

BlueBubbles group webhooks often only include raw participant addresses. If you want `GroupMembers` context to show local contact names instead, you can opt in to local Contacts enrichment on macOS:

- `channels.bluebubbles.enrichGroupParticipantsFromContacts = true` enables the lookup. Default: `false`.
- Lookups run only after group access, command authorization, and mention gating have allowed the message through.
- Only unnamed phone participants are enriched.
- Raw phone numbers remain as the fallback when no local match is found.

```json5
{
  channels: {
    bluebubbles: {
      enrichGroupParticipantsFromContacts: true,
    },
  },
}
```

### Mention gating (groups)

BlueBubbles supports mention gating for group chats, matching iMessage/WhatsApp behavior:

- Uses `agents.list[].groupChat.mentionPatterns` (or `messages.groupChat.mentionPatterns`) to detect mentions.
- When `requireMention` is enabled for a group, the agent only responds when mentioned.
- Control commands from authorized senders bypass mention gating.

Per-group configuration:

```json5
{
  channels: {
    bluebubbles: {
      groupPolicy: "allowlist",
      groupAllowFrom: ["+15555550123"],
      groups: {
        "*": { requireMention: true }, // default for all groups
        "iMessage;-;chat123": { requireMention: false }, // override for specific group
      },
    },
  },
}
```

### Command gating

- Control commands (e.g., `/config`, `/model`) require authorization.
- Uses `allowFrom` and `groupAllowFrom` to determine command authorization.
- Authorized senders can run control commands even without mentioning in groups.

## ACP conversation bindings

BlueBubbles chats can be turned into durable ACP workspaces without changing the transport layer.

Fast operator flow:

- Run `/acp spawn codex --bind here` inside the DM or allowed group chat.
- Future messages in that same BlueBubbles conversation route to the spawned ACP session.
- `/new` and `/reset` reset the same bound ACP session in place.
- `/acp close` closes the ACP session and removes the binding.

Configured persistent bindings are also supported through top-level `bindings[]` entries with `type: "acp"` and `match.channel: "bluebubbles"`.

`match.peer.id` can use any supported BlueBubbles target form:

- normalized DM handle such as `+15555550123` or `user@example.com`
- `chat_id:<id>`
- `chat_guid:<guid>`
- `chat_identifier:<identifier>`

For stable group bindings, prefer `chat_id:*` or `chat_identifier:*`.

Example:

```json5
{
  agents: {
    list: [
      {
        id: "codex",
        runtime: {
          type: "acp",
          acp: { agent: "codex", backend: "acpx", mode: "persistent" },
        },
      },
    ],
  },
  bindings: [
    {
      type: "acp",
      agentId: "codex",
      match: {
        channel: "bluebubbles",
        accountId: "default",
        peer: { kind: "dm", id: "+15555550123" },
      },
      acp: { label: "codex-imessage" },
    },
  ],
}
```

See [ACP Agents](/tools/acp-agents) for shared ACP binding behavior.

## Typing + read receipts

- **Typing indicators**: Sent automatically before and during response generation.
- **Read receipts**: Controlled by `channels.bluebubbles.sendReadReceipts` (default: `true`).
- **Typing indicators**: OpenClaw sends typing start events; BlueBubbles clears typing automatically on send or timeout (manual stop via DELETE is unreliable).

```json5
{
  channels: {
    bluebubbles: {
      sendReadReceipts: false, // disable read receipts
    },
  },
}
```

## Advanced actions

BlueBubbles supports advanced message actions when enabled in config:

```json5
{
  channels: {
    bluebubbles: {
      actions: {
        reactions: true, // tapbacks (default: true)
        edit: true, // edit sent messages (macOS 13+, broken on macOS 26 Tahoe)
        unsend: true, // unsend messages (macOS 13+)
        reply: true, // reply threading by message GUID
        sendWithEffect: true, // message effects (slam, loud, etc.)
        renameGroup: true, // rename group chats
        setGroupIcon: true, // set group chat icon/photo (flaky on macOS 26 Tahoe)
        addParticipant: true, // add participants to groups
        removeParticipant: true, // remove participants from groups
        leaveGroup: true, // leave group chats