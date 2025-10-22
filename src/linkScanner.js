import fetch from 'node-fetch';
import config from '../config/config.js';

class LinkScanner {
  constructor() {
    this.urlRegex = /(https?:\/\/[^\s]+)/gi;
  }

  /**
   * Extract all URLs from a message
   */
  extractUrls(text) {
    const matches = text.match(this.urlRegex);
    return matches || [];
  }

  /**
   * Parse URL to get domain and check against whitelist
   */
  getDomain(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch (e) {
      return null;
    }
  }

  /**
   * Check if URL is whitelisted
   */
  isWhitelisted(url) {
    const domain = this.getDomain(url);
    if (!domain) return false;

    return config.links.whitelist.some(trusted => domain.includes(trusted));
  }

  /**
   * Check if URL matches blacklist patterns or has suspicious TLD
   */
  isBlacklisted(url) {
    const lowerUrl = url.toLowerCase();

    // Check against blacklist patterns
    for (const pattern of config.links.blacklistPatterns) {
      if (pattern.test(lowerUrl)) {
        return { isBlacklisted: true, reason: 'Matches blacklist pattern' };
      }
    }

    // Check for suspicious TLDs
    for (const tld of config.links.suspiciousTLDs) {
      if (lowerUrl.includes(tld)) {
        return { isBlacklisted: true, reason: `Suspicious TLD: ${tld}` };
      }
    }

    return { isBlacklisted: false };
  }

  /**
   * Check URL against Google Safe Browsing API
   * Requires GOOGLE_SAFE_BROWSING_API_KEY in .env
   */
  async checkGoogleSafeBrowsing(url) {
    if (!config.links.enableGoogleSafeBrowsing) {
      return { isThreat: false, reason: 'Google Safe Browsing disabled' };
    }

    const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
    if (!apiKey) {
      console.warn('Google Safe Browsing API key not found');
      return { isThreat: false, reason: 'API key not configured' };
    }

    try {
      const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`;
      const body = {
        client: {
          clientId: 'discord-guardian',
          clientVersion: '1.0.0'
        },
        threatInfo: {
          threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [{ url }]
        }
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.matches && data.matches.length > 0) {
        return {
          isThreat: true,
          reason: `Google Safe Browsing: ${data.matches[0].threatType}`,
          details: data.matches[0]
        };
      }

      return { isThreat: false };
    } catch (error) {
      console.error('Google Safe Browsing API error:', error.message);
      return { isThreat: false, error: error.message };
    }
  }

  /**
   * Check URL against VirusTotal API
   * Requires VIRUSTOTAL_API_KEY in .env
   */
  async checkVirusTotal(url) {
    if (!config.links.enableVirusTotal) {
      return { isThreat: false, reason: 'VirusTotal disabled' };
    }

    const apiKey = process.env.VIRUSTOTAL_API_KEY;
    if (!apiKey) {
      return { isThreat: false, reason: 'API key not configured' };
    }

    try {
      // Encode URL for VirusTotal API
      const urlId = Buffer.from(url).toString('base64').replace(/=/g, '');
      const endpoint = `https://www.virustotal.com/api/v3/urls/${urlId}`;

      const response = await fetch(endpoint, {
        headers: { 'x-apikey': apiKey }
      });

      if (response.status === 404) {
        // URL not in database, submit it for scanning
        return { isThreat: false, reason: 'Not in VirusTotal database' };
      }

      const data = await response.json();
      const stats = data.data?.attributes?.last_analysis_stats;

      if (stats && (stats.malicious > 0 || stats.suspicious > 2)) {
        return {
          isThreat: true,
          reason: `VirusTotal: ${stats.malicious} malicious, ${stats.suspicious} suspicious`,
          details: stats
        };
      }

      return { isThreat: false };
    } catch (error) {
      console.error('VirusTotal API error:', error.message);
      return { isThreat: false, error: error.message };
    }
  }

  /**
   * Check if URL is a known URL shortener (often used in phishing)
   */
  isUrlShortener(url) {
    const domain = this.getDomain(url);
    const shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd', 'buff.ly'];
    return shorteners.some(shortener => domain === shortener);
  }

  /**
   * Main scanning function - comprehensive check
   */
  async scanUrl(url) {
    const scanResult = {
      url,
      isSafe: true,
      threats: [],
      confidence: 'high'
    };

    // 1. Check whitelist first (instant pass)
    if (this.isWhitelisted(url)) {
      scanResult.whitelisted = true;
      scanResult.confidence = 'absolute';
      return scanResult;
    }

    // 2. Check blacklist patterns
    const blacklistCheck = this.isBlacklisted(url);
    if (blacklistCheck.isBlacklisted) {
      scanResult.isSafe = false;
      scanResult.threats.push({
        source: 'blacklist',
        reason: blacklistCheck.reason,
        severity: 'high'
      });
    }

    // 3. Check if URL shortener (lower confidence)
    if (this.isUrlShortener(url)) {
      scanResult.confidence = 'medium';
      scanResult.threats.push({
        source: 'analysis',
        reason: 'URL shortener detected',
        severity: 'low'
      });
    }

    // 4. Check Google Safe Browsing
    const googleCheck = await this.checkGoogleSafeBrowsing(url);
    if (googleCheck.isThreat) {
      scanResult.isSafe = false;
      scanResult.threats.push({
        source: 'google_safe_browsing',
        reason: googleCheck.reason,
        severity: 'critical',
        details: googleCheck.details
      });
    }

    // 5. Check VirusTotal (if enabled)
    const vtCheck = await this.checkVirusTotal(url);
    if (vtCheck.isThreat) {
      scanResult.isSafe = false;
      scanResult.threats.push({
        source: 'virustotal',
        reason: vtCheck.reason,
        severity: 'high',
        details: vtCheck.details
      });
    }

    // Determine overall safety
    if (scanResult.threats.length > 0) {
      const criticalThreats = scanResult.threats.filter(t => t.severity === 'critical');
      const highThreats = scanResult.threats.filter(t => t.severity === 'high');

      if (criticalThreats.length > 0 || highThreats.length > 1) {
        scanResult.isSafe = false;
        scanResult.confidence = 'high';
      } else if (highThreats.length === 1) {
        scanResult.isSafe = false;
        scanResult.confidence = 'medium';
      }
    }

    return scanResult;
  }

  /**
   * Scan all URLs in a message
   */
  async scanMessage(messageContent) {
    const urls = this.extractUrls(messageContent);

    if (urls.length === 0) {
      return { hasLinks: false, allSafe: true, results: [] };
    }

    const results = await Promise.all(
      urls.map(url => this.scanUrl(url))
    );

    const allSafe = results.every(r => r.isSafe);
    const maliciousUrls = results.filter(r => !r.isSafe);

    return {
      hasLinks: true,
      allSafe,
      results,
      maliciousUrls,
      urlCount: urls.length
    };
  }
}

export default new LinkScanner();
