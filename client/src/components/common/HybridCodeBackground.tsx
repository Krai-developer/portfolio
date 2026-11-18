import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createScope, createTimeline, onScroll } from 'animejs';

interface CodeSnippetSpec {
  filename: string;
  badge: string;
  accent: string;
  lines: Array<Array<{ text: string; color: string }>>;
  position: [number, number, number];
  rotation: [number, number, number];
  floatSpeed: number;
  floatOffset: number;
}

const CODE_SNIPPETS: CodeSnippetSpec[] = [
  {
    filename: 'neural_engine.py',
    badge: 'PYTORCH',
    accent: '#38BDF8',
    position: [-9.5, 4.2, -5.5],
    rotation: [0.08, 0.34, -0.04],
    floatSpeed: 0.65,
    floatOffset: 0,
    lines: [
      [
        { text: 'async def ', color: '#A78BFA' },
        { text: 'infer_context', color: '#38BDF8' },
        { text: '(tensor):', color: '#E2E8F0' }
      ],
      [
        { text: '  attn = ', color: '#94A3B8' },
        { text: 'MultiHeadAttention', color: '#7DD3FC' },
        { text: '(d=512)', color: '#E2E8F0' }
      ],
      [
        { text: '  latent = ', color: '#94A3B8' },
        { text: 'await ', color: '#A78BFA' },
        { text: 'attn.forward(tensor)', color: '#E2E8F0' }
      ],
      [
        { text: '  return ', color: '#A78BFA' },
        { text: 'softmax(latent / ', color: '#E2E8F0' },
        { text: '0.07', color: '#FCD34D' },
        { text: ')', color: '#E2E8F0' }
      ]
    ]
  },
  {
    filename: 'agent_pipeline.ts',
    badge: 'TS 5.5',
    accent: '#A78BFA',
    position: [9.8, 2.8, -6.5],
    rotation: [-0.06, -0.36, 0.05],
    floatSpeed: 0.55,
    floatOffset: 1.4,
    lines: [
      [
        { text: 'export const ', color: '#A78BFA' },
        { text: 'orchestrate', color: '#38BDF8' },
        { text: ' = <T>(', color: '#E2E8F0' }
      ],
      [
        { text: '  nodes: ', color: '#94A3B8' },
        { text: 'GraphNode', color: '#7DD3FC' },
        { text: '<T>[]', color: '#E2E8F0' }
      ],
      [
        { text: ') => nodes.', color: '#E2E8F0' },
        { text: 'map', color: '#38BDF8' },
        { text: '(n => n.activate());', color: '#E2E8F0' }
      ]
    ]
  },
  {
    filename: 'vector_store.ts',
    badge: 'RAG',
    accent: '#38BDF8',
    position: [9.2, -3.6, -4.8],
    rotation: [0.05, -0.28, -0.04],
    floatSpeed: 0.72,
    floatOffset: 2.3,
    lines: [
      [
        { text: 'const ', color: '#A78BFA' },
        { text: 'matches = ', color: '#E2E8F0' },
        { text: 'await ', color: '#A78BFA' },
        { text: 'vectors.query({', color: '#38BDF8' }
      ],
      [
        { text: '  embedding: ', color: '#94A3B8' },
        { text: 'embedPrompt', color: '#7DD3FC' },
        { text: '(input),', color: '#E2E8F0' }
      ],
      [
        { text: '  topK: ', color: '#94A3B8' },
        { text: '8', color: '#FCD34D' },
        { text: ', metric: ', color: '#94A3B8' },
        { text: "'cosine'", color: '#6EE7B7' }
      ],
      [{ text: '});', color: '#E2E8F0' }]
    ]
  },
  {
    filename: 'stream_api.ts',
    badge: 'TLS 1.3',
    accent: '#60A5FA',
    position: [-9.2, -4.4, -7.2],
    rotation: [-0.07, 0.3, 0.03],
    floatSpeed: 0.6,
    floatOffset: 3.1,
    lines: [
      [
        { text: 'router.', color: '#E2E8F0' },
        { text: 'post', color: '#38BDF8' },
        { text: "('/v1/inference',", color: '#6EE7B7' }
      ],
      [
        { text: '  verifyJWT, ', color: '#7DD3FC' },
        { text: 'async ', color: '#A78BFA' },
        { text: '(req, res) => {', color: '#E2E8F0' }
      ],
      [
        { text: '    return ', color: '#A78BFA' },
        { text: 'createStream(req).pipe(res);', color: '#E2E8F0' }
      ],
      [{ text: '});', color: '#E2E8F0' }]
    ]
  },
  {
    filename: 'model_weights.ts',
    badge: 'GRAPH',
    accent: '#F5F5F5',
    position: [0.6, -7.8, -9.5],
    rotation: [0.06, 0.12, -0.02],
    floatSpeed: 0.5,
    floatOffset: 4.0,
    lines: [
      [
        { text: 'type ', color: '#A78BFA' },
        { text: 'TensorGraph', color: '#7DD3FC' },
        { text: ' = {', color: '#E2E8F0' }
      ],
      [
        { text: '  layers: ', color: '#94A3B8' },
        { text: 'number[];', color: '#FCD34D' }
      ],
      [
        { text: '  activation: ', color: '#94A3B8' },
        { text: "'gelu' | 'silu';", color: '#6EE7B7' }
      ],
      [{ text: '};', color: '#E2E8F0' }]
    ]
  }
];

