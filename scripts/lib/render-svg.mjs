/**
 * High-contrast cybersecurity & software engineering palette mapped by contribution level (0-4).
 * Vibrant neon-tinted bricks optimized for dark backgrounds.
 */
const PALETTE = {
  // Level 0: Empty brick slot
  0: {
    fill: '#0f172a',
    stroke: '#1e293b',
    line: '#334155'
  },
  // Level 1: Low activity (Deep Emerald)
  1: {
    fill: '#064e3b',
    stroke: '#10b981',
    line: '#34d399'
  },
  // Level 2: Moderate activity (Electric Teal)
  2: {
    fill: '#0284c7',
    stroke: '#38bdf8',
    line: '#7dd3fc'
  },
  // Level 3: High activity (Cobalt / Indigo Pulse)
  3: {
    fill: '#4f46e5',
    stroke: '#818cf8',
    line: '#a5b4fc'
  },
  // Level 4: Hyper-activity / Brick Breaker Critical (Neon Cyan)
  4: {
    fill: '#00f2fe',
    stroke: '#ffffff',
    line: '#e0f2fe'
  }
};

function escapeXml(str) {
  if (typeof str !== 'string') return String(str);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generates an animated, responsive, high-contrast SVG representation of GitHub contributions
 * themed as a classic arcade Breakout / Codebreaker game.
 * Uses native SMIL animations (<animateTransform>, <animate>) for reliable rendering on GitHub.
 */
export function renderBreakoutSvg(normalized, options = {}) {
  const { grid, stats, numWeeks } = normalized;
  const username = options.username || 'OKOLIMO-Joseph';
  const totalContributions = stats.totalContributions || 0;
  const activeDays = stats.activeDays || 0;
  const longestStreak = stats.longestStreak || 0;

  const svgWidth = 920;
  const svgHeight = 280;
  const cellPitch = 15.2;
  const cellSize = 12;
  const gridWidth = numWeeks * cellPitch - (cellPitch - cellSize);
  const startX = Math.round((svgWidth - gridWidth) / 2);
  const startY = 74;
  const paddleY = 234;
  const cycleTime = 10; // 10-second looping ball/paddle rally

  let baseGridSvg = '';
  let activeBricksSvg = '';

  for (let c = 0; c < numWeeks; c++) {
    const colX = Math.round(startX + c * cellPitch);

    for (let r = 0; r < 7; r++) {
      const cell = grid[r][c];
      const y = Math.round(startY + r * cellPitch);
      const score = cell.score;

      // 1. Static base slot (empty matrix grid)
      baseGridSvg += `<rect x="${colX}" y="${y}" width="${cellSize}" height="${cellSize}" rx="2" fill="${PALETTE[0].fill}" stroke="${PALETTE[0].stroke}" stroke-width="0.8" opacity="0.6"/>\n`;

      // 2. Active contribution brick
      if (score > 0) {
        const palette = PALETTE[score];
        const countTooltip = `${cell.count} contribution${cell.count === 1 ? '' : 's'} on ${cell.date || 'date'}`;
        const pulseDelay = ((c / numWeeks) * 4 + r * 0.1).toFixed(2);

        activeBricksSvg += `
        <g transform="translate(${colX}, ${y})">
          <title>${escapeXml(countTooltip)}</title>
          <rect x="0" y="0" width="${cellSize}" height="${cellSize}" rx="2" fill="${palette.fill}" stroke="${palette.stroke}" stroke-width="1.2">
            <animate attributeName="opacity" values="0.85;1;0.9;1" dur="4s" begin="${pulseDelay}s" repeatCount="indefinite" />
          </rect>
          <line x1="2" y1="2" x2="${cellSize - 2}" y2="2" stroke="${palette.line}" stroke-width="0.8" stroke-opacity="0.8" />
        </g>`;
      }
    }
  }

  // Weekday indicators for Sun (0), Tue (2), Thu (4), Sat (6)
  const weekdaysSvg = `
    <text x="${startX - 12}" y="${startY + 0 * cellPitch + 9.5}" text-anchor="end" class="matrix-label">SUN</text>
    <text x="${startX - 12}" y="${startY + 2 * cellPitch + 9.5}" text-anchor="end" class="matrix-label">TUE</text>
    <text x="${startX - 12}" y="${startY + 4 * cellPitch + 9.5}" text-anchor="end" class="matrix-label">THU</text>
    <text x="${startX - 12}" y="${startY + 6 * cellPitch + 9.5}" text-anchor="end" class="matrix-label">SAT</text>
  `;

  // Animated Breakout Paddle (synchronizes horizontal intercept positions)
  // Rebounds at 0s, 3.6s, 6.8s, 10s
  const paddlePath = `
    ${startX + 140},${paddleY};
    ${startX + 320},${paddleY};
    ${startX + 500},${paddleY};
    ${startX + 440},${paddleY};
    ${startX + 620},${paddleY};
    ${startX + 280},${paddleY};
    ${startX + 100},${paddleY};
    ${startX + 140},${paddleY}
  `;

  // Animated Bouncing Energy Orb (Calculated realistic ricochets off paddle, ceiling, and walls)
  const ballPath = `
    ${startX + 175},${paddleY - 4};
    ${startX + 310},130;
    ${startX + 460},60;
    ${startX + 590},140;
    ${startX + 475},${paddleY - 4};
    ${startX + 680},120;
    ${startX + 780},160;
    ${startX + 315},${paddleY - 4};
    ${startX + 180},110;
    ${startX + 80},150;
    ${startX + 175},${paddleY - 4}
  `;

  return `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="100%" height="100%">
  <defs>
    <linearGradient id="panel-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#070a12" />
      <stop offset="50%" stop-color="#0b0f19" />
      <stop offset="100%" stop-color="#050811" />
    </linearGradient>

    <linearGradient id="header-line" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00f2fe" stop-opacity="0.9" />
      <stop offset="50%" stop-color="#3b82f6" stop-opacity="0.6" />
      <stop offset="100%" stop-color="#6366f1" stop-opacity="0.1" />
    </linearGradient>

    <linearGradient id="paddle-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00f2fe" />
      <stop offset="50%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#3b82f6" />
    </linearGradient>

    <radialGradient id="ball-glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="60%" stop-color="#00f2fe" />
      <stop offset="100%" stop-color="#0284c7" stop-opacity="0" />
    </radialGradient>

    <filter id="subtle-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2.5" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <style>
    .terminal-title {
      font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
      font-size: 13px;
      font-weight: 700;
      fill: #e2e8f0;
      letter-spacing: 0.8px;
    }
    .badge-sub {
      font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
      font-size: 11px;
      font-weight: 600;
      fill: #00f2fe;
      letter-spacing: 0.5px;
    }
    .stats-text {
      font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
      font-size: 11px;
      font-weight: 500;
      fill: #94a3b8;
    }
    .stats-val {
      font-weight: 700;
      fill: #38bdf8;
    }
    .matrix-label {
      font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
      font-size: 8.5px;
      font-weight: 600;
      fill: #64748b;
      letter-spacing: 0.5px;
    }
    .legend-text {
      font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
      font-size: 9.5px;
      fill: #94a3b8;
    }
  </style>

  <!-- Outer Card Frame with Technical Border -->
  <rect x="1" y="1" width="${svgWidth - 2}" height="${svgHeight - 2}" rx="10" fill="url(#panel-bg)" stroke="#1e293b" stroke-width="1.2" />

  <!-- Top Accent Stripe -->
  <rect x="2" y="2" width="${svgWidth - 4}" height="3" rx="1.5" fill="url(#header-line)" />

  <!-- Technical Header Strip -->
  <g transform="translate(24, 28)">
    <rect x="0" y="0" width="8" height="8" rx="1.5" fill="#00f2fe" filter="url(#subtle-glow)" />
    <text x="16" y="8" class="terminal-title">// COMMIT BREAKOUT</text>
    <text x="178" y="8" class="badge-sub">v3.0 [CODEBREAKER ENGINE]</text>

    <!-- Top Right Telemetry Stats -->
    <text x="${svgWidth - 48}" y="8" text-anchor="end" class="stats-text">
      COMMITS: <tspan class="stats-val">${totalContributions}</tspan>  |  DAYS: <tspan class="stats-val">${activeDays}</tspan>  |  STREAK: <tspan class="stats-val">${longestStreak}</tspan>D  |  PADDLE: <tspan class="stats-val">ACTIVE</tspan>
    </text>
  </g>

  <!-- Upper Wall / Boundary Rail -->
  <line x1="${startX - 20}" y1="52" x2="${startX + gridWidth + 20}" y2="52" stroke="#1e293b" stroke-width="1" stroke-dasharray="4,4" />

  <!-- Weekday Labels -->
  <g>${weekdaysSvg}</g>

  <!-- Base Grid (Empty Bricks) -->
  <g id="base-grid">${baseGridSvg}</g>

  <!-- Active Contribution Bricks (Always Visible Heatmap) -->
  <g id="active-bricks">${activeBricksSvg}</g>

  <!-- Paddle Motion Track -->
  <line x1="${startX - 20}" y1="${paddleY + 12}" x2="${startX + gridWidth + 20}" y2="${paddleY + 12}" stroke="#1e293b" stroke-width="1" stroke-dasharray="3,3" />

  <!-- Dynamic Animated Paddle -->
  <g id="breakout-paddle">
    <animateTransform
      attributeName="transform"
      type="translate"
      values="${paddlePath.replace(/\s+/g, ' ').trim()}"
      keyTimes="0; 0.18; 0.35; 0.52; 0.68; 0.82; 0.94; 1"
      dur="${cycleTime}s"
      repeatCount="indefinite"
    />
    <rect x="0" y="0" width="70" height="7" rx="3.5" fill="url(#paddle-grad)" stroke="#ffffff" stroke-width="0.8" filter="url(#subtle-glow)" />
    <line x1="10" y1="3.5" x2="60" y2="3.5" stroke="#ffffff" stroke-width="1" stroke-linecap="round" />
  </g>

  <!-- Dynamic Animated Energy Orb (Bouncing Ball) -->
  <g id="breakout-ball">
    <animateTransform
      attributeName="transform"
      type="translate"
      values="${ballPath.replace(/\s+/g, ' ').trim()}"
      keyTimes="0; 0.10; 0.19; 0.27; 0.36; 0.46; 0.53; 0.68; 0.79; 0.87; 1"
      dur="${cycleTime}s"
      repeatCount="indefinite"
    />
    <!-- Energy Core & Outer Glow -->
    <circle cx="0" cy="0" r="7" fill="url(#ball-glow)" opacity="0.4" />
    <circle cx="0" cy="0" r="4" fill="#ffffff" stroke="#00f2fe" stroke-width="1.5" filter="url(#subtle-glow)" />
  </g>

  <!-- Footer Technical Strip: Controls & Intensity Legend -->
  <g transform="translate(24, ${svgHeight - 20})">
    <text x="0" y="8" class="legend-text" fill="#64748b">
      DEFLECTION ENGINE: [ <tspan fill="#00f2fe">BALL: 1.2M OPS/S</tspan> · <tspan fill="#38bdf8">ANGLE: DYNAMIC</tspan> · <tspan fill="#10b981">RALLY: CONTINUOUS</tspan> ]
    </text>

    <g transform="translate(${svgWidth - 280}, 0)">
      <text x="-8" y="8" text-anchor="end" class="legend-text">LESS</text>
      <rect x="0" y="-1" width="10" height="10" rx="1.5" fill="${PALETTE[0].fill}" stroke="${PALETTE[0].stroke}" stroke-width="0.8" />
      <rect x="14" y="-1" width="10" height="10" rx="1.5" fill="${PALETTE[1].fill}" stroke="${PALETTE[1].stroke}" stroke-width="0.8" />
      <rect x="28" y="-1" width="10" height="10" rx="1.5" fill="${PALETTE[2].fill}" stroke="${PALETTE[2].stroke}" stroke-width="0.8" />
      <rect x="42" y="-1" width="10" height="10" rx="1.5" fill="${PALETTE[3].fill}" stroke="${PALETTE[3].stroke}" stroke-width="0.8" />
      <rect x="56" y="-1" width="10" height="10" rx="1.5" fill="${PALETTE[4].fill}" stroke="${PALETTE[4].stroke}" stroke-width="0.8" />
      <text x="74" y="8" class="legend-text">MORE ACTIVITY</text>
    </g>
  </g>
</svg>
`;
}
