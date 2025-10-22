# Discord Guardian Bot

A powerful Discord anti-spam and security bot that uses **link scanning** and **behavioral detection** to protect your server from wallet-draining scams, compromised accounts, and spam attacks.

## Features

### 🔗 Link Scanning & Reputation Checking
- Real-time URL analysis against threat intelligence databases
- Google Safe Browsing API integration
- Custom whitelist for trusted domains
- Pattern-based blacklist for known scam keywords
- Suspicious TLD detection (.tk, .ml, .xyz, etc.)
- Support for VirusTotal API (optional)

### 🧠 Behavioral Analysis & Anomaly Detection
- **Compromised Account Detection**: Identifies when legitimate accounts are hijacked
  - Tracks baseline behavior (message frequency, timing patterns)
  - Flags sudden deviations (5x normal posting rate)
  - Detects unusual activity windows
- **Velocity Monitoring**: Catches spam bursts (10+ messages/minute)
- **New User Screening**: Flags join-and-spam patterns (<10 seconds)
- **Copypasta Detection**: Identifies duplicate messages across users
- **Mention Spam Prevention**: Blocks mass @everyone/@here abuse
- **Keyword Filtering**: Detects suspicious phrases ("free mint", "verify wallet", etc.)

### 🛡️ Automated Protection
- Instant message deletion for high-risk content
- Automatic temporary muting of suspicious accounts
- Quarantine system for new members
- User warning notifications via DM
- Comprehensive moderation logging

### 📊 Incident Tracking
- SQLite database for behavior baselines
- Historical incident records
- Risk scoring system (0-100)
- Detailed audit logs for moderators

## How It Works

### Defense Layers

1. **Layer 1: Link Reputation** (First line of defense)
   - Intercepts all messages with URLs
   - Checks against whitelisted domains (instant pass)
   - Scans suspicious links via Google Safe Browsing
   - Auto-deletes malicious links before users can click

2. **Layer 2: Behavioral Analysis** (Catches compromised accounts)
   - Builds baseline profile for each user over time
   - Monitors message velocity, timing, and patterns
   - Flags anomalous behavior (e.g., account posting 20x normal rate)

3. **Layer 3: Content Filtering** (Pattern matching)
   - Keyword blacklist for common scam phrases
   - String similarity detection for copypasta
   - Mention spam protection

4. **Layer 4: New User Protection** (Prevents bot spam)
   - Quarantine role for new members
   - Link posting restrictions for accounts <24 hours old
   - Join-to-post time monitoring

### Risk Scoring System

The bot calculates a risk score (0-100) based on:
- **Critical flags (40 points each)**: Malicious links, join-and-spam pattern
- **High flags (25 points)**: Velocity spikes, baseline deviation, repeated violations
- **Medium flags (15 points)**: Copypasta, suspicious keywords, mention spam
- **Low flags (5 points)**: URL shorteners, minor anomalies

**Actions by Risk Level:**
- **Critical (80+)**: Delete message + Mute user + Alert mods
- **High (60-79)**: Delete message + Warn user + Alert mods
- **Medium (40-59)**: Delete message + Alert mods
- **Low (20-39)**: Flag for moderator review

## Installation

### Prerequisites
- Node.js 18+ installed
- A Discord account and server
- Discord bot token (see setup guide below)

### Step 1: Clone and Install

```bash
cd discord-guardian-bot
npm install
```

### Step 2: Create Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to "Bot" tab and click "Add Bot"
4. Under "Privileged Gateway Intents", enable:
   - ✅ Server Members Intent
   - ✅ Message Content Intent
5. Click "Reset Token" and copy your bot token

### Step 3: Invite Bot to Your Server

Generate an invite URL with these permissions:
1. In Developer Portal, go to "OAuth2" → "URL Generator"
2. Select scopes:
   - ✅ `bot`
   - ✅ `applications.commands`
3. Select bot permissions:
   - ✅ Read Messages/View Channels
   - ✅ Send Messages
   - ✅ Manage Messages (for deletion)
   - ✅ Moderate Members (for timeout/mute)
   - ✅ Manage Roles (for quarantine system)
4. Copy the generated URL and open it to invite the bot

### Step 4: Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and fill in:

```env
# Required
DISCORD_BOT_TOKEN=your_bot_token_here

# Required for moderation alerts
MOD_LOG_CHANNEL_ID=123456789012345678

# Optional but recommended for new user quarantine
QUARANTINE_ROLE_ID=123456789012345678

# Highly recommended for link scanning
GOOGLE_SAFE_BROWSING_API_KEY=your_api_key_here
```

**Getting Channel/Role IDs:**
1. Enable Developer Mode in Discord: Settings → App Settings → Advanced → Developer Mode
2. Right-click on a channel or role and select "Copy ID"

**Getting Google Safe Browsing API Key (Free):**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable "Safe Browsing API"
4. Go to "Credentials" and create an API key
5. Free tier: 10,000 requests/day

### Step 5: Set Up Quarantine Role (Optional)

To use the new user quarantine system:

1. Create a new role called "Quarantined" in your server
2. Configure channel permissions to restrict this role:
   - ❌ Send Messages
   - ❌ Add Reactions
   - ❌ Attach Files
   - ❌ Embed Links
3. Copy the role ID and add it to `.env`

### Step 6: Start the Bot

```bash
npm start
```

You should see:
```
🛡️  Guardian Bot Starting...
✅ Logged in as YourBot#1234
✅ Database initialized
✅ Moderation system ready
🛡️  Guardian Bot is now protecting your server!
```

## Configuration

Edit `config/config.js` to customize thresholds and behavior:

### Key Settings You Might Want to Adjust

