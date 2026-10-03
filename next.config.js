/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // Don't auto-generate AGENTS.md / CLAUDE.md on `next dev` (keeps the demo repo clean).
  agentRules: false,
}

module.exports = nextConfig
