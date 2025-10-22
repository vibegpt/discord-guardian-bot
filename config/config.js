export default {
  // Bot behavior settings
  behavior: {
    // Message velocity thresholds
    maxMessagesPerMinute: 10,
    maxMessagesPerHour: 60,

    // New user restrictions (in milliseconds)
    newUserThresholdMs: 24 * 60 * 60 * 1000, // 24 hours
    newUserMaxLinksPerHour: 2,

    // Behavioral anomaly detection
    velocityMultiplierThreshold: 5, // Flag if user posts 5x their normal rate
    suspiciousJoinToPostMs: 10000, // 10 seconds - flag if user posts within this time

    // Mention spam detection
    maxMentionsPerMessage: 5,
    maxRoleMentionsPerHour: 2,
  },

  // Link scanning settings
  links: {
    // Whitelist - trusted domains that bypass scanning
    whitelist: [
      'youtube.com',
      'youtu.be',
      'github.com',
      'twitter.com',
      'x.com',
      'discord.com',
      'discord.gg',
      'tenor.com',
      'giphy.com',
      'imgur.com',
      'reddit.com',
      'wikipedia.org',
      'google.com',
      'docs.google.com'
    ],

    // Blacklist - known malicious patterns
    blacklistPatterns: [
      /free[-\s]?mint/i,
      /claim[-\s]?airdrop/i,
      /connect[-\s]?wallet/i,
      /verify[-\s]?wallet/i,
      /metamask[-\s]?security/i,
      /urgent[-\s]?claim/i,
      /limited[-\s]?nft/i,
      /discord[-\s]?nitro[-\s]?free/i
    ],

    // Suspicious TLDs (top-level domains)
    suspiciousTLDs: ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.work', '.click'],

    // Link scanning APIs (add your API keys in .env)
    enableGoogleSafeBrowsing: true,
    enablePhishTank: false, // Requires API key
    enableVirusTotal: false, // Requires API key
  },

  // Moderation actions
  moderation: {
    // Auto-delete suspicious messages immediately
    autoDelete: true,

    // Send warning DMs to users
    sendWarnings: true,

    // Auto-mute settings
    autoMute: true,
    muteDurationMs: 10 * 60 * 1000, // 10 minutes

    // Log channel for mod alerts (set channel ID in .env)
    logToChannel: true,

    // Quarantine role for new users (set role ID in .env)
    useQuarantineRole: true,
    quarantineReleaseHours: 24,
  },

  // Content filtering
  content: {
    // Keyword blacklist
    suspiciousKeywords: [
      'free mint',
      'claim now',
      'verify your wallet',
      'metamask verify',
      'urgent claim',
      'limited spots',
      'connect wallet',
      'free nitro',
      'discord nitro free',
      '@everyone free'
    ],

    // Detect copypasta (duplicate messages)
    enableDuplicateDetection: true,
    duplicateSimilarityThreshold: 0.85, // 85% similar = copypasta
    duplicateCheckWindowMs: 5 * 60 * 1000, // Check last 5 minutes
  },

  // Database settings
  database: {
    path: './data/guardian.db'
  }
};
