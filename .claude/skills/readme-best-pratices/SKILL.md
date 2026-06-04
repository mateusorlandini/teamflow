---
name: readme-best-pratices
description: "Use this skill whenever the user wants to create, write, update, improve, or review a README.md (or README) for any kind of project. Triggers include: 'write a README', 'create a README', 'update my README', 'improve my README', 'add a badge', 'document my project', 'write project documentation', 'my README is missing X', or any request to produce or revise a top-level project documentation file. Applies to all project types: open-source libraries, CLIs, APIs, web apps, mobile apps, data science notebooks, monorepos, internal tools, and more. Also trigger when the user pastes an existing README and asks for feedback, additions, or restructuring. Do NOT use for inline code comments, API reference docs, wikis, or changelogs — those are separate concerns."
---

# README.md Creation & Update Skill

## Overview

A README is the front door of a project. It must answer five questions a reader has within the first 30 seconds:

1. **What is this?** — one-sentence description
2. **Why should I care?** — the value proposition
3. **How do I install / run it?** — the quickest path to working
4. **How do I use it?** — the most common use case
5. **How do I contribute / get help?** — where to go next

Every section in a README exists to answer one of these questions. Remove anything that doesn't.

---

## Workflow

### Step 1 — Gather context

Before writing, extract the following (from the conversation, uploaded files, or by asking):

| Signal | Where to look |
|--------|---------------|
| Project name & one-liner | `package.json`, `pyproject.toml`, `Cargo.toml`, repo name |
| Language / stack | File extensions, config files |
| Install method | `package.json scripts`, `Makefile`, `Dockerfile` |
| Usage examples | Existing tests, source `main.*`, CLI `--help` |
| License | `LICENSE` file |
| Audience | Internal tool vs. public OSS vs. client-facing |
| Existing README | Paste or upload — always preserve what's already accurate |

Ask for missing context only if it would materially change the output. Never invent version numbers, URLs, or commands.

### Step 2 — Choose the template tier

| Project type | Template |
|---|---|
| **Library / package** (npm, pip, gem, crate) | Full template — badges, install, API usage, contributing |
| **CLI tool** | Full template — emphasize install and command reference |
| **Web / mobile app** | Full template — emphasize screenshots, env vars, deploy |
| **Data science / notebook** | Streamlined — dataset, environment, how to run notebooks |
| **Internal tool / monorepo** | Streamlined — no badges, focus on setup and architecture |
| **Tiny utility / script** | Minimal — what it does, how to run, license |

### Step 3 — Write or update

- **Creating from scratch**: use the full structure below, trim sections that don't apply.
- **Updating an existing README**: preserve all accurate content; add only what's missing; flag outdated sections with a comment `<!-- TODO: verify this is still current -->` instead of deleting.
- **Improving an existing README**: identify which of the five questions above are poorly answered, fix those first.

### Step 4 — Final checklist

Before delivering, verify every item:

- [ ] Project name matches the actual repo/package name
- [ ] All code blocks have a language identifier (` ```bash `, ` ```python `, etc.)
- [ ] Install command is runnable as written
- [ ] No placeholder text left (`your-username`, `TODO`, `[LINK]`)
- [ ] License name matches the actual `LICENSE` file
- [ ] Badge URLs use the correct repo path
- [ ] Relative links (`./docs/`) work from the repo root

---

## Full README Structure

Use this order. Skip sections that genuinely don't apply; never add empty sections.

~~~markdown
# Project Name

