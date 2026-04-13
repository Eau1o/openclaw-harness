---
title: Installer internals
tags: [entity, install]
sourcePath: sources/github/openclaw/docs/install/installer.md
ingestDate: 2026-04-13
type: documentation
---


# Installer internals

OpenClaw ships three installer scripts, served from `openclaw.ai`.

| Script                             | Platform             | What it does                                                                                                   |
| ---------------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------- |
| [`install.sh`](#installsh)         | macOS / Linux / WSL  | Installs Node if needed, installs OpenClaw via npm (default) or git, and can run onboarding.                   |
| [`install-cli.sh`](#install-clish) | macOS / Linux / WSL  | Installs Node + OpenClaw into a local prefix (`~/.openclaw`) with npm or git checkout modes. No root required. |
| [`install.ps1`](#installps1)       | Windows (PowerShell) | Installs Node if needed, installs OpenClaw via npm (default) or git, and can run onboarding.                   |

## Quick commands

<Tabs>
  <Tab title="install.sh">
    ```bash
    curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install.sh | bash
    ```

    ```bash
    curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install.sh | bash -s -- --help
    ```

  </Tab>
  <Tab title="install-cli.sh">
    ```bash
    curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install-cli.sh | bash
    ```

    ```bash
    curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install-cli.sh | bash -s -- --help
    ```

  </Tab>
  <Tab title="install.ps1">
    ```powershell
    iwr -useb https://openclaw.ai/install.ps1 | iex
    ```

    ```powershell
    & ([scriptblock]::Create((iwr -useb https://openclaw.ai/install.ps1))) -Tag beta -NoOnboard -DryRun
    ```

  </Tab>
</Tabs>

<Note>
If install succeeds but `openclaw` is not found in a new terminal, see [Node.js troubleshooting](/install/node#troubleshooting).
</Note>

---

<a id="installsh"></a>

## install.sh

<Tip>
Recommended for most interactive installs on macOS/Linux/WSL.
</Tip>

### Flow (install.sh)

<Steps>
  <Step title="Detect OS">
    Supports macOS and Linux (including WSL). If macOS is detected, installs Homebrew if missing.
  </Step>
  <Step title="Ensure Node.js 24 by default">
    Checks Node version and installs Node 24 if needed (Homebrew on macOS, NodeSource setup scripts on Linux apt/dnf/yum). OpenClaw still supports Node 22 LTS, currently `22.14+`, for compatibility.
  </Step>
  <Step title="Ensure Git">
    Installs Git if missing.
  </Step>
  <Step title="Install OpenClaw">
    - `npm` method (default): global npm install
    - `git` method: clone/update repo, install deps with pnpm, build, then install wrapper at `~/.local/bin/openclaw`
  </Step>
  <Step title="Post-install tasks">
    - Refreshes a loaded gateway service best-effort (`openclaw gateway install --force`, then restart)
    - Runs `openclaw doctor --non-interactive` on upgrades and git installs (best effort)
    - Attempts onboarding when appropriate (TTY available, onboarding not disabled, and bootstrap/config checks pass)
    - Defaults `SHARP_IGNORE_GLOBAL_LIBVIPS=1`
  </Step>
</Steps>

### Source checkout detection

If run inside an OpenClaw checkout (`package.json` + `pnpm-workspace.yaml`), the script offers:

- use checkout (`git`), or
- use global install (`npm`)

If no TTY is available and no install method is set, it defaults to `npm` and warns.

The script exits with code `2` for invalid method selection or invalid `--install-method` values.

### Examples (install.sh)

<Tabs>
  <Tab title="Default">
    ```bash
    curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install.sh | bash
    ```
  </Tab>
  <Tab title="Skip onboarding">
    ```bash
    curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install.sh | bash -s -- --no-onboard
    ```
  </Tab>
  <Tab title="Git install">
    ```bash
    curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install.sh | bash -s -- --install-method git
    ```
  </Tab>
  <Tab title="GitHub main via npm">
    ```bash
    curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install.sh | bash -s -- --version main
    ```
  </Tab>
  <Tab title="Dry run">
    ```bash
    curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install.sh | bash -s -- --dry-run
    ```
  </Tab>
</Tabs>

<AccordionGroup>
  <Accordion title="Flags reference">

| Flag                                  | Description                                                |
| ------------------------------------- | ---------------------------------------------------------- |
| `--install-method npm\|git`           | Choose install method (default: `npm`). Alias: `--method`  |
| `--npm`                               | Shortcut for npm method                                    |
| `--git`                               | Shortcut for git method. Alias: `--github`                 |
| `--version <version\|dist-tag\|spec>` | npm version, dist-tag, or package spec (default: `latest`) |
| `--beta`                              | Use beta dist-tag if available, else fallback to `latest`  |
| `--git-dir <path>`                    | Checkout directory (default: `~/openclaw`). Alias: `--dir` |
| `--no-git-update`                     | Skip `git pull` for existing checkout                      |
| `--no-prompt`                         | Disable prompts                                            |
| `--no-onboard`                        | Skip onboarding                                            |
| `--onboard`                           | Enable onboarding                                          |
| `--dry-run`                           | Print actions without applying changes                     |
| `--verbose`                           | Enable debug output (`set -x`, npm notice-level logs)      |
| `--help`                              | Show usage (`-h`)                                          |

  </Accordion>

  <Accordion title="Environment variables reference">

| Variable                                                | Description                                   |
| ------------------------------------------------------- | --------------------------------------------- |
| `OPENCLAW_INSTALL_METHOD=git\|npm`                      | Install method                                |
| `OPENCLAW_VERSION=latest\|next\|main\|<semver>\|<spec>` | npm version, dist-tag, or package spec        |
| `OPENCLAW_BETA=0\|1`                                    | Use beta if available                         |
| `OPENCLAW_GIT_DIR=<path>`                               | Checkout directory                            |
| `OPENCLAW_GIT_UPDATE=0\|1`                              | Toggle git updates                            |
| `OPENCLAW_NO_PROMPT=1`                                  | Disable prompts                               |
| `OPENCLAW_NO_ONBOARD=1`                                 | Skip onboarding                               |
| `OPENCLAW_DRY_RUN=1`                                    | Dry run mode                                  |
| `OPENCLAW_VERBOSE=1`                                    | Debug mode                                    |
| `OPENCLAW_NPM_LOGLEVEL=error\|warn\|notice`             | npm log level                                 |
| `SHARP_IGNORE_GLOBAL_LIBVIPS=0\|1`                      | Control sharp/libvips behavior (default: `1`) |

  </Accordion>
</AccordionGroup>

---

<a id="install-clish"></a>

## install-cli.sh

<Info>
Designed for environments where you want everything under a local prefix
(default `~/.openclaw`) and no system Node dependency. Supports npm installs
by default, plus git-checkout installs under the same prefix flow.
</Info>

### Flow (install-cli.sh)

<Steps>
  <Step title="Install local Node runtime">
    Downloads a pinned supported Node LTS tarball (the version is embedded in the script and updated independently) to `<prefix>/tools/node-v<version>` and verifies SHA-256.
  </Step>
  <Step title="Ensure Git">
    If Git is missing, attempts install via apt/dnf/yum on Linux or Homebrew on macOS.
  </Step>
  <Step title="Install OpenClaw under prefix">
    - `npm` method (default): installs under the prefix with npm, then writes wrapper to `<prefix>/bin/openclaw`
    - `git` method: clones/updates a checkout (default `~/openclaw`) and still writes the wrapper to `<prefix>/bin/openclaw`
  </Step>
  <Step title="Refresh loaded gateway service">
    If a gateway service is already loaded from that same prefix, the script runs
    `openclaw gateway install --force`, then `openclaw gateway restart`, and
    probes gateway health best-effort.
  </Step>
</Steps>

### Examples (install-cli.sh)

<Tabs>
  <Tab title="Default">
    ```bash
    curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install-cli.sh | bash
    ```
  </Tab>
  <Tab title="Custom prefix + version">
    ```bash
    curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install-cli.sh | bash -s -- --prefix /opt/openclaw --version latest
    ```
  </Tab>
  <Tab title="Git install">
    ```bash
    curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install-cli.sh | bash -s -- --install-method git --git-dir ~/openclaw
    ```
  </Tab>
  <Tab title="Automation JSON output">
    ```bash
    curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install-cli.sh | bash -s -- --json --prefix /opt/openclaw
    ```
  </Tab>
  <Tab title="Run onboarding">
    ```bash
    curl -fsSL --proto '=https' --tlsv1.2 https://openclaw.ai/install-cli.sh | bash -s -- --onboard
    ```
  </Tab>
</Tabs>

<AccordionGroup>
  <Accordion title="Flags reference">

| Flag                        | Description                                                                     |
| --------------------------- | ------------------------------------------------------------------------------- |
| `--prefix <path>`           | Install prefix (default: `~/.openclaw`)                                         |
| `--install-method npm\|git` | Choose install method (default: `npm`). Alias: `--method`                       |
| `--npm`                     | Shortcut for npm method                                                         |
| `--git`, `--github`         | Shortcut for git method                                                         |
| `--git-dir <path>`          | Git checkout directory (default: `~/openclaw`). Alias: `--dir`                  |
| `--version <ver>`           | OpenClaw version or dist-tag (default: `latest`)                                |
| `--node-version <ver>`      | Node version (default: `22.22.0`)                                               |
| `--json`                    | Emit NDJSON events                                                              |
| `--onboard`                 | Run `openclaw onboard` after install                                            |
| `--no-onboard`              | Skip onboarding (default)                                                       |
| `--set-npm-prefix`          | On Linux, force npm prefix to `~/.npm-global` if current prefix is not writable |
| `--help`                    | Show usage (`-h`)                                                               |

  </Accordion>

  <Accordion title="Environment variables reference">

| Variable                                    | Description                                   |
| ------------------------------------------- | --------------------------------------------- |
| `OPENCLAW_PREFIX=<path>`                    | Install prefix                                |
| `OPENCLAW_INSTALL_METHOD=git\|npm`          | Install method                                |
| `OPENCLAW_VERSION=<ver>`                    | OpenClaw version or dist-tag                  |
| `OPENCLAW_NODE_VERSION=<ver>`               | Node version                                  |
| `OPENCLAW_GIT_DIR=<path>`                   | Git checkout directory for git installs       |
| `OPENCLAW_GIT_UPDATE=0\|1`                  | Toggle git updates for existing checkouts     |
| `OPENCLAW_NO_ONBOARD=1`                     | Skip onboarding                               |
| `OPENCLAW_NPM_LOGLEVEL=error\|warn\|notice` | npm log level                                 |
| `SHARP_IGNORE_GLOBAL_LIBVIPS=0\|1`          | Control sharp/libvips behavior (default: `1`) |

  </Accordion>
</AccordionGroup>

---

<a id="installps1"></a>

## install.ps1

### Flow (install.ps1)

<Steps>
  <Step title="Ensure PowerShell + Windows environment">
    Requires PowerShell 5+.
  </Step>
  <Step title="Ensure Node.js 24 by default">
    If missing, attempts install via winget, then Chocolatey, then Scoop. Node 22 LTS, currently `22.14+`, remains supported for compatibility.
  </Step>
  <Step title="Install OpenClaw">
    - `npm` method (default): global npm install using selected `-Tag`
    - `git` method: clone/update repo, install/build with pnpm, and install wrapper at `%USERPROFILE%\.local\bin\openclaw.cmd`
  </Step>
  <Step title="Post-install tasks">
    - Adds needed bin directory to user PATH when possible
    - Refreshes a loaded gateway service best-effort (`openclaw gateway install --force`, then restart)
    - Runs `openclaw doctor --non-interactive` on upgrades and git installs (best effort)
  </Step>
</Steps>

### Examples (install.ps1)

<Tabs>
  <Tab title="Default">
    ```powershell
    iwr -useb https://openclaw.ai/install.ps1 | iex
    ```
  </Tab>
  <Tab title="Git install">
    ```powershell