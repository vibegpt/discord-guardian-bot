# Quick Start Guide

Get Guardian Bot running in 5 minutes!

## Prerequisites Check

- [ ] Node.js 18+ installed (`node --version`)
- [ ] Discord account with admin access to a server

## Setup Steps

### 1. Create Discord Bot (2 minutes)

1. Go to https://discord.com/developers/applications
2. Click "New Application" → Name it "Guardian Bot"
3. Go to "Bot" tab → Click "Reset Token" → **SAVE THIS TOKEN**
4. Enable these intents:
   - ✅ Server Members Intent
   - ✅ Message Content Intent

### 2. Invite Bot to Server (1 minute)

1. In Developer Portal: OAuth2 → URL Generator
2. Select: `bot` and `applications.commands`
3. Bot Permissions:
   - ✅ Read Messages/View Channels
   - ✅ Send Messages
   - ✅ Manage Messages
   - ✅ Moderate Members
   - ✅ Manage Roles
4. Copy URL → Open in browser → Select your server → Authorize

### 3. Get Google Safe Browsing API Key (Optional, 2 minutes)

**For maximum protection, highly recommended!**

1. Go to https://console.cloud.google.com/
2. Create new project → Enable "Safe Browsing API"
3. Credentials → Create API Key → **SAVE THIS KEY**

Free tier: 10,000 checks/day (plenty for most servers)

### 4. Configure Bot (1 minute)

```bash
cd discord-guardian-bot
npm install
cp .env.example .env
```

Edit `.env`:
```env
DISCORD_BOT_TOKEN=paste_your_bot_token_here
MOD_LOG_CHANNEL_ID=right_click_channel_copy_id
GOOGLE_SAFE_BROWSING_API_KEY=paste_api_key_here
```

**Getting Channel ID:**
- Discord Settings → Advanced → Enable "Developer Mode"
- Right-click any channel → "Copy ID"

### 5. Start Bot

```bash
npm start
```

✅ **Done!** Your server is now protected.

## Quick Configuration

Edit `config/config.js` to adjust:

**More Strict** (for large public servers):
```javascript
maxMessagesPerMinute: 5,        // Was 10
newUserMaxLinksPerHour: 1,      // Was 2
autoMute: true,                 // Keep enabled
```

**More Lenient** (for small trusted communities):
```javascript
maxMessagesPerMinute: 20,       // Was 10
velocityMultiplierThreshold: 10, // Was 5
autoMute: false,                // Only delete, don't mute
```

## Test It Works

Post in a test channel:
```
Hey check out http://example.tk/free-mint
```

Expected behavior:
1. Message deleted instantly
2. You receive a warning DM
3. Alert posted in mod log channel

## What's Happening Under the Hood

The bot is now:
- ✅ Scanning every URL against Google's threat database
- ✅ Building behavioral baselines for each user
- ✅ Tracking message velocity and patterns
- ✅ Detecting copypasta and spam keywords
- ✅ Flagging compromised accounts by behavior change

## Next Steps

1. **Create a mod-log channel** for alerts (recommended)
2. **Set up quarantine role** for new members (optional)
3. **Review incidents** in `data/guardian.db` after first day
4. **Adjust thresholds** in `config/config.js` based on false positives

## Common Issues

**Bot offline?**
→ Check token in `.env` is correct

**Not deleting messages?**
→ Ensure bot role is high enough in role hierarchy

**No link scanning alerts?**
→ Add `GOOGLE_SAFE_BROWSING_API_KEY` to `.env`

## Getting Help

Read the full [README.md](README.md) for:
- Detailed feature explanations
- Advanced configuration
- Troubleshooting guide
- Architecture overview

---

**You're all set!** Your server is now protected against wallet-draining spam and compromised accounts. 🛡️
