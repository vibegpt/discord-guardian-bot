# Sharing Guardian Bot - How Others Can Use It

Yes! This bot is designed for **self-hosting**. Anyone can run their own independent instance on their own server.

## How It Works

Each server admin runs their **own copy** of the bot with:
- Their own Discord bot token
- Their own database
- Their own configuration/settings
- Their own API keys

This means:
- ✅ Complete control over their bot
- ✅ Privacy - data stays on their server
- ✅ Customizable to their needs
- ✅ No dependency on your infrastructure

## Distribution Options

### Option 1: Share the Code (Recommended)

**For technical users who can run Node.js:**

1. **Upload to GitHub** (recommended):
   ```bash
   cd discord-guardian-bot
   git init
   git add .
   git commit -m "Initial commit - Discord Guardian Bot"

   # Create repo on GitHub, then:
   git remote add origin https://github.com/YOUR-USERNAME/discord-guardian-bot.git
   git push -u origin main
   ```

2. **Share the GitHub link:**
   - Others can clone: `git clone https://github.com/YOUR-USERNAME/discord-guardian-bot.git`
   - They follow the QUICKSTART.md to set up
   - Each person creates their own Discord bot application

3. **What they need to do:**
   - Have Node.js 18+ installed
   - Create their own Discord bot (5 min)
   - Get their own API keys (optional)
   - Configure `.env` with their tokens
   - Run `npm install && npm start`

**Advantages:**
- Most flexible
- They can customize code
- Updates are easy (git pull)
- Open source community can contribute

---

### Option 2: Create a Docker Container

**For users who want easier deployment:**

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# Create data directory
RUN mkdir -p data

CMD ["node", "src/index.js"]
```

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  guardian-bot:
    build: .
    env_file: .env
    volumes:
      - ./data:/app/data
    restart: unless-stopped
```

**Users can then:**
```bash
git clone your-repo
cd discord-guardian-bot
cp .env.example .env
# Edit .env with their tokens
docker-compose up -d
```

**Advantages:**
- No Node.js installation needed
- Consistent environment
- Easy to restart/update
- Good for VPS deployment

---

### Option 3: Provide a One-Click Hosting Solution

**Deploy to cloud platforms:**

#### **Railway.app** (Easiest - Free tier available)

1. User clicks: "Deploy on Railway" button
2. Connects their GitHub
3. Sets environment variables in web UI
4. Bot automatically deploys

**You create:**
- `railway.json` config file
- Deploy button in README
- They just need Discord bot token

#### **Heroku** (Paid now, but simple)

Create `Procfile`:
```
worker: node src/index.js
```

Users:
1. Click "Deploy to Heroku" button
2. Set environment variables
3. Done

#### **DigitalOcean App Platform**

Similar one-click deployment option.

---

### Option 4: Provide Pre-Built Releases

**For non-technical users:**

Use tools like `pkg` to create executables:

```bash
npm install -g pkg
pkg package.json --targets node18-linux-x64,node18-macos-x64,node18-win-x64
```

This creates standalone executables (no Node.js needed):
- `guardian-bot-linux`
- `guardian-bot-macos`
- `guardian-bot-win.exe`

**Users just:**
1. Download executable for their OS
2. Create `.env` file with their tokens
3. Double-click to run

**Limitations:**
- Larger file size
- Can't easily modify code
- Updates require new download

---

## What Each User Needs

Regardless of deployment method, each person needs:

### 1. Discord Bot Token (Required)
- Create at: https://discord.com/developers/applications
- Each person makes their own bot
- **Tokens are NOT shared** (each bot is separate)

### 2. Their Own Server/Hosting (Required)
Options:
- **Local computer** (free, but must stay on)
- **VPS** (AWS, DigitalOcean, Linode - $5-10/month)
- **Cloud hosting** (Railway, Render - free tiers available)
- **Raspberry Pi** (one-time cost, runs 24/7)

### 3. Google Safe Browsing API Key (Optional but Recommended)
- Free tier: 10,000 checks/day
- Each person gets their own from Google Cloud Console
- Can work without it (uses pattern matching only)

---

## Setup Instructions for Others

Here's what you tell people who want to use it:

### For Technical Users (GitHub)

**"I've built an anti-spam Discord bot. Here's how to run it on your server:"**

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR-USERNAME/discord-guardian-bot.git
   cd discord-guardian-bot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your Discord bot:
   - Go to https://discord.com/developers/applications
   - Create new application
   - Go to Bot tab, enable Message Content Intent
   - Copy your bot token

4. Configure:
   ```bash
   cp .env.example .env
   # Edit .env and add your DISCORD_BOT_TOKEN
   ```

5. Invite bot to your server:
   - Use OAuth2 URL Generator in Developer Portal
   - Select bot permissions (see QUICKSTART.md)

