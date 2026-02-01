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
  "mountainRange"
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
