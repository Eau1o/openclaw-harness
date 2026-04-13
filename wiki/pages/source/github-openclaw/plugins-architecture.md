---
title: Plugin Internals
tags: [entity, plugins]
sourcePath: sources/github/openclaw/docs/plugins/architecture.md
ingestDate: 2026-04-13
type: documentation
---


# Plugin Internals

<Info>
  This is the **deep architecture reference**. For practical guides, see:
  - [Install and use plugins](/tools/plugin) — user guide
  - [Getting Started](/plugins/building-plugins) — first plugin tutorial
  - [Channel Plugins](/plugins/sdk-channel-plugins) — build a messaging channel
  - [Provider Plugins](/plugins/sdk-provider-plugins) — build a model provider
  - [SDK Overview](/plugins/sdk-overview) — import map and registration API
</Info>

This page covers the internal architecture of the OpenClaw plugin system.

## Public capability model

Capabilities are the public **native plugin** model inside OpenClaw. Every
native OpenClaw plugin registers against one or more capability types:

| Capability             | Registration method                              | Example plugins                      |
| ---------------------- | ------------------------------------------------ | ------------------------------------ |
| Text inference         | `api.registerProvider(...)`                      | `openai`, `anthropic`                |
| CLI inference backend  | `api.registerCliBackend(...)`                    | `openai`, `anthropic`                |
| Speech                 | `api.registerSpeechProvider(...)`                | `elevenlabs`, `microsoft`            |
| Realtime transcription | `api.registerRealtimeTranscriptionProvider(...)` | `openai`                             |
| Realtime voice         | `api.registerRealtimeVoiceProvider(...)`         | `openai`                             |
| Media understanding    | `api.registerMediaUnderstandingProvider(...)`    | `openai`, `google`                   |
| Image generation       | `api.registerImageGenerationProvider(...)`       | `openai`, `google`, `fal`, `minimax` |
| Music generation       | `api.registerMusicGenerationProvider(...)`       | `google`, `minimax`                  |
| Video generation       | `api.registerVideoGenerationProvider(...)`       | `qwen`                               |
| Web fetch              | `api.registerWebFetchProvider(...)`              | `firecrawl`                          |
| Web search             | `api.registerWebSearchProvider(...)`             | `google`                             |
| Channel / messaging    | `api.registerChannel(...)`                       | `msteams`, `matrix`                  |

A plugin that registers zero capabilities but provides hooks, tools, or
services is a **legacy hook-only** plugin. That pattern is still fully supported.

### External compatibility stance

The capability model is landed in core and used by bundled/native plugins
today, but external plugin compatibility still needs a tighter bar than "it is
exported, therefore it is frozen."

Current guidance:

- **existing external plugins:** keep hook-based integrations working; treat
  this as the compatibility baseline
- **new bundled/native plugins:** prefer explicit capability registration over
  vendor-specific reach-ins or new hook-only designs
- **external plugins adopting capability registration:** allowed, but treat the
  capability-specific helper surfaces as evolving unless docs explicitly mark a
  contract as stable

Practical rule:

- capability registration APIs are the intended direction
- legacy hooks remain the safest no-breakage path for external plugins during
  the transition
- exported helper subpaths are not all equal; prefer the narrow documented
  contract, not incidental helper exports

### Plugin shapes

OpenClaw classifies every loaded plugin into a shape based on its actual
registration behavior (not just static metadata):

- **plain-capability** -- registers exactly one capability type (for example a
  provider-only plugin like `mistral`)
- **hybrid-capability** -- registers multiple capability types (for example
  `openai` owns text inference, speech, media understanding, and image
  generation)
- **hook-only** -- registers only hooks (typed or custom), no capabilities,
  tools, commands, or services
- **non-capability** -- registers tools, commands, services, or routes but no
  capabilities

