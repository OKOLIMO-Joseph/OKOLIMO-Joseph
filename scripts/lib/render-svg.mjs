/**
 * Cybersecurity / Technical Tetris color scheme mapped by intensity level (0-4).
 */
const PALETTE = {
  // Empty matrix slot
  0: {
    fill: '#101623',
    stroke: '#1e293b',
    glow: 'none'
  },
  // Level 1: Low activity (Deep Emerald / Cyan)
  1: {
    fill: '#064e3b',
    stroke: '#059669',
    glow: 'rgba(5, 150, 105, 0.4)'
  },
  // Level 2: Moderate activity (Electric Teal / Sky)
  2: {
    fill: '#0284c7',
    stroke: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.5)'
  },
  // Level 3: High activity (Cobalt / Indigo Pulse)
  3: {
    fill: '#4f46e5',
    stroke: '#818cf8',
    glow: 'rgba(129, 140, 248, 0.6)'
  },
  // Level 4: Hyper-activity / Tetris Line Clear (Neon Cyan / High Contrast)
  4: {
    fill: '#00f2fe',
    stroke: '#e0f2fe',
    glow: 'rgba(0, 242, 254, 0.85)'
  }
};

/**
 * Escapes XML strings for safe SVG attribute and text insertion.
 * @param {string} str 
 * @returns {string}
 */
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
 * Generates an animated, responsive, high-contrast SVG representation of GitHub contributions.
 * @param {object} normalized Normalized data from normalizeContributionData
 * @param {object} options Optional configurations (e.g. animationDuration, username)
 * @returns {string} Standalone SVG XML string
 */
