/**
 * High-contrast cybersecurity / Tetris color palette mapped by contribution level (0-4).
 * Designed for maximum visibility against dark terminal backgrounds.
 */
const PALETTE = {
  // Level 0: Empty matrix slot
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
  // Level 3: High activity (Cobalt Pulse)
  3: {
    fill: '#4f46e5',
    stroke: '#818cf8',
    line: '#a5b4fc'
  },
  // Level 4: Hyper-activity (Neon Cyan / Line Clear)
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
 * Generates an animated, responsive, high-contrast SVG representation of GitHub contributions.
 * Uses native SMIL animations (<animateTransform>, <animate>) for reliable rendering inside GitHub Camo.
 * Blocks are guaranteed visible by default (no opacity: 0 traps).
 */
export function renderTetrisSvg(normalized, options = {}) {
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
  const startY = 82;
  const loopDuration = options.duration || 8; // 8-second repeating cycle

  let baseGridSvg = '';
  let activeBlocksSvg = '';

  for (let c = 0; c < numWeeks; c++) {
    const colX = Math.round(startX + c * cellPitch);

    for (let r = 0; r < 7; r++) {
      const cell = grid[r][c];
      const y = Math.round(startY + r * cellPitch);
      const score = cell.score;

      // 1. Static base slot
      baseGridSvg += `<rect x="${colX}" y="${y}" width="${cellSize}" height="${cellSize}" rx="2" fill="${PALETTE[0].fill}" stroke="${PALETTE[0].stroke}" stroke-width="0.8" opacity="0.7"/>\n`;

      // 2. Active contribution block
      if (score > 0) {
        const palette = PALETTE[score];
        const countTooltip = `${cell.count} contribution${cell.count === 1 ? '' : 's'} on ${cell.date || 'date'}`;
        // Delay calculated so blocks drop in a wave from left to right
        const dropDelay = ((c / numWeeks) * (loopDuration * 0.45) + (r * 0.04)).toFixed(2);

        // SMIL <animateTransform> drops the block into position then locks it in place
        activeBlocksSvg += `
        <g transform="translate(${colX}, ${y})">
          <title>${escapeXml(countTooltip)}</title>
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,-75; 0,0; 0,-3; 0,0; 0,0; 0,0"
              keyTimes="0; 0.18; 0.22; 0.26; 0.92; 1"
              dur="${loopDuration}s"
              begin="${dropDelay}s"
              repeatCount="indefinite"
            />
            <rect x="0" y="0" width="${cellSize}" height="${cellSize}" rx="2" fill="${palette.fill}" stroke="${palette.stroke}" stroke-width="1.2" />
            <line x1="2" y1="2" x2="${cellSize - 2}" y2="2" stroke="${palette.line}" stroke-width="0.8" stroke-opacity="0.8" />
          </g>
        </g>`;
      }
    }
  }

  // Animated falling Tetromino pieces (I, O, T, L) that drop over active columns
  const tetrominoesSvg = `
    <!-- Falling T-Tetromino -->
    <g>
      <animateTransform
        attributeName="transform"
        type="translate"
        values="${startX + 28 * cellPitch},25; ${startX + 28 * cellPitch},${startY + 3 * cellPitch}"
        keyTimes="0; 1"
        dur="3.2s"
        begin="0.5s"
        repeatCount="indefinite"
      />
      <animate attributeName="opacity" values="0; 1; 1; 0" keyTimes="0; 0.15; 0.85; 1" dur="3.2s" begin="0.5s" repeatCount="indefinite" />
      <rect x="0" y="0" width="${cellSize}" height="${cellSize}" rx="2" fill="#818cf8" stroke="#ffffff" stroke-width="0.8" />
      <rect x="${cellPitch}" y="0" width="${cellSize}" height="${cellSize}" rx="2" fill="#818cf8" stroke="#ffffff" stroke-width="0.8" />
      <rect x="${cellPitch * 2}" y="0" width="${cellSize}" height="${cellSize}" rx="2" fill="#818cf8" stroke="#ffffff" stroke-width="0.8" />
      <rect x="${cellPitch}" y="${cellPitch}" width="${cellSize}" height="${cellSize}" rx="2" fill="#818cf8" stroke="#ffffff" stroke-width="0.8" />
    </g>

    <!-- Falling I-Tetromino -->
    <g>
      <animateTransform
        attributeName="transform"
        type="translate"
        values="${startX + 44 * cellPitch},20; ${startX + 44 * cellPitch},${startY + 2 * cellPitch}"
        keyTimes="0; 1"
        dur="2.8s"
        begin="2s"
        repeatCount="indefinite"
      />
      <animate attributeName="opacity" values="0; 1; 1; 0" keyTimes="0; 0.15; 0.85; 1" dur="2.8s" begin="2s" repeatCount="indefinite" />
      <rect x="0" y="0" width="${cellSize}" height="${cellSize}" rx="2" fill="#00f2fe" stroke="#ffffff" stroke-width="0.8" />
      <rect x="0" y="${cellPitch}" width="${cellSize}" height="${cellSize}" rx="2" fill="#00f2fe" stroke="#ffffff" stroke-width="0.8" />
      <rect x="0" y="${cellPitch * 2}" width="${cellSize}" height="${cellSize}" rx="2" fill="#00f2fe" stroke="#ffffff" stroke-width="0.8" />
      <rect x="0" y="${cellPitch * 3}" width="${cellSize}" height="${cellSize}" rx="2" fill="#00f2fe" stroke="#ffffff" stroke-width="0.8" />
    </g>

    <!-- Falling O-Tetromino -->
    <g>
      <animateTransform
        attributeName="transform"
        type="translate"
        values="${startX + 14 * cellPitch},30; ${startX + 14 * cellPitch},${startY + 4 * cellPitch}"
        keyTimes="0; 1"
        dur="3.6s"
        begin="4s"
        repeatCount="indefinite"
      />
      <animate attributeName="opacity" values="0; 1; 1; 0" keyTimes="0; 0.15; 0.85; 1" dur="3.6s" begin="4s" repeatCount="indefinite" />
      <rect x="0" y="0" width="${cellSize}" height="${cellSize}" rx="2" fill="#facc15" stroke="#ffffff" stroke-width="0.8" />
      <rect x="${cellPitch}" y="0" width="${cellSize}" height="${cellSize}" rx="2" fill="#facc15" stroke="#ffffff" stroke-width="0.8" />
      <rect x="0" y="${cellPitch}" width="${cellSize}" height="${cellSize}" rx="2" fill="#facc15" stroke="#ffffff" stroke-width="0.8" />
      <rect x="${cellPitch}" y="${cellPitch}" width="${cellSize}" height="${cellSize}" rx="2" fill="#facc15" stroke="#ffffff" stroke-width="0.8" />
    </g>
  `;

  // Weekday indicators
  const weekdaysSvg = `
    <text x="${startX - 12}" y="${startY + 0 * cellPitch + 9.5}" text-anchor="end" class="matrix-label">SUN</text>
    <text x="${startX - 12}" y="${startY + 2 * cellPitch + 9.5}" text-anchor="end" class="matrix-label">TUE</text>
    <text x="${startX - 12}" y="${startY + 4 * cellPitch + 9.5}" text-anchor="end" class="matrix-label">THU</text>
    <text x="${startX - 12}" y="${startY + 6 * cellPitch + 9.5}" text-anchor="end" class="matrix-label">SAT</text>
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
    <text x="16" y="8" class="terminal-title">// COMMIT TETRIS</text>
    <text x="162" y="8" class="badge-sub">v2.4 [CONTRIBUTION MATRIX]</text>

    <!-- Top Right Telemetry Stats -->
    <text x="${svgWidth - 48}" y="8" text-anchor="end" class="stats-text">
      TOTAL: <tspan class="stats-val">${totalContributions}</tspan> COMMITS  |  ACTIVE: <tspan class="stats-val">${activeDays}</tspan> DAYS  |  STREAK: <tspan class="stats-val">${longestStreak}</tspan> DAYS
    </text>
  </g>

  <!-- Subtle Matrix Baseline / Guard Rails -->
  <line x1="${startX - 20}" y1="55" x2="${startX + gridWidth + 20}" y2="55" stroke="#1e293b" stroke-width="0.8" stroke-dasharray="4,4" />

  <!-- Weekday Labels -->
  <g>${weekdaysSvg}</g>

  <!-- Base Grid (Empty Cells) -->
  <g id="base-grid">${baseGridSvg}</g>

  <!-- Active Contribution Blocks (Always Visible + Falling Drop Wave) -->
  <g id="active-blocks">${activeBlocksSvg}</g>

  <!-- Dynamic Falling Tetrominoes -->
  <g id="falling-tetrominoes">${tetrominoesSvg}</g>

  <!-- Bottom Matrix Baseline -->
  <line x1="${startX - 20}" y1="${startY + 7 * cellPitch + 6}" x2="${startX + gridWidth + 20}" y2="${startY + 7 * cellPitch + 6}" stroke="#1e293b" stroke-width="0.8" stroke-dasharray="4,4" />

  <!-- Footer Technical Strip: Buffer & Intensity Legend -->
  <g transform="translate(24, ${svgHeight - 24})">
    <text x="0" y="8" class="legend-text" fill="#64748b">
      BUFFER: [ <tspan fill="#00f2fe">I</tspan> · <tspan fill="#38bdf8">T</tspan> · <tspan fill="#818cf8">Z</tspan> · <tspan fill="#10b981">L</tspan> · <tspan fill="#facc15">O</tspan> ]
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
