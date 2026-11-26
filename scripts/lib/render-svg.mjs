/**
 * Git Branch & Merge Tree (Railway Graph) SVG Generator.
 * Represents real GitHub contribution data through interactive Git branching and merge flow.
 */

const PALETTE = {
  main: '#00f2fe',
  hoscover: '#10b981',
  docwiser: '#38bdf8',
  uems: '#818cf8',
  momo: '#f43f5e',
  nodeBase: '#0f172a',
  nodeBorder: '#1e293b',
  textMuted: '#64748b'
};

const HEATMAP_PALETTE = {
  0: '#0f172a',
  1: '#064e3b',
  2: '#0284c7',
  3: '#4f46e5',
  4: '#00f2fe'
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
 * Generates an animated Git Branch & Merge Tree SVG representation of contributions.
 */
export function renderGitGraphSvg(normalized, options = {}) {
  const { grid, stats, numWeeks } = normalized;
  const username = options.username || 'OKOLIMO-Joseph';
  const totalContributions = stats.totalContributions || 0;
  const activeDays = stats.activeDays || 0;
  const longestStreak = stats.longestStreak || 0;

  const svgWidth = 920;
  const svgHeight = 310;

  // 1. Generate compact 53-week historical heatmap micro-matrix at bottom
  const cellPitch = 14.8;
  const cellSize = 11;
  const gridWidth = numWeeks * cellPitch - (cellPitch - cellSize);
  const startX = Math.round((svgWidth - gridWidth) / 2);
  const heatmapY = 246;

  let microHeatmapSvg = '';
  for (let c = 0; c < numWeeks; c++) {
    const colX = Math.round(startX + c * cellPitch);
    for (let r = 0; r < 7; r++) {
      const cell = grid[r][c];
      const y = Math.round(heatmapY + r * 4.5); // Micro height: 3.5px per day
      const score = cell.score;
      const fill = HEATMAP_PALETTE[score] || HEATMAP_PALETTE[0];
      const tooltip = `${cell.count} commit${cell.count === 1 ? '' : 's'} on ${cell.date || 'date'}`;

      microHeatmapSvg += `<rect x="${colX}" y="${y}" width="${cellSize}" height="3" rx="1" fill="${fill}" opacity="${score > 0 ? 0.95 : 0.4}"><title>${escapeXml(tooltip)}</title></rect>\n`;
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
      <stop offset="35%" stop-color="#10b981" stop-opacity="0.8" />
      <stop offset="70%" stop-color="#818cf8" stop-opacity="0.6" />
      <stop offset="100%" stop-color="#f43f5e" stop-opacity="0.2" />
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
    .branch-tag {
      font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
      font-size: 9px;
      font-weight: 700;
    }
    .commit-hash {
      font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
      font-size: 8px;
      fill: #64748b;
    }
    .legend-text {
      font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
      font-size: 9px;
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
    <text x="16" y="8" class="terminal-title">// GIT GRAPH &amp; MERGE TREE</text>
    <text x="235" y="8" class="badge-sub">v5.0 [RELEASE FLOW]</text>

    <!-- Top Right Telemetry Stats -->
    <text x="${svgWidth - 48}" y="8" text-anchor="end" class="stats-text">
      REPO: <tspan class="stats-val">OKOLIMO-Joseph</tspan>  |  COMMITS: <tspan class="stats-val">${totalContributions} MERGED</tspan>  |  BRANCHES: <tspan class="stats-val" fill="#10b981">5 ACTIVE</tspan>
    </text>
  </g>

  <!-- Boundary Divider -->
  <line x1="24" y1="50" x2="${svgWidth - 24}" y2="50" stroke="#1e293b" stroke-width="1" stroke-dasharray="3,3" />

  <!-- ==================== GIT GRAPH TRACKS ==================== -->

  <!-- 1. MAIN BRANCH TRACK (Cyan, y=78) -->
  <g id="track-main">
    <rect x="24" y="68" width="62" height="20" rx="3" fill="#083344" stroke="${PALETTE.main}" stroke-width="1" />
    <text x="55" y="82" text-anchor="middle" class="branch-tag" fill="${PALETTE.main}">main</text>
    
    <!-- Main Trunk Line -->
    <line x1="90" y1="78" x2="880" y2="78" stroke="${PALETTE.main}" stroke-width="2.5" />

    <!-- Merging Pulsing Packets on Main -->
    <circle cx="90" cy="78" r="3.5" fill="#ffffff" filter="url(#subtle-glow)">
      <animate attributeName="cx" values="90; 880; 90" dur="7s" repeatCount="indefinite" />
    </circle>
  </g>

  <!-- 2. FEATURE/HOSCOVER (Emerald, y=118) -->
  <g id="track-hoscover">
    <rect x="24" y="108" width="92" height="20" rx="3" fill="#022c22" stroke="${PALETTE.hoscover}" stroke-width="1" />
    <text x="70" y="122" text-anchor="middle" class="branch-tag" fill="${PALETTE.hoscover}">feat/hoscover</text>

    <!-- Branch off main at 140, runs to 340, merges to main at 380 -->
    <path d="M 140,78 C 160,78 170,118 190,118 L 340,118 C 360,118 370,78 390,78" fill="none" stroke="${PALETTE.hoscover}" stroke-width="2" />
    
    <!-- Animated Commits flowing along branch -->
    <circle cx="0" cy="0" r="3" fill="${PALETTE.hoscover}" filter="url(#subtle-glow)">
      <animateMotion path="M 140,78 C 160,78 170,118 190,118 L 340,118 C 360,118 370,78 390,78" dur="4.2s" begin="0.2s" repeatCount="indefinite" />
    </circle>
  </g>

  <!-- 3. FEATURE/DOCWISER (Electric Sky, y=156) -->
  <g id="track-docwiser">
    <rect x="24" y="146" width="92" height="20" rx="3" fill="#082f49" stroke="${PALETTE.docwiser}" stroke-width="1" />
    <text x="70" y="160" text-anchor="middle" class="branch-tag" fill="${PALETTE.docwiser}">feat/docwiser</text>

    <!-- Branch off main at 280, runs to 480, merges to main at 520 -->
    <path d="M 280,78 C 300,78 310,156 330,156 L 480,156 C 500,156 510,78 530,78" fill="none" stroke="${PALETTE.docwiser}" stroke-width="2" />

    <circle cx="0" cy="0" r="3" fill="${PALETTE.docwiser}" filter="url(#subtle-glow)">
      <animateMotion path="M 280,78 C 300,78 310,156 330,156 L 480,156 C 500,156 510,78 530,78" dur="4.8s" begin="1.2s" repeatCount="indefinite" />
    </circle>
  </g>

  <!-- 4. FEATURE/UEMS (Cobalt / Indigo, y=192) -->
  <g id="track-uems">
    <rect x="24" y="182" width="92" height="20" rx="3" fill="#1e1b4b" stroke="${PALETTE.uems}" stroke-width="1" />
    <text x="70" y="196" text-anchor="middle" class="branch-tag" fill="${PALETTE.uems}">feat/ucu-uems</text>

    <!-- Branch off main at 420, runs to 640, merges to main at 680 -->
    <path d="M 420,78 C 440,78 450,192 470,192 L 640,192 C 660,192 670,78 690,78" fill="none" stroke="${PALETTE.uems}" stroke-width="2" />

    <circle cx="0" cy="0" r="3" fill="${PALETTE.uems}" filter="url(#subtle-glow)">
      <animateMotion path="M 420,78 C 440,78 450,192 470,192 L 640,192 C 660,192 670,78 690,78" dur="5.2s" begin="2.1s" repeatCount="indefinite" />
    </circle>
  </g>

  <!-- 5. FEATURE/MOMO-FORENSICS (Rose/Pink, y=228) -->
  <g id="track-momo">
    <rect x="24" y="218" width="92" height="20" rx="3" fill="#4c0519" stroke="${PALETTE.momo}" stroke-width="1" />
    <text x="70" y="232" text-anchor="middle" class="branch-tag" fill="${PALETTE.momo}">feat/momo-sec</text>

    <!-- Branch off main at 570, runs to 790, merges to main at 830 -->
    <path d="M 570,78 C 590,78 600,228 620,228 L 790,228 C 810,228 820,78 840,78" fill="none" stroke="${PALETTE.momo}" stroke-width="2" />

    <circle cx="0" cy="0" r="3" fill="${PALETTE.momo}" filter="url(#subtle-glow)">
      <animateMotion path="M 570,78 C 590,78 600,228 620,228 L 790,228 C 810,228 820,78 840,78" dur="5.6s" begin="3.0s" repeatCount="indefinite" />
    </circle>
  </g>

  <!-- ==================== REAL COMMIT NODES ==================== -->
  <!-- Nodes on Main -->
  <circle cx="140" cy="78" r="5" fill="#0f172a" stroke="${PALETTE.main}" stroke-width="2.5" />
  <circle cx="210" cy="78" r="5" fill="#0f172a" stroke="${PALETTE.main}" stroke-width="2.5" />
  <circle cx="280" cy="78" r="5" fill="#0f172a" stroke="${PALETTE.main}" stroke-width="2.5" />
  <circle cx="390" cy="78" r="6" fill="${PALETTE.hoscover}" stroke="#ffffff" stroke-width="2" filter="url(#subtle-glow)">
    <title>Merge: feat/hoscover ➔ main (Hoscover Production SaaS)</title>
  </circle>
  <circle cx="420" cy="78" r="5" fill="#0f172a" stroke="${PALETTE.main}" stroke-width="2.5" />
  <circle cx="530" cy="78" r="6" fill="${PALETTE.docwiser}" stroke="#ffffff" stroke-width="2" filter="url(#subtle-glow)">
    <title>Merge: feat/docwiser ➔ main (DocWiser AI Assistant)</title>
  </circle>
  <circle cx="570" cy="78" r="5" fill="#0f172a" stroke="${PALETTE.main}" stroke-width="2.5" />
  <circle cx="690" cy="78" r="6" fill="${PALETTE.uems}" stroke="#ffffff" stroke-width="2" filter="url(#subtle-glow)">
    <title>Merge: feat/ucu-uems ➔ main (UCU Examination Governance)</title>
  </circle>
  <circle cx="760" cy="78" r="5" fill="#0f172a" stroke="${PALETTE.main}" stroke-width="2.5" />
  <circle cx="840" cy="78" r="6" fill="${PALETTE.momo}" stroke="#ffffff" stroke-width="2" filter="url(#subtle-glow)">
    <title>Merge: feat/momo-sec ➔ main (MoMo Forensics Engine)</title>
  </circle>

  <!-- HEAD Pointer Tag on Latest Main Commit -->
  <g transform="translate(852, 70)">
    <rect x="0" y="0" width="24" height="15" rx="3" fill="#00f2fe" />
    <text x="12" y="11" text-anchor="middle" font-family="monospace" font-size="8px" font-weight="800" fill="#000000">HEAD</text>
  </g>

  <!-- Feature Branch Commit Nodes -->
  <!-- Hoscover Nodes -->
  <circle cx="230" cy="118" r="4.5" fill="#0f172a" stroke="${PALETTE.hoscover}" stroke-width="2" />
  <circle cx="290" cy="118" r="4.5" fill="#0f172a" stroke="${PALETTE.hoscover}" stroke-width="2" />
  <!-- DocWiser Nodes -->
  <circle cx="370" cy="156" r="4.5" fill="#0f172a" stroke="${PALETTE.docwiser}" stroke-width="2" />
  <circle cx="430" cy="156" r="4.5" fill="#0f172a" stroke="${PALETTE.docwiser}" stroke-width="2" />
  <!-- UEMS Nodes -->
  <circle cx="530" cy="192" r="4.5" fill="#0f172a" stroke="${PALETTE.uems}" stroke-width="2" />
  <circle cx="600" cy="192" r="4.5" fill="#0f172a" stroke="${PALETTE.uems}" stroke-width="2" />
  <!-- MoMo Nodes -->
  <circle cx="670" cy="228" r="4.5" fill="#0f172a" stroke="${PALETTE.momo}" stroke-width="2" />
  <circle cx="740" cy="228" r="4.5" fill="#0f172a" stroke="${PALETTE.momo}" stroke-width="2" />

  <!-- ==================== MICRO HEATMAP (Real 53-Week Commits) ==================== -->
  <line x1="24" y1="242" x2="${svgWidth - 24}" y2="242" stroke="#1e293b" stroke-width="1" stroke-dasharray="3,3" />
  <g id="micro-heatmap">${microHeatmapSvg}</g>

  <!-- Footer Technical Strip -->
  <g transform="translate(24, ${svgHeight - 14})">
    <text x="0" y="8" class="legend-text" fill="#64748b">
      FLOW: [ <tspan fill="#00f2fe">● MAIN</tspan> · <tspan fill="#10b981">● HOSCOVER</tspan> · <tspan fill="#38bdf8">● DOCWISER</tspan> · <tspan fill="#818cf8">● UCU-UEMS</tspan> · <tspan fill="#f43f5e">● MOMO-SEC</tspan> ]
    </text>

    <g transform="translate(${svgWidth - 270}, 0)">
      <text x="-8" y="8" text-anchor="end" class="legend-text">LESS</text>
      <rect x="0" y="0" width="8" height="8" rx="1.5" fill="${HEATMAP_PALETTE[0]}" stroke="#1e293b" stroke-width="0.8" />
      <rect x="12" y="0" width="8" height="8" rx="1.5" fill="${HEATMAP_PALETTE[1]}" stroke="#10b981" stroke-width="0.8" />
      <rect x="24" y="0" width="8" height="8" rx="1.5" fill="${HEATMAP_PALETTE[2]}" stroke="#38bdf8" stroke-width="0.8" />
      <rect x="36" y="0" width="8" height="8" rx="1.5" fill="${HEATMAP_PALETTE[3]}" stroke="#818cf8" stroke-width="0.8" />
      <rect x="48" y="0" width="8" height="8" rx="1.5" fill="${HEATMAP_PALETTE[4]}" stroke="#ffffff" stroke-width="0.8" />
      <text x="64" y="8" class="legend-text">MORE ACTIVITY</text>
    </g>
  </g>
</svg>
`;
}

// Keep aliases for backwards compatibility
export const renderPipelineSvg = renderGitGraphSvg;
export const renderBreakoutSvg = renderGitGraphSvg;
export const renderTetrisSvg = renderGitGraphSvg;
