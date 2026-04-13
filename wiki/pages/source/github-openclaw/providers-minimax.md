---
title: MiniMax
tags: [entity, providers]
sourcePath: sources/github/openclaw/docs/providers/minimax.md
ingestDate: 2026-04-13
type: documentation
---


# MiniMax

OpenClaw's MiniMax provider defaults to **MiniMax M2.7**.

MiniMax also provides:

- Bundled speech synthesis via T2A v2
- Bundled image understanding via `MiniMax-VL-01`
- Bundled music generation via `music-2.5+`
- Bundled `web_search` through the MiniMax Coding Plan search API

Provider split:

| Provider ID      | Auth    | Capabilities                                                    |
| ---------------- | ------- | --------------------------------------------------------------- |
| `minimax`        | API key | Text, image generation, image understanding, speech, web search |
| `minimax-portal` | OAuth   | Text, image generation, image understanding                     |

## Model lineup

| Model                    | Type             | Description                              |
| ------------------------ | ---------------- | ---------------------------------------- |
| `MiniMax-M2.7`           | Chat (reasoning) | Default hosted reasoning model           |
| `MiniMax-M2.7-highspeed` | Chat (reasoning) | Faster M2.7 reasoning tier               |
| `MiniMax-VL-01`          | Vision           | Image understanding model                |
| `image-01`               | Image generation | Text-to-image and image-to-image editing |
| `music-2.5+`             | Music generation | Default music model                      |
| `music-2.5`              | Music generation | Previous music generation tier           |
| `music-2.0`              | Music generation | Legacy music generation tier             |
| `MiniMax-Hailuo-2.3`     | Video generation | Text-to-video and image reference flows  |

## Getting started

Choose your preferred auth method and follow the setup steps.

