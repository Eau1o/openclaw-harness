---
title: FAQ
tags: [concept, help]
sourcePath: sources/github/openclaw/docs/help/faq.md
ingestDate: 2026-04-13
type: documentation
---


# FAQ

Quick answers plus deeper troubleshooting for real-world setups (local dev, VPS, multi-agent, OAuth/API keys, model failover). For runtime diagnostics, see [Troubleshooting](/gateway/troubleshooting). For the full config reference, see [Configuration](/gateway/configuration).

## First 60 seconds if something is broken

1. **Quick status (first check)**

   ```bash
   openclaw status
   ```

   Fast local summary: OS + update, gateway/service reachability, agents/sessions, provider config + runtime issues (when gateway is reachable).

2. **Pasteable report (safe to share)**

   ```bash
   openclaw status --all
   ```

   Read-only diagnosis with log tail (tokens redacted).

3. **Daemon + port state**

   ```bash
   openclaw gateway status
   ```

   Shows supervisor runtime vs RPC reachability, the probe target URL, and which config the service likely used.

4. **Deep probes**

   ```bash
   openclaw status --deep
   ```

   Runs a live gateway health probe, including channel probes when supported
   (requires a reachable gateway). See [Health](/gateway/health).

5. **Tail the latest log**

   ```bash
   openclaw logs --follow
   ```

   If RPC is down, fall back to:

   ```bash
   tail -f "$(ls -t /tmp/openclaw/openclaw-*.log | head -1)"
   ```

   File logs are separate from service logs; see [Logging](/logging) and [Troubleshooting](/gateway/troubleshooting).

6. **Run the doctor (repairs)**

   ```bash
   openclaw doctor
   ```

   Repairs/migrates config/state + runs health checks. See [Doctor](/gateway/doctor).

7. **Gateway snapshot**

   ```bash
   openclaw health --json
   openclaw health --verbose   # shows the target URL + config path on errors
   ```

   Asks the running gateway for a full snapshot (WS-only). See [Health](/gateway/health).

## Quick start and first-run setup

