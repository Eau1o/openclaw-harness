---
title: Plugin manifest (openclaw.plugin.json)
tags: [entity, plugins]
sourcePath: sources/github/openclaw/docs/plugins/manifest.md
ingestDate: 2026-04-13
type: documentation
---


# Plugin manifest (openclaw.plugin.json)

This page is for the **native OpenClaw plugin manifest** only.

For compatible bundle layouts, see [Plugin bundles](/plugins/bundles).

Compatible bundle formats use different manifest files:

- Codex bundle: `.codex-plugin/plugin.json`
- Claude bundle: `.claude-plugin/plugin.json` or the default Claude component
  layout without a manifest
- Cursor bundle: `.cursor-plugin/plugin.json`

OpenClaw auto-detects those bundle layouts too, but they are not validated
against the `openclaw.plugin.json` schema described here.

For compatible bundles, OpenClaw currently reads bundle metadata plus declared
skill roots, Claude command roots, Claude bundle `settings.json` defaults,
Claude bundle LSP defaults, and supported hook packs when the layout matches
OpenClaw runtime expectations.

Every native OpenClaw plugin **must** ship a `openclaw.plugin.json` file in the
**plugin root**. OpenClaw uses this manifest to validate configuration
**without executing plugin code**. Missing or invalid manifests are treated as
plugin errors and block config validation.

