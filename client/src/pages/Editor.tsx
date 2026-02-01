import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { useTimelineState } from "@/hooks/use-timeline-state";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
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
  Power
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
}: { 
  playhead: number; 
  isPlaying: boolean;
  duration: number;
  clips: TimelineClip[];
  tracks: TimelineTrack[];
}) {
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
  const activeClipIds = useRef<Set<string>>(new Set());
  const wasPlayingRef = useRef(false);
  
  const activeClips = clips.filter(
    (clip) => playhead >= clip.startTime && playhead < clip.startTime + clip.duration
  );
  
  const isTrackMuted = useCallback((trackId: string) => {
    const track = tracks.find(t => t.id === trackId);
    return track?.muted || false;
  }, [tracks]);

  // Handle play/pause state changes
  useEffect(() => {
    const justStartedPlaying = isPlaying && !wasPlayingRef.current;
    const justPaused = !isPlaying && wasPlayingRef.current;
    wasPlayingRef.current = isPlaying;

    activeClips.forEach((clip) => {
      const clipTime = playhead - clip.startTime;
      const speed = clip.speed || 1;
      const trimOffset = clip.trimIn || 0;
      const targetTime = (clipTime * speed) + trimOffset;
      
      // Handle video clips
      if (clip.mediaUrl && clip.type === "video") {
        const videoEl = videoRefs.current.get(clip.id);
        if (videoEl) {
          // Only sync when starting playback or when paused
          if (justStartedPlaying || !isPlaying) {
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
        
        // Only sync when starting playback or when paused
        if (justStartedPlaying || !isPlaying) {
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

  const renderClipPreview = (clip: TimelineClip) => {
    const opacity = clip.opacity !== undefined ? clip.opacity / 100 : 1;
    const brightness = clip.filters?.brightness !== undefined ? 100 + clip.filters.brightness : 100;
    const contrast = clip.filters?.contrast !== undefined ? 100 + clip.filters.contrast : 100;
    const saturation = clip.filters?.saturation !== undefined ? 100 + clip.filters.saturation : 100;
    const blur = clip.filters?.blur !== undefined ? clip.filters.blur : 0;
    
    const filterStyle = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`;

    if (clip.type === "video" && clip.mediaUrl) {
      // Mute video since audio is handled by the linked audio clip
      return (
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
      );
    }
    
    // Audio clips don't render visually - they only produce sound
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

  return (
    <div className="bg-black rounded-lg aspect-video flex items-center justify-center relative overflow-hidden">
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
  onPlay,
  onPause,
  onSeek,
  onSkipBack,
  onSkipForward,
}: {
  isPlaying: boolean;
  playhead: number;
  duration: number;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
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
  onSeek 
}: { 
  duration: number; 
  zoom: number;
  playhead: number;
  onSeek: (time: number) => void;
}) {
  const pxPerSecond = 50 * zoom;
  const totalWidth = duration * pxPerSecond;
  const rulerRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + rulerRef.current.scrollLeft;
    const time = x / pxPerSecond;
    onSeek(Math.max(0, Math.min(time, duration)));
  };

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
      style={{ width: totalWidth }}
      data-testid="timeline-ruler"
    >
      {markers.map((marker) => (
        <div
          key={marker.time}
          className="absolute top-0 flex flex-col items-center"
          style={{ left: marker.time * pxPerSecond }}
        >
          <div 
            className={`w-px ${marker.major ? "h-4 bg-foreground/50" : "h-2 bg-foreground/30"}`}
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
    </div>
  );
}

function TrackHeader({
  track,
  onMute,
  onLock,
  onDelete,
}: {
  track: TimelineTrack;
  onMute: () => void;
  onLock: () => void;
  onDelete: () => void;
}) {
  const icons: Record<TrackType, typeof Film> = {
    video: Film,
    audio: Music,
    visualizer: Sparkles,
  };
  const Icon = icons[track.type];

  return (
    <div 
      className="flex items-center gap-2 px-2 py-1 bg-card border-b"
      style={{ height: track.height }}
      data-testid={`track-header-${track.id}`}
    >
      <Icon className="w-4 h-4 text-muted-foreground" />
      <span className="text-sm flex-1 truncate">{track.name}</span>
      <Button
        size="icon"
        variant="ghost"
        className="w-6 h-6"
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
        className="w-6 h-6"
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
        className="w-6 h-6"
        onClick={onDelete}
        data-testid={`button-delete-track-${track.id}`}
      >
        <Trash2 className="w-3 h-3" />
      </Button>
    </div>
  );
}

function ClipComponent({
  clip,
  zoom,
  isSelected,
  isLocked,
  onSelect,
  onMove,
  onResize,
}: {
  clip: TimelineClip;
  zoom: number;
  isSelected: boolean;
  isLocked: boolean;
  onSelect: () => void;
  onMove: (deltaTime: number) => void;
  onResize: (newDuration: number, trimStart: boolean) => void;
}) {
  const pxPerSecond = 50 * zoom;
  const width = clip.duration * pxPerSecond;
  const left = clip.startTime * pxPerSecond;
  const [isDragging, setIsDragging] = useState(false);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);
  const dragStartRef = useRef({ x: 0, startTime: 0, duration: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
    if (isLocked) return;
    setIsDragging(true);
    dragStartRef.current = { 
      x: e.clientX, 
      startTime: clip.startTime,
      duration: clip.duration 
    };
  };

  const handleResizeLeftDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
    if (isLocked) return;
    setIsResizingLeft(true);
    dragStartRef.current = { 
      x: e.clientX, 
      startTime: clip.startTime,
      duration: clip.duration 
    };
  };

  const handleResizeRightDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
    if (isLocked) return;
    setIsResizingRight(true);
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

      if (isDragging) {
        onMove(deltaTime);
      } else if (isResizingLeft) {
        const newDuration = dragStartRef.current.duration - deltaTime;
        onResize(newDuration, true);
      } else if (isResizingRight) {
        const newDuration = dragStartRef.current.duration + deltaTime;
        onResize(newDuration, false);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizingLeft(false);
      setIsResizingRight(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizingLeft, isResizingRight, pxPerSecond, onMove, onResize]);

  const effectCount = clip.effects?.length || 0;

  return (
    <div
      className={`absolute top-1 bottom-1 rounded cursor-move select-none z-10 ${
        isSelected ? "ring-2 ring-primary z-20" : ""
      }`}
      style={{
        left,
        width: Math.max(width, 20),
        backgroundColor: clip.color,
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      data-testid={`clip-${clip.id}`}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/30"
        onMouseDown={handleResizeLeftDown}
      />
      <div className="px-2 py-1 text-xs text-white truncate pointer-events-none flex items-center gap-1">
        <span>{clip.name}</span>
        {effectCount > 0 && (
          <span className="bg-primary/30 text-white text-[9px] px-1 rounded">
            {effectCount} fx
          </span>
        )}
      </div>
      <div
        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/30"
        onMouseDown={handleResizeRightDown}
      />
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
  playhead,
  selectedClipId,
  onSelectClip,
  onMoveClip,
  onResizeClip,
  onAddClip,
  onDropMedia,
  onDropEffectOnClip,
  onToggleEffect,
  onRemoveEffect,
  scrollLeft = 0,
}: {
  track: TimelineTrack;
  clips: TimelineClip[];
  zoom: number;
  playhead: number;
  selectedClipId: string | null;
  onSelectClip: (id: string) => void;
  onMoveClip: (id: string, deltaTime: number) => void;
  onResizeClip: (id: string, newDuration: number, trimStart: boolean) => void;
  onAddClip: (startTime: number) => void;
  onDropMedia: (data: { type: ClipType; name: string; visualizationType?: string; mediaUrl?: string; duration?: number; clipSettings?: Record<string, unknown> }, startTime: number) => void;
  onDropEffectOnClip: (clipId: string, effectData: unknown) => void;
  onToggleEffect: (clipId: string, effectId: string) => void;
  onRemoveEffect: (clipId: string, effectId: string) => void;
  scrollLeft?: number;
}) {
  const pxPerSecond = 50 * zoom;
  const laneRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Find selected clip in this track
  const selectedClip = clips.find((c) => c.id === selectedClipId);
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

  return (
    <div
      ref={laneRef}
      className={`relative border-b ${track.locked ? "opacity-50" : ""} ${isDragOver ? "bg-primary/10" : ""}`}
      style={{ height: totalHeight }}
      onDoubleClick={handleDoubleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-testid={`track-lane-${track.id}`}
    >
      {/* Main track area */}
      <div className="relative" style={{ height: track.height }}>
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
          style={{ left: playhead * pxPerSecond }}
        />
        {clips.map((clip) => (
          <ClipComponent
            key={clip.id}
            clip={clip}
            zoom={zoom}
            isSelected={clip.id === selectedClipId}
            isLocked={track.locked}
            onSelect={() => onSelectClip(clip.id)}
            onMove={(delta) => onMoveClip(clip.id, delta)}
            onResize={(dur, trimStart) => onResizeClip(clip.id, dur, trimStart)}
          />
        ))}
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
  onUploadMedia: (file: File, type: MediaFileType) => void;
  onRemoveMedia: (id: string) => void;
}) {
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: MediaFileType) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => onUploadMedia(file, type));
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
          <div className="space-y-1 max-h-[150px] overflow-y-auto">
            {mediaFiles.map((media) => {
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
                  }}
                  onDoubleClick={() => onAddToTimeline(clipType, media.name, undefined, media.url)}
                  data-testid={`media-file-${media.id}`}
                >
                  {media.type === "image" && media.url ? (
                    <img src={media.url} alt={media.name} className="w-8 h-8 object-cover rounded" />
                  ) : (
                    <Icon className={`w-4 h-4 ${getMediaColor(media.type)}`} />
                  )}
                  <span className="text-sm truncate flex-1">{media.name}</span>
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
        </div>
      </div>
    </div>
  );
}

function ClipPropertiesPanel({
  clip,
  onUpdate,
  onSplit,
  onDelete,
  playhead,
  onToggleEffect,
  onRemoveEffect,
}: {
  clip: TimelineClip;
  onUpdate: (updates: Partial<TimelineClip>) => void;
  onSplit: () => void;
  onDelete: () => void;
  playhead: number;
  onToggleEffect?: (clipId: string, effectId: string) => void;
  onRemoveEffect?: (clipId: string, effectId: string) => void;
}) {
  const canSplit = playhead > clip.startTime && playhead < clip.startTime + clip.duration;
  const effects = clip.effects || [];

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
  } = useTimelineState();

  const [layoutMode, setLayoutMode] = useState<LayoutMode>("split");
  const [timelineScrollLeft, setTimelineScrollLeft] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

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
      
      currentPlayhead += delta;
      
      if (currentPlayhead >= duration) {
        currentPlayhead = 0;
      }
      
      setPlayhead(currentPlayhead);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state.isPlaying, state.project.duration, setPlayhead]);

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
        case " ":
          e.preventDefault();
          setIsPlaying(!state.isPlaying);
          break;
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.selectedClipId, state.isPlaying, deleteSelectedClip, setIsPlaying, undo, redo]);

  const pxPerSecond = 50 * state.zoom;
  const totalWidth = state.project.duration * pxPerSecond;

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="flex items-center justify-between px-4 py-2 border-b bg-card flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2" data-testid="button-back-home">
              <ChevronLeft className="w-4 h-4" />
              Back to Studio
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
          <h1 className="text-lg font-semibold">{state.project.name}</h1>
        </div>
        <div className="flex items-center gap-4">
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
          <span className="text-sm text-muted-foreground">
            {state.project.resolution.width}x{state.project.resolution.height} @ {state.project.fps}fps
          </span>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {layoutMode !== "preview" && (
          <aside className="w-64 border-r bg-card flex-shrink-0 flex flex-col overflow-hidden">
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
                />
              </div>
            </div>
          )}

          <div className="flex-shrink-0 px-4">
            <TransportControls
              isPlaying={state.isPlaying}
              playhead={state.playhead}
              duration={state.project.duration}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onSeek={setPlayhead}
              onSkipBack={() => setPlayhead(Math.max(0, state.playhead - 5))}
              onSkipForward={() => setPlayhead(Math.min(state.project.duration, state.playhead + 5))}
            />
          </div>

          {layoutMode !== "preview" && (
            <div className="flex-1 flex flex-col border-t overflow-hidden min-h-0">
              <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b flex-shrink-0">
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
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setZoom(state.zoom / 1.5)}
                    disabled={state.zoom <= 0.1}
                    data-testid="button-zoom-out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-xs w-12 text-center">{Math.round(state.zoom * 100)}%</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setZoom(state.zoom * 1.5)}
                    disabled={state.zoom >= 10}
                    data-testid="button-zoom-in"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 flex overflow-hidden min-h-0">
                <div className="w-48 flex-shrink-0 border-r overflow-y-auto">
                  <div className="h-6 border-b" />
                  {state.tracks.map((track) => (
                    <TrackHeader
                      key={track.id}
                      track={track}
                      onMute={() => toggleTrackMute(track.id)}
                      onLock={() => toggleTrackLock(track.id)}
                      onDelete={() => removeTrack(track.id)}
                    />
                  ))}
                </div>

              <div 
                ref={timelineRef}
                className="flex-1 overflow-auto"
                onScroll={(e) => setTimelineScrollLeft(e.currentTarget.scrollLeft)}
              >
                <div style={{ width: totalWidth, minWidth: "100%" }}>
                  <TimelineRuler
                    duration={state.project.duration}
                    zoom={state.zoom}
                    playhead={state.playhead}
                    onSeek={setPlayhead}
                  />
                  {state.tracks.map((track) => (
                    <TrackLane
                      key={track.id}
                      track={track}
                      clips={getClipsForTrack(track.id)}
                      zoom={state.zoom}
                      playhead={state.playhead}
                      selectedClipId={state.selectedClipId}
                      onSelectClip={selectClip}
                      onMoveClip={(id, delta) => {
                        const clip = state.clips.find((c) => c.id === id);
                        if (clip) moveClip(id, clip.startTime + delta);
                      }}
                      onResizeClip={resizeClip}
                      onAddClip={(startTime) => handleAddClipToTrack(track.id, startTime)}
                      onDropMedia={(data, startTime) => handleDropMedia(track.id, data, startTime)}
                      onDropEffectOnClip={handleDropEffectOnClip}
                      onToggleEffect={toggleEffectEnabled}
                      onRemoveEffect={removeEffectFromClip}
                      scrollLeft={timelineScrollLeft}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          )}
        </main>

        {selectedClip && layoutMode !== "preview" && (
          <aside className="w-72 border-l bg-card overflow-y-auto flex-shrink-0">
            <ClipPropertiesPanel
              clip={selectedClip}
              onUpdate={(updates) => updateClip(selectedClip.id, updates)}
              onSplit={() => splitClip(selectedClip.id, state.playhead)}
              onDelete={deleteSelectedClip}
              playhead={state.playhead}
              onToggleEffect={toggleEffectEnabled}
              onRemoveEffect={removeEffectFromClip}
            />
          </aside>
        )}
      </div>
    </div>
  );
}
