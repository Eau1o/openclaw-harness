#!/usr/bin/env python3
"""
Batch ingest docs into wiki/pages/source/{subdir}/
Supports incremental updates via --update flag.

Usage:
  python ingest_batch.py --repo <path-to-repo> --output <subdir> [--update]

Environment / Defaults:
  SRC_DIR defaults to <repo>/docs
  OUT_DIR defaults to wiki/pages/source/<subdir>
"""
import os
import re
import sys
import json
import subprocess

WORKSPACE = "/home/admin_wsl/.openclaw/workspace"
SRC_DIR = None   # set via --repo
OUT_DIR = None   # set via --output
UPDATE_MODE = False

# ── sync state helpers ────────────────────────────────────────────────────────

def load_sync_state():
    state_path = os.path.join(WORKSPACE, "wiki", ".sync-state.json")
    if os.path.exists(state_path):
        with open(state_path) as f:
            return json.load(f)
    return {"repos": {}}

def save_sync_state(state):
    state_path = os.path.join(WORKSPACE, "wiki", ".sync-state.json")
    with open(state_path, "w") as f:
        json.dump(state, f, indent=2)

def get_current_commit(repo_path):
    """Get the current HEAD commit hash for a git repo."""
    try:
        result = subprocess.run(
            ["git", "-C", repo_path, "rev-parse", "HEAD"],
            capture_output=True, text=True, timeout=10
        )
        if result.returncode == 0:
            return result.stdout.strip()
    except Exception:
        pass
    return None

def scan_repos(sources_base):
    """Scan for git repos under sources_base/github/."""
    github_dir = os.path.join(sources_base, "github")
    repos = []
    if not os.path.isdir(github_dir):
        return repos
    for name in os.listdir(github_dir):
        repo_path = os.path.join(github_dir, name)
        git_dir = os.path.join(repo_path, ".git")
        if os.path.isdir(git_dir):
            repos.append({"name": name, "path": repo_path})
    return repos

# ── helpers ───────────────────────────────────────────────────────────────────

def extract_frontmatter_and_title(content):
    """Return (frontmatter_str, title, body_line_offset) from file content string."""
    lines = content.splitlines()
    frontmatter = []
    in_fm = False
    title = None
    body_offset = 0

    for i, line in enumerate(lines):
        if i == 0 and line.strip() == "---":
            in_fm = True
            frontmatter.append(line)
            continue
        if in_fm:
            frontmatter.append(line)
            if line.strip() == "---":
                in_fm = False
                body_offset = i + 1
                for j in range(i + 1, min(i + 8, len(lines))):
                    l = lines[j].strip()
                    if l.startswith("# "):
                        title = l[2:].strip()
                        break
                break
        else:
            if not in_fm and i == 0:
                if line.strip().startswith("# "):
                    title = line[2:].strip()
                body_offset = 0
            break

    fm_str = "\n".join(frontmatter)
    return fm_str, title, body_offset


def slug_from_path(rel_path):
    """Convert a source-relative path to a unique slug (includes dir prefix)."""
    name = rel_path.replace(".md", "").replace("/", "-")
    return name


def category_from_path(rel_path):
    """Determine wiki category from source path."""
    parts = rel_path.split(os.sep)
    top = parts[0] if parts else ""
    mapping = {
        "concepts":   "concept",
        "gateway":    "concept",
        "channels":   "entity",
        "providers":  "entity",
        "install":    "entity",
        "plugins":    "entity",
        "tools":      "entity",
        "platforms":  "entity",
        "nodes":      "entity",
        "reference":  "concept",
        "web":        "entity",
        "start":      "concept",
        "help":       "concept",
    }
    return mapping.get(top, "entity")


