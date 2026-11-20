import * as THREE from 'three';

function finalizeColorTexture(
  canvas: HTMLCanvasElement,
  maxAnisotropy: number,
): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.max(1, maxAnisotropy);
  tex.needsUpdate = true;
  return tex;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Central monitor IDE screen: deep cobalt-navy editor with crisp glowing cyan/white
 * syntax lines, file explorer sidebar, right minimap, and soft rounded glow vignette.
 */
export function createMainMonitorCodeTexture(
  maxAnisotropy: number,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 640;
  const ctx = canvas.getContext('2d')!;

  const bg = ctx.createLinearGradient(0, 0, 1024, 640);
  bg.addColorStop(0, '#041229');
  bg.addColorStop(0.5, '#061c3d');
  bg.addColorStop(1, '#04142e');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1024, 640);

  // Subtle internal cyan screen glow pool
  const innerGlow = ctx.createRadialGradient(460, 320, 40, 460, 320, 480);
  innerGlow.addColorStop(0, 'rgba(34, 211, 238, 0.14)');
  innerGlow.addColorStop(1, 'rgba(4, 18, 41, 0)');
  ctx.fillStyle = innerGlow;
  ctx.fillRect(0, 0, 1024, 640);

  // Top IDE header bar
  ctx.fillStyle = 'rgba(4, 16, 36, 0.88)';
  ctx.fillRect(0, 0, 1024, 38);
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 38);
  ctx.lineTo(1024, 38);
  ctx.stroke();

  const dots = ['#38bdf8', '#0ea5e9', '#f59e0b'];
  dots.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(22 + i * 16, 19, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = 'rgba(34, 211, 238, 0.18)';
  drawRoundedRect(ctx, 168, 7, 200, 24, 5);
  ctx.fill();
  ctx.font = '500 12.5px "JetBrains Mono", monospace';
  ctx.fillStyle = '#bae6fd';
  ctx.fillText('orchestrator.engine.ts', 182, 23);
  ctx.fillStyle = '#5a7ea3';
  ctx.fillText('vector.graph.ts', 392, 23);
  ctx.fillText('inference.ts', 536, 23);

  // Left sidebar explorer
  ctx.fillStyle = 'rgba(3, 13, 30, 0.72)';
  ctx.fillRect(0, 38, 162, 566);
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.2)';
  ctx.beginPath();
  ctx.moveTo(162, 38);
  ctx.lineTo(162, 604);
  ctx.stroke();

  const files = [
    'src/',
    '  core/',
    '    orchestrator.ts',
    '    planner.ts',
    '    embeddings.ts',
    '  agents/',
    '    router.ts',
    '    synthesizer.ts',
    '  runtime/',
    '    stream.ws.ts',
    '    cache.ts',
    '  eval/',
    '    verifier.ts',
  ];
  ctx.font = '400 11.5px "JetBrains Mono", monospace';
  files.forEach((f, i) => {
    const y = 68 + i * 26;
    if (i === 2) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.16)';
      ctx.fillRect(8, y - 14, 146, 20);
      ctx.fillStyle = '#7dd3fc';
    } else {
      ctx.fillStyle = f.endsWith('/') ? '#8cb4d9' : '#4a7096';
    }
    ctx.fillText(f, 16, y);
  });

  // Main high-contrast glowing syntax code lines
  const lines: Array<Array<{ t: string; c: string }>> = [
    [
      { t: 'export class ', c: '#38bdf8' },
      { t: 'NeuralOrchestrator', c: '#f0f9ff' },
      { t: ' {', c: '#7ea6cc' },
    ],
    [
      { t: '  private readonly ', c: '#38bdf8' },
      { t: 'index', c: '#e0f2fe' },
      { t: ': ', c: '#648bb0' },
      { t: 'HybridVectorIndex', c: '#fbbf24' },
      { t: ';', c: '#648bb0' },
    ],
    [
      { t: '  private readonly ', c: '#38bdf8' },
      { t: 'router', c: '#e0f2fe' },
      { t: ': ', c: '#648bb0' },
      { t: 'AdaptiveModelRouter', c: '#fbbf24' },
      { t: ';', c: '#648bb0' },
    ],
    [],
    [
      { t: '  async ', c: '#38bdf8' },
      { t: 'executeGraph', c: '#22d3ee' },
      { t: '(task: ', c: '#94b8db' },
      { t: 'TaskSpec', c: '#fbbf24' },
      { t: '): ', c: '#94b8db' },
      { t: 'Promise<Output>', c: '#7dd3fc' },
      { t: ' {', c: '#94b8db' },
    ],
    [
      { t: '    const ', c: '#38bdf8' },
      { t: 'ctx ', c: '#f0f9ff' },
      { t: '= await ', c: '#38bdf8' },
      { t: 'this.index.query', c: '#22d3ee' },
      { t: '(task.prompt, {', c: '#94b8db' },
    ],
    [
      { t: '      topK: ', c: '#bae6fd' },
      { t: '12', c: '#f59e0b' },
      { t: ', rerank: ', c: '#bae6fd' },
      { t: 'true', c: '#38bdf8' },
      { t: ', minScore: ', c: '#bae6fd' },
      { t: '0.84', c: '#f59e0b' },
    ],
    [{ t: '    });', c: '#94b8db' }],
    [],
    [
      { t: '    const ', c: '#38bdf8' },
      { t: 'dag ', c: '#f0f9ff' },
      { t: '= ', c: '#94b8db' },
      { t: 'compileExecutionPlan', c: '#22d3ee' },
      { t: '(task, ctx);', c: '#94b8db' },
    ],
    [
      { t: '    const ', c: '#38bdf8' },
      { t: 'futures ', c: '#f0f9ff' },
      { t: '= dag.stages.', c: '#94b8db' },
      { t: 'map', c: '#22d3ee' },
      { t: '((stage) =>', c: '#94b8db' },
    ],
    [
      { t: '      this.router.', c: '#e0f2fe' },
      { t: 'invoke', c: '#22d3ee' },
      { t: '(stage, { budgetMs: ', c: '#94b8db' },
      { t: '160', c: '#f59e0b' },
      { t: ' })', c: '#94b8db' },
    ],
    [{ t: '    );', c: '#94b8db' }],
    [],
    [
      { t: '    const ', c: '#38bdf8' },
      { t: 'verified ', c: '#f0f9ff' },
      { t: '= await ', c: '#38bdf8' },
      { t: 'Promise.all', c: '#7dd3fc' },
      { t: '(futures);', c: '#94b8db' },
    ],
    [
      { t: '    return ', c: '#38bdf8' },
      { t: 'synthesizeResponse', c: '#22d3ee' },
      { t: '(verified, task.schema);', c: '#94b8db' },
    ],
    [{ t: '  }', c: '#94b8db' }],
    [],
    [
      { t: '  public ', c: '#38bdf8' },
      { t: 'streamTelemetry', c: '#22d3ee' },
      { t: '(): ', c: '#94b8db' },
      { t: 'ClusterStats', c: '#fbbf24' },
      { t: ' {', c: '#94b8db' },
    ],
    [
      { t: '    return ', c: '#38bdf8' },
      { t: '{ rps: ', c: '#94b8db' },
      { t: '4820', c: '#f59e0b' },
      { t: ', p99Ms: ', c: '#94b8db' },
      { t: '38', c: '#22d3ee' },
      { t: ', healthy: ', c: '#94b8db' },
      { t: 'true', c: '#38bdf8' },
      { t: ' };', c: '#94b8db' },
    ],
    [{ t: '  }', c: '#94b8db' }],
    [{ t: '}', c: '#94b8db' }],
  ];

  // Active editor line highlight
  ctx.fillStyle = 'rgba(34, 211, 238, 0.14)';
  ctx.fillRect(164, 54 + 9 * 23, 728, 22);

  ctx.font = '400 13.5px "JetBrains Mono", monospace';
  lines.forEach((tokens, row) => {
    const y = 70 + row * 23;
    ctx.fillStyle = '#3c618a';
    ctx.fillText(String(row + 1).padStart(2, ' '), 176, y);
    let x = 212;
    for (const tok of tokens) {
      ctx.fillStyle = tok.c;
      ctx.fillText(tok.t, x, y);
      x += ctx.measureText(tok.t).width;
    }
  });

  // Right minimap / inspector
  ctx.fillStyle = 'rgba(4, 15, 34, 0.72)';
  ctx.fillRect(896, 38, 128, 566);
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
  ctx.beginPath();
  ctx.moveTo(896, 38);
  ctx.lineTo(896, 604);
  ctx.stroke();

  for (let i = 0; i < 44; i++) {
    const w = 24 + ((i * 41) % 72);
    ctx.fillStyle =
      i % 8 === 0
        ? 'rgba(245, 158, 11, 0.55)'
        : i % 3 === 0
          ? 'rgba(56, 189, 248, 0.62)'
          : 'rgba(186, 230, 253, 0.28)';
    ctx.fillRect(910, 56 + i * 11, w, 3.5);
  }

  // Bottom status bar
  ctx.fillStyle = 'rgba(3, 12, 28, 0.9)';
  ctx.fillRect(0, 604, 1024, 36);
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.35)';
  ctx.beginPath();
  ctx.moveTo(0, 604);
  ctx.lineTo(1024, 604);
  ctx.stroke();

  ctx.font = '500 12px "JetBrains Mono", monospace';
  ctx.fillStyle = '#7dd3fc';
  ctx.fillText('main  ·  TypeScript  ·  64 nodes synced', 20, 626);
  ctx.fillStyle = '#fbbf24';
  ctx.fillText('0 errors  ·  38ms p99', 832, 626);

  return finalizeColorTexture(canvas, maxAnisotropy);
}

