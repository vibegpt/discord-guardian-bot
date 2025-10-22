# Deployment Checklist

Use this checklist to ensure your Guardian Bot is properly configured and ready for production.

## Pre-Deployment

### Discord Setup
- [ ] Created Discord bot application
- [ ] Enabled "Server Members Intent" in Developer Portal
- [ ] Enabled "Message Content Intent" in Developer Portal
- [ ] Generated and saved bot token
- [ ] Generated invite URL with correct permissions:
  - [ ] Read Messages/View Channels
  - [ ] Send Messages
  - [ ] Manage Messages
  - [ ] Moderate Members
  - [ ] Manage Roles
- [ ] Bot invited to server
- [ ] Bot appears online (green status)

### Role Configuration
- [ ] Bot role created and positioned high in role hierarchy
- [ ] Bot role is above roles of users it needs to moderate
- [ ] (Optional) Created "Quarantined" role for new members
- [ ] (Optional) Configured channel permissions for quarantine role

### Channel Setup
- [ ] Created dedicated mod-log channel
- [ ] Bot has permission to post in mod-log channel
- [ ] Copied mod-log channel ID (right-click → Copy ID)
- [ ] Developer Mode enabled in Discord settings

### API Keys
- [ ] Google Safe Browsing API key obtained (highly recommended)
  - Free tier: 10,000 requests/day
  - Get at: https://console.cloud.google.com/
- [ ] (Optional) VirusTotal API key obtained
- [ ] (Optional) PhishTank API key obtained

### Environment Configuration
- [ ] `.env` file created (copied from `.env.example`)
- [ ] `DISCORD_BOT_TOKEN` set
- [ ] `MOD_LOG_CHANNEL_ID` set
- [ ] `GOOGLE_SAFE_BROWSING_API_KEY` set (if available)
- [ ] (Optional) `QUARANTINE_ROLE_ID` set
- [ ] `.env` file NOT committed to git (check `.gitignore`)

### Dependencies
- [ ] Node.js 18+ installed
- [ ] Ran `npm install` successfully
- [ ] No dependency errors or warnings

## Configuration Review

### Security Settings (`config/config.js`)
- [ ] Reviewed `maxMessagesPerMinute` threshold
- [ ] Reviewed `velocityMultiplierThreshold`
- [ ] Reviewed `newUserThresholdMs` (24 hours default)
- [ ] Added trusted domains to `whitelist` array
- [ ] Reviewed `suspiciousKeywords` list
- [ ] Decided on `autoDelete` setting (true recommended)
- [ ] Decided on `autoMute` setting (true for public servers)
- [ ] Set appropriate `muteDurationMs` (10 minutes default)

### Customization for Your Server
- [ ] **Large public server** (1000+ members):
  - Consider stricter thresholds
  - Enable all auto-moderation features
  - Use quarantine role for new members
- [ ] **Small community** (<100 members):
  - Can use more lenient thresholds
  - May disable auto-mute, keep auto-delete
  - May skip quarantine role
- [ ] **Crypto/NFT focused server**:
  - Enable all protections (high target for scammers)
  - Consider additional keywords
  - Review whitelist carefully

## Initial Testing

### Basic Functionality
- [ ] Bot starts without errors: `npm start`
- [ ] Bot shows as online in Discord
- [ ] Console shows "Guardian Bot is now protecting your server!"

### Link Scanning Test
- [ ] Run test suite: `npm test`
- [ ] All tests pass
- [ ] In test channel, post a link from whitelist (e.g., YouTube)
  - [ ] Message NOT deleted
  - [ ] No alert in mod-log
- [ ] In test channel, post suspicious pattern (e.g., "free-mint.tk")
  - [ ] Message deleted immediately
  - [ ] Received warning DM
  - [ ] Alert appears in mod-log channel

### Behavioral Detection Test
- [ ] Using test account, post 15 messages rapidly
  - [ ] Bot detects velocity spike
  - [ ] Alert sent to mod-log