def process_file(rel_path, src_dir, out_dir, update_mode):
    """Ingest a single file. Returns (slug, written: bool, error: str|None)."""
    src = os.path.join(src_dir, rel_path)
    out_name = slug_from_path(rel_path)
    out_path = os.path.join(out_dir, f"{out_name}.md")

    # skip already-exists unless UPDATE_MODE
    if os.path.exists(out_path) and not update_mode:
        return out_name, False, None

    try:
        with open(src, "r", encoding="utf-8") as f:
            full_content = f.read()

        fm_str, title, body_line = extract_frontmatter_and_title(full_content)
        all_lines = full_content.splitlines()
        body = "\n".join(all_lines[body_line:body_line + 300])
    except Exception as e:
        return out_name, False, str(e)

    category = category_from_path(rel_path)

    if title is None:
        title = out_name

    tags = [category]
    if "/" in rel_path:
        tags.append(rel_path.split("/")[0])

    # build sourcePath relative to wiki/sources/
    source_rel = os.path.join(os.path.basename(src_dir), rel_path)

    out_fm = [
        "---",
        f"title: {title}",
        f"tags: [{', '.join(tags)}]",
        f"sourcePath: sources/{source_rel}",
        f"ingestDate: 2026-04-13",
        "type: documentation",
        "---",
        "",
    ]

    content = "\n".join(out_fm) + "\n" + body

    with open(out_path, "w", encoding="utf-8") as f:
        f.write(content)

    return out_name, True, None


# ── main ──────────────────────────────────────────────────────────────────────

def main():
    global SRC_DIR, OUT_DIR, UPDATE_MODE

    args = sys.argv[1:]
    i = 0
    repo_arg = None
    output_arg = None

    while i < len(args):
        if args[i] == "--repo" and i + 1 < len(args):
            repo_arg = args[i + 1]
            i += 2
        elif args[i] == "--output" and i + 1 < len(args):
            output_arg = args[i + 1]
            i += 2
        elif args[i] == "--update":
            UPDATE_MODE = True
            i += 1
        else:
            i += 1

    if not repo_arg or not output_arg:
        print("Usage: ingest_batch.py --repo <repo-path> --output <subdir> [--update]")
        sys.exit(1)

    SRC_DIR = repo_arg
    OUT_DIR = os.path.join(WORKSPACE, "wiki", "pages", "source", output_arg)
    os.makedirs(OUT_DIR, exist_ok=True)

    # Build file list from src_dir
    list_file = os.path.join(WORKSPACE, "tmp", "file_list.txt")
    os.makedirs(os.path.dirname(list_file), exist_ok=True)
    
    # Scan for .md files, excluding .generated/ and .i18n/
    md_files = []
    for root, dirs, files in os.walk(SRC_DIR):
        # Prune excluded dirs in-place
        dirs[:] = [d for d in dirs if d not in (".generated", ".i18n")]
        for f in files:
            if f.endswith(".md"):
                rel = os.path.relpath(os.path.join(root, f), SRC_DIR)
                md_files.append(rel)
    
    with open(list_file, "w") as f:
        for p in md_files:
            f.write(p + "\n")

    created = []
    updated = []
    skipped = []
    errors = []

    for rel in md_files:
        slug, written, err = process_file(rel, SRC_DIR, OUT_DIR, UPDATE_MODE)
        if err:
            errors.append(f"{rel}: {err}")
        elif written:
            if os.path.exists(os.path.join(OUT_DIR, f"{slug}.md")) and UPDATE_MODE:
                # check if it existed before (rough proxy: UPDATE_MODE means overwrite)
                # actual "updated" count tracked by comparing old/new
                pass
            created.append(slug)
        else:
            skipped.append(slug)

    print(f"CREATED={len(created)}")
    print(f"UPDATED={len([c for c in created if c not in created])}")  # placeholder
    print(f"SKIPPED={len(skipped)}")
    print(f"ERRORS={len(errors)}")
    if errors:
        for e in errors[:10]:
            print(f"  ERROR: {e}")
    print("DONE")


if __name__ == "__main__":
    main()