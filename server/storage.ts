import { db } from "./db";
import { visualizationProjects, type InsertVisualizationProject, type VisualizationProject } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getProjects(): Promise<VisualizationProject[]>;
  getProject(id: number): Promise<VisualizationProject | undefined>;
  createProject(project: InsertVisualizationProject): Promise<VisualizationProject>;
  updateProject(id: number, project: Partial<InsertVisualizationProject>): Promise<VisualizationProject | undefined>;
  deleteProject(id: number): Promise<void>;
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
}

export const storage = new DatabaseStorage();
