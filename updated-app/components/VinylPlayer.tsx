"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Pause, Play, SkipBack, SkipForward } from "lucide-react";

// Tracks pulled from soundcloud.com/young_rahmel. Playback goes through the
// official SoundCloud widget (hidden iframe) so plays count on the profile.
const TRACKS = [
  { title: "MAYBE LATER", url: "https://soundcloud.com/young_rahmel/maybe-later", duration: 150 },
  { title: "FLEXTHEWATCH", url: "https://soundcloud.com/young_rahmel/flexthewatch", duration: 135 },
  { title: "PEAKED", url: "https://soundcloud.com/young_rahmel/peaked-1", duration: 125 },
  { title: "SUMMER", url: "https://soundcloud.com/young_rahmel/summer", duration: 179 },
  { title: "FLEXTHEWATCH (BONUS)", url: "https://soundcloud.com/young_rahmel/flexthewatch-bonus", duration: 133 },
  { title: "CLOUD TEN", url: "https://soundcloud.com/young_rahmel/cloud-ten-1", duration: 187 },
  { title: "vibes!", url: "https://soundcloud.com/young_rahmel/vibes", duration: 132 },
];

const PROFILE_URL = "https://soundcloud.com/young_rahmel";

// SoundCloud Widget API (loaded on demand from w.soundcloud.com/player/api.js)
type SCWidget = {
  bind: (event: string, cb: (data?: { currentPosition?: number }) => void) => void;
  play: () => void;
  pause: () => void;
  load: (url: string, options?: Record<string, unknown>) => void;
  seekTo: (ms: number) => void;
};