6. Start:
   ```bash
   npm start
   ```

**Full guide:** See QUICKSTART.md in the repo

---

### For Non-Technical Users (Railway/Heroku)

**"Click this button to deploy your own bot in 2 minutes:"**

[Deploy on Railway Button]

Then:
1. Connect your GitHub account
2. Set `DISCORD_BOT_TOKEN` in Railway dashboard
3. Create Discord bot at discord.com/developers
4. Invite bot to your server
5. Done!

---

## Hosting Recommendations by Server Size

| Server Size | Recommended Hosting | Cost | Setup Time |
|------------|---------------------|------|------------|
| Small (<100 members) | Local computer or Raspberry Pi | Free/$35 one-time | 10 min |
| Medium (100-1000) | Railway.app / Render free tier | Free | 5 min |
| Large (1000-10000) | DigitalOcean VPS ($6/mo) | $6/mo | 15 min |
| Very Large (10000+) | AWS/GCP with load balancing | $20+/mo | 30+ min |

**Note:** Bot is very lightweight - even large servers rarely need more than 512MB RAM

---

## Support Options

When sharing with others, consider:

### Option A: Community Support
- Create GitHub Discussions or Issues
- Users help each other
- You answer occasionally

### Option B: Documentation Only
- Comprehensive README
- Troubleshooting guide
- "As-is, use at your own risk"

### Option C: Paid Support
- Offer setup assistance for fee
- Managed hosting option
- Priority bug fixes

---

## Can You Run ONE Bot for Multiple Servers?

**Yes, but not recommended.**

One bot *can* join multiple servers, but:

**Disadvantages:**
- ❌ All servers share the same config
- ❌ If bot goes down, all servers affected
- ❌ Privacy concerns (you control everyone's data)
- ❌ Harder to customize per server
- ❌ Becomes a service you have to maintain

**When it makes sense:**
- You personally own/manage all the servers
- Servers have identical moderation needs
- You want centralized monitoring

**Implementation:**
- No code changes needed (bot already supports multiple servers)
- Each server's data is separated in database by `guild_id`
- Just invite the same bot to multiple servers

**Most people should:** Run their own instance (full control + privacy)

---

## License Considerations

Since you built this, you should add a license:

### MIT License (Most Permissive)
```
Anyone can:
- Use commercially
- Modify
- Distribute
- Private use

Must include license and copyright notice
```

Add to `LICENSE` file:
```
MIT License

Copyright (c) 2025 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy...
```

### GPL License (Requires Open Source)
```
Anyone can use but must share modifications publicly
```

### Custom License
```
Free for non-commercial use
Commercial use requires permission/fee
```

**Recommendation:** MIT License for maximum adoption

---

## Example README Section for Sharing

Add this to your README.md:

```markdown
## Running Your Own Instance

This bot is designed to be self-hosted. Each server admin runs their own independent copy.

### Quick Start (5 minutes)

1. **Prerequisites:**
   - Node.js 18+ installed
   - Discord account with server admin access

2. **Setup:**
   ```bash
   git clone https://github.com/YOUR-USERNAME/discord-guardian-bot.git
   cd discord-guardian-bot
   npm install
   cp .env.example .env
   ```

3. **Configure:** Edit `.env` with your Discord bot token

4. **Run:** `npm start`

**Full guide:** See [QUICKSTART.md](QUICKSTART.md)

### Need Help?

- 📖 [Complete Documentation](README.md)
- 🧪 [Testing Guide](TESTING-GUIDE.md)
- 🚀 [Deployment Checklist](DEPLOYMENT-CHECKLIST.md)
- 💬 [GitHub Discussions](link) for questions
- 🐛 [Report Issues](link)

### Hosting Options

- **Free:** Railway.app, Render, Oracle Cloud free tier
- **Cheap:** DigitalOcean ($6/mo), Linode ($5/mo)
- **DIY:** Raspberry Pi, home server

---

## Questions?

**"Can I customize it for my server?"**
Yes! Edit `config/config.js` to adjust thresholds, keywords, etc.

**"Do I need coding skills?"**
Basic terminal/command line knowledge helpful. Full setup guides provided.

**"What if I need help?"**
Open a GitHub issue or discussion. Community support available.

**"Can I contribute improvements?"**
Yes! Pull requests welcome.
```

---

## Summary

✅ **YES** - Anyone can run this bot on their own server

✅ **Each person needs:**
- Their own Discord bot token
- A computer/server to run it on (can be local)
- 5-10 minutes for setup

✅ **Best way to share:**
- Upload to GitHub
- Link others to the repository
- They follow QUICKSTART.md

✅ **You maintain:**
- The code (updates/bug fixes)
- Documentation
- They maintain their own running instances

This is the standard approach for Discord bots - most popular bots work this way!
