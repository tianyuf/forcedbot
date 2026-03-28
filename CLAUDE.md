# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"I Forced A Bot" - a web app that generates "I forced a bot to watch 1000 hours of X" memes in play script format. Users input a topic and the app generates humorous AI-written scripts.

## Commands

```bash
npm start       # Start the server (runs server.js)
npm install     # Install dependencies
```

The server runs at `http://localhost:3000` by default.

## Architecture

- **server.js** - Express.js backend with one API endpoint:
  - `POST /api/generate` - Generates AI scripts via OpenRouter API

- **public/index.html** - Frontend UI with:
  - Text input for topic
  - Generates JSON-formatted play scripts via AI
  - Renders scripts with screenplay formatting (scene headings, character names, dialogue)
  - Copy to clipboard and download as JPEG features

## Configuration

Environment variables in `.env`:
- `OPENROUTER_API_KEY` - Required for AI generation
- `MODEL` - AI model to use (default: x-ai/grok-4.1-fast)
- `PORT` - Server port (default: 3000)
- `SITE_URL` - Site URL for OpenRouter API referrer (default: https://forcedbot.onrender.com)

Copy `.env.example` to `.env` and add your API key.
