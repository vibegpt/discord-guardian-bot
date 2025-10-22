# Real-World Scenario Examples

See exactly how Guardian Bot responds to different threat scenarios.

## Scenario 1: Malicious Wallet-Draining Link

**What Happens:**
```
User: FreeNFTGuy#1234
Posts: "🎁 FREE MINT! Connect your wallet here: https://fake-metamask.tk/verify"
```

**Guardian Bot Response:**
1. ⚡ **Instant Detection** (within milliseconds)
   - Extracts URL from message
   - Checks against blacklist patterns (matches "verify")
   - Scans with Google Safe Browsing API
   - Identifies suspicious TLD (.tk)

2. 🗑️ **Immediate Action**
   - Deletes message before most users see it
   - Sends DM to user:
     ```
     ⚠️ Message Removed
     Your message in ServerName was automatically removed.
     Reason: Malicious link detected
     Channel: #general
     If you believe this was an error, contact a moderator.
     ```

3. 📢 **Mod Alert** (in log channel)
   ```
   🛡️ Security Alert: Malicious Link Blocked
   User: FreeNFTGuy#1234 (987654321)
   Severity: critical
   Risk Score: 100/100

   Detection Flags:
   • Matches blacklist pattern
   • Google Safe Browsing: SOCIAL_ENGINEERING
   • Suspicious TLD: .tk

   Malicious URLs:
   • https://fake-metamask.tk/verify

   Action Taken: Message deleted, user warned
   ```

4. 🔁 **If User Tries Again**
   - Second malicious link → Auto-mute for 10 minutes
   - Third offense → Mod receives escalated alert

---

## Scenario 2: Compromised Account (Previously Legitimate User)

**What Happens:**
```
User: RegularMember#5678 (member for 8 months, normally posts 2-3 times/day)
Suddenly posts 15 messages in 2 minutes across multiple channels:
"@everyone Check out this airdrop! Limited spots: https://scam-link.com"
```

**Guardian Bot Analysis:**
```
📊 Behavioral Analysis for RegularMember#5678
Risk: 85/100 (critical)

Detection Flags:
• Baseline deviation: Posting 20x faster than normal
• Excessive velocity: 15 messages in 2 minutes
• Suspicious keywords: "airdrop", "@everyone"
• Link posted during unusual hours (user normally active 9am-5pm, now 3am)
```

**Guardian Bot Response:**
1. 🚨 **Critical Alert** - Account likely compromised
2. 🗑️ All 15 spam messages deleted
3. 🔇 User automatically muted for 10 minutes
4. 📢 Mod alert sent with detailed analysis
5. 💾 Incident logged in database

**Why This Matters:**
- Regular spam bots are obvious
- **Compromised legitimate accounts** are harder to detect
- Guardian Bot catches this by tracking **behavioral baselines**

---

## Scenario 3: Bot Join-and-Spam Attack

**What Happens:**
```
10 new accounts join within 30 seconds:
- CryptoBot001#1111 (account created today)
- CryptoBot002#2222 (account created today)
- CryptoBot003#3333 (account created today)
... etc

Each immediately posts (within 5 seconds of joining):
"💰 Free $1000 USDT! Claim now: https://scamsite.com/claim"
```

**Guardian Bot Response:**

For **EACH** bot:
1. ⚡ **Join Detection**
   - New account (< 24 hours old)
   - Quarantine role applied automatically
   - Can read messages but cannot post links

2. 🚫 **Spam Attempt Blocked**
   ```
   Detection Flags:
   • Join-and-spam: Posted 3 seconds after joining
   • New account: Created 2 hours ago
   • Suspicious keywords: "claim", "free"
   • Link posted

   Risk Score: 95/100 (critical)
   ```

3. 🔨 **Automatic Actions**
   - Messages deleted
   - User muted immediately
   - Mod alert with pattern recognition:
     ```
     🛡️ Coordinated Attack Detected
     10 similar messages from new accounts in 30 seconds
     Pattern: "Free $1000 USDT"
     Recommendation: Consider enabling stricter new member verification
     ```

**Result:**
- Without Guardian Bot: 10 spam messages seen by members
- With Guardian Bot: 0 spam messages visible, all bots muted

---

## Scenario 4: Copypasta Spam Campaign

**What Happens:**
```
User1: "Check out this amazing opportunity! [link]"
(15 seconds later)
User2: "Check out this amazing opportunity! [link]"
(20 seconds later)
User3: "Check out this amazing opportunity! [link]"
```

**Guardian Bot Analysis:**
```
🔍 Copypasta Detection
User2's message is 95% similar to User1's recent message
User3's message is 95% similar to User1's recent message

Pattern: Coordinated spam campaign
```

**Guardian Bot Response:**
1. First message (User1):
   - Scanned but marked as first occurrence
   - Link checked (if malicious, deleted)

2. Second message (User2):
   - Detected as copypasta
   - Flagged as medium risk
   - Message deleted
   - Alert sent to mods

3. Third message (User3):
   - Pattern confirmed
   - Critical alert: "Coordinated campaign detected"
   - All future similar messages auto-deleted

---

## Scenario 5: False Positive (Legitimate Link)

**What Happens:**
```
User: TrustedMember#9999 (member for 2 years, 5000+ messages)
Posts: "Here's the YouTube tutorial I mentioned: https://youtube.com/watch?v=..."
```

**Guardian Bot Analysis:**
```
🔍 Link Scan Initiated
URL: https://youtube.com/watch?v=...
Whitelist Check: ✅ PASS (youtube.com is whitelisted)
Risk Score: 0/100 (safe)

Behavioral Check:
• User baseline: Normal activity pattern
• Velocity: Within normal range
• Account age: 2 years (trusted)
```

**Guardian Bot Response:**
- ✅ **No action taken**
- Message allowed to stay
- No alerts sent
- Link not scanned (whitelisted domain = instant pass)

**This demonstrates:**
- Whitelist prevents false positives
- Trusted domains bypass scanning for performance
- Behavioral analysis considers user history

---

## Scenario 6: URL Shortener (Suspicious but Not Confirmed Malicious)

**What Happens:**
```
User: NewMember#4444 (joined 2 hours ago)
Posts: "Check this out: https://bit.ly/3xYz123"
```

**Guardian Bot Analysis:**
```
🔍 Link Analysis
URL: https://bit.ly/3xYz123
Type: URL Shortener detected
Threat Level: Unknown (shorteners often used to hide destination)

Risk Calculation:
• URL shortener: +5 points
• New user (<24hrs): +15 points
• Link in first 10 messages: +10 points
Total Risk Score: 30/100 (low-medium)
```

**Guardian Bot Response:**
1. ⚠️ **Cautious Approach**
   - Message NOT deleted (risk below threshold)
   - But flagged for moderator review
   - Alert sent to mod log:
     ```
     ℹ️ Suspicious Activity (Low Risk)
     User: NewMember#4444
     URL shortener from new account
     Recommendation: Monitor this user
     ```

2. 💾 **Tracked**
   - If same user posts another shortener → Risk increases
   - If URL receives reports → Auto-delete similar future posts

---

## Scenario 7: Mention Spam

**What Happens:**
```
User: SpamAccount#7777
Posts: "@everyone @here @User1 @User2 @User3 ... FREE GIVEAWAY!"
```

**Guardian Bot Analysis:**
```
🔍 Mention Spam Detection
• @everyone: Detected
• @here: Detected
• User mentions: 15 users
Threshold: 5 mentions (exceeded by 300%)

Combined with:
• Suspicious keywords: "free giveaway"
Risk Score: 65/100 (high)
```

**Guardian Bot Response:**
1. 🗑️ Message deleted immediately
2. 🔇 User muted for 10 minutes
3. 📢 Alert to mods:
   ```
   🛡️ Security Alert: Mention Spam
   User: SpamAccount#7777
   Severity: high

   Detection Flags:
   • Mass mention: 15 users in one message
   • @everyone/@here abuse
   • Suspicious keywords

   Action Taken: Message deleted, user muted
   ```

---

## Scenario 8: Velocity Spike (Possible Compromised Mod Account)

**What Happens:**
```
User: ModeratorAlex#0001 (moderator role, member for 1 year)
Suddenly:
- Deletes 20 channels in 30 seconds
- Creates 10 new channels with spam names
- Posts malicious links in every channel
```

**Guardian Bot Response:**

⚠️ **Special Case: Compromised Moderator**

1. 🚨 **Critical Alert Sent Immediately**
   ```
   🚨 CRITICAL: MODERATOR ACCOUNT COMPROMISED
   User: ModeratorAlex#0001

   Unusual Activity:
   • 20 channels deleted in 30 seconds
   • 10 channels created
   • Mass posting across all channels

   ⚠️ BOT CANNOT AUTO-MUTE MODERATORS

   IMMEDIATE ACTION REQUIRED:
   1. Remove moderator permissions
   2. Check audit log
   3. Contact user via alternative channel
   ```

2. 📱 **Out-of-Band Alert**
   - If configured, sends webhook to external monitoring
   - DMs server owner directly
   - Logs all activity for forensics

3. 🗑️ **Limited Mitigation**
   - Deletes malicious messages where possible
   - Cannot remove mod permissions (requires human intervention)

**Why This Matters:**
- Even mods can be compromised
- Bot alerts humans to take action
- Demonstrates multi-layer security approach

---

## Summary: Bot Decision Matrix

| Risk Score | Severity | Auto-Delete | Auto-Mute | Mod Alert | User DM |
|------------|----------|-------------|-----------|-----------|---------|
| 0-19       | None     | ❌          | ❌        | ❌        | ❌      |
| 20-39      | Low      | ❌          | ❌        | ✅ (info) | ❌      |
| 40-59      | Medium   | ✅          | ❌        | ✅        | ❌      |
| 60-79      | High     | ✅          | ❌        | ✅        | ✅ (warn)|
| 80-100     | Critical | ✅          | ✅        | ✅        | ✅ (warn)|

**Special Cases:**
- **Malicious Link (any severity)**: Always delete + alert
- **Moderator Account**: Never auto-mute, only alert
- **Whitelisted Domain**: Skip all checks
- **Repeat Offender**: Escalate severity by 1 level

---

These examples show how Guardian Bot provides **defense-in-depth** with multiple detection layers working together to protect your community! 🛡️
