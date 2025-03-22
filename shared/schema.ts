import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("user"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  role: true,
});

// Feature request schema
export const features = pgTable("features", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  createdById: integer("created_by_id").notNull(),
  impactScore: integer("impact_score").notNull().default(50),
  effortScore: integer("effort_score").notNull().default(50),
  totalScore: integer("total_score").notNull().default(0),
  status: text("status").notNull().default("pending"),
  customerType: text("customer_type").notNull().default("internal"),
  customerCount: integer("customer_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  category: text("category").notNull().default("feature"),
  tags: text("tags").array(),
});

export const insertFeatureSchema = createInsertSchema(features).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Scoring criteria schema
export const scoringCriteria = pgTable("scoring_criteria", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  weight: integer("weight").notNull().default(20),
  order: integer("order").notNull(),
});

export const insertScoringCriteriaSchema = createInsertSchema(scoringCriteria).omit({
  id: true,
});

// Comments schema
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  featureId: integer("feature_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertFeature = z.infer<typeof insertFeatureSchema>;
export type Feature = typeof features.$inferSelect;

export type InsertScoringCriteria = z.infer<typeof insertScoringCriteriaSchema>;
export type ScoringCriteria = typeof scoringCriteria.$inferSelect;

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;
