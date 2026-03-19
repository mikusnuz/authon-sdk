---
title: "8 MCP Servers That Let AI Manage Your Developer Infrastructure"
published: false
description: "From app publishing to domain management — a collection of MCP servers for AI-powered dev workflows"
tags: ai, mcp, devtools, productivity
canonical_url: https://authon.dev/blog/8-mcp-servers
---

We've been building MCP (Model Context Protocol) servers for over a year. What started as a single tool for npm publishing has grown into a collection of 8 servers that cover app stores, ad platforms, SEO, analytics, social media, domain registration, and more.

Every server follows the same pattern: take a complex API with dozens of endpoints, expose them as structured MCP tools, and let AI assistants operate them through natural language. Here's the full collection.

## What Is MCP?

[Model Context Protocol](https://modelcontextprotocol.io) is an open standard that lets AI assistants call external tools. Instead of the AI telling you what API calls to make, it makes them directly. You describe what you want in plain language, the AI translates that into structured tool calls, and the results come back into the conversation.

All 8 servers below are installed as MCP servers in your AI client (Claude Desktop, Claude Code, Cursor, etc.) and run locally via `npx`.

---

## 1. app-publish-mcp — App Store Connect & Google Play Console

**What it does:** Manage iOS and Android app listings, screenshots, releases, reviews, and submissions from your AI assistant.

**Use cases:**
- "Update the App Store description for version 2.3"
- "Upload these screenshots for the iPad Pro display size"
- "Create a new release and submit for review"
- "Check the status of my pending app review"
- "Reply to this 1-star review"

**Install:**
```json
{
  "mcpServers": {
    "app-publish": {
      "command": "npx",
      "args": ["-y", "app-publish-mcp"],
      "env": {
        "APP_STORE_KEY_ID": "...",
        "APP_STORE_ISSUER_ID": "...",
        "APP_STORE_PRIVATE_KEY": "...",
        "GOOGLE_PLAY_SERVICE_ACCOUNT_JSON": "..."
      }
    }
  }
}
```

**npm:** [app-publish-mcp](https://www.npmjs.com/package/app-publish-mcp)

---

## 2. npm-mcp — npm Registry Management

**What it does:** Publish, version, search, audit, and manage npm packages through AI.

**Use cases:**
- "Publish this package to npm with a patch version bump"
- "Run a security audit on this project"
- "Deprecate version 1.0.0 with a migration notice"
- "Add @teammate as a maintainer of this package"
- "Search npm for React date picker libraries with more than 1000 weekly downloads"

**Install:**
```json
{
  "mcpServers": {
    "npm": {
      "command": "npx",
      "args": ["-y", "@mikusnuz/npm-mcp"],
      "env": {
        "NPM_TOKEN": "your-npm-token"
      }
    }
  }
}
```

**npm:** [@mikusnuz/npm-mcp](https://www.npmjs.com/package/@mikusnuz/npm-mcp)

---

## 3. meta-ads-mcp — Facebook & Instagram Ads

**What it does:** 123 tools for managing Meta Marketing API — campaigns, ad sets, ads, creatives, audiences, insights, catalogs, rules, and experiments.

**Use cases:**
- "Create a conversion campaign targeting US women 25-45"
- "Pause all campaigns with ROAS below 2"
- "Pull a weekly performance report broken down by age"
- "Create a 1% lookalike audience from my customer list"
- "Search the Ad Library for competitor ads in my category"

**Install:**
```json
{
  "mcpServers": {
    "meta-ads": {
      "command": "npx",
      "args": ["-y", "@mikusnuz/meta-ads-mcp"],
      "env": {
        "META_ADS_ACCESS_TOKEN": "...",
        "META_AD_ACCOUNT_ID": "..."
      }
    }
  }
}
```

**npm:** [@mikusnuz/meta-ads-mcp](https://www.npmjs.com/package/@mikusnuz/meta-ads-mcp)

---

## 4. meta-mcp — Instagram Graph API & Threads

**What it does:** Full coverage of Instagram Graph API v25.0, Threads API, and Meta platform management. Manage posts, stories, reels, comments, insights, and more.

**Use cases:**
- "Schedule an Instagram post for tomorrow at 9am"
- "Get engagement metrics for my last 10 posts"
- "Reply to all unanswered comments from today"
- "Create a Threads post with this image"
- "Show me my top-performing reels this month"

**Install:**
```json
{
  "mcpServers": {
    "meta": {
      "command": "npx",
      "args": ["-y", "@mikusnuz/meta-mcp"],
      "env": {
        "META_ACCESS_TOKEN": "...",
        "INSTAGRAM_BUSINESS_ACCOUNT_ID": "..."
      }
    }
  }
}
```

**npm:** [@mikusnuz/meta-mcp](https://www.npmjs.com/package/@mikusnuz/meta-mcp)

---

## 5. gsc-mcp — Google Search Console & Indexing API

**What it does:** Full Google Search Console API coverage — search analytics, URL inspection, sitemaps, site management, and the Indexing API for instant page indexing.

**Use cases:**
- "What are my top 20 search queries this week?"
- "Inspect this URL for indexing issues"
- "Submit this new page to the Google index"
- "Compare my search performance this month vs last month"
- "List all sitemaps and their status"

**Install:**
```json
{
  "mcpServers": {
    "gsc": {
      "command": "npx",
      "args": ["-y", "@mikusnuz/gsc-mcp"],
      "env": {
        "GSC_SERVICE_ACCOUNT_JSON": "..."
      }
    }
  }
}
```

**npm:** [@mikusnuz/gsc-mcp](https://www.npmjs.com/package/@mikusnuz/gsc-mcp)

---

## 6. umami-mcp — Umami Analytics

**What it does:** 66 tools covering the entire Umami Analytics API v2 — websites CRUD, pageviews, events, sessions, realtime data, reports, user management, and teams.

**Use cases:**
- "How many pageviews did my site get today?"
- "Show me the top referrers this week"
- "Create a funnel report for signup > onboarding > purchase"
- "List all active sessions right now"
- "Compare this week's traffic to last week"

**Install:**
```json
{
  "mcpServers": {
    "umami": {
      "command": "npx",
      "args": ["-y", "@mikusnuz/umami-mcp"],
      "env": {
        "UMAMI_API_URL": "https://your-umami-instance.com",
        "UMAMI_API_KEY": "..."
      }
    }
  }
}
```

**npm:** [@mikusnuz/umami-mcp](https://www.npmjs.com/package/@mikusnuz/umami-mcp)

---

## 7. cws-mcp — Chrome Web Store

**What it does:** Upload, publish, and manage Chrome extensions directly from your AI assistant.

**Use cases:**
- "Upload a new version of my Chrome extension"
- "Publish the extension to production"
- "Check the review status of my latest submission"
- "Update the extension description and screenshots"

**Install:**
```json
{
  "mcpServers": {
    "cws": {
      "command": "npx",
      "args": ["-y", "cws-mcp"],
      "env": {
        "CWS_CLIENT_ID": "...",
        "CWS_CLIENT_SECRET": "...",
        "CWS_REFRESH_TOKEN": "..."
      }
    }
  }
}
```

**npm:** [cws-mcp](https://www.npmjs.com/package/cws-mcp)

---

## 8. dynadot-mcp — Domain Management (Dynadot)

**What it does:** Manage domains, DNS records, contacts, transfers, and more through the Dynadot domain registrar API.

**Use cases:**
- "Search for available domains containing 'authon'"
- "Update the DNS A record for authon.dev to 1.2.3.4"
- "Set up email forwarding for hello@authon.dev"
- "Lock this domain to prevent unauthorized transfers"
- "Renew all domains expiring in the next 30 days"

**Install:**
```json
{
  "mcpServers": {
    "dynadot": {
      "command": "npx",
      "args": ["-y", "dynadot-mcp"],
      "env": {
        "DYNADOT_API_KEY": "..."
      }
    }
  }
}
```

**npm:** [dynadot-mcp](https://www.npmjs.com/package/dynadot-mcp)

---

## The Common Pattern

Every server follows the same architecture:

1. **TypeScript** — fully typed tool schemas with input validation
2. **MCP SDK** — built on `@modelcontextprotocol/sdk` for standard compatibility
3. **npx-ready** — install with zero dependencies, just `npx -y <package>`
4. **Environment variables** — credentials are passed via env vars, never stored
5. **Structured output** — results are returned as structured JSON, not raw text

## How We Use Them Together

In a typical workflow, multiple MCP servers work together:

1. **Ship a release** — npm-mcp publishes the package, app-publish-mcp submits the mobile app, cws-mcp uploads the Chrome extension
2. **Announce it** — meta-mcp posts to Instagram and Threads
3. **Track performance** — gsc-mcp monitors search rankings, umami-mcp tracks website analytics
4. **Run ads** — meta-ads-mcp creates and optimizes ad campaigns
5. **Manage infrastructure** — dynadot-mcp updates DNS when needed

All from a single conversation with an AI assistant.

## Getting Started

Pick the servers relevant to your workflow, add them to your MCP client config, and start talking to your infrastructure.

Every server is open source and available on npm:

| Server | npm | Tools |
|---|---|---|
| app-publish-mcp | [npm](https://www.npmjs.com/package/app-publish-mcp) | App Store + Google Play |
| npm-mcp | [npm](https://www.npmjs.com/package/@mikusnuz/npm-mcp) | npm registry |
| meta-ads-mcp | [npm](https://www.npmjs.com/package/@mikusnuz/meta-ads-mcp) | Facebook/Instagram Ads (123 tools) |
| meta-mcp | [npm](https://www.npmjs.com/package/@mikusnuz/meta-mcp) | Instagram + Threads |
| gsc-mcp | [npm](https://www.npmjs.com/package/@mikusnuz/gsc-mcp) | Google Search Console |
| umami-mcp | [npm](https://www.npmjs.com/package/@mikusnuz/umami-mcp) | Umami Analytics (66 tools) |
| cws-mcp | [npm](https://www.npmjs.com/package/cws-mcp) | Chrome Web Store |
| dynadot-mcp | [npm](https://www.npmjs.com/package/dynadot-mcp) | Dynadot domains |

If there's an API you wish had an MCP server, open an issue on any of the repos. We're always looking for the next API to wrap.