Use `openclaw plugins inspect <id>` to see a plugin's shape and capability
breakdown. See [CLI reference](/cli/plugins#inspect) for details.

### Legacy hooks

The `before_agent_start` hook remains supported as a compatibility path for
hook-only plugins. Legacy real-world plugins still depend on it.

Direction:

- keep it working
- document it as legacy
- prefer `before_model_resolve` for model/provider override work
- prefer `before_prompt_build` for prompt mutation work
- remove only after real usage drops and fixture coverage proves migration safety

### Compatibility signals

When you run `openclaw doctor` or `openclaw plugins inspect <id>`, you may see
one of these labels:

| Signal                     | Meaning                                                      |
| -------------------------- | ------------------------------------------------------------ |
| **config valid**           | Config parses fine and plugins resolve                       |
| **compatibility advisory** | Plugin uses a supported-but-older pattern (e.g. `hook-only`) |
| **legacy warning**         | Plugin uses `before_agent_start`, which is deprecated        |
| **hard error**             | Config is invalid or plugin failed to load                   |

Neither `hook-only` nor `before_agent_start` will break your plugin today --
`hook-only` is advisory, and `before_agent_start` only triggers a warning. These
signals also appear in `openclaw status --all` and `openclaw plugins doctor`.

## Architecture overview

OpenClaw's plugin system has four layers:

1. **Manifest + discovery**
   OpenClaw finds candidate plugins from configured paths, workspace roots,
   global extension roots, and bundled extensions. Discovery reads native
   `openclaw.plugin.json` manifests plus supported bundle manifests first.
2. **Enablement + validation**
   Core decides whether a discovered plugin is enabled, disabled, blocked, or
   selected for an exclusive slot such as memory.
3. **Runtime loading**
   Native OpenClaw plugins are loaded in-process via jiti and register
   capabilities into a central registry. Compatible bundles are normalized into
   registry records without importing runtime code.
4. **Surface consumption**
   The rest of OpenClaw reads the registry to expose tools, channels, provider
   setup, hooks, HTTP routes, CLI commands, and services.

For plugin CLI specifically, root command discovery is split in two phases:

- parse-time metadata comes from `registerCli(..., { descriptors: [...] })`
- the real plugin CLI module can stay lazy and register on first invocation

That keeps plugin-owned CLI code inside the plugin while still letting OpenClaw
reserve root command names before parsing.

The important design boundary:

- discovery + config validation should work from **manifest/schema metadata**
  without executing plugin code
- native runtime behavior comes from the plugin module's `register(api)` path

That split lets OpenClaw validate config, explain missing/disabled plugins, and
build UI/schema hints before the full runtime is active.

### Channel plugins and the shared message tool

Channel plugins do not need to register a separate send/edit/react tool for
normal chat actions. OpenClaw keeps one shared `message` tool in core, and
channel plugins own the channel-specific discovery and execution behind it.

The current boundary is:

- core owns the shared `message` tool host, prompt wiring, session/thread
  bookkeeping, and execution dispatch
- channel plugins own scoped action discovery, capability discovery, and any
  channel-specific schema fragments
- channel plugins own provider-specific session conversation grammar, such as
  how conversation ids encode thread ids or inherit from parent conversations
- channel plugins execute the final action through their action adapter

For channel plugins, the SDK surface is
`ChannelMessageActionAdapter.describeMessageTool(...)`. That unified discovery
call lets a plugin return its visible actions, capabilities, and schema
contributions together so those pieces do not drift apart.

Core passes runtime scope into that discovery step. Important fields include:

- `accountId`
- `currentChannelId`
- `currentThreadTs`
- `currentMessageId`
- `sessionKey`
- `sessionId`
- `agentId`
- trusted inbound `requesterSenderId`

That matters for context-sensitive plugins. A channel can hide or expose
message actions based on the active account, current room/thread/message, or
trusted requester identity without hardcoding channel-specific branches in the
core `message` tool.

This is why embedded-runner routing changes are still plugin work: the runner is
responsible for forwarding the current chat/session identity into the plugin
discovery boundary so the shared `message` tool exposes the right channel-owned
surface for the current turn.

For channel-owned execution helpers, bundled plugins should keep the execution
runtime inside their own extension modules. Core no longer owns the Discord,
Slack, Telegram, or WhatsApp message-action runtimes under `src/agents/tools`.
We do not publish separate `plugin-sdk/*-action-runtime` subpaths, and bundled
plugins should import their own local runtime code directly from their
extension-owned modules.

The same boundary applies to provider-named SDK seams in general: core should
not import channel-specific convenience barrels for Slack, Discord, Signal,
WhatsApp, or similar extensions. If core needs a behavior, either consume the
bundled plugin's own `api.ts` / `runtime-api.ts` barrel or promote the need
into a narrow generic capability in the shared SDK.

For polls specifically, there are two execution paths:

- `outbound.sendPoll` is the shared baseline for channels that fit the common
  poll model
- `actions.handleAction("poll")` is the preferred path for channel-specific
  poll semantics or extra poll parameters

Core now defers shared poll parsing until after plugin poll dispatch declines
the action, so plugin-owned poll handlers can accept channel-specific poll
fields without being blocked by the generic poll parser first.

See [Load pipeline](#load-pipeline) for the full startup sequence.

## Capability ownership model

OpenClaw treats a native plugin as the ownership boundary for a **company** or a
**feature**, not as a grab bag of unrelated integrations.

That means:

- a company plugin should usually own all of that company's OpenClaw-facing
  surfaces
- a feature plugin should usually own the full feature surface it introduces
- channels should consume shared core capabilities instead of re-implementing
  provider behavior ad hoc

Examples:

- the bundled `openai` plugin owns OpenAI model-provider behavior and OpenAI
  speech + realtime-voice + media-understanding + image-generation behavior
- the bundled `elevenlabs` plugin owns ElevenLabs speech behavior
- the bundled `microsoft` plugin owns Microsoft speech behavior
- the bundled `google` plugin owns Google model-provider behavior plus Google
  media-understanding + image-generation + web-search behavior
- the bundled `firecrawl` plugin owns Firecrawl web-fetch behavior
- the bundled `minimax`, `mistral`, `moonshot`, and `zai` plugins own their
  media-understanding backends
- the bundled `qwen` plugin owns Qwen text-provider behavior plus
  media-understanding and video-generation behavior
- the `voice-call` plugin is a feature plugin: it owns call transport, tools,
  CLI, routes, and Twilio media-stream bridging, but it consumes shared speech
  plus realtime-transcription and realtime-voice capabilities instead of
  importing vendor plugins directly

The intended end state is:

- OpenAI lives in one plugin even if it spans text models, speech, images, and
  future video
- another vendor can do the same for its own surface area
- channels do not care which vendor plugin owns the provider; they consume the
  shared capability contract exposed by core

This is the key distinction:

- **plugin** = ownership boundary
- **capability** = core contract that multiple plugins can implement or consume

So if OpenClaw adds a new domain such as video, the first question is not
"which provider should hardcode video handling?" The first question is "what is
the core video capability contract?" Once that contract exists, vendor plugins
can register against it and channel/feature plugins can consume it.

If the capability does not exist yet, the right move is usually:

1. define the missing capability in core
2. expose it through the plugin API/runtime in a typed way
3. wire channels/features against that capability
4. let vendor plugins register implementations

This keeps ownership explicit while avoiding core behavior that depends on a
single vendor or a one-off plugin-specific code path.

### Capability layering

Use this mental model when deciding where code belongs:

- **core capability layer**: shared orchestration, policy, fallback, config
  merge rules, delivery semantics, and typed contracts
- **vendor plugin layer**: vendor-specific APIs, auth, model catalogs, speech
  synthesis, image generation, future video backends, usage endpoints
- **channel/feature plugin layer**: Slack/Discord/voice-call/etc. integration
  that consumes core capabilities and presents them on a surface

For example, TTS follows this shape:

- core owns reply-time TTS policy, fallback order, prefs, and channel delivery
- `openai`, `elevenlabs`, and `microsoft` own synthesis implementations
- `voice-call` consumes the telephony TTS runtime helper

That same pattern should be preferred for future capabilities.

### Multi-capability company plugin example

A company plugin should feel cohesive from the outside. If OpenClaw has shared
contracts for models, speech, realtime transcription, realtime voice, media
understanding, image generation, video generation, web fetch, and web search,
a vendor can own all of its surfaces in one place:

```ts
import type { OpenClawPluginDefinition } from "openclaw/plugin-sdk/plugin-entry";
import {