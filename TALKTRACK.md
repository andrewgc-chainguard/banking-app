# Supply-Chain Demo — Talk Track

Banking app → shows Chainguard Libraries blocking npm malware in a real SDLC pipeline.

- **Repo:** `github.com/andrewgc-chainguard/banking-app` (private)
- **Registry under test:** JFrog virtual repo `andrewgc-jscript` on `chainguardlibraries.jfrog.io`, proxying Chainguard Libraries for JavaScript (`libraries.cgr.dev/javascript`).
- **Pitch in one line:** *Same code, same pipeline, same developer action — the only change is the registry you resolve from. Public npm ships the malware; Chainguard blocks it.*

---

## Prereqs (before you present)

1. `chainctl auth login` (for Part 2's console/CLI lookups).
2. Repo secrets already set: `JFROG_NPM_REGISTRY`, `JFROG_NPM_AUTH_HOST`, `JFROG_TOKEN`.
3. **Warm the cache:** trigger one throwaway pipeline run beforehand. Job B's first run is slow (cold Artifactory cache + `libraries.cgr.dev`→R2 302 redirects pulling the whole dep tree). A warm run is quick and demos better.

---

## Part 1 — The pipeline (the "aha", runnable)

**GitHub → Actions → `supply-chain-demo` → Run workflow.** Leave the dropdown on the default `agent-dag@1.35.12`. (CLI: `gh workflow run supply-chain-demo.yml -R andrewgc-chainguard/banking-app`.)

Two jobs, **identical except the registry**:

| Job | Registry | Result |
|-----|----------|--------|
| **A · Unprotected** | public npm | `agent-dag` installs, build **GREEN** → malware shipped into the SDLC |
| **B · Protected** | JFrog → Chainguard | real app deps resolve fine, then `agent-dag` → **HTTP 403 MALWARE_DETECTED** → build **blocked** |

**On screen, expand Job B's block step.** The money shot:

```
npm error code E403
npm error 403 Could not download agent-dag@1.35.12 due to policy violations:
npm error 403 Chainguard Libraries withholds 113 version(s) of agent-dag:
  1.28.0 (MALWARE_DETECTED), 1.29.2 (MALWARE_DETECTED), ... and 103 more.
  This version has been blocked by Chainguard for malware.
```

**Say:**
- "Job A is what you have today — a developer adds a dependency, npm serves it, the build is green, and the malicious package is now in your artifact."
- "Job B is the *exact same pipeline*. The only difference is `.npmrc` points at our registry via your Artifactory. Your real dependencies still resolve — development doesn't change — but the malicious package is withheld with an explicit malware verdict, and the build stops."
- "No new scanner, no new gate, no developer behavior change. It's the registry."

---

## Part 2 — Banking relevance (Console Malware tab + chainctl)

Part 1's `agent-dag` is the reliable *mechanism* demo. Part 2 proves Chainguard catches malware **aimed at banks/fintech**. Open the **Console → Libraries → Malware tab** (JavaScript), or run the CLI live.

### Why not block a banking package *in the pipeline?*
Be ready for this — it's a strength, not a weakness:
- Banking-named malware (typosquats/impersonation) gets **yanked from public npm within hours**, so it can't even be installed from npm anymore (it would `ETARGET`). *npm's takedowns are reactive and incomplete — that's the problem we solve.*
- The clean on-screen `403 MALWARE_DETECTED` only shows for packages that have *some legit versions* plus a poisoned one (like `agent-dag`). Fully-malicious packages are withheld as a bare `404`. Either way **they're blocked** — the verdict detail lives in the console / `chainctl`.

### Banking-targeted examples to show

```bash
# Payment-SDK impersonation — the standout
chainctl libraries packages malware list --ecosystem JAVASCRIPT \
  --package '@staxpayments/staxpayments-js'
```
- **`@staxpayments/staxpayments-js@2.30.19`** — impersonates a real payment processor's SDK.
  Signals: **Accesses credentials · Suspicious network activity · Obfuscated or hidden payload · Linked to known malware.**
  *"A developer wiring up payments grabs this — it exfiltrates credentials. Chainguard blocks it; it's still live on npm right now."*

```bash
# "banking" + SCA (Strong Customer Authentication) — publicly confirmed
chainctl libraries packages malware list --ecosystem JAVASCRIPT \
  --package 'app-sca-info-banking'
```
- **`app-sca-info-banking@0.0.24`** — *Publicly confirmed malware* (`MAL-2026-17182`, OSV).

```bash
# Bank brand impersonation (typosquat) — likely shows the 0.0.1-security takedown stub
chainctl libraries packages malware list --ecosystem JAVASCRIPT \
  --package 'bnppf-flag-icons'
```
- **`bnppf-flag-icons`** — *Typosquatting or impersonation* of **BNP Paribas Fortis** ("bnppf"). npm already replaced it with a `0.0.1-security` stub — a live example of "npm reacted *after* the fact."

### The axios story (narrate — don't run; it's yanked)
- **`axios@1.14.1` / `0.30.4`** (`MAL-2026-2307`) — March 2026 **maintainer-account hijack** of a package *this app actually depends on*. Injected a hidden `plain-crypto-js` dependency that dropped a cross-platform **RAT** (arbitrary command execution + data exfiltration). npm removed it within hours; Chainguard blocks it independently.
- Point: *"This wasn't an obscure typosquat — it was axios, in your `package.json` right now. Supply-chain compromise hits the packages you trust most."*

---

## Close
- **Eliminated a class of attack** — known-malware packages can't enter the build.
- **Guardrails on upstream** — anything not built by Chainguard is pulled through a malware scan + cooldown.
- **Zero developer friction** — same `npm install`, same pipeline; only the registry changed.

---

## Appendix — verify / troubleshoot

```bash
# Is a package/version flagged? (rows = blocked, empty = clear)
chainctl libraries packages malware list --ecosystem JAVASCRIPT --package NAME --version VER

# What got blocked for the org in the last 30 days
chainctl libraries packages blocked
```

- **Job B went GREEN unexpectedly?** A public-npm remote is sitting ahead of the Chainguard remote in the `andrewgc-jscript` virtual repo — Artifactory served the malware via fallback. Remove it; rely on Chainguard's own upstream fallback.
- **Job B failed WITHOUT a malware verdict?** The package was yanked (`ETARGET`) or is fully-malicious (bare `404`). Pick one that's still live *and* has a clean 403 (`agent-dag@1.35.12`), or move that package to the Part 2 console talk track.
- **Swap the pipeline package live:** Run workflow → pick the dropdown, or type any `name@version` into the `custom_package` box.
