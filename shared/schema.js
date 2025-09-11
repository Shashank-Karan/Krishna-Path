import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
export const verses = pgTable("verses", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    emotion: text("emotion").notNull(),
    sanskrit: text("sanskrit").notNull(),
    hindi: text("hindi").notNull(),
    english: text("english").notNull(),
    explanation: text("explanation").notNull(),
    chapter: text("chapter").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
export const admins = pgTable("admins", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    username: text("username").notNull().unique(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: text("role").default("admin").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    lastLoginAt: timestamp("last_login_at"),
});
export const verseInteractions = pgTable("verse_interactions", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    verseId: varchar("verse_id").notNull(),
    emotion: text("emotion").notNull(),
    action: text("action").notNull(), // viewed, shared, liked
    sessionId: text("session_id"),
    userAgent: text("user_agent"),
    ipAddress: text("ip_address"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
export const emotions = pgTable("emotions", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    name: text("name").notNull().unique(),
    displayName: text("display_name").notNull(),
    description: text("description").notNull(),
    color: text("color").notNull(),
    icon: text("icon").notNull(),
    emoji: text("emoji").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
export const emotionStats = pgTable("emotion_stats", {
    id: varchar("id").primaryKey().default(sql `gen_random_uuid()`),
    emotion: text("emotion").notNull(),
    date: timestamp("date").notNull(),
    viewCount: integer("view_count").default(0).notNull(),
    shareCount: integer("share_count").default(0).notNull(),
    totalInteractions: integer("total_interactions").default(0).notNull(),
});
export const insertVerseSchema = createInsertSchema(verses).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertAdminSchema = createInsertSchema(admins).omit({
    id: true,
    createdAt: true,
    lastLoginAt: true,
});
export const insertVerseInteractionSchema = createInsertSchema(verseInteractions).omit({
    id: true,
    createdAt: true,
});
export const insertEmotionSchema = createInsertSchema(emotions).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
});
export const insertEmotionStatsSchema = createInsertSchema(emotionStats).omit({
    id: true,
});
