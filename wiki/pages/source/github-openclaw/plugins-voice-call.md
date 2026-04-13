---
title: Voice Call (plugin)
tags: [entity, plugins]
sourcePath: sources/github/openclaw/docs/plugins/voice-call.md
ingestDate: 2026-04-13
type: documentation
---


# Voice Call (plugin)

Voice calls for OpenClaw via a plugin. Supports outbound notifications and
multi-turn conversations with inbound policies.

Current providers:

- `twilio` (Programmable Voice + Media Streams)
- `telnyx` (Call Control v2)
- `plivo` (Voice API + XML transfer + GetInput speech)
- `mock` (dev/no network)

Quick mental model:

- Install plugin
- Restart Gateway
- Configure under `plugins.entries.voice-call.config`
- Use `openclaw voicecall ...` or the `voice_call` tool

## Where it runs (local vs remote)

The Voice Call plugin runs **inside the Gateway process**.

If you use a remote Gateway, install/configure the plugin on the **machine running the Gateway**, then restart the Gateway to load it.

## Install

### Option A: install from npm (recommended)

```bash
openclaw plugins install @openclaw/voice-call
```

Restart the Gateway afterwards.

### Option B: install from a local folder (dev, no copying)

```bash
PLUGIN_SRC=./path/to/local/voice-call-plugin
openclaw plugins install "$PLUGIN_SRC"
cd "$PLUGIN_SRC" && pnpm install
```

Restart the Gateway afterwards.

## Config

Set config under `plugins.entries.voice-call.config`:

```json5
{
  plugins: {
    entries: {
      "voice-call": {
        enabled: true,
        config: {
          provider: "twilio", // or "telnyx" | "plivo" | "mock"
          fromNumber: "+15550001234",
          toNumber: "+15550005678",

          twilio: {
            accountSid: "ACxxxxxxxx",
            authToken: "...",
          },

          telnyx: {
            apiKey: "...",
            connectionId: "...",
            // Telnyx webhook public key from the Telnyx Mission Control Portal
            // (Base64 string; can also be set via TELNYX_PUBLIC_KEY).
            publicKey: "...",
          },

          plivo: {
            authId: "MAxxxxxxxxxxxxxxxxxxxx",
            authToken: "...",
          },

          // Webhook server
          serve: {
            port: 3334,
            path: "/voice/webhook",
          },

          // Webhook security (recommended for tunnels/proxies)
          webhookSecurity: {
            allowedHosts: ["voice.example.com"],
            trustedProxyIPs: ["100.64.0.1"],
          },

          // Public exposure (pick one)
          // publicUrl: "https://example.ngrok.app/voice/webhook",
          // tunnel: { provider: "ngrok" },
          // tailscale: { mode: "funnel", path: "/voice/webhook" }

          outbound: {
            defaultMode: "notify", // notify | conversation
          },

          streaming: {
            enabled: true,
            provider: "openai", // optional; first registered realtime transcription provider when unset
            streamPath: "/voice/stream",
            providers: {
              openai: {
                apiKey: "sk-...", // optional if OPENAI_API_KEY is set
                model: "gpt-4o-transcribe",
                silenceDurationMs: 800,
                vadThreshold: 0.5,
              },
            },
            preStartTimeoutMs: 5000,
            maxPendingConnections: 32,
            maxPendingConnectionsPerIp: 4,
            maxConnections: 128,
          },
        },
      },
    },
  },
}
```

Notes:

- Twilio/Telnyx require a **publicly reachable** webhook URL.
- Plivo requires a **publicly reachable** webhook URL.
- `mock` is a local dev provider (no network calls).
- If older configs still use `provider: "log"`, `twilio.from`, or legacy `streaming.*` OpenAI keys, run `openclaw doctor --fix` to rewrite them.
- Telnyx requires `telnyx.publicKey` (or `TELNYX_PUBLIC_KEY`) unless `skipSignatureVerification` is true.
- `skipSignatureVerification` is for local testing only.
- If you use ngrok free tier, set `publicUrl` to the exact ngrok URL; signature verification is always enforced.
- `tunnel.allowNgrokFreeTierLoopbackBypass: true` allows Twilio webhooks with invalid signatures **only** when `tunnel.provider="ngrok"` and `serve.bind` is loopback (ngrok local agent). Use for local dev only.
- Ngrok free tier URLs can change or add interstitial behavior; if `publicUrl` drifts, Twilio signatures will fail. For production, prefer a stable domain or Tailscale funnel.
- Streaming security defaults:
  - `streaming.preStartTimeoutMs` closes sockets that never send a valid `start` frame.
- `streaming.maxPendingConnections` caps total unauthenticated pre-start sockets.
- `streaming.maxPendingConnectionsPerIp` caps unauthenticated pre-start sockets per source IP.
- `streaming.maxConnections` caps total open media stream sockets (pending + active).
- Runtime fallback still accepts those old voice-call keys for now, but the rewrite path is `openclaw doctor --fix` and the compat shim is temporary.

