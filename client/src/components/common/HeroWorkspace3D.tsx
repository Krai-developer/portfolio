import React, { useEffect, useRef, useState } from 'react';
import {
  mountWorkspaceScene,
  type WorkspaceSceneApi
} from '../../hero-scene/WorkspaceSceneController';

export const HeroWorkspace3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const apiRef = useRef<WorkspaceSceneApi | null>(null);
  const [webglError, setWebglError] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sceneApi = mountWorkspaceScene(container, mq.matches, {
      onWebglError: () => setWebglError(true)
    });
    apiRef.current = sceneApi;

    const onMotionChange = (e: MediaQueryListEvent) => {
      sceneApi.setReducedMotion(e.matches);
    };
    mq.addEventListener('change', onMotionChange);

    // Smooth mouse parallax
    const onPointerMove = (e: PointerEvent) => {
      const ndcX = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
      const ndcY = -((e.clientY / Math.max(1, window.innerHeight)) * 2 - 1);
      sceneApi.setMouseNdc(ndcX, ndcY);
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    // Scroll progress strictly across the Hero section (rAF-throttled)
    let rafPending = false;
    const updateScroll = () => {
      rafPending = false;
      const rect = container.getBoundingClientRect();
      const total = Math.max(1, rect.height);
      const progress = Math.min(1, Math.max(0, -rect.top / total));
      sceneApi.setScrollProgress(progress);
    };
    const onScroll = () => {
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(updateScroll);
      }
    };
    updateScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Auto-pause Hero WebGL render loop when scrolled past Hero
    const observer = new IntersectionObserver(
      ([entry]) => {
        sceneApi.setPaused(!entry.isIntersecting);
      },
      { threshold: 0.02 }
    );
    observer.observe(container);

    return () => {
      observer.disconnect();
      mq.removeEventListener('change', onMotionChange);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
      sceneApi.dispose();
      apiRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-label="Interactive 3D Developer Workspace"
      className="absolute inset-0 z-0 h-full w-full overflow-hidden bg-[#030d20] cursor-grab active:cursor-grabbing"
    >
      {webglError && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(14,165,233,0.24),rgba(3,13,32,0.98)_65%)]" />
      )}
    </div>
  );
};
