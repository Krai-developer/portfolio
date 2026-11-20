import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createScope, createTimeline, onScroll } from 'animejs';

function createMonitorCodeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Deep IDE navy background
    ctx.fillStyle = '#061121';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Top bar
    ctx.fillStyle = '#091a30';
    ctx.fillRect(0, 0, canvas.width, 40);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '600 16px "JetBrains Mono", monospace';
    ctx.fillText('KRAI-STUDIO // neural_orchestrator.ts', 24, 26);

    // Left sidebar explorer
    ctx.fillStyle = '#071528';
    ctx.fillRect(0, 40, 175, canvas.height - 40);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(175, 40);
    ctx.lineTo(175, canvas.height);
    ctx.stroke();

    const files = [
      'src/',
      '  agents/',
      '    planner.ts',
      '    executor.ts',
      '  models/',
      '    transformer.py',
      '    embeddings.ts',
      '  api/',
      '    stream.ts',
      '    gateway.ts'
    ];
    ctx.font = '500 14px "JetBrains Mono", monospace';
    files.forEach((f, i) => {
      ctx.fillStyle = i === 2 ? '#38bdf8' : 'rgba(148, 163, 184, 0.72)';
      ctx.fillText(f, 18, 76 + i * 28);
    });

    // Main code lines
    const codeLines: Array<Array<[string, string]>> = [
      [['import ', '#60a5fa'], ['{ NeuralGraph, VectorIndex } ', '#e2e8f0'], ['from ', '#60a5fa'], ["'@krai/core';", '#34d399']],
      [['', '#e2e8f0']],
      [['export class ', '#38bdf8'], ['AutonomousEngine ', '#f8fafc'], ['{', '#94a3b8']],
      [['  private readonly ', '#60a5fa'], ['index: VectorIndex;', '#7dd3fc']],
      [['  private ', '#60a5fa'], ['latencyMs = ', '#e2e8f0'], ['11.4;', '#fbbf24']],
      [['', '#e2e8f0']],
      [['  async ', '#60a5fa'], ['synthesize', '#38bdf8'], ['(prompt: ', '#e2e8f0'], ['string', '#7dd3fc'], ['): ', '#e2e8f0'], ['Promise<Plan> ', '#38bdf8'], ['{', '#94a3b8']],
      [['    const ', '#60a5fa'], ['context = ', '#e2e8f0'], ['await ', '#60a5fa'], ['this.index.retrieve(prompt, { topK: ', '#e2e8f0'], ['8', '#fbbf24'], [' });', '#e2e8f0']],
      [['    const ', '#60a5fa'], ['graph = ', '#e2e8f0'], ['NeuralGraph.compile(context.embeddings);', '#7dd3fc']],
      [['    return ', '#60a5fa'], ['graph.execute({ stream: ', '#e2e8f0'], ['true', '#38bdf8'], [', precision: ', '#e2e8f0'], ["'fp16'", '#34d399'], [' });', '#e2e8f0']],
      [['  }', '#94a3b8']],
      [['}', '#94a3b8']],
      [['', '#e2e8f0']],
      [['// Live inference telemetry — 99.98% uptime | 142 tok/s', '#38bdf8']]
    ];

    ctx.font = '500 17px "JetBrains Mono", monospace';
    codeLines.forEach((tokens, idx) => {
      ctx.fillStyle = 'rgba(100, 116, 139, 0.55)';
      ctx.fillText(String(idx + 1).padStart(2, '0'), 194, 82 + idx * 32);
      let x = 232;
      tokens.forEach(([txt, color]) => {
        ctx.fillStyle = color;
        ctx.fillText(txt, x, 82 + idx * 32);
        x += ctx.measureText(txt).width;
      });
    });

    // Subtle right minimap
    ctx.fillStyle = 'rgba(56, 189, 248, 0.14)';
    for (let i = 0; i < 24; i++) {
      const w = 24 + ((i * 19) % 44);
      ctx.fillRect(928, 70 + i * 16, w, 5);
    }

    // Glowing inner border
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createHologramPanelTexture(
  kind: 'code' | 'arch' | 'analytics' | 'monitor'
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = kind === 'code' || kind === 'analytics' ? 520 : 480;
  canvas.height = kind === 'code' || kind === 'analytics' ? 680 : 310;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Glass translucent blue panel
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, 'rgba(8, 30, 58, 0.72)');
    grad.addColorStop(0.5, 'rgba(5, 19, 40, 0.62)');
    grad.addColorStop(1, 'rgba(8, 36, 68, 0.74)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(8, 8, canvas.width - 16, canvas.height - 16, 18);
    ctx.fill();

    // Glowing cyan border
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Header bar
    ctx.fillStyle = 'rgba(56, 189, 248, 0.16)';
    ctx.fillRect(12, 12, canvas.width - 24, 42);
    ctx.font = '600 16px "JetBrains Mono", monospace';
    ctx.fillStyle = '#7dd3fc';

    if (kind === 'code') {
      ctx.fillText('AI PIPELINE // model_inference.py', 26, 39);
      ctx.font = '500 15px "JetBrains Mono", monospace';
      const lines = [
        'def forward_pass(x, weights):',
        '  q = project_query(x)',
        '  k = project_key(x)',
        '  v = project_value(x)',
        '  scores = matmul(q, k.T) / 8.0',
        '  probs = softmax(scores)',
        '  return matmul(probs, v)',
        '',
        'class AgentRouter:',
        '  def dispatch(self, task):',
        '    vec = embed(task.query)',
        '    node = graph.nearest(vec)',
        '    return node.invoke(task)',
        '',
        '# STATUS: CONVERGED (0.012 loss)',
        '# TOKENS/SEC: 184.2'
      ];
      lines.forEach((line, i) => {
        ctx.fillStyle =
          line.startsWith('#')
            ? '#38bdf8'
            : line.startsWith('def ') || line.startsWith('class ')
            ? '#93c5fd'
            : 'rgba(226, 232, 240, 0.88)';
        ctx.fillText(line, 26, 90 + i * 33);
      });
    } else if (kind === 'arch') {
      ctx.fillText('SYSTEM ARCHITECTURE // TOPOLOGY', 26, 39);
      // Draw connected architecture boxes
      const nodes = [
        { x: 42, y: 110, w: 105, h: 48, label: 'CLIENT UI' },
        { x: 192, y: 82, w: 110, h: 48, label: 'API GATEWAY' },
        { x: 192, y: 175, w: 110, h: 48, label: 'AI ENGINE' },
        { x: 345, y: 128, w: 100, h: 48, label: 'VECTOR DB' }
      ];
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
      ctx.lineWidth = 2;
      const drawLink = (x1: number, y1: number, x2: number, y2: number) => {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      };
      drawLink(147, 134, 192, 106);
      drawLink(147, 134, 192, 199);
      drawLink(302, 106, 345, 152);
      drawLink(302, 199, 345, 152);

      nodes.forEach((n) => {
        ctx.fillStyle = 'rgba(14, 165, 233, 0.16)';
        ctx.fillRect(n.x, n.y, n.w, n.h);
        ctx.strokeRect(n.x, n.y, n.w, n.h);
        ctx.fillStyle = '#e0f2fe';
        ctx.font = '600 13px "JetBrains Mono", monospace';
        ctx.fillText(n.label, n.x + 12, n.y + 29);
      });
    } else if (kind === 'analytics') {
      ctx.fillText('NEURAL TELEMETRY & ANALYTICS', 26, 39);
      // Upper code / status block
      ctx.font = '500 14px "JetBrains Mono", monospace';
      const rows = [
        'CLUSTER: ap-southeast-1 [ONLINE]',
        'MODEL:   krai-reasoning-v4',
        'P95 LAT: 14.2 ms  |  ERR: 0.00%',
        'ACTIVE PIPELINES: 12 WORKERS'
      ];
      rows.forEach((r, i) => {
        ctx.fillStyle = i === 0 ? '#38bdf8' : 'rgba(226, 232, 240, 0.85)';
        ctx.fillText(r, 26, 92 + i * 30);
      });

      // Divider
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.beginPath();
      ctx.moveTo(24, 240);
      ctx.lineTo(canvas.width - 24, 240);
      ctx.stroke();

      // Bar + waveform chart
      const bars = [42, 68, 55, 88, 120, 96, 145, 132, 178, 160, 205, 188, 220, 195];
      bars.forEach((h, i) => {
        const bx = 34 + i * 32;
        const by = 560 - h;
        ctx.fillStyle = i % 3 === 0 ? 'rgba(56, 189, 248, 0.85)' : 'rgba(56, 189, 248, 0.38)';
        ctx.fillRect(bx, by, 18, h);
      });

      // Glowing trend line
      ctx.strokeStyle = '#7dd3fc';
      ctx.lineWidth = 3;
      ctx.beginPath();
      bars.forEach((h, i) => {
        const px = 43 + i * 32;
        const py = 540 - h;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();

      ctx.fillStyle = '#fb923c';
      ctx.font = '600 14px "JetBrains Mono", monospace';
      ctx.fillText('THROUGHPUT PEAK: +42.8% EFFICIENCY', 26, 622);
    } else {
      ctx.fillText('SYSTEM MONITOR // GPU & RAM', 26, 39);
      const metrics = [
        { label: 'NEURAL ENGINE', pct: 0.84, color: '#38bdf8' },
        { label: 'MEMORY POOL', pct: 0.62, color: '#60a5fa' },
        { label: 'STREAM IO', pct: 0.91, color: '#fb923c' }
      ];
      metrics.forEach((m, i) => {
        const y = 96 + i * 64;
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '600 14px "JetBrains Mono", monospace';
        ctx.fillText(`${m.label}  ${Math.round(m.pct * 100)}%`, 26, y);
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(26, y + 12, canvas.width - 52, 14);
        ctx.fillStyle = m.color;
        ctx.fillRect(26, y + 12, (canvas.width - 52) * m.pct, 14);
      });
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createCityBackdropTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1400;
  canvas.height = 700;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Deep midnight navy sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
    sky.addColorStop(0, '#040a18');
    sky.addColorStop(0.55, '#081833');
    sky.addColorStop(1, '#0b2244');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Distant atmospheric horizon glow
    const glow = ctx.createRadialGradient(700, 560, 40, 700, 560, 620);
    glow.addColorStop(0, 'rgba(56, 189, 248, 0.22)');
    glow.addColorStop(0.5, 'rgba(30, 64, 175, 0.12)');
    glow.addColorStop(1, 'rgba(4, 10, 24, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Skyscrapers
    const buildings = [
      { x: 40, w: 95, h: 360 },
      { x: 155, w: 72, h: 480 },
      { x: 245, w: 110, h: 310 },
      { x: 380, w: 85, h: 410 },
      { x: 490, w: 120, h: 270 },
      { x: 640, w: 90, h: 440 },
      { x: 760, w: 130, h: 330 },
      { x: 920, w: 88, h: 470 },
      { x: 1035, w: 110, h: 350 },
      { x: 1170, w: 92, h: 510 },
      { x: 1280, w: 105, h: 380 }
    ];

    buildings.forEach((b, bIdx) => {
      const topY = canvas.height - b.h;
      ctx.fillStyle = bIdx % 2 === 0 ? '#051022' : '#07162e';
      ctx.fillRect(b.x, topY, b.w, b.h);

      // Spire on taller buildings
      if (b.h > 450) {
        ctx.fillRect(b.x + b.w / 2 - 2, topY - 45, 4, 45);
      }

      // Tiny glowing city windows (cyan, cool white, occasional warm amber)
      for (let wy = topY + 18; wy < canvas.height - 20; wy += 16) {
        for (let wx = b.x + 10; wx < b.x + b.w - 12; wx += 14) {
          const hash = Math.sin(wx * 12.9898 + wy * 78.233 + bIdx) * 43758.5453;
          const rnd = hash - Math.floor(hash);
          if (rnd > 0.62) {
            ctx.fillStyle =
              rnd > 0.93
                ? 'rgba(251, 146, 60, 0.85)'
                : rnd > 0.78
                ? 'rgba(125, 211, 252, 0.8)'
                : 'rgba(226, 232, 240, 0.45)';
            ctx.fillRect(wx, wy, 6, 7);
          }
        }
      }
    });
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createParticleDotTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.3, 'rgba(56,189,248,0.85)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export const HeroWorkspace3D: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scopeRef = useRef<ReturnType<typeof createScope> | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const isMobile = window.innerWidth < 768;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050b16);
    scene.fog = new THREE.FogExp2(0x050b16, 0.042);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 80);
    // Offset slightly right-biased so Hero text sits cleanly on the left while the workstation fills the right/center
    const baseCamPos = new THREE.Vector3(isMobile ? 0.3 : -1.5, 2.35, isMobile ? 9.6 : 7.6);
    const baseLookAt = new THREE.Vector3(isMobile ? 0.4 : -0.6, 1.55, -0.5);
    camera.position.copy(baseCamPos);
    camera.lookAt(baseLookAt);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: !isMobile,
        alpha: false,
        powerPreference: 'high-performance'
      });
    } catch {
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 1.25));
    renderer.setSize(width, height, false);

    // -------------------------------------------------------------------------
    // 1. CINEMATIC NIGHTTIME STUDIO LIGHTING (Cyan Screen Glow + Subtle Warm Amber)
    // -------------------------------------------------------------------------
    scene.add(new THREE.AmbientLight(0x1e3a5f, 1.05));

    const screenGlow = new THREE.PointLight(0x38bdf8, 8.5, 16, 1.5);
    screenGlow.position.set(0.4, 2.1, 0.9);
    scene.add(screenGlow);

    const holoTopGlow = new THREE.PointLight(0x0ea5e9, 4.5, 14, 1.6);
    holoTopGlow.position.set(1.2, 3.8, -0.6);
    scene.add(holoTopGlow);

    // Subtle warm-orange architectural accent light on the far right & left window edge
    const warmAccentRight = new THREE.PointLight(0xfb923c, 5.2, 13, 1.7);
    warmAccentRight.position.set(5.2, 2.2, 0.4);
    scene.add(warmAccentRight);

    const warmRimLeft = new THREE.PointLight(0xf59e0b, 2.2, 11, 1.8);
    warmRimLeft.position.set(-4.5, 2.8, -3.5);
    scene.add(warmRimLeft);

    // -------------------------------------------------------------------------
    // 2. NIGHTTIME OFFICE ARCHITECTURE + CITY SKYLINE WINDOW
    // -------------------------------------------------------------------------
    const workspaceRoot = new THREE.Group();
    // Shift entire workstation slightly right on desktop so left side stays clean for Hero typography
    workspaceRoot.position.set(isMobile ? 0 : 1.25, 0, 0);
    scene.add(workspaceRoot);

    // City skyline backdrop outside the office window
    const cityTex = createCityBackdropTexture();
    const cityPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 12),
      new THREE.MeshBasicMaterial({ map: cityTex })
    );
    cityPlane.position.set(0, 2.6, -7.2);
    workspaceRoot.add(cityPlane);

    // Dark architectural window mullions + warm left vertical LED strip
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x0b1220,
      roughness: 0.65,
      metalness: 0.4
    });
    const mullionPositions = [-5.4, 2.4, 5.6];
    mullionPositions.forEach((mx) => {
      const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.28, 10, 0.4), frameMat);
      mullion.position.set(mx, 3, -5.2);
      workspaceRoot.add(mullion);
    });

    // Warm vertical architectural strip on left mullion (as seen in reference)
    const warmStripMat = new THREE.MeshBasicMaterial({ color: 0xfb923c });
    const leftWarmStrip = new THREE.Mesh(new THREE.BoxGeometry(0.04, 7.5, 0.04), warmStripMat);
    leftWarmStrip.position.set(-5.24, 3.2, -5.0);
    workspaceRoot.add(leftWarmStrip);

    // Right wall bookshelf with warm under-shelf accent lighting
    const shelfMat = new THREE.MeshStandardMaterial({ color: 0x0e1525, roughness: 0.5, metalness: 0.25 });
    [1.4, 2.8, 4.2].forEach((sy) => {
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 1.0), shelfMat);
      shelf.position.set(5.4, sy, -2.5);
      workspaceRoot.add(shelf);

      const led = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.025, 0.04), warmStripMat);
      led.position.set(5.4, sy - 0.05, -2.1);
      workspaceRoot.add(led);
    });

    // -------------------------------------------------------------------------
    // 3. REALISTIC WORKSTATION: DESK, CENTRAL MONITOR, HOLOGRAPHIC KEYBOARD, MUG
    // -------------------------------------------------------------------------
    const deskMat = new THREE.MeshStandardMaterial({
      color: 0x0d1626,
      roughness: 0.28,
      metalness: 0.55
    });
    const desk = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.14, 3.2), deskMat);
    desk.position.set(0.3, 0.65, 0.2);
    workspaceRoot.add(desk);

    // Desk legs
    const legGeo = new THREE.BoxGeometry(0.14, 1.6, 2.4);
    const leftLeg = new THREE.Mesh(legGeo, frameMat);
    leftLeg.position.set(-3.6, -0.15, 0.2);
    const rightLeg = new THREE.Mesh(legGeo, frameMat);
    rightLeg.position.set(4.2, -0.15, 0.2);
    workspaceRoot.add(leftLeg, rightLeg);

    // Central Monitor Stand & Bezel
    const metalStandMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.3,
      metalness: 0.85
    });
    const monitorNeck = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.8, 0.14), metalStandMat);
    monitorNeck.position.set(0.1, 1.15, -0.55);
    const monitorBase = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.05, 0.7), metalStandMat);
    monitorBase.position.set(0.1, 0.75, -0.45);
    workspaceRoot.add(monitorNeck, monitorBase);

    // Large Central Monitor
    const monitorTex = createMonitorCodeTexture();
    const monitorGroup = new THREE.Group();
    monitorGroup.position.set(0.1, 2.02, -0.45);
    monitorGroup.rotation.y = 0.14;
    workspaceRoot.add(monitorGroup);

    const monitorBody = new THREE.Mesh(new THREE.BoxGeometry(3.55, 2.08, 0.1), metalStandMat);
    monitorGroup.add(monitorBody);

    const monitorScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(3.42, 1.96),
      new THREE.MeshBasicMaterial({ map: monitorTex })
    );
    monitorScreen.position.z = 0.056;
    monitorGroup.add(monitorScreen);

    // Glowing cyan monitor frame accent
    const monitorEdgeGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(3.58, 2.11, 0.12));
    const monitorEdge = new THREE.LineSegments(
      monitorEdgeGeo,
      new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 })
    );
    monitorGroup.add(monitorEdge);

    // Holographic glowing keyboard & desk pad
    const keyboard = new THREE.Mesh(
      new THREE.BoxGeometry(1.45, 0.04, 0.52),
      new THREE.MeshStandardMaterial({
        color: 0x0c2d48,
        emissive: new THREE.Color(0x0ea5e9),
        emissiveIntensity: 0.75,
        roughness: 0.25,
        metalness: 0.6
      })
    );
    keyboard.position.set(0.55, 0.75, 0.65);
    keyboard.rotation.y = 0.12;
    workspaceRoot.add(keyboard);

    const mouseObj = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.06, 0.1, 6, 12),
      new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        emissive: new THREE.Color(0x38bdf8),
        emissiveIntensity: 0.35,
        roughness: 0.3,
        metalness: 0.7
      })
    );
    mouseObj.rotation.x = Math.PI / 2;
    mouseObj.position.set(1.55, 0.76, 0.72);
    workspaceRoot.add(mouseObj);

    // Coffee mug on left of desk (as seen in reference)
    const mug = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.11, 0.26, 20),
      new THREE.MeshStandardMaterial({ color: 0x151e2e, roughness: 0.35, metalness: 0.3 })
    );
    mug.position.set(-1.75, 0.85, 0.65);
    workspaceRoot.add(mug);

    // -------------------------------------------------------------------------
    // 4. 3D DEVELOPER CHARACTER IN DARK HOODIE + ERGONOMIC CHAIR (Viewed from behind-right)
    // -------------------------------------------------------------------------
    const characterGroup = new THREE.Group();
    characterGroup.position.set(1.65, 0.2, 2.05);
    characterGroup.rotation.y = -0.52; // Facing monitor from behind-right
    workspaceRoot.add(characterGroup);

    const hoodieMat = new THREE.MeshStandardMaterial({
      color: 0x111722,
      roughness: 0.78,
      metalness: 0.12
    });
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0x8d6e63,
      roughness: 0.65,
      metalness: 0.05
    });
    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x0b0f17,
      roughness: 0.7,
      metalness: 0.15
    });
    const chairMat = new THREE.MeshStandardMaterial({
      color: 0x131b29,
      roughness: 0.45,
      metalness: 0.55
    });

    // Ergonomic Chair (seat, backrest frame, lumbar bar, armrests)
    const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.14, 1.05), chairMat);
    chairSeat.position.set(0, 0.25, 0.05);
    const chairBack = new THREE.Mesh(new THREE.BoxGeometry(1.02, 1.38, 0.12), chairMat);
    chairBack.position.set(0, 1.02, 0.52);
    chairBack.rotation.x = -0.1;
    const chairBackFrame = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(1.04, 1.4, 0.14)),
      new THREE.LineBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.7 })
    );
    chairBackFrame.position.copy(chairBack.position);
    chairBackFrame.rotation.copy(chairBack.rotation);
    characterGroup.add(chairSeat, chairBack, chairBackFrame);

    // Developer Upper Body Rig (animates with subtle breathing)
    const upperBody = new THREE.Group();
    upperBody.position.set(0, 0.35, 0);
    characterGroup.add(upperBody);

    // Torso (dark hoodie)
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 0.62, 10, 18), hoodieMat);
    torso.scale.set(1.18, 1.0, 0.74);
    torso.position.set(0, 0.68, 0.05);
    torso.rotation.x = 0.12;
    upperBody.add(torso);

    // Draped hood collar around back of neck
    const hoodCollar = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.12, 10, 22), hoodieMat);
    hoodCollar.position.set(0, 1.15, 0.06);
    hoodCollar.rotation.x = Math.PI / 2 + 0.25;
    upperBody.add(hoodCollar);

    // Head + sculpted dark hair + subtle glasses rim
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.48, -0.05);
    upperBody.add(headGroup);

    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.26, 20, 20), skinMat);
    headMesh.scale.set(0.92, 1.06, 0.98);
    headGroup.add(headMesh);

    const hairCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.275, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.62),
      hairMat
    );
    hairCap.position.set(0, 0.03, 0.02);
    hairCap.rotation.x = -0.25;
    headGroup.add(hairCap);

    // Left & Right Arms reaching forward to the keyboard
    const leftArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.125, 0.72, 8, 14), hoodieMat);
    leftArm.position.set(-0.56, 0.74, -0.42);
    leftArm.rotation.set(Math.PI / 2 - 0.35, 0, -0.28);
    upperBody.add(leftArm);

    const rightArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.125, 0.72, 8, 14), hoodieMat);
    rightArm.position.set(0.52, 0.72, -0.45);
    rightArm.rotation.set(Math.PI / 2 - 0.32, 0, 0.24);
    upperBody.add(rightArm);

    // -------------------------------------------------------------------------
    // 5. INDEPENDENT FLOATING 3D HOLOGRAPHIC GLASS INTERFACES (Matching Reference)
    // -------------------------------------------------------------------------
    const holoPanels: Array<{ group: THREE.Group; basePos: THREE.Vector3; phase: number }> = [];

    const panelDefs: Array<{
      kind: 'code' | 'arch' | 'analytics' | 'monitor';
      size: [number, number];
      pos: [number, number, number];
      rotY: number;
      phase: number;
    }> = [
      // Left tall programming code editor
      { kind: 'code', size: [1.55, 2.02], pos: [-2.45, 2.75, -0.25], rotY: 0.36, phase: 0 },
      // Bottom-left architecture topology panel
      { kind: 'arch', size: [1.48, 0.95], pos: [-2.0, 1.32, 0.25], rotY: 0.32, phase: 1.2 },
      // Right tall code + analytics telemetry panel
      { kind: 'analytics', size: [1.55, 2.0], pos: [2.42, 2.65, -0.55], rotY: -0.28, phase: 2.1 },
      // Bottom-right system monitor panel
      { kind: 'monitor', size: [1.05, 0.68], pos: [2.15, 1.22, -0.2], rotY: -0.24, phase: 3.1 }
    ];

    const activePanels = isMobile ? panelDefs.slice(0, 2) : panelDefs;
    activePanels.forEach((def) => {
      const grp = new THREE.Group();
      grp.position.set(...def.pos);
      grp.rotation.y = def.rotY;

      const tex = createHologramPanelTexture(def.kind);
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(def.size[0], def.size[1]),
        new THREE.MeshBasicMaterial({
          map: tex,
          transparent: true,
          opacity: 0.9,
          side: THREE.DoubleSide,
          depthWrite: false
        })
      );
      grp.add(plane);

      const border = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.PlaneGeometry(def.size[0], def.size[1])),
        new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.7 })
      );
      grp.add(border);

      workspaceRoot.add(grp);
      holoPanels.push({ group: grp, basePos: new THREE.Vector3(...def.pos), phase: def.phase });
    });

    // -------------------------------------------------------------------------
    // 6. FLOATING GEOMETRIC AI STRUCTURES (Cube, Hexagon, Pyramid, Warm-Orange Core)
    // -------------------------------------------------------------------------
    const aiStructures: Array<{
      group: THREE.Group;
      baseY: number;
      rotSpeed: [number, number];
      phase: number;
    }> = [];

    const createAIStructure = (
      geo: THREE.BufferGeometry,
      innerGeo: THREE.BufferGeometry,
      color: number,
      pos: [number, number, number],
      rotSpeed: [number, number],
      phase: number
    ) => {
      const grp = new THREE.Group();
      grp.position.set(...pos);

      const outerWire = new THREE.LineSegments(
        new THREE.EdgesGeometry(geo),
        new THREE.LineBasicMaterial({
          color,
          transparent: true,
          opacity: 0.9,
          blending: THREE.AdditiveBlending
        })
      );
      geo.dispose();

      const innerWire = new THREE.LineSegments(
        new THREE.EdgesGeometry(innerGeo),
        new THREE.LineBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.65,
          blending: THREE.AdditiveBlending
        })
      );
      innerGeo.dispose();

      const coreOrb = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 14, 14),
        new THREE.MeshBasicMaterial({ color })
      );

      grp.add(outerWire, innerWire, coreOrb);
      workspaceRoot.add(grp);
      aiStructures.push({ group: grp, baseY: pos[1], rotSpeed, phase });
    };

    // Top-center glowing wireframe cube above main monitor
    createAIStructure(
      new THREE.BoxGeometry(0.76, 0.76, 0.76),
      new THREE.BoxGeometry(0.42, 0.42, 0.42),
      0x38bdf8,
      [0.15, 3.68, -0.35],
      [0.24, 0.36],
      0
    );

    // Top-left wireframe icosahedron/hexagon
    createAIStructure(
      new THREE.IcosahedronGeometry(0.58, 0),
      new THREE.OctahedronGeometry(0.32, 0),
      0x38bdf8,
      [-4.1, 3.45, -0.9],
      [0.2, -0.28],
      1.1
    );

    // Top-right glowing cyan pyramid
    createAIStructure(
      new THREE.ConeGeometry(0.62, 1.05, 4),
      new THREE.ConeGeometry(0.35, 0.6, 4),
      0x38bdf8,
      [3.85, 3.55, -0.85],
      [0.12, 0.42],
      2.2
    );

    // Far-right warm-orange glowing polyhedron (signature warm contrast from reference!)
    createAIStructure(
      new THREE.IcosahedronGeometry(0.48, 1),
      new THREE.OctahedronGeometry(0.24, 0),
      0xfb923c,
      [4.55, 1.95, -0.35],
      [-0.22, 0.32],
      3.3
    );

    // -------------------------------------------------------------------------
    // 7. ANIMATED NEURAL PARTICLE STREAMS & AMBIENT DIGITAL PARTICLES
    // -------------------------------------------------------------------------
    const particleTex = createParticleDotTexture();
    const particleCount = isMobile ? 120 : 280;
    const pPositions = new Float32Array(particleCount * 3);
    const pColors = new Float32Array(particleCount * 3);
    const cyanColor = new THREE.Color(0x38bdf8);
    const amberColor = new THREE.Color(0xfb923c);
    const whiteColor = new THREE.Color(0xe0f2fe);

    // Place half of the particles along curved arcs linking the AI structures, half floating in the room
    const arcCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-4.1, 3.45, -0.9),
      new THREE.Vector3(-2.1, 3.85, -0.6),
      new THREE.Vector3(0.15, 3.68, -0.35),
      new THREE.Vector3(2.2, 3.7, -0.6),
      new THREE.Vector3(3.85, 3.55, -0.85),
      new THREE.Vector3(4.55, 1.95, -0.35)
    ]);

    for (let i = 0; i < particleCount; i++) {
      if (i < particleCount * 0.45) {
        const t = i / (particleCount * 0.45);
        const pt = arcCurve.getPoint(t);
        pPositions[i * 3] = pt.x + (Math.random() - 0.5) * 0.35;
        pPositions[i * 3 + 1] = pt.y + (Math.random() - 0.5) * 0.35;
        pPositions[i * 3 + 2] = pt.z + (Math.random() - 0.5) * 0.35;
      } else {
        pPositions[i * 3] = (Math.random() - 0.5) * 11;
        pPositions[i * 3 + 1] = 0.8 + Math.random() * 4.2;
        pPositions[i * 3 + 2] = -3.5 + Math.random() * 5.5;
      }

      const c = i % 9 === 0 ? amberColor : i % 3 === 0 ? whiteColor : cyanColor;
      pColors[i * 3] = c.r;
      pColors[i * 3 + 1] = c.g;
      pColors[i * 3 + 2] = c.b;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));
    const pMat = new THREE.PointsMaterial({
      size: isMobile ? 0.14 : 0.17,
      map: particleTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const particles = new THREE.Points(pGeo, pMat);
    workspaceRoot.add(particles);

    // -------------------------------------------------------------------------
    // 8. ANIME.JS V4 SCROLL CHOREOGRAPHY + SMOOTH MOUSE PARALLAX
    // -------------------------------------------------------------------------
    const scrollRig = {
      camZOffset: 0,
      camYOffset: 0,
      panelSpread: 0,
      rootRotY: 0
    };

    scopeRef.current = createScope({ root: container }).add(() => {
      const tl = createTimeline({
        defaults: { ease: 'linear', duration: 1000 },
        autoplay: onScroll({
          target: container,
          enter: 'top top',
          leave: 'bottom top',
          sync: 0.3
        })
      });

      tl.add(
        scrollRig,
        {
          camZOffset: [0, -1.35],
          camYOffset: [0, 0.55],
          panelSpread: [0, 0.65],
          rootRotY: [0, -0.08]
        },
        0
      );
    });

    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handlePointerMove = (e: PointerEvent) => {
      mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const handleResize = () => {
      const w = Math.max(1, container.clientWidth);
      const h = Math.max(1, container.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('resize', handleResize);

    // Auto-pause Hero WebGL render loop when scrolled out of Hero so GPU is 100% free for below sections
    let isVisible = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.02 }
    );
    observer.observe(container);

    // -------------------------------------------------------------------------
    // 9. RENDER LOOP
    // -------------------------------------------------------------------------
    const clock = new THREE.Clock();
    let elapsed = 0;
    let rafId = 0;

    const renderLoop = () => {
      rafId = requestAnimationFrame(renderLoop);
      if (!isVisible) return;

      const dt = Math.min(clock.getDelta(), 0.05);
      if (!prefersReducedMotion) {
        elapsed += dt;
      }

      // Smooth damped mouse parallax
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      camera.position.x = baseCamPos.x + mouse.x * 0.45;
      camera.position.y = baseCamPos.y + scrollRig.camYOffset + mouse.y * 0.25;
      camera.position.z = baseCamPos.z + scrollRig.camZOffset;
      camera.lookAt(
        baseLookAt.x + mouse.x * 0.2,
        baseLookAt.y + mouse.y * 0.12,
        baseLookAt.z
      );

      workspaceRoot.rotation.y = scrollRig.rootRotY + mouse.x * 0.03;

      if (!prefersReducedMotion) {
        // Subtle screen glow flicker
        screenGlow.intensity = 8.2 + Math.sin(elapsed * 2.1) * 0.65;

        // Subtle developer character idle breathing & head/hand motion
        upperBody.position.y = 0.35 + Math.sin(elapsed * 1.4) * 0.018;
        headGroup.rotation.y = Math.sin(elapsed * 0.55) * 0.07;
        headGroup.rotation.x = Math.sin(elapsed * 0.8) * 0.03;
        leftArm.position.y = 0.74 + Math.sin(elapsed * 6.0) * 0.008;
        rightArm.position.y = 0.72 + Math.cos(elapsed * 5.6) * 0.008;

        // Float holographic panels + scroll spread
        holoPanels.forEach((p, idx) => {
          const dir = p.basePos.x < 0 ? -1 : 1;
          p.group.position.y = p.basePos.y + Math.sin(elapsed * 0.9 + p.phase) * 0.07;
          p.group.position.x = p.basePos.x + dir * scrollRig.panelSpread * 0.55;
          p.group.rotation.x = mouse.y * 0.04 * (idx % 2 === 0 ? 1 : -1);
        });

        // Rotate floating AI structures independently
        aiStructures.forEach((s) => {
          s.group.rotation.x += s.rotSpeed[0] * dt;
          s.group.rotation.y += s.rotSpeed[1] * dt;
          s.group.position.y = s.baseY + Math.sin(elapsed * 1.1 + s.phase) * 0.12;
        });

        // Subtle particle drift
        particles.position.y = Math.sin(elapsed * 0.4) * 0.08;
      }

      renderer.render(scene, camera);
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      scopeRef.current?.revert();

      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
        const mat = (obj as THREE.Mesh).material;
        if (mat) {
          const mats = Array.isArray(mat) ? mat : [mat];
          mats.forEach((m) => {
            if ((m as THREE.MeshBasicMaterial).map) {
              (m as THREE.MeshBasicMaterial).map?.dispose();
            }
            m.dispose();
          });
        }
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 h-full w-full overflow-hidden"
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
};
