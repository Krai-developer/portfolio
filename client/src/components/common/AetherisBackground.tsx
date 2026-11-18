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
    if (!container) return;

    const engine = new SceneEngine(container, DEFAULT_CONFIG, {
      onBeaconSelect: () => {},
      onContextLostChange: () => {}
    });
    engineRef.current = engine;

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  // Synchronize scroll progress strictly across the About -> Contact wrapper
  useEffect(() => {
    const handleScroll = () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const rect = wrapper.getBoundingClientRect();
      const totalScrollable = Math.max(1, wrapper.offsetHeight - window.innerHeight);
      const scrolledIntoWrapper = Math.max(0, -rect.top);
      const progress = Math.min(1, Math.max(0, scrolledIntoWrapper / totalScrollable));

      engineRef.current?.setScrollProgress(progress);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
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
        className="sticky top-0 h-screen w-full"
        aria-label="Interactive 3D kinetic background scene"
      />
    </div>
  );
};
