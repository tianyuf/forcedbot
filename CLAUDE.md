# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"I Forced A Bot" - a web app that generates "I forced a bot to watch 1000 hours of X" memes in play script format. Users can input text or YouTube URLs, and the app generates humorous AI-written scripts.

## Commands

```bash
npm start       # Start the server (runs server.js)
npm install     # Install dependencies
```

The server runs at `http://localhost:3000` by default.

## Architecture

- **server.js** - Express.js backend with two API endpoints:
  - `POST /api/youtube/transcript` - Fetches transcripts from YouTube videos
  - `POST /api/chat` - Proxies requests to OpenRouter AI API

- **public/index.html** - Frontend UI with:
  - Text mode and YouTube mode (tabbed interface)
  - Generates JSON-formatted play scripts via AI
  - Renders scripts with screenplay formatting (scene headings, character names, dialogue)
  - Copy to clipboard and download as JPEG features

## Configuration

Environment variables in `.env`:
- `OPENROUTER_API_KEY` - Required for AI generation
- `MODEL` - AI model to use (default: x-ai/grok-4.1-fast)
- `PORT` - Server port (default: 3000)

Copy `.env.example` to `.env` and add your API key.