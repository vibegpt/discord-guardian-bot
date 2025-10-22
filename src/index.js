import { Client, GatewayIntentBits, Events, PermissionFlagsBits } from 'discord.js';
import dotenv from 'dotenv';
import config from '../config/config.js';
import db from './database.js';
import linkScanner from './linkScanner.js';
import behaviorDetector from './behaviorDetector.js';
import ModerationActions from './moderationActions.js';

dotenv.config();

// Initialize Discord client with necessary intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
});

// Initialize moderation actions handler
let moderationActions;

/**
 * Bot ready event
 */
client.once(Events.ClientReady, async (c) => {
  console.log('🛡️  Guardian Bot Starting...');
  console.log(`✅ Logged in as ${c.user.tag}`);

  // Initialize database
  await db.initialize();
  console.log('✅ Database initialized');

  // Initialize moderation actions
  moderationActions = new ModerationActions(client);
  console.log('✅ Moderation system ready');

  // Set bot status
  client.user.setActivity('for threats', { type: 'WATCHING' });

  // Periodic cleanup (every 24 hours)
  setInterval(() => {
    console.log('🧹 Running database cleanup...');
    db.cleanup();
  }, 24 * 60 * 60 * 1000);

  console.log('🛡️  Guardian Bot is now protecting your server!');
  console.log('\nActive Protection Features:');
  console.log(`  - Link Scanning: ${config.links.enableGoogleSafeBrowsing ? '✅' : '❌'}`);
  console.log(`  - Behavioral Analysis: ✅`);
  console.log(`  - Auto-Delete: ${config.moderation.autoDelete ? '✅' : '❌'}`);
  console.log(`  - Auto-Mute: ${config.moderation.autoMute ? '✅' : '❌'}`);
  console.log(`  - Quarantine New Users: ${config.moderation.useQuarantineRole ? '✅' : '❌'}`);
  console.log(`  - Copypasta Detection: ${config.content.enableDuplicateDetection ? '✅' : '❌'}\n`);
});

/**
 * New member join event
 */
client.on(Events.GuildMemberAdd, async (member) => {
  console.log(`👤 New member joined: ${member.user.tag}`);

  // Apply quarantine role if enabled
  if (config.moderation.useQuarantineRole) {
    await moderationActions.quarantineNewMember(member);
  }
});

/**
 * Message create event - Main security checks
 */
client.on(Events.MessageCreate, async (message) => {
  // Ignore bot messages and DMs
  if (message.author.bot || !message.guild) return;

  try {
    const member = await message.guild.members.fetch(message.author.id);

    // Skip checks for administrators (optional - can be configured)
    if (member.permissions.has(PermissionFlagsBits.Administrator)) {
      // Still log for transparency, but don't take action
      // You can remove this check if you want to scan admin messages too
      return;
    }

    // === PHASE 1: LINK SCANNING ===
    let linkScanResult = null;
    const hasLinks = /https?:\/\//.test(message.content);

    if (hasLinks) {
      console.log(`🔍 Scanning links from ${message.author.tag}`);
      linkScanResult = await linkScanner.scanMessage(message.content);

      if (!linkScanResult.allSafe) {
        console.log(`⚠️  Malicious link detected from ${message.author.tag}`);

        // Immediate action for malicious links
        const deleteResult = await moderationActions.deleteMessage(
          message,
          'Malicious link detected',
          true
        );

        if (deleteResult.success) {
          // Alert moderators
          await moderationActions.sendAlert(
            message.guild,
            'Malicious Link Blocked',
            message.author,
            'Message contained known malicious URL',
            {
              severity: 'critical',
              riskScore: 100,
              urls: linkScanResult.maliciousUrls.map(u => u.url),
              actionTaken: 'Message deleted, user warned',
              messageContent: deleteResult.messageContent
            }
          );

          // Record incident
          db.recordIncident(
            message.author.id,
            message.guildId,
            'malicious_link',
            'critical',
            JSON.stringify(linkScanResult.maliciousUrls),
            'Message deleted'
          );
        }

        // If this is a repeated offense, consider muting
        const recentIncidents = db.getUserIncidents(
          message.author.id,
          message.guildId,
          Date.now() - (24 * 60 * 60 * 1000) // Last 24 hours
        );

        if (recentIncidents.length >= 2 && config.moderation.autoMute) {
          await moderationActions.muteUser(
            member,
            config.moderation.muteDurationMs,
            'Multiple security violations detected'
          );
        }

        return; // Stop processing this message
      }
    }

    // === PHASE 2: BEHAVIORAL ANALYSIS ===
    const behaviorAnalysis = await behaviorDetector.analyzeMessage(message, member);

    if (behaviorAnalysis.riskScore > 0) {
      console.log(
        `📊 Behavioral analysis for ${message.author.tag}: ` +
        `Risk ${behaviorAnalysis.riskScore}/100 (${behaviorAnalysis.riskLevel})`
      );

      if (behaviorAnalysis.flags.length > 0) {
        console.log(`   Flags: ${behaviorAnalysis.flags.map(f => f.type).join(', ')}`);
      }
    }

    // === PHASE 3: THREAT RESPONSE ===
    // Take action if risk is medium or higher
    if (behaviorAnalysis.riskLevel !== 'low' && behaviorAnalysis.riskLevel !== 'none') {
      await moderationActions.handleThreat(
        message,
        member,
        behaviorAnalysis,
        linkScanResult
      );
    }

  } catch (error) {
    console.error('Error processing message:', error);
  }
});

/**
 * Message update event - Check edited messages
 */
client.on(Events.MessageUpdate, async (oldMessage, newMessage) => {
  // Treat edited messages as new messages
  if (newMessage.partial) {
    try {
      await newMessage.fetch();
    } catch (error) {
      console.error('Failed to fetch edited message:', error);
      return;
    }
  }

  // Re-run checks on edited message
  client.emit(Events.MessageCreate, newMessage);
});

/**
 * Error handling
 */
client.on(Events.Error, (error) => {
  console.error('Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Guardian Bot...');
  db.close();
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down Guardian Bot...');
  db.close();
  client.destroy();
  process.exit(0);
});

// Login to Discord
const token = process.env.DISCORD_BOT_TOKEN;
if (!token) {
  console.error('❌ Error: DISCORD_BOT_TOKEN not found in .env file');
  process.exit(1);
}

client.login(token).catch((error) => {
  console.error('❌ Failed to login:', error.message);
  process.exit(1);
});
