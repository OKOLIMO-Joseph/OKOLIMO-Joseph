import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchGitHubContributions, generateDemoContributions } from './lib/fetch-contributions.mjs';
import { normalizeContributionData } from './lib/normalize-data.mjs';
import { renderGitGraphSvg } from './lib/render-svg.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(REPO_ROOT, 'generated');
const GITGRAPH_FILE = path.join(OUTPUT_DIR, 'commit-gitgraph.svg');

async function main() {
  const isDemo = process.argv.includes('--demo');
  const username = process.env.GITHUB_ACTOR || 'OKOLIMO-Joseph';

  console.log(`[commit-gitgraph] Initializing Git Graph & Merge Tree engine (${isDemo ? 'DEMO MODE' : `LIVE USER: ${username}`})...`);

  let calendar;
  if (isDemo) {
    calendar = generateDemoContributions();
    console.log(`[commit-gitgraph] Generated synthetic demo contributions: ${calendar.totalContributions} commits.`);
  } else {
    try {
      calendar = await fetchGitHubContributions(username);
      console.log(`[commit-gitgraph] Successfully retrieved contribution data from GitHub GraphQL.`);
    } catch (err) {
      console.error(`[commit-gitgraph] WARNING: Failed to fetch live GitHub contributions: ${err.message}`);

      // Graceful error handling: preserve existing asset
      if (fs.existsSync(GITGRAPH_FILE) && fs.statSync(GITGRAPH_FILE).size > 1000) {
        console.warn(`[commit-gitgraph] Preserving existing asset to avoid breaking public README.`);
        process.exit(0);
      }

      console.log(`[commit-gitgraph] Falling back to synthetic demo data...`);
      calendar = generateDemoContributions();
    }
  }

  const normalized = normalizeContributionData(calendar);
  console.log(`[commit-gitgraph] Normalized ${normalized.numWeeks} weeks (${normalized.stats.totalContributions} total commits, ${normalized.stats.activeDays} active days).`);

  const svgContent = renderGitGraphSvg(normalized, { username });

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Write single canonical Git Graph asset
  fs.writeFileSync(GITGRAPH_FILE, svgContent, 'utf-8');

  const fileSizeKb = (Buffer.byteLength(svgContent, 'utf-8') / 1024).toFixed(1);
  console.log(`[commit-gitgraph] SUCCESS: Written ${GITGRAPH_FILE} (${fileSizeKb} KB).`);
}

main().catch(err => {
  console.error('[commit-gitgraph] FATAL ERROR:', err);
  process.exit(1);
});
