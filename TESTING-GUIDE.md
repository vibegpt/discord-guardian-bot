# Testing Guide - Verify Guardian Bot on Your Server

This guide walks you through testing all features on your Discord server.

## Pre-Test Setup (5 minutes)

### Step 1: Install Dependencies

```bash
cd discord-guardian-bot
npm install
```

### Step 2: Create Your Bot on Discord

1. Go to https://discord.com/developers/applications
2. Click **"New Application"**
3. Name it (e.g., "Guardian Bot Test")
4. Go to **"Bot"** tab → Click **"Reset Token"**
5. **COPY THE TOKEN** (you'll need this in a moment)
6. Scroll down to **"Privileged Gateway Intents"**:
   - ✅ Enable **"SERVER MEMBERS INTENT"**
   - ✅ Enable **"MESSAGE CONTENT INTENT"**
7. Click **"Save Changes"**

### Step 3: Invite Bot to Your Server

1. In Discord Developer Portal, go to **"OAuth2"** → **"URL Generator"**
2. Under **"Scopes"**, check:
   - ✅ `bot`
3. Under **"Bot Permissions"**, check:
   - ✅ Read Messages/View Channels
   - ✅ Send Messages
   - ✅ Manage Messages
   - ✅ Moderate Members (for timeout)
   - ✅ Manage Roles (for quarantine)
4. **Copy the generated URL** at the bottom
5. Open URL in browser → Select your server → Click **"Authorize"**
6. The bot should now appear in your server (offline/gray for now)

### Step 4: Configure the Bot

```bash
# Create .env file
cp .env.example .env
```

Edit `.env` file:

```bash
# Open with your text editor
nano .env
# or
code .env
# or
open -e .env
```

**Required: Add your bot token**
```env
DISCORD_BOT_TOKEN=paste_your_token_here
```

**Required: Get your mod log channel ID**
1. In Discord: Settings → Advanced → Enable **"Developer Mode"**
2. Right-click any text channel → **"Copy ID"**
3. Add to `.env`:
```env
MOD_LOG_CHANNEL_ID=paste_channel_id_here
```

**Optional but recommended: Google Safe Browsing API**
- Without this, link scanning will only use pattern matching (still useful!)
- With this, you get real-time malware/phishing detection
- Get free key: https://console.cloud.google.com/ → Enable "Safe Browsing API" → Create API Key
```env
GOOGLE_SAFE_BROWSING_API_KEY=paste_api_key_here
```

Save the `.env` file.

### Step 5: Start the Bot

```bash
npm start
```

**Expected output:**
```
🛡️  Guardian Bot Starting...
✅ Logged in as Guardian Bot Test#1234
✅ Database initialized
✅ Moderation system ready
🛡️  Guardian Bot is now protecting your server!

Active Protection Features:
  - Link Scanning: ✅
  - Behavioral Analysis: ✅
  - Auto-Delete: ✅
  - Auto-Mute: ✅
  ...
```

✅ **Bot should now show as ONLINE (green) in your Discord server!**

---

## Test Suite - Try Each Feature

### Test 1: Basic Link Detection (Pattern Matching)

**What you're testing:** Bot can detect suspicious URL patterns even without API

**How to test:**
1. Go to a test channel in your server
2. Post this message:
   ```
   Check out this free mint: https://fake-site.tk/verify-wallet
   ```

**Expected behavior:**
- ⚡ Message deleted within 1 second
- 📧 You receive a DM from the bot:
  ```
  ⚠️ Message Removed
  Your message in [ServerName] was automatically removed.
  Reason: Malicious link detected
  Channel: #test-channel
  ```
- 📢 Alert appears in your mod log channel showing the threat

**What it detected:**
- Suspicious TLD (.tk)
- Blacklist pattern match ("verify-wallet")

---

### Test 2: Whitelisted Links (Should NOT Delete)

**What you're testing:** Trusted domains bypass scanning

**How to test:**
1. Post this message:
   ```
   Check out this video: https://youtube.com/watch?v=dQw4w9WgXcQ
   ```

**Expected behavior:**
- ✅ Message stays (NOT deleted)
- ✅ No DM received
- ✅ No alert in mod log
- Bot silently allows it (youtube.com is whitelisted)

**Try these other whitelisted domains:**
- `https://github.com/example/repo`
- `https://twitter.com/someone/status/123`
- `https://discord.com/channels/123/456`

All should be allowed.

---

### Test 3: Velocity Detection (Message Spam)

**What you're testing:** Bot detects rapid message bursts

**How to test:**
1. Quickly post 15+ messages in under 30 seconds
   ```
   message 1
   message 2
   message 3
   ...
   message 15
   ```

**Expected behavior:**
- After ~10 messages, bot detects velocity spike
- 📢 Alert in mod log channel:
  ```
  📊 Behavioral analysis for YourName#1234:
  Risk 65/100 (high)
  Flags: excessive_velocity_minute
  ```
- Depending on config, might auto-mute

**Note:** If you're a server admin, the bot may skip auto-mute but still log the alert.

---

### Test 4: Suspicious Keywords

**What you're testing:** Content filtering for scam phrases

**How to test:**
1. Post these messages one at a time:
   ```
   FREE MINT! Claim your airdrop now!
   ```
   ```
   Verify your wallet to receive tokens
   ```
   ```
   @everyone Free Discord Nitro!
   ```

**Expected behavior:**
- Messages flagged for suspicious keywords
- May be deleted depending on combined risk score
- Alerts sent to mod log with detected keywords

---

### Test 5: New Account Join-and-Spam Detection

**What you're testing:** Bot catches brand new accounts posting immediately

**How to test (requires a second account):**
1. Create a new Discord account (or use an alt)
2. Join your server with the new account
3. **Immediately** post a message with a link (within 5-10 seconds)
   ```
   Check this out: https://example.com/test
   ```

**Expected behavior:**
- 🚨 Critical alert: "Join-and-spam pattern detected"
- Message likely deleted
- High risk score due to:
  - New account (< 24 hours old)
  - Posted immediately after joining
  - Posted a link

**Without second account:** You can simulate by looking at the `newUserThresholdMs` in `config/config.js` (default 24 hours). Any account created in the last 24 hours posting links will be monitored closely.

---

### Test 6: Copypasta Detection

**What you're testing:** Bot detects duplicate messages across users

**How to test (requires second account or friend):**
1. Account 1 posts:
   ```
   Check out this amazing opportunity for free crypto!
   ```
2. Wait 10 seconds
3. Account 2 posts the **exact same message**:
   ```
   Check out this amazing opportunity for free crypto!
   ```

**Expected behavior:**
- Second message flagged as copypasta
- Alert in mod log: "95% similar to recent message"
- Second message may be deleted

---

### Test 7: Mention Spam

**What you're testing:** Bot prevents mass mention abuse

**How to test:**
1. Post a message mentioning many users:
   ```
   @user1 @user2 @user3 @user4 @user5 @user6 Hey everyone!
   ```
2. Or post:
   ```
   @everyone Check this out!
   ```

**Expected behavior:**
- If mentions exceed threshold (default 5), message flagged
- @everyone usage tracked (multiple uses per hour = high risk)
- Alert sent to mods

---

### Test 8: Link Scanner Test Suite

**What you're testing:** All link scanning functionality

**How to test:**
```bash
npm test
```

**Expected output:**
```
🧪 Guardian Bot - Link Scanner Test

Testing URL extraction...
✅ Extracted 2 URLs: [...]

Testing individual URL scans...

Testing: https://youtube.com/watch?v=test
Expected: safe (Whitelisted domain)
Result: ✅ SAFE
  → Whitelisted (instant pass)

Testing: https://example.tk/free-mint
Expected: unsafe (Suspicious TLD + blacklist pattern)
Result: ⚠️  UNSAFE
  Threats detected:
    • [high] Matches blacklist pattern
    • [high] Suspicious TLD: .tk
...
```

This tests the link scanner without needing to post in Discord.

---

### Test 9: Google Safe Browsing API (if configured)

**What you're testing:** Real-time malware/phishing detection

**Only works if you set `GOOGLE_SAFE_BROWSING_API_KEY` in .env**

**How to test:**
1. Use Google's test URL (known malicious):
   ```
   http://malware.testing.google.test/testing/malware/
   ```
   (Note: This is a safe test URL that Google's API flags as malicious)

**Expected behavior:**
- Message deleted immediately
- Alert shows: "Google Safe Browsing: MALWARE"
- Critical severity

**If API key not configured:**
- Bot will still use pattern matching and blacklist
- Check console output: "Google Safe Browsing API key not found"

---

### Test 10: Behavioral Baseline Building

**What you're testing:** Bot learns your normal behavior over time

**How to test (takes a few days):**
1. Use the server normally for 2-3 days
2. Post a few messages per day at regular times
3. After baseline established, try posting 20 messages in 2 minutes

**Expected behavior:**
- Initially: No baseline (bot is learning)
- After a few days: Bot knows your normal rate
- When you spike: "Posting 10x faster than normal baseline"

**Check baseline:**
The bot stores data in `data/guardian.db`. You can query it:
```bash
sqlite3 data/guardian.db
SELECT * FROM user_baselines WHERE user_id = 'YOUR_USER_ID';
```

You'll see:
- `total_messages`: How many you've posted
- `avg_messages_per_day`: Your normal rate
- `reputation_score`: Your trust score

---

## Verification Checklist

After running all tests, verify:

- [ ] Suspicious links are deleted
- [ ] Whitelisted links are allowed
- [ ] You receive DM warnings when appropriate
- [ ] Alerts appear in mod log channel
- [ ] Velocity spikes are detected
- [ ] Bot appears online (green status)
- [ ] Database file created at `data/guardian.db`
- [ ] No errors in console output

---

## Troubleshooting

### Bot doesn't respond to messages

**Check 1:** Message Content Intent enabled?
- Go to Developer Portal → Your App → Bot
- Scroll to "Privileged Gateway Intents"
- Ensure "MESSAGE CONTENT INTENT" is ✅ enabled
- Click "Save Changes"
- **Restart the bot** (Ctrl+C then `npm start`)

**Check 2:** Bot has permissions in channel?
- Right-click channel → Edit Channel → Permissions
- Ensure bot role can:
  - View Channel
  - Send Messages
  - Read Message History

**Check 3:** Check console for errors
- Look at terminal where bot is running
- Any red error messages?

### Bot deletes messages but no DM received

**This is normal if:**
- You have DMs disabled for server members
- Your privacy settings block DMs from bots

**Solution:**
- Discord Settings → Privacy & Safety
- Allow DMs from server members (at least temporarily for testing)

### Bot can't delete messages

**Cause:** Permission issue

**Solution:**
1. Server Settings → Roles
2. Find bot's role
3. **Drag it higher** in the role list (must be above roles of users it moderates)
4. Ensure "Manage Messages" permission is enabled

### Bot can't mute users

**Cause:** Missing "Moderate Members" permission

**Solution:**
1. Server Settings → Roles → Bot role
2. Enable "Moderate Members" (formerly called "Timeout Members")
3. Ensure bot role is higher than user roles

### No alerts in mod log

**Cause:** Wrong channel ID or bot can't access channel

**Check:**
1. `.env` file has correct `MOD_LOG_CHANNEL_ID`
2. Bot has permission to view and post in that channel
3. Check console for errors like "Could not fetch log channel"

### Bot immediately crashes

**Check:**
1. `.env` file exists and has `DISCORD_BOT_TOKEN`
2. Token is valid (try regenerating in Developer Portal)
3. Node.js version is 18+ (`node --version`)
4. Dependencies installed (`npm install`)

---

## Advanced Testing

### Test with Multiple Accounts

For thorough testing, use:
1. Your main account (admin)
2. Alt account (new user)
3. Friend's account (for copypasta test)

### Simulate Real Attack

1. Create new account
2. Join server
3. Wait 5 seconds
4. Paste: `@everyone FREE NFT MINT! Connect wallet: https://scam-site.tk/verify-metamask CLAIM NOW! Limited spots!`

**Expected:** Bot should:
- Delete within 500ms
- Mute the account
- Send critical alert
- Log incident in database

### Performance Test

Post 50 messages with various content:
- 10 with whitelisted links (should all stay)
- 10 with suspicious patterns (should be deleted)
- 30 normal text (should stay)

Bot should handle all quickly with no crashes.

---

## Monitoring After Tests

### Check the Database

```bash
sqlite3 data/guardian.db

-- View all incidents
SELECT * FROM incidents ORDER BY timestamp DESC LIMIT 10;

-- View user baselines
SELECT * FROM user_baselines;

-- Exit
.quit
```

### Check Mod Log Channel

Review all alerts posted. Each should show:
- User who triggered alert
- Risk score
- Specific flags
- Action taken

### Adjust Configuration

Based on your tests, edit `config/config.js`:

**Too many false positives?**
```javascript
behavior: {
  maxMessagesPerMinute: 20,  // Increase from 10
  velocityMultiplierThreshold: 10,  // Increase from 5
}
```

**Want stricter protection?**
```javascript
behavior: {
  maxMessagesPerMinute: 5,  // Decrease from 10
  newUserMaxLinksPerHour: 1,  // Decrease from 2
}
```

After changes, restart bot: Ctrl+C then `npm start`

---

## You're Ready! 🎉

If all tests passed, your Guardian Bot is protecting your server. Keep it running and monitor the mod-log channel for real threats.

**Next steps:**
- Leave bot running 24/7 (use PM2 or similar for production)
- Monitor for a week and tune thresholds
- Add your commonly posted domains to whitelist
- Share feedback with your mod team

Questions? Check the README.md for more details!
