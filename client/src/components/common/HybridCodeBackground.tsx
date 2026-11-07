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
 * Hybrid Floating Code Environment Background
 * - Designed exclusively for the post-Hero portfolio sections (About -> Services -> Work -> Portal -> Skills -> Availability -> Contact)
 * - Uses Anime.js v4 (`animate`, `createTimeline`, `onScroll`, `stagger`, `svg.createDrawable`, `createScope`)
 * - Combines syntax-colored floating code fragments, 3D holographic glass code panels,
 *   progressive SVG AI neural networks, multi-depth data particles, and computational geometry.
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
      // 1. CONTINUOUS AMBIENT FLOATING CHOREOGRAPHY (Depth & 3D Perspective)
      // ---------------------------------------------------------------------------
      animate('.hc-ambient-float', {
        y: [-10, 10],
        rotateZ: [-1.2, 1.2],
        duration: 4600,
        delay: stagger(320),
        direction: 'alternate',
        loop: true,
        ease: 'inOutSine'
      });

      animate('.hc-node-pulse', {
        scale: [0.85, 1.35],
        opacity: [0.35, 0.95],
        duration: 2400,
        delay: stagger(210),
        direction: 'alternate',
        loop: true,
        ease: 'inOutQuad'
      });

      animate('.hc-wireframe-spin', {
        rotateX: [0, 360],
        rotateY: [0, 360],
        duration: 28000,
        loop: true,
        ease: 'linear'
      });

      // ---------------------------------------------------------------------------
      // 2. ZONE 1 — ABOUT SECTION: Floating Programming Fragments & Neural Links
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
            y: [90, -85],
            x: isMobile ? [0, 0] : [-24, 14],
            rotateX: [14, -10],
            rotateY: [-18, 12],
            opacity: [0, 0.85, 0.85, 0.12]
          },
          0
        )
        .add(
          '.hc-about-code-right',
          {
            y: [110, -95],
            x: isMobile ? [0, 0] : [28, -16],
            rotateX: [-12, 14],
            rotateY: [20, -14],
            opacity: [0, 0.8, 0.8, 0.12]
          },
          0
        )
        .add(
          svg.createDrawable('.hc-about-neural-line'),
          {
            draw: ['0 0', '0 1'],
            opacity: [0.1, 0.75, 0.25],
            delay: stagger(120)
          },
          0
        );

      // ---------------------------------------------------------------------------
      // 3. ZONE 2 — SERVICES & PROJECTS: Holographic 3D Code Panels & Architecture
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
            rotateX: [18, -12],
            rotateY: [22, -16],
            rotateZ: [-3, 2],
            scale: [0.92, 1.04],
            opacity: [0, 0.88, 0.88, 0.1]
          },
          0
        )
        .add(
          '.hc-holo-panel-2',
          {
            y: [160, -140],
            rotateX: [-16, 14],
            rotateY: [-24, 18],
            rotateZ: [3, -2],
            scale: [0.9, 1.05],
            opacity: [0, 0.85, 0.85, 0.1]
          },
          80
        )
        .add(
          '.hc-arch-stream',
          {
            y: [100, -130],
            opacity: [0.05, 0.75, 0.1],
            delay: stagger(90)
          },
          0
        )
        .add(
          svg.createDrawable('.hc-projects-neural-line'),
          {
            draw: ['0 0', '0 1'],
            opacity: [0.1, 0.8, 0.2],
            delay: stagger(100)
          },
          0
        );

      // ---------------------------------------------------------------------------
      // 4. ZONE 3 — PORTAL & SKILLS: Computational Geometry, Symbols & Neural Net
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
            rotateZ: stagger([-25, 25]),
            scale: [0.85, 1.12],
            opacity: [0, 0.78, 0.78, 0.12],
            delay: stagger(70)
          },
          0
        )
        .add(
          '.hc-holo-panel-3',
          {
            y: [115, -105],
            rotateX: [15, -15],
            rotateY: [18, -18],
            opacity: [0, 0.86, 0.86, 0.12]
          },
          50
        )
        .add(
          svg.createDrawable('.hc-skills-circuit-path'),
          {
            draw: ['0 0', '0 1'],
            opacity: [0.08, 0.85, 0.25],
            delay: stagger(110)
          },
          0
        );

      // ---------------------------------------------------------------------------
      // 5. ZONE 4 — AVAILABILITY & CONTACT: Minimal Calm Tokens & Soft Glow
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
            opacity: [0, 0.65, 0.65, 0.15],
            scale: [0.92, 1.04],
            delay: stagger(110)
          },
          0
        )
        .add(
          svg.createDrawable('.hc-contact-wave-path'),
          {
            draw: ['0 0', '0 1'],
            opacity: [0.05, 0.55, 0.2]
          },
          0
        );

      // ---------------------------------------------------------------------------
      // 6. GLOBAL MULTI-LAYER DIGITAL DATA PARTICLES (Scroll-Scrubbed Parallax)
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
            opacity: [0.2, 0.85, 0.3],
            delay: stagger(35)
          },
          0
        )
        .add(
          '.hc-particle-mid',
          {
            y: [110, -160],
            opacity: [0.15, 0.6, 0.2],
            delay: stagger(45)
          },
          0
        )
        .add(
          '.hc-particle-far',
          {
            y: [55, -80],
            opacity: [0.1, 0.4, 0.15],
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
      style={{ perspective: '1200px' }}
    >
      {/* Top feather mask so the transition immediately below HeroSection is 100% seamless */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#0B0B0F] via-[#0B0B0F]/85 to-transparent z-10" />

      {/* Subtle futuristic atmospheric depth lighting (Deep Navy / Electric Cyan / Violet / White Smoke) */}
      <div className="absolute top-[6%] left-[4%] w-[28rem] h-[28rem] rounded-full bg-cyan-500/[0.045] blur-[130px]" />
      <div className="absolute top-[28%] right-[3%] w-[32rem] h-[32rem] rounded-full bg-violet-500/[0.045] blur-[140px]" />
      <div className="absolute top-[56%] left-[8%] w-[30rem] h-[30rem] rounded-full bg-sky-500/[0.04] blur-[135px]" />
      <div className="absolute bottom-[8%] right-[10%] w-[26rem] h-[26rem] rounded-full bg-white/[0.035] blur-[120px]" />

      {/* =====================================================================
          MULTI-DEPTH DIGITAL DATA PARTICLES & DATA STREAMS
      ===================================================================== */}
      <div className="absolute inset-0">
        {/* Near Layer Particles (Electric Cyan & Soft White) */}
        {[
          { top: '7%', left: '12%' },
          { top: '16%', left: '88%' },
          { top: '27%', left: '8%' },
          { top: '38%', left: '91%' },
          { top: '49%', left: '14%' },
          { top: '61%', left: '86%' },
          { top: '74%', left: '9%' },
          { top: '86%', left: '89%' }
        ].map((pos, idx) => (
          <div
            key={`near-${idx}`}
            style={{ top: pos.top, left: pos.left }}
            className="hc-particle-near hc-fade-target absolute w-2 h-2 rounded-full bg-cyan-300/80 shadow-[0_0_14px_rgba(56,189,248,0.85)]"
          />
        ))}

        {/* Mid Layer Particles (Violet & Electric Blue) */}
        {[
          { top: '11%', left: '24%' },
          { top: '19%', left: '76%' },
          { top: '31%', left: '19%' },
          { top: '43%', left: '82%' },
          { top: '54%', left: '22%' },
          { top: '66%', left: '78%' },
          { top: '79%', left: '21%' },
          { top: '91%', left: '74%' }
        ].map((pos, idx) => (
          <div
            key={`mid-${idx}`}
            style={{ top: pos.top, left: pos.left }}
            className="hc-particle-mid hc-fade-target hidden sm:block absolute w-1.5 h-1.5 rounded-full bg-violet-300/70 shadow-[0_0_10px_rgba(167,139,250,0.75)]"
          />
        ))}

        {/* Far Layer Particles (Soft White Smoke) */}
        {[
          { top: '9%', left: '46%' },
          { top: '23%', left: '54%' },
          { top: '35%', left: '42%' },
          { top: '47%', left: '58%' },
          { top: '59%', left: '48%' },
          { top: '71%', left: '52%' },
          { top: '83%', left: '44%' },
          { top: '94%', left: '56%' }
        ].map((pos, idx) => (
          <div
            key={`far-${idx}`}
            style={{ top: pos.top, left: pos.left }}
            className="hc-particle-far hc-fade-target absolute w-1 h-1 rounded-full bg-[#F5F5F5]/50"
          />
        ))}
      </div>

      {/* =====================================================================
          ZONE 1: ABOUT SECTION — Floating AI/Python/TS Code & Neural Network
      ===================================================================== */}
      <div className="hc-zone-about relative w-full h-[24%] min-h-[680px]">
        {/* Neural Network SVG Overlay for About */}
        <svg
          className="absolute inset-0 w-full h-full opacity-75"
          viewBox="0 0 1440 800"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="hc-grad-cyan-violet" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.65" />
              <stop offset="50%" stopColor="#818CF8" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#F5F5F5" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Neural Connection Paths */}
          <path
            className="hc-about-neural-line"
            d="M 70 180 C 210 120, 310 260, 460 210 C 610 160, 720 310, 890 240"
            stroke="url(#hc-grad-cyan-violet)"
            strokeWidth="1.25"
            strokeLinecap="round"
            fill="none"
          />
          <path
            className="hc-about-neural-line"
            d="M 1370 150 C 1210 240, 1090 140, 930 250 C 790 340, 660 230, 520 330"
            stroke="url(#hc-grad-cyan-violet)"
            strokeWidth="1.25"
            strokeLinecap="round"
            fill="none"
          />
          <path
            className="hc-about-neural-line"
            d="M 140 520 C 320 440, 480 590, 690 490 C 900 390, 1110 530, 1320 440"
            stroke="url(#hc-grad-cyan-violet)"
            strokeWidth="1"
            strokeDasharray="4 6"
            strokeLinecap="round"
            fill="none"
          />

          {/* Glowing Neural Nodes */}
          {[
            { cx: 70, cy: 180, color: '#38BDF8' },
            { cx: 460, cy: 210, color: '#A78BFA' },
            { cx: 890, cy: 240, color: '#F5F5F5' },
            { cx: 1370, cy: 150, color: '#38BDF8' },
            { cx: 930, cy: 250, color: '#818CF8' },
            { cx: 520, cy: 330, color: '#38BDF8' },
            { cx: 690, cy: 490, color: '#A78BFA' },
            { cx: 1320, cy: 440, color: '#F5F5F5' }
          ].map((node, i) => (
            <g key={`about-node-${i}`}>
              <circle
                cx={node.cx}
                cy={node.cy}
                r="8"
                fill={node.color}
                fillOpacity="0.15"
                className="hc-node-pulse"
              />
              <circle cx={node.cx} cy={node.cy} r="3" fill={node.color} fillOpacity="0.85" />
            </g>
          ))}
        </svg>

        {/* Left Floating Python AI Embedding Snippet */}
        <div
          className="hc-about-code-left hc-fade-target absolute top-[14%] left-[2%] xl:left-[3.5%] max-w-[260px] sm:max-w-[300px] rounded-xl border border-cyan-400/20 bg-[#0D111C]/70 backdrop-blur-md p-3.5 shadow-[0_0_30px_rgba(56,189,248,0.08)]"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="hc-ambient-float">
            <div className="flex items-center justify-between border-b border-white/[0.07] pb-2 mb-2">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400/70" />
                <span className="w-2 h-2 rounded-full bg-violet-400/70" />
                <span className="w-2 h-2 rounded-full bg-white/30" />
              </div>
              <span className="text-[10px] font-mono text-cyan-300/80">neural_engine.py</span>
            </div>
            <pre className="text-[10px] sm:text-[11px] font-mono leading-relaxed text-slate-300/90 overflow-hidden">
              <code>
                <span className="text-violet-400">async def</span>{' '}
                <span className="text-cyan-300">infer_context</span>(tensor):{'\n'}
                {'  '}attn = <span className="text-sky-300"> MultiHeadAttention</span>(d=512){'\n'}
                {'  '}latent = <span className="text-violet-400">await</span> attn.forward(tensor){'\n'}
                {'  '}<span className="text-violet-400">return</span> softmax(latent /{' '}
                <span className="text-amber-300">0.07</span>)
              </code>
            </pre>
          </div>
        </div>

        {/* Right Floating TypeScript Architecture Snippet */}
        <div
          className="hc-about-code-right hc-fade-target hidden md:block absolute top-[46%] right-[2%] xl:right-[3.5%] max-w-[290px] rounded-xl border border-violet-400/20 bg-[#0D111C]/65 backdrop-blur-md p-3.5 shadow-[0_0_30px_rgba(167,139,250,0.08)]"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="hc-ambient-float">
            <div className="flex items-center justify-between border-b border-white/[0.07] pb-2 mb-2">
              <span className="text-[10px] font-mono text-violet-300/80">agent_pipeline.ts</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-300">
                v4.2
              </span>
            </div>
            <pre className="text-[10px] sm:text-[11px] font-mono leading-relaxed text-slate-300/90 overflow-hidden">
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
          ZONE 2: SERVICES & PROJECTS — 3D Holographic Code Panels & Data Streams
      ===================================================================== */}
      <div className="hc-zone-projects relative w-full h-[34%] min-h-[1100px]">
        {/* Architectural Neural & Data Stream SVG */}
        <svg
          className="absolute inset-0 w-full h-full opacity-70"
          viewBox="0 0 1440 1100"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          <path
            className="hc-projects-neural-line"
            d="M 90 120 L 280 240 L 280 510 L 520 640"
            stroke="#38BDF8"
            strokeOpacity="0.32"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            className="hc-projects-neural-line"
            d="M 1350 180 L 1160 320 L 1160 620 L 940 760"
            stroke="#A78BFA"
            strokeOpacity="0.32"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            className="hc-projects-neural-line"
            d="M 200 880 C 520 740, 920 960, 1260 820"
            stroke="#F5F5F5"
            strokeOpacity="0.22"
            strokeWidth="1"
            strokeLinecap="round"
            fill="none"
          />
          {[
            { cx: 90, cy: 120, c: '#38BDF8' },
            { cx: 280, cy: 240, c: '#38BDF8' },
            { cx: 280, cy: 510, c: '#A78BFA' },
            { cx: 1350, cy: 180, c: '#A78BFA' },
            { cx: 1160, cy: 320, c: '#38BDF8' },
            { cx: 1160, cy: 620, c: '#F5F5F5' }
          ].map((pt, idx) => (
            <circle
              key={`proj-pt-${idx}`}
              cx={pt.cx}
              cy={pt.cy}
              r="3.5"
              fill={pt.c}
              fillOpacity="0.7"
              className="hc-node-pulse"
            />
          ))}
        </svg>

        {/* Holographic Panel 1: API & Vector Database Query */}
        <div
          className="hc-holo-panel-1 hc-fade-target hidden lg:block absolute top-[12%] right-[2.5%] w-[310px] rounded-2xl border border-cyan-300/25 bg-gradient-to-br from-[#0E1628]/75 via-[#0B0F1A]/70 to-[#141026]/75 backdrop-blur-xl p-4 shadow-[0_0_40px_rgba(56,189,248,0.1)]"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="hc-ambient-float">
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
            <div className="mt-3 flex items-center justify-between text-[9px] font-mono text-cyan-200/70">
              <span>LATENCY: 14ms</span>
              <span>DIM: 1536</span>
            </div>
          </div>
        </div>

        {/* Holographic Panel 2: Distributed Microservice & MongoDB Aggregation */}
        <div
          className="hc-holo-panel-2 hc-fade-target hidden lg:block absolute top-[58%] left-[2%] w-[300px] rounded-2xl border border-violet-300/25 bg-gradient-to-br from-[#141026]/75 via-[#0B0F1A]/70 to-[#0E1628]/75 backdrop-blur-xl p-4 shadow-[0_0_40px_rgba(167,139,250,0.1)]"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="hc-ambient-float">
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

        {/* Floating Vertical Data Stream Badges */}
        <div className="hc-arch-stream hc-fade-target hidden sm:flex absolute top-[32%] left-[3%] flex-col gap-1.5 font-mono text-[10px] text-cyan-300/50">
          <span>0x7F4A :: TENSOR_ALLOC [OK]</span>
          <span>0x8B1C :: GRAPH_SYNC [128_NODES]</span>
        </div>
        <div className="hc-arch-stream hc-fade-target hidden sm:flex absolute top-[78%] right-[4%] flex-col gap-1.5 font-mono text-[10px] text-violet-300/50 text-right">
          <span>CLUSTER_STATE :: HEALTHY</span>
          <span>THROUGHPUT :: 4.8 GB/s</span>
        </div>
      </div>

      {/* =====================================================================
          ZONE 3: PORTAL & TECH STACK — Computational Geometry & Programming Symbols
      ===================================================================== */}
      <div className="hc-zone-skills relative w-full h-[26%] min-h-[820px]">
        {/* Circuit & Neural Mesh SVG */}
        <svg
          className="absolute inset-0 w-full h-full opacity-75"
          viewBox="0 0 1440 850"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          <path
            className="hc-skills-circuit-path"
            d="M 110 220 H 340 L 420 300 H 680"
            stroke="#38BDF8"
            strokeOpacity="0.38"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            className="hc-skills-circuit-path"
            d="M 1330 260 H 1090 L 1010 340 H 780"
            stroke="#A78BFA"
            strokeOpacity="0.38"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            className="hc-skills-circuit-path"
            d="M 240 640 L 440 520 L 720 640 L 1000 520 L 1220 640"
            stroke="#F5F5F5"
            strokeOpacity="0.22"
            strokeWidth="1.1"
            strokeLinecap="round"
            fill="none"
          />
          {/* Wireframe Hexagon & Computational Octagon */}
          <polygon
            className="hc-skills-circuit-path"
            points="180,420 220,395 260,420 260,465 220,490 180,465"
            stroke="#38BDF8"
            strokeOpacity="0.35"
            strokeWidth="1.1"
            fill="none"
          />
          <polygon
            className="hc-skills-circuit-path"
            points="1190,430 1230,405 1270,430 1270,475 1230,500 1190,475"
            stroke="#A78BFA"
            strokeOpacity="0.35"
            strokeWidth="1.1"
            fill="none"
          />
        </svg>

        {/* Floating Programming & Mathematical Symbols ({}, [], (), λ, ∑, ∆) */}
        {[
          { sym: '{ }', top: '12%', left: '5%', color: 'text-cyan-300/45 border-cyan-400/20' },
          { sym: '[ ]', top: '24%', left: '91%', color: 'text-violet-300/45 border-violet-400/20' },
          { sym: '( ) =>', top: '52%', left: '4%', color: 'text-white/40 border-white/15' },
          { sym: '∑ λ', top: '64%', left: '90%', color: 'text-cyan-300/45 border-cyan-400/20' },
          { sym: '</>', top: '82%', left: '7%', color: 'text-violet-300/45 border-violet-400/20' },
          { sym: '∇ f(x)', top: '38%', left: '88%', color: 'text-sky-300/45 border-sky-400/20' }
        ].map((item, idx) => (
          <div
            key={`sym-${idx}`}
            style={{ top: item.top, left: item.left }}
            className={`hc-comp-symbol hc-fade-target absolute px-3 py-1.5 rounded-xl bg-[#0D111C]/60 backdrop-blur-md border font-mono text-xs sm:text-sm font-semibold shadow-card-dark ${item.color}`}
          >
            {item.sym}
          </div>
        ))}

        {/* 3D CSS Wireframe Computational Cube */}
        <div
          className="hc-comp-symbol hc-fade-target hidden md:flex absolute top-[18%] right-[7%] w-16 h-16 items-center justify-center"
          style={{ perspective: '600px' }}
        >
          <div
            className="hc-wireframe-spin relative w-11 h-11 border border-cyan-400/40 bg-cyan-400/[0.04] rounded-md shadow-[0_0_20px_rgba(56,189,248,0.18)]"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="absolute inset-1.5 border border-violet-400/35 rounded-sm rotate-45" />
          </div>
        </div>

        {/* Holographic Panel 3: Neural Graph & State Machine */}
        <div
          className="hc-holo-panel-3 hc-fade-target hidden xl:block absolute top-[44%] left-[2.5%] w-[285px] rounded-2xl border border-white/15 bg-[#0D111C]/70 backdrop-blur-xl p-3.5"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="hc-ambient-float">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
              <span className="text-[10px] font-mono text-cyan-300">model_weights.ts</span>
              <span className="text-[9px] font-mono text-emerald-300">OPTIMIZED</span>
            </div>
            <pre className="text-[10px] font-mono leading-relaxed text-slate-300/90">
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
          ZONE 4: AVAILABILITY & CONTACT — Minimal Floating Code & Soft Transition
      ===================================================================== */}
      <div className="hc-zone-contact relative w-full h-[16%] min-h-[520px]">
        <svg
          className="absolute inset-0 w-full h-full opacity-60"
          viewBox="0 0 1440 520"
          fill="none"
          preserveAspectRatio="xMidYMid slice"
        >
          <path
            className="hc-contact-wave-path"
            d="M 120 260 C 440 160, 1000 360, 1320 220"
            stroke="url(#hc-grad-cyan-violet)"
            strokeWidth="1.15"
            strokeLinecap="round"
            fill="none"
          />
          <circle
            cx="120"
            cy="260"
            r="3.5"
            fill="#38BDF8"
            fillOpacity="0.65"
            className="hc-node-pulse"
          />
          <circle
            cx="1320"
            cy="220"
            r="3.5"
            fill="#A78BFA"
            fillOpacity="0.65"
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
            className="hc-contact-token hc-fade-target hidden md:block absolute px-3 py-1.5 rounded-lg bg-[#0D111C]/55 border border-white/10 font-mono text-[10px] text-slate-300/70 backdrop-blur-md"
          >
            {token.text}
          </div>
        ))}
      </div>
    </div>
  );
};
