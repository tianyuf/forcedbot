# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"I Forced A Bot" - a web app that generates "I forced a bot to watch 1000 hours of X" memes in play script format. Users input a topic and the app generates humorous AI-written scripts.

## Deployment Options

### Option A: VPS + Vercel (Recommended)
- **Frontend**: Static HTML on your VPS (Nginx)
- **Backend**: API on Vercel serverless
- Update `API_URL` in `public/index.html` to point to your Vercel deployment

### Option B: Single VPS
- See `server.js` for traditional Express setup

### Option C: Render/Railway
- See `.env.example` for configuration

## Commands

```bash
# Local dev (requires server.js setup)
npm start

# Deploy API to Vercel
vercel --prod
```

## Architecture

- **api/generate.js** - Vercel serverless function (if using Vercel)
- **server.js** - Express.js backend (if using single VPS)
- **public/index.html** - Frontend UI with screenplay formatting

## Configuration

Set env vars in Vercel dashboard or `.env` file:
- `OPENROUTER_API_KEY` - Required for AI generation
- `MODEL` - AI model to use (default: x-ai/grok-4.1-fast)
- `SITE_URL` - Site URL for OpenRouter API referrer
