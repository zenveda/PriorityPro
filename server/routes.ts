import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertFeatureSchema, insertCommentSchema, insertScoringCriteriaSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Feature routes
  app.get("/api/features", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const features = await storage.getFeatures();
    res.json(features);
  });

  app.get("/api/features/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const id = parseInt(req.params.id);
    const feature = await storage.getFeature(id);
    
    if (!feature) {
      return res.status(404).json({ message: "Feature not found" });
    }
    
    res.json(feature);
  });

  app.post("/api/features", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertFeatureSchema.parse({
        ...req.body,
        createdById: req.user!.id
      });
      
      const feature = await storage.createFeature(validatedData);
      res.status(201).json(feature);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create feature" });
    }
  });

  app.patch("/api/features/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const id = parseInt(req.params.id);
    try {
      const feature = await storage.getFeature(id);
      if (!feature) {
        return res.status(404).json({ message: "Feature not found" });
      }
      
      const validatedData = insertFeatureSchema.partial().parse(req.body);
      const updatedFeature = await storage.updateFeature(id, validatedData);
      
      res.json(updatedFeature);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to update feature" });
    }
  });

  app.delete("/api/features/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const id = parseInt(req.params.id);
    const success = await storage.deleteFeature(id);
    
    if (!success) {
      return res.status(404).json({ message: "Feature not found" });
    }
    
    res.sendStatus(204);
  });

  // Scoring criteria routes
  app.get("/api/scoring-criteria", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const criteria = await storage.getScoringCriteria();
    res.json(criteria);
  });

  app.post("/api/scoring-criteria", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertScoringCriteriaSchema.parse(req.body);
      const criteria = await storage.createScoringCriteria(validatedData);
      res.status(201).json(criteria);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create scoring criteria" });
    }
  });

  app.patch("/api/scoring-criteria/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const id = parseInt(req.params.id);
    try {
      const validatedData = insertScoringCriteriaSchema.partial().parse(req.body);
      const updatedCriteria = await storage.updateScoringCriteria(id, validatedData);
      
      if (!updatedCriteria) {
        return res.status(404).json({ message: "Scoring criteria not found" });
      }
      
      res.json(updatedCriteria);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to update scoring criteria" });
    }
  });

  // Comments routes
  app.get("/api/features/:featureId/comments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const featureId = parseInt(req.params.featureId);
    const comments = await storage.getCommentsByFeature(featureId);
    res.json(comments);
  });

  app.post("/api/features/:featureId/comments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const featureId = parseInt(req.params.featureId);
    try {
      const validatedData = insertCommentSchema.parse({
        ...req.body,
        featureId,
        userId: req.user!.id
      });
      
      const comment = await storage.createComment(validatedData);
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
