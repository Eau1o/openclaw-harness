---
title: Memory configuration reference
tags: [concept, reference]
sourcePath: sources/github/openclaw/docs/reference/memory-config.md
ingestDate: 2026-04-13
type: documentation
---


# Memory configuration reference

This page lists every configuration knob for OpenClaw memory search. For
conceptual overviews, see:

- [Memory Overview](/concepts/memory) -- how memory works
- [Builtin Engine](/concepts/memory-builtin) -- default SQLite backend
- [QMD Engine](/concepts/memory-qmd) -- local-first sidecar
- [Memory Search](/concepts/memory-search) -- search pipeline and tuning
- [Active Memory](/concepts/active-memory) -- enabling the memory sub-agent for interactive sessions

All memory search settings live under `agents.defaults.memorySearch` in
`openclaw.json` unless noted otherwise.

If you are looking for the **active memory** feature toggle and sub-agent config,
that lives under `plugins.entries.active-memory` instead of `memorySearch`.

Active memory uses a two-gate model:

1. the plugin must be enabled and target the current agent id
2. the request must be an eligible interactive persistent chat session

See [Active Memory](/concepts/active-memory) for the activation model,
plugin-owned config, transcript persistence, and safe rollout pattern.

---

## Provider selection

| Key        | Type      | Default          | Description                                                                                 |
| ---------- | --------- | ---------------- | ------------------------------------------------------------------------------------------- |
| `provider` | `string`  | auto-detected    | Embedding adapter ID: `openai`, `gemini`, `voyage`, `mistral`, `bedrock`, `ollama`, `local` |
| `model`    | `string`  | provider default | Embedding model name                                                                        |
| `fallback` | `string`  | `"none"`         | Fallback adapter ID when the primary fails                                                  |
| `enabled`  | `boolean` | `true`           | Enable or disable memory search                                                             |

### Auto-detection order

When `provider` is not set, OpenClaw selects the first available:

1. `local` -- if `memorySearch.local.modelPath` is configured and the file exists.
2. `openai` -- if an OpenAI key can be resolved.
3. `gemini` -- if a Gemini key can be resolved.
4. `voyage` -- if a Voyage key can be resolved.
5. `mistral` -- if a Mistral key can be resolved.
6. `bedrock` -- if the AWS SDK credential chain resolves (instance role, access keys, profile, SSO, web identity, or shared config).

`ollama` is supported but not auto-detected (set it explicitly).

### API key resolution

Remote embeddings require an API key. Bedrock uses the AWS SDK default
credential chain instead (instance roles, SSO, access keys).

| Provider | Env var                        | Config key                        |
| -------- | ------------------------------ | --------------------------------- |
| OpenAI   | `OPENAI_API_KEY`               | `models.providers.openai.apiKey`  |
| Gemini   | `GEMINI_API_KEY`               | `models.providers.google.apiKey`  |
| Voyage   | `VOYAGE_API_KEY`               | `models.providers.voyage.apiKey`  |
| Mistral  | `MISTRAL_API_KEY`              | `models.providers.mistral.apiKey` |
| Bedrock  | AWS credential chain           | No API key needed                 |
| Ollama   | `OLLAMA_API_KEY` (placeholder) | --                                |

Codex OAuth covers chat/completions only and does not satisfy embedding
requests.

---

## Remote endpoint config

For custom OpenAI-compatible endpoints or overriding provider defaults:

| Key              | Type     | Description                                        |
| ---------------- | -------- | -------------------------------------------------- |
| `remote.baseUrl` | `string` | Custom API base URL                                |
| `remote.apiKey`  | `string` | Override API key                                   |
| `remote.headers` | `object` | Extra HTTP headers (merged with provider defaults) |

```json5
{
  agents: {
    defaults: {
      memorySearch: {
        provider: "openai",
        model: "text-embedding-3-small",
        remote: {
          baseUrl: "https://api.example.com/v1/",
          apiKey: "YOUR_KEY",
        },
      },
    },
  },
}
```

---

## Gemini-specific config

| Key                    | Type     | Default                | Description                                |
| ---------------------- | -------- | ---------------------- | ------------------------------------------ |
| `model`                | `string` | `gemini-embedding-001` | Also supports `gemini-embedding-2-preview` |
| `outputDimensionality` | `number` | `3072`                 | For Embedding 2: 768, 1536, or 3072        |

<Warning>
Changing model or `outputDimensionality` triggers an automatic full reindex.
</Warning>

---

## Bedrock embedding config

Bedrock uses the AWS SDK default credential chain -- no API keys needed.
If OpenClaw runs on EC2 with a Bedrock-enabled instance role, just set the
provider and model:

```json5
{
  agents: {
    defaults: {
      memorySearch: {
        provider: "bedrock",
        model: "amazon.titan-embed-text-v2:0",
      },
    },
  },
}
```

| Key                    | Type     | Default                        | Description                     |
| ---------------------- | -------- | ------------------------------ | ------------------------------- |
| `model`                | `string` | `amazon.titan-embed-text-v2:0` | Any Bedrock embedding model ID  |
| `outputDimensionality` | `number` | model default                  | For Titan V2: 256, 512, or 1024 |

### Supported models

The following models are supported (with family detection and dimension
defaults):

