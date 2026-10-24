import React, { useEffect, useRef } from 'react';

interface SmokeParticle {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  alpha: number;
}

export const GeometricBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2
    };

    const scroll = {
      y: window.scrollY,
      targetY: window.scrollY
    };

    // Soft floating white-smoke ambient particles/plumes that blend seamlessly
    const particles: SmokeParticle[] = Array.from({ length: 18 }, (_, i) => ({
      x: ((i * 197) % 100) * 0.01 * width,
      y: ((i * 313) % 100) * 0.01 * height * 2,
      radius: 1.2 + (i % 3) * 0.7,
      vx: ((i % 2 === 0 ? 1 : -1) * (0.08 + (i % 4) * 0.03)),
      vy: -0.12 - (i % 3) * 0.05,
      alpha: 0.08 + (i % 5) * 0.035
    }));

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };

    const handleScroll = () => {
      scroll.targetY = window.scrollY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    let time = 0;

    const render = () => {
      time += 0.004;
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;
      scroll.y += (scroll.targetY - scroll.y) * 0.06;

      ctx.clearRect(0, 0, width, height);

      const maxScroll = Math.max(1, document.documentElement.scrollHeight - height);
      const scrollProgress = Math.min(1, Math.max(0, scroll.y / maxScroll));

      // 1. Continuous, ultra-soft White Smoke mist clouds that glide smoothly with scroll
      // Large overlapping radii ensure colors never separate or form hard edges.
      const plume1X = width * (0.22 + Math.sin(time + scrollProgress * 2.2) * 0.18);
      const plume1Y = height * (0.28 + Math.cos(time * 0.8 + scrollProgress * 1.6) * 0.16);
      const plume1Radius = Math.max(width, height) * 0.65;

      const plume1 = ctx.createRadialGradient(plume1X, plume1Y, 0, plume1X, plume1Y, plume1Radius);
      plume1.addColorStop(0, 'rgba(245, 245, 245, 0.065)');
      plume1.addColorStop(0.45, 'rgba(220, 220, 228, 0.028)');
      plume1.addColorStop(0.75, 'rgba(180, 180, 192, 0.008)');
      plume1.addColorStop(1, 'rgba(11, 11, 15, 0)');
      ctx.fillStyle = plume1;
      ctx.fillRect(0, 0, width, height);

      const plume2X = width * (0.78 - Math.cos(time * 0.9 + scrollProgress * 2.5) * 0.2);
      const plume2Y = height * (0.68 - Math.sin(time * 0.7 + scrollProgress * 1.8) * 0.2);
      const plume2Radius = Math.max(width, height) * 0.7;

      const plume2 = ctx.createRadialGradient(plume2X, plume2Y, 0, plume2X, plume2Y, plume2Radius);
      plume2.addColorStop(0, 'rgba(245, 245, 245, 0.05)');
      plume2.addColorStop(0.5, 'rgba(210, 210, 220, 0.022)');
      plume2.addColorStop(0.8, 'rgba(160, 160, 175, 0.006)');
      plume2.addColorStop(1, 'rgba(11, 11, 15, 0)');
      ctx.fillStyle = plume2;
      ctx.fillRect(0, 0, width, height);

      // 2. Parallax architectural grid that moves gently with scroll
      const gridSize = 64;
      const offsetY = -(scroll.y * 0.18) % gridSize;
      ctx.strokeStyle = 'rgba(245, 245, 245, 0.016)';
      ctx.lineWidth = 1;

      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = offsetY; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 3. Floating white-smoke dust motes with scroll parallax
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height * 1.5;

        const drawY = ((p.y - scroll.y * 0.22) % height + height) % height;
        const glow = ctx.createRadialGradient(p.x, drawY, 0, p.x, drawY, p.radius * 8);
        glow.addColorStop(0, `rgba(245, 245, 245, ${p.alpha})`);
        glow.addColorStop(0.4, `rgba(245, 245, 245, ${p.alpha * 0.35})`);
        glow.addColorStop(1, 'rgba(245, 245, 245, 0)');

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, drawY, p.radius * 8, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Cursor-following soft white-smoke halo
      const cursorGradient = ctx.createRadialGradient(
        mouse.x,
        mouse.y,
        0,
        mouse.x,
        mouse.y,
        460
      );
      cursorGradient.addColorStop(0, 'rgba(245, 245, 245, 0.065)');
      cursorGradient.addColorStop(0.45, 'rgba(245, 245, 245, 0.022)');
      cursorGradient.addColorStop(1, 'rgba(11, 11, 15, 0)');
      ctx.fillStyle = cursorGradient;
      ctx.fillRect(0, 0, width, height);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-95"
    />
  );
};
