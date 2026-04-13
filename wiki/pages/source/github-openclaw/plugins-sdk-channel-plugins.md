---
title: Building Channel Plugins
tags: [entity, plugins]
sourcePath: sources/github/openclaw/docs/plugins/sdk-channel-plugins.md
ingestDate: 2026-04-13
type: documentation
---


# Building Channel Plugins

This guide walks through building a channel plugin that connects OpenClaw to a
messaging platform. By the end you will have a working channel with DM security,
pairing, reply threading, and outbound messaging.

<Info>
  If you have not built any OpenClaw plugin before, read
  [Getting Started](/plugins/building-plugins) first for the basic package
  structure and manifest setup.
</Info>

## How channel plugins work

Channel plugins do not need their own send/edit/react tools. OpenClaw keeps one
shared `message` tool in core. Your plugin owns:

- **Config** — account resolution and setup wizard
- **Security** — DM policy and allowlists
- **Pairing** — DM approval flow
- **Session grammar** — how provider-specific conversation ids map to base chats, thread ids, and parent fallbacks
- **Outbound** — sending text, media, and polls to the platform
- **Threading** — how replies are threaded

Core owns the shared message tool, prompt wiring, the outer session-key shape,
generic `:thread:` bookkeeping, and dispatch.

If your platform stores extra scope inside conversation ids, keep that parsing
in the plugin with `messaging.resolveSessionConversation(...)`. That is the
canonical hook for mapping `rawId` to the base conversation id, optional thread
id, explicit `baseConversationId`, and any `parentConversationCandidates`.
When you return `parentConversationCandidates`, keep them ordered from the
narrowest parent to the broadest/base conversation.

Bundled plugins that need the same parsing before the channel registry boots
can also expose a top-level `session-key-api.ts` file with a matching
`resolveSessionConversation(...)` export. Core uses that bootstrap-safe surface
only when the runtime plugin registry is not available yet.

`messaging.resolveParentConversationCandidates(...)` remains available as a
legacy compatibility fallback when a plugin only needs parent fallbacks on top
of the generic/raw id. If both hooks exist, core uses
`resolveSessionConversation(...).parentConversationCandidates` first and only
falls back to `resolveParentConversationCandidates(...)` when the canonical hook
omits them.

## Approvals and channel capabilities

Most channel plugins do not need approval-specific code.

- Core owns same-chat `/approve`, shared approval button payloads, and generic fallback delivery.
- Prefer one `approvalCapability` object on the channel plugin when the channel needs approval-specific behavior.
- `ChannelPlugin.approvals` is removed. Put approval delivery/native/render/auth facts on `approvalCapability`.
- `plugin.auth` is login/logout only; core no longer reads approval auth hooks from that object.
- `approvalCapability.authorizeActorAction` and `approvalCapability.getActionAvailabilityState` are the canonical approval-auth seam.
- Use `approvalCapability.getActionAvailabilityState` for same-chat approval auth availability.
- If your channel exposes native exec approvals, use `approvalCapability.getExecInitiatingSurfaceState` for the initiating-surface/native-client state when it differs from same-chat approval auth. Core uses that exec-specific hook to distinguish `enabled` vs `disabled`, decide whether the initiating channel supports native exec approvals, and include the channel in native-client fallback guidance. `createApproverRestrictedNativeApprovalCapability(...)` fills this in for the common case.
- Use `outbound.shouldSuppressLocalPayloadPrompt` or `outbound.beforeDeliverPayload` for channel-specific payload lifecycle behavior such as hiding duplicate local approval prompts or sending typing indicators before delivery.
- Use `approvalCapability.delivery` only for native approval routing or fallback suppression.
- Use `approvalCapability.nativeRuntime` for channel-owned native approval facts. Keep it lazy on hot channel entrypoints with `createLazyChannelApprovalNativeRuntimeAdapter(...)`, which can import your runtime module on demand while still letting core assemble the approval lifecycle.
- Use `approvalCapability.render` only when a channel truly needs custom approval payloads instead of the shared renderer.
- Use `approvalCapability.describeExecApprovalSetup` when the channel wants the disabled-path reply to explain the exact config knobs needed to enable native exec approvals. The hook receives `{ channel, channelLabel, accountId }`; named-account channels should render account-scoped paths such as `channels.<channel>.accounts.<id>.execApprovals.*` instead of top-level defaults.
- If a channel can infer stable owner-like DM identities from existing config, use `createResolvedApproverActionAuthAdapter` from `openclaw/plugin-sdk/approval-runtime` to restrict same-chat `/approve` without adding approval-specific core logic.
- If a channel needs native approval delivery, keep channel code focused on target normalization plus transport/presentation facts. Use `createChannelExecApprovalProfile`, `createChannelNativeOriginTargetResolver`, `createChannelApproverDmTargetResolver`, and `createApproverRestrictedNativeApprovalCapability` from `openclaw/plugin-sdk/approval-runtime`. Put the channel-specific facts behind `approvalCapability.nativeRuntime`, ideally via `createChannelApprovalNativeRuntimeAdapter(...)` or `createLazyChannelApprovalNativeRuntimeAdapter(...)`, so core can assemble the handler and own request filtering, routing, dedupe, expiry, gateway subscription, and routed-elsewhere notices. `nativeRuntime` is split into a few smaller seams:
- `availability` — whether the account is configured and whether a request should be handled
- `presentation` — map the shared approval view model into pending/resolved/expired native payloads or final actions
- `transport` — prepare targets plus send/update/delete native approval messages
- `interactions` — optional bind/unbind/clear-action hooks for native buttons or reactions
- `observe` — optional delivery diagnostics hooks
- If the channel needs runtime-owned objects such as a client, token, Bolt app, or webhook receiver, register them through `openclaw/plugin-sdk/channel-runtime-context`. The generic runtime-context registry lets core bootstrap capability-driven handlers from channel startup state without adding approval-specific wrapper glue.
- Reach for the lower-level `createChannelApprovalHandler` or `createChannelNativeApprovalRuntime` only when the capability-driven seam is not expressive enough yet.
- Native approval channels must route both `accountId` and `approvalKind` through those helpers. `accountId` keeps multi-account approval policy scoped to the right bot account, and `approvalKind` keeps exec vs plugin approval behavior available to the channel without hardcoded branches in core.
- Core now owns approval reroute notices too. Channel plugins should not send their own "approval went to DMs / another channel" follow-up messages from `createChannelNativeApprovalRuntime`; instead, expose accurate origin + approver-DM routing through the shared approval capability helpers and let core aggregate actual deliveries before posting any notice back to the initiating chat.
- Preserve the delivered approval id kind end-to-end. Native clients should not
  guess or rewrite exec vs plugin approval routing from channel-local state.
