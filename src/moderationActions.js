import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import config from '../config/config.js';
import db from './database.js';

class ModerationActions {
  constructor(client) {
    this.client = client;
    this.mutedUsers = new Map(); // Track temporary mutes
  }

  /**
   * Get the log channel for moderation alerts
   */
  async getLogChannel(guild) {
    const logChannelId = process.env.MOD_LOG_CHANNEL_ID;
    if (!logChannelId) return null;

    try {
      return await guild.channels.fetch(logChannelId);
    } catch (error) {
      console.error('Could not fetch log channel:', error.message);
      return null;
    }
  }

  /**
   * Create formatted embed for alerts
   */
  createAlertEmbed(type, user, reason, details = {}) {
    const colors = {
      critical: 0xFF0000, // Red
      high: 0xFF6B00,     // Orange
      medium: 0xFFD700,   // Yellow
      low: 0x00FF00,      // Green
      info: 0x0099FF      // Blue
    };

    const embed = new EmbedBuilder()
      .setColor(colors[details.severity] || colors.info)
      .setTitle(`🛡️ Security Alert: ${type}`)
      .setDescription(reason)
      .addFields(
        { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
        { name: 'Severity', value: details.severity || 'medium', inline: true },
        { name: 'Risk Score', value: `${details.riskScore || 0}/100`, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Guardian Bot Security System' });

    if (details.flags && details.flags.length > 0) {
      const flagText = details.flags.map(f => `• ${f.reason}`).join('\n');
      embed.addFields({ name: 'Detection Flags', value: flagText });
    }

    if (details.actionTaken) {
      embed.addFields({ name: 'Action Taken', value: details.actionTaken });
    }

    if (details.messageContent) {
      const content = details.messageContent.length > 1000
        ? details.messageContent.substring(0, 1000) + '...'
        : details.messageContent;
      embed.addFields({ name: 'Message Content', value: `\`\`\`${content}\`\`\`` });
    }

    if (details.urls && details.urls.length > 0) {
      embed.addFields({
        name: 'Malicious URLs',
        value: details.urls.map(u => `• ${u}`).join('\n') || 'None'
      });
    }

    return embed;
  }

  /**
   * Send alert to mod log channel
   */
  async sendAlert(guild, type, user, reason, details = {}) {
    if (!config.moderation.logToChannel) return;

    const logChannel = await this.getLogChannel(guild);
    if (!logChannel) return;

    try {
      const embed = this.createAlertEmbed(type, user, reason, details);
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Failed to send alert:', error.message);
    }
  }

  /**
   * Delete message and optionally notify user
   */
  async deleteMessage(message, reason, notifyUser = true) {
    try {
      // Save message content before deletion for logging
      const messageContent = message.content;

      await message.delete();

      if (notifyUser && config.moderation.sendWarnings) {
        try {
          await message.author.send({
            embeds: [
              new EmbedBuilder()
                .setColor(0xFF6B00)
                .setTitle('⚠️ Message Removed')
                .setDescription(`Your message in **${message.guild.name}** was automatically removed.`)
                .addFields(
                  { name: 'Reason', value: reason },
                  { name: 'Channel', value: `#${message.channel.name}` }
                )
                .setFooter({ text: 'If you believe this was an error, please contact a moderator.' })
                .setTimestamp()
            ]
          });
        } catch (dmError) {
          // User has DMs disabled, log but don't fail
          console.log(`Could not DM user ${message.author.tag}: ${dmError.message}`);
        }
      }

      return { success: true, messageContent };
    } catch (error) {
      console.error('Failed to delete message:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mute user temporarily
   */
  async muteUser(member, durationMs, reason) {
    try {
      // Use Discord's timeout feature (built-in mute)
      await member.timeout(durationMs, reason);

      // Track the mute
      this.mutedUsers.set(member.id, {
        guildId: member.guild.id,
        mutedAt: Date.now(),
        duration: durationMs,
        reason
      });

      // Send notification to user
      if (config.moderation.sendWarnings) {
        try {
          await member.send({
            embeds: [
              new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('🔇 You Have Been Temporarily Muted')
                .setDescription(`You have been muted in **${member.guild.name}**.`)
                .addFields(
                  { name: 'Reason', value: reason },
                  { name: 'Duration', value: `${Math.round(durationMs / 60000)} minutes` }
                )
                .setFooter({ text: 'If you believe this was an error, please contact a moderator.' })
                .setTimestamp()
            ]
          });
        } catch (dmError) {
          console.log(`Could not DM user ${member.user.tag}: ${dmError.message}`);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to mute user:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Kick user from server
   */
  async kickUser(member, reason) {
    try {
      // Notify user before kicking
      if (config.moderation.sendWarnings) {
        try {
          await member.send({
            embeds: [
              new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('⛔ You Have Been Kicked')
                .setDescription(`You have been kicked from **${member.guild.name}**.`)
                .addFields({ name: 'Reason', value: reason })
                .setTimestamp()
            ]
          });
        } catch (dmError) {
          console.log(`Could not DM user ${member.user.tag}`);
        }
      }

      await member.kick(reason);
      return { success: true };
    } catch (error) {
      console.error('Failed to kick user:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle detected threat based on severity
   */
  async handleThreat(message, member, analysis, linkScanResult = null) {
    const actions = [];
    let incidentType = 'unknown';
    let actionTaken = 'none';

    // Determine primary threat type
    if (linkScanResult && !linkScanResult.allSafe) {
      incidentType = 'malicious_link';
    } else if (analysis.isCompromised) {
      incidentType = 'compromised_account';
    } else if (analysis.flags.some(f => f.type === 'copypasta')) {
      incidentType = 'spam';
    } else if (analysis.flags.some(f => f.type === 'suspicious_keywords')) {
      incidentType = 'suspicious_content';
    }

    // Build alert details
    const alertDetails = {
      severity: analysis.riskLevel,
      riskScore: analysis.riskScore,
      flags: analysis.flags,
      messageContent: message.content,
      urls: linkScanResult?.maliciousUrls?.map(u => u.url) || []
    };

    // Take actions based on risk level and config
    if (analysis.riskLevel === 'critical' || (linkScanResult && !linkScanResult.allSafe)) {
      // CRITICAL: Delete message, mute user, alert mods
      if (config.moderation.autoDelete) {
        const deleteResult = await this.deleteMessage(
          message,
          `Security threat detected: ${incidentType}`,
          true
        );
        if (deleteResult.success) {
          actions.push('Message deleted');
        }
      }

      if (config.moderation.autoMute) {
        const muteResult = await this.muteUser(
          member,
          config.moderation.muteDurationMs,
          `Automatic mute: ${incidentType} (Risk: ${analysis.riskScore})`
        );
        if (muteResult.success) {
          actions.push(`Muted for ${config.moderation.muteDurationMs / 60000} minutes`);
        }
      }

      actionTaken = actions.join(', ');

      // Always alert mods for critical threats
      await this.sendAlert(
        message.guild,
        incidentType,
        message.author,
        'Critical security threat detected',
        { ...alertDetails, actionTaken }
      );

    } else if (analysis.riskLevel === 'high') {
      // HIGH: Delete message, warn user, alert mods
      if (config.moderation.autoDelete) {
        await this.deleteMessage(
          message,
          `Suspicious activity detected: ${incidentType}`,
          true
        );
        actions.push('Message deleted');
      }

      actionTaken = actions.join(', ');

      await this.sendAlert(
        message.guild,
        incidentType,
        message.author,
        'High-risk activity detected',
        { ...alertDetails, actionTaken }
      );

    } else if (analysis.riskLevel === 'medium') {
      // MEDIUM: Delete if configured, alert mods
      if (config.moderation.autoDelete) {
        await this.deleteMessage(
          message,
          `Potentially suspicious: ${incidentType}`,
          false
        );
        actions.push('Message deleted');
      }

      actionTaken = actions.join(', ') || 'Flagged for review';

      await this.sendAlert(
        message.guild,
        incidentType,
        message.author,
        'Medium-risk activity detected',
        { ...alertDetails, actionTaken }
      );

    } else if (analysis.riskLevel === 'low' && linkScanResult?.maliciousUrls?.length > 0) {
      // Even low risk, if there's a malicious link, delete it
      if (config.moderation.autoDelete) {
        await this.deleteMessage(
          message,
          'Link flagged as potentially malicious',
          true
        );
        actions.push('Message deleted');
        actionTaken = 'Message deleted';
      }
    }

    // Record incident in database
    db.recordIncident(
      message.author.id,
      message.guildId,
      incidentType,
      analysis.riskLevel,
      JSON.stringify({
        flags: analysis.flags,
        riskScore: analysis.riskScore,
        maliciousUrls: linkScanResult?.maliciousUrls || []
      }),
      actionTaken
    );

    return {
      actionsTaken: actions,
      incidentType,
      severity: analysis.riskLevel
    };
  }

  /**
   * Apply quarantine role to new members
   */
  async quarantineNewMember(member) {
    if (!config.moderation.useQuarantineRole) return;

    const quarantineRoleId = process.env.QUARANTINE_ROLE_ID;
    if (!quarantineRoleId) {
      console.warn('Quarantine role ID not configured');
      return;
    }

    try {
      const role = await member.guild.roles.fetch(quarantineRoleId);
      if (role) {
        await member.roles.add(role, 'New member quarantine');

        // Schedule automatic release after configured time
        setTimeout(async () => {
          try {
            await member.roles.remove(role, 'Quarantine period expired');
          } catch (error) {
            console.error('Failed to remove quarantine role:', error.message);
          }
        }, config.moderation.quarantineReleaseHours * 60 * 60 * 1000);
      }
    } catch (error) {
      console.error('Failed to apply quarantine role:', error.message);
    }
  }
}

export default ModerationActions;