/**
 * Translucent glass code panel content (rendered without heavy opaque box so the
 * custom SDF rounded-glass shader provides authentic glass + glowing rim).
 */
export function createLeftCodePanelTexture(
  maxAnisotropy: number,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 768;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 512, 768);

  // Subtle header divider
  ctx.fillStyle = 'rgba(56, 189, 248, 0.14)';
  ctx.fillRect(24, 22, 464, 34);
  ctx.font = '600 14px "JetBrains Mono", monospace';
  ctx.fillStyle = '#bae6fd';
  ctx.fillText('PIPELINE.TS · STREAM ENGINE', 38, 44);

  const lines = [
    { indent: 0, color: '#7dd3fc', text: 'const graph = createDAG({' },
    { indent: 1, color: '#e0f2fe', text: '  embed: "text-v4-hd",' },
    { indent: 1, color: '#fbbf24', text: '  precision: "fp16",' },
    { indent: 1, color: '#7dd3fc', text: '  shards: 16' },
    { indent: 0, color: '#94b8db', text: '});' },
    { indent: 0, color: '#38bdf8', text: 'graph.pipe(reranker)' },
    { indent: 1, color: '#e0f2fe', text: '  .branch(toolVerifier)' },
    { indent: 1, color: '#fbbf24', text: '  .timeout(140);' },
  ];

  ctx.font = '400 14px "JetBrains Mono", monospace';
  lines.forEach((l, i) => {
    ctx.fillStyle = l.color;
    ctx.fillText(l.text, 34 + l.indent * 10, 94 + i * 30);
  });

  // Ultra-clean luminous code token bars (echoing reference image left glass panel)
  for (let i = 0; i < 18; i++) {
    const y = 348 + i * 21;
    const indent = (i % 4) * 20;
    const w1 = 80 + ((i * 61) % 210);
    ctx.fillStyle =
      i % 5 === 0
        ? 'rgba(251, 191, 36, 0.88)'
        : i % 2 === 0
          ? 'rgba(125, 211, 252, 0.85)'
          : 'rgba(224, 242, 254, 0.7)';
    drawRoundedRect(ctx, 34 + indent, y, w1, 5, 2.5);
    ctx.fill();

    if (w1 < 220) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.42)';
      drawRoundedRect(ctx, 44 + indent + w1, y, 68, 5, 2.5);
      ctx.fill();
    }
  }

  return finalizeColorTexture(canvas, maxAnisotropy);
}

