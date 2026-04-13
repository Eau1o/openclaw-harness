---
title: Sandboxing
tags: [concept, gateway]
sourcePath: sources/github/openclaw/docs/gateway/sandboxing.md
ingestDate: 2026-04-13
type: documentation
---


# Sandboxing

OpenClaw can run **tools inside sandbox backends** to reduce blast radius.
This is **optional** and controlled by configuration (`agents.defaults.sandbox` or
`agents.list[].sandbox`). If sandboxing is off, tools run on the host.
The Gateway stays on the host; tool execution runs in an isolated sandbox
when enabled.

This is not a perfect security boundary, but it materially limits filesystem
and process access when the model does something dumb.

## What gets sandboxed

- Tool execution (`exec`, `read`, `write`, `edit`, `apply_patch`, `process`, etc.).
- Optional sandboxed browser (`agents.defaults.sandbox.browser`).
  - By default, the sandbox browser auto-starts (ensures CDP is reachable) when the browser tool needs it.
    Configure via `agents.defaults.sandbox.browser.autoStart` and `agents.defaults.sandbox.browser.autoStartTimeoutMs`.
  - By default, sandbox browser containers use a dedicated Docker network (`openclaw-sandbox-browser`) instead of the global `bridge` network.
    Configure with `agents.defaults.sandbox.browser.network`.
  - Optional `agents.defaults.sandbox.browser.cdpSourceRange` restricts container-edge CDP ingress with a CIDR allowlist (for example `172.21.0.1/32`).
  - noVNC observer access is password-protected by default; OpenClaw emits a short-lived token URL that serves a local bootstrap page and opens noVNC with password in URL fragment (not query/header logs).
  - `agents.defaults.sandbox.browser.allowHostControl` lets sandboxed sessions target the host browser explicitly.
  - Optional allowlists gate `target: "custom"`: `allowedControlUrls`, `allowedControlHosts`, `allowedControlPorts`.

Not sandboxed:

- The Gateway process itself.
- Any tool explicitly allowed to run outside the sandbox (e.g. `tools.elevated`).
  - **Elevated exec bypasses sandboxing and uses the configured escape path (`gateway` by default, or `node` when the exec target is `node`).**
  - If sandboxing is off, `tools.elevated` does not change execution (already on host). See [Elevated Mode](/tools/elevated).

## Modes

`agents.defaults.sandbox.mode` controls **when** sandboxing is used:

- `"off"`: no sandboxing.
- `"non-main"`: sandbox only **non-main** sessions (default if you want normal chats on host).
- `"all"`: every session runs in a sandbox.
  Note: `"non-main"` is based on `session.mainKey` (default `"main"`), not agent id.
  Group/channel sessions use their own keys, so they count as non-main and will be sandboxed.

## Scope

`agents.defaults.sandbox.scope` controls **how many containers** are created:

- `"agent"` (default): one container per agent.
- `"session"`: one container per session.
- `"shared"`: one container shared by all sandboxed sessions.

## Backend

`agents.defaults.sandbox.backend` controls **which runtime** provides the sandbox:

- `"docker"` (default): local Docker-backed sandbox runtime.
- `"ssh"`: generic SSH-backed remote sandbox runtime.
- `"openshell"`: OpenShell-backed sandbox runtime.

SSH-specific config lives under `agents.defaults.sandbox.ssh`.
OpenShell-specific config lives under `plugins.entries.openshell.config`.

### Choosing a backend

|                     | Docker                           | SSH                            | OpenShell                                           |
| ------------------- | -------------------------------- | ------------------------------ | --------------------------------------------------- |
| **Where it runs**   | Local container                  | Any SSH-accessible host        | OpenShell managed sandbox                           |
| **Setup**           | `scripts/sandbox-setup.sh`       | SSH key + target host          | OpenShell plugin enabled                            |
| **Workspace model** | Bind-mount or copy               | Remote-canonical (seed once)   | `mirror` or `remote`                                |
| **Network control** | `docker.network` (default: none) | Depends on remote host         | Depends on OpenShell                                |
| **Browser sandbox** | Supported                        | Not supported                  | Not supported yet                                   |
| **Bind mounts**     | `docker.binds`                   | N/A                            | N/A                                                 |
| **Best for**        | Local dev, full isolation        | Offloading to a remote machine | Managed remote sandboxes with optional two-way sync |

### SSH backend

