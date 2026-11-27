import test from 'node:test';
import assert from 'node:assert/strict';
import { generateDemoContributions } from '../scripts/lib/fetch-contributions.mjs';
import { normalizeContributionData } from '../scripts/lib/normalize-data.mjs';
import { renderBreakoutSvg } from '../scripts/lib/render-svg.mjs';

test('renderBreakoutSvg generates valid SVG markup with Breakout gameplay elements', () => {
  const demo = generateDemoContributions();
  const normalized = normalizeContributionData(demo);
  const svg = renderBreakoutSvg(normalized);

  assert.ok(svg.startsWith('<?xml'), 'SVG should start with XML declaration');
  assert.ok(svg.includes('<svg xmlns="http://www.w3.org/2000/svg"'), 'Should contain standard SVG namespace');
  assert.ok(svg.includes('viewBox="0 0 920 280"'), 'Should have correct viewBox');
  assert.ok(svg.includes('</svg>'), 'Should have closing svg tag');

  // Verify technical elements
  assert.ok(svg.includes('// COMMIT BREAKOUT'), 'Should include title');
  assert.ok(svg.includes('breakout-paddle'), 'Should render animated paddle');
  assert.ok(svg.includes('breakout-ball'), 'Should render animated energy orb');
  assert.ok(svg.includes('<animateTransform'), 'Should embed SMIL vector animations');

  // Negative security check: no raw script tags
  assert.ok(!svg.includes('<script'), 'SVG must NOT contain raw script tags for GitHub safety');
});