/**
 * Lower-left glowing glass software architecture flowchart (echoing reference schematic).
 */
export function createArchitectureDiagramTexture(
  maxAnisotropy: number,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 420;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 640, 420);

  // Delicate blueprint grid
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.14)';
  ctx.lineWidth = 1;
  for (let x = 36; x < 610; x += 36) {
    ctx.beginPath();
    ctx.moveTo(x, 24);
    ctx.lineTo(x, 396);
    ctx.stroke();
  }
  for (let y = 36; y < 396; y += 36) {
    ctx.beginPath();
    ctx.moveTo(24, y);
    ctx.lineTo(616, y);
    ctx.stroke();
  }

  ctx.font = '600 13.5px "JetBrains Mono", monospace';
  ctx.fillStyle = '#bae6fd';
  ctx.fillText('DISTRIBUTED AI ARCHITECTURE', 32, 46);

  const nodes = [
    { x: 48, y: 158, w: 112, h: 52, label: 'GATEWAY', stroke: '#7dd3fc' },
    { x: 238, y: 92, w: 132, h: 52, label: 'EMBEDDER', stroke: '#38bdf8' },
    { x: 238, y: 222, w: 132, h: 52, label: 'ROUTER', stroke: '#fbbf24' },
    { x: 454, y: 158, w: 126, h: 52, label: 'AGENTS', stroke: '#7dd3fc' },
    { x: 238, y: 318, w: 132, h: 46, label: 'EVALS', stroke: '#38bdf8' },
  ];

  // Luminous orthogonal traces
  ctx.strokeStyle = 'rgba(125, 211, 252, 0.85)';
  ctx.lineWidth = 2;
  const links: Array<[number, number, number, number]> = [
    [160, 184, 238, 118],
    [160, 184, 238, 248],
    [370, 118, 454, 184],
    [370, 248, 454, 184],
    [304, 274, 304, 318],
  ];
  for (const [x1, y1, x2, y2] of links) {
    const midX = (x1 + x2) * 0.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(midX, y1);
    ctx.lineTo(midX, y2);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.fillStyle = '#e0f2fe';
    ctx.beginPath();
    ctx.arc(midX, (y1 + y2) * 0.5, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const n of nodes) {
    ctx.fillStyle = 'rgba(6, 28, 60, 0.72)';
    drawRoundedRect(ctx, n.x, n.y, n.w, n.h, 8);
    ctx.fill();
    ctx.strokeStyle = n.stroke;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    ctx.font = '600 12px "JetBrains Mono", monospace';
    ctx.fillStyle = '#f0f9ff';
    ctx.fillText(n.label, n.x + 18, n.y + 30);
  }

  return finalizeColorTexture(canvas, maxAnisotropy);
}

