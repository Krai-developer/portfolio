import React, { useEffect, useRef } from 'react';
import { SceneEngine } from '../../scene/SceneEngine';
import { type SceneConfig } from '../../scene/types';

const DEFAULT_CONFIG: SceneConfig = {
  atmosphere: 'obsidian',
  finish: 'gold',
  cameraPreset: 'overview',
  explode: 0,
  waveEnergy: 0.75,
  parallaxEnabled: false,
  autoOrbit: false,
  soundEnabled: false
};

export const AetherisBackground: React.FC = () => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<SceneEngine | null>(null);

  useEffect(() => {
    const container = canvasMountRef.current;
    const wrapper = wrapperRef.current;
    if (!container || !wrapper) return;

    const engine = new SceneEngine(container, DEFAULT_CONFIG, {
      onBeaconSelect: () => {},
      onContextLostChange: () => {}
    });
    engineRef.current = engine;

    // Pause WebGL render loop while user is at the Hero section (off-screen)
    const observer = new IntersectionObserver(
      ([entry]) => {
        engine.setPaused(!entry.isIntersecting);
      },
      { rootMargin: '120px 0px' }
    );
    observer.observe(wrapper);

    return () => {
      observer.disconnect();
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  // Synchronize scroll progress strictly across the About -> Contact wrapper (rAF-throttled)
  useEffect(() => {
    let rafPending = false;
    let cachedHeight = wrapperRef.current?.offsetHeight || 1;

    const updateScroll = () => {
      rafPending = false;
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const rect = wrapper.getBoundingClientRect();
      const totalScrollable = Math.max(1, cachedHeight - window.innerHeight);
      const scrolledIntoWrapper = Math.max(0, -rect.top);
      const progress = Math.min(1, Math.max(0, scrolledIntoWrapper / totalScrollable));

      engineRef.current?.setScrollProgress(progress);
    };

    const handleScroll = () => {
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(updateScroll);
      }
    };

    const handleResize = () => {
      cachedHeight = wrapperRef.current?.offsetHeight || 1;
      handleScroll();
    };

    updateScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-x-clip select-none"
    >
      {/* Seamless top feather mask right below HeroSection */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#0B0B0F] via-[#0B0B0F]/85 to-transparent z-10" />

      {/* Pinned Aetheris 3D Kinetic WebGL Canvas from About to Contact */}
      <div
        ref={canvasMountRef}
        className="sticky top-0 h-screen w-full will-change-transform"
        aria-label="Interactive 3D kinetic background scene"
      />
    </div>
  );
};
