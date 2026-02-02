import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { useTimelineState } from "@/hooks/use-timeline-state";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Plus,
  Trash2,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Music,
  Film,
  Sparkles,
  Layers,
  Rows,
  PanelBottom,
  Maximize2,
  Upload,
  Image,
  FileVideo,
  FileAudio,
  X,
  Undo2,
  Redo2,
  Scissors,
  Sun,
  Contrast,
  Droplet,
  Eye,
  EyeOff,
  Settings2,
  Zap,
  Power,
  CircleDot,
  Focus,
  Palette,
  AlignJustify,
  Waves,
  Grid3x3,
  FlipHorizontal,
  Aperture,
  Link2,
  Unlink2,
  GripVertical,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TimelineTrack, TimelineClip, TrackType, ClipType, VisualizationType, MediaFile, MediaFileType, ClipEffect } from "@shared/schema";
import { visualizationTypes } from "@shared/schema";

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const frames = Math.floor((seconds % 1) * 30);
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}:${frames.toString().padStart(2, "0")}`;
}

function PreviewPanel({ 
  playhead, 
  isPlaying, 
  duration,
  clips,
  tracks,
  soloTrackIds,
  aspectRatio,
  showSafeArea,
  showGrid,
}: { 
  playhead: number; 
  isPlaying: boolean;
  duration: number;
  clips: TimelineClip[];
  tracks: TimelineTrack[];
  soloTrackIds: string[];
  aspectRatio: "16:9" | "9:16" | "1:1" | "4:5";
  showSafeArea: boolean;
  showGrid: boolean;
}) {
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
  const activeClipIds = useRef<Set<string>>(new Set());
  const wasPlayingRef = useRef(false);
  
  const activeClips = clips.filter(
    (clip) => playhead >= clip.startTime && playhead < clip.startTime + clip.duration
  );
  
  const soloSet = useRef<Set<string>>(new Set());
  useEffect(() => {
    soloSet.current = new Set(soloTrackIds);
  }, [soloTrackIds]);

  const isTrackMuted = useCallback(
    (trackId: string) => {
      const track = tracks.find((t) => t.id === trackId);
      if (!track) return true;
      if (soloSet.current.size > 0) {
        return !soloSet.current.has(trackId);
      }
      return track.muted || false;
    },
    [tracks]
  );

  // Handle play/pause state changes and scrubbing
  useEffect(() => {
    const justStartedPlaying = isPlaying && !wasPlayingRef.current;
    const justPaused = !isPlaying && wasPlayingRef.current;
    wasPlayingRef.current = isPlaying;

    activeClips.forEach((clip) => {
      const clipTime = playhead - clip.startTime;
      const speed = clip.speed || 1;
      const trimOffset = clip.trimIn || 0;
      const targetTime = (clipTime * speed) + trimOffset;
      
      const shouldSyncMedia = (currentTime: number) =>
        justStartedPlaying || !isPlaying || Math.abs(currentTime - targetTime) > 0.25;

      // Handle video clips
      if (clip.mediaUrl && clip.type === "video") {
        const videoEl = videoRefs.current.get(clip.id);
        if (videoEl) {
          if (shouldSyncMedia(videoEl.currentTime)) {
            videoEl.currentTime = Math.max(0, targetTime);
          }
          
          if (isPlaying && videoEl.paused) {
            videoEl.playbackRate = speed;
            videoEl.play().catch(() => {});
          } else if (!isPlaying && !videoEl.paused) {
            videoEl.pause();
          }
        }
      }
      
      // Handle audio clips
      if (clip.mediaUrl && clip.type === "audio") {
        let audioEl = audioRefs.current.get(clip.id);
        if (!audioEl) {
          audioEl = document.createElement("audio");
          audioEl.src = clip.mediaUrl;
          audioEl.style.display = "none";
          audioEl.preload = "auto";
          document.body.appendChild(audioEl);
          audioRefs.current.set(clip.id, audioEl);
        }
        
        if (shouldSyncMedia(audioEl.currentTime)) {
          audioEl.currentTime = Math.max(0, targetTime);
        }
        
        const trackMuted = isTrackMuted(clip.trackId);
        const volume = trackMuted ? 0 : (clip.volume !== undefined ? clip.volume / 100 : 1);
        audioEl.volume = Math.max(0, Math.min(1, volume));
        
        if (isPlaying && audioEl.paused && !trackMuted) {
          audioEl.playbackRate = speed;
          audioEl.play().catch(() => {});
        } else if ((!isPlaying || trackMuted) && !audioEl.paused) {
          audioEl.pause();
        }
      }
    });
  }, [isPlaying, activeClips, playhead, isTrackMuted]);

  // Cleanup when clips change or are removed
  useEffect(() => {
    const currentActiveIds = new Set(activeClips.map(c => c.id));
    const allClipIds = new Set(clips.map(c => c.id));
    
    videoRefs.current.forEach((videoEl, clipId) => {
      if (!allClipIds.has(clipId)) {
        videoEl.pause();
        videoEl.src = "";
        videoRefs.current.delete(clipId);
      } else if (!currentActiveIds.has(clipId) && activeClipIds.current.has(clipId)) {
        videoEl.pause();
      }
    });
    
    audioRefs.current.forEach((audioEl, clipId) => {
      if (!allClipIds.has(clipId)) {
        audioEl.pause();
        audioEl.src = "";
        if (audioEl.parentNode) {
          audioEl.parentNode.removeChild(audioEl);
        }
        audioRefs.current.delete(clipId);
      } else if (!currentActiveIds.has(clipId) && activeClipIds.current.has(clipId)) {
        audioEl.pause();
      }
    });
    
    activeClipIds.current = currentActiveIds;
  }, [activeClips, clips]);

  // Cleanup audio elements on unmount only
  useEffect(() => {
    const refs = audioRefs.current;
    return () => {
      refs.forEach((audioEl) => {
        audioEl.pause();
        audioEl.src = "";
        if (audioEl.parentNode) {
          audioEl.parentNode.removeChild(audioEl);
        }
      });
    };
  }, []);

  const renderEffectOverlay = (effect: ClipEffect, clipTime: number, clipDuration: number) => {
    if (!effect.enabled) return null;
    
    const effectStart = effect.startOffset || 0;
    const effectDuration = effect.duration || clipDuration;
    const effectTime = clipTime - effectStart;
    
    if (effectTime < 0 || effectTime > effectDuration) return null;
    
    if (effect.type === "visualizer") {
      const colorMap: Record<string, string[]> = {
        neon: ["#ff00ff", "#00ffff", "#ffff00"],
        sunset: ["#ff6b35", "#ff9a3c", "#ffc93c"],
        ocean: ["#0077be", "#00a8cc", "#00d4ff"],
        galaxy: ["#9b59b6", "#3498db", "#1abc9c"],
        fire: ["#ff4500", "#ff6347", "#ffa500"],
        matrix: ["#00ff00", "#32cd32", "#228b22"],
        pastel: ["#ffb3ba", "#bae1ff", "#baffc9"],
        monochrome: ["#ffffff", "#cccccc", "#999999"],
      };
      const colors = colorMap[effect.colorScheme || "neon"] || colorMap.neon;
      const animPhase = (Date.now() / 1000) % 1;
      
      return (
        <div 
          key={effect.id}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(${animPhase * 360}deg, ${colors[0]}40 0%, ${colors[1]}30 50%, ${colors[2]}40 100%)`,
            mixBlendMode: "screen",
          }}
        >
          <div className="absolute bottom-4 left-4 text-white/60 text-xs">
            {effect.visualizationType || "Visualizer"} Effect
          </div>
        </div>
      );
    }
    
    if (effect.type === "overlay" || effect.type === "filter") {
      const settings = effect.settings as Record<string, number | boolean | string> || {};
      const intensity = (settings.intensity as number) || 0.5;
      
      let overlayStyle: React.CSSProperties = {
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
      };
      
      if (effect.name.toLowerCase().includes("glow") || effect.name.toLowerCase().includes("bloom")) {
        overlayStyle.boxShadow = `inset 0 0 ${60 * intensity}px ${30 * intensity}px rgba(255,255,255,${0.2 * intensity})`;
      } else if (effect.name.toLowerCase().includes("vignette")) {
        overlayStyle.background = `radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,${0.7 * intensity}) 100%)`;
      } else if (effect.name.toLowerCase().includes("blur")) {
        overlayStyle.backdropFilter = `blur(${10 * intensity}px)`;
      } else if (effect.name.toLowerCase().includes("color")) {
        overlayStyle.background = `rgba(${settings.r || 255}, ${settings.g || 100}, ${settings.b || 100}, ${0.3 * intensity})`;
        overlayStyle.mixBlendMode = "overlay";
      }
      
      return <div key={effect.id} style={overlayStyle} />;
    }
    
    return null;
  };

  const renderClipPreview = (clip: TimelineClip) => {
    const opacity = clip.opacity !== undefined ? clip.opacity / 100 : 1;
    const brightness = clip.filters?.brightness !== undefined ? 100 + clip.filters.brightness : 100;
    const contrast = clip.filters?.contrast !== undefined ? 100 + clip.filters.contrast : 100;
    const saturation = clip.filters?.saturation !== undefined ? 100 + clip.filters.saturation : 100;
    const blur = clip.filters?.blur !== undefined ? clip.filters.blur : 0;
    
    const filterStyle = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`;
    const clipTime = playhead - clip.startTime;
    const effects = clip.effects || [];
    const enabledEffects = effects.filter(e => e.enabled);

    if (clip.type === "video" && clip.mediaUrl) {
      return (
        <>
          <video
            ref={(el) => {
              if (el) videoRefs.current.set(clip.id, el);
            }}
            src={clip.mediaUrl}
            className="absolute inset-0 w-full h-full object-contain"
            style={{ opacity, filter: filterStyle }}
            muted
            playsInline
            preload="auto"
          />
          {enabledEffects.map(effect => renderEffectOverlay(effect, clipTime, clip.duration))}
        </>
      );
    }
    
    if (clip.type === "audio") {
      return null;
    }
    
    if (clip.type === "visualizer") {
      return (
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ 
            background: `linear-gradient(135deg, ${clip.color}40 0%, ${clip.color}80 100%)`,
            opacity 
          }}
        >
          <div className="text-center">
            <Sparkles className="w-16 h-16 mx-auto mb-2 text-white" />
            <div className="text-xl font-medium text-white">{clip.name}</div>
            <div className="text-sm text-gray-300">{clip.visualizationType || "Visualizer"}</div>
          </div>
        </div>
      );
    }

    if (clip.type === "image" && clip.mediaUrl) {
      return (
        <>
          <img
            src={clip.mediaUrl}
            alt={clip.name}
            className="absolute inset-0 w-full h-full object-contain"
            style={{ opacity, filter: filterStyle }}
          />
          {enabledEffects.map(effect => renderEffectOverlay(effect, clipTime, clip.duration))}
        </>
      );
    }

    return (
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ backgroundColor: clip.color + "20", opacity }}
      >
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{clip.name}</div>
          <div className="text-sm text-gray-400">{clip.type}</div>
        </div>
      </div>
    );
  };

  // Filter to only visual clips (not audio) and sort by layer order
  const visualClips = activeClips.filter(clip => clip.type !== "audio");
  // Render visualizers first (background), then video on top
  const sortedVisualClips = [...visualClips].sort((a, b) => {
    const order = { visualizer: 0, video: 1 };
    return (order[a.type as keyof typeof order] ?? 2) - (order[b.type as keyof typeof order] ?? 2);
  });

  const aspectClass =
    aspectRatio === "9:16"
      ? "aspect-[9/16] max-w-[60%] sm:max-w-[45%] mx-auto"
      : aspectRatio === "1:1"
        ? "aspect-square max-w-[70%] sm:max-w-[55%] mx-auto"
        : aspectRatio === "4:5"
          ? "aspect-[4/5] max-w-[70%] sm:max-w-[55%] mx-auto"
          : "aspect-video";

  return (
    <div className={`bg-black rounded-lg ${aspectClass} flex items-center justify-center relative overflow-hidden`}>
      {sortedVisualClips.length > 0 ? (
        <div className="absolute inset-0">
          {sortedVisualClips.map((clip, index) => (
            <div key={clip.id} className="absolute inset-0" style={{ zIndex: index }}>
              {renderClipPreview(clip)}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-muted-foreground text-center">
          <Film className="w-16 h-16 mx-auto mb-2 opacity-50" />
          <p>No clip at playhead</p>
        </div>
      )}
      {showGrid && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.15)_1px,transparent_1px)]" style={{ backgroundSize: "33.333% 33.333%" }} />
        </div>
      )}
      {showSafeArea && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-[5%] border border-white/40 rounded-sm" />
          <div className="absolute inset-[10%] border border-white/20 rounded-sm" />
        </div>
      )}
      <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white font-mono z-50">
        {formatTime(playhead)}
      </div>
    </div>
  );
}

function TransportControls({
  isPlaying,
  playhead,
  duration,
  snapEnabled,
  onPlay,
  onPause,
  onSeek,
  onSkipBack,
  onSkipForward,
}: {
  isPlaying: boolean;
  playhead: number;
  duration: number;
  snapEnabled: boolean;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number, snap?: boolean) => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
}) {
  return (
    <div className="flex items-center gap-4 p-4 bg-card rounded-lg">
      <div className="flex items-center gap-1">
        <Button 
          size="icon" 
          variant="ghost" 
          onClick={onSkipBack}
          data-testid="button-skip-back"
        >
          <SkipBack className="w-4 h-4" />
        </Button>
        <Button 
          size="icon" 
          variant="default"
          onClick={isPlaying ? onPause : onPlay}
          data-testid="button-play-pause"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
        <Button 
          size="icon" 
          variant="ghost" 
          onClick={onSkipForward}
          data-testid="button-skip-forward"
        >
          <SkipForward className="w-4 h-4" />
        </Button>
        <span
          className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-medium ${
            snapEnabled ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
          }`}
          title="Snap status (hold Alt to bypass)"
        >
          Snap: {snapEnabled ? "On" : "Off"}
        </span>
      </div>
      <div className="flex-1 flex items-center gap-2">
        <span className="text-xs font-mono text-muted-foreground w-20">
          {formatTime(playhead)}
        </span>
        <Slider
          value={[playhead]}
          min={0}
          max={duration}
          step={0.033}
          onValueChange={([val]) => onSeek(val)}
          className="flex-1"
          data-testid="slider-playhead"
        />
        <span className="text-xs font-mono text-muted-foreground w-20 text-right">
          {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}