/**
 * Upper-right dual-pane translucent glass panel: code lines on top, glowing
 * time-series throughput & latency visualization graph on the bottom (exact reference match).
 */
export function createRightMetricsPanelTexture(
  maxAnisotropy: number,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 576;
  canvas.height = 720;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 576, 720);

  ctx.fillStyle = 'rgba(56, 189, 248, 0.16)';
  ctx.fillRect(26, 24, 524, 32);
  ctx.font = '600 13.5px "JetBrains Mono", monospace';
  ctx.fillStyle = '#bae6fd';
  ctx.fillText('INFERENCE TELEMETRY · REAL-TIME', 40, 45);

  for (let i = 0; i < 12; i++) {
    const y = 84 + i * 24;
    const indent = (i % 3) * 18;
    const w = 110 + ((i * 73) % 245);
    ctx.fillStyle =
      i % 4 === 0
        ? 'rgba(251, 191, 36, 0.82)'
        : i % 2 === 0
          ? 'rgba(125, 211, 252, 0.84)'
          : 'rgba(224, 242, 254, 0.6)';
    drawRoundedRect(ctx, 32 + indent, y, w, 5.5, 2.75);
    ctx.fill();
  }

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(28, 392);
  ctx.lineTo(548, 392);
  ctx.stroke();

  ctx.font = '600 12.5px "JetBrains Mono", monospace';
  ctx.fillStyle = '#7dd3fc';
  ctx.fillText('TOKEN STREAM VELOCITY', 32, 422);

  const cx = 34;
  const cy = 446;
  const cw = 508;
  const ch = 224;

  // Grid
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.16)';
  ctx.lineWidth = 1;
  for (let r = 0; r <= 4; r++) {
    const y = cy + (ch / 4) * r;
    ctx.beginPath();
    ctx.moveTo(cx, y);
    ctx.lineTo(cx + cw, y);
    ctx.stroke();
  }

  // Translucent histogram bars
  const bars = 26;
  for (let i = 0; i < bars; i++) {
    const n = 0.22 + 0.58 * Math.abs(Math.sin(i * 0.46 + 0.5));
    const bh = n * (ch * 0.68);
    const bx = cx + 6 + i * ((cw - 12) / bars);
    ctx.fillStyle =
      i > 19 ? 'rgba(245, 158, 11, 0.42)' : 'rgba(56, 189, 248, 0.34)';
    ctx.fillRect(bx, cy + ch - bh, 10, bh);
  }

  // Primary electric cyan curve with glowing nodes
  ctx.beginPath();
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const x = cx + t * cw;
    const wave =
      0.56 +
      0.21 * Math.sin(t * Math.PI * 3.4) +
      0.14 * Math.cos(t * Math.PI * 8.0) -
      t * 0.22;
    const y = cy + wave * ch;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = '#7dd3fc';
  ctx.lineWidth = 2.8;
  ctx.stroke();

  // Secondary warm amber curve
  ctx.beginPath();
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const x = cx + t * cw;
    const wave = 0.72 + 0.1 * Math.sin(t * Math.PI * 2.6 + 1.0);
    const y = cy + wave * ch;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.85)';
  ctx.lineWidth = 2;
  ctx.stroke();

  return finalizeColorTexture(canvas, maxAnisotropy);
}

