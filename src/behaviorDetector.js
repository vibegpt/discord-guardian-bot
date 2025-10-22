import config from '../config/config.js';
import db from './database.js';

class BehaviorDetector {
  /**
   * Calculate string similarity using Levenshtein distance
   */
  stringSimilarity(str1, str2) {
    const track = Array(str2.length + 1).fill(null).map(() =>
      Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) track[0][i] = i;
    for (let j = 0; j <= str2.length; j++) track[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
          track[j][i - 1] + 1,
          track[j - 1][i] + 1,
          track[j - 1][i - 1] + indicator
        );
      }
    }

    const distance = track[str2.length][str1.length];
    const maxLength = Math.max(str1.length, str2.length);
    return 1 - (distance / maxLength);
  }

  /**
   * Detect if message is copypasta (duplicate content from different users)
   */
  async detectCopypasta(message) {
    const content = message.content.toLowerCase().trim();
    if (content.length < 20) return { isCopypasta: false }; // Too short to be meaningful

    const recentMessages = db.getRecentMessagesByGuild(
      message.guildId,
      config.content.duplicateCheckWindowMs
    );

    for (const recent of recentMessages) {
      // Skip messages from the same user
      if (recent.user_id === message.author.id) continue;

      const similarity = this.stringSimilarity(content, recent.content.toLowerCase());

      if (similarity >= config.content.duplicateSimilarityThreshold) {
        return {
          isCopypasta: true,
          similarity: similarity,
          originalUserId: recent.user_id,
          reason: `${Math.round(similarity * 100)}% similar to recent message`
        };
      }
    }

    // Store this message for future comparisons
    if (config.content.enableDuplicateDetection) {
      db.storeRecentMessage(message.author.id, message.guildId, content);
    }

    return { isCopypasta: false };
  }

  /**
   * Check for suspicious keywords in message
   */
  detectSuspiciousKeywords(messageContent) {
    const lowerContent = messageContent.toLowerCase();
    const matches = [];

    for (const keyword of config.content.suspiciousKeywords) {
      if (lowerContent.includes(keyword.toLowerCase())) {
        matches.push(keyword);
      }
    }

    return {
      hasSuspiciousKeywords: matches.length > 0,
      matches,
      count: matches.length
    };
  }

  /**
   * Analyze message velocity (rate of posting)
   */
  async analyzeVelocity(userId, guildId, accountCreatedAt) {
    const baseline = db.getUserBaseline(userId, guildId);

    // Get recent messages
    const messagesLastMinute = db.getRecentMessages(userId, guildId, 60 * 1000);
    const messagesLastHour = db.getRecentMessages(userId, guildId, 60 * 60 * 1000);

    const velocityFlags = [];

    // Check messages per minute
    if (messagesLastMinute.length >= config.behavior.maxMessagesPerMinute) {
      velocityFlags.push({
        type: 'excessive_velocity_minute',
        severity: 'high',
        value: messagesLastMinute.length,
        threshold: config.behavior.maxMessagesPerMinute,
        reason: `${messagesLastMinute.length} messages in last minute`
      });
    }

    // Check messages per hour
    if (messagesLastHour.length >= config.behavior.maxMessagesPerHour) {
      velocityFlags.push({
        type: 'excessive_velocity_hour',
        severity: 'medium',
        value: messagesLastHour.length,
        threshold: config.behavior.maxMessagesPerHour,
        reason: `${messagesLastHour.length} messages in last hour`
      });
    }

    // Check deviation from baseline
    if (baseline && baseline.avg_messages_per_day > 0) {
      const currentRate = messagesLastHour.length; // messages per hour
      const expectedRate = baseline.avg_messages_per_day / 24; // convert daily to hourly

      if (currentRate > expectedRate * config.behavior.velocityMultiplierThreshold) {
        velocityFlags.push({
          type: 'baseline_deviation',
          severity: 'high',
          value: currentRate,
          expected: expectedRate,
          multiplier: (currentRate / expectedRate).toFixed(1),
          reason: `Posting ${Math.round(currentRate / expectedRate)}x faster than normal`
        });
      }
    }

    return {
      isAnomalous: velocityFlags.length > 0,
      flags: velocityFlags,
      messagesLastMinute: messagesLastMinute.length,
      messagesLastHour: messagesLastHour.length,
      baseline: baseline ? baseline.avg_messages_per_day : 0
    };
  }

  /**
   * Check if user is new and posting links suspiciously fast
   */
  async analyzeNewUserBehavior(member, message, hasLinks) {
    const flags = [];
    const now = Date.now();

    // Calculate account age
    const accountAge = now - member.user.createdTimestamp;
    const isNewAccount = accountAge < config.behavior.newUserThresholdMs;

    if (!isNewAccount) {
      return { isNewUser: false, flags: [] };
    }

    // Check join-to-post time
    const joinTime = member.joinedTimestamp;
    const joinToPostMs = now - joinTime;

    if (joinToPostMs < config.behavior.suspiciousJoinToPostMs) {
      flags.push({
        type: 'join_and_spam',
        severity: 'critical',
        value: joinToPostMs,
        threshold: config.behavior.suspiciousJoinToPostMs,
        reason: `Posted ${Math.round(joinToPostMs / 1000)}s after joining`
      });
    }

    // Check if new user is posting too many links
    if (hasLinks) {
      const linksLastHour = db.getRecentLinksCount(
        member.id,
        message.guildId,
        60 * 60 * 1000
      );

      if (linksLastHour >= config.behavior.newUserMaxLinksPerHour) {
        flags.push({
          type: 'new_user_link_spam',
          severity: 'high',
          value: linksLastHour,
          threshold: config.behavior.newUserMaxLinksPerHour,
          reason: `New user posted ${linksLastHour} links in last hour`
        });
      }
    }

    return {
      isNewUser: true,
      accountAge,
      joinToPostMs,
      flags,
      isAnomalous: flags.length > 0
    };
  }

  /**
   * Detect mention spam (@everyone, @here, mass mentions)
   */
  detectMentionSpam(message) {
    const flags = [];

    // Check for @everyone or @here
    if (message.mentions.everyone) {
      const recentMentions = db.getRecentMessages(
        message.author.id,
        message.guildId,
        60 * 60 * 1000
      ).filter(m => m.mention_count > 0);

      if (recentMentions.length >= config.behavior.maxRoleMentionsPerHour) {
        flags.push({
          type: 'role_mention_spam',
          severity: 'high',
          reason: `Multiple @everyone/@here in last hour`
        });
      }
    }

    // Check for mass user mentions
    const userMentions = message.mentions.users.size;
    if (userMentions >= config.behavior.maxMentionsPerMessage) {
      flags.push({
        type: 'mass_mention',
        severity: 'medium',
        value: userMentions,
        threshold: config.behavior.maxMentionsPerMessage,
        reason: `Mentioned ${userMentions} users in one message`
      });
    }

    return {
      isMentionSpam: flags.length > 0,
      flags,
      mentionCount: userMentions
    };
  }

  /**
   * Comprehensive behavioral analysis
   */
  async analyzeMessage(message, member) {
    const analysisResult = {
      userId: message.author.id,
      guildId: message.guildId,
      timestamp: Date.now(),
      flags: [],
      riskScore: 0,
      riskLevel: 'low',
      isCompromised: false
    };

    try {
      // Get or create user baseline
      const baseline = db.createOrUpdateBaseline(
        message.author.id,
        message.guildId,
        member.user.createdTimestamp
      );

      // Extract message features
      const hasLinks = /https?:\/\//.test(message.content);
      const mentionCount = message.mentions.users.size + (message.mentions.everyone ? 10 : 0);

      // Record message in history
      db.recordMessage(
        message.author.id,
        message.guildId,
        message.channelId,
        hasLinks,
        mentionCount
      );

      if (hasLinks) {
        db.incrementLinkCount(message.author.id, message.guildId);
      }

      // Run all behavioral checks
      const [velocityCheck, newUserCheck, mentionCheck, copypastaCheck, keywordCheck] = await Promise.all([
        this.analyzeVelocity(message.author.id, message.guildId, member.user.createdTimestamp),
        this.analyzeNewUserBehavior(member, message, hasLinks),
        Promise.resolve(this.detectMentionSpam(message)),
        this.detectCopypasta(message),
        Promise.resolve(this.detectSuspiciousKeywords(message.content))
      ]);

      // Aggregate flags
      if (velocityCheck.isAnomalous) analysisResult.flags.push(...velocityCheck.flags);
      if (newUserCheck.isAnomalous) analysisResult.flags.push(...newUserCheck.flags);
      if (mentionCheck.isMentionSpam) analysisResult.flags.push(...mentionCheck.flags);

      if (copypastaCheck.isCopypasta) {
        analysisResult.flags.push({
          type: 'copypasta',
          severity: 'medium',
          reason: copypastaCheck.reason
        });
      }

      if (keywordCheck.hasSuspiciousKeywords) {
        analysisResult.flags.push({
          type: 'suspicious_keywords',
          severity: 'medium',
          matches: keywordCheck.matches,
          reason: `Contains suspicious keywords: ${keywordCheck.matches.join(', ')}`
        });
      }

      // Calculate risk score
      analysisResult.riskScore = this.calculateRiskScore(analysisResult.flags);

      // Determine risk level
      if (analysisResult.riskScore >= 80) {
        analysisResult.riskLevel = 'critical';
        analysisResult.isCompromised = true;
      } else if (analysisResult.riskScore >= 60) {
        analysisResult.riskLevel = 'high';
        analysisResult.isCompromised = true;
      } else if (analysisResult.riskScore >= 40) {
        analysisResult.riskLevel = 'medium';
      } else if (analysisResult.riskScore >= 20) {
        analysisResult.riskLevel = 'low';
      }

      analysisResult.details = {
        velocity: velocityCheck,
        newUser: newUserCheck,
        mentions: mentionCheck,
        copypasta: copypastaCheck,
        keywords: keywordCheck,
        baseline
      };

      return analysisResult;
    } catch (error) {
      console.error('Behavior analysis error:', error);
      return analysisResult;
    }
  }

  /**
   * Calculate risk score from flags
   */
  calculateRiskScore(flags) {
    const severityScores = {
      critical: 40,
      high: 25,
      medium: 15,
      low: 5
    };

    let score = 0;
    for (const flag of flags) {
      score += severityScores[flag.severity] || 0;
    }

    return Math.min(score, 100);
  }
}

export default new BehaviorDetector();
