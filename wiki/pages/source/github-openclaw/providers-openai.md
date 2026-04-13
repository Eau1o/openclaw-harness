---
title: OpenAI
tags: [entity, providers]
sourcePath: sources/github/openclaw/docs/providers/openai.md
ingestDate: 2026-04-13
type: documentation
---


# OpenAI

OpenAI provides developer APIs for GPT models. OpenClaw supports two auth routes:

- **API key** — direct OpenAI Platform access with usage-based billing (`openai/*` models)
- **Codex subscription** — ChatGPT/Codex sign-in with subscription access (`openai-codex/*` models)

OpenAI explicitly supports subscription OAuth usage in external tools and workflows like OpenClaw.

## Getting started

Choose your preferred auth method and follow the setup steps.

<Tabs>
  <Tab title="API key (OpenAI Platform)">
    **Best for:** direct API access and usage-based billing.

    <Steps>
      <Step title="Get your API key">
        Create or copy an API key from the [OpenAI Platform dashboard](https://platform.openai.com/api-keys).
      </Step>
      <Step title="Run onboarding">
        ```bash
        openclaw onboard --auth-choice openai-api-key
        ```

        Or pass the key directly:

        ```bash
        openclaw onboard --openai-api-key "$OPENAI_API_KEY"
        ```
      </Step>
      <Step title="Verify the model is available">
        ```bash
        openclaw models list --provider openai
        ```
      </Step>
    </Steps>

    ### Route summary

    | Model ref | Route | Auth |
    |-----------|-------|------|
    | `openai/gpt-5.4` | Direct OpenAI Platform API | `OPENAI_API_KEY` |
    | `openai/gpt-5.4-pro` | Direct OpenAI Platform API | `OPENAI_API_KEY` |

    <Note>
    ChatGPT/Codex sign-in is routed through `openai-codex/*`, not `openai/*`.
    </Note>

    ### Config example

    ```json5
    {
      env: { OPENAI_API_KEY: "sk-..." },
      agents: { defaults: { model: { primary: "openai/gpt-5.4" } } },
    }
    ```

    <Warning>
    OpenClaw does **not** expose `openai/gpt-5.3-codex-spark` on the direct API path. Live OpenAI API requests reject that model. Spark is Codex-only.
    </Warning>

  </Tab>

  <Tab title="Codex subscription">
    **Best for:** using your ChatGPT/Codex subscription instead of a separate API key. Codex cloud requires ChatGPT sign-in.

    <Steps>
      <Step title="Run Codex OAuth">
        ```bash
        openclaw onboard --auth-choice openai-codex
        ```

        Or run OAuth directly:

        ```bash
        openclaw models auth login --provider openai-codex
        ```
      </Step>
      <Step title="Set the default model">
        ```bash
        openclaw config set agents.defaults.model.primary openai-codex/gpt-5.4
        ```
      </Step>
      <Step title="Verify the model is available">
        ```bash
        openclaw models list --provider openai-codex
        ```
      </Step>
    </Steps>

    ### Route summary

    | Model ref | Route | Auth |
    |-----------|-------|------|
    | `openai-codex/gpt-5.4` | ChatGPT/Codex OAuth | Codex sign-in |
    | `openai-codex/gpt-5.3-codex-spark` | ChatGPT/Codex OAuth | Codex sign-in (entitlement-dependent) |

    <Note>
    This route is intentionally separate from `openai/gpt-5.4`. Use `openai/*` with an API key for direct Platform access, and `openai-codex/*` for Codex subscription access.
    </Note>

    ### Config example

    ```json5
    {
      agents: { defaults: { model: { primary: "openai-codex/gpt-5.4" } } },
    }
    ```

    <Tip>
    If onboarding reuses an existing Codex CLI login, those credentials stay managed by Codex CLI. On expiry, OpenClaw re-reads the external Codex source first and writes the refreshed credential back to Codex storage.
    </Tip>

    ### Context window cap

    OpenClaw treats model metadata and the runtime context cap as separate values.

    For `openai-codex/gpt-5.4`:

    - Native `contextWindow`: `1050000`
    - Default runtime `contextTokens` cap: `272000`

    The smaller default cap has better latency and quality characteristics in practice. Override it with `contextTokens`:

    ```json5
    {
      models: {
        providers: {
          "openai-codex": {
            models: [{ id: "gpt-5.4", contextTokens: 160000 }],
          },
        },
      },
    }
    ```

    <Note>
    Use `contextWindow` to declare native model metadata. Use `contextTokens` to limit the runtime context budget.
    </Note>

  </Tab>
</Tabs>

## Image generation

The bundled `openai` plugin registers image generation through the `image_generate` tool.

| Capability                | Value                              |
| ------------------------- | ---------------------------------- |
| Default model             | `openai/gpt-image-1`               |
| Max images per request    | 4                                  |
| Edit mode                 | Enabled (up to 5 reference images) |
| Size overrides            | Supported                          |
| Aspect ratio / resolution | Not forwarded to OpenAI Images API |

```json5
{
  agents: {
    defaults: {
      imageGenerationModel: { primary: "openai/gpt-image-1" },
    },
  },
}
```

<Note>
See [Image Generation](/tools/image-generation) for shared tool parameters, provider selection, and failover behavior.
</Note>

## Video generation

The bundled `openai` plugin registers video generation through the `video_generate` tool.

| Capability       | Value                                                                             |
| ---------------- | --------------------------------------------------------------------------------- |
| Default model    | `openai/sora-2`                                                                   |
| Modes            | Text-to-video, image-to-video, single-video edit                                  |
| Reference inputs | 1 image or 1 video                                                                |
| Size overrides   | Supported                                                                         |
| Other overrides  | `aspectRatio`, `resolution`, `audio`, `watermark` are ignored with a tool warning |

```json5
{
  agents: {
    defaults: {
      videoGenerationModel: { primary: "openai/sora-2" },
    },
  },
}
```

<Note>
See [Video Generation](/tools/video-generation) for shared tool parameters, provider selection, and failover behavior.
</Note>

## Personality overlay

OpenClaw adds a small OpenAI-specific prompt overlay for `openai/*` and `openai-codex/*` runs. The overlay keeps the assistant warm, collaborative, concise, and a little more emotionally expressive without replacing the base system prompt.

| Value                  | Effect                             |
| ---------------------- | ---------------------------------- |
| `"friendly"` (default) | Enable the OpenAI-specific overlay |
| `"on"`                 | Alias for `"friendly"`             |
| `"off"`                | Use base OpenClaw prompt only      |

<Tabs>
  <Tab title="Config">
    ```json5
    {
      plugins: {
        entries: {
          openai: { config: { personality: "friendly" } },
        },
      },
    }
    ```
  </Tab>
  <Tab title="CLI">
    ```bash
    openclaw config set plugins.entries.openai.config.personality off
    ```
  </Tab>
</Tabs>

<Tip>
Values are case-insensitive at runtime, so `"Off"` and `"off"` both disable the overlay.
</Tip>

## Voice and speech

<AccordionGroup>
  <Accordion title="Speech synthesis (TTS)">
    The bundled `openai` plugin registers speech synthesis for the `messages.tts` surface.

    | Setting | Config path | Default |
    |---------|------------|---------|
    | Model | `messages.tts.providers.openai.model` | `gpt-4o-mini-tts` |
    | Voice | `messages.tts.providers.openai.voice` | `coral` |
    | Speed | `messages.tts.providers.openai.speed` | (unset) |
    | Instructions | `messages.tts.providers.openai.instructions` | (unset, `gpt-4o-mini-tts` only) |
    | Format | `messages.tts.providers.openai.responseFormat` | `opus` for voice notes, `mp3` for files |
    | API key | `messages.tts.providers.openai.apiKey` | Falls back to `OPENAI_API_KEY` |
    | Base URL | `messages.tts.providers.openai.baseUrl` | `https://api.openai.com/v1` |

    Available models: `gpt-4o-mini-tts`, `tts-1`, `tts-1-hd`. Available voices: `alloy`, `ash`, `ballad`, `cedar`, `coral`, `echo`, `fable`, `juniper`, `marin`, `onyx`, `nova`, `sage`, `shimmer`, `verse`.

    ```json5
    {
      messages: {
        tts: {
          providers: {
            openai: { model: "gpt-4o-mini-tts", voice: "coral" },
          },
        },
      },
    }
    ```

    <Note>
    Set `OPENAI_TTS_BASE_URL` to override the TTS base URL without affecting the chat API endpoint.
    </Note>

  </Accordion>

  <Accordion title="Realtime transcription">
    The bundled `openai` plugin registers realtime transcription for the Voice Call plugin.

    | Setting | Config path | Default |
    |---------|------------|---------|
    | Model | `plugins.entries.voice-call.config.streaming.providers.openai.model` | `gpt-4o-transcribe` |
    | Silence duration | `...openai.silenceDurationMs` | `800` |
    | VAD threshold | `...openai.vadThreshold` | `0.5` |
    | API key | `...openai.apiKey` | Falls back to `OPENAI_API_KEY` |

    <Note>
    Uses a WebSocket connection to `wss://api.openai.com/v1/realtime` with G.711 u-law audio.
    </Note>

  </Accordion>

  <Accordion title="Realtime voice">
    The bundled `openai` plugin registers realtime voice for the Voice Call plugin.

    | Setting | Config path | Default |
    |---------|------------|---------|
    | Model | `plugins.entries.voice-call.config.realtime.providers.openai.model` | `gpt-realtime` |
    | Voice | `...openai.voice` | `alloy` |
    | Temperature | `...openai.temperature` | `0.8` |
    | VAD threshold | `...openai.vadThreshold` | `0.5` |
    | Silence duration | `...openai.silenceDurationMs` | `500` |
    | API key | `...openai.apiKey` | Falls back to `OPENAI_API_KEY` |

    <Note>
    Supports Azure OpenAI via `azureEndpoint` and `azureDeployment` config keys. Supports bidirectional tool calling. Uses G.711 u-law audio format.
    </Note>

  </Accordion>