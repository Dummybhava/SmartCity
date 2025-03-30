import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { setupWebSocketServer } from "./websocket";
import { insertEventSchema, insertAttractionSchema, insertFeedbackSchema, insertTransportationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Create HTTP server
  const httpServer = createServer(app);

  // Set up WebSocket server
  setupWebSocketServer(httpServer);

  // Events API
  app.get("/api/events", async (req, res, next) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/events/:id", async (req, res, next) => {
    try {
      const event = await storage.getEvent(parseInt(req.params.id));
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/events", async (req, res, next) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const validatedData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(validatedData);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      next(error);
    }
  });

  // Attractions API
  app.get("/api/attractions", async (req, res, next) => {
    try {
      const attractions = await storage.getAttractions();
      res.json(attractions);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/attractions/:id", async (req, res, next) => {
    try {
      const attraction = await storage.getAttraction(parseInt(req.params.id));
      if (!attraction) {
        return res.status(404).json({ message: "Attraction not found" });
      }
      res.json(attraction);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/attractions", async (req, res, next) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const validatedData = insertAttractionSchema.parse(req.body);
      const attraction = await storage.createAttraction(validatedData);
      res.status(201).json(attraction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid attraction data", errors: error.errors });
      }
      next(error);
    }
  });

  // Feedback API
  app.get("/api/feedback", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const feedback = req.user.role === "admin" 
        ? await storage.getAllFeedback()
        : await storage.getUserFeedback(req.user.id);
      res.json(feedback);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/feedback", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const validatedData = insertFeedbackSchema.parse({
        ...req.body,
        userId: req.user.id,
      });
      
      const feedback = await storage.createFeedback(validatedData);
      res.status(201).json(feedback);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid feedback data", errors: error.errors });
      }
      next(error);
    }
  });

  // Transportation API
  app.get("/api/transportation", async (req, res, next) => {
    try {
      const transportation = await storage.getTransportation();
      res.json(transportation);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/transportation/:id", async (req, res, next) => {
    try {
      const transport = await storage.getTransportationById(parseInt(req.params.id));
      if (!transport) {
        return res.status(404).json({ message: "Transportation not found" });
      }
      res.json(transport);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/transportation", async (req, res, next) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const validatedData = insertTransportationSchema.parse(req.body);
      const transportation = await storage.createTransportation(validatedData);
      res.status(201).json(transportation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transportation data", errors: error.errors });
      }
      next(error);
    }
  });

  // Notifications API
  app.get("/api/notifications", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const notifications = await storage.getUserNotifications(req.user.id);
      res.json(notifications);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/notifications/:id/read", async (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const notification = await storage.getNotification(parseInt(req.params.id));
      
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      if (notification.userId !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const updatedNotification = await storage.markNotificationAsRead(notification.id);
      res.json(updatedNotification);
    } catch (error) {
      next(error);
    }
  });

  return httpServer;
}