See the full plugin system guide: [Plugins](/tools/plugin).
For the native capability model and current external-compatibility guidance:
[Capability model](/plugins/architecture#public-capability-model).

## What this file does

`openclaw.plugin.json` is the metadata OpenClaw reads before it loads your
plugin code.

Use it for:

- plugin identity
- config validation
- auth and onboarding metadata that should be available without booting plugin
  runtime
- cheap activation hints that control-plane surfaces can inspect before runtime
  loads
- cheap setup descriptors that setup/onboarding surfaces can inspect before
  runtime loads
- alias and auto-enable metadata that should resolve before plugin runtime loads
- shorthand model-family ownership metadata that should auto-activate the
  plugin before runtime loads
- static capability ownership snapshots used for bundled compat wiring and
  contract coverage
- channel-specific config metadata that should merge into catalog and validation
  surfaces without loading runtime
- config UI hints

Do not use it for:

- registering runtime behavior
- declaring code entrypoints
- npm install metadata

Those belong in your plugin code and `package.json`.

## Minimal example

```json
{
  "id": "voice-call",
  "configSchema": {
    "type": "object",
    "additionalProperties": false,
    "properties": {}
  }
}
```

## Rich example

```json
{
  "id": "openrouter",
  "name": "OpenRouter",
  "description": "OpenRouter provider plugin",
  "version": "1.0.0",
  "providers": ["openrouter"],
  "modelSupport": {
    "modelPrefixes": ["router-"]
  },
  "cliBackends": ["openrouter-cli"],
  "providerAuthEnvVars": {
    "openrouter": ["OPENROUTER_API_KEY"]
  },
  "providerAuthAliases": {
    "openrouter-coding": "openrouter"
  },
  "channelEnvVars": {
    "openrouter-chatops": ["OPENROUTER_CHATOPS_TOKEN"]
  },
  "providerAuthChoices": [
    {
      "provider": "openrouter",
      "method": "api-key",
      "choiceId": "openrouter-api-key",
      "choiceLabel": "OpenRouter API key",
      "groupId": "openrouter",
      "groupLabel": "OpenRouter",
      "optionKey": "openrouterApiKey",
      "cliFlag": "--openrouter-api-key",
      "cliOption": "--openrouter-api-key <key>",
      "cliDescription": "OpenRouter API key",
      "onboardingScopes": ["text-inference"]
    }
  ],
  "uiHints": {
    "apiKey": {
      "label": "API key",
      "placeholder": "sk-or-v1-...",
      "sensitive": true
    }
  },
  "configSchema": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "apiKey": {
        "type": "string"
      }
    }
  }
}
```

## Top-level field reference

| Field                               | Required | Type                             | What it means                                                                                                                                                                                                |
| ----------------------------------- | -------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `id`                                | Yes      | `string`                         | Canonical plugin id. This is the id used in `plugins.entries.<id>`.                                                                                                                                          |
| `configSchema`                      | Yes      | `object`                         | Inline JSON Schema for this plugin's config.                                                                                                                                                                 |
| `enabledByDefault`                  | No       | `true`                           | Marks a bundled plugin as enabled by default. Omit it, or set any non-`true` value, to leave the plugin disabled by default.                                                                                 |
| `legacyPluginIds`                   | No       | `string[]`                       | Legacy ids that normalize to this canonical plugin id.                                                                                                                                                       |
| `autoEnableWhenConfiguredProviders` | No       | `string[]`                       | Provider ids that should auto-enable this plugin when auth, config, or model refs mention them.                                                                                                              |
| `kind`                              | No       | `"memory"` \| `"context-engine"` | Declares an exclusive plugin kind used by `plugins.slots.*`.                                                                                                                                                 |
| `channels`                          | No       | `string[]`                       | Channel ids owned by this plugin. Used for discovery and config validation.                                                                                                                                  |
| `providers`                         | No       | `string[]`                       | Provider ids owned by this plugin.                                                                                                                                                                           |
| `modelSupport`                      | No       | `object`                         | Manifest-owned shorthand model-family metadata used to auto-load the plugin before runtime.                                                                                                                  |
| `cliBackends`                       | No       | `string[]`                       | CLI inference backend ids owned by this plugin. Used for startup auto-activation from explicit config refs.                                                                                                  |
| `commandAliases`                    | No       | `object[]`                       | Command names owned by this plugin that should produce plugin-aware config and CLI diagnostics before runtime loads.                                                                                         |
| `providerAuthEnvVars`               | No       | `Record<string, string[]>`       | Cheap provider-auth env metadata that OpenClaw can inspect without loading plugin code.                                                                                                                      |
| `providerAuthAliases`               | No       | `Record<string, string>`         | Provider ids that should reuse another provider id for auth lookup, for example a coding provider that shares the base provider API key and auth profiles.                                                   |
| `channelEnvVars`                    | No       | `Record<string, string[]>`       | Cheap channel env metadata that OpenClaw can inspect without loading plugin code. Use this for env-driven channel setup or auth surfaces that generic startup/config helpers should see.                     |
| `providerAuthChoices`               | No       | `object[]`                       | Cheap auth-choice metadata for onboarding pickers, preferred-provider resolution, and simple CLI flag wiring.                                                                                                |
| `activation`                        | No       | `object`                         | Cheap activation hints for provider, command, channel, route, and capability-triggered loading. Metadata only; plugin runtime still owns actual behavior.                                                    |
| `setup`                             | No       | `object`                         | Cheap setup/onboarding descriptors that discovery and setup surfaces can inspect without loading plugin runtime.                                                                                             |
| `contracts`                         | No       | `object`                         | Static bundled capability snapshot for speech, realtime transcription, realtime voice, media-understanding, image-generation, music-generation, video-generation, web-fetch, web search, and tool ownership. |
| `channelConfigs`                    | No       | `Record<string, object>`         | Manifest-owned channel config metadata merged into discovery and validation surfaces before runtime loads.                                                                                                   |
| `skills`                            | No       | `string[]`                       | Skill directories to load, relative to the plugin root.                                                                                                                                                      |
| `name`                              | No       | `string`                         | Human-readable plugin name.                                                                                                                                                                                  |
| `description`                       | No       | `string`                         | Short summary shown in plugin surfaces.                                                                                                                                                                      |
| `version`                           | No       | `string`                         | Informational plugin version.                                                                                                                                                                                |
| `uiHints`                           | No       | `Record<string, object>`         | UI labels, placeholders, and sensitivity hints for config fields.                                                                                                                                            |

## providerAuthChoices reference

Each `providerAuthChoices` entry describes one onboarding or auth choice.
OpenClaw reads this before provider runtime loads.

| Field                 | Required | Type                                            | What it means                                                                                            |
| --------------------- | -------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `provider`            | Yes      | `string`                                        | Provider id this choice belongs to.                                                                      |
| `method`              | Yes      | `string`                                        | Auth method id to dispatch to.                                                                           |
| `choiceId`            | Yes      | `string`                                        | Stable auth-choice id used by onboarding and CLI flows.                                                  |
| `choiceLabel`         | No       | `string`                                        | User-facing label. If omitted, OpenClaw falls back to `choiceId`.                                        |
| `choiceHint`          | No       | `string`                                        | Short helper text for the picker.                                                                        |
| `assistantPriority`   | No       | `number`                                        | Lower values sort earlier in assistant-driven interactive pickers.                                       |
| `assistantVisibility` | No       | `"visible"` \| `"manual-only"`                  | Hide the choice from assistant pickers while still allowing manual CLI selection.                        |
| `deprecatedChoiceIds` | No       | `string[]`                                      | Legacy choice ids that should redirect users to this replacement choice.                                 |
| `groupId`             | No       | `string`                                        | Optional group id for grouping related choices.                                                          |
| `groupLabel`          | No       | `string`                                        | User-facing label for that group.                                                                        |
| `groupHint`           | No       | `string`                                        | Short helper text for the group.                                                                         |
| `optionKey`           | No       | `string`                                        | Internal option key for simple one-flag auth flows.                                                      |
| `cliFlag`             | No       | `string`                                        | CLI flag name, such as `--openrouter-api-key`.                                                           |
| `cliOption`           | No       | `string`                                        | Full CLI option shape, such as `--openrouter-api-key <key>`.                                             |
| `cliDescription`      | No       | `string`                                        | Description used in CLI help.                                                                            |
| `onboardingScopes`    | No       | `Array<"text-inference" \| "image-generation">` | Which onboarding surfaces this choice should appear in. If omitted, it defaults to `["text-inference"]`. |

## commandAliases reference

Use `commandAliases` when a plugin owns a runtime command name that users may
mistakenly put in `plugins.allow` or try to run as a root CLI command. OpenClaw
uses this metadata for diagnostics without importing plugin runtime code.

```json
{
  "commandAliases": [
    {
      "name": "dreaming",
      "kind": "runtime-slash",
      "cliCommand": "memory"
    }
  ]
}
```

| Field        | Required | Type              | What it means                                                           |
| ------------ | -------- | ----------------- | ----------------------------------------------------------------------- |
| `name`       | Yes      | `string`          | Command name that belongs to this plugin.                               |
| `kind`       | No       | `"runtime-slash"` | Marks the alias as a chat slash command rather than a root CLI command. |
| `cliCommand` | No       | `string`          | Related root CLI command to suggest for CLI operations, if one exists.  |

## activation reference

Use `activation` when the plugin can cheaply declare which control-plane events
should activate it later.

This block is metadata only. It does not register runtime behavior, and it does
not replace `register(...)`, `setupEntry`, or other runtime/plugin entrypoints.
Current consumers use it as a narrowing hint before broader plugin loading, so
missing activation metadata usually only costs performance; it should not
change correctness while legacy manifest ownership fallbacks still exist.

```json
{
  "activation": {
    "onProviders": ["openai"],
    "onCommands": ["models"],
    "onChannels": ["web"],
    "onRoutes": ["gateway-webhook"],
    "onCapabilities": ["provider", "tool"]
  }
}
```

| Field            | Required | Type                                                 | What it means                                                     |
| ---------------- | -------- | ---------------------------------------------------- | ----------------------------------------------------------------- |
| `onProviders`    | No       | `string[]`                                           | Provider ids that should activate this plugin when requested.     |
| `onCommands`     | No       | `string[]`                                           | Command ids that should activate this plugin.                     |
| `onChannels`     | No       | `string[]`                                           | Channel ids that should activate this plugin.                     |
| `onRoutes`       | No       | `string[]`                                           | Route kinds that should activate this plugin.                     |
| `onCapabilities` | No       | `Array<"provider" \| "channel" \| "tool" \| "hook">` | Broad capability hints used by control-plane activation planning. |

Current live consumers:

- command-triggered CLI planning falls back to legacy
  `commandAliases[].cliCommand` or `commandAliases[].name`
- channel-triggered setup/channel planning falls back to legacy `channels[]`
  ownership when explicit channel activation metadata is missing
- provider-triggered setup/runtime planning falls back to legacy
  `providers[]` and top-level `cliBackends[]` ownership when explicit provider
  activation metadata is missing

## setup reference

Use `setup` when setup and onboarding surfaces need cheap plugin-owned metadata
before runtime loads.

```json
{
  "setup": {
    "providers": [
      {
        "id": "openai",
        "authMethods": ["api-key"],
        "envVars": ["OPENAI_API_KEY"]
      }
    ],
    "cliBackends": ["openai-cli"],
    "configMigrations": ["legacy-openai-auth"],
    "requiresRuntime": false
  }
}
```

Top-level `cliBackends` stays valid and continues to describe CLI inference
backends. `setup.cliBackends` is the setup-specific descriptor surface for
control-plane/setup flows that should stay metadata-only.

When present, `setup.providers` and `setup.cliBackends` are the preferred
descriptor-first lookup surface for setup discovery. If the descriptor only
narrows the candidate plugin and setup still needs richer setup-time runtime
hooks, set `requiresRuntime: true` and keep `setup-api` in place as the
fallback execution path.

Because setup lookup can execute plugin-owned `setup-api` code, normalized
`setup.providers[].id` and `setup.cliBackends[]` values must stay unique across
discovered plugins. Ambiguous ownership fails closed instead of picking a
winner from discovery order.

### setup.providers reference

| Field         | Required | Type       | What it means                                                                        |
| ------------- | -------- | ---------- | ------------------------------------------------------------------------------------ |
| `id`          | Yes      | `string`   | Provider id exposed during setup or onboarding. Keep normalized ids globally unique. |
| `authMethods` | No       | `string[]` | Setup/auth method ids this provider supports without loading full runtime.           |
| `envVars`     | No       | `string[]` | Env vars that generic setup/status surfaces can check before plugin runtime loads.   |

### setup fields

| Field              | Required | Type       | What it means                                                                                       |
| ------------------ | -------- | ---------- | --------------------------------------------------------------------------------------------------- |
| `providers`        | No       | `object[]` | Provider setup descriptors exposed during setup and onboarding.                                     |