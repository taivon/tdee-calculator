#!/usr/bin/env node
/**
 * Generates public/ads.txt when VITE_ADSENSE_CLIENT is set.
 * See https://support.google.com/adsense/answer/7532444
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const client = process.env.VITE_ADSENSE_CLIENT ?? '';

if (!client.startsWith('ca-pub-')) {
  console.log('Skipping ads.txt (set VITE_ADSENSE_CLIENT to generate)');
  process.exit(0);
}

const publisherId = client.replace(/^ca-pub-/, 'pub-');
const adsTxt = `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`;
const outputPath = join(dirname(fileURLToPath(import.meta.url)), '../public/ads.txt');

writeFileSync(outputPath, adsTxt, 'utf8');
console.log(`Wrote ${outputPath}`);
