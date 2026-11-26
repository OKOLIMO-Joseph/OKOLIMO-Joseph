/**
 * Maps GitHub contribution levels to integer intensity scores (0-4).
 * @param {string} level 
 * @returns {number}
 */
export function levelToScore(level) {
  switch (level) {
    case 'FOURTH_QUARTILE': return 4;
    case 'THIRD_QUARTILE': return 3;
    case 'SECOND_QUARTILE': return 2;
    case 'FIRST_QUARTILE': return 1;
    case 'NONE':
    default: return 0;
  }
}

/**
 * Normalizes contribution calendar data into a standard 2D matrix (53 columns x 7 rows).
 * @param {object} calendarRaw Raw contributionCalendar from GitHub GraphQL API
 * @returns {object} Normalized grid and contribution statistics
 */
export function normalizeContributionData(calendarRaw) {
  if (!calendarRaw || !Array.isArray(calendarRaw.weeks)) {
    throw new Error('Invalid calendar payload: missing weeks array');
  }

  const rawWeeks = calendarRaw.weeks;
  const numWeeks = rawWeeks.length;
  const grid = []; // 7 rows (days 0-6), each row has numWeeks columns

  for (let row = 0; row < 7; row++) {
    grid[row] = [];
  }

  let totalCount = 0;
  let activeDays = 0;
  let maxDailyCount = 0;
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Flatten days in chronological order to calculate streaks
  const flatDays = [];

  for (let col = 0; col < numWeeks; col++) {
    const week = rawWeeks[col];
    const days = week.contributionDays || [];

    // Weekdays in GitHub are 0 (Sun) to 6 (Sat)
    for (let row = 0; row < 7; row++) {
      const dayData = days.find(d => d.weekday === row);

      if (dayData) {
        const count = Number(dayData.contributionCount) || 0;
        const score = levelToScore(dayData.contributionLevel);
        const cell = {
          date: dayData.date,
          weekday: row,
          weekIndex: col,
          count,
          score,
          active: count > 0
        };

        grid[row][col] = cell;
        flatDays.push(cell);

        totalCount += count;
        if (count > 0) activeDays++;
        if (count > maxDailyCount) maxDailyCount = count;
      } else {
        // Empty placeholder day (e.g. week begins mid-month or future day)
        grid[row][col] = {
          date: null,
          weekday: row,
          weekIndex: col,
          count: 0,
          score: 0,
          active: false
        };
      }
    }
  }

  // Calculate streaks from flat chronological days
  for (const day of flatDays) {
    if (day.count > 0) {
      tempStreak++;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    } else {
      tempStreak = 0;
    }
  }
  currentStreak = tempStreak;

  // Tetris statistics breakdown
  const levelCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < numWeeks; c++) {
      const score = grid[r][c].score;
      levelCounts[score] = (levelCounts[score] || 0) + 1;
    }
  }

  return {
    numWeeks,
    numDays: 7,
    grid,
    stats: {
      totalContributions: calendarRaw.totalContributions ?? totalCount,
      activeDays,
      maxDailyCount,
      currentStreak,
      longestStreak,
      levelCounts
    }
  };
}
