import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { statsSchema, insertMachineSchema, insertBackupSchema, insertAlertSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Middleware to check if user is authenticated
  const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Dashboard stats
  app.get("/api/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve stats" });
    }
  });

  // Machines endpoints
  app.get("/api/machines", isAuthenticated, async (req, res) => {
    try {
      const machines = await storage.getMachines();
      res.json(machines);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve machines" });
    }
  });

  app.get("/api/machines/:id", isAuthenticated, async (req, res) => {
    try {
      const machine = await storage.getMachine(parseInt(req.params.id));
      if (!machine) {
        return res.status(404).json({ message: "Machine not found" });
      }
      res.json(machine);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve machine" });
    }
  });

  app.post("/api/machines", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertMachineSchema.parse(req.body);
      const machine = await storage.createMachine(validatedData);
      res.status(201).json(machine);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create machine" });
    }
  });

  app.patch("/api/machines/:id", isAuthenticated, async (req, res) => {
    try {
      const machineId = parseInt(req.params.id);
      const existingMachine = await storage.getMachine(machineId);
      if (!existingMachine) {
        return res.status(404).json({ message: "Machine not found" });
      }
      
      const updatedMachine = await storage.updateMachine(machineId, req.body);
      res.json(updatedMachine);
    } catch (error) {
      res.status(500).json({ message: "Failed to update machine" });
    }
  });

  app.delete("/api/machines/:id", isAuthenticated, async (req, res) => {
    try {
      const machineId = parseInt(req.params.id);
      const result = await storage.deleteMachine(machineId);
      if (!result) {
        return res.status(404).json({ message: "Machine not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete machine" });
    }
  });

  // Backups endpoints
  app.get("/api/backups", isAuthenticated, async (req, res) => {
    try {
      const backups = await storage.getBackups();
      res.json(backups);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve backups" });
    }
  });

  app.get("/api/backups/recent", isAuthenticated, async (req, res) => {
    try {
      const recentBackups = await storage.getRecentBackups();
      res.json(recentBackups);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve recent backups" });
    }
  });

  app.get("/api/backups/:id", isAuthenticated, async (req, res) => {
    try {
      const backup = await storage.getBackup(parseInt(req.params.id));
      if (!backup) {
        return res.status(404).json({ message: "Backup not found" });
      }
      res.json(backup);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve backup" });
    }
  });

  app.post("/api/backups", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertBackupSchema.parse(req.body);
      const backup = await storage.createBackup(validatedData);
      res.status(201).json(backup);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create backup" });
    }
  });

  // Alerts endpoints
  app.get("/api/alerts", isAuthenticated, async (req, res) => {
    try {
      const alerts = await storage.getAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve alerts" });
    }
  });

  app.get("/api/alerts/recent", isAuthenticated, async (req, res) => {
    try {
      const recentAlerts = await storage.getRecentAlerts();
      res.json(recentAlerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve recent alerts" });
    }
  });

  app.get("/api/alerts/:id", isAuthenticated, async (req, res) => {
    try {
      const alert = await storage.getAlert(parseInt(req.params.id));
      if (!alert) {
        return res.status(404).json({ message: "Alert not found" });
      }
      res.json(alert);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve alert" });
    }
  });

  app.post("/api/alerts", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertAlertSchema.parse(req.body);
      const alert = await storage.createAlert(validatedData);
      res.status(201).json(alert);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create alert" });
    }
  });

  app.patch("/api/alerts/:id/read", isAuthenticated, async (req, res) => {
    try {
      const alertId = parseInt(req.params.id);
      const updated = await storage.markAlertAsRead(alertId);
      if (!updated) {
        return res.status(404).json({ message: "Alert not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update alert" });
    }
  });

  // Settings endpoints
  app.get("/api/settings", isAuthenticated, async (req, res) => {
    try {
      const settings = await storage.getSettings(req.user!.id);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve settings" });
    }
  });

  app.patch("/api/settings", isAuthenticated, async (req, res) => {
    try {
      const updatedSettings = await storage.updateSettings(req.user!.id, req.body);
      res.json(updatedSettings);
    } catch (error) {
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // API endpoint for agents to report backup jobs
  app.post("/api/agent/report", async (req, res) => {
    try {
      // This endpoint would validate an agent token
      const { machineId, connectionKey } = req.body;
      
      // Validate the connection key
      const machine = await storage.validateConnectionKey(machineId, connectionKey);
      if (!machine) {
        return res.status(401).json({ message: "Invalid connection key" });
      }
      
      // Process the backup report
      const backup = await storage.createBackup(req.body.backup);
      
      // Update machine stats
      await storage.updateMachineStats(machineId);
      
      res.status(201).json(backup);
    } catch (error) {
      res.status(500).json({ message: "Failed to process backup report" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
