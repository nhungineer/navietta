# Development Setup Guide

## Issues Fixed

1. ✅ **Port conflict on macOS** - macOS AirPlay Receiver uses port 5000
2. ✅ **`reusePort` not supported on macOS** - Fixed in server/index.ts

## Quick Start

### 1. Update Your `.env` File

Add these required settings to your `.env`:

```env
# Use port 3000 instead of 5000 (macOS AirPlay conflict)
PORT=3000

# Add your Anthropic API key
NAVIETTA_DEV_API_KEY=sk-ant-your-key-here
# OR use the fallback:
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Environment
NODE_ENV=development

# Optional: Enable LangSmith tracing
LANGSMITH_TRACING=true
LANGSMITH_API_KEY=lsv2_pt_your-key-here
LANGSMITH_PROJECT=navietta-dev
```

### 2. Run the Development Server

```bash
npm run dev
```

You should see:
```
✅ Using DEVELOPMENT key: NAVIETTA_DEV_API_KEY
🔍 LangSmith tracing enabled for development
serving on port 3000
```

### 3. Access the App

Open your browser to: http://localhost:3000

## Troubleshooting

### Port 5000 Already in Use

**Problem**: macOS AirPlay Receiver uses port 5000 by default.

**Solutions**:

**Option 1: Use a different port (Recommended)**
```env
PORT=3000
```

**Option 2: Disable AirPlay Receiver**
1. Go to System Settings → General → AirDrop & Handoff
2. Turn off "AirPlay Receiver"

### Missing API Keys

If you see:
```
- Dev key exists: false
- Prod key exists: false
```

You need to add your Anthropic API key to `.env`:
```env
NAVIETTA_DEV_API_KEY=sk-ant-your-actual-key-here
```

Get your API key from: https://console.anthropic.com/settings/keys

### LangSmith Not Tracing

If you see:
```
📋 LangSmith tracing disabled
```

Add to your `.env`:
```env
LANGSMITH_TRACING=true
LANGSMITH_API_KEY=lsv2_pt_your-key-here
```

Get your LangSmith key from: https://smith.langchain.com/settings

### Database Not Required

The app uses in-memory storage by default, so you don't need to set up a database for local development.

## What's Next?

See `LANGSMITH_SETUP.md` for detailed instructions on:
- Observing your AI prompts
- Creating evaluation datasets
- A/B testing prompt variations
- Optimizing token usage
