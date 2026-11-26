import test from 'node:test';
import assert from 'node:assert/strict';
import { generateDemoContributions } from '../scripts/lib/fetch-contributions.mjs';
import { normalizeContributionData, levelToScore } from '../scripts/lib/normalize-data.mjs';

test('levelToScore correctly maps quartile strings to 0-4 integers', () => {
  assert.equal(levelToScore('NONE'), 0);
  assert.equal(levelToScore('FIRST_QUARTILE'), 1);
  assert.equal(levelToScore('SECOND_QUARTILE'), 2);
  assert.equal(levelToScore('THIRD_QUARTILE'), 3);
  assert.equal(levelToScore('FOURTH_QUARTILE'), 4);
  assert.equal(levelToScore('UNKNOWN'), 0);
});

test('generateDemoContributions returns valid 53-week calendar structure', () => {
  const demo = generateDemoContributions();
  assert.ok(demo.totalContributions > 0, 'Total demo contributions should be > 0');
  assert.equal(demo.weeks.length, 53, 'Should produce exactly 53 weeks');
  assert.equal(demo.weeks[0].contributionDays.length, 7, 'Each week should have 7 days');
});

test('normalizeContributionData properly dimensions grid and aggregates statistics', () => {
  const demo = generateDemoContributions();
  const normalized = normalizeContributionData(demo);

  assert.equal(normalized.numWeeks, 53);
  assert.equal(normalized.numDays, 7);
  assert.equal(normalized.grid.length, 7, 'Grid should have 7 rows');
  assert.equal(normalized.grid[0].length, 53, 'Each row should have 53 columns');

  assert.ok(normalized.stats.totalContributions > 0);
  assert.ok(normalized.stats.activeDays > 0);
  assert.ok(normalized.stats.maxDailyCount > 0);
  assert.ok(typeof normalized.stats.longestStreak === 'number');
  assert.ok(normalized.stats.levelCounts[0] >= 0);
});

test('normalizeContributionData handles malformed data gracefully', () => {
  assert.throws(() => {
    normalizeContributionData(null);
  }, /Invalid calendar payload/);

  assert.throws(() => {
    normalizeContributionData({});
  }, /Invalid calendar payload/);
});
