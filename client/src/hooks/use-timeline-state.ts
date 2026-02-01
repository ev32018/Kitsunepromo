import { useState, useCallback } from "react";
import type { 
  TimelineState, 
  TimelineProject, 
  TimelineTrack, 
  TimelineClip,
  TrackType,
  ClipType 
} from "@shared/schema";

const generateId = () => Math.random().toString(36).substring(2, 11);

const defaultProject: TimelineProject = {
  id: generateId(),
  name: "Untitled Project",
  duration: 60,
  fps: 30,
  resolution: { width: 1920, height: 1080 },
};

const defaultTracks: TimelineTrack[] = [
  { id: "v1", name: "Video 1", type: "video", muted: false, locked: false, height: 60, order: 0 },
  { id: "a1", name: "Audio 1", type: "audio", muted: false, locked: false, height: 40, order: 1 },
];

const initialState: TimelineState = {
  project: defaultProject,
  tracks: defaultTracks,
  clips: [],
  playhead: 0,
  zoom: 1,
  isPlaying: false,
  selectedClipId: null,
  selectedTrackId: null,
};

const trackColors: Record<TrackType, string> = {
  video: "#3b82f6",
  audio: "#22c55e",
  visualizer: "#a855f7",
};

export function useTimelineState() {
  const [state, setState] = useState<TimelineState>(initialState);

  const addTrack = useCallback((type: TrackType, name?: string) => {
    setState((prev) => {
      const trackCount = prev.tracks.filter((t) => t.type === type).length + 1;
      const newTrack: TimelineTrack = {
        id: generateId(),
        name: name || `${type.charAt(0).toUpperCase() + type.slice(1)} ${trackCount}`,
        type,
        muted: false,
        locked: false,
        height: type === "audio" ? 40 : 60,
        order: prev.tracks.length,
      };
      return { ...prev, tracks: [...prev.tracks, newTrack] };
    });
  }, []);

  const removeTrack = useCallback((trackId: string) => {
    setState((prev) => ({
      ...prev,
      tracks: prev.tracks.filter((t) => t.id !== trackId),
      clips: prev.clips.filter((c) => c.trackId !== trackId),
    }));
  }, []);

  const toggleTrackMute = useCallback((trackId: string) => {
    setState((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) =>
        t.id === trackId ? { ...t, muted: !t.muted } : t
      ),
    }));
  }, []);

  const toggleTrackLock = useCallback((trackId: string) => {
    setState((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) =>
        t.id === trackId ? { ...t, locked: !t.locked } : t
      ),
    }));
  }, []);

  const addClip = useCallback((
    trackId: string,
    type: ClipType,
    startTime: number,
    duration: number,
    name?: string,
    options?: Partial<TimelineClip>
  ) => {
    setState((prev) => {
      const track = prev.tracks.find((t) => t.id === trackId);
      if (!track) return prev;

      const newClip: TimelineClip = {
        id: generateId(),
        trackId,
        type,
        name: name || `${type} clip`,
        startTime,
        duration,
        trimIn: 0,
        trimOut: 0,
        color: trackColors[track.type] || "#6b7280",
        ...options,
      };

      const newDuration = Math.max(prev.project.duration, startTime + duration + 10);
      
      return {
        ...prev,
        clips: [...prev.clips, newClip],
        project: { ...prev.project, duration: newDuration },
      };
    });
  }, []);

  const removeClip = useCallback((clipId: string) => {
    setState((prev) => ({
      ...prev,
      clips: prev.clips.filter((c) => c.id !== clipId),
      selectedClipId: prev.selectedClipId === clipId ? null : prev.selectedClipId,
    }));
  }, []);

  const moveClip = useCallback((clipId: string, newStartTime: number, newTrackId?: string) => {
    setState((prev) => ({
      ...prev,
      clips: prev.clips.map((c) =>
        c.id === clipId
          ? { ...c, startTime: Math.max(0, newStartTime), trackId: newTrackId || c.trackId }
          : c
      ),
    }));
  }, []);

  const resizeClip = useCallback((clipId: string, newDuration: number, trimStart?: boolean) => {
    setState((prev) => ({
      ...prev,
      clips: prev.clips.map((c) => {
        if (c.id !== clipId) return c;
        if (trimStart) {
          const delta = c.duration - newDuration;
          return {
            ...c,
            startTime: c.startTime + delta,
            duration: Math.max(0.5, newDuration),
            trimIn: c.trimIn + delta,
          };
        }
        return { ...c, duration: Math.max(0.5, newDuration) };
      }),
    }));
  }, []);

  const selectClip = useCallback((clipId: string | null) => {
    setState((prev) => ({ ...prev, selectedClipId: clipId }));
  }, []);

  const selectTrack = useCallback((trackId: string | null) => {
    setState((prev) => ({ ...prev, selectedTrackId: trackId }));
  }, []);

  const setPlayhead = useCallback((time: number) => {
    setState((prev) => ({
      ...prev,
      playhead: Math.max(0, Math.min(time, prev.project.duration)),
    }));
  }, []);

  const setZoom = useCallback((zoom: number) => {
    setState((prev) => ({
      ...prev,
      zoom: Math.max(0.1, Math.min(10, zoom)),
    }));
  }, []);

  const setIsPlaying = useCallback((isPlaying: boolean) => {
    setState((prev) => ({ ...prev, isPlaying }));
  }, []);

  const setProjectDuration = useCallback((duration: number) => {
    setState((prev) => ({
      ...prev,
      project: { ...prev.project, duration: Math.max(1, duration) },
    }));
  }, []);

  const getClipsAtTime = useCallback((time: number) => {
    return state.clips.filter(
      (clip) => time >= clip.startTime && time < clip.startTime + clip.duration
    );
  }, [state.clips]);

  const getClipsForTrack = useCallback((trackId: string) => {
    return state.clips.filter((clip) => clip.trackId === trackId);
  }, [state.clips]);

  return {
    state,
    addTrack,
    removeTrack,
    toggleTrackMute,
    toggleTrackLock,
    addClip,
    removeClip,
    moveClip,
    resizeClip,
    selectClip,
    selectTrack,
    setPlayhead,
    setZoom,
    setIsPlaying,
    setProjectDuration,
    getClipsAtTime,
    getClipsForTrack,
  };
}
