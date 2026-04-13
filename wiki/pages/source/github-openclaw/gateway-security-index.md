---
title: Security
tags: [concept, gateway]
sourcePath: sources/github/openclaw/docs/gateway/security/index.md
ingestDate: 2026-04-13
type: documentation
---


# Security

<Warning>
**Personal assistant trust model:** this guidance assumes one trusted operator boundary per gateway (single-user/personal assistant model).
OpenClaw is **not** a hostile multi-tenant security boundary for multiple adversarial users sharing one agent/gateway.
If you need mixed-trust or adversarial-user operation, split trust boundaries (separate gateway + credentials, ideally separate OS users/hosts).
</Warning>

**On this page:** [Trust model](#scope-first-personal-assistant-security-model) | [Quick audit](#quick-check-openclaw-security-audit) | [Hardened baseline](#hardened-baseline-in-60-seconds) | [DM access model](#dm-access-model-pairing-allowlist-open-disabled) | [Configuration hardening](#configuration-hardening-examples) | [Incident response](#incident-response)

## Scope first: personal assistant security model

OpenClaw security guidance assumes a **personal assistant** deployment: one trusted operator boundary, potentially many agents.

- Supported security posture: one user/trust boundary per gateway (prefer one OS user/host/VPS per boundary).
- Not a supported security boundary: one shared gateway/agent used by mutually untrusted or adversarial users.
- If adversarial-user isolation is required, split by trust boundary (separate gateway + credentials, and ideally separate OS users/hosts).
- If multiple untrusted users can message one tool-enabled agent, treat them as sharing the same delegated tool authority for that agent.

This page explains hardening **within that model**. It does not claim hostile multi-tenant isolation on one shared gateway.

## Quick check: `openclaw security audit`

See also: [Formal Verification (Security Models)](/security/formal-verification)

Run this regularly (especially after changing config or exposing network surfaces):

```bash
openclaw security audit
openclaw security audit --deep
openclaw security audit --fix
openclaw security audit --json
```

`security audit --fix` stays intentionally narrow: it flips common open group
policies to allowlists, restores `logging.redactSensitive: "tools"`, tightens
state/config/include-file permissions, and uses Windows ACL resets instead of
POSIX `chmod` when running on Windows.

It flags common footguns (Gateway auth exposure, browser control exposure, elevated allowlists, filesystem permissions, permissive exec approvals, and open-channel tool exposure).

OpenClaw is both a product and an experiment: you’re wiring frontier-model behavior into real messaging surfaces and real tools. **There is no “perfectly secure” setup.** The goal is to be deliberate about:

- who can talk to your bot
- where the bot is allowed to act
- what the bot can touch

Start with the smallest access that still works, then widen it as you gain confidence.

### Deployment and host trust

OpenClaw assumes the host and config boundary are trusted:

- If someone can modify Gateway host state/config (`~/.openclaw`, including `openclaw.json`), treat them as a trusted operator.
- Running one Gateway for multiple mutually untrusted/adversarial operators is **not a recommended setup**.
- For mixed-trust teams, split trust boundaries with separate gateways (or at minimum separate OS users/hosts).
- Recommended default: one user per machine/host (or VPS), one gateway for that user, and one or more agents in that gateway.
- Inside one Gateway instance, authenticated operator access is a trusted control-plane role, not a per-user tenant role.
- Session identifiers (`sessionKey`, session IDs, labels) are routing selectors, not authorization tokens.
- If several people can message one tool-enabled agent, each of them can steer that same permission set. Per-user session/memory isolation helps privacy, but does not convert a shared agent into per-user host authorization.

### Shared Slack workspace: real risk

If "everyone in Slack can message the bot," the core risk is delegated tool authority:

- any allowed sender can induce tool calls (`exec`, browser, network/file tools) within the agent's policy;
- prompt/content injection from one sender can cause actions that affect shared state, devices, or outputs;
- if one shared agent has sensitive credentials/files, any allowed sender can potentially drive exfiltration via tool usage.

Use separate agents/gateways with minimal tools for team workflows; keep personal-data agents private.

### Company-shared agent: acceptable pattern

This is acceptable when everyone using that agent is in the same trust boundary (for example one company team) and the agent is strictly business-scoped.

- run it on a dedicated machine/VM/container;
- use a dedicated OS user + dedicated browser/profile/accounts for that runtime;
- do not sign that runtime into personal Apple/Google accounts or personal password-manager/browser profiles.

If you mix personal and company identities on the same runtime, you collapse the separation and increase personal-data exposure risk.

## Gateway and node trust concept

Treat Gateway and node as one operator trust domain, with different roles:

- **Gateway** is the control plane and policy surface (`gateway.auth`, tool policy, routing).
- **Node** is remote execution surface paired to that Gateway (commands, device actions, host-local capabilities).
- A caller authenticated to the Gateway is trusted at Gateway scope. After pairing, node actions are trusted operator actions on that node.
- `sessionKey` is routing/context selection, not per-user auth.
- Exec approvals (allowlist + ask) are guardrails for operator intent, not hostile multi-tenant isolation.
- OpenClaw's product default for trusted single-operator setups is that host exec on `gateway`/`node` is allowed without approval prompts (`security="full"`, `ask="off"` unless you tighten it). That default is intentional UX, not a vulnerability by itself.
- Exec approvals bind exact request context and best-effort direct local file operands; they do not semantically model every runtime/interpreter loader path. Use sandboxing and host isolation for strong boundaries.

If you need hostile-user isolation, split trust boundaries by OS user/host and run separate gateways.

## Trust boundary matrix

Use this as the quick model when triaging risk:

| Boundary or control                                       | What it means                                     | Common misread                                                                |
| --------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------- |
| `gateway.auth` (token/password/trusted-proxy/device auth) | Authenticates callers to gateway APIs             | "Needs per-message signatures on every frame to be secure"                    |
| `sessionKey`                                              | Routing key for context/session selection         | "Session key is a user auth boundary"                                         |
| Prompt/content guardrails                                 | Reduce model abuse risk                           | "Prompt injection alone proves auth bypass"                                   |
| `canvas.eval` / browser evaluate                          | Intentional operator capability when enabled      | "Any JS eval primitive is automatically a vuln in this trust model"           |
| Local TUI `!` shell                                       | Explicit operator-triggered local execution       | "Local shell convenience command is remote injection"                         |
| Node pairing and node commands                            | Operator-level remote execution on paired devices | "Remote device control should be treated as untrusted user access by default" |

## Not vulnerabilities by design

These patterns are commonly reported and are usually closed as no-action unless a real boundary bypass is shown:

- Prompt-injection-only chains without a policy/auth/sandbox bypass.
- Claims that assume hostile multi-tenant operation on one shared host/config.
- Claims that classify normal operator read-path access (for example `sessions.list`/`sessions.preview`/`chat.history`) as IDOR in a shared-gateway setup.
- Localhost-only deployment findings (for example HSTS on loopback-only gateway).
- Discord inbound webhook signature findings for inbound paths that do not exist in this repo.
- Reports that treat node pairing metadata as a hidden second per-command approval layer for `system.run`, when the real execution boundary is still the gateway's global node command policy plus the node's own exec approvals.
- "Missing per-user authorization" findings that treat `sessionKey` as an auth token.

## Researcher preflight checklist

Before opening a GHSA, verify all of these:

1. Repro still works on latest `main` or latest release.
2. Report includes exact code path (`file`, function, line range) and tested version/commit.
3. Impact crosses a documented trust boundary (not just prompt injection).
4. Claim is not listed in [Out of Scope](https://github.com/openclaw/openclaw/blob/main/SECURITY.md#out-of-scope).
5. Existing advisories were checked for duplicates (reuse canonical GHSA when applicable).
6. Deployment assumptions are explicit (loopback/local vs exposed, trusted vs untrusted operators).

## Hardened baseline in 60 seconds

Use this baseline first, then selectively re-enable tools per trusted agent:

```json5
{
  gateway: {
    mode: "local",
    bind: "loopback",
    auth: { mode: "token", token: "replace-with-long-random-token" },
  },
  session: {
    dmScope: "per-channel-peer",
  },
  tools: {
    profile: "messaging",
    deny: ["group:automation", "group:runtime", "group:fs", "sessions_spawn", "sessions_send"],
    fs: { workspaceOnly: true },
    exec: { security: "deny", ask: "always" },
    elevated: { enabled: false },
  },
  channels: {
    whatsapp: { dmPolicy: "pairing", groups: { "*": { requireMention: true } } },
  },
}
```

This keeps the Gateway local-only, isolates DMs, and disables control-plane/runtime tools by default.

## Shared inbox quick rule

If more than one person can DM your bot:

- Set `session.dmScope: "per-channel-peer"` (or `"per-account-channel-peer"` for multi-account channels).
- Keep `dmPolicy: "pairing"` or strict allowlists.
- Never combine shared DMs with broad tool access.
- This hardens cooperative/shared inboxes, but is not designed as hostile co-tenant isolation when users share host/config write access.

## Context visibility model

OpenClaw separates two concepts:

- **Trigger authorization**: who can trigger the agent (`dmPolicy`, `groupPolicy`, allowlists, mention gates).
- **Context visibility**: what supplemental context is injected into model input (reply body, quoted text, thread history, forwarded metadata).

Allowlists gate triggers and command authorization. The `contextVisibility` setting controls how supplemental context (quoted replies, thread roots, fetched history) is filtered:

- `contextVisibility: "all"` (default) keeps supplemental context as received.
- `contextVisibility: "allowlist"` filters supplemental context to senders allowed by the active allowlist checks.
- `contextVisibility: "allowlist_quote"` behaves like `allowlist`, but still keeps one explicit quoted reply.

Set `contextVisibility` per channel or per room/conversation. See [Group Chats](/channels/groups#context-visibility-and-allowlists) for setup details.

Advisory triage guidance:

- Claims that only show "model can see quoted or historical text from non-allowlisted senders" are hardening findings addressable with `contextVisibility`, not auth or sandbox boundary bypasses by themselves.
- To be security-impacting, reports still need a demonstrated trust-boundary bypass (auth, policy, sandbox, approval, or another documented boundary).

## What the audit checks (high level)

- **Inbound access** (DM policies, group policies, allowlists): can strangers trigger the bot?
- **Tool blast radius** (elevated tools + open rooms): could prompt injection turn into shell/file/network actions?
- **Exec approval drift** (`security=full`, `autoAllowSkills`, interpreter allowlists without `strictInlineEval`): are host-exec guardrails still doing what you think they are?
  - `security="full"` is a broad posture warning, not proof of a bug. It is the chosen default for trusted personal-assistant setups; tighten it only when your threat model needs approval or allowlist guardrails.
- **Network exposure** (Gateway bind/auth, Tailscale Serve/Funnel, weak/short auth tokens).
- **Browser control exposure** (remote nodes, relay ports, remote CDP endpoints).
- **Local disk hygiene** (permissions, symlinks, config includes, “synced folder” paths).
- **Plugins** (extensions exist without an explicit allowlist).
- **Policy drift/misconfig** (sandbox docker settings configured but sandbox mode off; ineffective `gateway.nodes.denyCommands` patterns because matching is exact command-name only (for example `system.run`) and does not inspect shell text; dangerous `gateway.nodes.allowCommands` entries; global `tools.profile="minimal"` overridden by per-agent profiles; extension plugin tools reachable under permissive tool policy).
- **Runtime expectation drift** (for example assuming implicit exec still means `sandbox` when `tools.exec.host` now defaults to `auto`, or explicitly setting `tools.exec.host="sandbox"` while sandbox mode is off).
- **Model hygiene** (warn when configured models look legacy; not a hard block).

If you run `--deep`, OpenClaw also attempts a best-effort live Gateway probe.

## Credential storage map

Use this when auditing access or deciding what to back up:

- **WhatsApp**: `~/.openclaw/credentials/whatsapp/<accountId>/creds.json`
- **Telegram bot token**: config/env or `channels.telegram.tokenFile` (regular file only; symlinks rejected)
- **Discord bot token**: config/env or SecretRef (env/file/exec providers)
- **Slack tokens**: config/env (`channels.slack.*`)
- **Pairing allowlists**:
  - `~/.openclaw/credentials/<channel>-allowFrom.json` (default account)
  - `~/.openclaw/credentials/<channel>-<accountId>-allowFrom.json` (non-default accounts)
- **Model auth profiles**: `~/.openclaw/agents/<agentId>/agent/auth-profiles.json`
- **File-backed secrets payload (optional)**: `~/.openclaw/secrets.json`
- **Legacy OAuth import**: `~/.openclaw/credentials/oauth.json`

## Security audit checklist

When the audit prints findings, treat this as a priority order:

1. **Anything “open” + tools enabled**: lock down DMs/groups first (pairing/allowlists), then tighten tool policy/sandboxing.
2. **Public network exposure** (LAN bind, Funnel, missing auth): fix immediately.
3. **Browser control remote exposure**: treat it like operator access (tailnet-only, pair nodes deliberately, avoid public exposure).
4. **Permissions**: make sure state/config/credentials/auth are not group/world-readable.
5. **Plugins/extensions**: only load what you explicitly trust.
6. **Model choice**: prefer modern, instruction-hardened models for any bot with tools.

## Security audit glossary

High-signal `checkId` values you will most likely see in real deployments (not exhaustive):

| `checkId`                                                     | Severity      | Why it matters                                                                       | Primary fix key/path                                                                                 | Auto-fix |
| ------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- | -------- |
| `fs.state_dir.perms_world_writable`                           | critical      | Other users/processes can modify full OpenClaw state                                 | filesystem perms on `~/.openclaw`                                                                    | yes      |
| `fs.state_dir.perms_group_writable`                           | warn          | Group users can modify full OpenClaw state                                           | filesystem perms on `~/.openclaw`                                                                    | yes      |
| `fs.state_dir.perms_readable`                                 | warn          | State dir is readable by others                                                      | filesystem perms on `~/.openclaw`                                                                    | yes      |
| `fs.state_dir.symlink`                                        | warn          | State dir target becomes another trust boundary                                      | state dir filesystem layout                                                                          | no       |
| `fs.config.perms_writable`                                    | critical      | Others can change auth/tool policy/config                                            | filesystem perms on `~/.openclaw/openclaw.json`                                                      | yes      |
| `fs.config.symlink`                                           | warn          | Config target becomes another trust boundary                                         | config file filesystem layout                                                                        | no       |
| `fs.config.perms_group_readable`                              | warn          | Group users can read config tokens/settings                                          | filesystem perms on config file                                                                      | yes      |
| `fs.config.perms_world_readable`                              | critical      | Config can expose tokens/settings                                                    | filesystem perms on config file                                                                      | yes      |
| `fs.config_include.perms_writable`                            | critical      | Config include file can be modified by others                                        | include-file perms referenced from `openclaw.json`                                                   | yes      |
| `fs.config_include.perms_group_readable`                      | warn          | Group users can read included secrets/settings                                       | include-file perms referenced from `openclaw.json`                                                   | yes      |
| `fs.config_include.perms_world_readable`                      | critical      | Included secrets/settings are world-readable                                         | include-file perms referenced from `openclaw.json`                                                   | yes      |
| `fs.auth_profiles.perms_writable`                             | critical      | Others can inject or replace stored model credentials                                | `agents/<agentId>/agent/auth-profiles.json` perms                                                    | yes      |
| `fs.auth_profiles.perms_readable`                             | warn          | Others can read API keys and OAuth tokens                                            | `agents/<agentId>/agent/auth-profiles.json` perms                                                    | yes      |
| `fs.credentials_dir.perms_writable`                           | critical      | Others can modify channel pairing/credential state                                   | filesystem perms on `~/.openclaw/credentials`                                                        | yes      |
| `fs.credentials_dir.perms_readable`                           | warn          | Others can read channel credential state                                             | filesystem perms on `~/.openclaw/credentials`                                                        | yes      |
| `fs.sessions_store.perms_readable`                            | warn          | Others can read session transcripts/metadata                                         | session store perms                                                                                  | yes      |
| `fs.log_file.perms_readable`                                  | warn          | Others can read redacted-but-still-sensitive logs                                    | gateway log file perms                                                                               | yes      |
| `fs.synced_dir`                                               | warn          | State/config in iCloud/Dropbox/Drive broadens token/transcript exposure              | move config/state off synced folders                                                                 | no       |
| `gateway.bind_no_auth`                                        | critical      | Remote bind without shared secret                                                    | `gateway.bind`, `gateway.auth.*`                                                                     | no       |
| `gateway.loopback_no_auth`                                    | critical      | Reverse-proxied loopback may become unauthenticated                                  | `gateway.auth.*`, proxy setup                                                                        | no       |
| `gateway.trusted_proxies_missing`                             | warn          | Reverse-proxy headers are present but not trusted                                    | `gateway.trustedProxies`                                                                             | no       |
| `gateway.http.no_auth`                                        | warn/critical | Gateway HTTP APIs reachable with `auth.mode="none"`                                  | `gateway.auth.mode`, `gateway.http.endpoints.*`                                                      | no       |
| `gateway.http.session_key_override_enabled`                   | info          | HTTP API callers can override `sessionKey`                                           | `gateway.http.allowSessionKeyOverride`                                                               | no       |
| `gateway.tools_invoke_http.dangerous_allow`                   | warn/critical | Re-enables dangerous tools over HTTP API                                             | `gateway.tools.allow`                                                                                | no       |
| `gateway.nodes.allow_commands_dangerous`                      | warn/critical | Enables high-impact node commands (camera/screen/contacts/calendar/SMS)              | `gateway.nodes.allowCommands`                                                                        | no       |
| `gateway.nodes.deny_commands_ineffective`                     | warn          | Pattern-like deny entries do not match shell text or groups                          | `gateway.nodes.denyCommands`                                                                         | no       |
| `gateway.tailscale_funnel`                                    | critical      | Public internet exposure                                                             | `gateway.tailscale.mode`                                                                             | no       |
| `gateway.tailscale_serve`                                     | info          | Tailnet exposure is enabled via Serve                                                | `gateway.tailscale.mode`                                                                             | no       |
| `gateway.control_ui.allowed_origins_required`                 | critical      | Non-loopback Control UI without explicit browser-origin allowlist                    | `gateway.controlUi.allowedOrigins`                                                                   | no       |
| `gateway.control_ui.allowed_origins_wildcard`                 | warn/critical | `allowedOrigins=["*"]` disables browser-origin allowlisting                          | `gateway.controlUi.allowedOrigins`                                                                   | no       |
| `gateway.control_ui.host_header_origin_fallback`              | warn/critical | Enables Host-header origin fallback (DNS rebinding hardening downgrade)              | `gateway.controlUi.dangerouslyAllowHostHeaderOriginFallback`                                         | no       |
| `gateway.control_ui.insecure_auth`                            | warn          | Insecure-auth compatibility toggle enabled                                           | `gateway.controlUi.allowInsecureAuth`                                                                | no       |
| `gateway.control_ui.device_auth_disabled`                     | critical      | Disables device identity check                                                       | `gateway.controlUi.dangerouslyDisableDeviceAuth`                                                     | no       |
| `gateway.real_ip_fallback_enabled`                            | warn/critical | Trusting `X-Real-IP` fallback can enable source-IP spoofing via proxy misconfig      | `gateway.allowRealIpFallback`, `gateway.trustedProxies`                                              | no       |
| `gateway.token_too_short`                                     | warn          | Short shared token is easier to brute force                                          | `gateway.auth.token`                                                                                 | no       |
| `gateway.auth_no_rate_limit`                                  | warn          | Exposed auth without rate limiting increases brute-force risk                        | `gateway.auth.rateLimit`                                                                             | no       |
| `gateway.trusted_proxy_auth`                                  | critical      | Proxy identity now becomes the auth boundary                                         | `gateway.auth.mode="trusted-proxy"`                                                                  | no       |
| `gateway.trusted_proxy_no_proxies`                            | critical      | Trusted-proxy auth without trusted proxy IPs is unsafe                               | `gateway.trustedProxies`                                                                             | no       |
| `gateway.trusted_proxy_no_user_header`                        | critical      | Trusted-proxy auth cannot resolve user identity safely                               | `gateway.auth.trustedProxy.userHeader`                                                               | no       |
| `gateway.trusted_proxy_no_allowlist`                          | warn          | Trusted-proxy auth accepts any authenticated upstream user                           | `gateway.auth.trustedProxy.allowUsers`                                                               | no       |
| `gateway.probe_auth_secretref_unavailable`                    | warn          | Deep probe could not resolve auth SecretRefs in this command path                    | deep-probe auth source / SecretRef availability                                                      | no       |
| `gateway.probe_failed`                                        | warn/critical | Live Gateway probe failed                                                            | gateway reachability/auth                                                                            | no       |
| `discovery.mdns_full_mode`                                    | warn/critical | mDNS full mode advertises `cliPath`/`sshPort` metadata on local network              | `discovery.mdns.mode`, `gateway.bind`                                                                | no       |
| `config.insecure_or_dangerous_flags`                          | warn          | Any insecure/dangerous debug flags enabled                                           | multiple keys (see finding detail)                                                                   | no       |
| `config.secrets.gateway_password_in_config`                   | warn          | Gateway password is stored directly in config                                        | `gateway.auth.password`                                                                              | no       |
| `config.secrets.hooks_token_in_config`                        | warn          | Hook bearer token is stored directly in config                                       | `hooks.token`                                                                                        | no       |
| `hooks.token_reuse_gateway_token`                             | critical      | Hook ingress token also unlocks Gateway auth                                         | `hooks.token`, `gateway.auth.token`                                                                  | no       |
| `hooks.token_too_short`                                       | warn          | Easier brute force on hook ingress                                                   | `hooks.token`                                                                                        | no       |
| `hooks.default_session_key_unset`                             | warn          | Hook agent runs fan out into generated per-request sessions                          | `hooks.defaultSessionKey`                                                                            | no       |
| `hooks.allowed_agent_ids_unrestricted`                        | warn/critical | Authenticated hook callers may route to any configured agent                         | `hooks.allowedAgentIds`                                                                              | no       |
| `hooks.request_session_key_enabled`                           | warn/critical | External caller can choose sessionKey                                                | `hooks.allowRequestSessionKey`                                                                       | no       |
| `hooks.request_session_key_prefixes_missing`                  | warn/critical | No bound on external session key shapes                                              | `hooks.allowedSessionKeyPrefixes`                                                                    | no       |
| `hooks.path_root`                                             | critical      | Hook path is `/`, making ingress easier to collide or misroute                       | `hooks.path`                                                                                         | no       |
| `hooks.installs_unpinned_npm_specs`                           | warn          | Hook install records are not pinned to immutable npm specs                           | hook install metadata                                                                                | no       |
| `hooks.installs_missing_integrity`                            | warn          | Hook install records lack integrity metadata                                         | hook install metadata                                                                                | no       |
| `hooks.installs_version_drift`                                | warn          | Hook install records drift from installed packages                                   | hook install metadata                                                                                | no       |
| `logging.redact_off`                                          | warn          | Sensitive values leak to logs/status                                                 | `logging.redactSensitive`                                                                            | yes      |
| `browser.control_invalid_config`                              | warn          | Browser control config is invalid before runtime                                     | `browser.*`                                                                                          | no       |
| `browser.control_no_auth`                                     | critical      | Browser control exposed without token/password auth                                  | `gateway.auth.*`                                                                                     | no       |
| `browser.remote_cdp_http`                                     | warn          | Remote CDP over plain HTTP lacks transport encryption                                | browser profile `cdpUrl`                                                                             | no       |
| `browser.remote_cdp_private_host`                             | warn          | Remote CDP targets a private/internal host                                           | browser profile `cdpUrl`, `browser.ssrfPolicy.*`                                                     | no       |
| `sandbox.docker_config_mode_off`                              | warn          | Sandbox Docker config present but inactive                                           | `agents.*.sandbox.mode`                                                                              | no       |