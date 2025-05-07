import { pgTable, text, serial, integer, boolean, timestamp, real, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  organization: text("organization").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  firstName: true,
  lastName: true,
  organization: true,
});

// Machine model
export const machines = pgTable("machines", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  hostname: text("hostname").notNull(),
  ipAddress: text("ip_address").notNull(),
  operatingSystem: text("operating_system").notNull(),
  lastBackupTime: timestamp("last_backup_time"),
  status: text("status").notNull().default("unknown"), // unknown, online, offline, warning, error
  totalBackups: integer("total_backups").default(0),
  totalBackupSize: real("total_backup_size").default(0), // in bytes
  successRate: real("success_rate").default(0), // percentage
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMachineSchema = createInsertSchema(machines).pick({
  name: true,
  hostname: true,
  ipAddress: true,
  operatingSystem: true,
  lastBackupTime: true,
  status: true,
});

// Backup model
export const backups = pgTable("backups", {
  id: serial("id").primaryKey(),
  machineId: integer("machine_id").notNull(),
  name: text("name").notNull(),
  status: text("status").notNull(), // success, warning, error
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // in seconds
  size: real("size").default(0), // in bytes
  source: text("source"),
  destination: text("destination"),
  version: text("version"),
  logs: text("logs"),
  errorMessage: text("error_message"),
});

export const insertBackupSchema = createInsertSchema(backups).pick({
  machineId: true,
  name: true,
  status: true,
  startTime: true,
  endTime: true,
  duration: true,
  size: true,
  source: true,
  destination: true,
  version: true,
  logs: true,
  errorMessage: true,
});

// Alert model
export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  machineId: integer("machine_id"),
  type: text("type").notNull(), // error, warning, info
  title: text("title").notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAlertSchema = createInsertSchema(alerts).pick({
  machineId: true,
  type: true,
  title: true,
  message: true,
  read: true,
});

// Settings model
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  notificationEmail: text("notification_email").notNull(),
  emailPreferences: json("email_preferences").notNull().default({}),
  alertThresholds: json("alert_thresholds").notNull().default({}),
});

export const insertSettingsSchema = createInsertSchema(settings).pick({
  userId: true,
  notificationEmail: true,
  emailPreferences: true,
  alertThresholds: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Machine = typeof machines.$inferSelect;
export type InsertMachine = z.infer<typeof insertMachineSchema>;

export type Backup = typeof backups.$inferSelect;
export type InsertBackup = z.infer<typeof insertBackupSchema>;

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;

// Stats schema for dashboard
export const statsSchema = z.object({
  totalMachines: z.number(),
  totalBackups: z.number(),
  totalData: z.number(), // in bytes
  successRate: z.number(), // percentage
});

export type Stats = z.infer<typeof statsSchema>;
