import { useState, useCallback } from "react";
import type { 
  TimelineState, 
  TimelineProject, 
  TimelineTrack, 
  TimelineClip,
  TrackType,
  ClipType,
  MediaFile,
  MediaFileType
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
  mediaFiles: [],
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

const MAX_HISTORY = 50;

interface HistoryState {
  history: TimelineState[];
  index: number;
}

export function useTimelineState() {
  const [state, setState] = useState<TimelineState>(initialState);
  const [historyState, setHistoryState] = useState<HistoryState>({
    history: [initialState],
    index: 0,
  });

  const saveToHistory = useCallback((newState: TimelineState) => {
    setHistoryState((prev) => {
      const newHistory = prev.history.slice(0, prev.index + 1);
      newHistory.push(newState);
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
        return { history: newHistory, index: newHistory.length - 1 };
      }
      return { history: newHistory, index: prev.index + 1 };
    });
  }, []);

  const undo = useCallback(() => {
    setHistoryState((prev) => {
      if (prev.index > 0) {
        const newIndex = prev.index - 1;
        setState(prev.history[newIndex]);
        return { ...prev, index: newIndex };
      }
      return prev;
    });
  }, []);

  const redo = useCallback(() => {
    setHistoryState((prev) => {
      if (prev.index < prev.history.length - 1) {
        const newIndex = prev.index + 1;
        setState(prev.history[newIndex]);
        return { ...prev, index: newIndex };
      }
      return prev;
    });
  }, []);

  const canUndo = historyState.index > 0;
  const canRedo = historyState.index < historyState.history.length - 1;

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
      const newState = { ...prev, tracks: [...prev.tracks, newTrack] };
      saveToHistory(newState);
      return newState;
    });
  }, [saveToHistory]);

  const removeTrack = useCallback((trackId: string) => {
    setState((prev) => {
      const newState = {
        ...prev,
        tracks: prev.tracks.filter((t) => t.id !== trackId),
        clips: prev.clips.filter((c) => c.trackId !== trackId),
      };
      saveToHistory(newState);
      return newState;
    });
  }, [saveToHistory]);

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
      if (!track || track.locked) return prev;

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
      
      const newState = {
        ...prev,
        clips: [...prev.clips, newClip],
        project: { ...prev.project, duration: newDuration },
      };
      saveToHistory(newState);
      return newState;
    });
  }, [saveToHistory]);

  const addClipWithAutoTrack = useCallback((
    type: ClipType,
    startTime: number,
    duration: number,
    name?: string,
    options?: Partial<TimelineClip>
  ) => {
    setState((prev) => {
      const trackType: TrackType = type === "audio" ? "audio" : type === "visualizer" ? "visualizer" : "video";
      let track = prev.tracks.find((t) => t.type === trackType);
      let newTracks = prev.tracks;
      
      if (!track) {
        const trackCount = prev.tracks.filter((t) => t.type === trackType).length + 1;
        track = {
          id: generateId(),
          name: `${trackType.charAt(0).toUpperCase() + trackType.slice(1)} ${trackCount}`,
          type: trackType,
          muted: false,
          locked: false,
          height: trackType === "audio" ? 40 : 60,
          order: prev.tracks.length,
        };
        newTracks = [...prev.tracks, track];
      }
      
      if (track.locked) return prev;

      const newClip: TimelineClip = {
        id: generateId(),
        trackId: track.id,
        type,
        name: name || `${type} clip`,
        startTime,
        duration,
        trimIn: 0,
        trimOut: 0,
        color: trackColors[trackType] || "#6b7280",
        ...options,
      };

      const newDuration = Math.max(prev.project.duration, startTime + duration + 10);
      
      const newState = {
        ...prev,
        tracks: newTracks,
        clips: [...prev.clips, newClip],
        project: { ...prev.project, duration: newDuration },
      };
      saveToHistory(newState);
      return newState;
    });
  }, [saveToHistory]);

  const removeClip = useCallback((clipId: string) => {
    setState((prev) => {
      const newState = {
        ...prev,
        clips: prev.clips.filter((c) => c.id !== clipId),
        selectedClipId: prev.selectedClipId === clipId ? null : prev.selectedClipId,
      };
      saveToHistory(newState);
      return newState;
    });
  }, [saveToHistory]);

  const moveClip = useCallback((clipId: string, newStartTime: number, newTrackId?: string) => {
    setState((prev) => {
      const clip = prev.clips.find((c) => c.id === clipId);
      if (!clip) return prev;
      const track = prev.tracks.find((t) => t.id === clip.trackId);
      if (track?.locked) return prev;
      
      const newState = {
        ...prev,
        clips: prev.clips.map((c) =>
          c.id === clipId
            ? { ...c, startTime: Math.max(0, newStartTime), trackId: newTrackId || c.trackId }
            : c
        ),
      };
      saveToHistory(newState);
      return newState;
    });
  }, [saveToHistory]);

  const resizeClip = useCallback((clipId: string, newDuration: number, trimStart?: boolean) => {
    setState((prev) => {
      const clip = prev.clips.find((c) => c.id === clipId);
      if (!clip) return prev;
      const track = prev.tracks.find((t) => t.id === clip.trackId);
      if (track?.locked) return prev;
      
      const newState = {
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
      };
      saveToHistory(newState);
      return newState;
    });
  }, [saveToHistory]);

  const updateClip = useCallback((clipId: string, updates: Partial<TimelineClip>) => {
    setState((prev) => {
      const clip = prev.clips.find((c) => c.id === clipId);
      if (!clip) return prev;
      const track = prev.tracks.find((t) => t.id === clip.trackId);
      if (track?.locked) return prev;
      
      const newState = {
        ...prev,
        clips: prev.clips.map((c) =>
          c.id === clipId ? { ...c, ...updates } : c
        ),
      };
      saveToHistory(newState);
      return newState;
    });
  }, [saveToHistory]);

  const splitClip = useCallback((clipId: string, splitTime: number) => {
    setState((prev) => {
      const clip = prev.clips.find((c) => c.id === clipId);
      if (!clip) return prev;
      const track = prev.tracks.find((t) => t.id === clip.trackId);
      if (track?.locked) return prev;
      
      // splitTime is relative to the project timeline
      const clipEndTime = clip.startTime + clip.duration;
      if (splitTime <= clip.startTime || splitTime >= clipEndTime) return prev;
      
      const relativeTime = splitTime - clip.startTime;
      const firstDuration = relativeTime;
      const secondDuration = clip.duration - relativeTime;
      
      const firstClip: TimelineClip = {
        ...clip,
        duration: firstDuration,
      };
      
      const secondClip: TimelineClip = {
        ...clip,
        id: generateId(),
        startTime: splitTime,
        duration: secondDuration,
        trimIn: clip.trimIn + relativeTime,
        name: `${clip.name} (2)`,
      };
      
      const newState = {
        ...prev,
        clips: prev.clips.map((c) => (c.id === clipId ? firstClip : c)).concat(secondClip),
      };
      saveToHistory(newState);
      return newState;
    });
  }, [saveToHistory]);

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

  const addMediaFile = useCallback((file: File, type: MediaFileType) => {
    const url = URL.createObjectURL(file);
    const mediaFile: MediaFile = {
      id: generateId(),
      name: file.name,
      type,
      url,
    };
    
    setState((prev) => ({
      ...prev,
      mediaFiles: [...prev.mediaFiles, mediaFile],
    }));
    
    return mediaFile;
  }, []);

  const removeMediaFile = useCallback((mediaId: string) => {
    setState((prev) => {
      const mediaFile = prev.mediaFiles.find((m) => m.id === mediaId);
      if (mediaFile) {
        URL.revokeObjectURL(mediaFile.url);
      }
      return {
        ...prev,
        mediaFiles: prev.mediaFiles.filter((m) => m.id !== mediaId),
      };
    });
  }, []);

  const deleteSelectedClip = useCallback(() => {
    setState((prev) => {
      if (!prev.selectedClipId) return prev;
      const newState = {
        ...prev,
        clips: prev.clips.filter((c) => c.id !== prev.selectedClipId),
        selectedClipId: null,
      };
      saveToHistory(newState);
      return newState;
    });
  }, [saveToHistory]);

  const cleanup = useCallback(() => {
    state.mediaFiles.forEach((media) => {
      URL.revokeObjectURL(media.url);
    });
  }, [state.mediaFiles]);

  return {
    state,
    addTrack,
    removeTrack,
    toggleTrackMute,
    toggleTrackLock,
    addClip,
    addClipWithAutoTrack,
    removeClip,
    moveClip,
    resizeClip,
    updateClip,
    splitClip,
    selectClip,
    selectTrack,
    setPlayhead,
    setZoom,
    setIsPlaying,
    setProjectDuration,
    getClipsAtTime,
    getClipsForTrack,
    addMediaFile,
    removeMediaFile,
    deleteSelectedClip,
    undo,
    redo,
    canUndo,
    canRedo,
    cleanup,
  };
}
