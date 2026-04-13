---
title: Microsoft Teams
tags: [entity, channels]
sourcePath: sources/github/openclaw/docs/channels/msteams.md
ingestDate: 2026-04-13
type: documentation
---


# Microsoft Teams

> "Abandon all hope, ye who enter here."

Updated: 2026-03-25

Status: text + DM attachments are supported; channel/group file sending requires `sharePointSiteId` + Graph permissions (see [Sending files in group chats](#sending-files-in-group-chats)). Polls are sent via Adaptive Cards. Message actions expose explicit `upload-file` for file-first sends.

## Bundled plugin

Microsoft Teams ships as a bundled plugin in current OpenClaw releases, so no
separate install is required in the normal packaged build.

If you are on an older build or a custom install that excludes bundled Teams,
install it manually:

```bash
openclaw plugins install @openclaw/msteams
```

Local checkout (when running from a git repo):

```bash
openclaw plugins install ./path/to/local/msteams-plugin
```

Details: [Plugins](/tools/plugin)

## Quick setup (beginner)

1. Ensure the Microsoft Teams plugin is available.
   - Current packaged OpenClaw releases already bundle it.
   - Older/custom installs can add it manually with the commands above.
2. Create an **Azure Bot** (App ID + client secret + tenant ID).
3. Configure OpenClaw with those credentials.
4. Expose `/api/messages` (port 3978 by default) via a public URL or tunnel.
5. Install the Teams app package and start the gateway.

Minimal config (client secret):

```json5
{
  channels: {
    msteams: {
      enabled: true,
      appId: "<APP_ID>",
      appPassword: "<APP_PASSWORD>",
      tenantId: "<TENANT_ID>",
      webhook: { port: 3978, path: "/api/messages" },
    },
  },
}
```

For production deployments, consider using [federated authentication](#federated-authentication-certificate--managed-identity) (certificate or managed identity) instead of client secrets.

Note: group chats are blocked by default (`channels.msteams.groupPolicy: "allowlist"`). To allow group replies, set `channels.msteams.groupAllowFrom` (or use `groupPolicy: "open"` to allow any member, mention-gated).

## Goals

- Talk to OpenClaw via Teams DMs, group chats, or channels.
- Keep routing deterministic: replies always go back to the channel they arrived on.
- Default to safe channel behavior (mentions required unless configured otherwise).

## Config writes

By default, Microsoft Teams is allowed to write config updates triggered by `/config set|unset` (requires `commands.config: true`).

Disable with:

```json5
{
  channels: { msteams: { configWrites: false } },
}
```

## Access control (DMs + groups)

**DM access**

- Default: `channels.msteams.dmPolicy = "pairing"`. Unknown senders are ignored until approved.
- `channels.msteams.allowFrom` should use stable AAD object IDs.
- UPNs/display names are mutable; direct matching is disabled by default and only enabled with `channels.msteams.dangerouslyAllowNameMatching: true`.
- The wizard can resolve names to IDs via Microsoft Graph when credentials allow.

**Group access**

- Default: `channels.msteams.groupPolicy = "allowlist"` (blocked unless you add `groupAllowFrom`). Use `channels.defaults.groupPolicy` to override the default when unset.
- `channels.msteams.groupAllowFrom` controls which senders can trigger in group chats/channels (falls back to `channels.msteams.allowFrom`).
- Set `groupPolicy: "open"` to allow any member (still mention‑gated by default).
- To allow **no channels**, set `channels.msteams.groupPolicy: "disabled"`.

Example:

```json5
{
  channels: {
    msteams: {
      groupPolicy: "allowlist",
      groupAllowFrom: ["user@org.com"],
    },
  },
}
```

**Teams + channel allowlist**

- Scope group/channel replies by listing teams and channels under `channels.msteams.teams`.
- Keys should use stable team IDs and channel conversation IDs.
- When `groupPolicy="allowlist"` and a teams allowlist is present, only listed teams/channels are accepted (mention‑gated).
- The configure wizard accepts `Team/Channel` entries and stores them for you.
- On startup, OpenClaw resolves team/channel and user allowlist names to IDs (when Graph permissions allow)
  and logs the mapping; unresolved team/channel names are kept as typed but ignored for routing by default unless `channels.msteams.dangerouslyAllowNameMatching: true` is enabled.

Example:

```json5
{
  channels: {
    msteams: {
      groupPolicy: "allowlist",
      teams: {
        "My Team": {
          channels: {
            General: { requireMention: true },
          },
        },
      },
    },
  },
}
```

## How it works

1. Ensure the Microsoft Teams plugin is available.
   - Current packaged OpenClaw releases already bundle it.
   - Older/custom installs can add it manually with the commands above.
2. Create an **Azure Bot** (App ID + secret + tenant ID).
3. Build a **Teams app package** that references the bot and includes the RSC permissions below.
4. Upload/install the Teams app into a team (or personal scope for DMs).
5. Configure `msteams` in `~/.openclaw/openclaw.json` (or env vars) and start the gateway.
6. The gateway listens for Bot Framework webhook traffic on `/api/messages` by default.

## Azure Bot Setup (Prerequisites)

Before configuring OpenClaw, you need to create an Azure Bot resource.

### Step 1: Create Azure Bot

1. Go to [Create Azure Bot](https://portal.azure.com/#create/Microsoft.AzureBot)
2. Fill in the **Basics** tab:

   | Field              | Value                                                    |
   | ------------------ | -------------------------------------------------------- |
   | **Bot handle**     | Your bot name, e.g., `openclaw-msteams` (must be unique) |
   | **Subscription**   | Select your Azure subscription                           |
   | **Resource group** | Create new or use existing                               |
   | **Pricing tier**   | **Free** for dev/testing                                 |
   | **Type of App**    | **Single Tenant** (recommended - see note below)         |
   | **Creation type**  | **Create new Microsoft App ID**                          |

> **Deprecation notice:** Creation of new multi-tenant bots was deprecated after 2025-07-31. Use **Single Tenant** for new bots.

3. Click **Review + create** → **Create** (wait ~1-2 minutes)

### Step 2: Get Credentials

1. Go to your Azure Bot resource → **Configuration**
2. Copy **Microsoft App ID** → this is your `appId`
3. Click **Manage Password** → go to the App Registration
4. Under **Certificates & secrets** → **New client secret** → copy the **Value** → this is your `appPassword`
5. Go to **Overview** → copy **Directory (tenant) ID** → this is your `tenantId`

### Step 3: Configure Messaging Endpoint

1. In Azure Bot → **Configuration**
2. Set **Messaging endpoint** to your webhook URL:
   - Production: `https://your-domain.com/api/messages`
   - Local dev: Use a tunnel (see [Local Development](#local-development-tunneling) below)

### Step 4: Enable Teams Channel

1. In Azure Bot → **Channels**
2. Click **Microsoft Teams** → Configure → Save
3. Accept the Terms of Service

## Federated Authentication (Certificate + Managed Identity)

> Added in 2026.3.24

For production deployments, OpenClaw supports **federated authentication** as a more secure alternative to client secrets. Two methods are available:

### Option A: Certificate-based authentication

Use a PEM certificate registered with your Entra ID app registration.

**Setup:**

1. Generate or obtain a certificate (PEM format with private key).
2. In Entra ID → App Registration → **Certificates & secrets** → **Certificates** → Upload the public certificate.

**Config:**

```json5
{
  channels: {
    msteams: {
      enabled: true,
      appId: "<APP_ID>",
      tenantId: "<TENANT_ID>",
      authType: "federated",
      certificatePath: "/path/to/cert.pem",
      webhook: { port: 3978, path: "/api/messages" },
    },
  },
}
```

**Env vars:**

- `MSTEAMS_AUTH_TYPE=federated`
- `MSTEAMS_CERTIFICATE_PATH=/path/to/cert.pem`

### Option B: Azure Managed Identity

Use Azure Managed Identity for passwordless authentication. This is ideal for deployments on Azure infrastructure (AKS, App Service, Azure VMs) where a managed identity is available.

**How it works:**

1. The bot pod/VM has a managed identity (system-assigned or user-assigned).
2. A **federated identity credential** links the managed identity to the Entra ID app registration.
3. At runtime, OpenClaw uses `@azure/identity` to acquire tokens from the Azure IMDS endpoint (`169.254.169.254`).
4. The token is passed to the Teams SDK for bot authentication.

**Prerequisites:**

- Azure infrastructure with managed identity enabled (AKS workload identity, App Service, VM)
- Federated identity credential created on the Entra ID app registration
- Network access to IMDS (`169.254.169.254:80`) from the pod/VM

**Config (system-assigned managed identity):**

```json5
{
  channels: {
    msteams: {
      enabled: true,
      appId: "<APP_ID>",
      tenantId: "<TENANT_ID>",
      authType: "federated",
      useManagedIdentity: true,
      webhook: { port: 3978, path: "/api/messages" },
    },
  },
}
```

**Config (user-assigned managed identity):**

```json5
{
  channels: {
    msteams: {
      enabled: true,
      appId: "<APP_ID>",
      tenantId: "<TENANT_ID>",
      authType: "federated",
      useManagedIdentity: true,
      managedIdentityClientId: "<MI_CLIENT_ID>",
      webhook: { port: 3978, path: "/api/messages" },
    },
  },
}
```

**Env vars:**

- `MSTEAMS_AUTH_TYPE=federated`
- `MSTEAMS_USE_MANAGED_IDENTITY=true`
- `MSTEAMS_MANAGED_IDENTITY_CLIENT_ID=<client-id>` (only for user-assigned)

### AKS Workload Identity Setup

For AKS deployments using workload identity:

1. **Enable workload identity** on your AKS cluster.
2. **Create a federated identity credential** on the Entra ID app registration:

   ```bash
   az ad app federated-credential create --id <APP_OBJECT_ID> --parameters '{
     "name": "my-bot-workload-identity",
     "issuer": "<AKS_OIDC_ISSUER_URL>",
     "subject": "system:serviceaccount:<NAMESPACE>:<SERVICE_ACCOUNT>",
     "audiences": ["api://AzureADTokenExchange"]
   }'
   ```

3. **Annotate the Kubernetes service account** with the app client ID: