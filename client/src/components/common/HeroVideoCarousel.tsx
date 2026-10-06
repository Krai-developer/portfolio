import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const videoFiles = import.meta.glob<string>('../../assets/hero-videos/*.{mp4,webm,ogg}', {
  eager: true,
  query: '?url',
  import: 'default'
});

const videos = Object.entries(videoFiles)
  .sort(([first], [second]) => {
    const getOrder = (path: string) => Number(path.split('/').pop()?.match(/^(\d+)[-_]/)?.[1] ?? 999);
    return getOrder(first) - getOrder(second) || first.localeCompare(second);
  })
  .map(([path, src]) => ({
    src,
    label: path
      .split('/')
      .pop()
      ?.replace(/\.[^.]+$/, '')
      .replace(/^\d+[-_]+/, '')
      .replace(/[-_]+/g, ' ') || 'Portfolio video'
  }));

export const HeroVideoCarousel: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [readyIndex, setReadyIndex] = useState<number | null>(null);
  const nextVideoRef = useRef<HTMLVideoElement>(null);
  const nextIndex = videos.length
    ? targetIndex ?? (activeIndex + 1) % videos.length
    : 0;

  useEffect(() => {
    if (targetIndex === null || readyIndex !== targetIndex) return;

    const nextVideo = nextVideoRef.current;
    if (!nextVideo) return;

    nextVideo.currentTime = 0;
    let cancelled = false;

    const promoteVideo = () => {
      if (cancelled) return;
      setActiveIndex(targetIndex);
      setTargetIndex(null);
      setReadyIndex(null);
    };

    nextVideo.play().then(promoteVideo).catch(promoteVideo);

    return () => {
      cancelled = true;
    };
  }, [readyIndex, targetIndex]);

  if (videos.length === 0) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-l-2xl border-y border-l border-white/10 bg-dark-surface px-6 text-center text-sm text-content-muted">
        Add .mp4, .webm, or .ogg videos to <code className="mx-1 text-accent">src/assets/hero-videos</code> to show them here.
      </div>
    );
  }

  const activeVideo = videos[activeIndex];
  const showControls = videos.length > 1;

  const goTo = (index: number) => {
    const requestedIndex = (index + videos.length) % videos.length;
    if (requestedIndex !== activeIndex) setTargetIndex(requestedIndex);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 24, scale: 0.985 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.75, delay: 0.15, ease: 'easeOut' }}
      className="group relative aspect-video w-full overflow-hidden rounded-l-2xl border-y border-l border-white/10 bg-dark-surface shadow-[0_24px_80px_-28px_rgba(0,0,0,0.8)] md:rounded-r-none md:border-r-0"
      aria-roledescription="carousel"
      aria-label="Portfolio videos"
    >
      {videos.map((video, index) => {
        const isActive = index === activeIndex;
        const isNext = index === nextIndex;
        if (!isActive && !isNext) return null;

        return (
          <video
            key={video.src}
            ref={isNext && !isActive ? nextVideoRef : undefined}
            className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-300 ${
              isActive ? 'z-0 opacity-100' : 'z-0 opacity-0 pointer-events-none'
            }`}
            src={video.src}
            autoPlay={isActive}
            loop={isActive && videos.length === 1}
            onEnded={isActive && videos.length > 1 ? () => setTargetIndex(nextIndex) : undefined}
            onCanPlay={isNext && !isActive ? () => setReadyIndex(index) : undefined}
            muted
            playsInline
            preload="auto"
            aria-label={video.label}
            aria-hidden={!isActive}
          />
        );
      })}

      {showControls && (
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-gradient-to-t from-black/70 via-black/30 to-transparent px-4 pb-3 pt-10 sm:pb-4">
          <div className="flex items-center gap-2" role="group" aria-label="Choose a video">
            {videos.map((video, index) => (
              <button
                key={video.src}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Show video ${index + 1}: ${video.label}`}
                aria-current={index === activeIndex ? 'true' : undefined}
                className={`h-2.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  index === activeIndex
                    ? 'w-7 bg-accent'
                    : 'w-2.5 bg-white/55 hover:bg-white'
                }`}
              />
            ))}
          </div>

          <span className="sr-only" aria-live="polite">
            Video {activeIndex + 1} of {videos.length}: {activeVideo.label}
          </span>
        </div>
      )}
    </motion.div>
  );
};
