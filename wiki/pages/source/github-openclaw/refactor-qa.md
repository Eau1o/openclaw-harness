---
title: QA Refactor
tags: [entity, refactor]
sourcePath: sources/github/openclaw/docs/refactor/qa.md
ingestDate: 2026-04-13
type: documentation
---

# QA Refactor

Status: foundational migration landed.

## Goal

Move OpenClaw QA from a split-definition model to a single source of truth:

- scenario metadata
- prompts sent to the model
- setup and teardown
- harness logic
- assertions and success criteria
- artifacts and report hints

The desired end state is a generic QA harness that loads powerful scenario definition files instead of hardcoding most behavior in TypeScript.

## Current State

Primary source of truth now lives in `qa/scenarios/index.md` plus one file per
scenario under `qa/scenarios/*.md`.

Implemented:

- `qa/scenarios/index.md`
  - canonical QA pack metadata
  - operator identity
  - kickoff mission
- `qa/scenarios/*.md`
  - one markdown file per scenario
  - scenario metadata
  - handler bindings
  - scenario-specific execution config
- `extensions/qa-lab/src/scenario-catalog.ts`
  - markdown pack parser + zod validation
- `extensions/qa-lab/src/qa-agent-bootstrap.ts`
  - plan rendering from the markdown pack
- `extensions/qa-lab/src/qa-agent-workspace.ts`
  - seeds generated compatibility files plus `QA_SCENARIOS.md`
- `extensions/qa-lab/src/suite.ts`
  - selects executable scenarios through markdown-defined handler bindings
- QA bus protocol + UI
  - generic inline attachments for image/video/audio/file rendering

Remaining split surfaces:

- `extensions/qa-lab/src/suite.ts`
  - still owns most executable custom handler logic
- `extensions/qa-lab/src/report.ts`
  - still derives report structure from runtime outputs

So the source-of-truth split is fixed, but execution is still mostly handler-backed rather than fully declarative.

## What The Real Scenario Surface Looks Like

Reading the current suite shows a few distinct scenario classes.

### Simple interaction

- channel baseline
- DM baseline
- threaded follow-up
- model switch
- approval followthrough
- reaction/edit/delete

### Config and runtime mutation

- config patch skill disable
- config apply restart wake-up
- config restart capability flip
- runtime inventory drift check

### Filesystem and repo assertions

- source/docs discovery report
- build Lobster Invaders
- generated image artifact lookup

### Memory orchestration

- memory recall
- memory tools in channel context
- memory failure fallback
- session memory ranking
- thread memory isolation
- memory dreaming sweep

### Tool and plugin integration

- MCP plugin-tools call
- skill visibility
- skill hot install
- native image generation
- image roundtrip
- image understanding from attachment

### Multi-turn and multi-actor

- subagent handoff
- subagent fanout synthesis
- restart recovery style flows

These categories matter because they drive DSL requirements. A flat list of prompt + expected text is not enough.

## Direction

### Single source of truth

Use `qa/scenarios/index.md` plus `qa/scenarios/*.md` as the authored source of
truth.

The pack should stay:

- human-readable in review
- machine-parseable
- rich enough to drive:
  - suite execution
  - QA workspace bootstrap
  - QA Lab UI metadata
  - docs/discovery prompts
  - report generation

### Preferred authoring format

Use markdown as the top-level format, with structured YAML inside it.

Recommended shape:

- YAML frontmatter
  - id
  - title
  - surface
  - tags
  - docs refs
  - code refs
  - model/provider overrides
  - prerequisites
- prose sections
  - objective
  - notes
  - debugging hints
- fenced YAML blocks
  - setup
  - steps
  - assertions
  - cleanup

This gives:

- better PR readability than giant JSON
- richer context than pure YAML
- strict parsing and zod validation

Raw JSON is acceptable only as an intermediate generated form.

## Proposed Scenario File Shape

Example:

````md
---
id: image-generation-roundtrip
title: Image generation roundtrip
surface: image
tags: [media, image, roundtrip]
models:
  primary: openai/gpt-5.4
requires:
  tools: [image_generate]
  plugins: [openai, qa-channel]
docsRefs:
  - docs/help/testing.md
  - docs/concepts/model-providers.md
codeRefs:
  - extensions/qa-lab/src/suite.ts
  - src/gateway/chat-attachments.ts
---

# Objective

Verify generated media is reattached on the follow-up turn.

# Setup

```yaml scenario.setup
- action: config.patch
  patch:
    agents:
      defaults:
        imageGenerationModel:
          primary: openai/gpt-image-1
- action: session.create
  key: agent:qa:image-roundtrip
```

# Steps

```yaml scenario.steps
- action: agent.send
  session: agent:qa:image-roundtrip
  message: |
    Image generation check: generate a QA lighthouse image and summarize it in one short sentence.
- action: artifact.capture
  kind: generated-image
  promptSnippet: Image generation check
  saveAs: lighthouseImage
- action: agent.send
  session: agent:qa:image-roundtrip
  message: |
    Roundtrip image inspection check: describe the generated lighthouse attachment in one short sentence.
  attachments:
    - fromArtifact: lighthouseImage
```

# Expect

```yaml scenario.expect
- assert: outbound.textIncludes
  value: lighthouse
- assert: requestLog.matches
  where:
    promptIncludes: Roundtrip image inspection check
  imageInputCountGte: 1
- assert: artifact.exists
  ref: lighthouseImage
```
````

## Runner Capabilities The DSL Must Cover

Based on the current suite, the generic runner needs more than prompt execution.

### Environment and setup actions

- `bus.reset`
- `gateway.waitHealthy`
- `channel.waitReady`
- `session.create`
- `thread.create`
- `workspace.writeSkill`

### Agent turn actions

- `agent.send`
- `agent.wait`
- `bus.injectInbound`
- `bus.injectOutbound`

### Config and runtime actions

- `config.get`
- `config.patch`
- `config.apply`
- `gateway.restart`
- `tools.effective`
- `skills.status`

### File and artifact actions

- `file.write`
- `file.read`
- `file.delete`
- `file.touchTime`
- `artifact.captureGeneratedImage`
- `artifact.capturePath`

### Memory and cron actions

- `memory.indexForce`
- `memory.searchCli`
- `doctor.memory.status`
- `cron.list`
- `cron.run`
- `cron.waitCompletion`
- `sessionTranscript.write`

### MCP actions

- `mcp.callTool`

### Assertions

- `outbound.textIncludes`
- `outbound.inThread`
- `outbound.notInRoot`
- `tool.called`
- `tool.notPresent`
- `skill.visible`
- `skill.disabled`
- `file.contains`
- `memory.contains`
- `requestLog.matches`
- `sessionStore.matches`
- `cron.managedPresent`
- `artifact.exists`

## Variables and Artifact References

The DSL must support saved outputs and later references.