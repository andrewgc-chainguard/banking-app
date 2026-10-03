# Demo Runbook (click-by-click)

Messaging lives in `TALKTRACK.md`. This is the step order.

- **Repo:** https://github.com/andrewgc-chainguard/banking-app
- **Malware package:** `agent-dag@1.35.12` (live on npm AND flagged by Chainguard → clean 403).
- **Registry under test:** JFrog virtual repo `andrewgc-jscript` on `chainguardlibraries.jfrog.io` → Chainguard Libraries.

## Can I run these in any order?
- **Part A (GitHub) and Part B (Local) are independent** — run either first.
- **`demo.sh` is standalone** — run it anytime; it uses throwaway temp dirs and touches nothing.
- **Rules that DO matter locally:**
  1. `export JFROG_TOKEN=...` **before** any Chainguard step.
  2. `rm -rf node_modules package-lock.json` **when switching registries/branches** (public-npm and Chainguard tarballs have different integrity hashes; a stale lockfile errors).

---

## Part A — Demo on GitHub (CI/CD story)

**Prep (before the audience):** run `branch-registry-demo` once on each branch to warm the Artifactory cache so the live run is fast.

1. **Open the repo.** Ordinary Next.js banking app pulling npm deps.
2. **Adoption is one line** → **PR #1 "Adopt Chainguard Libraries"** → **Files changed**: a single `.npmrc` line changes `registry.npmjs.org` → JFrog→Chainguard.
3. **Run on `main` (today)** → Actions → **branch-registry-demo** → Run workflow → branch **`main`** → `agent-dag@1.35.12`.
   → ✅ **green**. Log: registry = `registry.npmjs.org`, malware installs, *"GREEN but COMPROMISED — ships silently."*
4. **Run on `chainguard` (after adoption)** → Run workflow → branch **`chainguard`** → same package.
   → ❌ **red**. Log: registry = `chainguardlibraries.jfrog.io/...`, then **`403 … MALWARE_DETECTED … blocked by Chainguard`**.
   → *"Red is the win — the build fails loudly instead of shipping malware. Merging that one-line PR flips green-compromised to red-protected."*
5. **(Optional) one-run side-by-side** → run **supply-chain-demo** from `main`: Job A green (public npm), Job B shows the 403 in its log.

---

## Part B — Local in the VS Code terminal (+ app running)

6. **Open the repo in VS Code**, integrated terminal. Confirm branch: `git branch --show-current` (→ `main`).
7. **Show today's source** → `cat .npmrc` → `registry=https://registry.npmjs.org/`. Open `package.json`.
8. **Run the app:**
   ```bash
   npm install
   npm run dev          # → http://localhost:3000
   ```
   Walk the banking UI. `Ctrl+C` to stop when ready.
9. **Introduce malware from public npm:**
   ```bash
   npm install agent-dag@1.35.12 --ignore-scripts
   ```
   → installs. *"Nothing stopped it."*
10. **Flip to Chainguard (one command):**
    ```bash
    ./demo.sh
    ```
    → **PUBLIC npm → INSTALLED** vs **Chainguard → BLOCKED 403 MALWARE_DETECTED**, side by side.
11. **(Optional) prove the real app still builds through Chainguard:**
    ```bash
    git checkout chainguard
    export JFROG_TOKEN=$(grep _authToken ~/mydata/cg-repo/libdemo/.npmrc | sed 's/.*_authToken=//')
    rm -rf node_modules package-lock.json
    npm install
    npm run dev          # → localhost:3000, same app, deps via Chainguard
    ```
12. **Reset:**
    ```bash
    git checkout main
    rm -rf node_modules package-lock.json
    ```

---

## Troubleshooting
- **Job B / chainguard went GREEN unexpectedly:** a public-npm remote is ahead of the Chainguard remote in the `andrewgc-jscript` virtual repo — Artifactory served the malware via fallback. Remove it.
- **Install failed without `MALWARE_DETECTED` (ETARGET/404):** package was yanked from npm or is fully-malicious (bare 404). Use one that's live AND flagged (`agent-dag@1.35.12`).
- **401/403 auth error on chainguard:** `JFROG_TOKEN` not exported (or expired).
- **Integrity/lockfile errors after switching branches:** `rm -rf node_modules package-lock.json` and reinstall.
