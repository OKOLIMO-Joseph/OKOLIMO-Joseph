import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchGitHubContributions, generateDemoContributions } from './lib/fetch-contributions.mjs';
import { normalizeContributionData } from './lib/normalize-data.mjs';
import { renderBreakoutSvg } from './lib/render-svg.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(REPO_ROOT, 'generated');
const BREAKOUT_FILE = path.join(OUTPUT_DIR, 'commit-breakout.svg');
const TETRIS_FILE = path.join(OUTPUT_DIR, 'commit-tetris.svg');

async function main() {
  const isDemo = process.argv.includes('--demo');
  const username = process.env.GITHUB_ACTOR || 'OKOLIMO-Joseph';

  console.log(`[commit-breakout] Initializing Codebreaker engine (${isDemo ? 'DEMO MODE' : `LIVE USER: ${username}`})...`);

  let calendar;
  if (isDemo) {
    calendar = generateDemoContributions();
    console.log(`[commit-breakout] Generated synthetic demo contributions: ${calendar.totalContributions} commits.`);
  } else {
    try {
      calendar = await fetchGitHubContributions(username);
      console.log(`[commit-breakout] Successfully retrieved contribution data from GitHub GraphQL.`);
    } catch (err) {
      console.error(`[commit-breakout] WARNING: Failed to fetch live GitHub contributions: ${err.message}`);

      // Graceful error handling: if an existing generated file already exists, preserve it!
      if (fs.existsSync(BREAKOUT_FILE) && fs.statSync(BREAKOUT_FILE).size > 1000) {
        console.warn(`[commit-breakout] Preserving existing ${BREAKOUT_FILE} to avoid breaking public README.`);
        process.exit(0);
      }

      console.log(`[commit-breakout] No existing asset found. Falling back to synthetic demo data...`);
      calendar = generateDemoContributions();
    }
  }

  const normalized = normalizeContributionData(calendar);
  console.log(`[commit-breakout] Normalized ${normalized.numWeeks} weeks (${normalized.stats.totalContributions} total commits, ${normalized.stats.activeDays} active days).`);

  const svgContent = renderBreakoutSvg(normalized, { username });

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Write both primary breakout asset and backwards-compatible asset
  fs.writeFileSync(BREAKOUT_FILE, svgContent, 'utf-8');
  fs.writeFileSync(TETRIS_FILE, svgContent, 'utf-8');

  const fileSizeKb = (Buffer.byteLength(svgContent, 'utf-8') / 1024).toFixed(1);
  console.log(`[commit-breakout] SUCCESS: Written ${BREAKOUT_FILE} (${fileSizeKb} KB).`);
}

main().catch(err => {
  console.error('[commit-breakout] FATAL ERROR:', err);
  process.exit(1);
});