Use `backend: "ssh"` when you want OpenClaw to sandbox `exec`, file tools, and media reads on
an arbitrary SSH-accessible machine.

```json5
{
  agents: {
    defaults: {
      sandbox: {
        mode: "all",
        backend: "ssh",
        scope: "session",
        workspaceAccess: "rw",
        ssh: {
          target: "user@gateway-host:22",
          workspaceRoot: "/tmp/openclaw-sandboxes",
          strictHostKeyChecking: true,
          updateHostKeys: true,
          identityFile: "~/.ssh/id_ed25519",
          certificateFile: "~/.ssh/id_ed25519-cert.pub",
          knownHostsFile: "~/.ssh/known_hosts",
          // Or use SecretRefs / inline contents instead of local files:
          // identityData: { source: "env", provider: "default", id: "SSH_IDENTITY" },
          // certificateData: { source: "env", provider: "default", id: "SSH_CERTIFICATE" },
          // knownHostsData: { source: "env", provider: "default", id: "SSH_KNOWN_HOSTS" },
        },
      },
    },
  },
}
```

How it works:

- OpenClaw creates a per-scope remote root under `sandbox.ssh.workspaceRoot`.
- On first use after create or recreate, OpenClaw seeds that remote workspace from the local workspace once.
- After that, `exec`, `read`, `write`, `edit`, `apply_patch`, prompt media reads, and inbound media staging run directly against the remote workspace over SSH.
- OpenClaw does not sync remote changes back to the local workspace automatically.

Authentication material:

- `identityFile`, `certificateFile`, `knownHostsFile`: use existing local files and pass them through OpenSSH config.
- `identityData`, `certificateData`, `knownHostsData`: use inline strings or SecretRefs. OpenClaw resolves them through the normal secrets runtime snapshot, writes them to temp files with `0600`, and deletes them when the SSH session ends.
- If both `*File` and `*Data` are set for the same item, `*Data` wins for that SSH session.

This is a **remote-canonical** model. The remote SSH workspace becomes the real sandbox state after the initial seed.

Important consequences:

- Host-local edits made outside OpenClaw after the seed step are not visible remotely until you recreate the sandbox.
- `openclaw sandbox recreate` deletes the per-scope remote root and seeds again from local on next use.
- Browser sandboxing is not supported on the SSH backend.
- `sandbox.docker.*` settings do not apply to the SSH backend.

### OpenShell backend

Use `backend: "openshell"` when you want OpenClaw to sandbox tools in an
OpenShell-managed remote environment. For the full setup guide, configuration
reference, and workspace mode comparison, see the dedicated
[OpenShell page](/gateway/openshell).

OpenShell reuses the same core SSH transport and remote filesystem bridge as the
generic SSH backend, and adds OpenShell-specific lifecycle
(`sandbox create/get/delete`, `sandbox ssh-config`) plus the optional `mirror`
workspace mode.

```json5
{
  agents: {
    defaults: {
      sandbox: {
        mode: "all",
        backend: "openshell",
        scope: "session",
        workspaceAccess: "rw",
      },
    },
  },
  plugins: {
    entries: {
      openshell: {
        enabled: true,
        config: {
          from: "openclaw",
          mode: "remote", // mirror | remote
          remoteWorkspaceDir: "/sandbox",
          remoteAgentWorkspaceDir: "/agent",
        },
      },
    },
  },
}
```

OpenShell modes:

- `mirror` (default): local workspace stays canonical. OpenClaw syncs local files into OpenShell before exec and syncs the remote workspace back after exec.
- `remote`: OpenShell workspace is canonical after the sandbox is created. OpenClaw seeds the remote workspace once from the local workspace, then file tools and exec run directly against the remote sandbox without syncing changes back.

Remote transport details:

- OpenClaw asks OpenShell for sandbox-specific SSH config via `openshell sandbox ssh-config <name>`.
- Core writes that SSH config to a temp file, opens the SSH session, and reuses the same remote filesystem bridge used by `backend: "ssh"`.
- In `mirror` mode only the lifecycle differs: sync local to remote before exec, then sync back after exec.

Current OpenShell limitations:

- sandbox browser is not supported yet
- `sandbox.docker.binds` is not supported on the OpenShell backend
- Docker-specific runtime knobs under `sandbox.docker.*` still apply only to the Docker backend

#### Workspace modes

OpenShell has two workspace models. This is the part that matters most in practice.

