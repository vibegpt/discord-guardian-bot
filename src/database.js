import Database from 'better-sqlite3';
import { mkdir } from 'fs/promises';
import { dirname } from 'path';
import config from '../config/config.js';

class GuardianDatabase {
  constructor() {
    this.db = null;
  }

  async initialize() {
    // Ensure data directory exists
    await mkdir(dirname(config.database.path), { recursive: true });

    this.db = new Database(config.database.path);
    this.db.pragma('journal_mode = WAL');

    // Create tables
    this.createTables();
  }

  createTables() {
    // User baseline behavior tracking
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_baselines (
        user_id TEXT PRIMARY KEY,
        guild_id TEXT NOT NULL,
        first_seen INTEGER NOT NULL,
        total_messages INTEGER DEFAULT 0,
        total_links INTEGER DEFAULT 0,
        avg_messages_per_day REAL DEFAULT 0,
        last_updated INTEGER NOT NULL,
        reputation_score REAL DEFAULT 50.0
      )
    `);

    // Message history for velocity tracking
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS message_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        guild_id TEXT NOT NULL,
        channel_id TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        has_link INTEGER DEFAULT 0,
        mention_count INTEGER DEFAULT 0
      )
    `);

    // Detected incidents
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS incidents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        guild_id TEXT NOT NULL,
        incident_type TEXT NOT NULL,
        severity TEXT NOT NULL,
        details TEXT,
        timestamp INTEGER NOT NULL,
        action_taken TEXT
      )
    `);

    // Recent message content for copypasta detection
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS recent_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        content_hash TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp INTEGER NOT NULL
      )
    `);

    // Create indexes
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_message_history_user
      ON message_history(user_id, timestamp);

      CREATE INDEX IF NOT EXISTS idx_message_history_guild
      ON message_history(guild_id, timestamp);

      CREATE INDEX IF NOT EXISTS idx_incidents_user
      ON incidents(user_id, timestamp);

      CREATE INDEX IF NOT EXISTS idx_recent_messages_guild
      ON recent_messages(guild_id, timestamp);
    `);
  }

  // User baseline management
  getUserBaseline(userId, guildId) {
    const stmt = this.db.prepare(`
      SELECT * FROM user_baselines
      WHERE user_id = ? AND guild_id = ?
    `);
    return stmt.get(userId, guildId);
  }

  createOrUpdateBaseline(userId, guildId, accountCreatedAt) {
    const now = Date.now();
    const existing = this.getUserBaseline(userId, guildId);

    if (existing) {
      // Update existing baseline
      const totalMessages = existing.total_messages + 1;
      const daysSinceFirstSeen = (now - existing.first_seen) / (1000 * 60 * 60 * 24);
      const avgMessagesPerDay = daysSinceFirstSeen > 0 ? totalMessages / daysSinceFirstSeen : 0;

      const stmt = this.db.prepare(`
        UPDATE user_baselines
        SET total_messages = ?,
            avg_messages_per_day = ?,
            last_updated = ?
        WHERE user_id = ? AND guild_id = ?
      `);
      stmt.run(totalMessages, avgMessagesPerDay, now, userId, guildId);

      return { ...existing, total_messages: totalMessages, avg_messages_per_day: avgMessagesPerDay };
    } else {
      // Create new baseline
      const stmt = this.db.prepare(`
        INSERT INTO user_baselines
        (user_id, guild_id, first_seen, total_messages, last_updated)
        VALUES (?, ?, ?, 1, ?)
      `);
      stmt.run(userId, guildId, now, now);

      return { user_id: userId, guild_id: guildId, first_seen: now, total_messages: 1 };
    }
  }

  incrementLinkCount(userId, guildId) {
    const stmt = this.db.prepare(`
      UPDATE user_baselines
      SET total_links = total_links + 1
      WHERE user_id = ? AND guild_id = ?
    `);
    stmt.run(userId, guildId);
  }

  // Message history tracking
  recordMessage(userId, guildId, channelId, hasLink = false, mentionCount = 0) {
    const stmt = this.db.prepare(`
      INSERT INTO message_history
      (user_id, guild_id, channel_id, timestamp, has_link, mention_count)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(userId, guildId, channelId, Date.now(), hasLink ? 1 : 0, mentionCount);
  }

  getRecentMessages(userId, guildId, windowMs) {
    const cutoff = Date.now() - windowMs;
    const stmt = this.db.prepare(`
      SELECT * FROM message_history
      WHERE user_id = ? AND guild_id = ? AND timestamp > ?
      ORDER BY timestamp DESC
    `);
    return stmt.all(userId, guildId, cutoff);
  }

  getRecentLinksCount(userId, guildId, windowMs) {
    const cutoff = Date.now() - windowMs;
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM message_history
      WHERE user_id = ? AND guild_id = ? AND timestamp > ? AND has_link = 1
    `);
    return stmt.get(userId, guildId, cutoff).count;
  }

  // Incident tracking
  recordIncident(userId, guildId, incidentType, severity, details, actionTaken) {
    const stmt = this.db.prepare(`
      INSERT INTO incidents
      (user_id, guild_id, incident_type, severity, details, timestamp, action_taken)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(userId, guildId, incidentType, severity, details, Date.now(), actionTaken);
  }

  getUserIncidents(userId, guildId, since = 0) {
    const stmt = this.db.prepare(`
      SELECT * FROM incidents
      WHERE user_id = ? AND guild_id = ? AND timestamp > ?
      ORDER BY timestamp DESC
    `);
    return stmt.all(userId, guildId, since);
  }

  // Copypasta detection
  storeRecentMessage(userId, guildId, content) {
    const stmt = this.db.prepare(`
      INSERT INTO recent_messages
      (guild_id, user_id, content_hash, content, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `);
    const hash = this.simpleHash(content);
    stmt.run(guildId, userId, hash, content, Date.now());
  }

  getRecentMessagesByGuild(guildId, windowMs) {
    const cutoff = Date.now() - windowMs;
    const stmt = this.db.prepare(`
      SELECT * FROM recent_messages
      WHERE guild_id = ? AND timestamp > ?
      ORDER BY timestamp DESC
    `);
    return stmt.all(guildId, cutoff);
  }

  // Cleanup old data
  cleanup() {
    const cutoff = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 days

    this.db.prepare('DELETE FROM message_history WHERE timestamp < ?').run(cutoff);
    this.db.prepare('DELETE FROM recent_messages WHERE timestamp < ?').run(cutoff);
  }

  // Utility
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString();
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

export default new GuardianDatabase();
