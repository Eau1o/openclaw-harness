---
title: Browser (openclaw-managed)
tags: [entity, tools]
sourcePath: sources/github/openclaw/docs/tools/browser.md
ingestDate: 2026-04-13
type: documentation
---


# Browser (openclaw-managed)

OpenClaw can run a **dedicated Chrome/Brave/Edge/Chromium profile** that the agent controls.
It is isolated from your personal browser and is managed through a small local
control service inside the Gateway (loopback only).

Beginner view:

- Think of it as a **separate, agent-only browser**.
- The `openclaw` profile does **not** touch your personal browser profile.
- The agent can **open tabs, read pages, click, and type** in a safe lane.
- The built-in `user` profile attaches to your real signed-in Chrome session via Chrome MCP.

## What you get

- A separate browser profile named **openclaw** (orange accent by default).
- Deterministic tab control (list/open/focus/close).
- Agent actions (click/type/drag/select), snapshots, screenshots, PDFs.
- Optional multi-profile support (`openclaw`, `work`, `remote`, ...).

This browser is **not** your daily driver. It is a safe, isolated surface for
agent automation and verification.

## Quick start

```bash
openclaw browser --browser-profile openclaw status
openclaw browser --browser-profile openclaw start
openclaw browser --browser-profile openclaw open https://example.com
openclaw browser --browser-profile openclaw snapshot
```

If you get “Browser disabled”, enable it in config (see below) and restart the
Gateway.