```javascript
behavior: {
  maxMessagesPerMinute: 10,              // Lower = stricter
  velocityMultiplierThreshold: 5,        // Flag if user posts 5x their normal rate
  newUserThresholdMs: 24 * 60 * 60 * 1000, // Consider accounts <24hrs as "new"
}

links: {
  whitelist: [/* Add your trusted domains here */],
  enableGoogleSafeBrowsing: true,        // Requires API key
}

moderation: {
  autoDelete: true,                      // Auto-delete suspicious messages
  autoMute: true,                        // Auto-mute high-risk users
  muteDurationMs: 10 * 60 * 1000,       // 10 minute timeout
  sendWarnings: true,                    // DM users when action is taken
}
```

## Testing

### Test Link Scanning

Try posting (in a test channel):
```
Check out this site: https://example.tk/free-mint
```

The bot should:
1. Delete the message immediately
2. Send you a warning DM
3. Log the incident to mod channel

### Test Behavioral Detection

To trigger velocity detection:
1. Create a test account
2. Have it post 15 messages in under a minute
3. Bot should auto-mute and alert mods

### Test New User Protection

1. Create a brand new account (or use an alt)
2. Join the server
3. Immediately post a link
4. Bot should flag as "join-and-spam"

## Monitoring

### Moderation Log Channel

Set `MOD_LOG_CHANNEL_ID` in `.env` to receive alerts like:

```
🛡️ Security Alert: Malicious Link Blocked
User: SpamBot#1234 (123456789)
Severity: critical
Risk Score: 100/100

Detection Flags:
• Matches blacklist pattern
• Google Safe Browsing: SOCIAL_ENGINEERING

Action Taken: Message deleted, user muted for 10 minutes
```

### Database Insights

The bot stores data in `data/guardian.db`:
- `user_baselines`: Historical behavior for each user
- `message_history`: Recent message metadata for velocity checks
- `incidents`: All security incidents
- `recent_messages`: Recent content for copypasta detection

You can query this with any SQLite client to analyze patterns.

## Advanced Features

### Adding Custom Threat Intelligence

In `src/linkScanner.js`, add additional scanning methods:

```javascript
async checkCustomAPI(url) {
  // Your custom threat intel API
  const response = await fetch(`https://your-api.com/check?url=${url}`);
  // Process and return result
}
```

### Training on Your Server's Spam

The bot learns from moderator actions:
1. Review incidents in the database
2. Adjust thresholds in `config/config.js` based on false positives
3. Add recurring spam patterns to blacklist

### Webhook Integration

Send alerts to external tools (Slack, PagerDuty, etc.):

```javascript
// In moderationActions.js
async sendExternalAlert(incident) {
  await fetch(process.env.WEBHOOK_URL, {
    method: 'POST',
    body: JSON.stringify(incident)
  });
}
```

## Troubleshooting

### Bot Doesn't Respond to Messages
- ✅ Ensure "Message Content Intent" is enabled in Discord Developer Portal
- ✅ Check bot has "Read Messages" permission in channels
- ✅ Verify bot is online (green status)

### Link Scanning Not Working
- ✅ Check `GOOGLE_SAFE_BROWSING_API_KEY` is set in `.env`
- ✅ Verify API key has Safe Browsing API enabled
- ✅ Check console for API error messages

### Bot Can't Delete Messages
- ✅ Ensure bot has "Manage Messages" permission
- ✅ Bot role must be higher than user's highest role
- ✅ Check channel-specific permission overrides

### Bot Can't Mute Users
- ✅ Ensure bot has "Moderate Members" permission
- ✅ Bot role must be higher than user's highest role

### High False Positive Rate
- Increase thresholds in `config/config.js`:
  - Raise `maxMessagesPerMinute`
  - Increase `velocityMultiplierThreshold`
  - Add more domains to whitelist

## Architecture

```
discord-guardian-bot/
├── src/
│   ├── index.js              # Main bot logic, event handlers
│   ├── linkScanner.js        # URL reputation checking
│   ├── behaviorDetector.js   # Behavioral analysis engine
│   ├── moderationActions.js  # Action system (delete, mute, alert)
│   └── database.js           # SQLite wrapper for tracking
├── config/
│   └── config.js             # All configurable settings
├── data/                     # Created on first run
│   └── guardian.db           # SQLite database
├── .env                      # Your secrets (not in git)
├── .env.example              # Template
├── package.json
└── README.md
```

## Security & Privacy

- **Data Storage**: All data is stored locally in SQLite (no cloud uploads)
- **Retention**: Message history is automatically cleaned up after 30 days
- **Message Content**: Only metadata is stored (timestamps, counts), not full content
- **User Privacy**: Users are notified via DM when actions are taken

## Roadmap

Future enhancements:
- [ ] Machine learning model for spam classification
- [ ] Image OCR for spam content in images
- [ ] Account reputation system with appeal process
- [ ] Multi-server intelligence sharing (opt-in)
- [ ] Web dashboard for analytics
- [ ] Integration with Discord's AutoMod

## Contributing

This bot is designed to be a starting point. Feel free to:
- Add new detection techniques
- Integrate additional threat intelligence APIs
- Improve the risk scoring algorithm
- Create custom moderation workflows

## License

MIT License - Use freely and modify as needed.

## Disclaimer

This bot is a defensive tool for protecting Discord communities. While it's designed to minimize false positives, no automated system is perfect. Always:
- Monitor the moderation log channel
- Review flagged content manually when possible
- Adjust thresholds based on your server's needs
- Have moderators available to handle appeals

The bot operators are not responsible for false positives or security incidents. Use at your own discretion.

## Support

For issues, feature requests, or questions:
- Check the troubleshooting section above
- Review configuration settings
- Test in a development server first

Stay safe! 🛡️
