import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const visualizationProjects = pgTable("visualization_projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  audioFileName: text("audio_file_name"),
  audioUrl: text("audio_url"),
  visualizationType: text("visualization_type").notNull().default("bars"),
  colorScheme: text("color_scheme").notNull().default("neon"),
  aiBackgroundPrompt: text("ai_background_prompt"),
  aiBackgroundUrl: text("ai_background_url"),
  settings: jsonb("settings").$type<VisualizationSettings>(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export interface VisualizationSettings {
  sensitivity: number;
  smoothing: number;
  barCount: number;
  particleCount: number;
  glowIntensity: number;
  rotationSpeed: number;
  colorIntensity: number;
  mirrorMode: boolean;
  // Pro features
  motionBlur?: boolean;
  motionBlurIntensity?: number;
  audioDucking?: boolean;
  audioDuckingThreshold?: number;
  bloomEnabled?: boolean;
  bloomIntensity?: number;
  peakHold?: boolean;
  peakHoldDecay?: number;
  // Custom frequency bands
  bassStart?: number;
  bassEnd?: number;
  midStart?: number;
  midEnd?: number;
  trebleStart?: number;
  trebleEnd?: number;
}

export interface VisualizationPreset {
  id: string;
  name: string;
  visualizationType: VisualizationType;
  colorScheme: ColorScheme;
  customColors?: string[];
  settings: VisualizationSettings;
  overlayText?: string;
  overlayPosition?:
    | "top-left"
    | "top-center"
    | "top-right"
    | "center-left"
    | "center"
    | "center-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right";
}

export const visualizationPresets = pgTable("visualization_presets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  visualizationType: text("visualization_type").notNull(),
  colorScheme: text("color_scheme").notNull(),
  customColors: text("custom_colors").array(),
  settings: jsonb("settings").$type<VisualizationSettings>(),
  overlayText: text("overlay_text"),
  overlayPosition: text("overlay_position"),
  shareCode: varchar("share_code", { length: 12 }).unique(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertPresetSchema = createInsertSchema(visualizationPresets).omit({
  id: true,
  createdAt: true,
});

export type InsertPreset = z.infer<typeof insertPresetSchema>;
export type Preset = typeof visualizationPresets.$inferSelect;

export const insertVisualizationProjectSchema = createInsertSchema(visualizationProjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertVisualizationProject = z.infer<typeof insertVisualizationProjectSchema>;
export type VisualizationProject = typeof visualizationProjects.$inferSelect;

export const visualizationTypes = [
  "bars",
  "waveform", 
  "circular",
  "particles",
  "fluid",
  "spectrum3d",
  "radialBurst",
  "mountainRange",
  "spectrumAnalyzer",
  "equalizer",
  "audioBars",
  "perlinFluid",
  "audioBlob",
  "kaleidoscope",
  "endlessMaze"
] as const;

export type VisualizationType = typeof visualizationTypes[number];

export const colorSchemes = [
  "neon",
  "sunset",
  "ocean",
  "galaxy",
  "fire",
  "matrix",
  "pastel",
  "monochrome"
] as const;

export type ColorScheme = typeof colorSchemes[number];

// Timeline Editor Types
export type TrackType = "video" | "audio" | "visualizer";
export type ClipType = "video" | "audio" | "visualizer" | "image";
export type MediaFileType = "video" | "audio" | "image";

export interface MediaFile {
  id: string;
  name: string;
  type: MediaFileType;
  url: string;
  duration?: number;
  thumbnail?: string;
  sizeBytes?: number;
  addedAt?: number;
}

export interface TimelineProject {
  id: string;
  name: string;
  duration: number;
  fps: number;
  resolution: { width: number; height: number };
}

export interface TimelineTrack {
  id: string;
  name: string;
  type: TrackType;
  muted: boolean;
  locked: boolean;
  height: number;
  order: number;
}

export interface TimelineClip {
  id: string;
  trackId: string;
  type: ClipType;
  name: string;
  startTime: number;
  duration: number;
  sourceId?: string;
  trimIn: number;
  trimOut: number;
  color: string;
  mediaUrl?: string;
  visualizerSettings?: VisualizationSettings;
  colorScheme?: ColorScheme;
  visualizationType?: VisualizationType;
  linkedClipId?: string; // For linking audio extracted from video
  // Editing properties
  volume?: number; // 0-100
  fadeIn?: number; // duration in seconds
  fadeOut?: number; // duration in seconds
  opacity?: number; // 0-100
  speed?: number; // playback speed multiplier
  filters?: ClipFilters;
  // Attached effects (visualizers, overlays)
  effects?: ClipEffect[];
}

export interface ClipFilters {
  brightness?: number; // -100 to 100
  contrast?: number; // -100 to 100
  saturation?: number; // -100 to 100
  blur?: number; // 0-20
  grayscale?: boolean;
  sepia?: boolean;
  invert?: boolean;
}

// Effect instance attached to a clip
export interface ClipEffect {
  id: string;
  type: "visualizer" | "overlay" | "filter";
  name: string;
  enabled: boolean;
  // For visualizer effects
  visualizationType?: VisualizationType;
  colorScheme?: ColorScheme;
  visualizerSettings?: VisualizationSettings;
  // For overlay/filter effects
  settings?: Record<string, unknown>;
  // Timing relative to clip
  startOffset: number; // offset from clip start
  duration: number; // duration of effect (0 = full clip)
}

export interface TimelineState {
  project: TimelineProject;
  tracks: TimelineTrack[];
  clips: TimelineClip[];
  mediaFiles: MediaFile[];
  playhead: number;
  zoom: number;
  isPlaying: boolean;
  selectedClipId: string | null;
  selectedClipIds: string[];
  selectedTrackId: string | null;
}