function TimelineRuler({ 
  duration, 
  zoom, 
  playhead,
  fps,
  snapEnabled,
  onSeek,
  onScrubStart,
  onScrubEnd 
}: { 
  duration: number; 
  zoom: number;
  playhead: number;
  fps: number;
  snapEnabled: boolean;
  onSeek: (time: number, snap?: boolean) => void;
  onScrubStart: () => void;
  onScrubEnd: () => void;
}) {
  const pxPerSecond = 50 * zoom;
  const totalWidth = duration * pxPerSecond;
  const rulerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const [hoverInfo, setHoverInfo] = useState<{ x: number; time: number } | null>(null);

  const snapTime = useCallback(
    (time: number, snap: boolean) => {
      if (!snap) return time;
      const step = 1 / fps;
      return Math.round(time / step) * step;
    },
    [fps]
  );

  const handleClick = (e: React.MouseEvent) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + rulerRef.current.scrollLeft;
    const time = x / pxPerSecond;
    const shouldSnap = snapEnabled && !e.altKey;
    onSeek(Math.max(0, Math.min(snapTime(time, shouldSnap), duration)), shouldSnap);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    draggingRef.current = true;
    onScrubStart();
    handleClick(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + rulerRef.current.scrollLeft;
    const time = Math.max(0, Math.min(x / pxPerSecond, duration));
    setHoverInfo({ x, time });
  };

  const handleMouseLeave = () => {
    setHoverInfo(null);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current || !rulerRef.current) return;
      const rect = rulerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + rulerRef.current.scrollLeft;
      const time = x / pxPerSecond;
      const shouldSnap = snapEnabled && !e.altKey;
      onSeek(Math.max(0, Math.min(snapTime(time, shouldSnap), duration)), shouldSnap);
    };

    const handleMouseUp = () => {
      draggingRef.current = false;
      onScrubEnd();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [duration, onSeek, pxPerSecond, snapEnabled, snapTime]);

  const markers: { time: number; label: string; major: boolean }[] = [];
  const interval = zoom < 0.5 ? 10 : zoom < 1 ? 5 : zoom < 2 ? 2 : 1;
  
  for (let t = 0; t <= duration; t += interval) {
    markers.push({
      time: t,
      label: `${Math.floor(t / 60)}:${(t % 60).toString().padStart(2, "0")}`,
      major: t % (interval * 2) === 0,
    });
  }

  return (
    <div 
      ref={rulerRef}
      className="h-6 bg-muted/50 border-b relative cursor-pointer select-none"
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        width: totalWidth,
        backgroundImage: snapEnabled
          ? "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px)"
          : undefined,
        backgroundSize: `${pxPerSecond}px 100%`,
      }}
      data-testid="timeline-ruler"
    >
      {markers
        .filter((marker) => marker.major || zoom >= 1)
        .map((marker) => (
        <div
          key={marker.time}
          className="absolute top-0 flex flex-col items-center"
          style={{ left: marker.time * pxPerSecond }}
        >
          <div 
            className={`w-px ${marker.major ? "h-4 bg-foreground/70" : "h-2 bg-foreground/30"}`}
          />
          {marker.major && (
            <span className="text-[10px] text-muted-foreground">{marker.label}</span>
          )}
        </div>
      ))}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20"
        style={{ left: playhead * pxPerSecond }}
      />
      {hoverInfo && (
        <div
          className="absolute top-0 z-30 -translate-x-1/2"
          style={{ left: hoverInfo.x }}
        >
          <div className="rounded bg-black/80 px-1.5 py-0.5 text-[10px] text-white">
            {formatTime(hoverInfo.time)}
            {snapEnabled && (
              <span className="ml-1 text-white/70">
                • Snap {formatTime(snapTime(hoverInfo.time, true))}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TrackHeader({
  track,
  trackCount,
  onMute,
  onLock,
  onDelete,
  onSolo,
  onReorder,
  isHighlighted,
  onHoverStart,
  onHoverEnd,
  isSolo,
}: {
  track: TimelineTrack;
  trackCount: number;
  onMute: () => void;
  onLock: () => void;
  onDelete: () => void;
  onSolo: () => void;
  onReorder: (draggedTrackId: string, newOrder: number) => void;
  isHighlighted: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  isSolo: boolean;
}) {
  const icons: Record<TrackType, typeof Film> = {
    video: Film,
    audio: Music,
    visualizer: Sparkles,
  };
  const Icon = icons[track.type];
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("track-reorder", JSON.stringify({ trackId: track.id, order: track.order }));
    e.dataTransfer.effectAllowed = "move";
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    const data = e.dataTransfer.types.includes("track-reorder");
    if (data) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("track-reorder");
    if (data) {
      const { trackId: draggedTrackId } = JSON.parse(data);
      if (draggedTrackId !== track.id) {
        onReorder(draggedTrackId, track.order);
      }
    }
  };

  return (
    <div 
      className={cn(
        "flex items-center gap-1 px-2 py-1 bg-card border-b transition-colors",
        isHighlighted && "bg-muted/40",
        isDragging && "opacity-50"
      )}
      style={{ height: track.height }}
      data-testid={`track-header-${track.id}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
    >
      <GripVertical className="w-3 h-3 text-muted-foreground cursor-grab flex-shrink-0" />
      <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      <span className="text-sm flex-1 truncate min-w-0">{track.name}</span>
      <div className="hidden sm:flex items-center gap-1">
        <Button
          size="icon"
          variant={isSolo ? "default" : "ghost"}
          onClick={onSolo}
          title="Solo"
          data-testid={`button-solo-${track.id}`}
        >
          <CircleDot className="w-3 h-3" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={onMute}
          data-testid={`button-mute-${track.id}`}
        >
          {track.muted ? (
            <VolumeX className="w-3 h-3 text-destructive" />
          ) : (
            <Volume2 className="w-3 h-3" />
          )}
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={onLock}
          data-testid={`button-lock-${track.id}`}
        >
          {track.locked ? (
            <Lock className="w-3 h-3 text-yellow-500" />
          ) : (
            <Unlock className="w-3 h-3" />
          )}
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={onDelete}
          data-testid={`button-delete-track-${track.id}`}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className="sm:hidden">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onSolo}>
            {isSolo ? "Unsolo" : "Solo"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onMute}>
            {track.muted ? "Unmute" : "Mute"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onLock}>
            {track.locked ? "Unlock" : "Lock"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function ClipComponent({
  clip,
  zoom,
  fps,
  snapEnabled,
  snapPoints,
  magnetTolerance,
  hasOverlap,
  isSelected,
  isLocked,
  onSelect,
  onDragStart,
  onDragEnd,
  onSnapGuide,
  onMove,
  onResize,
}: {
  clip: TimelineClip;
  zoom: number;
  fps: number;
  snapEnabled: boolean;
  snapPoints: number[];
  magnetTolerance: number;
  hasOverlap: boolean;
  isSelected: boolean;
  isLocked: boolean;
  onSelect: (event: React.MouseEvent) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onSnapGuide: (time: number | null) => void;
  onMove: (newStartTime: number, deltaTime: number) => void;
  onResize: (newStartTime: number, newDuration: number) => void;
}) {
  const pxPerSecond = 50 * zoom;
  const width = clip.duration * pxPerSecond;
  const left = clip.startTime * pxPerSecond;
  const [isDragging, setIsDragging] = useState(false);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);
  const [activeDuration, setActiveDuration] = useState<number | null>(null);
  const dragStartRef = useRef({ x: 0, startTime: 0, duration: 0 });

  const snapTime = useCallback(
    (time: number, snap: boolean) => {
      if (!snap) return time;
      const step = 1 / fps;
      return Math.round(time / step) * step;
    },
    [fps]
  );

  const magnetizeMove = useCallback(
    (startTime: number, duration: number, shouldSnap: boolean) => {
      if (!shouldSnap || snapPoints.length === 0) {
        return { start: startTime, guide: null as number | null };
      }
      const endTime = startTime + duration;
      let bestStart = startTime;
      let bestDist = magnetTolerance + 1;
      let bestGuide: number | null = null;
      for (const point of snapPoints) {
        const distStart = Math.abs(point - startTime);
        if (distStart <= magnetTolerance && distStart < bestDist) {
          bestDist = distStart;
          bestStart = point;
          bestGuide = point;
        }
        const distEnd = Math.abs(point - endTime);
        if (distEnd <= magnetTolerance && distEnd < bestDist) {
          bestDist = distEnd;
          bestStart = point - duration;
          bestGuide = point;
        }
      }
      return { start: bestStart, guide: bestGuide };
    },
    [magnetTolerance, snapPoints]
  );

  const magnetizeEdge = useCallback(
    (edgeTime: number, shouldSnap: boolean) => {
      if (!shouldSnap || snapPoints.length === 0) {
        return { edge: edgeTime, guide: null as number | null };
      }
      let bestEdge = edgeTime;
      let bestDist = magnetTolerance + 1;
      let bestGuide: number | null = null;
      for (const point of snapPoints) {
        const dist = Math.abs(point - edgeTime);
        if (dist <= magnetTolerance && dist < bestDist) {
          bestDist = dist;
          bestEdge = point;
          bestGuide = point;
        }
      }
      return { edge: bestEdge, guide: bestGuide };
    },
    [magnetTolerance, snapPoints]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(e);
    if (isLocked) return;
    setIsDragging(true);
    onDragStart();
    dragStartRef.current = { 
      x: e.clientX, 
      startTime: clip.startTime,
      duration: clip.duration 
    };
  };

  const handleResizeLeftDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(e);
    if (isLocked) return;
    setIsResizingLeft(true);
    onDragStart();
    dragStartRef.current = { 
      x: e.clientX, 
      startTime: clip.startTime,
      duration: clip.duration 
    };
  };

  const handleResizeRightDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(e);
    if (isLocked) return;
    setIsResizingRight(true);
    onDragStart();
    dragStartRef.current = { 
      x: e.clientX, 
      startTime: clip.startTime,
      duration: clip.duration 
    };
  };

  useEffect(() => {
    if (!isDragging && !isResizingLeft && !isResizingRight) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaTime = deltaX / pxPerSecond;

      const shouldSnap = snapEnabled && !e.altKey;
      if (!shouldSnap) {
        onSnapGuide(null);
      }
      if (isDragging) {
        const desiredStart = snapTime(dragStartRef.current.startTime + deltaTime, shouldSnap);
        const { start: magnetizedStart, guide } = magnetizeMove(
          desiredStart,
          dragStartRef.current.duration,
          shouldSnap
        );
        onSnapGuide(guide);
        const clampedStart = Math.max(0, magnetizedStart);
        onMove(clampedStart, clampedStart - dragStartRef.current.startTime);
      } else if (isResizingLeft) {
        const endFixed = dragStartRef.current.startTime + dragStartRef.current.duration;
        const desiredStart = snapTime(dragStartRef.current.startTime + deltaTime, shouldSnap);
        const { edge: magnetizedStart, guide } = magnetizeEdge(desiredStart, shouldSnap);
        onSnapGuide(guide);
        const nextDuration = snapTime(endFixed - magnetizedStart, shouldSnap);
        setActiveDuration(Math.max(0.5, nextDuration));
        onResize(Math.max(0, magnetizedStart), Math.max(0.5, nextDuration));
      } else if (isResizingRight) {
        const desiredDuration = snapTime(dragStartRef.current.duration + deltaTime, shouldSnap);
        const desiredEnd = dragStartRef.current.startTime + desiredDuration;
        const { edge: magnetizedEnd, guide } = magnetizeEdge(desiredEnd, shouldSnap);
        onSnapGuide(guide);
        const nextDuration = snapTime(magnetizedEnd - dragStartRef.current.startTime, shouldSnap);
        setActiveDuration(Math.max(0.5, nextDuration));
        onResize(dragStartRef.current.startTime, Math.max(0.5, nextDuration));
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizingLeft(false);
      setIsResizingRight(false);
      setActiveDuration(null);
      onSnapGuide(null);
      onDragEnd();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isDragging,
    isResizingLeft,
    isResizingRight,
    pxPerSecond,
    onMove,
    onResize,
    snapEnabled,
    snapTime,
    magnetizeMove,
    magnetizeEdge,
    onSnapGuide,
    onDragEnd,
  ]);

  const effectCount = clip.effects?.length || 0;

  return (
    <div
      className={`absolute top-1 bottom-1 rounded cursor-move select-none z-10 border ${
        isSelected ? "ring-2 ring-primary z-20 shadow-lg" : "border-white/10 shadow-sm"
      } ${hasOverlap ? "border-red-400/80 shadow-[0_0_0_1px_rgba(248,113,113,0.8)]" : ""}`}
      style={{
        left,
        width: Math.max(width, 20),
        backgroundColor: clip.color,
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(e);
      }}
      data-testid={`clip-${clip.id}`}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/30 flex items-center justify-center"
        onMouseDown={handleResizeLeftDown}
      >
        <div className="h-4 w-0.5 bg-white/70 rounded" />
      </div>
      <div className="px-2 py-1 text-xs text-white truncate pointer-events-none flex items-center gap-1">
        <span>{clip.name}</span>
        {effectCount > 0 && (
          <span className="bg-primary/30 text-white text-[9px] px-1 rounded">
            {effectCount} fx
          </span>
        )}
      </div>
      <div
        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/30 flex items-center justify-center"
        onMouseDown={handleResizeRightDown}
      >
        <div className="h-4 w-0.5 bg-white/70 rounded" />
      </div>
      {(isResizingLeft || isResizingRight) && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.25),rgba(255,255,255,0.25)_6px,rgba(255,255,255,0)_6px,rgba(255,255,255,0)_12px)] opacity-40 animate-pulse" />
        </div>
      )}
      {activeDuration !== null && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 rounded bg-black/80 px-1.5 py-0.5 text-[10px] text-white">
          {formatTime(activeDuration)}
        </div>
      )}
    </div>
  );
}

function EffectBar({
  effect,
  clipStartTime,
  clipDuration,
  zoom,
  onToggle,
  onRemove,
}: {
  effect: ClipEffect;
  clipStartTime: number;
  clipDuration: number;
  zoom: number;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const pxPerSecond = 50 * zoom;
  const effectDuration = effect.duration > 0 ? Math.min(effect.duration, clipDuration) : clipDuration;
  const left = (clipStartTime + effect.startOffset) * pxPerSecond;
  const width = effectDuration * pxPerSecond;

  return (
    <div
      className={`absolute top-0.5 bottom-0.5 rounded text-[10px] flex items-center gap-1 px-1 ${
        effect.enabled ? "bg-purple-600/80" : "bg-gray-500/50"
      }`}
      style={{ left, width: Math.max(width, 40) }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className="flex-shrink-0 hover:opacity-80"
      >
        <Power className={`w-3 h-3 ${effect.enabled ? "text-green-300" : "text-gray-400"}`} />
      </button>
      <span className="truncate flex-1 text-white/90">{effect.name}</span>
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="flex-shrink-0 hover:text-red-300"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

function TrackLane({
  track,
  clips,
  zoom,
  fps,
  snapEnabled,
  snapToClips,
  allClips,
  projectDuration,
  bpm,
  magnetStrengthPx,
  onSeek,
  onScrubStart,
  onScrubEnd,
  showTrackLabel,
  playhead,
  selectedClipIds,
  onSelectClip,
  onMoveClip,
  onClipDragStart,
  onClipDragEnd,
  onResizeClip,
  onAddClip,
  onDropMedia,
  onDropEffectOnClip,
  onToggleEffect,
  onRemoveEffect,
  scrollLeft = 0,
  isHighlighted,
  onHoverStart,
  onHoverEnd,
}: {
  track: TimelineTrack;
  clips: TimelineClip[];
  zoom: number;
  fps: number;
  snapEnabled: boolean;
  snapToClips: boolean;
  allClips: TimelineClip[];
  projectDuration: number;
  bpm: number | null;
  magnetStrengthPx: number;
  onSeek: (time: number, snap?: boolean) => void;
  onScrubStart: () => void;
  onScrubEnd: () => void;
  showTrackLabel: boolean;
  playhead: number;
  selectedClipIds: string[];
  onSelectClip: (id: string | null, additive?: boolean) => void;
  onMoveClip: (id: string, newStartTime: number, deltaTime: number) => void;
  onClipDragStart: (id: string) => void;
  onClipDragEnd: () => void;
  onResizeClip: (id: string, newStartTime: number, newDuration: number) => void;
  onAddClip: (startTime: number) => void;
  onDropMedia: (data: { type: ClipType; name: string; visualizationType?: string; mediaUrl?: string; duration?: number; clipSettings?: Record<string, unknown> }, startTime: number) => void;
  onDropEffectOnClip: (clipId: string, effectData: unknown) => void;
  onToggleEffect: (clipId: string, effectId: string) => void;
  onRemoveEffect: (clipId: string, effectId: string) => void;
  scrollLeft?: number;
  isHighlighted: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}) {
  const pxPerSecond = 50 * zoom;
  const laneRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [snapGuideTime, setSnapGuideTime] = useState<number | null>(null);
  const [hoverInfo, setHoverInfo] = useState<{ x: number; time: number } | null>(null);
  const magnetTolerance = magnetStrengthPx / pxPerSecond;
  const draggingPlayheadRef = useRef(false);

  // Find selected clip in this track
  const primarySelectedId = selectedClipIds[0] ?? null;
  const selectedClip = clips.find((c) => c.id === primarySelectedId);
  const showEffectLane = selectedClip && (selectedClip.type === "video" || selectedClip.type === "image");
  const effectLaneHeight = 24;

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (track.locked) return;
    if (!laneRef.current) return;
    const rect = laneRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + scrollLeft;
    const time = x / pxPerSecond;
    onAddClip(Math.max(0, time));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (track.locked) return;
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (track.locked) return;
    if (!laneRef.current) return;

    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      const rect = laneRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + scrollLeft;
      const time = Math.max(0, x / pxPerSecond);
      
      // Check if dropping on a clip (to add effect) or on empty space
      const targetClip = clips.find((clip) => {
        const clipLeft = clip.startTime * pxPerSecond;
        const clipRight = (clip.startTime + clip.duration) * pxPerSecond;
        return x >= clipLeft && x <= clipRight;
      });

      if (targetClip && (data.type === "visualizer" || data.visualizationType)) {
        // Drop effect on clip
        onDropEffectOnClip(targetClip.id, data);
      } else {
        // Normal drop to create new clip
        onDropMedia(data, time);
      }
    } catch (err) {
      console.error("Drop failed:", err);
    }
  };

  const totalHeight = showEffectLane ? track.height + effectLaneHeight : track.height;
  const interval = zoom < 0.5 ? 10 : zoom < 1 ? 5 : zoom < 2 ? 2 : 1;
  const snapPoints = [
    0,
    playhead,
    projectDuration,
    ...(snapToClips
      ? allClips.flatMap((c) => [c.startTime, c.startTime + c.duration])
      : []),
  ];
  for (let t = 0; t <= projectDuration; t += interval) {
    snapPoints.push(t);
  }
  if (bpm && bpm > 0) {
    const beatInterval = 60 / bpm;
    for (let t = 0; t <= projectDuration; t += beatInterval) {
      snapPoints.push(t);
    }
  }

  const handlePlayheadSeek = (e: React.MouseEvent) => {
    if (!laneRef.current) return;
    const rect = laneRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + scrollLeft;
    const time = x / pxPerSecond;
    const shouldSnap = snapEnabled && !e.altKey;
    onSeek(Math.max(0, Math.min(time, projectDuration)), shouldSnap);
  };

  const handleHover = (e: React.MouseEvent) => {
    if (!laneRef.current) return;
    const rect = laneRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + scrollLeft;
    const time = Math.max(0, Math.min(x / pxPerSecond, projectDuration));
    setHoverInfo({ x, time });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingPlayheadRef.current || !laneRef.current) return;
      const rect = laneRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + scrollLeft;
      const time = x / pxPerSecond;
      const shouldSnap = snapEnabled && !e.altKey;
      onSeek(Math.max(0, Math.min(time, projectDuration)), shouldSnap);
    };

    const handleMouseUp = () => {
      if (draggingPlayheadRef.current) {
        draggingPlayheadRef.current = false;
        onScrubEnd();
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [onScrubEnd, onSeek, pxPerSecond, projectDuration, scrollLeft, snapEnabled]);

  const overlapIds = new Set<string>();
  const sortedClips = [...clips].sort((a, b) => a.startTime - b.startTime);
  let lastEnd = -Infinity;
  let lastId: string | null = null;
  for (const clip of sortedClips) {
    const clipEnd = clip.startTime + clip.duration;
    if (clip.startTime < lastEnd && lastId) {
      overlapIds.add(lastId);
      overlapIds.add(clip.id);
    }
    if (clipEnd > lastEnd) {
      lastEnd = clipEnd;
      lastId = clip.id;
    }
  }

  return (
    <div
      ref={laneRef}
      className={`relative border-b transition-colors ${track.locked ? "opacity-50" : ""} ${isDragOver ? "bg-primary/10" : ""} ${
        isHighlighted ? "bg-muted/30" : "hover:bg-muted/10"
      }`}
      style={{ height: totalHeight }}
      onDoubleClick={handleDoubleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onMouseEnter={onHoverStart}
      onMouseLeave={() => {
        setHoverInfo(null);
        setSnapGuideTime(null);
        onHoverEnd();
      }}
      onMouseMove={handleHover}
      onMouseDown={(e) => {
        if (track.locked) return;
        if (e.button !== 0) return;
        onSelectClip(null);
        draggingPlayheadRef.current = true;
        onScrubStart();
        handlePlayheadSeek(e);
      }}
      data-testid={`track-lane-${track.id}`}
    >
      {/* Main track area */}
      <div
        className="relative"
        style={{
          height: track.height,
          backgroundImage: snapEnabled
            ? "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px)"
            : undefined,
          backgroundSize: `${pxPerSecond}px 100%`,
        }}
      >
        {showTrackLabel && (
          <div className="absolute left-1 top-1 z-20 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white sm:hidden">
            {track.name}
          </div>
        )}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
          style={{ left: playhead * pxPerSecond }}
        />
        {snapGuideTime !== null && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-primary/80 z-10"
            style={{ left: snapGuideTime * pxPerSecond }}
          />
        )}
        {hoverInfo && (
          <div
            className="absolute top-1 z-30 -translate-x-1/2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white"
            style={{ left: hoverInfo.x }}
          >
            {formatTime(hoverInfo.time)}
          </div>
        )}
        {clips.map((clip) => (
          <ClipComponent
            key={clip.id}
            clip={clip}
            zoom={zoom}
            fps={fps}
            snapEnabled={snapEnabled}
            snapPoints={snapPoints}
            magnetTolerance={magnetTolerance}
            isSelected={selectedClipIds.includes(clip.id)}
            isLocked={track.locked}
            onSelect={(event) => onSelectClip(clip.id, event.shiftKey || event.metaKey || event.ctrlKey)}
            onDragStart={() => onClipDragStart(clip.id)}
            onDragEnd={() => {
              setSnapGuideTime(null);
              onClipDragEnd();
            }}
            onSnapGuide={(time) => setSnapGuideTime(time)}
            onMove={(newStart, deltaTime) => onMoveClip(clip.id, newStart, deltaTime)}
            onResize={(newStart, newDuration) =>
              onResizeClip(clip.id, newStart, newDuration)
            }
            hasOverlap={overlapIds.has(clip.id)}
          />
        ))}
        {clips.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-[10px] text-muted-foreground/60">
            Double-click to add a clip
          </div>
        )}
      </div>
      
      {/* Effect sub-lane for selected clip */}
      {showEffectLane && selectedClip && (
        <div 
          className="relative bg-muted/30 border-t border-dashed border-primary/30"
          style={{ height: effectLaneHeight }}
        >
          <div className="absolute left-0 top-0 bottom-0 flex items-center px-1 text-[9px] text-muted-foreground z-20 bg-background/80">
            <Layers className="w-3 h-3 mr-1" />
            FX
          </div>
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500/50 z-10"
            style={{ left: playhead * pxPerSecond }}
          />
          {(selectedClip.effects || []).map((effect) => (
            <EffectBar
              key={effect.id}
              effect={effect}
              clipStartTime={selectedClip.startTime}
              clipDuration={selectedClip.duration}
              zoom={zoom}
              onToggle={() => onToggleEffect(selectedClip.id, effect.id)}
              onRemove={() => onRemoveEffect(selectedClip.id, effect.id)}
            />
          ))}
          {(selectedClip.effects || []).length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-[10px] text-muted-foreground/50 pl-8">
              Drop visual overlays here to add effects
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MediaLibrary({
  onAddToTimeline,
  onAddPresetToTimeline,
  mediaFiles,
  onUploadMedia,
  onRemoveMedia,
}: {
  onAddToTimeline: (type: ClipType, name: string, visualizationType?: string, mediaUrl?: string) => void;
  onAddPresetToTimeline: (type: ClipType, name: string, visualizationType: string, duration: number, clipSettings?: Record<string, unknown>) => void;
  mediaFiles: MediaFile[];
  onUploadMedia: (file: File, type: MediaFileType, metadata?: { duration?: number; sizeBytes?: number }) => void;
  onRemoveMedia: (id: string) => void;
}) {
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | MediaFileType>("all");
  const [sortBy, setSortBy] = useState<"recent" | "name" | "duration" | "size">("recent");

  const visualizerPresets = visualizationTypes.map((vt) => ({
    type: "visualizer" as ClipType,
    name: vt.split(/(?=[A-Z])/).join(" ").replace(/^./, s => s.toUpperCase()),
    visualizationType: vt,
    icon: Sparkles,
  }));

  const socialMediaPresets = [
    {
      id: "tiktok-drop",
      name: "TikTok Drop",
      description: "High energy beat drop with flash",
      category: "TikTok",
      visualizationType: "radialBurst" as const,
      duration: 3,
      clipSettings: { filters: { brightness: 20, contrast: 15, saturation: 20 } },
    },
    {
      id: "tiktok-transition",
      name: "Quick Cut",
      description: "Fast cuts popular on TikTok",
      category: "TikTok", 
      visualizationType: "bars" as const,
      duration: 0.5,
      clipSettings: { speed: 2 },
    },
    {
      id: "tiktok-text-pop",
      name: "Text Pop",
      description: "Animated text reveal effect",
      category: "TikTok",
      visualizationType: "equalizer" as const,
      duration: 1,
      clipSettings: { filters: { brightness: 10 } },
    },
    {
      id: "reels-zoom-pulse",
      name: "Zoom Pulse",
      description: "Pulsing zoom synced to beat",
      category: "Reels",
      visualizationType: "circular" as const,
      duration: 2,
      clipSettings: { filters: { saturation: 30 } },
    },
    {
      id: "reels-color-flash",
      name: "Color Flash",
      description: "Quick color overlay flashes",
      category: "Reels",
      visualizationType: "particles" as const,
      duration: 0.5,
      clipSettings: { filters: { brightness: 30, saturation: 40 } },
    },
    {
      id: "reels-slow-mo",
      name: "Slow Motion",
      description: "Dramatic slow-mo effect",
      category: "Reels",
      visualizationType: "fluid" as const,
      duration: 4,
      clipSettings: { speed: 0.5 },
    },
    {
      id: "viral-hook",
      name: "Viral Hook",
      description: "Attention-grabbing opener",
      category: "Viral",
      visualizationType: "spectrumAnalyzer" as const,
      duration: 2,
      clipSettings: { filters: { brightness: 25, contrast: 20 } },
    },
    {
      id: "cta-ending",
      name: "CTA Ending",
      description: "Call-to-action ending",
      category: "Viral",
      visualizationType: "audioBars" as const,
      duration: 3,
      clipSettings: { fadeOut: 1 },
    },
  ];

  const getMediaDuration = (file: File, type: MediaFileType) => {
    if (type === "image") return Promise.resolve(undefined);
    return new Promise<number | undefined>((resolve) => {
      const url = URL.createObjectURL(file);
      const media = document.createElement(type === "audio" ? "audio" : "video");
      media.preload = "metadata";
      media.src = url;
      media.onloadedmetadata = () => {
        const duration = Number.isFinite(media.duration) ? media.duration : undefined;
        URL.revokeObjectURL(url);
        resolve(duration);
      };
      media.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(undefined);
      };
    });
  };

  const formatDuration = (duration?: number) => {
    if (!duration || Number.isNaN(duration)) return "—";
    const mins = Math.floor(duration / 60);
    const secs = Math.floor(duration % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return "—";
    const units = ["B", "KB", "MB", "GB"];
    let value = bytes;
    let unitIndex = 0;
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex += 1;
    }
    return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)}${units[unitIndex]}`;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: MediaFileType) => {
    const files = e.target.files;
    if (files) {
      for (const file of Array.from(files)) {
        const duration = await getMediaDuration(file, type);
        onUploadMedia(file, type, { duration, sizeBytes: file.size });
      }
    }
    e.target.value = "";
  };

  const getMediaIcon = (type: MediaFileType) => {
    switch (type) {
      case "video": return FileVideo;
      case "image": return Image;
      case "audio": return FileAudio;
    }
  };

  const getMediaColor = (type: MediaFileType) => {
    switch (type) {
      case "video": return "text-blue-500";
      case "image": return "text-purple-500";
      case "audio": return "text-green-500";
    }
  };

  const filteredMedia = mediaFiles
    .filter((media) => {
      const matchesType = typeFilter === "all" || media.type === typeFilter;
      const matchesSearch =
        searchQuery.trim() === "" ||
        media.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "duration":
          return (b.duration ?? -1) - (a.duration ?? -1);
        case "size":
          return (b.sizeBytes ?? -1) - (a.sizeBytes ?? -1);
        case "recent":
        default:
          return (b.addedAt ?? 0) - (a.addedAt ?? 0);
      }
    });

  return (
    <div className="p-4 flex flex-col h-full overflow-hidden">
      <div className="mb-4">
        <h3 className="text-sm font-semibold mb-3">Import Media</h3>
        <div className="flex flex-wrap gap-2">
          <input
            ref={videoInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => handleFileUpload(e, "video")}
            multiple
            data-testid="input-upload-video"
          />
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileUpload(e, "image")}
            multiple
            data-testid="input-upload-image"
          />
          <input
            ref={audioInputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={(e) => handleFileUpload(e, "audio")}
            multiple
            data-testid="input-upload-audio"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => videoInputRef.current?.click()}
            data-testid="button-upload-video"
          >
            <FileVideo className="w-4 h-4 mr-1" />
            Video
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => imageInputRef.current?.click()}
            data-testid="button-upload-image"
          >
            <Image className="w-4 h-4 mr-1" />
            Image
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => audioInputRef.current?.click()}
            data-testid="button-upload-audio"
          >
            <FileAudio className="w-4 h-4 mr-1" />
            Audio
          </Button>
        </div>
      </div>

      {mediaFiles.length > 0 && (
        <div className="mb-4 border-t pt-4">
          <h3 className="text-sm font-semibold mb-3">Uploaded Media ({mediaFiles.length})</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search uploads..."
              className="h-8 w-full sm:w-40"
              data-testid="input-media-search"
            />
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as typeof typeFilter)}>
              <SelectTrigger className="h-8 w-full sm:w-32" data-testid="select-media-filter">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="image">Image</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
              <SelectTrigger className="h-8 w-full sm:w-36" data-testid="select-media-sort">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recently added</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="duration">Duration</SelectItem>
                <SelectItem value="size">Size</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 max-h-[150px] overflow-y-auto">
            {filteredMedia.map((media) => {
              const Icon = getMediaIcon(media.type);
              const clipType: ClipType = media.type === "image" ? "image" : media.type;
              return (
                <div
                  key={media.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer group"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("application/json", JSON.stringify({
                      type: clipType,
                      name: media.name,
                      mediaUrl: media.url,
                    }));
                    const preview = document.createElement("div");
                    preview.style.padding = "6px 8px";
                    preview.style.borderRadius = "8px";
                    preview.style.background = "rgba(0,0,0,0.75)";
                    preview.style.color = "white";
                    preview.style.fontSize = "12px";
                    preview.style.display = "flex";
                    preview.style.alignItems = "center";
                    preview.style.gap = "6px";
                    preview.textContent = media.name;
                    document.body.appendChild(preview);
                    e.dataTransfer.setDragImage(preview, 10, 10);
                    setTimeout(() => preview.remove(), 0);
                  }}
                  onDoubleClick={() => onAddToTimeline(clipType, media.name, undefined, media.url)}
                  onMouseEnter={() => {
                    if (media.type !== "audio") return;
                    if (!audioPreviewRef.current) {
                      audioPreviewRef.current = new Audio();
                    }
                    const player = audioPreviewRef.current;
                    player.src = media.url;
                    player.currentTime = 0;
                    player.volume = 0.4;
                    player.play().catch(() => {});
                  }}
                  onMouseLeave={() => {
                    if (!audioPreviewRef.current) return;
                    audioPreviewRef.current.pause();
                  }}
                  data-testid={`media-file-${media.id}`}
                >
                  {media.type === "image" && media.url ? (
                    <img src={media.url} alt={media.name} className="w-8 h-8 object-cover rounded" />
                  ) : (
                    <Icon className={`w-4 h-4 ${getMediaColor(media.type)}`} />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{media.name}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {formatDuration(media.duration)} • {formatBytes(media.sizeBytes)}
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="w-6 h-6 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveMedia(media.id);
                    }}
                    data-testid={`button-remove-media-${media.id}`}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              );
            })}
            {filteredMedia.length === 0 && (
              <div className="text-[10px] text-muted-foreground text-center py-3">
                No media matches your filters.
              </div>
            )}
          </div>
        </div>
      )}

      <div className="border-t pt-4 flex-1 overflow-hidden flex flex-col min-h-0">
        <div className="space-y-4 flex-1 overflow-y-auto pr-1">
          <div>
            <h3 className="text-sm font-semibold mb-2 text-primary flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Visual Overlays
            </h3>
            <p className="text-[10px] text-muted-foreground mb-2">
              Drag to add animated overlays on top of your video
            </p>
            <div className="space-y-1">
              {socialMediaPresets.map((preset) => (
                <div
                  key={preset.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover-elevate cursor-pointer border border-border"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("application/json", JSON.stringify({
                      type: "visualizer",
                      name: preset.name,
                      visualizationType: preset.visualizationType,
                      duration: preset.duration,
                      clipSettings: preset.clipSettings,
                    }));
                  }}
                  onDoubleClick={() => onAddPresetToTimeline("visualizer", preset.name, preset.visualizationType, preset.duration, preset.clipSettings)}
                  data-testid={`social-preset-${preset.id}`}
                >
                  <Zap className="w-4 h-4 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium truncate">{preset.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">{preset.category}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">{preset.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">Audio Visualizers</h3>
            <p className="text-[10px] text-muted-foreground mb-2">
              Animated graphics that react to audio
            </p>
            <div className="space-y-1">
              {visualizerPresets.map((item, i) => (
                <div
                  key={item.visualizationType}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("application/json", JSON.stringify(item));
                  }}
                  onDoubleClick={() => onAddToTimeline(item.type, item.name, item.visualizationType)}
                  data-testid={`media-item-${i}`}
                >
                  <item.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm truncate">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-2">Video Effects</h3>
            <p className="text-[10px] text-muted-foreground mb-2">
              Visual overlays and filters for clips
            </p>
            <div className="space-y-1">
              {[
                { id: "glow", name: "Glow/Bloom", icon: Sparkles, settings: { intensity: 0.5 } },
                { id: "vignette", name: "Vignette", icon: CircleDot, settings: { intensity: 0.6 } },
                { id: "blur", name: "Blur Effect", icon: Focus, settings: { intensity: 0.3 } },
                { id: "color-overlay", name: "Color Overlay", icon: Palette, settings: { intensity: 0.4, r: 255, g: 100, b: 100 } },
                { id: "chromatic", name: "Chromatic Aberration", icon: Layers, settings: { intensity: 0.4 } },
                { id: "scanlines", name: "Scanlines", icon: AlignJustify, settings: { intensity: 0.3 } },
                { id: "glitch", name: "Glitch Effect", icon: Zap, settings: { intensity: 0.3 } },
                { id: "film-grain", name: "Film Grain", icon: Film, settings: { intensity: 0.4 } },
                { id: "wave-distort", name: "Wave Distortion", icon: Waves, settings: { intensity: 0.3 } },
                { id: "pixelate", name: "Pixelate", icon: Grid3x3, settings: { intensity: 0.3 } },
                { id: "mirror", name: "Mirror Effect", icon: FlipHorizontal, settings: { intensity: 0.5, mode: "horizontal" } },
                { id: "kaleidoscope", name: "Kaleidoscope", icon: Aperture, settings: { intensity: 0.5, segments: 6 } },
              ].map((effect) => (
                <div
                  key={effect.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("application/json", JSON.stringify({
                      type: "overlay",
                      effectType: "overlay",
                      name: effect.name,
                      settings: effect.settings,
                    }));
                  }}
                  data-testid={`video-effect-${effect.id}`}
                >
                  <effect.icon className="w-4 h-4 text-purple-400" />
                  <span className="text-sm truncate">{effect.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClipPropertiesPanel({
  clip,
  clips,
  onUpdate,
  onSplit,
  onDelete,
  playhead,
  onToggleEffect,
  onRemoveEffect,
  onLinkClip,
  onUnlinkClip,
}: {
  clip: TimelineClip;
  clips: TimelineClip[];
  onUpdate: (updates: Partial<TimelineClip>) => void;
  onSplit: () => void;
  onDelete: () => void;
  playhead: number;
  onToggleEffect?: (clipId: string, effectId: string) => void;
  onRemoveEffect?: (clipId: string, effectId: string) => void;
  onLinkClip?: (clipId: string, linkedToClipId: string) => void;
  onUnlinkClip?: (clipId: string) => void;
}) {
  const canSplit = playhead > clip.startTime && playhead < clip.startTime + clip.duration;
  const effects = clip.effects || [];
  
  const linkedClip = clip.linkedClipId ? clips.find(c => c.id === clip.linkedClipId) : null;
  const clipsLinkedToThis = clips.filter(c => c.linkedClipId === clip.id);
  const isLinked = !!linkedClip || clipsLinkedToThis.length > 0;
  
  const linkableClips = clips.filter(c => {
    if (c.id === clip.id) return false;
    if (c.linkedClipId || clips.some(other => other.linkedClipId === c.id)) return false;
    if (clip.type === "video" && c.type === "audio") return true;
    if (clip.type === "audio" && c.type === "video") return true;
    return false;
  });

  return (
    <div className="p-4 space-y-4 border-l bg-card" data-testid="clip-properties-panel">
      <div className="flex items-center justify-between gap-1">
        <h3 className="text-sm font-semibold">Clip Properties</h3>
        <Button
          size="icon"
          variant="ghost"
          onClick={onDelete}
          data-testid="button-delete-clip"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Name</label>
        <input
          type="text"
          value={clip.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          className="w-full px-2 py-1 text-sm bg-muted rounded border-0"
          data-testid="input-clip-name"
        />
      </div>

      <div className="border-t pt-4">
        <h4 className="text-xs font-semibold mb-3 flex items-center gap-2">
          <Settings2 className="w-3 h-3" /> Edit Tools
        </h4>
        <div className="space-y-2">
          <Button
            size="sm"
            variant="outline"
            className="w-full justify-start"
            onClick={onSplit}
            disabled={!canSplit}
            data-testid="button-split-clip"
          >
            <Scissors className="w-4 h-4 mr-2" />
            Split at Playhead
          </Button>
        </div>
      </div>

      {(clip.type === "audio" || clip.type === "video") && (
        <div className="border-t pt-4">
          <h4 className="text-xs font-semibold mb-3 flex items-center gap-2">
            {isLinked ? <Link2 className="w-3 h-3 text-primary" /> : <Unlink2 className="w-3 h-3" />}
            Audio/Video Link
          </h4>
          <div className="space-y-2">
            {isLinked ? (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground mb-2">
                  {linkedClip ? (
                    <span>Linked to: <span className="text-foreground font-medium">{linkedClip.name}</span></span>
                  ) : clipsLinkedToThis.length > 0 ? (
                    <span>Linked from: <span className="text-foreground font-medium">{clipsLinkedToThis.map(c => c.name).join(", ")}</span></span>
                  ) : null}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Speed changes will sync between linked clips
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    if (linkedClip && onUnlinkClip) {
                      onUnlinkClip(clip.id);
                    } else if (clipsLinkedToThis.length > 0 && onUnlinkClip) {
                      clipsLinkedToThis.forEach(c => onUnlinkClip(c.id));
                    }
                  }}
                  data-testid="button-unlink-clip"
                >
                  <Unlink2 className="w-4 h-4 mr-2" />
                  Unlink Clips
                </Button>
              </div>
            ) : linkableClips.length > 0 ? (
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Link to clip:</label>
                <div className="space-y-1">
                  {linkableClips.map(lc => (
                    <Button
                      key={lc.id}
                      size="sm"
                      variant="ghost"
                      className="w-full justify-start text-xs"
                      onClick={() => onLinkClip?.(clip.id, lc.id)}
                      data-testid={`button-link-to-${lc.id}`}
                    >
                      <Link2 className="w-3 h-3 mr-2" />
                      {lc.name} ({lc.type})
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-muted-foreground">
                No compatible clips to link. Add an {clip.type === "video" ? "audio" : "video"} clip to enable linking.
              </p>
            )}
          </div>
        </div>
      )}

      {(clip.type === "audio" || clip.type === "video") && (
        <div className="border-t pt-4">
          <h4 className="text-xs font-semibold mb-3 flex items-center gap-2">
            <Volume2 className="w-3 h-3" /> Audio
          </h4>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-muted-foreground">Volume</label>
                <span className="text-xs">{clip.volume ?? 100}%</span>
              </div>
              <Slider
                value={[clip.volume ?? 100]}
                onValueChange={([v]) => onUpdate({ volume: v })}
                min={0}
                max={100}
                step={1}
                data-testid="slider-volume"
              />
            </div>
          </div>
        </div>
      )}

      <div className="border-t pt-4">
        <h4 className="text-xs font-semibold mb-3 flex items-center gap-2">
          <Eye className="w-3 h-3" /> Opacity & Fades
        </h4>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-muted-foreground">Opacity</label>
              <span className="text-xs">{clip.opacity ?? 100}%</span>
            </div>
            <Slider
              value={[clip.opacity ?? 100]}
              onValueChange={([v]) => onUpdate({ opacity: v })}
              min={0}
              max={100}
              step={1}
              data-testid="slider-opacity"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-muted-foreground">Fade In</label>
              <span className="text-xs">{(clip.fadeIn ?? 0).toFixed(1)}s</span>
            </div>
            <Slider
              value={[clip.fadeIn ?? 0]}
              onValueChange={([v]) => onUpdate({ fadeIn: v })}
              min={0}
              max={Math.min(5, clip.duration / 2)}
              step={0.1}
              data-testid="slider-fade-in"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-muted-foreground">Fade Out</label>
              <span className="text-xs">{(clip.fadeOut ?? 0).toFixed(1)}s</span>
            </div>
            <Slider
              value={[clip.fadeOut ?? 0]}
              onValueChange={([v]) => onUpdate({ fadeOut: v })}
              min={0}
              max={Math.min(5, clip.duration / 2)}
              step={0.1}
              data-testid="slider-fade-out"
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="text-xs font-semibold mb-3 flex items-center gap-2">
          <Sun className="w-3 h-3" /> Video Effects
        </h4>
        <p className="text-[10px] text-muted-foreground mb-3">
          Apply effects to the selected clip
        </p>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-muted-foreground">Brightness</label>
              <span className="text-xs">{clip.filters?.brightness ?? 0}</span>
            </div>
            <Slider
              value={[clip.filters?.brightness ?? 0]}
              onValueChange={([v]) => onUpdate({ filters: { ...clip.filters, brightness: v } })}
              min={-100}
              max={100}
              step={1}
              data-testid="slider-brightness"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-muted-foreground">Contrast</label>
              <span className="text-xs">{clip.filters?.contrast ?? 0}</span>
            </div>
            <Slider
              value={[clip.filters?.contrast ?? 0]}
              onValueChange={([v]) => onUpdate({ filters: { ...clip.filters, contrast: v } })}
              min={-100}
              max={100}
              step={1}
              data-testid="slider-contrast"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-muted-foreground">Saturation</label>
              <span className="text-xs">{clip.filters?.saturation ?? 0}</span>
            </div>
            <Slider
              value={[clip.filters?.saturation ?? 0]}
              onValueChange={([v]) => onUpdate({ filters: { ...clip.filters, saturation: v } })}
              min={-100}
              max={100}
              step={1}
              data-testid="slider-saturation"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-muted-foreground">Blur</label>
              <span className="text-xs">{clip.filters?.blur ?? 0}px</span>
            </div>
            <Slider
              value={[clip.filters?.blur ?? 0]}
              onValueChange={([v]) => onUpdate({ filters: { ...clip.filters, blur: v } })}
              min={0}
              max={20}
              step={1}
              data-testid="slider-blur"
            />
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="text-xs font-semibold mb-3">Speed</h4>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-muted-foreground">Playback Speed</label>
            <span className="text-xs">{(clip.speed ?? 1).toFixed(2)}x</span>
          </div>
          <Slider
            value={[clip.speed ?? 1]}
            onValueChange={([v]) => onUpdate({ speed: v })}
            min={0.25}
            max={4}
            step={0.25}
            data-testid="slider-speed"
          />
        </div>
      </div>

      {(clip.type === "video" || clip.type === "image") && (
        <div className="border-t pt-4">
          <h4 className="text-xs font-semibold mb-3 flex items-center gap-2">
            <Layers className="w-3 h-3" /> Attached Effects
          </h4>
          <p className="text-[10px] text-muted-foreground mb-3">
            Drop visualizers onto this clip to add effects
          </p>
          {effects.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No effects attached</p>
          ) : (
            <div className="space-y-2">
              {effects.map((effect) => (
                <div 
                  key={effect.id}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-md border",
                    effect.enabled ? "bg-muted/50" : "bg-muted/20 opacity-60"
                  )}
                  data-testid={`effect-item-${effect.id}`}
                >
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onToggleEffect?.(clip.id, effect.id)}
                    data-testid={`button-toggle-effect-${effect.id}`}
                  >
                    {effect.enabled ? (
                      <Eye className="w-3 h-3" />
                    ) : (
                      <EyeOff className="w-3 h-3" />
                    )}
                  </Button>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{effect.name}</p>
                    <p className="text-[10px] text-muted-foreground">{effect.visualizationType}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onRemoveEffect?.(clip.id, effect.id)}
                    data-testid={`button-remove-effect-${effect.id}`}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type LayoutMode = "split" | "preview" | "timeline";

export default function Editor() {
  const {
    state,
    addTrack,
    removeTrack,
    toggleTrackMute,
    toggleTrackLock,
    addClip,
    moveClip,
    resizeClip,
    updateClip,
    splitClip,
    selectClip,
    setPlayhead,
    setZoom,
    setIsPlaying,
    getClipsForTrack,
    addMediaFile,
    removeMediaFile,
    deleteSelectedClip,
    addClipWithAutoTrack,
    undo,
    redo,
    canUndo,
    canRedo,
    cleanup,
    addEffectToClip,
    removeEffectFromClip,
    toggleEffectEnabled,
    linkClips,
    unlinkClip,
    updateClipWithLinked,
    reorderTrack,
  } = useTimelineState();

  const [layoutMode, setLayoutMode] = useState<LayoutMode>("split");
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [snapToClips, setSnapToClips] = useState(true);
  const [hoveredTrackId, setHoveredTrackId] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const wasPlayingRef = useRef(false);
  const timelineMouseRef = useRef<number | null>(null);
  const [magnetStrengthPx, setMagnetStrengthPx] = useState(6);
  const [bpm, setBpm] = useState<number | null>(null);
  const [soloTrackIds, setSoloTrackIds] = useState<string[]>([]);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showInspector, setShowInspector] = useState(false);
  const [timelineScrollLeft, setTimelineScrollLeft] = useState(0);
  const [previewAspectRatio, setPreviewAspectRatio] = useState<"16:9" | "9:16" | "1:1" | "4:5">("16:9");
  const [showSafeArea, setShowSafeArea] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const dragGroupRef = useRef<Map<string, number> | null>(null);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const storedSnap = window.localStorage.getItem("timelineSnapEnabled");
      if (storedSnap !== null) {
        setSnapEnabled(storedSnap === "true");
      }
      const storedSnapToClips = window.localStorage.getItem("timelineSnapToClips");
      if (storedSnapToClips !== null) {
        setSnapToClips(storedSnapToClips === "true");
      }
      const storedRate = window.localStorage.getItem("timelinePlaybackRate");
      if (storedRate !== null && storedRate.trim() !== "") {
        const parsed = Number(storedRate);
        if (!Number.isNaN(parsed)) {
          setPlaybackRate(parsed);
        }
      }
    } catch {
      // Ignore storage failures (private mode, quota, etc.)
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem("timelineSnapEnabled", String(snapEnabled));
    } catch {
      // Ignore storage failures
    }
  }, [snapEnabled]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem("timelineSnapToClips", String(snapToClips));
    } catch {
      // Ignore storage failures
    }
  }, [snapToClips]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem("timelinePlaybackRate", String(playbackRate));
    } catch {
      // Ignore storage failures
    }
  }, [playbackRate]);

  useEffect(() => {
    if (!state.isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    lastTimeRef.current = performance.now();
    let currentPlayhead = state.playhead;
    const duration = state.project.duration;

    const animate = (time: number) => {
      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;
      
      currentPlayhead += delta * playbackRate;
      
      if (currentPlayhead >= duration) {
        currentPlayhead = 0;
      }
      if (currentPlayhead <= 0 && playbackRate < 0) {
        currentPlayhead = 0;
        setIsPlaying(false);
        setPlaybackRate(0);
        return;
      }
      
      setPlayhead(currentPlayhead, false);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state.isPlaying, state.project.duration, setPlayhead, snapEnabled, playbackRate, setIsPlaying]);

  const handleAddClipToTrack = useCallback((trackId: string, startTime: number) => {
    const track = state.tracks.find((t) => t.id === trackId);
    if (!track) return;
    
    const clipType: ClipType = track.type === "audio" ? "audio" : 
                               track.type === "visualizer" ? "visualizer" : "video";
    addClip(trackId, clipType, startTime, 5, `${track.type} clip`);
  }, [state.tracks, addClip]);

  const handleAddMediaToTimeline = useCallback((type: ClipType, name: string, visualizationType?: string, mediaUrl?: string) => {
    addClipWithAutoTrack(type, state.playhead, 5, name, {
      visualizationType: visualizationType as VisualizationType,
      mediaUrl,
    });
  }, [state.playhead, addClipWithAutoTrack]);

  const handleAddPresetToTimeline = useCallback((type: ClipType, name: string, visualizationType: string, duration: number, clipSettings?: Record<string, unknown>) => {
    addClipWithAutoTrack(type, state.playhead, duration, name, {
      visualizationType: visualizationType as VisualizationType,
      ...clipSettings,
    });
  }, [state.playhead, addClipWithAutoTrack]);

  const handleDropMedia = useCallback((trackId: string, data: { 
    type: ClipType; 
    name: string; 
    visualizationType?: string; 
    mediaUrl?: string;
    duration?: number;
    clipSettings?: { filters?: { brightness?: number; contrast?: number; saturation?: number; blur?: number }; speed?: number; fadeOut?: number };
  }, startTime: number) => {
    const track = state.tracks.find((t) => t.id === trackId);
    if (!track || track.locked) return;
    
    // Validate clip type matches track type
    const isCompatible = (
      (track.type === "video" && (data.type === "video" || data.type === "image")) ||
      (track.type === "audio" && data.type === "audio") ||
      (track.type === "visualizer" && data.type === "visualizer")
    );
    
    if (!isCompatible) {
      // Auto-create correct track instead of rejecting
      addClipWithAutoTrack(data.type, startTime, data.duration || 5, data.name, {
        visualizationType: data.visualizationType as VisualizationType,
        mediaUrl: data.mediaUrl,
        ...data.clipSettings,
      });
      return;
    }
    
    const clipDuration = data.duration || 5;
    addClip(trackId, data.type, startTime, clipDuration, data.name, {
      visualizationType: data.visualizationType as VisualizationType,
      mediaUrl: data.mediaUrl,
      ...data.clipSettings,
    });
  }, [state.tracks, addClip, addClipWithAutoTrack]);

  const handleDropEffectOnClip = useCallback((clipId: string, effectData: unknown) => {
    const data = effectData as { 
      type?: ClipType; 
      name: string; 
      visualizationType?: string;
      clipSettings?: Record<string, unknown>;
    };
    
    if (!data.name || !data.visualizationType) return;
    
    addEffectToClip(clipId, {
      type: "visualizer",
      name: data.name,
      enabled: true,
      visualizationType: data.visualizationType as VisualizationType,
      colorScheme: "neon",
      startOffset: 0,
      duration: 0, // 0 means full clip duration
      settings: data.clipSettings,
    });
  }, [addEffectToClip]);

  const handleClipDragStart = useCallback((clipId: string) => {
    const selected = state.selectedClipIds?.length ? state.selectedClipIds : [clipId];
    const normalized = selected.includes(clipId) ? selected : [clipId];
    const base = new Map<string, number>();
    normalized.forEach((id) => {
      const clip = state.clips.find((c) => c.id === id);
      if (clip) {
        base.set(id, clip.startTime);
      }
    });
    dragGroupRef.current = base;
  }, [state.clips, state.selectedClipIds]);

  const handleClipDragEnd = useCallback(() => {
    dragGroupRef.current = null;
  }, []);

  const handleGroupMoveClip = useCallback((clipId: string, newStartTime: number, deltaTime: number) => {
    const base = dragGroupRef.current;
    if (!base || base.size <= 1 || !base.has(clipId)) {
      moveClip(clipId, newStartTime);
      return;
    }

    const selectedSet = new Set(base.keys());
    const rootIds = Array.from(selectedSet).filter((id) => {
      const clip = state.clips.find((c) => c.id === id);
      return !(clip?.linkedClipId && selectedSet.has(clip.linkedClipId));
    });

    rootIds.forEach((id) => {
      const baseStart = base.get(id) ?? 0;
      moveClip(id, Math.max(0, baseStart + deltaTime));
    });
  }, [moveClip, state.clips]);

  const toggleSoloTrack = useCallback((trackId: string) => {
    setSoloTrackIds((prev) => {
      if (prev.includes(trackId)) {
        return prev.filter((id) => id !== trackId);
      }
      return [...prev, trackId];
    });
  }, []);

  const selectedClip = state.clips.find((c) => c.id === state.selectedClipId);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        redo();
        return;
      }
      
      switch (e.key) {
        case "Delete":
        case "Backspace":
          if (state.selectedClipId) {
            deleteSelectedClip();
          }
          break;
        case "j":
        case "J":
          e.preventDefault();
          setIsPlaying(true);
          setPlaybackRate((prev) => (prev < 0 ? Math.max(prev * 2, -8) : -2));
          break;
        case "k":
        case "K":
          e.preventDefault();
          setIsPlaying(false);
          setPlaybackRate(0);
          break;
        case "l":
        case "L":
          e.preventDefault();
          setIsPlaying(true);
          setPlaybackRate((prev) => (prev > 0 ? Math.min(prev * 2, 8) : 2));
          break;
        case "s":
        case "S":
          e.preventDefault();
          setSnapEnabled((prev) => !prev);
          break;
        case "ArrowLeft": {
          e.preventDefault();
          const step = e.shiftKey ? 1 : 1 / state.project.fps;
          setPlayhead(state.playhead - step, false);
          break;
        }
        case "ArrowRight": {
          e.preventDefault();
          const step = e.shiftKey ? 1 : 1 / state.project.fps;
          setPlayhead(state.playhead + step, false);
          break;
        }
        case " ":
          e.preventDefault();
          if (state.isPlaying) {
            setIsPlaying(false);
            setPlaybackRate(0);
          } else {
            setIsPlaying(true);
            setPlaybackRate(1);
          }
          break;
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    state.selectedClipId,
    state.isPlaying,
    state.project.fps,
    state.playhead,
    deleteSelectedClip,
    setIsPlaying,
    setPlayhead,
    undo,
    redo,
  ]);

  const pxPerSecond = 50 * state.zoom;
  const totalWidth = state.project.duration * pxPerSecond;

  const setZoomAroundCursor = useCallback(
    (nextZoom: number) => {
      const clamped = Math.max(0.1, Math.min(10, nextZoom));
      const timelineEl = timelineRef.current;
      if (!timelineEl) {
        setZoom(clamped);
        return;
      }
      const cursorX =
        timelineMouseRef.current !== null
          ? timelineMouseRef.current
          : timelineEl.clientWidth / 2;
      const prevScroll = timelineEl.scrollLeft;
      const prevZoom = state.zoom;
      const cursorTimelineX = cursorX + prevScroll;
      const scale = clamped / prevZoom;
      const nextScroll = cursorTimelineX * scale - cursorX;
      setZoom(clamped);
      requestAnimationFrame(() => {
        if (!timelineRef.current) return;
        timelineRef.current.scrollLeft = Math.max(0, nextScroll);
        setTimelineScrollLeft(timelineRef.current.scrollLeft);
      });
    },
    [setZoom, state.zoom]
  );

  const fitTimelineToClips = useCallback(() => {
    const timelineEl = timelineRef.current;
    const clips = state.clips;
    if (!timelineEl || clips.length === 0) {
      setZoomAroundCursor(1);
      return;
    }
    let minStart = Infinity;
    let maxEnd = 0;
    clips.forEach((clip) => {
      minStart = Math.min(minStart, clip.startTime);
      maxEnd = Math.max(maxEnd, clip.startTime + clip.duration);
    });
    if (!Number.isFinite(minStart) || maxEnd <= minStart) {
      setZoomAroundCursor(1);
      return;
    }
    const paddingSeconds = 2;
    const span = Math.max(1, maxEnd - minStart + paddingSeconds);
    const available = timelineEl.clientWidth || 1;
    const targetZoom = available / (50 * span);
    const clamped = Math.max(0.1, Math.min(10, targetZoom));
    setZoom(clamped);
    requestAnimationFrame(() => {
      if (!timelineRef.current) return;
      const pxPerSecond = 50 * clamped;
      const targetScroll = Math.max(0, (minStart - 1) * pxPerSecond);
      timelineRef.current.scrollLeft = targetScroll;
      setTimelineScrollLeft(targetScroll);
    });
  }, [setZoom, setZoomAroundCursor, state.clips]);

  const seekTimeline = useCallback(
    (time: number, snap = snapEnabled) => {
      if (snap && bpm && bpm > 0) {
        const beat = 60 / bpm;
        const snapped = Math.round(time / beat) * beat;
        setPlayhead(snapped, false);
        return;
      }
      setPlayhead(time, snap);
    },
    [bpm, setPlayhead, snapEnabled]
  );

  return (
    <div className="min-h-svh flex flex-col bg-background">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-3 sm:px-4 py-2 border-b bg-card flex-shrink-0">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2" data-testid="button-back-home">
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={undo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              data-testid="button-undo"
            >
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={redo}
              disabled={!canRedo}
              title="Redo (Ctrl+Shift+Z)"
              data-testid="button-redo"
            >
              <Redo2 className="w-4 h-4" />
            </Button>
          </div>
          <h1 className="text-sm sm:text-lg font-semibold truncate max-w-[12rem] sm:max-w-none">
            {state.project.name}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
              size="icon"
              variant={layoutMode === "preview" ? "default" : "ghost"}
              onClick={() => setLayoutMode("preview")}
              title="Full Preview"
              data-testid="button-layout-preview"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant={layoutMode === "split" ? "default" : "ghost"}
              onClick={() => setLayoutMode("split")}
              title="Split View"
              data-testid="button-layout-split"
            >
              <Rows className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant={layoutMode === "timeline" ? "default" : "ghost"}
              onClick={() => setLayoutMode("timeline")}
              title="Full Timeline"
              data-testid="button-layout-timeline"
            >
              <PanelBottom className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 sm:hidden">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowLibrary(true)}
              data-testid="button-open-library"
            >
              Library
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowInspector(true)}
              disabled={!selectedClip}
              data-testid="button-open-inspector"
            >
              Inspector
            </Button>
          </div>
          <div className="hidden lg:flex items-center gap-2">
            <Button
              size="sm"
              variant={showGrid ? "default" : "outline"}
              onClick={() => setShowGrid((prev) => !prev)}
              data-testid="button-toggle-grid"
            >
              Grid
            </Button>
            <Button
              size="sm"
              variant={showSafeArea ? "default" : "outline"}
              onClick={() => setShowSafeArea((prev) => !prev)}
              data-testid="button-toggle-safe-area"
            >
              Safe
            </Button>
            <div className="flex items-center gap-1">
              {(["16:9", "9:16", "1:1", "4:5"] as const).map((ratio) => (
                <Button
                  key={ratio}
                  size="sm"
                  variant={previewAspectRatio === ratio ? "default" : "outline"}
                  onClick={() => setPreviewAspectRatio(ratio)}
                  data-testid={`button-preview-ratio-${ratio}`}
                >
                  {ratio}
                </Button>
              ))}
            </div>
          </div>
          <span className="text-[10px] sm:text-sm text-muted-foreground">
            {state.project.resolution.width}x{state.project.resolution.height} @ {state.project.fps}fps
          </span>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {layoutMode !== "preview" && (
          <aside className="hidden sm:flex w-64 border-r bg-card flex-shrink-0 flex-col overflow-hidden">
            <MediaLibrary 
              onAddToTimeline={handleAddMediaToTimeline}
              onAddPresetToTimeline={handleAddPresetToTimeline}
              mediaFiles={state.mediaFiles}
              onUploadMedia={addMediaFile}
              onRemoveMedia={removeMediaFile}
            />
          </aside>
        )}

        <main className="flex-1 flex flex-col overflow-hidden min-h-0">
          {layoutMode !== "timeline" && (
            <div className={`p-4 flex-shrink-0 ${layoutMode === "preview" ? "flex-1 flex items-center justify-center" : ""}`}>
              <div className={layoutMode === "preview" ? "w-full max-w-5xl" : ""}>
                <PreviewPanel 
                  playhead={state.playhead}
                  isPlaying={state.isPlaying}
                  duration={state.project.duration}
                  clips={state.clips}
                  tracks={state.tracks}
                  soloTrackIds={soloTrackIds}
                  aspectRatio={previewAspectRatio}
                  showSafeArea={showSafeArea}
                  showGrid={showGrid}
                />
              </div>
            </div>
          )}

          <div className="flex-shrink-0 px-3 sm:px-4">
            <TransportControls
              isPlaying={state.isPlaying}
              playhead={state.playhead}
              duration={state.project.duration}
              snapEnabled={snapEnabled}
              onPlay={() => {
                setIsPlaying(true);
                setPlaybackRate(1);
              }}
              onPause={() => {
                setIsPlaying(false);
                setPlaybackRate(0);
              }}
              onSeek={(time, snap) => seekTimeline(time, snap)}
              onSkipBack={() => seekTimeline(Math.max(0, state.playhead - 5), snapEnabled)}
              onSkipForward={() => seekTimeline(Math.min(state.project.duration, state.playhead + 5), snapEnabled)}
            />
          </div>

          {layoutMode !== "preview" && (
            <div className="flex-1 flex flex-col border-t overflow-hidden min-h-0">
              <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2 bg-muted/30 border-b flex-shrink-0">
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline" className="gap-1" data-testid="button-add-track">
                        <Plus className="w-4 h-4" />
                        Add Track
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => addTrack("video")}>
                        <Film className="w-4 h-4 mr-2" />
                        Video Track
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addTrack("audio")}>
                        <Music className="w-4 h-4 mr-2" />
                        Audio Track
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => addTrack("visualizer")}>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Visualizer Track
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant={snapEnabled ? "default" : "outline"}
                    onClick={() => setSnapEnabled((prev) => !prev)}
                    title="Toggle snapping (hold Alt to bypass)"
                    data-testid="button-snap-toggle"
                  >
                    Snap
                  </Button>
                  <Button
                    size="sm"
                    variant={snapToClips ? "default" : "outline"}
                    onClick={() => setSnapToClips((prev) => !prev)}
                    title="Snap to clip edges"
                    data-testid="button-snap-clips-toggle"
                  >
                    Clip Snap
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={fitTimelineToClips}
                    title="Fit timeline to clips"
                    data-testid="button-fit-timeline"
                  >
                    Fit
                  </Button>
                  <div className="hidden md:flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">Magnet</span>
                    <Slider
                      value={[magnetStrengthPx]}
                      onValueChange={([v]) => setMagnetStrengthPx(v)}
                      min={2}
                      max={20}
                      step={1}
                      className="w-24"
                      data-testid="slider-magnet"
                    />
                  </div>
                  <div className="hidden md:flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">BPM</span>
                    <input
                      type="number"
                      min={1}
                      max={400}
                      value={bpm ?? ""}
                      onChange={(e) => {
                        const value = e.target.value.trim();
                        setBpm(value === "" ? null : Number(value));
                      }}
                      className="h-7 w-16 rounded border bg-background px-2 text-xs"
                      placeholder="—"
                      data-testid="input-bpm"
                    />
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setZoomAroundCursor(state.zoom / 1.5)}
                    disabled={state.zoom <= 0.1}
                    data-testid="button-zoom-out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-xs w-12 text-center">{Math.round(state.zoom * 100)}%</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setZoomAroundCursor(state.zoom * 1.5)}
                    disabled={state.zoom >= 10}
                    data-testid="button-zoom-in"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 flex overflow-hidden min-h-0">
                <div 
                  className="hidden sm:block w-48 flex-shrink-0 border-r overflow-y-auto"
                  onScroll={(e) => {
                    if (timelineRef.current) {
                      timelineRef.current.scrollTop = e.currentTarget.scrollTop;
                    }
                  }}
                  ref={(el) => {
                    if (el && timelineRef.current) {
                      el.scrollTop = timelineRef.current.scrollTop;
                    }
                  }}
                >
                  <div className="h-6 border-b" />
                  {state.tracks.map((track) => (
                    <TrackHeader
                      key={track.id}
                      track={track}
                      trackCount={state.tracks.length}
                      onMute={() => toggleTrackMute(track.id)}
                      onLock={() => toggleTrackLock(track.id)}
                      onDelete={() => removeTrack(track.id)}
                      onSolo={() => toggleSoloTrack(track.id)}
                      onReorder={(draggedTrackId, newOrder) => reorderTrack(draggedTrackId, newOrder)}
                      isHighlighted={hoveredTrackId === track.id}
                      onHoverStart={() => setHoveredTrackId(track.id)}
                      onHoverEnd={() => setHoveredTrackId((prev) => (prev === track.id ? null : prev))}
                      isSolo={soloTrackIds.includes(track.id)}
                    />
                  ))}
                </div>

              <div 
                ref={timelineRef}
                className="flex-1 overflow-auto"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  timelineMouseRef.current = e.clientX - rect.left;
                }}
                onMouseLeave={() => {
                  timelineMouseRef.current = null;
                }}
                onScroll={(e) => {
                  setTimelineScrollLeft(e.currentTarget.scrollLeft);
                  const trackHeadersDiv = e.currentTarget.previousElementSibling as HTMLElement;
                  if (trackHeadersDiv) {
                    trackHeadersDiv.scrollTop = e.currentTarget.scrollTop;
                  }
                }}
              >
                <div style={{ width: totalWidth, minWidth: "100%" }}>
                  <TimelineRuler
                    duration={state.project.duration}
                    zoom={state.zoom}
                    playhead={state.playhead}
                    fps={state.project.fps}
                    snapEnabled={snapEnabled}
                    onSeek={(time, snap) => seekTimeline(time, snap)}
                    onScrubStart={() => {
                      wasPlayingRef.current = state.isPlaying;
                      if (state.isPlaying) {
                        setIsPlaying(false);
                        setPlaybackRate(0);
                      }
                    }}
                    onScrubEnd={() => {
                      if (wasPlayingRef.current) {
                        setIsPlaying(true);
                        setPlaybackRate(1);
                      }
                    }}
                  />
                  {state.tracks.map((track) => (
                    <TrackLane
                      key={track.id}
                      track={track}
                      clips={getClipsForTrack(track.id)}
                      zoom={state.zoom}
                      fps={state.project.fps}
                      snapEnabled={snapEnabled}
                      snapToClips={snapToClips}
                      allClips={state.clips}
                      projectDuration={state.project.duration}
                      bpm={bpm}
                      magnetStrengthPx={magnetStrengthPx}
                      onSeek={(time, snap) => seekTimeline(time, snap)}
                      onScrubStart={() => {
                        wasPlayingRef.current = state.isPlaying;
                        if (state.isPlaying) {
                          setIsPlaying(false);
                          setPlaybackRate(0);
                        }
                      }}
                      onScrubEnd={() => {
                        if (wasPlayingRef.current) {
                          setIsPlaying(true);
                          setPlaybackRate(1);
                        }
                      }}
                      showTrackLabel={true}
                      playhead={state.playhead}
                      selectedClipIds={state.selectedClipIds}
                      onSelectClip={selectClip}
                      onMoveClip={(id, newStart, deltaTime) => handleGroupMoveClip(id, newStart, deltaTime)}
                      onClipDragStart={handleClipDragStart}
                      onClipDragEnd={handleClipDragEnd}
                      onResizeClip={resizeClip}
                      onAddClip={(startTime) => handleAddClipToTrack(track.id, startTime)}
                      onDropMedia={(data, startTime) => handleDropMedia(track.id, data, startTime)}
                      onDropEffectOnClip={handleDropEffectOnClip}
                      onToggleEffect={toggleEffectEnabled}
                      onRemoveEffect={removeEffectFromClip}
                      scrollLeft={timelineScrollLeft}
                      isHighlighted={hoveredTrackId === track.id}
                      onHoverStart={() => setHoveredTrackId(track.id)}
                      onHoverEnd={() => setHoveredTrackId((prev) => (prev === track.id ? null : prev))}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          )}
        </main>

        {selectedClip && layoutMode !== "preview" && (
          <aside className="hidden sm:block w-72 border-l bg-card overflow-y-auto flex-shrink-0">
            <ClipPropertiesPanel
              clip={selectedClip}
              clips={state.clips}
              onUpdate={(updates) => {
                const hasLinkedClip = selectedClip.linkedClipId;
                const hasClipsLinkedToThis = state.clips.some(c => c.linkedClipId === selectedClip.id);
                if (updates.speed !== undefined && (hasLinkedClip || hasClipsLinkedToThis)) {
                  updateClipWithLinked(selectedClip.id, updates);
                } else {
                  updateClip(selectedClip.id, updates);
                }
              }}
              onSplit={() => splitClip(selectedClip.id, state.playhead)}
              onDelete={deleteSelectedClip}
              playhead={state.playhead}
              onToggleEffect={toggleEffectEnabled}
              onRemoveEffect={removeEffectFromClip}
              onLinkClip={linkClips}
              onUnlinkClip={unlinkClip}
            />
          </aside>
        )}
      </div>
      {showLibrary && layoutMode !== "preview" && (
        <div className="fixed inset-0 z-50 bg-black/50 sm:hidden">
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] rounded-t-lg bg-card shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <span className="text-sm font-semibold">Media Library</span>
              <Button size="icon" variant="ghost" onClick={() => setShowLibrary(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="overflow-y-auto">
              <MediaLibrary
                onAddToTimeline={handleAddMediaToTimeline}
                onAddPresetToTimeline={handleAddPresetToTimeline}
                mediaFiles={state.mediaFiles}
                onUploadMedia={addMediaFile}
                onRemoveMedia={removeMediaFile}
              />
            </div>
          </div>
        </div>
      )}
      {showInspector && selectedClip && layoutMode !== "preview" && (
        <div className="fixed inset-0 z-50 bg-black/50 sm:hidden">
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] rounded-t-lg bg-card shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <span className="text-sm font-semibold">Inspector</span>
              <Button size="icon" variant="ghost" onClick={() => setShowInspector(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="overflow-y-auto">
              <ClipPropertiesPanel
                clip={selectedClip}
                clips={state.clips}
                onUpdate={(updates) => {
                  const hasLinkedClip = selectedClip.linkedClipId;
                  const hasClipsLinkedToThis = state.clips.some(c => c.linkedClipId === selectedClip.id);
                  if (updates.speed !== undefined && (hasLinkedClip || hasClipsLinkedToThis)) {
                    updateClipWithLinked(selectedClip.id, updates);
                  } else {
                    updateClip(selectedClip.id, updates);
                  }
                }}
                onSplit={() => splitClip(selectedClip.id, state.playhead)}
                onDelete={deleteSelectedClip}
                playhead={state.playhead}
                onToggleEffect={toggleEffectEnabled}
                onRemoveEffect={removeEffectFromClip}
                onLinkClip={linkClips}
                onUnlinkClip={unlinkClip}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