<!-- Badges: CI status, version, license, coverage. Keep to ≤5. -->
[![CI](https://github.com/owner/repo/actions/workflows/ci.yml/badge.svg)](...)
[![npm version](https://img.shields.io/npm/v/package-name.svg)](...)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> One-sentence description of what this project does and for whom.

<!-- Optional: screenshot or demo GIF — worth a thousand words for UIs -->
![Screenshot](docs/screenshot.png)

## Features

- **Key capability 1** — brief elaboration
- **Key capability 2** — brief elaboration
- **Key capability 3** — brief elaboration

## Requirements

- Node.js ≥ 20 / Python ≥ 3.11 / etc.
- Any external service or tool required before install

## Installation

```bash
# The single most common install path first
npm install package-name

# Or with yarn / pnpm / pip / cargo / brew
yarn add package-name
```

## Quick Start

```bash
# The fastest path to a working result — copy-pasteable
npx package-name --input file.txt --output result.json
```

## Usage

### Common use case

```bash
package-name [options] <input>
```

| Option | Default | Description |
|--------|---------|-------------|
| `--input` | — | Path to input file |
| `--output` | `stdout` | Path to output file |
| `--verbose` | `false` | Enable debug logging |

### Programmatic API (if applicable)

```js
import { run } from 'package-name';

const result = await run({ input: 'hello' });
console.log(result);
```

## Configuration

Describe config files, environment variables, or flags. Use a table for env vars.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `API_KEY` | Yes | — | API key from provider dashboard |
| `LOG_LEVEL` | No | `info` | Logging verbosity |

## Project Structure (optional — only for non-obvious layouts)

```
src/
├── core/       # Business logic
├── cli/        # CLI entry point
└── utils/      # Shared helpers
```

## Contributing

```bash
git clone https://github.com/owner/repo.git
cd repo
npm install
npm test
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines, or open an issue to discuss changes first.

## License

[MIT](LICENSE) © 2024 Author Name
~~~

---

## Section-by-Section Rules

### Title & Badges

- Use the exact package/repo name as the `# H1` title.
- Badges go immediately after the title, before any prose.
- Maximum 5 badges. Recommended: CI, version, license. Optional: coverage, downloads.
- Always link badges — a badge with no link is decoration, not information.
- Badge template (GitHub Actions CI):
  ```
  [![CI](https://github.com/OWNER/REPO/actions/workflows/CI_FILE.yml/badge.svg)](https://github.com/OWNER/REPO/actions)
  ```

### Description (tagline)

- One sentence. Blockquote style (`>`). No jargon.
- Formula: **[Project name] is a [noun] that [verb] [outcome] for [audience].**
- ✅ `> Zap is a CLI tool that converts Markdown to PDF with a single command.`
- ❌ `> This project is a comprehensive solution leveraging modern technologies.`

### Features

- Use bold lead-ins for scanability: `- **Fast** — processes 10k rows/sec`.
- 3–7 bullets. More than 7 means you need a docs site, not a README.
- Focus on outcomes, not implementation details.

### Requirements

- Be specific: "Node.js ≥ 20" not "Node.js".
- List only hard requirements — things that will cause failure if missing.
- If Docker is an alternative path, mention it here.

### Installation

- One primary path, clearly labeled.
- Add alternatives (yarn, pnpm, brew, Docker) as secondary blocks.
- If setup requires multiple steps (clone → install → configure), number them.

### Quick Start

- This is the most important section after the description.
- Must be copy-pasteable and produce visible output in under 2 minutes.
- If there's no fast path, say so honestly and link to the full setup guide.

### Usage

- Show the most common real-world use case first, not a toy example.
- Use tables for options/flags/env vars — prose is harder to scan.
- For CLIs: show the help output (`--help`) or a formatted equivalent.
- For APIs/libraries: show the import and a minimal working call.
- For web apps: show how to start the dev server and where to open it.

### Configuration

- List every env var in a table: name, required, default, description.
- If config is file-based (`.env`, `config.yaml`), show a minimal working example file.
- Never put real secrets in a README — use `YOUR_API_KEY` placeholders.

### Contributing

- Keep short. Link to `CONTRIBUTING.md` for detail.
- Include the local dev setup commands — every contributor needs them.
- Mention the PR workflow if non-obvious (fork vs. branch, required reviews, etc.).

### License

- One line: `[LICENSE_NAME](LICENSE) © YEAR Author`.
- If multiple licenses apply, list them clearly.

---

## Project-Type Variations

### Library / Package

Emphasize the API surface. Add a full API reference section or link to generated docs (TypeDoc, pdoc, rustdoc). Show both ESM and CJS import if applicable.

~~~markdown
## API

### `functionName(options)`

| Parameter | Type | Description |
|-----------|------|-------------|
| `options.input` | `string` | ... |

**Returns**: `Promise<Result>`
~~~

### CLI Tool

Add a full command reference table. Show shell completion instructions if available.

~~~markdown
## Commands

| Command | Description |
|---------|-------------|
| `tool init` | Initialize a new project |
| `tool build` | Build for production |
| `tool --help` | Show all options |
~~~

### Web / Mobile App

Add a screenshot or GIF near the top. Include environment setup and deploy instructions.

~~~markdown
## Development

```bash
cp .env.example .env   # fill in your values
npm install
npm run dev            # http://localhost:3000
```

## Deploy

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=...)
~~~

### Data Science / Notebook

Show how to set up the environment and which notebook to run first.

~~~markdown
## Setup

```bash
conda env create -f environment.yml
conda activate project-name
jupyter lab
```

## Dataset

Download from [source](https://example.com/dataset). Place in `data/raw/`.
See `notebooks/01_explore.ipynb` to get started.
~~~

### Internal / Monorepo

Skip public badges. Emphasize architecture and ownership.

~~~markdown
## Architecture

| Package | Owner | Description |
|---------|-------|-------------|
| `packages/api` | @backend-team | REST API server |
| `packages/web` | @frontend-team | React SPA |
| `packages/shared` | Both | Shared types and utils |

## Getting Started (local dev)

```bash
nvm use          # uses .nvmrc
npm install -g pnpm
pnpm install
pnpm dev         # starts all services via Turborepo
```
~~~

---

## Updating an Existing README

When improving an existing README, follow this order:

1. **Audit against the five questions** — identify which are unanswered or poorly answered.
2. **Check for staleness** — version numbers, install commands, screenshots, badge URLs.
3. **Fix broken links** — especially internal relative links and badge URLs.
4. **Add missing sections** — don't restructure if the existing structure works.
5. **Trim bloat** — "why we built this" essays, excessive badges, stale roadmaps.
6. **Preserve voice** — match the existing tone (casual vs. formal).

Never delete content you can't verify is wrong. Mark it with a comment instead.

---

## Markdown Style Rules

- **Headings**: use `##` for top-level sections, `###` for subsections. Never skip levels.
- **Code blocks**: always specify a language (` ```bash `, ` ```python `, ` ```json `). Use ` ```text ` for output.
- **Links**: prefer reference-style links for long URLs to keep prose readable.
- **Tables**: align to the content; use them for options, env vars, commands — not for prose.
- **Line length**: no hard limit, but break prose at sentence boundaries for clean diffs.
- **Emphasis**: use `**bold**` for UI elements and key terms; use `*italic*` sparingly.
- **HTML**: avoid raw HTML unless absolutely necessary (e.g., centered images, `<details>` collapsibles).

### Collapsible sections (use sparingly)

```markdown
<details>
<summary>Advanced configuration options</summary>

Content here is hidden by default — good for long optional sections.

</details>
```

---

## Critical Rules

- **Never invent commands** — if you don't know the install command, ask or leave a placeholder explicitly marked `TODO`.
- **No empty sections** — if a section has nothing to say, remove it.
- **No marketing language** — "blazing fast", "best-in-class", "powerful" are meaningless; show a benchmark instead.
- **Always use fenced code blocks with language tags** — unfenced code or ` ``` ` with no language degrades rendering.
- **Keep the Quick Start under 5 commands** — if setup takes more, the project needs a `docs/` site, not a longer README.
- **One README per repo root** — additional docs belong in `docs/` with links from the README, not inline.
- **Relative links, not absolute** — `./docs/setup.md` works on any fork; `https://github.com/owner/repo/blob/main/docs/setup.md` breaks on forks.
- **Test your commands** — if possible, verify install and quick-start commands actually work before finalizing.