- Different approval kinds can intentionally expose different native surfaces.
  Current bundled examples:
  - Slack keeps native approval routing available for both exec and plugin ids.
  - Matrix keeps the same native DM/channel routing and reaction UX for exec
    and plugin approvals, while still letting auth differ by approval kind.
- `createApproverRestrictedNativeApprovalAdapter` still exists as a compatibility wrapper, but new code should prefer the capability builder and expose `approvalCapability` on the plugin.

For hot channel entrypoints, prefer the narrower runtime subpaths when you only
need one part of that family:

- `openclaw/plugin-sdk/approval-auth-runtime`
- `openclaw/plugin-sdk/approval-client-runtime`
- `openclaw/plugin-sdk/approval-delivery-runtime`
- `openclaw/plugin-sdk/approval-gateway-runtime`
- `openclaw/plugin-sdk/approval-handler-adapter-runtime`
- `openclaw/plugin-sdk/approval-handler-runtime`
- `openclaw/plugin-sdk/approval-native-runtime`
- `openclaw/plugin-sdk/approval-reply-runtime`
- `openclaw/plugin-sdk/channel-runtime-context`

Likewise, prefer `openclaw/plugin-sdk/setup-runtime`,
`openclaw/plugin-sdk/setup-adapter-runtime`,
`openclaw/plugin-sdk/reply-runtime`,
`openclaw/plugin-sdk/reply-dispatch-runtime`,
`openclaw/plugin-sdk/reply-reference`, and
`openclaw/plugin-sdk/reply-chunking` when you do not need the broader umbrella
surface.

For setup specifically:

- `openclaw/plugin-sdk/setup-runtime` covers the runtime-safe setup helpers:
  import-safe setup patch adapters (`createPatchedAccountSetupAdapter`,
  `createEnvPatchedAccountSetupAdapter`,
  `createSetupInputPresenceValidator`), lookup-note output,
  `promptResolvedAllowFrom`, `splitSetupEntries`, and the delegated
  setup-proxy builders
- `openclaw/plugin-sdk/setup-adapter-runtime` is the narrow env-aware adapter
  seam for `createEnvPatchedAccountSetupAdapter`
- `openclaw/plugin-sdk/channel-setup` covers the optional-install setup
  builders plus a few setup-safe primitives:
  `createOptionalChannelSetupSurface`, `createOptionalChannelSetupAdapter`,

If your channel supports env-driven setup or auth and generic startup/config
flows should know those env names before runtime loads, declare them in the
plugin manifest with `channelEnvVars`. Keep channel runtime `envVars` or local
constants for operator-facing copy only.
`createOptionalChannelSetupWizard`, `DEFAULT_ACCOUNT_ID`,
`createTopLevelChannelDmPolicy`, `setSetupChannelEnabled`, and
`splitSetupEntries`

- use the broader `openclaw/plugin-sdk/setup` seam only when you also need the
  heavier shared setup/config helpers such as
  `moveSingleAccountChannelSectionToDefaultAccount(...)`

If your channel only wants to advertise "install this plugin first" in setup
surfaces, prefer `createOptionalChannelSetupSurface(...)`. The generated
adapter/wizard fail closed on config writes and finalization, and they reuse
the same install-required message across validation, finalize, and docs-link
copy.

For other hot channel paths, prefer the narrow helpers over broader legacy
surfaces:

