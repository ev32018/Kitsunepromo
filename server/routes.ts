import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import { storage } from "./storage";
import { insertVisualizationProjectSchema } from "@shared/schema";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.use(express.json({ limit: "150mb" }));

  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const parsed = insertVisualizationProjectSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid project data", details: parsed.error });
      }
      const project = await storage.createProject(parsed.data);
      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.updateProject(id, req.body);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProject(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  app.post("/api/generate-background", async (req, res) => {
    try {
      const { prompt } = req.body;

      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const enhancedPrompt = `Create an abstract, artistic background suitable for audio visualization. Style: ${prompt}. The image should be visually striking with deep blacks and vibrant colors, perfect for overlaying audio visualizations. No text, no people, purely abstract and atmospheric.`;

      const response = await openai.images.generate({
        model: "gpt-image-1",
        prompt: enhancedPrompt,
        size: "1024x1024",
        n: 1,
      });

      const imageBase64 = response.data[0]?.b64_json;
      if (!imageBase64) {
        throw new Error("No image generated");
      }

      const imageUrl = `data:image/png;base64,${imageBase64}`;

      res.json({ imageUrl });
    } catch (error) {
      console.error("Error generating background:", error);
      res.status(500).json({ error: "Failed to generate background" });
    }
  });

  app.post("/api/upload-audio", async (req, res) => {
    try {
      const { audioData, fileName } = req.body;

      if (!audioData || !fileName) {
        return res.status(400).json({ error: "Audio data and file name are required" });
      }

      res.json({
        success: true,
        message: "Audio uploaded successfully",
        fileName,
      });
    } catch (error) {
      console.error("Error uploading audio:", error);
      res.status(500).json({ error: "Failed to upload audio" });
    }
  });

  return httpServer;
}
