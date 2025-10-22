# Private GitHub Repository - Controlled Distribution Guide

How to share the bot with select testers using a private GitHub repository.

## Benefits of Private Repo

✅ Control who has access
✅ Can revoke access anytime
✅ Track who cloned the repo
✅ Testers get updates easily (git pull)
✅ Can still collaborate (issues, pull requests)
✅ Free on GitHub (unlimited private repos)

## Step-by-Step Setup

### Step 1: Create Private GitHub Repository

1. Go to https://github.com/new
2. Repository name: `discord-guardian-bot` (or whatever you want)
3. Description: "Discord anti-spam bot with link scanning and behavioral detection"
4. **Select: 🔒 Private** (this is the key!)
5. Do NOT initialize with README (we already have one)
6. Click **"Create repository"**

### Step 2: Push Your Code to GitHub

In your terminal:

```bash
cd /Users/toddbyrne/discord-guardian-bot

# Initialize git if not already done
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - Discord Guardian Bot v1.0"

# Connect to your private GitHub repo (replace YOUR-USERNAME)
git remote add origin https://github.com/YOUR-USERNAME/discord-guardian-bot.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Note:** You'll be prompted for your GitHub credentials. Use a Personal Access Token if you have 2FA enabled.

### Step 3: Invite Specific People

There are two ways to share with testers:

---

## Option A: Add as Collaborators (Full Access)

**Best for:** Trusted testers who might contribute feedback/code

**How to:**
1. Go to your repo on GitHub
2. Click **Settings** tab
3. Click **Collaborators** in left sidebar
4. Click **Add people**
5. Enter their GitHub username or email
6. Select **"Read" access** (they can clone/pull but not push changes)
   - Or **"Write"** if you want them to be able to create issues/discussions

**They receive:**
- Email invitation
- Can clone the repo directly
- Can see all code and history
- Can create issues/discussions (if Write access)

**Limitations:**
- They need a GitHub account
- You can add up to 3 collaborators on free tier (unlimited on paid)

---

## Option B: Generate Personal Access Tokens (More Private)

**Best for:** More control, or >3 testers

GitHub doesn't directly support "read-only sharing via link" for private repos, but here's a workaround:

**Use GitHub's "Deploy Keys"** (for read-only access):
1. Repo Settings → Deploy keys
2. Add each tester's SSH public key
3. Uncheck "Allow write access"

**Or use Git credential helper** with a shared token (less secure).

---

## Option C: Share Releases Only (Recommended for Many Testers)

**Best for:** 5+ testers, or less technical users

1. **Create a Release on GitHub:**
   - Go to your repo → Releases → Create new release
   - Tag version: `v1.0.0`
   - Title: "Discord Guardian Bot v1.0 - Beta"
   - Upload a ZIP of the code (GitHub does this automatically)
   - Check **"This is a pre-release"**
   - Click **"Publish release"**

2. **Share the release link:**
   - Copy the release URL: `https://github.com/YOUR-USERNAME/discord-guardian-bot/releases/tag/v1.0.0`
   - Even though repo is private, you can share this specific release

**Actually, wait - this won't work for private repos.**

Let me give you the real solutions:

---

## Real Options for Private Repo Sharing

### Option 1: Add All Testers as Collaborators (Read Access)

**If you have <3 testers (GitHub free tier limit):**

1. Go to repo Settings → Collaborators
2. Add each person with **"Read" access**
3. They can clone: `git clone https://github.com/YOUR-USERNAME/discord-guardian-bot.git`

**Advantages:**
- Clean, official GitHub access
- They get updates via `git pull`
- Can create issues for feedback

**Disadvantages:**
- Limited to 3 collaborators on free tier
- They need GitHub accounts

---

### Option 2: Create Private Zip Files (No GitHub Account Needed)

**For testers without GitHub or if you hit collaborator limit:**

1. Create a ZIP of your code:
   ```bash
   cd /Users/toddbyrne
   zip -r discord-guardian-bot-v1.0.zip discord-guardian-bot -x "*.git*" -x "*node_modules*" -x "*data/*"
   ```

2. Upload to:
   - **Google Drive** (share with specific emails only)
   - **Dropbox** (password-protected link)
   - **WeTransfer** (expires after 7 days)
   - **Your own private server**

3. Share link only with testers

**Advantages:**
- No GitHub account needed
- Unlimited testers
- More control

**Disadvantages:**
- They don't get automatic updates
- Have to send new ZIP for each update

---

### Option 3: Upgrade GitHub ($4/month for unlimited collaborators)

**GitHub Team Plan:**
- Unlimited collaborators
- Better access controls
- Protected branches
- Code owners

**Worth it if:**
- You have many testers
- Want professional presentation
- Plan to maintain long-term

---

## Instructions for Your Testers

Once you've chosen a sharing method, send this to testers:

### If They Have Collaborator Access:

```markdown
Hi! You've been invited to test the Discord Guardian Bot.

**Setup (10 minutes):**

1. **Accept GitHub invitation** (check your email)

2. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR-USERNAME/discord-guardian-bot.git
   cd discord-guardian-bot
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Create your Discord bot:**
   - Go to https://discord.com/developers/applications
   - Create a new application
   - Go to Bot tab → Enable "Message Content Intent"
   - Copy your bot token

5. **Configure:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your `DISCORD_BOT_TOKEN`

6. **Start the bot:**
   ```bash
   npm start
   ```

7. **Test it:** Follow instructions in TESTING-GUIDE.md

**Get updates:**
```bash
git pull
npm install  # In case dependencies changed
npm start
```

**Report issues:** Create an issue on GitHub or message me directly

**Questions?** Check QUICKSTART.md or ask me!
```

