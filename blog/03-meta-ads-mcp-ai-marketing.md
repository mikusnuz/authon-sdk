---
title: "Managing Facebook Ads with AI: Building an MCP Server for Meta Marketing API"
published: false
description: "How we built a 123-tool MCP server that lets AI assistants manage Facebook & Instagram ad campaigns"
tags: ai, mcp, facebook, marketing
canonical_url: https://authon.dev/blog/meta-ads-mcp
---

What if you could say "pause all campaigns with ROAS below 2" to your AI assistant, and it actually did it?

We built [meta-ads-mcp](https://www.npmjs.com/package/@mikusnuz/meta-ads-mcp) — a Model Context Protocol server with 123 tools that gives AI assistants full control over Facebook and Instagram ad campaigns. Here's why we built it and how it works.

## What Is MCP?

[Model Context Protocol (MCP)](https://modelcontextprotocol.io) is an open standard from Anthropic that lets AI assistants interact with external services through structured tool calls. Instead of the AI generating code snippets for you to copy-paste, it directly invokes API operations.

Think of it as giving your AI assistant real hands — not just the ability to write instructions, but to actually execute them.

## Why Facebook Ads?

Managing Facebook Ads is painful:

1. **The Ads Manager UI is complex** — dozens of nested menus, non-obvious settings, easy to misconfigure
2. **Reporting requires manual export** — pulling insights across campaigns, date ranges, and breakdowns means clicking through multiple screens
3. **Optimization is tedious** — checking ROAS, CPA, and CTR across hundreds of ad sets, then pausing underperformers one by one
4. **The API is vast** — Meta Marketing API v25.0 has hundreds of endpoints across campaigns, ad sets, ads, creatives, audiences, insights, catalogs, and more

We wanted to collapse all of that into natural language commands.

## What meta-ads-mcp Does

The server exposes 123 tools organized into these categories:

### Campaign Management (22 tools)
Create, read, update, delete, and manage campaigns. Set budgets, schedules, objectives, and bid strategies.

**Example conversation:**
> "Create a traffic campaign called 'Spring Sale 2026' with a $50/day budget, starting tomorrow"

The AI calls `create_campaign` with the right parameters — objective, budget, schedule, status — in a single tool call.

### Ad Set Management (10 tools)
Manage targeting, placements, budgets, and scheduling at the ad set level.

> "Create an ad set targeting women aged 25-45 in the US interested in fitness"

### Ad Management (10 tools)
Create and manage individual ads within ad sets.

### Creative Management (10 tools)
Build ad creatives — images, videos, carousels, collections. Upload assets and assemble them into ad formats.

> "Upload these 4 product images and create a carousel ad with them"

### Insights & Reporting (14 tools)
Pull performance data at any level — account, campaign, ad set, or ad. Support for date ranges, breakdowns (age, gender, country, device), and async reports for large datasets.

> "Show me the top 5 campaigns by ROAS this week"

The AI calls `get_campaign_insights` for each campaign, compares ROAS, and presents a ranked table.

### Audience Management (15 tools)
Create custom audiences, lookalike audiences, and saved audiences. Add or remove users from audiences.

> "Create a lookalike audience from my email subscriber list"

### Catalog & Commerce (16 tools)
Manage product catalogs for dynamic ads. Create feeds, upload products, and set up product sets.

### Rules & Automation (4 tools)
Create automated rules that pause, adjust budgets, or send notifications based on performance conditions.

> "Create a rule that pauses any ad set with CPA above $20"

### Experiments & A/B Testing (4 tools)
Run controlled experiments between ad sets or creatives.

### Token & Account Management (6 tools)
Debug access tokens, exchange codes, check token info, and manage ad accounts.

### Ad Library & Bidding (12 tools)
Search the public Facebook Ad Library and manage bid strategies.

## Installation

Add this to your MCP client configuration (Claude Desktop, Claude Code, etc.):

```json
{
  "mcpServers": {
    "meta-ads": {
      "command": "npx",
      "args": ["-y", "@mikusnuz/meta-ads-mcp"],
      "env": {
        "META_ADS_ACCESS_TOKEN": "your-access-token",
        "META_AD_ACCOUNT_ID": "123456789",
        "META_APP_ID": "your-app-id",
        "META_APP_SECRET": "your-app-secret",
        "META_BUSINESS_ID": "your-business-id",
        "META_PIXEL_ID": "your-pixel-id"
      }
    }
  }
}
```

Only `META_ADS_ACCESS_TOKEN` and `META_AD_ACCOUNT_ID` are required. The other variables unlock additional features (token management, business tools, conversion tracking).

## Example Workflows

### Workflow 1: Morning Performance Review

**You:** "How are my campaigns doing today? Pause anything with CTR below 0.5%."

**AI does:**
1. `list_campaigns` — gets all active campaigns
2. `get_campaign_insights` — pulls today's metrics for each
3. Identifies campaigns with CTR < 0.5%
4. `update_campaign` — pauses underperformers
5. Reports the results in a table

### Workflow 2: Launch a New Campaign

**You:** "Launch a conversion campaign for our new product. Target US women 25-45 interested in skincare. $100/day budget. Use this image and this headline."

**AI does:**
1. `upload_image` — uploads the creative asset
2. `create_campaign` — sets up the conversion campaign
3. `create_adset` — configures targeting and budget
4. `create_creative` — builds the ad creative
5. `create_ad` — ties it all together
6. Reports the new campaign ID and status

### Workflow 3: Weekly Report

**You:** "Generate a weekly report broken down by age and gender."

**AI does:**
1. `get_account_insights` with date range and breakdowns
2. Formats the data into a readable table
3. Highlights top-performing segments

### Workflow 4: Audience Building

**You:** "Create a 1% lookalike audience based on my top purchasers from the last 90 days."

**AI does:**
1. `create_custom_audience` — source audience from pixel events
2. `create_lookalike_audience` — 1% lookalike in target country
3. Reports the audience ID and estimated size

## Technical Details

The server is built with:
- **TypeScript** — fully typed tool definitions
- **MCP SDK** — uses the official `@modelcontextprotocol/sdk` package
- **Meta Marketing API v25.0** — latest API version with full coverage

Each tool has a structured input schema with parameter validation. The AI knows exactly what parameters are required, what's optional, and what values are valid.

## What It Doesn't Do

- **No automatic spending** — creating a campaign with `PAUSED` status is the default; you explicitly activate it
- **No sensitive data access** — the server doesn't store credentials; they're passed via environment variables
- **No blind optimization** — the AI shows you what it plans to do and the results; you stay in control

## Getting Started

1. Get a [Meta Marketing API access token](https://developers.facebook.com/tools/explorer/)
2. Install the MCP server (config above)
3. Ask your AI assistant "list my active campaigns"

The server is [open source on npm](https://www.npmjs.com/package/@mikusnuz/meta-ads-mcp) and [GitHub](https://github.com/mikusnuz/meta-ads-mcp).

## What's Next

We're expanding the tool set to cover:
- Lead form management
- Conversions API (server-side events)
- Automated reporting schedules
- Cross-account management for agencies

If you manage Facebook Ads and use an AI assistant, give meta-ads-mcp a try. Managing campaigns through conversation is a qualitatively different experience — faster iteration, easier reporting, and less time spent clicking through the Ads Manager.