- `openclaw/plugin-sdk/account-core`,
  `openclaw/plugin-sdk/account-id`,
  `openclaw/plugin-sdk/account-resolution`, and
  `openclaw/plugin-sdk/account-helpers` for multi-account config and
  default-account fallback
- `openclaw/plugin-sdk/inbound-envelope` and
  `openclaw/plugin-sdk/inbound-reply-dispatch` for inbound route/envelope and
  record-and-dispatch wiring
- `openclaw/plugin-sdk/messaging-targets` for target parsing/matching
- `openclaw/plugin-sdk/outbound-media` and
  `openclaw/plugin-sdk/outbound-runtime` for media loading plus outbound
  identity/send delegates
- `openclaw/plugin-sdk/thread-bindings-runtime` for thread-binding lifecycle
  and adapter registration
- `openclaw/plugin-sdk/agent-media-payload` only when a legacy agent/media
  payload field layout is still required
- `openclaw/plugin-sdk/telegram-command-config` for Telegram custom-command
  normalization, duplicate/conflict validation, and a fallback-stable command
  config contract

Auth-only channels can usually stop at the default path: core handles approvals and the plugin just exposes outbound/auth capabilities. Native approval channels such as Matrix, Slack, Telegram, and custom chat transports should use the shared native helpers instead of rolling their own approval lifecycle.

## Inbound mention policy

Keep inbound mention handling split in two layers:

- plugin-owned evidence gathering
- shared policy evaluation

Use `openclaw/plugin-sdk/channel-inbound` for the shared layer.

Good fit for plugin-local logic:

- reply-to-bot detection
- quoted-bot detection
- thread-participation checks
- service/system-message exclusions
- platform-native caches needed to prove bot participation

Good fit for the shared helper:

- `requireMention`
- explicit mention result
- implicit mention allowlist
- command bypass
- final skip decision

Preferred flow:

1. Compute local mention facts.
2. Pass those facts into `resolveInboundMentionDecision({ facts, policy })`.
3. Use `decision.effectiveWasMentioned`, `decision.shouldBypassMention`, and `decision.shouldSkip` in your inbound gate.

```typescript
import {
  implicitMentionKindWhen,
  matchesMentionWithExplicit,
  resolveInboundMentionDecision,
} from "openclaw/plugin-sdk/channel-inbound";

const mentionMatch = matchesMentionWithExplicit(text, {
  mentionRegexes,
  mentionPatterns,
});

const facts = {
  canDetectMention: true,
  wasMentioned: mentionMatch.matched,
  hasAnyMention: mentionMatch.hasExplicitMention,
  implicitMentionKinds: [
    ...implicitMentionKindWhen("reply_to_bot", isReplyToBot),
    ...implicitMentionKindWhen("quoted_bot", isQuoteOfBot),
  ],
};

const decision = resolveInboundMentionDecision({
  facts,
  policy: {
    isGroup,
    requireMention,
    allowedImplicitMentionKinds: requireExplicitMention ? [] : ["reply_to_bot", "quoted_bot"],
    allowTextCommands,
    hasControlCommand,
    commandAuthorized,
  },
});

if (decision.shouldSkip) return;
```

`api.runtime.channel.mentions` exposes the same shared mention helpers for
bundled channel plugins that already depend on runtime injection:

- `buildMentionRegexes`
- `matchesMentionPatterns`
- `matchesMentionWithExplicit`
- `implicitMentionKindWhen`
- `resolveInboundMentionDecision`

The older `resolveMentionGating*` helpers remain on
`openclaw/plugin-sdk/channel-inbound` as compatibility exports only. New code
should use `resolveInboundMentionDecision({ facts, policy })`.

## Walkthrough

<Steps>
  <a id="step-1-package-and-manifest"></a>
  <Step title="Package and manifest">
    Create the standard plugin files. The `channel` field in `package.json` is
    what makes this a channel plugin. For the full package-metadata surface,
    see [Plugin Setup and Config](/plugins/sdk-setup#openclaw-channel):

    <CodeGroup>
    ```json package.json
    {
      "name": "@myorg/openclaw-acme-chat",
      "version": "1.0.0",
      "type": "module",
      "openclaw": {
        "extensions": ["./index.ts"],
        "setupEntry": "./setup-entry.ts",
        "channel": {
          "id": "acme-chat",
          "label": "Acme Chat",
          "blurb": "Connect OpenClaw to Acme Chat."
        }
      }
    }
    ```

    ```json openclaw.plugin.json
    {
      "id": "acme-chat",
      "kind": "channel",
      "channels": ["acme-chat"],
      "name": "Acme Chat",
      "description": "Acme Chat channel plugin",
      "configSchema": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "acme-chat": {
            "type": "object",
            "properties": {
              "token": { "type": "string" },
              "allowFrom": {
                "type": "array",
                "items": { "type": "string" }
              }
            }
          }
        }
      }
    }
    ```
    </CodeGroup>

  </Step>

  <Step title="Build the channel plugin object">
    The `ChannelPlugin` interface has many optional adapter surfaces. Start with