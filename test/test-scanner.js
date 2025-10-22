#!/usr/bin/env node
import dotenv from 'dotenv';
import linkScanner from '../src/linkScanner.js';

dotenv.config();

console.log('🧪 Guardian Bot - Link Scanner Test\n');
console.log('Testing link scanning functionality...\n');

const testUrls = [
  {
    url: 'https://youtube.com/watch?v=test',
    expected: 'safe',
    reason: 'Whitelisted domain'
  },
  {
    url: 'https://example.tk/free-mint',
    expected: 'unsafe',
    reason: 'Suspicious TLD + blacklist pattern'
  },
  {
    url: 'https://connect-wallet-verify.com/metamask',
    expected: 'unsafe',
    reason: 'Blacklist pattern match'
  },
  {
    url: 'https://github.com/example/repo',
    expected: 'safe',
    reason: 'Whitelisted domain'
  },
  {
    url: 'https://bit.ly/test123',
    expected: 'suspicious',
    reason: 'URL shortener'
  }
];

async function runTests() {
  console.log('Testing URL extraction...');
  const sampleMessage = 'Check out https://example.com and also https://test.com/page';
  const extracted = linkScanner.extractUrls(sampleMessage);
  console.log(`✅ Extracted ${extracted.length} URLs:`, extracted);
  console.log();

  console.log('Testing individual URL scans...\n');

  for (const test of testUrls) {
    console.log(`Testing: ${test.url}`);
    console.log(`Expected: ${test.expected} (${test.reason})`);

    const result = await linkScanner.scanUrl(test.url);

    console.log(`Result: ${result.isSafe ? '✅ SAFE' : '⚠️  UNSAFE'}`);
    if (result.whitelisted) {
      console.log('  → Whitelisted (instant pass)');
    }
    if (result.threats.length > 0) {
      console.log('  Threats detected:');
      result.threats.forEach(threat => {
        console.log(`    • [${threat.severity}] ${threat.reason}`);
      });
    }
    console.log(`  Confidence: ${result.confidence}`);
    console.log();
  }

  console.log('Testing full message scan...\n');
  const spamMessage = 'FREE MINT! Connect your wallet at https://scam-site.tk/verify and claim your airdrop at https://fake-metamask.com/login';

  console.log(`Message: "${spamMessage}"\n`);
  const messageResult = await linkScanner.scanMessage(spamMessage);

  console.log(`Found ${messageResult.urlCount} URLs`);
  console.log(`All safe? ${messageResult.allSafe ? '✅ Yes' : '⚠️  No'}`);

  if (!messageResult.allSafe) {
    console.log(`\nMalicious URLs detected: ${messageResult.maliciousUrls.length}`);
    messageResult.maliciousUrls.forEach(result => {
      console.log(`\n  URL: ${result.url}`);
      console.log(`  Threats:`);
      result.threats.forEach(threat => {
        console.log(`    • [${threat.severity}] ${threat.reason}`);
      });
    });
  }

  console.log('\n✅ Test complete!\n');

  if (process.env.GOOGLE_SAFE_BROWSING_API_KEY) {
    console.log('ℹ️  Google Safe Browsing API key detected - API checks are enabled');
  } else {
    console.log('⚠️  Google Safe Browsing API key not found');
    console.log('   Add GOOGLE_SAFE_BROWSING_API_KEY to .env for full protection');
  }
}

runTests().catch(console.error);