- [ ] Using brand new account, post immediately after joining
  - [ ] Bot flags join-and-spam pattern
  - [ ] Alert sent to mod-log

### Quarantine System Test (if enabled)
- [ ] New member joins
  - [ ] Automatically receives quarantine role
  - [ ] Cannot post links/files in channels
- [ ] After configured time, quarantine role removed automatically

## Production Deployment

### Process Management
- [ ] Decided on hosting method:
  - [ ] Local server (use `pm2` or similar)
  - [ ] Cloud VM (AWS, DigitalOcean, etc.)
  - [ ] Container (Docker)
  - [ ] Serverless (requires modifications)
- [ ] Bot configured to restart on crash
- [ ] Bot configured to start on system boot
- [ ] Logs are being captured and monitored

### Monitoring
- [ ] Mod-log channel is being actively monitored
- [ ] Moderators understand alert format
- [ ] Clear process for moderators to review flagged content
- [ ] Appeals process defined for false positives

### Database
- [ ] `data/` directory has write permissions
- [ ] `guardian.db` file created successfully on first run
- [ ] Database file is being backed up periodically
- [ ] Old data cleanup schedule confirmed (30 days default)

## Post-Deployment

### Week 1: Tuning Phase
- [ ] Monitor false positive rate
  - If >5%: Increase thresholds in config
  - If <1%: Can consider stricter thresholds
- [ ] Review mod-log daily
- [ ] Collect feedback from moderators
- [ ] Add commonly posted legitimate domains to whitelist

### Week 2-4: Optimization
- [ ] Analyze `incidents` table in database
- [ ] Identify patterns in detected threats
- [ ] Adjust keyword list based on server-specific spam
- [ ] Fine-tune velocity thresholds
- [ ] Document any custom configurations

### Ongoing Maintenance
- [ ] Weekly: Review mod-log for patterns
- [ ] Monthly: Update whitelist/blacklist
- [ ] Monthly: Check for bot updates
- [ ] Quarterly: Review overall effectiveness
- [ ] Quarterly: Database cleanup if needed

## Rollback Plan

If issues arise:
- [ ] Documented how to stop bot (`Ctrl+C` or process manager)
- [ ] Backup of original config files
- [ ] Know how to temporarily disable auto-delete:
  - Set `config.moderation.autoDelete = false`
  - Restart bot
  - Bot will only alert mods, not auto-delete
- [ ] Contact plan for moderators if bot malfunctions

## Security Checklist

- [ ] `.env` file is not shared publicly
- [ ] Bot token is kept secret (regenerate if exposed)
- [ ] API keys are kept secret
- [ ] Bot permissions follow principle of least privilege
- [ ] Bot cannot be exploited to harm server:
  - Cannot ban/kick moderators
  - Cannot delete channels (no permission given)
  - Cannot modify server settings
- [ ] Database file has appropriate file permissions
- [ ] Logs don't contain sensitive user data

## Emergency Contacts

Document these for your team:

**Bot Owner:**
Name: _______________
Discord: _______________
Contact: _______________

**Hosting Provider:**
Platform: _______________
Login URL: _______________
Support: _______________

**API Status Pages:**
- Google Safe Browsing: https://status.cloud.google.com/
- Discord: https://discordstatus.com/

## Success Metrics

After deployment, track these to measure effectiveness:

- [ ] Number of malicious links blocked per week
- [ ] Number of compromised accounts detected
- [ ] False positive rate (<5% is good)
- [ ] Member feedback on security improvements
- [ ] Reduction in manual moderation workload

---

## Quick Reference: Common Commands

Start bot:
```bash
npm start
```

Test link scanner:
```bash
npm test
```

Check logs (if using pm2):
```bash
pm2 logs guardian-bot
```

Restart bot (if using pm2):
```bash
pm2 restart guardian-bot
```

View database:
```bash
sqlite3 data/guardian.db
.tables
SELECT * FROM incidents LIMIT 10;
```

---

**✅ Checklist complete?** You're ready to protect your community! 🛡️
