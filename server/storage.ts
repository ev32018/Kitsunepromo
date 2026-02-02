import { db } from "./db";
import {
  visualizationProjects,
  visualizationPresets,
  type InsertVisualizationProject,
  type VisualizationProject,
  type InsertPreset,
  type Preset,
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

function generateShareCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export interface IStorage {
  getProjects(): Promise<VisualizationProject[]>;
  getProject(id: number): Promise<VisualizationProject | undefined>;
  createProject(project: InsertVisualizationProject): Promise<VisualizationProject>;
  updateProject(id: number, project: Partial<InsertVisualizationProject>): Promise<VisualizationProject | undefined>;
  deleteProject(id: number): Promise<void>;
  getPresets(): Promise<Preset[]>;
  getPreset(id: number): Promise<Preset | undefined>;
  getPresetByShareCode(code: string): Promise<Preset | undefined>;
  createPreset(preset: InsertPreset): Promise<Preset>;
  deletePreset(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  private ensureDb() {
    if (!db) {
      throw new Error("Database is not configured");
    }
    return db;
  }

  async getProjects(): Promise<VisualizationProject[]> {
    const database = this.ensureDb();
    return database.select().from(visualizationProjects).orderBy(desc(visualizationProjects.createdAt));
  }

  async getProject(id: number): Promise<VisualizationProject | undefined> {
    const database = this.ensureDb();
    const [project] = await database
      .select()
      .from(visualizationProjects)
      .where(eq(visualizationProjects.id, id));
    return project;
  }

  async createProject(project: InsertVisualizationProject): Promise<VisualizationProject> {
    const database = this.ensureDb();
    const [created] = await database.insert(visualizationProjects).values(project).returning();
    return created;
  }

  async updateProject(id: number, project: Partial<InsertVisualizationProject>): Promise<VisualizationProject | undefined> {
    const database = this.ensureDb();
    const [updated] = await database
      .update(visualizationProjects)
      .set({ ...project, updatedAt: new Date() })
      .where(eq(visualizationProjects.id, id))
      .returning();
    return updated;
  }

  async deleteProject(id: number): Promise<void> {
    const database = this.ensureDb();
    await database.delete(visualizationProjects).where(eq(visualizationProjects.id, id));
  }

  async getPresets(): Promise<Preset[]> {
    const database = this.ensureDb();
    return database.select().from(visualizationPresets).orderBy(desc(visualizationPresets.createdAt));
  }

  async getPreset(id: number): Promise<Preset | undefined> {
    const database = this.ensureDb();
    const [preset] = await database
      .select()
      .from(visualizationPresets)
      .where(eq(visualizationPresets.id, id));
    return preset;
  }

  async getPresetByShareCode(code: string): Promise<Preset | undefined> {
    const database = this.ensureDb();
    const [preset] = await database
      .select()
      .from(visualizationPresets)
      .where(eq(visualizationPresets.shareCode, code));
    return preset;
  }

  async createPreset(preset: InsertPreset): Promise<Preset> {
    const shareCode = generateShareCode();
    const database = this.ensureDb();
    const [created] = await database
      .insert(visualizationPresets)
      .values({ ...preset, shareCode })
      .returning();
    return created;
  }

  async deletePreset(id: number): Promise<void> {
    const database = this.ensureDb();
    await database.delete(visualizationPresets).where(eq(visualizationPresets.id, id));
  }
}

export class MemoryStorage implements IStorage {
  private projects: VisualizationProject[] = [];
  private presets: Preset[] = [];
  private projectId = 1;
  private presetId = 1;

  async getProjects(): Promise<VisualizationProject[]> {
    return [...this.projects].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  async getProject(id: number): Promise<VisualizationProject | undefined> {
    return this.projects.find((project) => project.id === id);
  }

  async createProject(project: InsertVisualizationProject): Promise<VisualizationProject> {
    const now = new Date();
    const created: VisualizationProject = {
      id: this.projectId++,
      name: project.name,
      audioFileName: project.audioFileName ?? null,
      audioUrl: project.audioUrl ?? null,
      visualizationType: project.visualizationType ?? "bars",
      colorScheme: project.colorScheme ?? "neon",
      aiBackgroundPrompt: project.aiBackgroundPrompt ?? null,
      aiBackgroundUrl: project.aiBackgroundUrl ?? null,
      settings: project.settings ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.projects.unshift(created);
    return created;
  }

  async updateProject(
    id: number,
    project: Partial<InsertVisualizationProject>,
  ): Promise<VisualizationProject | undefined> {
    const existing = await this.getProject(id);
    if (!existing) {
      return undefined;
    }
    const updated: VisualizationProject = {
      ...existing,
      ...project,
      updatedAt: new Date(),
    };
    const index = this.projects.findIndex((item) => item.id === id);
    if (index >= 0) {
      this.projects[index] = updated;
    }
    return updated;
  }

  async deleteProject(id: number): Promise<void> {
    this.projects = this.projects.filter((project) => project.id !== id);
  }

  async getPresets(): Promise<Preset[]> {
    return [...this.presets].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  async getPreset(id: number): Promise<Preset | undefined> {
    return this.presets.find((preset) => preset.id === id);
  }

  async getPresetByShareCode(code: string): Promise<Preset | undefined> {
    return this.presets.find((preset) => preset.shareCode === code);
  }

  async createPreset(preset: InsertPreset): Promise<Preset> {
    const now = new Date();
    const created: Preset = {
      id: this.presetId++,
      name: preset.name,
      visualizationType: preset.visualizationType,
      colorScheme: preset.colorScheme,
      customColors: preset.customColors ?? null,
      settings: preset.settings ?? null,
      overlayText: preset.overlayText ?? null,
      overlayPosition: preset.overlayPosition ?? null,
      shareCode: generateShareCode(),
      createdAt: now,
    };
    this.presets.unshift(created);
    return created;
  }

  async deletePreset(id: number): Promise<void> {
    this.presets = this.presets.filter((preset) => preset.id !== id);
  }
}

export const storage = db ? new DatabaseStorage() : new MemoryStorage();