declare global {
  interface Window {
    SC?: {
      Widget: ((el: HTMLIFrameElement) => SCWidget) & {
        Events: Record<string, string>;
      };
    };
  }
}

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function VinylPlayer() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const widgetRef = useRef<SCWidget | null>(null);
  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0); // seconds
  const indexRef = useRef(0);
  indexRef.current = index;

  useEffect(() => {
    let cancelled = false;

    const init = () => {
      if (cancelled || !iframeRef.current || !window.SC) return;
      const widget = window.SC.Widget(iframeRef.current);
      const E = window.SC.Widget.Events;
      widget.bind(E.READY, () => {
        if (cancelled) return;
        widgetRef.current = widget;
        setReady(true);
      });
      widget.bind(E.PLAY, () => !cancelled && setPlaying(true));
      widget.bind(E.PAUSE, () => !cancelled && setPlaying(false));
      widget.bind(E.PLAY_PROGRESS, (data) => {
        if (!cancelled && data?.currentPosition != null) {
          setPosition(data.currentPosition / 1000);
        }
      });
      widget.bind(E.FINISH, () => {
        if (cancelled) return;
        // Auto-advance to the next track (wraps around).
        const next = (indexRef.current + 1) % TRACKS.length;
        selectTrack(next, widget);
      });
    };

    if (window.SC?.Widget) {
      init();
    } else {
      const script = document.createElement("script");
      script.src = "https://w.soundcloud.com/player/api.js";
      script.async = true;
      script.onload = init;
      document.body.appendChild(script);
    }

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectTrack = (i: number, widget = widgetRef.current) => {
    if (!widget) return;
    setIndex(i);
    setPosition(0);
    widget.load(TRACKS[i].url, {
      auto_play: true,
      show_artwork: false,
      visual: false,
    });
    setPlaying(true);
  };

  const togglePlay = () => {
    const widget = widgetRef.current;
    if (!widget) return;
    if (playing) widget.pause();
    else widget.play();
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const widget = widgetRef.current;
    if (!widget) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const sec = frac * TRACKS[index].duration;
    setPosition(sec);
    widget.seekTo(sec * 1000);
  };

  const track = TRACKS[index];
  const progress = Math.min(1, position / track.duration);

  return (
    <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
      {/* Hidden SoundCloud widget that actually plays the audio */}
      <iframe
        ref={iframeRef}
        title="SoundCloud player"
        width="1"
        height="1"
        allow="autoplay"
        className="absolute -left-[9999px] h-px w-px"
        src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(TRACKS[0].url)}&auto_play=false&show_artwork=false&visual=false&show_comments=false&show_teaser=false`}
      />

      {/* Turntable */}
      <div className="relative mx-auto w-full max-w-[420px]">
        {/* Deck */}
        <div className="relative rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 shadow-2xl p-8 sm:p-10">
          {/* Record */}
          <div
            onClick={togglePlay}
            className="relative mx-auto aspect-square w-full cursor-pointer select-none rounded-full"
            style={{
              background:
                "repeating-radial-gradient(circle at 50% 50%, #0a0a0c 0px, #17171c 2px, #0a0a0c 4px)",
              boxShadow:
                "0 0 0 6px #0c0c10, 0 12px 40px rgba(0,0,0,0.7), inset 0 0 60px rgba(0,0,0,0.9)",
              animation: "vinyl-spin 3.5s linear infinite",
              animationPlayState: playing ? "running" : "paused",
            }}
            aria-label={playing ? "Pause" : "Play"}
            role="button"
          >
            {/* Sheen */}
            <div
              className="absolute inset-0 rounded-full opacity-40"
              style={{
                background:
                  "conic-gradient(from 30deg, transparent 0deg, rgba(255,255,255,0.10) 25deg, transparent 60deg, transparent 180deg, rgba(255,255,255,0.07) 205deg, transparent 240deg)",
              }}
            />
            {/* Center label */}
            <div className="absolute left-1/2 top-1/2 h-[34%] w-[34%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex flex-col items-center justify-center text-center shadow-inner">
              <div className="px-2 text-[10px] sm:text-xs font-black uppercase tracking-wider text-orange-50 leading-tight">
                {track.title}
              </div>
              <div className="mt-1 text-[8px] sm:text-[10px] font-semibold uppercase tracking-[0.2em] text-orange-200/90">
                young rahmel
              </div>
              <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-950 ring-2 ring-slate-800" />
            </div>
          </div>

          {/* Tonearm */}
          <div
            className="pointer-events-none absolute right-2 top-2 sm:right-4 sm:top-3 z-10 origin-[78%_18%] transition-transform duration-700 ease-in-out"
            style={{ transform: playing ? "rotate(24deg)" : "rotate(0deg)" }}
          >
            <div className="relative h-40 w-24 sm:h-48 sm:w-28">
              {/* Pivot base */}
              <div className="absolute right-2 top-2 h-9 w-9 rounded-full bg-gradient-to-br from-slate-500 to-slate-700 shadow-lg ring-2 ring-slate-800" />
              {/* Arm */}
              <div className="absolute right-[22px] top-9 h-28 w-1.5 sm:h-36 rounded-full bg-gradient-to-b from-slate-400 to-slate-500 shadow-md" />
              {/* Headshell */}
              <div className="absolute bottom-1 right-[12px] h-7 w-5 rotate-12 rounded-sm bg-gradient-to-br from-slate-300 to-slate-500 shadow" />
            </div>
          </div>
        </div>

        {/* Transport controls */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={() => selectTrack((index - 1 + TRACKS.length) % TRACKS.length)}
            disabled={!ready}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-blue-100 transition-colors hover:bg-white/20 disabled:opacity-40"
            aria-label="Previous track"
          >
            <SkipBack className="h-5 w-5" />
          </button>
          <button
            onClick={togglePlay}
            disabled={!ready}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg transition-transform hover:scale-105 disabled:opacity-40"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? <Pause className="h-6 w-6" /> : <Play className="ml-0.5 h-6 w-6" />}
          </button>
          <button
            onClick={() => selectTrack((index + 1) % TRACKS.length)}
            disabled={!ready}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-blue-100 transition-colors hover:bg-white/20 disabled:opacity-40"
            aria-label="Next track"
          >
            <SkipForward className="h-5 w-5" />
          </button>
        </div>

        {/* Progress */}
        <div className="mt-4 flex items-center gap-3 text-xs text-blue-200">
          <span className="w-10 text-right tabular-nums">{fmt(position)}</span>
          <div
            onClick={seek}
            className="group relative h-2 flex-1 cursor-pointer overflow-hidden rounded-full bg-white/10"
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-orange-400 to-orange-600 transition-[width] duration-150"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <span className="w-10 tabular-nums">{fmt(track.duration)}</span>
        </div>
      </div>

      {/* Tracklist sleeve */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 backdrop-blur-sm">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-orange-400">Side A</div>
            <div className="mt-1 text-2xl font-bold text-white">Tracks I&apos;ve Recorded</div>
          </div>
          <a
            href={PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-orange-400/40 bg-orange-500/10 px-4 py-2 text-sm font-medium text-orange-200 transition-colors hover:bg-orange-500/20"
          >
            SoundCloud <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <ol className="space-y-1">
          {TRACKS.map((t, i) => {
            const active = i === index;
            return (
              <li key={t.url}>
                <button
                  onClick={() => (active ? togglePlay() : selectTrack(i))}
                  disabled={!ready}
                  className={`flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left transition-colors disabled:opacity-40 ${
                    active
                      ? "bg-orange-500/15 text-white"
                      : "text-blue-100 hover:bg-white/10"
                  }`}
                >
                  <span className={`w-6 text-sm tabular-nums ${active ? "text-orange-400" : "text-blue-300/60"}`}>
                    {active && playing ? (
                      // Tiny equalizer
                      <span className="flex h-4 items-end gap-[2px]">
                        <span className="w-[3px] animate-[eq1_0.8s_ease-in-out_infinite] rounded-sm bg-orange-400" />
                        <span className="w-[3px] animate-[eq2_0.6s_ease-in-out_infinite] rounded-sm bg-orange-400" />
                        <span className="w-[3px] animate-[eq3_1s_ease-in-out_infinite] rounded-sm bg-orange-400" />
                      </span>
                    ) : (
                      String(i + 1).padStart(2, "0")
                    )}
                  </span>
                  <span className={`flex-1 font-medium ${active ? "font-semibold" : ""}`}>{t.title}</span>
                  <span className="text-sm tabular-nums text-blue-300/60">{fmt(t.duration)}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <style jsx global>{`
        @keyframes vinyl-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes eq1 { 0%,100% { height: 6px; } 50% { height: 16px; } }
        @keyframes eq2 { 0%,100% { height: 14px; } 50% { height: 4px; } }
        @keyframes eq3 { 0%,100% { height: 9px; } 50% { height: 15px; } }
      `}</style>
    </div>
  );
}