## Streaming transcription

`streaming` selects a realtime transcription provider for live call audio.

Current runtime behavior:

- `streaming.provider` is optional. If unset, Voice Call uses the first
  registered realtime transcription provider.
- Today the bundled provider is OpenAI, registered by the bundled `openai`
  plugin.
- Provider-owned raw config lives under `streaming.providers.<providerId>`.
- If `streaming.provider` points at an unregistered provider, or no realtime
  transcription provider is registered at all, Voice Call logs a warning and
  skips media streaming instead of failing the whole plugin.

OpenAI streaming transcription defaults:

- API key: `streaming.providers.openai.apiKey` or `OPENAI_API_KEY`
- model: `gpt-4o-transcribe`
- `silenceDurationMs`: `800`
- `vadThreshold`: `0.5`

Example:

```json5
{
  plugins: {
    entries: {
      "voice-call": {
        config: {
          streaming: {
            enabled: true,
            provider: "openai",
            streamPath: "/voice/stream",
            providers: {
              openai: {
                apiKey: "sk-...", // optional if OPENAI_API_KEY is set
                model: "gpt-4o-transcribe",
                silenceDurationMs: 800,
                vadThreshold: 0.5,
              },
            },
          },
        },
      },
    },
  },
}
```

Legacy keys are still auto-migrated by `openclaw doctor --fix`:

- `streaming.sttProvider` → `streaming.provider`
- `streaming.openaiApiKey` → `streaming.providers.openai.apiKey`
- `streaming.sttModel` → `streaming.providers.openai.model`
- `streaming.silenceDurationMs` → `streaming.providers.openai.silenceDurationMs`
- `streaming.vadThreshold` → `streaming.providers.openai.vadThreshold`

## Stale call reaper

Use `staleCallReaperSeconds` to end calls that never receive a terminal webhook
(for example, notify-mode calls that never complete). The default is `0`
(disabled).

Recommended ranges:

- **Production:** `120`–`300` seconds for notify-style flows.
- Keep this value **higher than `maxDurationSeconds`** so normal calls can
  finish. A good starting point is `maxDurationSeconds + 30–60` seconds.

Example:

```json5
{
  plugins: {
    entries: {
      "voice-call": {
        config: {
          maxDurationSeconds: 300,
          staleCallReaperSeconds: 360,
        },
      },
    },
  },
}
```

## Webhook Security

When a proxy or tunnel sits in front of the Gateway, the plugin reconstructs the
public URL for signature verification. These options control which forwarded
headers are trusted.

`webhookSecurity.allowedHosts` allowlists hosts from forwarding headers.

`webhookSecurity.trustForwardingHeaders` trusts forwarded headers without an allowlist.

`webhookSecurity.trustedProxyIPs` only trusts forwarded headers when the request
remote IP matches the list.

Webhook replay protection is enabled for Twilio and Plivo. Replayed valid webhook
requests are acknowledged but skipped for side effects.

Twilio conversation turns include a per-turn token in `<Gather>` callbacks, so
stale/replayed speech callbacks cannot satisfy a newer pending transcript turn.

Unauthenticated webhook requests are rejected before body reads when the
provider's required signature headers are missing.

The voice-call webhook uses the shared pre-auth body profile (64 KB / 5 seconds)
plus a per-IP in-flight cap before signature verification.

Example with a stable public host:

```json5
{
  plugins: {
    entries: {
      "voice-call": {
        config: {
          publicUrl: "https://voice.example.com/voice/webhook",
          webhookSecurity: {
            allowedHosts: ["voice.example.com"],
          },
        },
      },
    },
  },
}
```

## TTS for calls

Voice Call uses the core `messages.tts` configuration for
streaming speech on calls. You can override it under the plugin config with the
**same shape** — it deep‑merges with `messages.tts`.

```json5
{
  tts: {
    provider: "elevenlabs",
    providers: {
      elevenlabs: {
        voiceId: "pMsXgVXv3BLzUgSXRplE",
        modelId: "eleven_multilingual_v2",
      },
    },
  },
}
```

Notes:

- Legacy `tts.<provider>` keys inside plugin config (`openai`, `elevenlabs`, `microsoft`, `edge`) are auto-migrated to `tts.providers.<provider>` on load. Prefer the `providers` shape in committed config.
- **Microsoft speech is ignored for voice calls** (telephony audio needs PCM; the current Microsoft transport does not expose telephony PCM output).
- Core TTS is used when Twilio media streaming is enabled; otherwise calls fall back to provider native voices.
- If a Twilio media stream is already active, Voice Call does not fall back to TwiML `<Say>`. If telephony TTS is unavailable in that state, the playback request fails instead of mixing two playback paths.
- When telephony TTS falls back to a secondary provider, Voice Call logs a warning with the provider chain (`from`, `to`, `attempts`) for debugging.