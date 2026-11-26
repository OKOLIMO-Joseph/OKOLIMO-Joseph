import test from 'node:test';
import assert from 'node:assert/strict';
import { generateDemoContributions } from '../scripts/lib/fetch-contributions.mjs';
import { normalizeContributionData } from '../scripts/lib/normalize-data.mjs';
import { renderPipelineSvg } from '../scripts/lib/render-svg.mjs';

test('renderPipelineSvg generates valid SVG markup with CI/CD stages and scanline', () => {
  const demo = generateDemoContributions();
  const normalized = normalizeContributionData(demo);
  const svg = renderPipelineSvg(normalized);

  assert.ok(svg.startsWith('<?xml'), 'SVG should start with XML declaration');
  assert.ok(svg.includes('<svg xmlns="http://www.w3.org/2000/svg"'), 'Should contain standard SVG namespace');
  assert.ok(svg.includes('viewBox="0 0 920 310"'), 'Should have correct viewBox');
  assert.ok(svg.includes('</svg>'), 'Should have closing svg tag');

  // Verify technical elements
  assert.ok(svg.includes('// CI/CD PIPELINE MATRIX'), 'Should include title');
  assert.ok(svg.includes('pipeline-stages'), 'Should render pipeline stage track');
  assert.ok(svg.includes('scanline'), 'Should render telemetry laser scanline');
  assert.ok(svg.includes('<animate'), 'Should embed SMIL vector animations');

  // Negative security check: no raw script tags
  assert.ok(!svg.includes('<script'), 'SVG must NOT contain raw script tags for GitHub safety');
});