/**
 * Lower-right compact translucent cluster panel.
 */
export function createTerminalCardTexture(
  maxAnisotropy: number,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 384, 256);

  ctx.font = '600 13px "JetBrains Mono", monospace';
  ctx.fillStyle = '#bae6fd';
  ctx.fillText('CLUSTER NODES', 24, 40);

  const rows = [
    ['US-WEST', '99.98%', '#7dd3fc'],
    ['EU-CENT', '99.96%', '#38bdf8'],
    ['VECTORS', '14.2M', '#fbbf24'],
    ['LATENCY', '38 ms', '#e0f2fe'],
  ];

  ctx.font = '400 13px "JetBrains Mono", monospace';
  rows.forEach(([k, v, col], idx) => {
    const y = 84 + idx * 38;
    ctx.fillStyle = '#8cb4d9';
    ctx.fillText(k, 24, y);
    ctx.fillStyle = col;
    ctx.fillText(v, 146, y);
    ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
    ctx.fillRect(232, y - 9, 120, 6);
    ctx.fillStyle = col;
    ctx.fillRect(232, y - 9, 68 + ((idx * 21) % 44), 6);
  });

  return finalizeColorTexture(canvas, maxAnisotropy);
}

/**
 * Cinematic shallow-depth-of-field nighttime city skyline backdrop seen through
 * the floor-to-ceiling studio windows. Uses layered Gaussian blur so skyscrapers
 * and city lights read like authentic out-of-focus telephoto bokeh (matching reference!).
 */
