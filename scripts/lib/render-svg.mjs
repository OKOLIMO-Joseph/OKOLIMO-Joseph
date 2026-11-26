/**
 * CI/CD Pipeline & Build Matrix color palette.
 * Colors represent automated pipeline status and deployment throughput.
 */
const PALETTE = {
  // Level 0: Idle / Skipped
  0: {
    fill: '#0f172a',
    stroke: '#1e293b',
    line: '#334155'
  },
  // Level 1: Light build (Lint / Unit tests passed)
  1: {
    fill: '#064e3b',
    stroke: '#10b981',
    line: '#34d399'
  },
  // Level 2: Moderate build (Integration & API suites passed)
  2: {
    fill: '#0284c7',
    stroke: '#38bdf8',
    line: '#7dd3fc'
  },
  // Level 3: Heavy build (Full end-to-end + Security scan passed)
  3: {
    fill: '#4f46e5',
    stroke: '#818cf8',
    line: '#a5b4fc'
  },
  // Level 4: Release deployment (Docker build & Cloud Run production deploy)
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
 * Generates an automated, responsive CI/CD Pipeline & Build Matrix SVG representation
 * of GitHub contributions.
 * Incorporates automated workflow stages, telemetry metrics, and a scanning deployment beam.
 */
export function renderPipelineSvg(normalized, options = {}) {
  const { grid, stats, numWeeks } = normalized;
  const username = options.username || 'OKOLIMO-Joseph';
  const totalContributions = stats.totalContributions || 0;
  const activeDays = stats.activeDays || 0;
  const longestStreak = stats.longestStreak || 0;

  const svgWidth = 920;
  const svgHeight = 310;
  const cellPitch = 15.2;
  const cellSize = 12;
  const gridWidth = numWeeks * cellPitch - (cellPitch - cellSize);
  const startX = Math.round((svgWidth - gridWidth) / 2);
  const startY = 122;

  let baseGridSvg = '';
  let activeBuildsSvg = '';

  for (let c = 0; c < numWeeks; c++) {
    const colX = Math.round(startX + c * cellPitch);

    for (let r = 0; r < 7; r++) {
      const cell = grid[r][c];
      const y = Math.round(startY + r * cellPitch);
      const score = cell.score;

      // 1. Static base slot (idle pipeline slot)
      baseGridSvg += `<rect x="${colX}" y="${y}" width="${cellSize}" height="${cellSize}" rx="2" fill="${PALETTE[0].fill}" stroke="${PALETTE[0].stroke}" stroke-width="0.8" opacity="0.6"/>\n`;

      // 2. Active build pipeline execution
      if (score > 0) {
        const palette = PALETTE[score];
        const countTooltip = `Build #${c * 7 + r + 1}: ${cell.count} commit${cell.count === 1 ? '' : 's'} on ${cell.date || 'date'} [PASSED]`;
        const pulseDelay = ((c / numWeeks) * 3 + r * 0.08).toFixed(2);

        activeBuildsSvg += `
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

  // Top CI/CD Stage Badges across the horizontal workflow track
  const stages = [
    { name: '1. LINT & TYPECHECK', status: 'PASS', color: '#10b981' },
    { name: '2. TEST SUITE', status: 'PASS', color: '#10b981' },
    { name: '3. SAST & SEC-AUDIT', status: 'PASS', color: '#38bdf8' },
    { name: '4. DOCKER BUILD', status: 'PASS', color: '#818cf8' },
    { name: '5. CLOUD RUN DEPLOY', status: 'LIVE', color: '#00f2fe' }
  ];

  const stageWidth = 146;
  const stageGap = 20;
  const stagesStartX = Math.round((svgWidth - (stages.length * stageWidth + (stages.length - 1) * stageGap)) / 2);

  let stagesSvg = '';
  for (let i = 0; i < stages.length; i++) {
    const s = stages[i];
    const x = stagesStartX + i * (stageWidth + stageGap);
    stagesSvg += `
      <!-- Stage ${i + 1} -->
      <g transform="translate(${x}, 58)">
        <rect x="0" y="0" width="${stageWidth}" height="28" rx="4" fill="#0d1424" stroke="#1e293b" stroke-width="1" />
        <rect x="0" y="0" width="3" height="28" rx="1.5" fill="${s.color}" />
        <text x="10" y="18" class="stage-name">${s.name}</text>
        <rect x="${stageWidth - 42}" y="6" width="34" height="16" rx="3" fill="#064e3b" stroke="${s.color}" stroke-width="0.8" />
        <text x="${stageWidth - 25}" y="17.5" text-anchor="middle" class="stage-status" fill="${s.color}">✓ ${s.status}</text>
      </g>
    `;

    // Connector arrow with animated data packet pulse
    if (i < stages.length - 1) {
      const arrowX = x + stageWidth + 3;
      stagesSvg += `
        <line x1="${arrowX}" y1="72" x2="${arrowX + 14}" y2="72" stroke="#334155" stroke-width="1.5" stroke-dasharray="2,2" />
        <!-- Data Packet Pulse -->
        <circle cx="0" cy="72" r="2.5" fill="#00f2fe">
          <animate attributeName="cx" values="${arrowX}; ${arrowX + 14}" dur="1.8s" begin="${(i * 0.35).toFixed(2)}s" repeatCount="indefinite" />
        </circle>
      `;
    }
  }

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
      <stop offset="50%" stop-color="#10b981" stop-opacity="0.6" />
      <stop offset="100%" stop-color="#6366f1" stop-opacity="0.1" />
    </linearGradient>

    <linearGradient id="scan-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#00f2fe" stop-opacity="0" />
      <stop offset="50%" stop-color="#00f2fe" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#00f2fe" stop-opacity="0" />
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
      fill: #10b981;
      letter-spacing: 0.5px;
    }
    .stage-name {
      font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
      font-size: 9px;
      font-weight: 600;
      fill: #cbd5e1;
    }
    .stage-status {
      font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
      font-size: 8px;
      font-weight: 700;
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
    <rect x="0" y="0" width="8" height="8" rx="1.5" fill="#10b981" filter="url(#subtle-glow)" />
    <text x="16" y="8" class="terminal-title">// CI/CD PIPELINE MATRIX</text>
    <text x="215" y="8" class="badge-sub">v4.2 [DEPLOYMENT RUNNER]</text>

    <!-- Top Right Telemetry Stats -->
    <text x="${svgWidth - 48}" y="8" text-anchor="end" class="stats-text">
      BRANCH: <tspan class="stats-val">main</tspan>  |  JOBS: <tspan class="stats-val">${totalContributions} PASSED</tspan>  |  STREAK: <tspan class="stats-val">${longestStreak}D</tspan>  |  HEALTH: <tspan class="stats-val" fill="#10b981">99.4%</tspan>
    </text>
  </g>

  <!-- Horizontal Pipeline Stages Track -->
  <g id="pipeline-stages">${stagesSvg}</g>

  <!-- Upper Grid Divider -->
  <line x1="${startX - 20}" y1="102" x2="${startX + gridWidth + 20}" y2="102" stroke="#1e293b" stroke-width="1" stroke-dasharray="3,3" />

  <!-- Weekday Labels -->
  <g>${weekdaysSvg}</g>

  <!-- Base Grid (Idle / Empty Slots) -->
  <g id="base-grid">${baseGridSvg}</g>

  <!-- Active Pipeline Runs (Guaranteed Visible Heatmap) -->
  <g id="active-builds">${activeBuildsSvg}</g>

  <!-- Continuous Laser Telemetry Scanline -->
  <g id="scanline">
    <line x1="0" y1="${startY - 6}" x2="0" y2="${startY + 7 * cellPitch + 6}" stroke="url(#scan-gradient)" stroke-width="2" filter="url(#subtle-glow)">
      <animate attributeName="x1" values="${startX - 10}; ${startX + gridWidth + 10}; ${startX - 10}" dur="9s" repeatCount="indefinite" />
      <animate attributeName="x2" values="${startX - 10}; ${startX + gridWidth + 10}; ${startX - 10}" dur="9s" repeatCount="indefinite" />
    </line>
  </g>

  <!-- Lower Boundary Rail -->
  <line x1="${startX - 20}" y1="${startY + 7 * cellPitch + 6}" x2="${startX + gridWidth + 20}" y2="${startY + 7 * cellPitch + 6}" stroke="#1e293b" stroke-width="1" stroke-dasharray="3,3" />

  <!-- Footer Technical Strip: Controls & Intensity Legend -->
  <g transform="translate(24, ${svgHeight - 18})">
    <text x="0" y="8" class="legend-text" fill="#64748b">
      TELEMETRY: [ <tspan fill="#10b981">RUNNER: ACTIVE</tspan> · <tspan fill="#00f2fe">CONTAINERS: GCP CLOUD RUN</tspan> · <tspan fill="#38bdf8">POLICY: ZERO-DEFECT</tspan> ]
    </text>

    <g transform="translate(${svgWidth - 280}, 0)">
      <text x="-8" y="8" text-anchor="end" class="legend-text">IDLE</text>
      <rect x="0" y="-1" width="10" height="10" rx="1.5" fill="${PALETTE[0].fill}" stroke="${PALETTE[0].stroke}" stroke-width="0.8" />
      <rect x="14" y="-1" width="10" height="10" rx="1.5" fill="${PALETTE[1].fill}" stroke="${PALETTE[1].stroke}" stroke-width="0.8" />
      <rect x="28" y="-1" width="10" height="10" rx="1.5" fill="${PALETTE[2].fill}" stroke="${PALETTE[2].stroke}" stroke-width="0.8" />
      <rect x="42" y="-1" width="10" height="10" rx="1.5" fill="${PALETTE[3].fill}" stroke="${PALETTE[3].stroke}" stroke-width="0.8" />
      <rect x="56" y="-1" width="10" height="10" rx="1.5" fill="${PALETTE[4].fill}" stroke="${PALETTE[4].stroke}" stroke-width="0.8" />
      <text x="74" y="8" class="legend-text">HIGH THROUGHPUT</text>
    </g>
  </g>
</svg>
`;
}

// Keep backwards-compatible alias for any existing code
export const renderTetrisSvg = renderPipelineSvg;
export const renderBreakoutSvg = renderPipelineSvg;