If `openclaw browser` is missing entirely, or the agent says the browser tool
is unavailable, jump to [Missing browser command or tool](/tools/browser#missing-browser-command-or-tool).

## Plugin control

The default `browser` tool is now a bundled plugin that ships enabled by
default. That means you can disable or replace it without removing the rest of
OpenClaw's plugin system:

```json5
{
  plugins: {
    entries: {
      browser: {
        enabled: false,
      },
    },
  },
}
```

Disable the bundled plugin before installing another plugin that provides the
same `browser` tool name. The default browser experience needs both:

- `plugins.entries.browser.enabled` not disabled
- `browser.enabled=true`

If you turn off only the plugin, the bundled browser CLI (`openclaw browser`),
gateway method (`browser.request`), agent tool, and default browser control
service all disappear together. Your `browser.*` config stays intact for a
replacement plugin to reuse.

The bundled browser plugin also owns the browser runtime implementation now.
Core keeps only shared Plugin SDK helpers plus compatibility re-exports for
older internal import paths. In practice, removing or replacing the browser
plugin package removes the browser feature set instead of leaving a second
core-owned runtime behind.

Browser config changes still require a Gateway restart so the bundled plugin
can re-register its browser service with the new settings.

## Missing browser command or tool

If `openclaw browser` suddenly becomes an unknown command after an upgrade, or
the agent reports that the browser tool is missing, the most common cause is a
restrictive `plugins.allow` list that does not include `browser`.

Example broken config:

```json5
{
  plugins: {
    allow: ["telegram"],
  },
}
```

Fix it by adding `browser` to the plugin allowlist:

```json5
{
  plugins: {
    allow: ["telegram", "browser"],
  },
}
```

Important notes:

- `browser.enabled=true` is not enough by itself when `plugins.allow` is set.
- `plugins.entries.browser.enabled=true` is also not enough by itself when `plugins.allow` is set.
- `tools.alsoAllow: ["browser"]` does **not** load the bundled browser plugin. It only adjusts tool policy after the plugin is already loaded.
- If you do not need a restrictive plugin allowlist, removing `plugins.allow` also restores the default bundled browser behavior.

Typical symptoms:

- `openclaw browser` is an unknown command.
- `browser.request` is missing.
- The agent reports the browser tool as unavailable or missing.

## Profiles: `openclaw` vs `user`

- `openclaw`: managed, isolated browser (no extension required).
- `user`: built-in Chrome MCP attach profile for your **real signed-in Chrome**
  session.

For agent browser tool calls:

- Default: use the isolated `openclaw` browser.
- Prefer `profile="user"` when existing logged-in sessions matter and the user
  is at the computer to click/approve any attach prompt.
- `profile` is the explicit override when you want a specific browser mode.

Set `browser.defaultProfile: "openclaw"` if you want managed mode by default.

## Configuration

Browser settings live in `~/.openclaw/openclaw.json`.

```json5
{
  browser: {
    enabled: true, // default: true
    ssrfPolicy: {
      // dangerouslyAllowPrivateNetwork: true, // opt in only for trusted private-network access
      // allowPrivateNetwork: true, // legacy alias
      // hostnameAllowlist: ["*.example.com", "example.com"],
      // allowedHostnames: ["localhost"],
    },
    // cdpUrl: "http://127.0.0.1:18792", // legacy single-profile override
    remoteCdpTimeoutMs: 1500, // remote CDP HTTP timeout (ms)
    remoteCdpHandshakeTimeoutMs: 3000, // remote CDP WebSocket handshake timeout (ms)
    defaultProfile: "openclaw",
    color: "#FF4500",
    headless: false,
    noSandbox: false,
    attachOnly: false,
    executablePath: "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    profiles: {
      openclaw: { cdpPort: 18800, color: "#FF4500" },
      work: { cdpPort: 18801, color: "#0066CC" },
      user: {
        driver: "existing-session",
        attachOnly: true,
        color: "#00AA00",
      },
      brave: {
        driver: "existing-session",
        attachOnly: true,
        userDataDir: "~/Library/Application Support/BraveSoftware/Brave-Browser",
        color: "#FB542B",
      },
      remote: { cdpUrl: "http://10.0.0.42:9222", color: "#00AA00" },
    },
  },
}
```

Notes:

- The browser control service binds to loopback on a port derived from `gateway.port`
  (default: `18791`, which is gateway + 2).
- If you override the Gateway port (`gateway.port` or `OPENCLAW_GATEWAY_PORT`),
  the derived browser ports shift to stay in the same “family”.
- `cdpUrl` defaults to the managed local CDP port when unset.
- `remoteCdpTimeoutMs` applies to remote (non-loopback) CDP reachability checks.
- `remoteCdpHandshakeTimeoutMs` applies to remote CDP WebSocket reachability checks.
- Browser navigation/open-tab is SSRF-guarded before navigation and best-effort re-checked on final `http(s)` URL after navigation.
- In strict SSRF mode, remote CDP endpoint discovery/probes (`cdpUrl`, including `/json/version` lookups) are checked too.
- `browser.ssrfPolicy.dangerouslyAllowPrivateNetwork` is disabled by default. Set it to `true` only when you intentionally trust private-network browser access.
- `browser.ssrfPolicy.allowPrivateNetwork` remains supported as a legacy alias for compatibility.
- `attachOnly: true` means “never launch a local browser; only attach if it is already running.”
- `color` + per-profile `color` tint the browser UI so you can see which profile is active.
- Default profile is `openclaw` (OpenClaw-managed standalone browser). Use `defaultProfile: "user"` to opt into the signed-in user browser.
- Auto-detect order: system default browser if Chromium-based; otherwise Chrome → Brave → Edge → Chromium → Chrome Canary.
- Local `openclaw` profiles auto-assign `cdpPort`/`cdpUrl` — set those only for remote CDP.
- `driver: "existing-session"` uses Chrome DevTools MCP instead of raw CDP. Do
  not set `cdpUrl` for that driver.
- Set `browser.profiles.<name>.userDataDir` when an existing-session profile
  should attach to a non-default Chromium user profile such as Brave or Edge.

## Use Brave (or another Chromium-based browser)

If your **system default** browser is Chromium-based (Chrome/Brave/Edge/etc),
OpenClaw uses it automatically. Set `browser.executablePath` to override
auto-detection:

CLI example:

```bash
openclaw config set browser.executablePath "/usr/bin/google-chrome"
```

```json5
// macOS
{
  browser: {
    executablePath: "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"
  }
}

// Windows
{
  browser: {
    executablePath: "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe"
  }
}

// Linux
{
  browser: {
    executablePath: "/usr/bin/brave-browser"
  }
}
```

## Local vs remote control

- **Local control (default):** the Gateway starts the loopback control service and can launch a local browser.
- **Remote control (node host):** run a node host on the machine that has the browser; the Gateway proxies browser actions to it.
- **Remote CDP:** set `browser.profiles.<name>.cdpUrl` (or `browser.cdpUrl`) to
  attach to a remote Chromium-based browser. In this case, OpenClaw will not launch a local browser.

Stopping behavior differs by profile mode:

- local managed profiles: `openclaw browser stop` stops the browser process that
  OpenClaw launched
- attach-only and remote CDP profiles: `openclaw browser stop` closes the active
  control session and releases Playwright/CDP emulation overrides (viewport,
  color scheme, locale, timezone, offline mode, and similar state), even
  though no browser process was launched by OpenClaw

Remote CDP URLs can include auth:

- Query tokens (e.g., `https://provider.example?token=<token>`)
- HTTP Basic auth (e.g., `https://user:pass@provider.example`)

OpenClaw preserves the auth when calling `/json/*` endpoints and when connecting
to the CDP WebSocket. Prefer environment variables or secrets managers for
tokens instead of committing them to config files.

## Node browser proxy (zero-config default)

If you run a **node host** on the machine that has your browser, OpenClaw can
auto-route browser tool calls to that node without any extra browser config.
This is the default path for remote gateways.

Notes:

- The node host exposes its local browser control server via a **proxy command**.
- Profiles come from the node’s own `browser.profiles` config (same as local).
- `nodeHost.browserProxy.allowProfiles` is optional. Leave it empty for the legacy/default behavior: all configured profiles remain reachable through the proxy, including profile create/delete routes.
- If you set `nodeHost.browserProxy.allowProfiles`, OpenClaw treats it as a least-privilege boundary: only allowlisted profiles can be targeted, and persistent profile create/delete routes are blocked on the proxy surface.
- Disable if you don’t want it:
  - On the node: `nodeHost.browserProxy.enabled=false`
  - On the gateway: `gateway.nodes.browser.mode="off"`

## Browserless (hosted remote CDP)

[Browserless](https://browserless.io) is a hosted Chromium service that exposes
CDP connection URLs over HTTPS and WebSocket. OpenClaw can use either form, but
for a remote browser profile the simplest option is the direct WebSocket URL
from Browserless' connection docs.

Example:

```json5
{
  browser: {
    enabled: true,
    defaultProfile: "browserless",
    remoteCdpTimeoutMs: 2000,
    remoteCdpHandshakeTimeoutMs: 4000,
    profiles: {
      browserless: {
        cdpUrl: "wss://production-sfo.browserless.io?token=<BROWSERLESS_API_KEY>",
        color: "#00AA00",
      },
    },
  },
}
```

Notes: