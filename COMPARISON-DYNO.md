# Guardian Bot vs Dyno Bot - Detailed Comparison

Comparing Guardian Bot to Dyno, one of Discord's most popular moderation bots.

## Quick Summary

| Feature | Guardian Bot | Dyno Bot |
|---------|--------------|----------|
| **Hosting** | Self-hosted | Hosted service |
| **Cost** | Free (run your own) | Free + Premium ($9.99/mo) |
| **Link Scanning** | Threat intelligence APIs | Basic pattern matching |
| **Behavioral Analysis** | ✅ Advanced (learns baselines) | ❌ Basic (static rules) |
| **Compromised Account Detection** | ✅ Yes | ❌ No |
| **Customization** | ✅ Full code access | ⚠️ Limited to UI settings |
| **Privacy** | ✅ Data stays with you | ⚠️ Data on Dyno servers |
| **Setup Time** | 10 minutes | 5 minutes |
| **Target Use Case** | Crypto/Web3 communities | General purpose |

---

## Detailed Feature Comparison

### 1. Link Protection

#### Guardian Bot
- **Threat Intelligence Integration**
  - Google Safe Browsing API (real-time malware/phishing detection)
  - VirusTotal API support (optional)
  - Checks against live threat databases
- **Smart Scanning**
  - Whitelisted domains skip scanning (performance)
  - Pattern matching for scam keywords ("verify wallet", "free mint")
  - Suspicious TLD detection (.tk, .ml, .xyz)
  - URL shortener detection (bit.ly, etc.)
- **Result**: Catches wallet-draining links from sophisticated phishing campaigns

#### Dyno Bot
- **Basic Link Detection**
  - Can detect "known phishing links" (unclear database source)
  - Link blacklist/whitelist
  - Can block all links or specific domains
  - Masked link detection
- **Limitations**
  - No real-time threat intelligence API integration
  - Relies on static lists
  - May miss new/evolving phishing domains
- **Result**: Good for blocking known bad domains, but limited against new threats

**Winner: Guardian Bot** - Real-time threat intelligence catches new scams immediately

---

### 2. Behavioral Analysis

#### Guardian Bot
- **User Baseline Learning**
  - Tracks each user's normal activity over time
  - Records average messages per day, posting times, typical channels
  - Builds reputation score per user
- **Anomaly Detection**
  - Flags when user posts 5x their normal rate
  - Detects unusual posting hours
  - Identifies sudden content shift (gaming talk → crypto spam)
- **Compromised Account Detection**
  - **Key Feature**: Detects when legitimate accounts are hijacked
  - Example: A 2-year member who posts 5 times/day suddenly posts 50 times/hour with scam links
- **Result**: Catches compromised legitimate accounts (hardest threat to detect)

#### Dyno Bot
- **Static Rule-Based Detection**
  - Spam: Multiple messages in X seconds (fixed threshold for all users)
  - Image spam: X images in 10 seconds
  - Mention spam: X mentions in 30 seconds
  - Link cooldown: X links in Y seconds
- **No User Profiling**
  - Same rules apply to everyone equally
  - Doesn't learn normal behavior
  - Can't detect "out of character" activity
- **Result**: Catches obvious spam, but misses compromised legitimate accounts

**Winner: Guardian Bot** - Only one with true behavioral anomaly detection

---

### 3. New User Protection

#### Guardian Bot
- **Quarantine System**
  - Automatically applies role to new members
  - Restricts link posting, file uploads
  - Auto-releases after 24 hours of normal behavior
- **Join-and-Spam Detection**
  - Flags accounts that post within 10 seconds of joining
  - Account age checking (<24 hours = higher scrutiny)
  - Adaptive response based on risk score

#### Dyno Bot
- **Autoban Module**
  - Can auto-ban based on account age
  - Can require verification before posting
- **New Member Rules**
  - Time-based restrictions (mute for X minutes after join)
  - Customizable per server

**Winner: Tie** - Both handle this well, different approaches

---

### 4. Copypasta/Duplicate Spam

#### Guardian Bot
- **String Similarity Detection**
  - Uses Levenshtein distance algorithm
  - Detects 85%+ similar messages across users
  - Catches coordinated spam campaigns
  - Stores recent messages for comparison
- **Example**: If 5 different accounts post "Check out this amazing opportunity!" within 5 minutes → Detected as coordinated attack

#### Dyno Bot
- **Message Spam Detection**
  - Detects identical or very similar messages from same user
  - Caps: limit messages in X seconds
- **Limitation**: Focused on same-user spam, not cross-user copypasta

**Winner: Guardian Bot** - Detects coordinated campaigns across multiple accounts

---

### 5. Moderation Actions

#### Guardian Bot
- **Automated Response**
  - Instant message deletion
  - Temporary mute (Discord timeout feature)
  - User warning via DM
  - Detailed mod alerts with risk scores
- **Risk-Based Actions**
  - Low risk (20-39): Flag for review
  - Medium risk (40-59): Delete message
  - High risk (60-79): Delete + warn user
  - Critical risk (80-100): Delete + mute + alert mods
- **Incident Database**
  - SQLite database tracks all incidents
  - User history for pattern analysis
  - Forensic data for investigations

#### Dyno Bot
- **Comprehensive Mod Commands**
  - ?ban, ?kick, ?mute, ?warn, ?purge
  - Timed mutes and bans
  - Warning system with point accumulation
  - Auto-punishments after X warnings
- **Logging System**
  - One of the best in Discord moderation
  - Records message edits/deletions
  - Tracks bans, kicks, role changes
  - Nickname changes, etc.
- **Appeals System**
  - Users can request unban/unmute
  - Structured appeal form
  - Sends to designated channel

**Winner: Dyno** - More mature moderation workflow, better logging UI

---

### 6. Hosting & Infrastructure

#### Guardian Bot
- **Self-Hosted**
  - You run it on your own server/computer
  - Your server = your rules
  - Can run on:
    - Local machine (free)
    - VPS ($5-10/month)
    - Railway/Render free tier
    - Raspberry Pi
- **Advantages**
  - Complete control
  - Data privacy (stays with you)
  - No rate limits
  - Can modify code
- **Disadvantages**
  - Must maintain server
  - You handle uptime
  - Technical setup required

#### Dyno Bot
- **Hosted Service**
  - Dyno runs the infrastructure
  - Add to server via OAuth
  - Configure via web dashboard
- **Advantages**
  - No hosting needed
  - 99.9% uptime
  - Scales automatically
  - Web UI for config
- **Disadvantages**
  - Data on Dyno servers
  - Subject to Dyno's rate limits
  - Premium features cost $9.99/mo
  - Can't modify code

**Winner: Depends on needs** - Dyno for convenience, Guardian for control

---

### 7. Customization

#### Guardian Bot
- **Full Code Access**
  - Modify any behavior
  - Add custom detection algorithms
  - Integrate your own APIs
  - Adjust every threshold
- **Configuration File**
  - Easy-to-edit `config.js`
  - No coding needed for basic changes
- **Examples**
  - Add custom keyword blacklists
  - Integrate Discord webhook alerts to Slack
  - Build ML models on your data
  - Create server-specific detection rules

#### Dyno Bot
- **Web Dashboard**
  - Toggle features on/off
  - Set thresholds (messages per second, etc.)
  - Custom commands
  - Auto-role assignment
- **Custom Commands**
  - Create server-specific commands
  - Variables and conditionals
- **Limitations**
  - Can't change core detection logic
  - Limited to what Dyno exposes in UI
  - No API for extensions

**Winner: Guardian Bot** - Open source = unlimited customization

---

### 8. Target Audience

#### Guardian Bot
**Best For:**
- ✅ Crypto/Web3/NFT communities (wallet-draining scams)
- ✅ Communities experiencing sophisticated attacks
- ✅ Servers that need compromised account detection
- ✅ Technical admins comfortable with self-hosting
- ✅ Privacy-focused communities
- ✅ Communities with unique needs requiring customization

**Not Ideal For:**
- ❌ Non-technical users wanting zero setup
- ❌ Servers needing advanced mod tools (kick/ban workflows)
- ❌ Communities wanting web dashboard
- ❌ Servers needing music/fun features

#### Dyno Bot
**Best For:**
- ✅ General-purpose moderation
- ✅ Non-technical server admins
- ✅ Servers wanting all-in-one solution
- ✅ Communities needing custom commands, auto-roles
- ✅ Large servers needing reliable infrastructure
- ✅ Servers wanting extensive logging

**Not Ideal For:**
- ❌ Communities with unique detection needs
- ❌ Privacy-focused servers
- ❌ Servers targeting sophisticated crypto scams

**Winner: Different use cases** - Both excel in their domains

---

### 9. Specific Threat Detection

#### Guardian Bot - Specialized For:
✅ **Wallet-Draining Links** (primary focus)
✅ **Compromised Account Attacks** (unique feature)
✅ **Coordinated Spam Campaigns** (copypasta detection)
✅ **New Account Join-and-Spam**
✅ **Evolving Phishing Threats** (API-based)

#### Dyno Bot - Specialized For:
✅ **General spam** (message/image/mention)
✅ **Known bad domains** (static lists)
✅ **Raid protection** (mass joins)
✅ **Rule enforcement** (warnings system)
✅ **Content moderation** (bad word filters)

**Winner: Guardian Bot** - For crypto-specific threats

---

### 10. Cost Analysis

#### Guardian Bot
- **Bot Code**: FREE (open source)
- **Hosting Options**:
  - Local/Raspberry Pi: FREE
  - Railway/Render free tier: FREE
  - VPS: $5-10/month
- **API Keys**:
  - Google Safe Browsing: FREE (10k checks/day)
  - VirusTotal: FREE tier available
- **Total**: $0-10/month

#### Dyno Bot
- **Free Tier**:
  - Core moderation features
  - Basic automod
  - Limited logging history
- **Premium ($9.99/month)**:
  - Extended logging (90 days vs 7 days)
  - Auto-responder
  - Advanced automod
  - Premium support
- **Total**: $0-10/month

**Winner: Tie** - Similar cost, different value propositions

---

## Real-World Scenario Comparison

### Scenario: Compromised Legitimate Account

**Attack:** A 2-year-old trusted member's account gets hacked. Hacker posts wallet-draining links.

#### How Guardian Bot Handles It:
1. ⚡ **Instant Detection** (within 500ms)
   - Behavioral analysis: "User posts 50x faster than normal baseline"
   - Link scan: "Malicious phishing site detected"
   - Risk score: 95/100 (Critical)
2. 🗑️ **Immediate Action**
   - All messages deleted
   - Account muted for 10 minutes
3. 📢 **Alert to Mods**
   - "CRITICAL: Possible compromised account"
   - Shows behavioral deviation
   - Suggests account verification
4. **Result**: Attack stopped, <5 users exposed

#### How Dyno Bot Handles It:
1. ⏱️ **Delayed Detection** (depends on rate)
   - If user posts slowly enough to avoid spam threshold → Not detected
   - If recognized phishing domain → Blocked
   - If new/unknown phishing domain → Not blocked
2. ⚠️ **Partial Protection**
   - Known bad links blocked
   - New bad links may not be blocked
   - No indication account is compromised
3. **Result**: Some messages may get through, mods see normal activity from "trusted" user

**Winner: Guardian Bot** - Purpose-built for this exact scenario

---

### Scenario: Bot Raid (100 new accounts spam server)

**Attack:** Coordinated bot attack, 100 new accounts join and spam.

#### How Guardian Bot Handles It:
1. First few bots detected via join-and-spam
2. Messages deleted, bots muted
3. Pattern detected across multiple accounts
4. Alert to mods: "Coordinated attack detected"
5. **Limitation**: Must manually ban accounts (no mass-ban command)

#### How Dyno Bot Handles It:
1. Automod catches spam immediately
2. Can auto-ban based on account age
3. Mass-ban commands available
4. Raid mode can be enabled
5. **Advantage**: Purpose-built for raid defense

**Winner: Dyno** - Better tooling for raid scenarios

---

## Which Should You Use?

### Use Guardian Bot If You Need:
1. **Protection against wallet-draining scams** (crypto/web3 server)
2. **Compromised account detection** (your members get hacked often)
3. **Real-time link threat intelligence** (catching new phishing domains)
4. **Complete control & privacy** (self-hosted, data stays with you)
5. **Customization** (modify detection logic, add features)
6. **No monthly fees** (willing to self-host)

### Use Dyno If You Need:
1. **General-purpose moderation** (not crypto-specific)
2. **Web dashboard** (no command-line needed)
3. **Zero maintenance** (hosted service, always online)
4. **Advanced mod tools** (warnings, appeals, role management)
5. **All-in-one bot** (custom commands, music, fun features)
6. **Enterprise reliability** (99.9% uptime, used by millions)

### Use BOTH If:
You want comprehensive protection:
- **Guardian Bot**: Handles sophisticated threats (wallet scams, compromised accounts)
- **Dyno Bot**: Handles general moderation, logging, mod workflow

They complement each other well:
- Dyno for day-to-day moderation
- Guardian for advanced threat detection

---

## Technical Architecture Differences

### Guardian Bot
```
Architecture: Event-driven, single-process Node.js
Database: SQLite (local file)
State: Stateful (learns over time)
Scaling: Vertical (single instance per server)
Code: Open source, readable, modifiable
Dependencies: discord.js, better-sqlite3, node-fetch
```

### Dyno Bot
```
Architecture: Microservices, distributed
Database: Likely MongoDB/PostgreSQL (hosted)
State: Stateless configuration-based
Scaling: Horizontal (serves millions)
Code: Proprietary, closed source
Tech Stack: Unknown (closed source)
```

---

## Summary: Key Differentiators

### Guardian Bot's Unique Advantages:
1. 🧠 **Behavioral baseline learning** (learns each user's normal activity)
2. 🚨 **Compromised account detection** (detects hijacked accounts)
3. 🔗 **Threat intelligence APIs** (real-time phishing/malware detection)
4. 💾 **Full data ownership** (self-hosted, private)
5. 🛠️ **Complete customization** (open source code)
6. 💰 **Truly free** (no premium tiers, no upsells)

### Dyno's Unique Advantages:
1. ⚡ **Zero setup hosting** (hosted service, web dashboard)
2. 🔨 **Mature mod tools** (warnings, appeals, mass actions)
3. 📊 **Best-in-class logging** (detailed audit trail)
4. 📈 **Enterprise reliability** (99.9% uptime, massive scale)
5. 🎮 **All-in-one features** (moderation + utility + fun)
6. 👥 **Proven at scale** (millions of servers, years of reliability)

---

## Final Recommendation

**For Crypto/Web3/NFT Communities:**
→ **Guardian Bot** is purpose-built for your threats

**For General Communities:**
→ **Dyno Bot** is more mature and easier

**For Maximum Protection:**
→ **Use Both** (Guardian for threats, Dyno for workflow)

---

**Guardian Bot fills a gap that Dyno doesn't address:** protecting against sophisticated wallet-draining attacks and detecting compromised legitimate accounts. It's not trying to replace Dyno's comprehensive moderation suite—it's laser-focused on the specific threat that's plaguing Discord crypto communities today.
