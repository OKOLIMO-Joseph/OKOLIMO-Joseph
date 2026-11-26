import test from 'node:test';
import assert from 'node:assert/strict';
import { generateDemoContributions } from '../scripts/lib/fetch-contributions.mjs';
import { normalizeContributionData } from '../scripts/lib/normalize-data.mjs';
import { renderGitGraphSvg } from '../scripts/lib/render-svg.mjs';

test('renderGitGraphSvg generates valid SVG markup with Git branches, commit nodes, and merge curves', () => {
  const demo = generateDemoContributions();
  const normalized = normalizeContributionData(demo);
  const svg = renderGitGraphSvg(normalized);

  assert.ok(svg.startsWith('<?xml'), 'SVG should start with XML declaration');
  assert.ok(svg.includes('<svg xmlns="http://www.w3.org/2000/svg"'), 'Should contain standard SVG namespace');
  assert.ok(svg.includes('viewBox="0 0 920 310"'), 'Should have correct viewBox');
  assert.ok(svg.includes('</svg>'), 'Should have closing svg tag');

  // Verify technical elements
  assert.ok(svg.includes('// GIT GRAPH'), 'Should include title');
  assert.ok(svg.includes('track-main'), 'Should render main trunk');
  assert.ok(svg.includes('track-hoscover'), 'Should render hoscover branch');
  assert.ok(svg.includes('track-docwiser'), 'Should render docwiser branch');
  assert.ok(svg.includes('micro-heatmap'), 'Should render micro heatmap');
  assert.ok(svg.includes('<animateMotion'), 'Should embed SMIL branch flow animations');

  // Negative security check: no raw script tags
  assert.ok(!svg.includes('<script'), 'SVG must NOT contain raw script tags for GitHub safety');
});
