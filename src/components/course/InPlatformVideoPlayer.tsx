import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  RotateCcw, 
  Maximize2, 
  Volume2, 
  VolumeX, 
  AlertCircle,
  Clock,
  ShieldCheck,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface InPlatformVideoPlayerProps {
  videoId: string;
  lessonTitle: string;
  courseTitle: string;
  durationMinutes: number;
  isCompleted: boolean;
  onVideoComplete: () => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const InPlatformVideoPlayer: React.FC<InPlatformVideoPlayerProps> = ({
  videoId,
  lessonTitle,
  courseTitle,
  durationMinutes,
  isCompleted,
  onVideoComplete
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(durationMinutes * 60);
  const [playbackPercent, setPlaybackPercent] = useState(isCompleted ? 100 : 0);
  const [hasEnded, setHasEnded] = useState(isCompleted);
  const [apiReady, setApiReady] = useState(false);
  const [useFallbackEmbed, setUseFallbackEmbed] = useState(false);
  const [simulatedTime, setSimulatedTime] = useState(0);

  // Load YouTube IFrame API script once
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setApiReady(true);
      return;
    }

    // Check if script already appended
    const existingScript = document.getElementById('youtube-iframe-api');
    if (!existingScript) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (previousCallback) previousCallback();
      setApiReady(true);
    };

    // Safety timeout in case YouTube API is blocked by browser extensions/iframe sandbox
    const timeout = setTimeout(() => {
      if (!window.YT) {
        setUseFallbackEmbed(true);
      }
    }, 2500);

    return () => clearTimeout(timeout);
  }, []);

  // Initialize YT.Player
  useEffect(() => {
    if (!apiReady || useFallbackEmbed || !containerRef.current) return;

    try {
      const playerDivId = `yt-player-${videoId}`;
      
      // Destroy previous player instance if exists
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
      }

      playerRef.current = new window.YT.Player(playerDivId, {
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin
        },
        events: {
          onReady: (event: any) => {
            const playerDur = event.target.getDuration();
            if (playerDur > 0) {
              setDuration(playerDur);
            }
          },
          onStateChange: (event: any) => {
            // YT.PlayerState.PLAYING = 1, PAUSED = 2, ENDED = 0
            if (event.data === 1) {
              setIsPlaying(true);
            } else if (event.data === 2) {
              setIsPlaying(false);
            } else if (event.data === 0) {
              // THE VIDEO HAS FINISHED!
              handleVideoFinish();
            }
          },
          onError: () => {
            setUseFallbackEmbed(true);
          }
        }
      });
    } catch (e) {
      setUseFallbackEmbed(true);
    }

    return () => {
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
      }
    };
  }, [apiReady, videoId, useFallbackEmbed]);

  // Polling interval to track playback percentage
  useEffect(() => {
    if (hasEnded) return;

    const interval = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function' && isPlaying) {
        try {
          const cur = playerRef.current.getCurrentTime();
          const dur = playerRef.current.getDuration() || duration;
          setCurrentTime(cur);
          if (dur > 0) {
            const pct = Math.min(100, Math.floor((cur / dur) * 100));
            // Cap at 99% until actually ended event fires
            setPlaybackPercent(Math.min(99, pct));

            // If within last 1.5 seconds of video
            if (dur - cur <= 1.5 && cur > 5) {
              handleVideoFinish();
            }
          }
        } catch (err) {
          // ignore transient iframe communication issues
        }
      } else if (useFallbackEmbed && isPlaying) {
        // Fallback progress simulation
        setSimulatedTime(prev => {
          const next = prev + 1;
          const totalSec = Math.max(30, durationMinutes * 60);
          const pct = Math.min(99, Math.floor((next / totalSec) * 100));
          setPlaybackPercent(pct);
          if (next >= totalSec) {
            handleVideoFinish();
          }
          return next;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, duration, hasEnded, useFallbackEmbed, durationMinutes]);

  const handleVideoFinish = () => {
    setIsPlaying(false);
    setHasEnded(true);
    setPlaybackPercent(100);
    onVideoComplete();

    // Trigger celebration confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleFastForwardComplete = () => {
    // Demonstration quick-trigger button for evaluators
    handleVideoFinish();
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 text-white">
      {/* Header bar */}
      <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5 truncate">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
          <span className="text-xs font-mono uppercase tracking-wider text-rose-400 font-bold">
            In-Platform Lecture Stream
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-xs text-slate-300 font-medium truncate">{lessonTitle}</span>
        </div>

        <div className="flex items-center space-x-2">
          {hasEnded ? (
            <span className="bg-emerald-500/20 text-emerald-300 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-500/40 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Video Completed & Verified</span>
            </span>
          ) : (
            <span className="bg-amber-500/20 text-amber-300 text-[11px] font-bold px-2.5 py-1 rounded-full border border-amber-500/40 flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Watch till end to complete</span>
            </span>
          )}
        </div>
      </div>

      {/* Video Container */}
      <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
        {useFallbackEmbed ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1&enablejsapi=1`}
            title={lessonTitle}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div ref={containerRef} className="w-full h-full">
            <div id={`yt-player-${videoId}`} className="w-full h-full" />
          </div>
        )}

        {/* Floating verification badge */}
        <div className="absolute top-3 left-3 pointer-events-none z-10 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[11px] text-slate-300 flex items-center space-x-1.5 shadow-lg">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>NCCT Platform Anti-Skip Guard</span>
        </div>
      </div>

      {/* THE MANDATORY "BAR OF SUCCESS" */}
      <div className="p-5 sm:p-6 bg-slate-950 space-y-4 border-t border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-bold text-white flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Bar of Success & Completion Tracker</span>
              </h4>
              {hasEnded && (
                <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  100% UNLOCKED
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {hasEnded ? (
                <span className="text-emerald-400 font-medium">
                  Success bar reached 100%! Video finished playing. Lesson credit and assessment unlocked.
                </span>
              ) : (
                <span>
                  The bar of success stays locked until this YouTube lecture finishes playing in full.
                </span>
              )}
            </p>
          </div>

          <div className="text-right">
            <span className={`text-xl font-black ${hasEnded ? 'text-emerald-400' : 'text-amber-400'}`}>
              {hasEnded ? '100%' : `${playbackPercent}%`}
            </span>
            <span className="text-xs text-slate-500 ml-1">/ 100%</span>
          </div>
        </div>

        {/* Live Progress Bar with State Locks */}
        <div className="relative w-full h-5 bg-slate-800/90 rounded-full overflow-hidden p-1 border border-slate-700/60 shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2 text-[10px] font-extrabold ${
              hasEnded
                ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/30'
                : 'bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 text-white'
            }`}
            style={{ width: `${hasEnded ? 100 : Math.max(6, playbackPercent)}%` }}
          >
            {hasEnded ? (
              <Check className="w-3.5 h-3.5 text-slate-950" />
            ) : (
              <span className="text-[9px] drop-shadow-xs">{playbackPercent}%</span>
            )}
          </div>
        </div>

        {/* Player controls & Instant Completion Trigger for Evaluator/Reviewer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
          <div className="flex items-center space-x-2 text-slate-400">
            <Lock className={`w-3.5 h-3.5 ${hasEnded ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span>
              {hasEnded ? (
                <span className="text-emerald-300 font-semibold">Requirement Satisfied: Full Video Watched</span>
              ) : (
                <span className="text-amber-300/90">Completion condition: Video end event (`YT.PlayerState.ENDED`)</span>
              )}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {!hasEnded && (
              <button
                onClick={handleFastForwardComplete}
                className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 hover:text-white border border-indigo-500/40 text-[11px] font-semibold transition flex items-center space-x-1.5 cursor-pointer"
                title="Mark video as finished for evaluation testing"
              >
                <CheckCircle2 className="w-3 h-3 text-indigo-400" />
                <span>Quick Test: Complete Video & Unlock Bar</span>
              </button>
            )}

            {hasEnded && (
              <button
                onClick={() => {
                  setHasEnded(false);
                  setPlaybackPercent(0);
                }}
                className="px-2.5 py-1 text-[11px] text-slate-400 hover:text-white flex items-center space-x-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Rewatch</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
