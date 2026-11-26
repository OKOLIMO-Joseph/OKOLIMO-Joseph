import { execSync } from 'node:child_process';

const GRAPHQL_QUERY = `
query($username: String!) {
  user(login: $username) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            contributionLevel
            weekday
          }
        }
      }
    }
  }
}
`;

/**
 * Generates realistic synthetic contribution calendar data for local demo testing.
 * @returns {object} Calendar object with totalContributions and 53 weeks of data.
 */
export function generateDemoContributions() {
  const weeks = [];
  const today = new Date();
  let totalContributions = 0;

  // Generate 53 weeks (371 days) back from today
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 370);

  for (let w = 0; w < 53; w++) {
    const contributionDays = [];
    for (let d = 0; d < 7; d++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + (w * 7 + d));

      // Realistic coding distribution: higher during weekdays, bursts of activity
      const isWeekend = d === 0 || d === 6;
      const seed = (Math.sin(w * 0.4 + d * 0.8) + 1) / 2;
      let count = 0;
      let level = 'NONE';

      if (seed > 0.45 && !isWeekend) {
        if (seed > 0.88) {
          count = Math.floor(10 + seed * 16);
          level = 'FOURTH_QUARTILE';
        } else if (seed > 0.72) {
          count = Math.floor(6 + seed * 8);
          level = 'THIRD_QUARTILE';
        } else if (seed > 0.58) {
          count = Math.floor(3 + seed * 5);
          level = 'SECOND_QUARTILE';
        } else {
          count = Math.floor(1 + seed * 3);
          level = 'FIRST_QUARTILE';
        }
      } else if (seed > 0.8 && isWeekend) {
        count = Math.floor(1 + seed * 4);
        level = 'FIRST_QUARTILE';
      }

      totalContributions += count;
      contributionDays.push({
        date: currentDate.toISOString().split('T')[0],
        contributionCount: count,
        contributionLevel: level,
        weekday: d
      });
    }
    weeks.push({ contributionDays });
  }

  return {
    totalContributions,
    weeks
  };
}

/**
 * Fetches real contribution data from GitHub GraphQL API.
 * Uses process.env.GITHUB_TOKEN if present, or falls back to local `gh auth token` / `gh api`.
 * @param {string} username GitHub username
 * @returns {Promise<object>} GitHub contributionCalendar object
 */
export async function fetchGitHubContributions(username = 'OKOLIMO-Joseph') {
  let token = process.env.GITHUB_TOKEN;

  // Fallback to local gh CLI token if environment variable is not explicitly set
  if (!token) {
    try {
      token = execSync('gh auth token', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
    } catch {
      // gh CLI token not available
    }
  }

  if (token) {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'OKOLIMO-Joseph-Commit-Tetris',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: GRAPHQL_QUERY,
        variables: { username }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`GitHub GraphQL API request failed (${res.status}): ${errText}`);
    }

    const payload = await res.json();
    if (payload.errors && payload.errors.length > 0) {
      throw new Error(`GraphQL Errors: ${payload.errors.map(e => e.message).join(', ')}`);
    }

    const calendar = payload.data?.user?.contributionsCollection?.contributionCalendar;
    if (!calendar) {
      throw new Error(`Could not find contributionCalendar for user "${username}"`);
    }

    return calendar;
  }

  // If no token, attempt gh api graphql CLI command directly
  try {
    const cmd = `gh api graphql -f query='${GRAPHQL_QUERY.replace(/\s+/g, ' ')}' -F username="${username}"`;
    const output = execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
    const payload = JSON.parse(output);
    const calendar = payload.data?.user?.contributionsCollection?.contributionCalendar;
    if (calendar) return calendar;
  } catch (err) {
    // Both direct fetch and gh CLI failed
  }

  throw new Error(
    'No GitHub token found. Please set GITHUB_TOKEN environment variable, authenticate with `gh auth login`, or run with `--demo`.'
  );
}