export function createCityWindowBackdropTexture(
  maxAnisotropy: number,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1600;
  canvas.height = 900;
  const ctx = canvas.getContext('2d')!;

  // Rich velvety sapphire-cobalt midnight atmosphere
  const sky = ctx.createLinearGradient(0, 0, 0, 900);
  sky.addColorStop(0, '#020b1a');
  sky.addColorStop(0.38, '#051a38');
  sky.addColorStop(0.68, '#092b59');
  sky.addColorStop(0.86, '#0e3c72');
  sky.addColorStop(1, '#041226');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 1600, 900);

  // Atmospheric horizon light haze pools
  const hazeCenter = ctx.createRadialGradient(640, 650, 40, 640, 650, 560);
  hazeCenter.addColorStop(0, 'rgba(34, 211, 238, 0.38)');
  hazeCenter.addColorStop(0.55, 'rgba(14, 165, 233, 0.16)');
  hazeCenter.addColorStop(1, 'rgba(14, 165, 233, 0)');
  ctx.fillStyle = hazeCenter;
  ctx.fillRect(0, 120, 1600, 780);

  const hazeRight = ctx.createRadialGradient(1320, 680, 20, 1320, 680, 420);
  hazeRight.addColorStop(0, 'rgba(56, 189, 248, 0.28)');
  hazeRight.addColorStop(0.5, 'rgba(245, 158, 11, 0.12)');
  hazeRight.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = hazeRight;
  ctx.fillRect(760, 200, 840, 700);

  let seed = 7717;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  // Draw blurred distant skyscrapers onto an offscreen layer so they look like cinema DOF
  const blurLayer = document.createElement('canvas');
  blurLayer.width = 1600;
  blurLayer.height = 900;
  const bctx = blurLayer.getContext('2d')!;

  // Back tall iconic spires (like left spire & right tall dark tower in reference!)
  const landmarkTowers = [
    { x: 185, w: 66, h: 480, spire: 95 },
    { x: 310, w: 84, h: 340, spire: 0 },
    { x: 460, w: 96, h: 420, spire: 50 },
    { x: 640, w: 74, h: 370, spire: 0 },
    { x: 920, w: 88, h: 400, spire: 40 },
    { x: 1180, w: 72, h: 360, spire: 0 },
    { x: 1335, w: 94, h: 520, spire: 30 },
  ];

  for (let i = 0; i < 36; i++) {
    const bw = 38 + rand() * 76;
    const bh = 180 + rand() * 320;
    const bx = i * 46 - 20 + (rand() - 0.5) * 20;
    const by = 840 - bh;
    bctx.fillStyle = i % 2 === 0 ? '#051a36' : '#04142b';
    bctx.fillRect(bx, by, bw, bh + 60);

    for (let wy = by + 18; wy < 820; wy += 14) {
      for (let wx = bx + 8; wx < bx + bw - 10; wx += 12) {
        if (rand() > 0.62) {
          const isWarm = rand() > 0.78;
          bctx.fillStyle = isWarm
            ? `rgba(255, 200, 110, ${0.42 + rand() * 0.45})`
            : `rgba(125, 224, 255, ${0.38 + rand() * 0.52})`;
          bctx.fillRect(wx, wy, 5.5, 6.5);
        }
      }
    }
  }

  for (const t of landmarkTowers) {
    const by = 840 - t.h;
    bctx.fillStyle = '#031024';
    bctx.fillRect(t.x, by, t.w, t.h + 60);
    if (t.spire > 0) {
      bctx.fillRect(t.x + t.w * 0.46, by - t.spire, 4, t.spire);
      bctx.fillStyle = 'rgba(125, 224, 255, 0.9)';
      bctx.beginPath();
      bctx.arc(t.x + t.w * 0.46 + 2, by - t.spire, 4, 0, Math.PI * 2);
      bctx.fill();
    }
    for (let wy = by + 22; wy < 810; wy += 16) {
      for (let wx = t.x + 10; wx < t.x + t.w - 10; wx += 14) {
        if (rand() > 0.58) {
          const isWarm = rand() > 0.74;
          bctx.fillStyle = isWarm
            ? 'rgba(251, 191, 36, 0.75)'
            : 'rgba(125, 224, 255, 0.75)';
          bctx.fillRect(wx, wy, 6, 7);
        }
      }
    }
  }

  // Composite blurred skyline onto main backdrop (authentic shallow depth of field!)
  ctx.save();
  ctx.filter = 'blur(4.5px)';
  ctx.drawImage(blurLayer, 0, 0);
  ctx.restore();

  // Foreground dreamy circular telephoto bokeh discs
  for (let i = 0; i < 150; i++) {
    const x = rand() * 1600;
    const y = 440 + rand() * 410;
    const r = 5 + rand() * 20;
    const isWarm = rand() > 0.72;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    if (isWarm) {
      g.addColorStop(0, 'rgba(255, 210, 120, 0.52)');
      g.addColorStop(0.55, 'rgba(245, 158, 11, 0.22)');
      g.addColorStop(1, 'rgba(245, 158, 11, 0)');
    } else {
      g.addColorStop(0, 'rgba(186, 238, 255, 0.55)');
      g.addColorStop(0.55, 'rgba(34, 211, 238, 0.24)');
      g.addColorStop(1, 'rgba(34, 211, 238, 0)');
    }
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  return finalizeColorTexture(canvas, maxAnisotropy);
}

