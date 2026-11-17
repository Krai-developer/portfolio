import React, { useEffect, useRef } from 'react';
import {
  animate,
  createTimeline,
  createScope,
  onScroll,
  stagger,
  svg
} from 'animejs';

/**
 * Hybrid Floating Code Environment Background (Upgraded)
 * - Strictly renders below the Hero section (About -> Services -> Work -> Tech Stack -> Availability -> Contact)
 * - Uses Anime.js v4 (`animate`, `createTimeline`, `onScroll`, `stagger`, `svg.createDrawable`, `svg.createMotionPath`, `createScope`)
 * - Features:
 *   1. True 3D wireframe cube + orbital computational geometry
 *   2. Traveling AI signal pulses along neural network SVG curves (`svg.createMotionPath`)
 *   3. Depth-layered holographic glass code panels with subtle scanline shimmer
 *   4. Multi-depth digital data particles with scroll-scrubbed parallax
 *   5. Bidirectional scroll synchronization (smoothly reverses on upward scroll)
 */
export const HybridCodeBackground: React.FC = () => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const scopeRef = useRef<ReturnType<typeof createScope> | null>(null);

  useEffect(() => {
    if (!rootRef.current) return;

    scopeRef.current = createScope({
      root: rootRef.current,
      mediaQueries: {
        reduceMotion: '(prefers-reduced-motion: reduce)',
        isMobile: '(max-width: 767px)'
      }
    }).add((self) => {
      const reduceMotion = Boolean(self?.matches?.reduceMotion);
      const isMobile = Boolean(self?.matches?.isMobile);

      if (reduceMotion) {
        animate('.hc-fade-target', {
          opacity: 0.45,
          duration: 300
        });
        return;
      }

      // ---------------------------------------------------------------------------
      // 1. CONTINUOUS AMBIENT MOTION (Floating depth, node pulses, 3D cube, scanlines)
      // ---------------------------------------------------------------------------
      animate('.hc-ambient-float', {
        y: [-8, 8],
        rotateZ: [-1, 1],
        duration: 4800,
        delay: stagger(350),
        direction: 'alternate',
        loop: true,
        ease: 'inOutSine'
      });

      animate('.hc-node-pulse', {
        scale: [0.85, 1.4],
        opacity: [0.3, 0.95],
        duration: 2400,
        delay: stagger(200),
        direction: 'alternate',
        loop: true,
        ease: 'inOutQuad'
      });

      animate('.hc-cube-3d', {
        rotateX: [18, 378],
        rotateY: [25, 385],
        duration: 26000,
        loop: true,
        ease: 'linear'
      });

      animate('.hc-orbital-ring', {
        rotate: [0, 360],
        duration: 34000,
        loop: true,
        ease: 'linear'
      });

      animate('.hc-holo-scanline', {
        y: ['-100%', '420%'],
        opacity: [0, 0.5, 0],
        duration: 4200,
        delay: stagger(1200),
        loop: true,
        ease: 'inOutSine'
      });

      // Traveling AI data packets along neural network curves
      const aboutPath1 = svg.createMotionPath('#hc-neural-curve-1');
      if (aboutPath1) {
        animate('.hc-signal-packet-1', {
          ...aboutPath1,
          duration: 5200,
          loop: true,
          ease: 'inOutSine'
        });
      }

      const aboutPath2 = svg.createMotionPath('#hc-neural-curve-2');
      if (aboutPath2) {
        animate('.hc-signal-packet-2', {
          ...aboutPath2,
          duration: 6000,
          delay: 900,
          loop: true,
          ease: 'inOutSine'
        });
      }

      const skillsPath = svg.createMotionPath('#hc-skills-curve-1');
      if (skillsPath) {
        animate('.hc-signal-packet-3', {
          ...skillsPath,
          duration: 5600,
          loop: true,
          ease: 'linear'
        });
      }

      // ---------------------------------------------------------------------------
      // 2. ZONE 1 — ABOUT: Floating AI/Python/TS Code & Progressive Neural Drawing
      // ---------------------------------------------------------------------------
      const aboutZone = createTimeline({
        defaults: { ease: 'linear', duration: 1000 },
        autoplay: onScroll({
          target: '.hc-zone-about',
          enter: 'bottom top',
          leave: 'top bottom',
          sync: 0.35
        })
      });

      aboutZone
        .add(
          '.hc-about-code-left',
          {
            y: [95, -80],
            x: isMobile ? [0, 0] : [-20, 16],
            rotateX: [16, -10],
            rotateY: [-20, 14],
            opacity: [0, 0.9, 0.9, 0.15]
          },
          0
        )
        .add(
          '.hc-about-code-right',
          {
            y: [115, -90],
            x: isMobile ? [0, 0] : [22, -16],
            rotateX: [-14, 14],
            rotateY: [22, -14],
            opacity: [0, 0.86, 0.86, 0.15]
          },
          0
        )
        .add(
          svg.createDrawable('.hc-about-neural-line'),
          {
            draw: ['0 0', '0 1'],
            opacity: [0.12, 0.85, 0.3],
            delay: stagger(110)
          },
          0
        );

      // ---------------------------------------------------------------------------
      // 3. ZONE 2 — SERVICES & WORK: 3D Holographic Code Panels & Telemetry Streams
      // ---------------------------------------------------------------------------
      const projectsZone = createTimeline({
        defaults: { ease: 'linear', duration: 1000 },
        autoplay: onScroll({
          target: '.hc-zone-projects',
          enter: 'bottom top',
          leave: 'top bottom',
          sync: 0.35
        })
      });

      projectsZone
        .add(
          '.hc-holo-panel-1',
          {
            y: [130, -120],
            rotateX: [20, -12],
            rotateY: [24, -16],
            rotateZ: [-3, 2],
            scale: [0.92, 1.05],
            opacity: [0, 0.92, 0.92, 0.12]
          },
          0
        )
        .add(
          '.hc-holo-panel-2',
          {
            y: [155, -135],
            rotateX: [-18, 14],
            rotateY: [-24, 18],
            rotateZ: [3, -2],
            scale: [0.9, 1.05],
            opacity: [0, 0.88, 0.88, 0.12]
          },
          80
        )
        .add(
          '.hc-arch-stream',
          {
            y: [95, -125],
            opacity: [0.08, 0.82, 0.15],
            delay: stagger(90)
          },
          0
        )
        .add(
          svg.createDrawable('.hc-projects-neural-line'),
          {
            draw: ['0 0', '0 1'],
            opacity: [0.12, 0.85, 0.25],
            delay: stagger(100)
          },
          0
        );

      // ---------------------------------------------------------------------------
      // 4. ZONE 3 — TECH STACK: Computational Geometry, 3D Cube & Circuit Paths
      // ---------------------------------------------------------------------------
      const skillsZone = createTimeline({
        defaults: { ease: 'linear', duration: 1000 },
        autoplay: onScroll({
          target: '.hc-zone-skills',
          enter: 'bottom top',
          leave: 'top bottom',
          sync: 0.35
        })
      });

      skillsZone
        .add(
          '.hc-comp-symbol',
          {
            y: [120, -110],
            rotateZ: stagger([-22, 22]),
            scale: [0.86, 1.12],
            opacity: [0, 0.82, 0.82, 0.14],
            delay: stagger(70)
          },
          0
        )
        .add(
          '.hc-holo-panel-3',
          {
            y: [110, -100],
            rotateX: [16, -14],
            rotateY: [18, -16],
            opacity: [0, 0.9, 0.9, 0.14]
          },
          50
        )
        .add(
          svg.createDrawable('.hc-skills-circuit-path'),
          {
            draw: ['0 0', '0 1'],
            opacity: [0.1, 0.88, 0.28],
            delay: stagger(100)
          },
          0
        );

      // ---------------------------------------------------------------------------
      // 5. ZONE 4 — AVAILABILITY & CONTACT: Minimal Calm Tokens & Soft Signal Wave
      // ---------------------------------------------------------------------------
      const contactZone = createTimeline({
        defaults: { ease: 'linear', duration: 1000 },
        autoplay: onScroll({
          target: '.hc-zone-contact',
          enter: 'bottom top',
          leave: 'top bottom',
          sync: 0.4
        })
      });

      contactZone
        .add(
          '.hc-contact-token',
          {
            y: [70, -65],
            opacity: [0, 0.72, 0.72, 0.18],
            scale: [0.92, 1.04],
            delay: stagger(110)
          },
          0
        )
        .add(
          svg.createDrawable('.hc-contact-wave-path'),
          {
            draw: ['0 0', '0 1'],
            opacity: [0.06, 0.6, 0.22]
          },
          0
        );

      // ---------------------------------------------------------------------------
      // 6. GLOBAL MULTI-LAYER DIGITAL DATA PARTICLES (Near / Mid / Far Parallax)
      // ---------------------------------------------------------------------------
      const globalParallax = createTimeline({
        defaults: { ease: 'linear', duration: 1000 },
        autoplay: onScroll({
          target: rootRef.current,
          enter: 'top bottom',
          leave: 'bottom top',
          sync: 0.25
        })
      });

      globalParallax
        .add(
          '.hc-particle-near',
          {
            y: [180, -260],
            opacity: [0.25, 0.9, 0.35],
            delay: stagger(35)
          },
          0
        )
        .add(
          '.hc-particle-mid',
          {
            y: [110, -160],
            opacity: [0.18, 0.65, 0.22],
            delay: stagger(45)
          },
          0
        )
        .add(
          '.hc-particle-far',
          {
            y: [55, -80],
            opacity: [0.12, 0.45, 0.16],
            delay: stagger(55)
          },
          0
        );
    });

    return () => {
      scopeRef.current?.revert();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none z-0"
      style={{ perspective: '1400px' }}
    >
      {/* Top feather mask so the transition immediately below HeroSection is 100% seamless */}
      <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#0B0B0F] via-[#0B0B0F]/90 to-transparent z-10" />

      {/* Subtle architectural perspective grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(245,245,245,0.45) 1px, transparent 1px), linear-gradient(to bottom, rgba(245,245,245,0.45) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(ellipse 85% 75% at 50% 45%, black 35%, transparent 100%)'
        }}
      />

      {/* Atmospheric depth lighting (Deep Navy / Electric Cyan / Violet / White Smoke) */}
      <div className="absolute top-[5%] left-[3%] w-[30rem] h-[30rem] rounded-full bg-cyan-500/[0.06] blur-[135px]" />
      <div className="absolute top-[26%] right-[2%] w-[34rem] h-[34rem] rounded-full bg-violet-500/[0.055] blur-[145px]" />
      <div className="absolute top-[54%] left-[6%] w-[32rem] h-[32rem] rounded-full bg-sky-500/[0.05] blur-[140px]" />
      <div className="absolute bottom-[6%] right-[8%] w-[28rem] h-[28rem] rounded-full bg-[#F5F5F5]/[0.04] blur-[125px]" />

      {/* =====================================================================
          MULTI-DEPTH DIGITAL DATA PARTICLES (Near / Mid / Far)
      ===================================================================== */}
      <div className="absolute inset-0">
        {/* Near Layer Particles (Crisp Electric Cyan) */}
        {[
          { top: '6%', left: '11%' },
          { top: '15%', left: '89%' },
          { top: '26%', left: '7%' },
          { top: '37%', left: '92%' },
          { top: '48%', left: '13%' },
          { top: '60%', left: '87%' },
          { top: '73%', left: '8%' },
          { top: '85%', left: '90%' }
        ].map((pos, idx) => (
          <div
            key={`near-${idx}`}
            style={{ top: pos.top, left: pos.left }}
            className="hc-particle-near hc-fade-target absolute w-2 h-2 rounded-full bg-cyan-300/85 shadow-[0_0_16px_rgba(56,189,248,0.9)]"
          />
        ))}

        {/* Mid Layer Particles (Violet & Sky Blue) */}
        {[
          { top: '10%', left: '23%' },
          { top: '18%', left: '77%' },
          { top: '30%', left: '18%' },
          { top: '42%', left: '83%' },
          { top: '53%', left: '21%' },
          { top: '65%', left: '79%' },
          { top: '78%', left: '20%' },
          { top: '90%', left: '75%' }
        ].map((pos, idx) => (
          <div
            key={`mid-${idx}`}
            style={{ top: pos.top, left: pos.left }}
            className="hc-particle-mid hc-fade-target hidden sm:block absolute w-1.5 h-1.5 rounded-full bg-violet-300/75 shadow-[0_0_12px_rgba(167,139,250,0.8)]"
          />
        ))}

        {/* Far Layer Depth-of-Field Particles (Softly blurred White Smoke) */}
        {[
          { top: '8%', left: '45%' },
          { top: '22%', left: '55%' },
          { top: '34%', left: '41%' },
          { top: '46%', left: '59%' },
          { top: '58%', left: '47%' },
          { top: '70%', left: '53%' },
          { top: '82%', left: '43%' },
          { top: '93%', left: '57%' }
        ].map((pos, idx) => (
          <div
            key={`far-${idx}`}
            style={{ top: pos.top, left: pos.left }}
            className="hc-particle-far hc-fade-target absolute w-1.5 h-1.5 rounded-full bg-[#F5F5F5]/45 blur-[0.7px]"
          />
        ))}
      </div>

      {/* =====================================================================
          ZONE 1: ABOUT — Floating Python/TS Code & Traveling Neural Pulses
      ===================================================================== */}
      <div className="hc-zone-about relative w-full h-[25%] min-h-[700px]">
        <svg
          className="absolute inset-0 w-full h-full opacity-80"
          viewBox="0 0 1440 800"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="hc-grad-cyan-violet" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#818CF8" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#F5F5F5" stopOpacity="0.22" />
            </linearGradient>
            <filter id="hc-glow">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path
            id="hc-neural-curve-1"
            className="hc-about-neural-line"
            d="M 60 185 C 220 115, 330 275, 480 215 C 630 155, 740 315, 910 245"
            stroke="url(#hc-grad-cyan-violet)"
            strokeWidth="1.3"
            strokeLinecap="round"
            fill="none"
          />
          <path
            id="hc-neural-curve-2"
            className="hc-about-neural-line"
            d="M 1380 155 C 1220 245, 1090 140, 930 250 C 790 340, 660 230, 515 335"
            stroke="url(#hc-grad-cyan-violet)"
            strokeWidth="1.3"
            strokeLinecap="round"
            fill="none"
          />
          <path
            className="hc-about-neural-line"
            d="M 130 530 C 320 445, 480 595, 695 495 C 905 395, 1110 535, 1325 445"
            stroke="url(#hc-grad-cyan-violet)"
            strokeWidth="1"
            strokeDasharray="4 6"
            strokeLinecap="round"
            fill="none"
          />

          {/* Traveling Glowing Data Packets along Neural Paths */}
          <circle
            className="hc-signal-packet-1"
            r="4"
            fill="#38BDF8"
            filter="url(#hc-glow)"
          />
          <circle
            className="hc-signal-packet-2"
            r="3.5"
            fill="#A78BFA"
            filter="url(#hc-glow)"
          />

          {/* Glowing Neural Nodes */}
          {[
            { cx: 60, cy: 185, color: '#38BDF8' },
            { cx: 480, cy: 215, color: '#A78BFA' },
            { cx: 910, cy: 245, color: '#F5F5F5' },
            { cx: 1380, cy: 155, color: '#38BDF8' },
            { cx: 930, cy: 250, color: '#818CF8' },
            { cx: 515, cy: 335, color: '#38BDF8' },
            { cx: 695, cy: 495, color: '#A78BFA' },
            { cx: 1325, cy: 445, color: '#F5F5F5' }
          ].map((node, i) => (
            <g key={`about-node-${i}`}>
              <circle
                cx={node.cx}
                cy={node.cy}
                r="9"
                fill={node.color}
                fillOpacity="0.16"
                className="hc-node-pulse"
              />
              <circle cx={node.cx} cy={node.cy} r="3" fill={node.color} fillOpacity="0.9" />
            </g>
          ))}
        </svg>

        {/* Left Floating Python AI Snippet */}
        <div
          className="hc-about-code-left hc-fade-target absolute top-[13%] left-[2%] xl:left-[3%] max-w-[270px] sm:max-w-[305px] rounded-2xl border border-cyan-400/25 bg-[#0C111E]/75 backdrop-blur-xl p-4 shadow-[0_0_35px_rgba(56,189,248,0.12)] overflow-hidden"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="hc-holo-scanline pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-transparent via-cyan-400/15 to-transparent" />
          <div className="hc-ambient-float relative">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-2 mb-2.5">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400/80" />
                <span className="w-2 h-2 rounded-full bg-violet-400/80" />
                <span className="w-2 h-2 rounded-full bg-white/35" />
              </div>
              <span className="text-[10px] font-mono text-cyan-300/85">neural_engine.py</span>
            </div>
            <pre className="text-[10px] sm:text-[11px] font-mono leading-relaxed text-slate-300/95 overflow-hidden">
              <code>
                <span className="text-violet-400">async def</span>{' '}
                <span className="text-cyan-300">infer_context</span>(tensor):{'\n'}
                {'  '}attn = <span className="text-sky-300">MultiHeadAttention</span>(d=512){'\n'}
                {'  '}latent = <span className="text-violet-400">await</span> attn.forward(tensor){'\n'}
                {'  '}<span className="text-violet-400">return</span> softmax(latent /{' '}
                <span className="text-amber-300">0.07</span>)
              </code>
            </pre>
          </div>
        </div>

        {/* Right Floating TypeScript Architecture Snippet */}
        <div
          className="hc-about-code-right hc-fade-target hidden md:block absolute top-[48%] right-[2%] xl:right-[3%] max-w-[295px] rounded-2xl border border-violet-400/25 bg-[#0C111E]/70 backdrop-blur-xl p-4 shadow-[0_0_35px_rgba(167,139,250,0.12)] overflow-hidden"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="hc-holo-scanline pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-transparent via-violet-400/15 to-transparent" />
          <div className="hc-ambient-float relative">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-2 mb-2.5">
              <span className="text-[10px] font-mono text-violet-300/85">agent_pipeline.ts</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300">
                RUNTIME
              </span>
            </div>
            <pre className="text-[10px] sm:text-[11px] font-mono leading-relaxed text-slate-300/95 overflow-hidden">
              <code>
                <span className="text-violet-400">export const</span>{' '}
                <span className="text-cyan-300">orchestrate</span> = &lt;T&gt;({'\n'}
                {'  '}nodes: <span className="text-sky-300">GraphNode</span>&lt;T&gt;[]{'\n'}
                ) =&gt; nodes.<span className="text-cyan-300">map</span>(n =&gt; n.activate());
              </code>
            </pre>
          </div>
        </div>
      </div>

      {/* =====================================================================
          ZONE 2: SERVICES & WORK — 3D Holographic Code Panels & Telemetry
      ===================================================================== */}
      <div className="hc-zone-projects relative w-full h-[33%] min-h-[1080px]">
        <svg
          className="absolute inset-0 w-full h-full opacity-75"
          viewBox="0 0 1440 1100"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          <path
            className="hc-projects-neural-line"
            d="M 85 120 L 275 240 L 275 510 L 520 640"
            stroke="#38BDF8"
            strokeOpacity="0.35"
            strokeWidth="1.25"
            strokeLinecap="round"
            fill="none"
          />
          <path
            className="hc-projects-neural-line"
            d="M 1355 180 L 1165 320 L 1165 620 L 940 760"
            stroke="#A78BFA"
            strokeOpacity="0.35"
            strokeWidth="1.25"
            strokeLinecap="round"
            fill="none"
          />
          <path
            className="hc-projects-neural-line"
            d="M 190 890 C 520 740, 920 960, 1270 820"
            stroke="#F5F5F5"
            strokeOpacity="0.24"
            strokeWidth="1.1"
            strokeLinecap="round"
            fill="none"
          />
          {[
            { cx: 85, cy: 120, c: '#38BDF8' },
            { cx: 275, cy: 240, c: '#38BDF8' },
            { cx: 275, cy: 510, c: '#A78BFA' },
            { cx: 1355, cy: 180, c: '#A78BFA' },
            { cx: 1165, cy: 320, c: '#38BDF8' },
            { cx: 1165, cy: 620, c: '#F5F5F5' }
          ].map((pt, idx) => (
            <circle
              key={`proj-pt-${idx}`}
              cx={pt.cx}
              cy={pt.cy}
              r="3.5"
              fill={pt.c}
              fillOpacity="0.75"
              className="hc-node-pulse"
            />
          ))}
        </svg>

        {/* Holographic Panel 1: Vector Database & Semantic Retrieval */}
        <div
          className="hc-holo-panel-1 hc-fade-target hidden lg:block absolute top-[11%] right-[2%] w-[315px] rounded-2xl border border-cyan-300/25 bg-gradient-to-br from-[#0E172A]/80 via-[#0B0F1A]/75 to-[#151028]/80 backdrop-blur-xl p-4 shadow-[0_0_45px_rgba(56,189,248,0.12)] overflow-hidden"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="hc-holo-scanline pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-transparent via-cyan-300/15 to-transparent" />
          <div className="hc-ambient-float relative">
            <div className="flex items-center justify-between border-b border-cyan-400/15 pb-2.5 mb-2.5">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[10px] font-mono tracking-wider uppercase text-cyan-300">
                  HOLO-NODE // VECTOR_DB
                </span>
              </div>
              <span className="text-[10px] font-mono text-content-muted">99.4%</span>
            </div>
            <pre className="text-[10px] font-mono leading-relaxed text-slate-300">
              <code>
                <span className="text-violet-400">const</span> results ={' '}
                <span className="text-violet-400">await</span> db.vectors.query({'{'}{'\n'}
                {'  '}embedding: <span className="text-cyan-300">embedPrompt</span>(input),{'\n'}
                {'  '}topK: <span className="text-amber-300">8</span>,{'\n'}
                {'  '}metric: <span className="text-emerald-300">&apos;cosine_similarity&apos;</span>
                {'\n'}
                {'}'});
              </code>
            </pre>
            <div className="mt-3 flex items-center justify-between text-[9px] font-mono text-cyan-200/75">
              <span>LATENCY: 14ms</span>
              <span>DIM: 1536</span>
            </div>
          </div>
        </div>

        {/* Holographic Panel 2: Streaming Inference API */}
        <div
          className="hc-holo-panel-2 hc-fade-target hidden lg:block absolute top-[57%] left-[2%] w-[305px] rounded-2xl border border-violet-300/25 bg-gradient-to-br from-[#151028]/80 via-[#0B0F1A]/75 to-[#0E172A]/80 backdrop-blur-xl p-4 shadow-[0_0_45px_rgba(167,139,250,0.12)] overflow-hidden"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="hc-holo-scanline pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-transparent via-violet-300/15 to-transparent" />
          <div className="hc-ambient-float relative">
            <div className="flex items-center justify-between border-b border-violet-400/15 pb-2.5 mb-2.5">
              <span className="text-[10px] font-mono tracking-wider uppercase text-violet-300">
                SYS_ARCH // STREAM_API
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300">
                TLS 1.3
              </span>
            </div>
            <pre className="text-[10px] font-mono leading-relaxed text-slate-300">
              <code>
                router.<span className="text-cyan-300">post</span>(
                <span className="text-emerald-300">&apos;/v1/inference&apos;</span>, verifyJWT,{'\n'}
                {'  '}<span className="text-violet-400">async</span> (req, res) =&gt; {'{'}{'\n'}
                {'    '}<span className="text-violet-400">const</span> stream ={' '}
                <span className="text-cyan-300">createAgentStream</span>(req);{'\n'}
                {'    '}<span className="text-violet-400">return</span> stream.pipe(res);{'\n'}
                {'  '}
                {'}'});
              </code>
            </pre>
          </div>
        </div>

        {/* Floating Telemetry Stream Badges */}
        <div className="hc-arch-stream hc-fade-target hidden sm:flex absolute top-[31%] left-[3%] flex-col gap-1.5 font-mono text-[10px] text-cyan-300/55">
          <span>0x7F4A :: TENSOR_ALLOC [OK]</span>
          <span>0x8B1C :: GRAPH_SYNC [128_NODES]</span>
        </div>
        <div className="hc-arch-stream hc-fade-target hidden sm:flex absolute top-[78%] right-[3.5%] flex-col gap-1.5 font-mono text-[10px] text-violet-300/55 text-right">
          <span>CLUSTER_STATE :: HEALTHY</span>
          <span>THROUGHPUT :: 4.8 GB/s</span>
        </div>
      </div>

      {/* =====================================================================
          ZONE 3: TECH STACK — True 3D Wireframe Cube, Orbital Ring & Symbols
      ===================================================================== */}
      <div className="hc-zone-skills relative w-full h-[26%] min-h-[820px]">
        <svg
          className="absolute inset-0 w-full h-full opacity-80"
          viewBox="0 0 1440 850"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          <path
            id="hc-skills-curve-1"
            className="hc-skills-circuit-path"
            d="M 110 220 H 340 L 420 300 H 680"
            stroke="#38BDF8"
            strokeOpacity="0.4"
            strokeWidth="1.25"
            strokeLinecap="round"
            fill="none"
          />
          <path
            className="hc-skills-circuit-path"
            d="M 1330 260 H 1090 L 1010 340 H 780"
            stroke="#A78BFA"
            strokeOpacity="0.4"
            strokeWidth="1.25"
            strokeLinecap="round"
            fill="none"
          />
          <path
            className="hc-skills-circuit-path"
            d="M 240 640 L 440 520 L 720 640 L 1000 520 L 1220 640"
            stroke="#F5F5F5"
            strokeOpacity="0.24"
            strokeWidth="1.1"
            strokeLinecap="round"
            fill="none"
          />
          <polygon
            className="hc-skills-circuit-path"
            points="180,420 220,395 260,420 260,465 220,490 180,465"
            stroke="#38BDF8"
            strokeOpacity="0.38"
            strokeWidth="1.1"
            fill="none"
          />
          <polygon
            className="hc-skills-circuit-path"
            points="1190,430 1230,405 1270,430 1270,475 1230,500 1190,475"
            stroke="#A78BFA"
            strokeOpacity="0.38"
            strokeWidth="1.1"
            fill="none"
          />
          <circle
            className="hc-signal-packet-3"
            r="3.5"
            fill="#38BDF8"
            filter="url(#hc-glow)"
          />
        </svg>

        {/* Floating Programming & Mathematical Symbols */}
        {[
          { sym: '{ }', top: '12%', left: '5%', color: 'text-cyan-300/50 border-cyan-400/25' },
          { sym: '[ ]', top: '24%', left: '91%', color: 'text-violet-300/50 border-violet-400/25' },
          { sym: '( ) =>', top: '52%', left: '4%', color: 'text-white/45 border-white/15' },
          { sym: '∑ λ', top: '64%', left: '90%', color: 'text-cyan-300/50 border-cyan-400/25' },
          { sym: '</>', top: '82%', left: '7%', color: 'text-violet-300/50 border-violet-400/25' },
          { sym: '∇ f(x)', top: '38%', left: '88%', color: 'text-sky-300/50 border-sky-400/25' }
        ].map((item, idx) => (
          <div
            key={`sym-${idx}`}
            style={{ top: item.top, left: item.left }}
            className={`hc-comp-symbol hc-fade-target absolute px-3 py-1.5 rounded-xl bg-[#0C111E]/65 backdrop-blur-md border font-mono text-xs sm:text-sm font-semibold shadow-card-dark ${item.color}`}
          >
            {item.sym}
          </div>
        ))}

        {/* True 6-Face 3D Wireframe Cube + Orbital AI Ring */}
        <div
          className="hc-comp-symbol hc-fade-target hidden md:flex absolute top-[15%] right-[6.5%] w-24 h-24 items-center justify-center"
          style={{ perspective: '700px' }}
        >
          <div className="hc-orbital-ring absolute inset-0 rounded-full border border-dashed border-violet-400/30" />
          <div
            className="hc-cube-3d relative w-11 h-11"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div
              className="absolute inset-0 border border-cyan-400/45 bg-cyan-400/[0.04]"
              style={{ transform: 'translateZ(22px)' }}
            />
            <div
              className="absolute inset-0 border border-cyan-400/45 bg-cyan-400/[0.04]"
              style={{ transform: 'rotateY(180deg) translateZ(22px)' }}
            />
            <div
              className="absolute inset-0 border border-violet-400/45 bg-violet-400/[0.04]"
              style={{ transform: 'rotateY(90deg) translateZ(22px)' }}
            />
            <div
              className="absolute inset-0 border border-violet-400/45 bg-violet-400/[0.04]"
              style={{ transform: 'rotateY(-90deg) translateZ(22px)' }}
            />
            <div
              className="absolute inset-0 border border-white/30 bg-white/[0.03]"
              style={{ transform: 'rotateX(90deg) translateZ(22px)' }}
            />
            <div
              className="absolute inset-0 border border-white/30 bg-white/[0.03]"
              style={{ transform: 'rotateX(-90deg) translateZ(22px)' }}
            />
          </div>
        </div>

        {/* Holographic Panel 3: Tensor Graph Type Definition */}
        <div
          className="hc-holo-panel-3 hc-fade-target hidden xl:block absolute top-[44%] left-[2.5%] w-[290px] rounded-2xl border border-white/15 bg-[#0C111E]/75 backdrop-blur-xl p-3.5 overflow-hidden"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="hc-holo-scanline pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
          <div className="hc-ambient-float relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
              <span className="text-[10px] font-mono text-cyan-300">model_weights.ts</span>
              <span className="text-[9px] font-mono text-emerald-300">OPTIMIZED</span>
            </div>
            <pre className="text-[10px] font-mono leading-relaxed text-slate-300/95">
              <code>
                <span className="text-violet-400">type</span>{' '}
                <span className="text-sky-300">TensorGraph</span> = {'{'}{'\n'}
                {'  '}layers: <span className="text-amber-300">number</span>[];{'\n'}
                {'  '}activation: <span className="text-emerald-300">&apos;gelu&apos;</span> |{' '}
                <span className="text-emerald-300">&apos;silu&apos;</span>;{'\n'}
                {'}'};
              </code>
            </pre>
          </div>
        </div>
      </div>

      {/* =====================================================================
          ZONE 4: AVAILABILITY & CONTACT — Minimal Calm Tokens & Soft Glow
      ===================================================================== */}
      <div className="hc-zone-contact relative w-full h-[16%] min-h-[520px]">
        <svg
          className="absolute inset-0 w-full h-full opacity-65"
          viewBox="0 0 1440 520"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          <path
            className="hc-contact-wave-path"
            d="M 120 260 C 440 160, 1000 360, 1320 220"
            stroke="url(#hc-grad-cyan-violet)"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
          />
          <circle
            cx="120"
            cy="260"
            r="3.5"
            fill="#38BDF8"
            fillOpacity="0.7"
            className="hc-node-pulse"
          />
          <circle
            cx="1320"
            cy="220"
            r="3.5"
            fill="#A78BFA"
            fillOpacity="0.7"
            className="hc-node-pulse"
          />
        </svg>

        {[
          { text: 'await studio.connect({ status: "ready" });', top: '24%', left: '4%' },
          { text: 'return Response.json({ handshake: 200 });', top: '62%', left: '78%' },
          { text: '{ encrypted: true, protocol: "wss" }', top: '78%', left: '8%' }
        ].map((token, idx) => (
          <div
            key={`contact-tok-${idx}`}
            style={{ top: token.top, left: token.left }}
            className="hc-contact-token hc-fade-target hidden md:block absolute px-3 py-1.5 rounded-lg bg-[#0C111E]/60 border border-white/10 font-mono text-[10px] text-slate-300/75 backdrop-blur-md"
          >
            {token.text}
          </div>
        ))}
      </div>
    </div>
  );
};