<AccordionGroup>
  <Accordion title="I am stuck, fastest way to get unstuck">
    Use a local AI agent that can **see your machine**. That is far more effective than asking
    in Discord, because most "I'm stuck" cases are **local config or environment issues** that
    remote helpers cannot inspect.

    - **Claude Code**: [https://www.anthropic.com/claude-code/](https://www.anthropic.com/claude-code/)
    - **OpenAI Codex**: [https://openai.com/codex/](https://openai.com/codex/)

    These tools can read the repo, run commands, inspect logs, and help fix your machine-level
    setup (PATH, services, permissions, auth files). Give them the **full source checkout** via
    the hackable (git) install:

    ```bash
    curl -fsSL https://openclaw.ai/install.sh | bash -s -- --install-method git
    ```

    This installs OpenClaw **from a git checkout**, so the agent can read the code + docs and
    reason about the exact version you are running. You can always switch back to stable later
    by re-running the installer without `--install-method git`.

    Tip: ask the agent to **plan and supervise** the fix (step-by-step), then execute only the
    necessary commands. That keeps changes small and easier to audit.

    If you discover a real bug or fix, please file a GitHub issue or send a PR:
    [https://github.com/openclaw/openclaw/issues](https://github.com/openclaw/openclaw/issues)
    [https://github.com/openclaw/openclaw/pulls](https://github.com/openclaw/openclaw/pulls)

    Start with these commands (share outputs when asking for help):

    ```bash
    openclaw status
    openclaw models status
    openclaw doctor
    ```

    What they do:

    - `openclaw status`: quick snapshot of gateway/agent health + basic config.
    - `openclaw models status`: checks provider auth + model availability.
    - `openclaw doctor`: validates and repairs common config/state issues.

    Other useful CLI checks: `openclaw status --all`, `openclaw logs --follow`,
    `openclaw gateway status`, `openclaw health --verbose`.

    Quick debug loop: [First 60 seconds if something is broken](#first-60-seconds-if-something-is-broken).
    Install docs: [Install](/install), [Installer flags](/install/installer), [Updating](/install/updating).

  </Accordion>

  <Accordion title="Heartbeat keeps skipping. What do the skip reasons mean?">
    Common heartbeat skip reasons:

    - `quiet-hours`: outside the configured active-hours window
    - `empty-heartbeat-file`: `HEARTBEAT.md` exists but only contains blank/header-only scaffolding
    - `no-tasks-due`: `HEARTBEAT.md` task mode is active but none of the task intervals are due yet
    - `alerts-disabled`: all heartbeat visibility is disabled (`showOk`, `showAlerts`, and `useIndicator` are all off)

    In task mode, due timestamps are only advanced after a real heartbeat run
    completes. Skipped runs do not mark tasks as completed.

    Docs: [Heartbeat](/gateway/heartbeat), [Automation & Tasks](/automation).

  </Accordion>

  <Accordion title="Recommended way to install and set up OpenClaw">
    The repo recommends running from source and using onboarding:

    ```bash
    curl -fsSL https://openclaw.ai/install.sh | bash
    openclaw onboard --install-daemon
    ```

    The wizard can also build UI assets automatically. After onboarding, you typically run the Gateway on port **18789**.

    From source (contributors/dev):

    ```bash
    git clone https://github.com/openclaw/openclaw.git
    cd openclaw
    pnpm install
    pnpm build
    pnpm ui:build # auto-installs UI deps on first run
    openclaw onboard
    ```

    If you don't have a global install yet, run it via `pnpm openclaw onboard`.

  </Accordion>

  <Accordion title="How do I open the dashboard after onboarding?">
    The wizard opens your browser with a clean (non-tokenized) dashboard URL right after onboarding and also prints the link in the summary. Keep that tab open; if it didn't launch, copy/paste the printed URL on the same machine.
  </Accordion>

  <Accordion title="How do I authenticate the dashboard on localhost vs remote?">
    **Localhost (same machine):**

    - Open `http://127.0.0.1:18789/`.
    - If it asks for shared-secret auth, paste the configured token or password into Control UI settings.
    - Token source: `gateway.auth.token` (or `OPENCLAW_GATEWAY_TOKEN`).
    - Password source: `gateway.auth.password` (or `OPENCLAW_GATEWAY_PASSWORD`).
    - If no shared secret is configured yet, generate a token with `openclaw doctor --generate-gateway-token`.

    **Not on localhost:**

    - **Tailscale Serve** (recommended): keep bind loopback, run `openclaw gateway --tailscale serve`, open `https://<magicdns>/`. If `gateway.auth.allowTailscale` is `true`, identity headers satisfy Control UI/WebSocket auth (no pasted shared secret, assumes trusted gateway host); HTTP APIs still require shared-secret auth unless you deliberately use private-ingress `none` or trusted-proxy HTTP auth.
      Bad concurrent Serve auth attempts from the same client are serialized before the failed-auth limiter records them, so the second bad retry can already show `retry later`.
    - **Tailnet bind**: run `openclaw gateway --bind tailnet --token "<token>"` (or configure password auth), open `http://<tailscale-ip>:18789/`, then paste the matching shared secret in dashboard settings.
    - **Identity-aware reverse proxy**: keep the Gateway behind a non-loopback trusted proxy, configure `gateway.auth.mode: "trusted-proxy"`, then open the proxy URL.
    - **SSH tunnel**: `ssh -N -L 18789:127.0.0.1:18789 user@host` then open `http://127.0.0.1:18789/`. Shared-secret auth still applies over the tunnel; paste the configured token or password if prompted.

    See [Dashboard](/web/dashboard) and [Web surfaces](/web) for bind modes and auth details.

  </Accordion>

  <Accordion title="Why are there two exec approval configs for chat approvals?">
    They control different layers:

    - `approvals.exec`: forwards approval prompts to chat destinations
    - `channels.<channel>.execApprovals`: makes that channel act as a native approval client for exec approvals

    The host exec policy is still the real approval gate. Chat config only controls where approval
    prompts appear and how people can answer them.

    In most setups you do **not** need both:

    - If the chat already supports commands and replies, same-chat `/approve` works through the shared path.
    - If a supported native channel can infer approvers safely, OpenClaw now auto-enables DM-first native approvals when `channels.<channel>.execApprovals.enabled` is unset or `"auto"`.
    - When native approval cards/buttons are available, that native UI is the primary path; the agent should only include a manual `/approve` command if the tool result says chat approvals are unavailable or manual approval is the only path.
    - Use `approvals.exec` only when prompts must also be forwarded to other chats or explicit ops rooms.
    - Use `channels.<channel>.execApprovals.target: "channel"` or `"both"` only when you explicitly want approval prompts posted back into the originating room/topic.
    - Plugin approvals are separate again: they use same-chat `/approve` by default, optional `approvals.plugin` forwarding, and only some native channels keep plugin-approval-native handling on top.

    Short version: forwarding is for routing, native client config is for richer channel-specific UX.
    See [Exec Approvals](/tools/exec-approvals).

  </Accordion>

  <Accordion title="What runtime do I need?">
    Node **>= 22** is required. `pnpm` is recommended. Bun is **not recommended** for the Gateway.
  </Accordion>

  <Accordion title="Does it run on Raspberry Pi?">
    Yes. The Gateway is lightweight - docs list **512MB-1GB RAM**, **1 core**, and about **500MB**
    disk as enough for personal use, and note that a **Raspberry Pi 4 can run it**.

    If you want extra headroom (logs, media, other services), **2GB is recommended**, but it's
    not a hard minimum.

    Tip: a small Pi/VPS can host the Gateway, and you can pair **nodes** on your laptop/phone for
    local screen/camera/canvas or command execution. See [Nodes](/nodes).

  </Accordion>

  <Accordion title="Any tips for Raspberry Pi installs?">
    Short version: it works, but expect rough edges.

    - Use a **64-bit** OS and keep Node >= 22.
    - Prefer the **hackable (git) install** so you can see logs and update fast.
    - Start without channels/skills, then add them one by one.
    - If you hit weird binary issues, it is usually an **ARM compatibility** problem.

    Docs: [Linux](/platforms/linux), [Install](/install).

  </Accordion>

  <Accordion title="It is stuck on wake up my friend / onboarding will not hatch. What now?">
    That screen depends on the Gateway being reachable and authenticated. The TUI also sends
    "Wake up, my friend!" automatically on first hatch. If you see that line with **no reply**
    and tokens stay at 0, the agent never ran.

    1. Restart the Gateway:

    ```bash
    openclaw gateway restart
    ```

    2. Check status + auth:

    ```bash
    openclaw status
    openclaw models status
    openclaw logs --follow
    ```

    3. If it still hangs, run:

    ```bash
    openclaw doctor
    ```

    If the Gateway is remote, ensure the tunnel/Tailscale connection is up and that the UI
    is pointed at the right Gateway. See [Remote access](/gateway/remote).

  </Accordion>

  <Accordion title="Can I migrate my setup to a new machine (Mac mini) without redoing onboarding?">
    Yes. Copy the **state directory** and **workspace**, then run Doctor once. This
    keeps your bot "exactly the same" (memory, session history, auth, and channel
    state) as long as you copy **both** locations:

    1. Install OpenClaw on the new machine.
    2. Copy `$OPENCLAW_STATE_DIR` (default: `~/.openclaw`) from the old machine.
    3. Copy your workspace (default: `~/.openclaw/workspace`).
    4. Run `openclaw doctor` and restart the Gateway service.

    That preserves config, auth profiles, WhatsApp creds, sessions, and memory. If you're in
    remote mode, remember the gateway host owns the session store and workspace.

    **Important:** if you only commit/push your workspace to GitHub, you're backing
    up **memory + bootstrap files**, but **not** session history or auth. Those live
    under `~/.openclaw/` (for example `~/.openclaw/agents/<agentId>/sessions/`).

    Related: [Migrating](/install/migrating), [Where things live on disk](#where-things-live-on-disk),
    [Agent workspace](/concepts/agent-workspace), [Doctor](/gateway/doctor),
    [Remote mode](/gateway/remote).

  </Accordion>

  <Accordion title="Where do I see what is new in the latest version?">
    Check the GitHub changelog:
    [https://github.com/openclaw/openclaw/blob/main/CHANGELOG.md](https://github.com/openclaw/openclaw/blob/main/CHANGELOG.md)

    Newest entries are at the top. If the top section is marked **Unreleased**, the next dated
    section is the latest shipped version. Entries are grouped by **Highlights**, **Changes**, and
    **Fixes** (plus docs/other sections when needed).
