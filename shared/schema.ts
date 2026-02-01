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
}

export interface VisualizationPreset {
  id: string;
  name: string;
  visualizationType: VisualizationType;
  colorScheme: ColorScheme;
  customColors?: string[];
  settings: VisualizationSettings;
  overlayText?: string;
  overlayPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
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
  "audioBars"
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