<Tabs>
  <Tab title="OAuth (Coding Plan)">
    **Best for:** quick setup with MiniMax Coding Plan via OAuth, no API key required.

    <Tabs>
      <Tab title="International">
        <Steps>
          <Step title="Run onboarding">
            ```bash
            openclaw onboard --auth-choice minimax-global-oauth
            ```

            This authenticates against `api.minimax.io`.
          </Step>
          <Step title="Verify the model is available">
            ```bash
            openclaw models list --provider minimax-portal
            ```
          </Step>
        </Steps>
      </Tab>
      <Tab title="China">
        <Steps>
          <Step title="Run onboarding">
            ```bash
            openclaw onboard --auth-choice minimax-cn-oauth
            ```

            This authenticates against `api.minimaxi.com`.
          </Step>
          <Step title="Verify the model is available">
            ```bash
            openclaw models list --provider minimax-portal
            ```
          </Step>
        </Steps>
      </Tab>
    </Tabs>

    <Note>
    OAuth setups use the `minimax-portal` provider id. Model refs follow the form `minimax-portal/MiniMax-M2.7`.
    </Note>

    <Tip>
    Referral link for MiniMax Coding Plan (10% off): [MiniMax Coding Plan](https://platform.minimax.io/subscribe/coding-plan?code=DbXJTRClnb&source=link)
    </Tip>

  </Tab>

  <Tab title="API key">
    **Best for:** hosted MiniMax with Anthropic-compatible API.

    <Tabs>
      <Tab title="International">
        <Steps>
          <Step title="Run onboarding">
            ```bash
            openclaw onboard --auth-choice minimax-global-api
            ```

            This configures `api.minimax.io` as the base URL.
          </Step>
          <Step title="Verify the model is available">
            ```bash
            openclaw models list --provider minimax
            ```
          </Step>
        </Steps>
      </Tab>
      <Tab title="China">
        <Steps>
          <Step title="Run onboarding">
            ```bash
            openclaw onboard --auth-choice minimax-cn-api
            ```

            This configures `api.minimaxi.com` as the base URL.
          </Step>
          <Step title="Verify the model is available">
            ```bash
            openclaw models list --provider minimax
            ```
          </Step>
        </Steps>
      </Tab>
    </Tabs>

    ### Config example

    ```json5
    {
      env: { MINIMAX_API_KEY: "sk-..." },
      agents: { defaults: { model: { primary: "minimax/MiniMax-M2.7" } } },
      models: {
        mode: "merge",
        providers: {
          minimax: {
            baseUrl: "https://api.minimax.io/anthropic",
            apiKey: "${MINIMAX_API_KEY}",
            api: "anthropic-messages",
            models: [
              {
                id: "MiniMax-M2.7",
                name: "MiniMax M2.7",
                reasoning: true,
                input: ["text", "image"],
                cost: { input: 0.3, output: 1.2, cacheRead: 0.06, cacheWrite: 0.375 },
                contextWindow: 204800,
                maxTokens: 131072,
              },
              {
                id: "MiniMax-M2.7-highspeed",
                name: "MiniMax M2.7 Highspeed",
                reasoning: true,
                input: ["text", "image"],
                cost: { input: 0.6, output: 2.4, cacheRead: 0.06, cacheWrite: 0.375 },
                contextWindow: 204800,
                maxTokens: 131072,
              },
            ],
          },
        },
      },
    }
    ```

    <Warning>
    On the Anthropic-compatible streaming path, OpenClaw disables MiniMax thinking by default unless you explicitly set `thinking` yourself. MiniMax's streaming endpoint emits `reasoning_content` in OpenAI-style delta chunks instead of native Anthropic thinking blocks, which can leak internal reasoning into visible output if left enabled implicitly.
    </Warning>

    <Note>
    API-key setups use the `minimax` provider id. Model refs follow the form `minimax/MiniMax-M2.7`.
    </Note>

  </Tab>
</Tabs>

## Configure via `openclaw configure`

Use the interactive config wizard to set MiniMax without editing JSON:

<Steps>
  <Step title="Launch the wizard">
    ```bash
    openclaw configure
    ```
  </Step>
  <Step title="Select Model/auth">
    Choose **Model/auth** from the menu.
  </Step>
  <Step title="Choose a MiniMax auth option">
    Pick one of the available MiniMax options:

    | Auth choice | Description |
    | --- | --- |
    | `minimax-global-oauth` | International OAuth (Coding Plan) |
    | `minimax-cn-oauth` | China OAuth (Coding Plan) |
    | `minimax-global-api` | International API key |
    | `minimax-cn-api` | China API key |

  </Step>
  <Step title="Pick your default model">
    Select your default model when prompted.
  </Step>
</Steps>

## Capabilities

### Image generation

The MiniMax plugin registers the `image-01` model for the `image_generate` tool. It supports:

- **Text-to-image generation** with aspect ratio control
- **Image-to-image editing** (subject reference) with aspect ratio control
- Up to **9 output images** per request
- Up to **1 reference image** per edit request
- Supported aspect ratios: `1:1`, `16:9`, `4:3`, `3:2`, `2:3`, `3:4`, `9:16`, `21:9`

To use MiniMax for image generation, set it as the image generation provider:

```json5
{
  agents: {
    defaults: {
      imageGenerationModel: { primary: "minimax/image-01" },
    },
  },
}
```

The plugin uses the same `MINIMAX_API_KEY` or OAuth auth as the text models. No additional configuration is needed if MiniMax is already set up.

Both `minimax` and `minimax-portal` register `image_generate` with the same
`image-01` model. API-key setups use `MINIMAX_API_KEY`; OAuth setups can use
the bundled `minimax-portal` auth path instead.

When onboarding or API-key setup writes explicit `models.providers.minimax`
entries, OpenClaw materializes `MiniMax-M2.7` and
`MiniMax-M2.7-highspeed` with `input: ["text", "image"]`.

The built-in bundled MiniMax text catalog itself stays text-only metadata until
that explicit provider config exists. Image understanding is exposed separately
through the plugin-owned `MiniMax-VL-01` media provider.

<Note>
See [Image Generation](/tools/image-generation) for shared tool parameters, provider selection, and failover behavior.
</Note>

### Music generation

The bundled `minimax` plugin also registers music generation through the shared
`music_generate` tool.

- Default music model: `minimax/music-2.5+`
- Also supports `minimax/music-2.5` and `minimax/music-2.0`
- Prompt controls: `lyrics`, `instrumental`, `durationSeconds`
- Output format: `mp3`
- Session-backed runs detach through the shared task/status flow, including `action: "status"`

To use MiniMax as the default music provider:

```json5
{
  agents: {
    defaults: {
      musicGenerationModel: {
        primary: "minimax/music-2.5+",
      },
    },
  },
}
```

<Note>
See [Music Generation](/tools/music-generation) for shared tool parameters, provider selection, and failover behavior.
</Note>

### Video generation

The bundled `minimax` plugin also registers video generation through the shared
`video_generate` tool.

- Default video model: `minimax/MiniMax-Hailuo-2.3`
- Modes: text-to-video and single-image reference flows
- Supports `aspectRatio` and `resolution`

To use MiniMax as the default video provider:

```json5
{
  agents: {
    defaults: {
      videoGenerationModel: {
        primary: "minimax/MiniMax-Hailuo-2.3",
      },
    },
  },
}
```

<Note>
See [Video Generation](/tools/video-generation) for shared tool parameters, provider selection, and failover behavior.
</Note>
