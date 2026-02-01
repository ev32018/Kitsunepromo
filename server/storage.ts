import { db } from "./db";
import { visualizationProjects, visualizationPresets, type InsertVisualizationProject, type VisualizationProject, type InsertPreset, type Preset } from "@shared/schema";
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
  async getProjects(): Promise<VisualizationProject[]> {
    return db.select().from(visualizationProjects).orderBy(desc(visualizationProjects.createdAt));
  }

  async getProject(id: number): Promise<VisualizationProject | undefined> {
    const [project] = await db.select().from(visualizationProjects).where(eq(visualizationProjects.id, id));
    return project;
  }

  async createProject(project: InsertVisualizationProject): Promise<VisualizationProject> {
    const [created] = await db.insert(visualizationProjects).values(project).returning();
    return created;
  }

  async updateProject(id: number, project: Partial<InsertVisualizationProject>): Promise<VisualizationProject | undefined> {
    const [updated] = await db
      .update(visualizationProjects)
      .set({ ...project, updatedAt: new Date() })
      .where(eq(visualizationProjects.id, id))
      .returning();
    return updated;
  }

  async deleteProject(id: number): Promise<void> {
    await db.delete(visualizationProjects).where(eq(visualizationProjects.id, id));
  }

  async getPresets(): Promise<Preset[]> {
    return db.select().from(visualizationPresets).orderBy(desc(visualizationPresets.createdAt));
  }

  async getPreset(id: number): Promise<Preset | undefined> {
    const [preset] = await db.select().from(visualizationPresets).where(eq(visualizationPresets.id, id));
    return preset;
  }

  async getPresetByShareCode(code: string): Promise<Preset | undefined> {
    const [preset] = await db.select().from(visualizationPresets).where(eq(visualizationPresets.shareCode, code));
    return preset;
  }

  async createPreset(preset: InsertPreset): Promise<Preset> {
    const shareCode = generateShareCode();
    const [created] = await db.insert(visualizationPresets).values({ ...preset, shareCode }).returning();
    return created;
  }

  async deletePreset(id: number): Promise<void> {
    await db.delete(visualizationPresets).where(eq(visualizationPresets.id, id));
  }
}

export const storage = new DatabaseStorage();
