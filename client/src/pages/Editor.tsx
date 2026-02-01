import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { useTimelineState } from "@/hooks/use-timeline-state";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
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
  ZoomIn,
  ZoomOut,
  Music,
  Film,
  Sparkles,
  Image,
  Upload
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TimelineTrack, TimelineClip, TrackType, ClipType, VisualizationType } from "@shared/schema";
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
}: { 
  playhead: number; 
  isPlaying: boolean;
  duration: number;
  clips: TimelineClip[];
}) {
  const activeClips = clips.filter(
    (clip) => playhead >= clip.startTime && playhead < clip.startTime + clip.duration
  );

  return (
    <div className="bg-black rounded-lg aspect-video flex items-center justify-center relative overflow-hidden">
      {activeClips.length > 0 ? (
        <div className="absolute inset-0 flex items-center justify-center">
          {activeClips.map((clip) => (
            <div 
              key={clip.id} 
              className="absolute inset-0 flex items-center justify-center"
              style={{ backgroundColor: clip.color + "20" }}
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{clip.name}</div>
                <div className="text-sm text-gray-400">{clip.type}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-muted-foreground text-center">
          <Film className="w-16 h-16 mx-auto mb-2 opacity-50" />
          <p>No clip at playhead</p>
        </div>
      )}
      <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white font-mono">
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

  return (
    <div
      className={`absolute top-1 bottom-1 rounded cursor-move select-none ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      style={{
        left,
        width: Math.max(width, 20),
        backgroundColor: clip.color,
      }}
      onMouseDown={handleMouseDown}
      data-testid={`clip-${clip.id}`}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/30"
        onMouseDown={handleResizeLeftDown}
      />
      <div className="px-2 py-1 text-xs text-white truncate pointer-events-none">
        {clip.name}
      </div>
      <div
        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/30"
        onMouseDown={handleResizeRightDown}
      />
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
}) {
  const pxPerSecond = 50 * zoom;
  const laneRef = useRef<HTMLDivElement>(null);

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (track.locked) return;
    if (!laneRef.current) return;
    const rect = laneRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = x / pxPerSecond;
    onAddClip(Math.max(0, time));
  };

  return (
    <div
      ref={laneRef}
      className={`relative border-b ${track.locked ? "opacity-50" : ""}`}
      style={{ height: track.height }}
      onDoubleClick={handleDoubleClick}
      data-testid={`track-lane-${track.id}`}
    >
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
  );
}

function MediaLibrary({
  onAddToTimeline,
}: {
  onAddToTimeline: (type: ClipType, name: string, visualizationType?: string) => void;
}) {
  const visualizerPresets = visualizationTypes.map((vt) => ({
    type: "visualizer" as ClipType,
    name: vt.split(/(?=[A-Z])/).join(" ").replace(/^./, s => s.toUpperCase()),
    visualizationType: vt,
    icon: Sparkles,
  }));

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold mb-3">Visualizer Presets</h3>
      <div className="space-y-1 max-h-[400px] overflow-y-auto">
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
      <div className="mt-4 border-t pt-4">
        <h3 className="text-sm font-semibold mb-3">Audio</h3>
        <div
          className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer"
          onDoubleClick={() => onAddToTimeline("audio", "Audio Track")}
          data-testid="media-audio-track"
        >
          <Music className="w-4 h-4 text-green-500" />
          <span className="text-sm">Add Audio Track</span>
        </div>
      </div>
    </div>
  );
}

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
    selectClip,
    setPlayhead,
    setZoom,
    setIsPlaying,
    getClipsForTrack,
  } = useTimelineState();

  const timelineRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!state.isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    lastTimeRef.current = performance.now();

    const animate = (time: number) => {
      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;
      
      setPlayhead(state.playhead + delta);
      
      if (state.playhead >= state.project.duration) {
        setPlayhead(0);
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state.isPlaying, state.playhead, state.project.duration, setPlayhead]);

  const handleAddClipToTrack = useCallback((trackId: string, startTime: number) => {
    const track = state.tracks.find((t) => t.id === trackId);
    if (!track) return;
    
    const clipType: ClipType = track.type === "audio" ? "audio" : 
                               track.type === "visualizer" ? "visualizer" : "video";
    addClip(trackId, clipType, startTime, 5, `${track.type} clip`);
  }, [state.tracks, addClip]);

  const handleAddMediaToTimeline = useCallback((type: ClipType, name: string, visualizationType?: string) => {
    const trackType: TrackType = type === "audio" ? "audio" : 
                                  type === "visualizer" ? "visualizer" : "video";
    let track = state.tracks.find((t) => t.type === trackType);
    
    if (!track) {
      addTrack(trackType);
      track = state.tracks.find((t) => t.type === trackType);
    }
    
    if (track) {
      addClip(track.id, type, state.playhead, 5, name, {
        visualizationType: visualizationType as VisualizationType,
      });
    }
  }, [state.tracks, state.playhead, addTrack, addClip]);

  const pxPerSecond = 50 * state.zoom;
  const totalWidth = state.project.duration * pxPerSecond;

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="flex items-center justify-between px-4 py-2 border-b bg-card">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2" data-testid="button-back-home">
              <ChevronLeft className="w-4 h-4" />
              Back to Studio
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">{state.project.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {state.project.resolution.width}x{state.project.resolution.height} @ {state.project.fps}fps
          </span>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-64 border-r bg-card overflow-y-auto">
          <MediaLibrary onAddToTimeline={handleAddMediaToTimeline} />
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 flex-shrink-0">
            <PreviewPanel 
              playhead={state.playhead}
              isPlaying={state.isPlaying}
              duration={state.project.duration}
              clips={state.clips}
            />
          </div>

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

          <div className="flex-1 flex flex-col border-t overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b">
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

            <div className="flex-1 flex overflow-hidden">
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
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