function createHologramTexture(spec: CodeSnippetSpec): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 720;
  canvas.height = 380;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Glassmorphic deep navy gradient background
    const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bg.addColorStop(0, 'rgba(13, 20, 38, 0.82)');
    bg.addColorStop(0.5, 'rgba(11, 13, 22, 0.78)');
    bg.addColorStop(1, 'rgba(20, 14, 36, 0.82)');

    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.roundRect(12, 12, canvas.width - 24, canvas.height - 24, 26);
    ctx.fill();

    // Glowing holographic border
    ctx.strokeStyle = spec.accent;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Header divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(36, 76);
    ctx.lineTo(canvas.width - 36, 76);
    ctx.stroke();

    // Status dots
    const dotColors = ['#38BDF8', '#A78BFA', 'rgba(245,245,245,0.45)'];
    dotColors.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(50 + i * 20, 44, 5.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Filename & badge
    ctx.font = '600 20px "JetBrains Mono", monospace';
    ctx.fillStyle = spec.accent;
    ctx.fillText(spec.filename, 122, 51);

    ctx.font = '600 16px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(245, 245, 245, 0.65)';
    ctx.textAlign = 'right';
    ctx.fillText(spec.badge, canvas.width - 42, 50);
    ctx.textAlign = 'left';

    // Syntax-highlighted code lines
    ctx.font = '500 22px "JetBrains Mono", monospace';
    spec.lines.forEach((tokens, lineIdx) => {
      let x = 42;
      const y = 132 + lineIdx * 48;
      tokens.forEach((token) => {
        ctx.fillStyle = token.color;
        ctx.fillText(token.text, x, y);
        x += ctx.measureText(token.text).width;
      });
    });
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function createParticleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.28, 'rgba(125, 211, 252, 0.85)');
    grad.addColorStop(0.65, 'rgba(167, 139, 250, 0.22)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export const HybridCodeBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scopeRef = useRef<ReturnType<typeof createScope> | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const isMobile = window.innerWidth < 768;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // -------------------------------------------------------------------------
    // 1. THREE.JS SCENE, CAMERA & RENDERER SETUP
    // -------------------------------------------------------------------------
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0b0b0f, 0.028);

    const camera = new THREE.PerspectiveCamera(
      52,
      container.clientWidth / Math.max(1, window.innerHeight),
      0.1,
      100
    );
    camera.position.set(0, 0, 14);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: !isMobile,
        powerPreference: 'high-performance'
      });
    } catch {
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.setSize(window.innerWidth, window.innerHeight, false);

    // Atmospheric Lighting (Deep Navy / Electric Blue / Cyan / Violet)
    const ambientLight = new THREE.AmbientLight(0x94a3b8, 0.7);
    scene.add(ambientLight);

    const cyanLight = new THREE.PointLight(0x38bdf8, 4.5, 40);
    cyanLight.position.set(-9, 6, 8);
    scene.add(cyanLight);

    const violetLight = new THREE.PointLight(0xa78bfa, 4.0, 40);
    violetLight.position.set(9, -5, 6);
    scene.add(violetLight);

    // Master World Group for Scroll & Parallax
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // -------------------------------------------------------------------------
    // 2. FLOATING 3D HOLOGRAPHIC CODE PANELS
    // -------------------------------------------------------------------------
    const codePanels: Array<{ mesh: THREE.Mesh; spec: CodeSnippetSpec }> = [];
    const panelGeometry = new THREE.PlaneGeometry(5.6, 2.95);

    const activeSnippets = isMobile ? CODE_SNIPPETS.slice(0, 3) : CODE_SNIPPETS;
    activeSnippets.forEach((spec, idx) => {
      const texture = createHologramTexture(spec);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: isMobile ? 0.45 : 0.72,
        side: THREE.DoubleSide,
        depthWrite: false
      });

      const mesh = new THREE.Mesh(panelGeometry, material);
      mesh.position.set(
        isMobile ? spec.position[0] * 0.45 : spec.position[0],
        spec.position[1] - idx * 0.4,
        spec.position[2]
      );
      mesh.rotation.set(spec.rotation[0], spec.rotation[1], spec.rotation[2]);
      worldGroup.add(mesh);
      codePanels.push({ mesh, spec });
    });

    // -------------------------------------------------------------------------
    // 3. 3D AI NEURAL NETWORK GRAPH (Instanced Nodes + LineSegments)
    // -------------------------------------------------------------------------
    const nodeCount = isMobile ? 26 : 54;
    const nodeGeometry = new THREE.IcosahedronGeometry(0.11, 1);
    const nodeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9
    });
    const nodeInstanced = new THREE.InstancedMesh(nodeGeometry, nodeMaterial, nodeCount);

    const nodePositions: THREE.Vector3[] = [];
    const nodeVelocities: THREE.Vector3[] = [];
    const palette = [
      new THREE.Color('#38BDF8'),
      new THREE.Color('#60A5FA'),
      new THREE.Color('#A78BFA'),
      new THREE.Color('#F5F5F5')
    ];

    const dummy = new THREE.Object3D();
    for (let i = 0; i < nodeCount; i++) {
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * (isMobile ? 14 : 24),
        (Math.random() - 0.5) * 20,
        -2 - Math.random() * 14
      );
      nodePositions.push(pos);
      nodeVelocities.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.008,
          (Math.random() - 0.5) * 0.008,
          (Math.random() - 0.5) * 0.005
        )
      );

      dummy.position.copy(pos);
      const scale = 0.7 + Math.random() * 1.1;
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      nodeInstanced.setMatrixAt(i, dummy.matrix);
      nodeInstanced.setColorAt(i, palette[i % palette.length]);
    }
    nodeInstanced.instanceMatrix.needsUpdate = true;
    if (nodeInstanced.instanceColor) nodeInstanced.instanceColor.needsUpdate = true;
    worldGroup.add(nodeInstanced);

    // Pre-allocate dynamic line buffer for neural connections
    const maxSegments = (nodeCount * (nodeCount - 1)) / 2;
    const linePositions = new Float32Array(maxSegments * 6);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const neuralLines = new THREE.LineSegments(lineGeometry, lineMaterial);
    worldGroup.add(neuralLines);

    // -------------------------------------------------------------------------
    // 4. 3D WIREFRAME GEOMETRIC STRUCTURES & ORBITAL RINGS
    // -------------------------------------------------------------------------
    const wireGroup = new THREE.Group();
    worldGroup.add(wireGroup);

    const wireSpecs = [
      {
        geo: new THREE.IcosahedronGeometry(1.5, 0),
        color: 0x38bdf8,
        pos: [-6.8, -1.2, -4.5],
        speed: [0.18, 0.25]
      },
      {
        geo: new THREE.OctahedronGeometry(1.3, 0),
        color: 0xa78bfa,
        pos: [7.2, 5.2, -6.0],
        speed: [-0.22, 0.16]
      },
      {
        geo: new THREE.BoxGeometry(1.7, 1.7, 1.7),
        color: 0x60a5fa,
        pos: [6.5, -6.2, -5.2],
        speed: [0.14, -0.2]
      }
    ];

    const wireMeshes: Array<{ mesh: THREE.LineSegments; speed: number[]; baseY: number }> = [];
    wireSpecs.forEach((spec) => {
      const edges = new THREE.EdgesGeometry(spec.geo);
      spec.geo.dispose();
      const mat = new THREE.LineBasicMaterial({
        color: spec.color,
        transparent: true,
        opacity: 0.35
      });
      const wire = new THREE.LineSegments(edges, mat);
      wire.position.set(
        isMobile ? spec.pos[0] * 0.55 : spec.pos[0],
        spec.pos[1],
        spec.pos[2]
      );
      wireGroup.add(wire);
      wireMeshes.push({ mesh: wire, speed: spec.speed, baseY: spec.pos[1] });
    });

    // Orbital glowing torus rings
    const ringGeo = new THREE.TorusGeometry(3.2, 0.015, 8, 72);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.22
    });
    const orbitalRing = new THREE.Mesh(ringGeo, ringMat);
    orbitalRing.position.set(0, -1.5, -10);
    orbitalRing.rotation.set(Math.PI / 3, 0.3, 0);
    wireGroup.add(orbitalRing);

    // -------------------------------------------------------------------------
    // 5. MULTI-DEPTH GLOWING DIGITAL PARTICLES
    // -------------------------------------------------------------------------
    const particleCount = isMobile ? 160 : 400;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 32;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 26;
      particlePositions[i * 3 + 2] = 2 - Math.random() * 22;

      const c = palette[i % palette.length];
      particleColors[i * 3] = c.r;
      particleColors[i * 3 + 1] = c.g;
      particleColors[i * 3 + 2] = c.b;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleTex = createParticleTexture();
    const particleMat = new THREE.PointsMaterial({
      size: isMobile ? 0.22 : 0.26,
      map: particleTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.78,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    worldGroup.add(particles);

    // -------------------------------------------------------------------------
    // 6. ANIME.JS V4 SCROLL RIG & MOUSE PARALLAX
    // -------------------------------------------------------------------------
    const scrollRig = {
      cameraY: 1.8,
      cameraZ: 14,
      worldRotY: -0.06,
      wireScale: 1,
      panelSpread: 0
    };

    scopeRef.current = createScope({
      root: container
    }).add(() => {
      const tl = createTimeline({
        defaults: { ease: 'linear', duration: 1000 },
        autoplay: onScroll({
          target: container,
          enter: 'top bottom',
          leave: 'bottom top',
          sync: 0.35
        })
      });

      tl.add(
        scrollRig,
        {
          cameraY: [1.8, -5.2],
          cameraZ: [14, 10.8],
          worldRotY: [-0.06, 0.08],
          wireScale: [0.95, 1.15],
          panelSpread: [0, 1]
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
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('resize', handleResize);

    // -------------------------------------------------------------------------
    // 7. FRAME-RATE INDEPENDENT RENDER LOOP
    // -------------------------------------------------------------------------
    const timer = new THREE.Clock();
    let elapsed = 0;
    let rafId = 0;
    const connectionDistSq = isMobile ? 22 : 26;

    const animateFrame = () => {
      rafId = requestAnimationFrame(animateFrame);
      const dt = Math.min(timer.getDelta(), 0.1);
      if (!prefersReducedMotion) {
        elapsed += dt;
      }

      // Smooth damped mouse parallax
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Apply scroll-driven camera & world transforms
      camera.position.x = mouse.x * 1.1;
      camera.position.y = scrollRig.cameraY + mouse.y * 0.7;
      camera.position.z = scrollRig.cameraZ;
      camera.lookAt(mouse.x * 0.3, scrollRig.cameraY * 0.75, -5);

      worldGroup.rotation.y = scrollRig.worldRotY + mouse.x * 0.04;
      worldGroup.rotation.x = mouse.y * 0.03;

      // Float & shift holographic code panels
      codePanels.forEach(({ mesh, spec }, idx) => {
        const baseY = spec.position[1] - idx * 0.4;
        const floatY = prefersReducedMotion
          ? 0
          : Math.sin(elapsed * spec.floatSpeed + spec.floatOffset) * 0.28;
        mesh.position.y = baseY + floatY + scrollRig.panelSpread * (idx % 2 === 0 ? 1.4 : -1.1);
        mesh.rotation.y =
          spec.rotation[1] +
          mouse.x * 0.08 +
          (prefersReducedMotion ? 0 : Math.sin(elapsed * 0.4 + idx) * 0.05);
      });

      // Rotate wireframe structures
      wireMeshes.forEach(({ mesh, speed, baseY }, i) => {
        if (!prefersReducedMotion) {
          mesh.rotation.x += speed[0] * dt;
          mesh.rotation.y += speed[1] * dt;
          mesh.position.y = baseY + Math.sin(elapsed * 0.7 + i) * 0.35;
        }
        mesh.scale.setScalar(scrollRig.wireScale);
      });
      if (!prefersReducedMotion) {
        orbitalRing.rotation.z += 0.12 * dt;
      }

      // Update neural nodes & rebuild dynamic connections
      if (!prefersReducedMotion) {
        for (let i = 0; i < nodeCount; i++) {
          const p = nodePositions[i];
          const v = nodeVelocities[i];
          p.add(v);
          if (Math.abs(p.x) > 13) v.x *= -1;
          if (Math.abs(p.y) > 11) v.y *= -1;
          if (p.z > -1.5 || p.z < -17) v.z *= -1;

          dummy.position.copy(p);
          dummy.scale.setScalar(0.85 + Math.sin(elapsed * 1.6 + i) * 0.2);
          dummy.updateMatrix();
          nodeInstanced.setMatrixAt(i, dummy.matrix);
        }
        nodeInstanced.instanceMatrix.needsUpdate = true;

        let lineIdx = 0;
        for (let i = 0; i < nodeCount; i++) {
          for (let j = i + 1; j < nodeCount; j++) {
            const distSq = nodePositions[i].distanceToSquared(nodePositions[j]);
            if (distSq < connectionDistSq) {
              linePositions[lineIdx++] = nodePositions[i].x;
              linePositions[lineIdx++] = nodePositions[i].y;
              linePositions[lineIdx++] = nodePositions[i].z;
              linePositions[lineIdx++] = nodePositions[j].x;
              linePositions[lineIdx++] = nodePositions[j].y;
              linePositions[lineIdx++] = nodePositions[j].z;
            }
          }
        }
        lineGeometry.setDrawRange(0, lineIdx / 3);
        lineGeometry.attributes.position.needsUpdate = true;

        // Gentle particle drift
        particles.rotation.y = elapsed * 0.015;
      }

      renderer.render(scene, camera);
    };

    animateFrame();

    // -------------------------------------------------------------------------
    // 8. COMPLETE GPU & MEMORY CLEANUP ON UNMOUNT
    // -------------------------------------------------------------------------
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      scopeRef.current?.revert();

      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).geometry) {
          (obj as THREE.Mesh).geometry.dispose();
        }
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
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none"
    >
      {/* Seamless top feather mask right below HeroSection */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#0B0B0F] via-[#0B0B0F]/90 to-transparent z-10" />

      {/* Pinned WebGL 3D Canvas active throughout all post-Hero sections */}
      <canvas ref={canvasRef} className="sticky top-0 h-screen w-full block" />
    </div>
  );
};
