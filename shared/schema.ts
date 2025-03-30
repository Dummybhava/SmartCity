import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name"),
  role: text("role").default("visitor").notNull(),
  preferences: json("preferences").$type<{
    language: string;
    notifications: {
      events: boolean;
      transportation: boolean;
      feedback: boolean;
      promotional: boolean;
    };
    privacy: {
      locationSharing: boolean;
      dataCollection: boolean;
    };
  }>().default({
    language: "en",
    notifications: {
      events: true,
      transportation: true,
      feedback: true,
      promotional: false,
    },
    privacy: {
      locationSharing: true,
      dataCollection: true,
    },
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  role: true,
  preferences: true,
});

// Event schema
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Attraction schema
export const attractions = pgTable("attractions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // Food & Beverage, Retailer, etc.
  location: text("location").notNull(),
  coordinates: json("coordinates").$type<{
    latitude: number;
    longitude: number;
  }>(),
  imageUrl: text("image_url"),
  contactInfo: text("contact_info"),
  openingHours: text("opening_hours"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAttractionSchema = createInsertSchema(attractions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Transportation schema
export const transportation = pgTable("transportation", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // PRT, Courtesy Car, Shuttle, Bus
  name: text("name").notNull(),
  route: text("route"),
  currentLocation: json("current_location").$type<{
    latitude: number;
    longitude: number;
  }>(),
  status: text("status").default("active"),
  capacity: integer("capacity"),
  nextStop: text("next_stop"),
  estimatedArrival: timestamp("estimated_arrival"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTransportationSchema = createInsertSchema(transportation).omit({
  id: true,
  updatedAt: true,
});

// Feedback schema
export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").default("pending").notNull(),
  response: text("response"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Notification schema
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false).notNull(),
  type: text("type").notNull(), // event, transportation, feedback, promotional
  relatedId: integer("related_id"), // ID of related entity (event, transportation, etc.)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type Attraction = typeof attractions.$inferSelect;
export type InsertAttraction = z.infer<typeof insertAttractionSchema>;

export type Transportation = typeof transportation.$inferSelect;
export type InsertTransportation = z.infer<typeof insertTransportationSchema>;

export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
