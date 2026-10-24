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
      targetY: window.scrollY,
      velocity: 0
    };

    // Visible floating white-smoke particles with crisp cores and soft halos
    const particles: SmokeParticle[] = Array.from({ length: 36 }, (_, i) => ({
      x: ((i * 197) % 100) * 0.01 * width,
      y: ((i * 313) % 100) * 0.01 * height * 2,
      radius: 1.6 + (i % 4) * 0.85,
      vx: (i % 2 === 0 ? 1 : -1) * (0.12 + (i % 4) * 0.04),
      vy: -0.18 - (i % 3) * 0.08,
      alpha: 0.22 + (i % 5) * 0.08
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
      time += 0.005;
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      const deltaScroll = scroll.targetY - scroll.y;
      scroll.y += deltaScroll * 0.08;
      scroll.velocity = Math.min(1, Math.abs(deltaScroll) / 120);

      ctx.clearRect(0, 0, width, height);

      const maxScroll = Math.max(1, document.documentElement.scrollHeight - height);
      const scrollProgress = Math.min(1, Math.max(0, scroll.y / maxScroll));
      const velocityBoost = scroll.velocity * 0.06;

      // 1. Volumetric White Smoke mist clouds that sweep across the screen as you scroll
      // Multi-stop feathering keeps dark (#0B0B0F) and white smoke (#F5F5F5) seamlessly blended.
      const plume1X = width * (0.2 + Math.sin(time + scrollProgress * 3.2) * 0.28);
      const plume1Y = height * (0.25 + Math.cos(time * 0.8 + scrollProgress * 2.4) * 0.22);
      const plume1Radius = Math.max(width, height) * 0.72;

      const plume1 = ctx.createRadialGradient(plume1X, plume1Y, 0, plume1X, plume1Y, plume1Radius);
      plume1.addColorStop(0, `rgba(245, 245, 245, ${0.16 + velocityBoost})`);
      plume1.addColorStop(0.35, `rgba(232, 232, 240, ${0.09 + velocityBoost * 0.5})`);
      plume1.addColorStop(0.7, 'rgba(195, 195, 210, 0.03)');
      plume1.addColorStop(1, 'rgba(11, 11, 15, 0)');
      ctx.fillStyle = plume1;
      ctx.fillRect(0, 0, width, height);

      const plume2X = width * (0.8 - Math.cos(time * 0.9 + scrollProgress * 3.5) * 0.28);
      const plume2Y = height * (0.72 - Math.sin(time * 0.7 + scrollProgress * 2.6) * 0.24);
      const plume2Radius = Math.max(width, height) * 0.76;

      const plume2 = ctx.createRadialGradient(plume2X, plume2Y, 0, plume2X, plume2Y, plume2Radius);
      plume2.addColorStop(0, `rgba(245, 245, 245, ${0.14 + velocityBoost})`);
      plume2.addColorStop(0.4, `rgba(220, 220, 230, ${0.075 + velocityBoost * 0.5})`);
      plume2.addColorStop(0.75, 'rgba(175, 175, 190, 0.025)');
      plume2.addColorStop(1, 'rgba(11, 11, 15, 0)');
      ctx.fillStyle = plume2;
      ctx.fillRect(0, 0, width, height);

      const plume3X = width * (0.5 + Math.sin(scrollProgress * Math.PI * 2 - time * 0.6) * 0.25);
      const plume3Y = height * (0.48 + Math.cos(scrollProgress * Math.PI * 1.5 + time * 0.5) * 0.18);
      const plume3Radius = Math.max(width, height) * 0.6;

      const plume3 = ctx.createRadialGradient(plume3X, plume3Y, 0, plume3X, plume3Y, plume3Radius);
      plume3.addColorStop(0, `rgba(245, 245, 245, ${0.1 + velocityBoost})`);
      plume3.addColorStop(0.5, 'rgba(215, 215, 225, 0.045)');
      plume3.addColorStop(1, 'rgba(11, 11, 15, 0)');
      ctx.fillStyle = plume3;
      ctx.fillRect(0, 0, width, height);

      // 2. Parallax architectural grid that shifts visibly with scroll
      const gridSize = 64;
      const offsetY = -(scroll.y * 0.35) % gridSize;
      ctx.strokeStyle = `rgba(245, 245, 245, ${0.038 + scroll.velocity * 0.025})`;
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

      // 3. Floating white-smoke nodes + halos with noticeable scroll parallax
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy * (1 + scroll.velocity * 2.5);

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height * 1.5;

        const drawY = ((p.y - scroll.y * 0.42) % height + height) % height;
        const haloRadius = p.radius * 10;
        const glow = ctx.createRadialGradient(p.x, drawY, 0, p.x, drawY, haloRadius);
        glow.addColorStop(0, `rgba(245, 245, 245, ${Math.min(0.75, p.alpha * 1.8)})`);
        glow.addColorStop(0.25, `rgba(245, 245, 245, ${p.alpha * 0.65})`);
        glow.addColorStop(0.6, `rgba(220, 220, 230, ${p.alpha * 0.2})`);
        glow.addColorStop(1, 'rgba(245, 245, 245, 0)');

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, drawY, haloRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Cursor-following volumetric white-smoke halo
      const cursorGradient = ctx.createRadialGradient(
        mouse.x,
        mouse.y,
        0,
        mouse.x,
        mouse.y,
        520
      );
      cursorGradient.addColorStop(0, 'rgba(245, 245, 245, 0.13)');
      cursorGradient.addColorStop(0.45, 'rgba(235, 235, 242, 0.05)');
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