### If They Have Zip File:

```markdown
Hi! You've been invited to test the Discord Guardian Bot.

**Setup (10 minutes):**

1. **Download the ZIP** from [your shared link]

2. **Extract** to a folder

3. **Install dependencies:**
   ```bash
   cd discord-guardian-bot
   npm install
   ```

4. **Create your Discord bot:**
   - Go to https://discord.com/developers/applications
   - Create a new application
   - Go to Bot tab → Enable "Message Content Intent"
   - Copy your bot token

5. **Configure:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your `DISCORD_BOT_TOKEN`

6. **Start the bot:**
   ```bash
   npm start
   ```

7. **Test it:** Follow instructions in TESTING-GUIDE.md

**Get updates:** I'll send you a new ZIP when there are updates

**Report issues:** Message me directly with any bugs or feedback

**Questions?** Check QUICKSTART.md or ask me!
```

---

## Managing Your Testers

### Track Who Has Access

Create a file for yourself:

```
TESTERS.md

Active Testers:
- @github-user1 (added 2025-01-15) - Testing on 500-member server
- @github-user2 (added 2025-01-16) - Testing on 1000-member server
- john@email.com (ZIP file sent 2025-01-15) - Testing on small community

Feedback Received:
- user1: False positives on memes channel
- user2: Requesting whitelist for specific domain
```

### Revoke Access

**For GitHub collaborators:**
1. Repo Settings → Collaborators
2. Find the person
3. Click "Remove"
4. They immediately lose access

**For ZIP files:**
- Can't revoke (they have the code)
- Send takedown request if misused
- Consider adding license terms

---

## What Testers Can and Cannot Do

### With "Read" Collaborator Access:

**CAN:**
- ✅ Clone the repository
- ✅ View all code and history
- ✅ Pull updates
- ✅ Create issues (if allowed)
- ✅ Comment on code

**CANNOT:**
- ❌ Push changes to your repo
- ❌ Delete anything
- ❌ Change settings
- ❌ Add other collaborators
- ❌ Make the repo public

### With ZIP File:

**CAN:**
- ✅ Use the code
- ✅ Modify their own copy
- ✅ Run on their server

**CANNOT:**
- ❌ Get automatic updates
- ❌ Contribute back easily
- ❌ See commit history

---

## Collecting Feedback

### Create a Feedback System

1. **Enable GitHub Issues** (even on private repos):
   - Repo Settings → Features → Issues (checked)
   - Testers can report bugs here

2. **Create Issue Templates:**
   Create `.github/ISSUE_TEMPLATE/bug_report.md`:
   ```markdown
   **Describe the bug**
   [What happened?]

   **Server size**
   [How many members?]

   **Expected behavior**
   [What should have happened?]

   **Screenshots/Logs**
   [Paste any error messages or screenshots]
   ```

3. **Or Use Discussions:**
   - Repo Settings → Features → Discussions (checked)
   - More casual feedback format

4. **Or External Form:**
   - Google Form
   - Typeform
   - Discord channel for feedback

---

## License for Private Repo

Even private, add a license so testers know what they can/cannot do:

Create `LICENSE` file:

```
PRIVATE BETA LICENSE

Copyright (c) 2025 [Your Name]

This software is provided for testing purposes only.

BETA TESTERS MAY:
- Use the software on their own Discord server
- Report bugs and provide feedback
- Modify their local copy for testing

BETA TESTERS MAY NOT:
- Distribute the software to others
- Use for commercial purposes
- Claim ownership or copyright
- Make the code publicly available

This is beta software. No warranty is provided.
```

---

## Timeline for Beta Testing

**Week 1-2:** Initial Testing
- 3-5 testers on different server sizes
- Focus on critical bugs
- Daily check-ins

**Week 3-4:** Expanded Testing
- Add 5-10 more testers
- Test edge cases
- Tune thresholds based on feedback

**Week 5+:** Prepare for Public Release
- Fix all critical bugs
- Update documentation
- Decide: Keep private or make public?

---

## When to Go Public

Consider making repo public when:
- ✅ All major bugs fixed
- ✅ Documentation complete
- ✅ Tested on 10+ servers
- ✅ Confident in code quality
- ✅ Ready to handle community support

Benefits of going public:
- More users = more feedback
- Community contributions
- Portfolio/resume material
- Help the Discord community

You can always start private and go public later!

---

## Summary

**Best approach for your situation:**

1. **Create private GitHub repo** (free)
2. **Add 2-3 trusted testers as collaborators** (Read access)
3. **For additional testers:** Send password-protected ZIP files
4. **Collect feedback** via GitHub Issues or Discord
5. **After successful beta:** Consider making public

**Next steps:**
1. Run the commands in "Step 2: Push Your Code to GitHub"
2. Add collaborators in GitHub settings
3. Send testers the setup instructions
4. Monitor their feedback

Need help with any of these steps?