| Model ID                                   | Provider   | Default Dims | Configurable Dims    |
| ------------------------------------------ | ---------- | ------------ | -------------------- |
| `amazon.titan-embed-text-v2:0`             | Amazon     | 1024         | 256, 512, 1024       |
| `amazon.titan-embed-text-v1`               | Amazon     | 1536         | --                   |
| `amazon.titan-embed-g1-text-02`            | Amazon     | 1536         | --                   |
| `amazon.titan-embed-image-v1`              | Amazon     | 1024         | --                   |
| `amazon.nova-2-multimodal-embeddings-v1:0` | Amazon     | 1024         | 256, 384, 1024, 3072 |
| `cohere.embed-english-v3`                  | Cohere     | 1024         | --                   |
| `cohere.embed-multilingual-v3`             | Cohere     | 1024         | --                   |
| `cohere.embed-v4:0`                        | Cohere     | 1536         | 256-1536             |
| `twelvelabs.marengo-embed-3-0-v1:0`        | TwelveLabs | 512          | --                   |
| `twelvelabs.marengo-embed-2-7-v1:0`        | TwelveLabs | 1024         | --                   |

Throughput-suffixed variants (e.g., `amazon.titan-embed-text-v1:2:8k`) inherit
the base model's configuration.

### Authentication

Bedrock auth uses the standard AWS SDK credential resolution order:

1. Environment variables (`AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY`)
2. SSO token cache
3. Web identity token credentials
4. Shared credentials and config files
5. ECS or EC2 metadata credentials

Region is resolved from `AWS_REGION`, `AWS_DEFAULT_REGION`, the
`amazon-bedrock` provider `baseUrl`, or defaults to `us-east-1`.

### IAM permissions

The IAM role or user needs:

```json
{
  "Effect": "Allow",
  "Action": "bedrock:InvokeModel",
  "Resource": "*"
}
```

For least-privilege, scope `InvokeModel` to the specific model:

```
arn:aws:bedrock:*::foundation-model/amazon.titan-embed-text-v2:0
```

---

## Local embedding config

| Key                   | Type     | Default                | Description                     |
| --------------------- | -------- | ---------------------- | ------------------------------- |
| `local.modelPath`     | `string` | auto-downloaded        | Path to GGUF model file         |
| `local.modelCacheDir` | `string` | node-llama-cpp default | Cache dir for downloaded models |

Default model: `embeddinggemma-300m-qat-Q8_0.gguf` (~0.6 GB, auto-downloaded).
Requires native build: `pnpm approve-builds` then `pnpm rebuild node-llama-cpp`.

---

## Hybrid search config

All under `memorySearch.query.hybrid`:

| Key                   | Type      | Default | Description                        |
| --------------------- | --------- | ------- | ---------------------------------- |
| `enabled`             | `boolean` | `true`  | Enable hybrid BM25 + vector search |
| `vectorWeight`        | `number`  | `0.7`   | Weight for vector scores (0-1)     |
| `textWeight`          | `number`  | `0.3`   | Weight for BM25 scores (0-1)       |
| `candidateMultiplier` | `number`  | `4`     | Candidate pool size multiplier     |

### MMR (diversity)

| Key           | Type      | Default | Description                          |
| ------------- | --------- | ------- | ------------------------------------ |
| `mmr.enabled` | `boolean` | `false` | Enable MMR re-ranking                |
| `mmr.lambda`  | `number`  | `0.7`   | 0 = max diversity, 1 = max relevance |

### Temporal decay (recency)

| Key                          | Type      | Default | Description               |
| ---------------------------- | --------- | ------- | ------------------------- |
| `temporalDecay.enabled`      | `boolean` | `false` | Enable recency boost      |
| `temporalDecay.halfLifeDays` | `number`  | `30`    | Score halves every N days |

Evergreen files (`MEMORY.md`, non-dated files in `memory/`) are never decayed.

### Full example

```json5
{
  agents: {
    defaults: {
      memorySearch: {
        query: {
          hybrid: {
            vectorWeight: 0.7,
            textWeight: 0.3,
            mmr: { enabled: true, lambda: 0.7 },
            temporalDecay: { enabled: true, halfLifeDays: 30 },
          },
        },
      },
    },
  },
}
```

---

## Additional memory paths

| Key          | Type       | Description                              |
| ------------ | ---------- | ---------------------------------------- |
| `extraPaths` | `string[]` | Additional directories or files to index |

```json5
{
  agents: {
    defaults: {
      memorySearch: {
        extraPaths: ["../team-docs", "/srv/shared-notes"],
      },
    },
  },
}
```

Paths can be absolute or workspace-relative. Directories are scanned
recursively for `.md` files. Symlink handling depends on the active backend:
the builtin engine ignores symlinks, while QMD follows the underlying QMD
scanner behavior.

For agent-scoped cross-agent transcript search, use
`agents.list[].memorySearch.qmd.extraCollections` instead of `memory.qmd.paths`.
Those extra collections follow the same `{ path, name, pattern? }` shape, but
they are merged per agent and can preserve explicit shared names when the path
points outside the current workspace.
If the same resolved path appears in both `memory.qmd.paths` and
`memorySearch.qmd.extraCollections`, QMD keeps the first entry and skips the
duplicate.

---

## Multimodal memory (Gemini)

Index images and audio alongside Markdown using Gemini Embedding 2:

| Key                       | Type       | Default    | Description                            |
| ------------------------- | ---------- | ---------- | -------------------------------------- |
| `multimodal.enabled`      | `boolean`  | `false`    | Enable multimodal indexing             |
| `multimodal.modalities`   | `string[]` | --         | `["image"]`, `["audio"]`, or `["all"]` |
| `multimodal.maxFileBytes` | `number`   | `10000000` | Max file size for indexing             |

Only applies to files in `extraPaths`. Default memory roots stay Markdown-only.
Requires `gemini-embedding-2-preview`. `fallback` must be `"none"`.

Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`, `.heic`, `.heif`
(images); `.mp3`, `.wav`, `.ogg`, `.opus`, `.m4a`, `.aac`, `.flac` (audio).