export function renderTetrisSvg(normalized, options = {}) {
  const { grid, stats, numWeeks } = normalized;
  const username = options.username || 'OKOLIMO-Joseph';
  const totalContributions = stats.totalContributions || 0;
  const activeDays = stats.activeDays || 0;
  const maxDayCount = stats.maxDailyCount || 0;
  const longestStreak = stats.longestStreak || 0;

  const svgWidth = 920;
  const svgHeight = 275;
  const cellPitch = 15.2; // cell width + gap
  const cellSize = 12;
  const gridWidth = numWeeks * cellPitch - (cellPitch - cellSize);
  const startX = Math.round((svgWidth - gridWidth) / 2);
  const startY = 82;
  const animCycle = options.duration || 10; // 10 second animation loop

  // Pre-generate SVG blocks
  let baseGridSvg = '';
  let activeFallingBlocksSvg = '';

  for (let c = 0; c < numWeeks; c++) {
    const colX = Math.round(startX + c * cellPitch);

    for (let r = 0; r < 7; r++) {
      const cell = grid[r][c];
      const y = Math.round(startY + r * cellPitch);
      const score = cell.score;

      // 1. Static base slot (always visible as the background matrix grid)
      baseGridSvg += `<rect x="${colX}" y="${y}" width="${cellSize}" height="${cellSize}" rx="2" fill="${PALETTE[0].fill}" stroke="${PALETTE[0].stroke}" stroke-width="0.8" opacity="0.6"/>\n`;

      // 2. Active falling contribution block
      if (score > 0) {
        const palette = PALETTE[score];
        // Stagger delays based on column and row to simulate falling Tetris drops
        // Drops cascade left-to-right across the weeks
        const delay = ((c / numWeeks) * (animCycle * 0.58) + (r * 0.05)).toFixed(2);
        const countTooltip = `${cell.count} contribution${cell.count === 1 ? '' : 's'} on ${cell.date || 'date'}`;

        activeFallingBlocksSvg += `
        <g class="block-anim block-c${c}-r${r}" style="animation-delay: ${delay}s;" transform="translate(${colX}, ${y})">
          <title>${escapeXml(countTooltip)}</title>
          <rect x="0" y="0" width="${cellSize}" height="${cellSize}" rx="2" fill="${palette.fill}" stroke="${palette.stroke}" stroke-width="1.2"/>
          <line x1="2" y1="2" x2="${cellSize - 2}" y2="2" stroke="${palette.stroke}" stroke-width="0.8" stroke-opacity="0.7"/>
        </g>`;
      }
    }
  }

  // Weekday indicators for Sun (0), Tue (2), Thu (4)
  const weekdaysSvg = `
    <text x="${startX - 12}" y="${startY + 0 * cellPitch + 9.5}" text-anchor="end" class="matrix-label">SUN</text>
    <text x="${startX - 12}" y="${startY + 2 * cellPitch + 9.5}" text-anchor="end" class="matrix-label">TUE</text>
    <text x="${startX - 12}" y="${startY + 4 * cellPitch + 9.5}" text-anchor="end" class="matrix-label">THU</text>
    <text x="${startX - 12}" y="${startY + 6 * cellPitch + 9.5}" text-anchor="end" class="matrix-label">SAT</text>
  `;

  // SVG Assembly with full CSS Keyframe animation embedded
  return `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="100%" height="100%">
  <defs>
    <linearGradient id="panel-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#070a12" />
      <stop offset="50%" stop-color="#0b0f19" />
      <stop offset="100%" stop-color="#050811" />
    </linearGradient>

    <linearGradient id="header-line" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00f2fe" stop-opacity="0.8" />
      <stop offset="50%" stop-color="#3b82f6" stop-opacity="0.5" />
      <stop offset="100%" stop-color="#6366f1" stop-opacity="0.1" />
    </linearGradient>

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
      fill: #475569;
      letter-spacing: 0.5px;
    }
    .legend-text {
      font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
      font-size: 9.5px;
      fill: #64748b;
    }

    /* Falling Tetris Animation */
    .block-anim {
      transform-box: fill-box;
      transform-origin: center;
      opacity: 0;
      animation-name: tetrisDrop;
      animation-duration: ${animCycle}s;
      animation-iteration-count: infinite;
      animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
    }

    @keyframes tetrisDrop {
      0% {
        opacity: 0;
        transform: translate(0, -60px) scale(0.9);
      }
      3% {
        opacity: 0.9;
      }
      8% {
        opacity: 1;
        transform: translate(0, 0px) scale(1);
      }
      9.5% {
        transform: translate(0, -2.5px) scale(1.04);
      }
      11% {
        transform: translate(0, 0px) scale(1);
      }
      /* Settle on grid until cycle completes */
      88% {
        opacity: 1;
        filter: brightness(1);
      }
      93% {
        opacity: 0.7;
        filter: brightness(1.2);
      }
      97% {
        opacity: 0;
        transform: translate(0, 0px);
      }
      100% {
        opacity: 0;
        transform: translate(0, -60px);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .block-anim {
        animation: none !important;
        opacity: 1 !important;
        transform: none !important;
      }
    }
  </style>

  <!-- Outer Card Frame with Technical Border -->
  <rect x="1" y="1" width="${svgWidth - 2}" height="${svgHeight - 2}" rx="10" fill="url(#panel-bg)" stroke="#1e293b" stroke-width="1.2" />

  <!-- Top Accent Stripe -->
  <rect x="2" y="2" width="${svgWidth - 4}" height="3" rx="1.5" fill="url(#header-line)" />

  <!-- Technical Header Strip -->
  <g transform="translate(24, 28)">
    <!-- Terminal Prompt Icon -->
    <rect x="0" y="0" width="8" height="8" rx="1.5" fill="#00f2fe" filter="url(#subtle-glow)" />
    <text x="16" y="8" class="terminal-title">// COMMIT TETRIS</text>
    <text x="162" y="8" class="badge-sub">v2.4 [CONTRIBUTION MATRIX]</text>

    <!-- Top Right Telemetry Stats -->
    <text x="${svgWidth - 48}" y="8" text-anchor="end" class="stats-text">
      TOTAL: <tspan class="stats-val">${totalContributions}</tspan> COMMITS  |  ACTIVE: <tspan class="stats-val">${activeDays}</tspan> DAYS  |  STREAK: <tspan class="stats-val">${longestStreak}</tspan> DAYS
    </text>
  </g>

  <!-- Subtle Matrix Baseline / Guard Rails -->
  <line x1="${startX - 20}" y1="52" x2="${startX + gridWidth + 20}" y2="52" stroke="#1e293b" stroke-width="0.8" stroke-dasharray="4,4" />

  <!-- Weekday Labels -->
  <g>${weekdaysSvg}</g>

  <!-- Base Grid (Empty Cells) -->
  <g id="base-grid">${baseGridSvg}</g>

  <!-- Animated Falling Tetris Blocks -->
  <g id="active-blocks">${activeFallingBlocksSvg}</g>

  <!-- Bottom Matrix Baseline -->
  <line x1="${startX - 20}" y1="${startY + 7 * cellPitch + 6}" x2="${startX + gridWidth + 20}" y2="${startY + 7 * cellPitch + 6}" stroke="#1e293b" stroke-width="0.8" stroke-dasharray="4,4" />

  <!-- Footer Technical Strip: Buffer & Intensity Legend -->
  <g transform="translate(24, ${svgHeight - 24})">
    <!-- Left: Tetromino Queue Indicator -->
    <text x="0" y="8" class="legend-text" fill="#475569">
      BUFFER: [ <tspan fill="#00f2fe">I</tspan> · <tspan fill="#38bdf8">T</tspan> · <tspan fill="#818cf8">Z</tspan> · <tspan fill="#059669">L</tspan> · <tspan fill="#0284c7">O</tspan> ]
    </text>

    <!-- Right: Activity Intensity Legend -->
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
