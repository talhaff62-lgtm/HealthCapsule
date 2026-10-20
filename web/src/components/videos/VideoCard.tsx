"use client";

import { useState, useEffect, useRef } from "react";
import { Play, X } from "lucide-react";

export type VideoCardVideo = {
  slug: string;
  title: string;
  youtubeVideoId: string;
  thumbnailUrl: string | null;
  duration: string | null;
  description?: string | null;
};

export default function VideoCard({ video }: { video: VideoCardVideo }) {
  const [isOpen, setIsOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Focus close button on open
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const openModal = () => {
    setIsOpen(true);
  };

  return (
    <>
      <button
        type="button"
        className="premium-card group flex flex-col overflow-hidden rounded-3xl bg-white shadow-card cursor-pointer text-left w-full"
        onClick={openModal}
        aria-label={`Play ${video.title}`}
      >
        <div className="relative aspect-video w-full overflow-hidden bg-brand-navy">
          <img
            src={video.thumbnailUrl ?? `https://i.ytimg.com/vi/${video.youtubeVideoId}/hqdefault.jpg`}
            alt={video.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
          <span
            className="absolute inset-0 flex items-center justify-center bg-brand-navy/20 transition group-hover:bg-brand-navy/10"
            aria-hidden="true"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-navy/85 text-white ring-1 ring-white/40 transition group-hover:bg-brand-sky">
              <Play className="h-5 w-5 fill-current" />
            </span>
          </span>
          {video.duration && (
            <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 font-mono text-[0.65rem] font-semibold text-white">
              {video.duration}
            </span>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-serif text-base font-semibold leading-snug text-brand-navy transition-colors group-hover:text-brand-sky line-clamp-2">
            {video.title}
          </h3>
        </div>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-navy/80 backdrop-blur-sm"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-label={video.title}
        >
          <div
            ref={dialogRef}
            className="relative w-full max-w-3xl bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={handleDialogClick}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between p-4 border-b border-brand-gray">
              <h2 className="font-serif text-lg font-semibold text-brand-navy pr-4">
                {video.title}
              </h2>
              {video.duration && (
                <span className="flex-shrink-0 rounded bg-brand-navy/10 px-2 py-0.5 font-mono text-[0.65rem] font-semibold text-brand-navy">
                  {video.duration}
                </span>
              )}
              <button
                ref={closeButtonRef}
                type="button"
                className="flex-shrink-0 grid place-items-center h-11 w-11 -m-1 rounded-lg text-brand-muted hover:text-brand-navy hover:bg-brand-gray/50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-sky/50"
                onClick={() => setIsOpen(false)}
                aria-label="Close video player"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Video Player - 16:9 aspect ratio */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${video.youtubeVideoId}?autoplay=1&rel=0`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full border-0"
              />
            </div>

            {/* Description */}
            {video.description && (
              <div className="p-4 text-sm text-brand-muted">
                {video.description}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}