##### `mirror`

Use `plugins.entries.openshell.config.mode: "mirror"` when you want the **local workspace to stay canonical**.

Behavior:

- Before `exec`, OpenClaw syncs the local workspace into the OpenShell sandbox.
- After `exec`, OpenClaw syncs the remote workspace back to the local workspace.
- File tools still operate through the sandbox bridge, but the local workspace remains the source of truth between turns.

Use this when:

- you edit files locally outside OpenClaw and want those changes to show up in the sandbox automatically
- you want the OpenShell sandbox to behave as much like the Docker backend as possible
- you want the host workspace to reflect sandbox writes after each exec turn

Tradeoff:

- extra sync cost before and after exec

##### `remote`

Use `plugins.entries.openshell.config.mode: "remote"` when you want the **OpenShell workspace to become canonical**.

Behavior:

- When the sandbox is first created, OpenClaw seeds the remote workspace from the local workspace once.
- After that, `exec`, `read`, `write`, `edit`, and `apply_patch` operate directly against the remote OpenShell workspace.
- OpenClaw does **not** sync remote changes back into the local workspace after exec.
- Prompt-time media reads still work because file and media tools read through the sandbox bridge instead of assuming a local host path.
- Transport is SSH into the OpenShell sandbox returned by `openshell sandbox ssh-config`.

Important consequences:

- If you edit files on the host outside OpenClaw after the seed step, the remote sandbox will **not** see those changes automatically.
- If the sandbox is recreated, the remote workspace is seeded from the local workspace again.
- With `scope: "agent"` or `scope: "shared"`, that remote workspace is shared at that same scope.

Use this when:

- the sandbox should live primarily on the remote OpenShell side
- you want lower per-turn sync overhead
- you do not want host-local edits to silently overwrite remote sandbox state

Choose `mirror` if you think of the sandbox as a temporary execution environment.
Choose `remote` if you think of the sandbox as the real workspace.

#### OpenShell lifecycle

OpenShell sandboxes are still managed through the normal sandbox lifecycle:

- `openclaw sandbox list` shows OpenShell runtimes as well as Docker runtimes
- `openclaw sandbox recreate` deletes the current runtime and lets OpenClaw recreate it on next use
- prune logic is backend-aware too

For `remote` mode, recreate is especially important:

- recreate deletes the canonical remote workspace for that scope
- the next use seeds a fresh remote workspace from the local workspace

For `mirror` mode, recreate mainly resets the remote execution environment
because the local workspace remains canonical anyway.

## Workspace access

`agents.defaults.sandbox.workspaceAccess` controls **what the sandbox can see**:

- `"none"` (default): tools see a sandbox workspace under `~/.openclaw/sandboxes`.
- `"ro"`: mounts the agent workspace read-only at `/agent` (disables `write`/`edit`/`apply_patch`).
- `"rw"`: mounts the agent workspace read/write at `/workspace`.

With the OpenShell backend:

- `mirror` mode still uses the local workspace as the canonical source between exec turns
- `remote` mode uses the remote OpenShell workspace as the canonical source after the initial seed
- `workspaceAccess: "ro"` and `"none"` still restrict write behavior the same way

Inbound media is copied into the active sandbox workspace (`media/inbound/*`).
Skills note: the `read` tool is sandbox-rooted. With `workspaceAccess: "none"`,
OpenClaw mirrors eligible skills into the sandbox workspace (`.../skills`) so
they can be read. With `"rw"`, workspace skills are readable from
`/workspace/skills`.

## Custom bind mounts

`agents.defaults.sandbox.docker.binds` mounts additional host directories into the container.
Format: `host:container:mode` (e.g., `"/home/user/source:/source:rw"`).

Global and per-agent binds are **merged** (not replaced). Under `scope: "shared"`, per-agent binds are ignored.

`agents.defaults.sandbox.browser.binds` mounts additional host directories into the **sandbox browser** container only.

- When set (including `[]`), it replaces `agents.defaults.sandbox.docker.binds` for the browser container.
- When omitted, the browser container falls back to `agents.defaults.sandbox.docker.binds` (backwards compatible).

Example (read-only source + an extra data directory):

```json5
{
  agents: {
    defaults: {
      sandbox: {
        docker: {
          binds: ["/home/user/source:/source:ro", "/var/data/myapp:/data:ro"],
        },
      },
    },
    list: [
      {
        id: "build",
        sandbox: {