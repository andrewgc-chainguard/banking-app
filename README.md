# Banking App — Chainguard Libraries Demo

A small Next.js banking app used to show how **Chainguard Libraries for JavaScript** blocks malicious npm packages and removes CVEs — in CI, in a migration PR, and on the terminal — with no change to how developers work.

The one-liner: **same code, same pipeline, same `npm install` — only the registry changes. Public npm ships malware; Chainguard blocks it.**

---

## What's in here

| Artifact | What it is |
|---|---|
| `src/`, `package.json` | The Next.js banking app (`USE_MOCK_DB=true` for `npm run dev`). |
| `demo.sh` | One command: installs the malware package from public npm (succeeds) vs through Chainguard (blocked 403). |
| `run-cg.sh` | Clean-installs the **whole app** through Chainguard and runs it — the "nothing breaks / 0 CVEs" beat. |
| `.github/workflows/branch-registry-demo.yml` | Branch-driven CI: resolves deps from the branch's `.npmrc`. `main` ships malware (green), `chainguard` blocks it (red). Writes a job-summary report. |
| `.github/workflows/supply-chain-demo.yml` | Two-job CI contrast (public npm vs Chainguard) in a single run. |
| `config.sh` / `reset.sh` | Original terminal flow: generate a direct `libraries.cgr.dev` `.npmrc` / clean deps. |
| `provenance.sh` / `sbom.sh` | Show SLSA provenance and SBOM for a Chainguard-served package. |
| `RUNBOOK.md` | Click-by-click demo steps (GitHub + local). |
| `TALKTRACK.md` | What to say — messaging, banking-targeted malware examples. |
| `DEMO.md` | Original terminal + Docker (`Dockerfile` vs `Dockerfile.cg`) walkthrough. |

**Branches:** `main` = public npm; `chainguard` = the one-line `.npmrc` migration (open as **PR #1**).

---

## Two ways Chainguard is integrated here

1. **Via a repository manager (recommended / real-world)** — a **JFrog virtual repo** (`andrewgc-jscript` on `chainguardlibraries.jfrog.io`) proxies Chainguard Libraries. This is what the **CI workflows**, the **`chainguard` branch**, `demo.sh`, and `run-cg.sh` use.
2. **Direct** — `config.sh <org>` generates an `.npmrc` pointing straight at `libraries.cgr.dev/javascript` via `chainctl`. Good for the quick terminal story.

Both land at the same place: Chainguard-built packages first, with a malware-scanned + cooldown upstream fallback for everything else.

---

## Quick start (local)

```bash
npm install && npm run dev     # app on public npm → http://localhost:3000 (note: 4 CVEs)
./demo.sh                      # public npm installs malware; Chainguard 403-blocks it
./run-cg.sh                    # whole app reinstalled through Chainguard, then runs (0 CVEs)
```

`demo.sh` and `run-cg.sh` read the JFrog token from env (`JFROG_TOKEN`) or your `~/mydata/cg-repo/libdemo/.npmrc`, and never write it into the repo.

---

## The three demo modes

- **Local terminal** — the Quick start above. See `RUNBOOK.md` Part B.
- **GitHub CI** — run `branch-registry-demo` on `main` (green, shipped) then on `chainguard` (red, blocked); the job summary reports which package and the 403 verdict. See `RUNBOOK.md` Part A.
- **Migration PR** — **PR #1** `chainguard → main` is a single `.npmrc` line (`registry.npmjs.org` → JFrog→Chainguard). "This is the entire adoption."

---

## Going deeper (provenance / SBOM / coverage)

After installing through Chainguard, verify what you actually got (`pg` is a good example):

```bash
npm show pg
./provenance.sh pg          # SLSA provenance, cosign-verified
./sbom.sh pg                # SPDX SBOM
chainctl libs verify node_modules   # coverage across all installed packages
```

Talking points for `<100%` coverage: coverage is growing; you benefit **today** via the malware-scanned, cooldown-gated upstream fallback (7-day default + MAL-ID checks).

---

## The malware package

Default is **`agent-dag@1.35.12`** — still live on public npm **and** flagged by Chainguard, so it reliably shows the clean `403 MALWARE_DETECTED`. Both workflows accept a dropdown choice or a free-form `custom_package` at run time. For banking-targeted examples to narrate (payment-SDK impersonation, bank typosquats), see `TALKTRACK.md`.

---

## Prerequisites

- Node 20+ and npm (CI pins Node 20).
- For Chainguard steps: a JFrog token (`export JFROG_TOKEN=...`) or an existing `libdemo/.npmrc`; `chainctl` logged in for `provenance.sh`/`sbom.sh`/`verify`.
- CI secrets (already set on the repo): `JFROG_NPM_REGISTRY`, `JFROG_NPM_AUTH_HOST`, `JFROG_TOKEN`.

## Credits

Original terminal/Docker demo by Andrew Dean & Dylan Havelock. Walkthrough video: https://drive.google.com/file/d/1E6LL6fC0-6AZIYo_al224cjmLFN5gWob/view?usp=sharing
