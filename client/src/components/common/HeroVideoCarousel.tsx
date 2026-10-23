import React, { useEffect, useRef, useState } from 'react';

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
    return null;
  }

  const activeVideo = videos[activeIndex];
  const showControls = videos.length > 1;

  const goTo = (index: number) => {
    const requestedIndex = (index + videos.length) % videos.length;
    if (requestedIndex !== activeIndex) setTargetIndex(requestedIndex);
  };

  return (
    <>
      <div
        className="absolute inset-0 -z-10 h-full w-full overflow-hidden"
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
              className={`absolute inset-0 w-full h-full object-cover -z-10 transition-opacity duration-500 ${
                isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
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
      </div>

      {showControls && (
        <div className=" absolute inset-x-0 bottom-3 z-20 flex items-center justify-center px-4">
          <div className="flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 backdrop-blur-sm" role="group" aria-label="Choose a video">
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
    </>
  );
};