/**
 * Tileable procedural grayscale brushed-slate texture for desk bump/roughness micro-detail.
 */
export function createDeskSurfaceTextures(): {
  bumpMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
} {
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 512;
  bumpCanvas.height = 512;
  const bctx = bumpCanvas.getContext('2d')!;
  bctx.fillStyle = '#808080';
  bctx.fillRect(0, 0, 512, 512);

  let seed = 9001;
  const rand = () => {
    seed = (seed * 48271) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let i = 0; i < 1400; i++) {
    const x = rand() * 512;
    const y = rand() * 512;
    const w = 24 + rand() * 80;
    const lum = 114 + Math.floor(rand() * 28);
    bctx.fillStyle = `rgb(${lum},${lum},${lum})`;
    bctx.fillRect(x, y, w, 1.2);
  }

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(3, 2);
  bumpMap.needsUpdate = true;

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = 512;
  roughCanvas.height = 512;
  const rctx = roughCanvas.getContext('2d')!;
  const grad = rctx.createRadialGradient(256, 256, 30, 256, 256, 280);
  grad.addColorStop(0, '#202020');
  grad.addColorStop(0.65, '#3c3c3c');
  grad.addColorStop(1, '#585858');
  rctx.fillStyle = grad;
  rctx.fillRect(0, 0, 512, 512);

  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.needsUpdate = true;

  return { bumpMap, roughnessMap };
}

export function createRadialShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(64, 64, 8, 64, 64, 62);
  g.addColorStop(0, 'rgba(0, 6, 18, 0.78)');
  g.addColorStop(0.55, 'rgba(0, 6, 18, 0.32)');
  g.addColorStop(1, 'rgba(0, 6, 18, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

export function createGlowSpriteTexture(
  innerColor: string,
  midColor: string,
  outerTint = 'rgba(14, 165, 233, 0.08)',
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(64, 64, 1, 64, 64, 62);
  g.addColorStop(0, innerColor);
  g.addColorStop(0.26, midColor);
  g.addColorStop(0.62, outerTint);
  g.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}
