import { sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
  boolean,
  decimal,
  date,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("player"), // Custom field for golf platform
  tokenBalance: varchar("token_balance").default("0"), // Custom field
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Golf Genius Integration Tables

// Golf Genius Seasons
export const golfGeniusSeasons = pgTable("golf_genius_seasons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  golfGeniusId: varchar("golf_genius_id").notNull().unique(),
  name: varchar("name").notNull(),
  isCurrent: boolean("is_current").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Golf Genius Categories
export const golfGeniusCategories = pgTable("golf_genius_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  golfGeniusId: varchar("golf_genius_id").notNull().unique(),
  name: varchar("name").notNull(),
  color: varchar("color"), // hexadecimal color
  eventCount: integer("event_count").default(0),
  isArchived: boolean("is_archived").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Golf Genius Players (Master Roster)
export const golfGeniusPlayers = pgTable("golf_genius_players", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  golfGeniusId: varchar("golf_genius_id").notNull().unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  email: varchar("email"),
  handicapIndex: decimal("handicap_index", { precision: 5, scale: 2 }),
  customFields: jsonb("custom_fields"), // Store any custom fields from Golf Genius
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Golf Genius Courses
export const golfGeniusCourses = pgTable("golf_genius_courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  golfGeniusId: varchar("golf_genius_id").notNull().unique(),
  name: varchar("name").notNull(),
  abbreviation: varchar("abbreviation"),
  teeTimeInterval: integer("tee_time_interval"), // in minutes
  paceOfPlaySettings: jsonb("pace_of_play_settings"),
  holeLabels: jsonb("hole_labels"), // Array of hole labels
  shotgunPriority: integer("shotgun_priority"),
  defaultTees: jsonb("default_tees"), // Default tees by gender
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Golf Genius Tees
export const golfGeniusTees = pgTable("golf_genius_tees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  golfGeniusId: varchar("golf_genius_id").notNull().unique(),
  courseId: varchar("course_id").notNull().references(() => golfGeniusCourses.id),
  name: varchar("name").notNull(),
  abbreviation: varchar("abbreviation"),
  color: varchar("color"), // hexadecimal color
  slope: decimal("slope", { precision: 5, scale: 2 }),
  rating: decimal("rating", { precision: 5, scale: 2 }),
  holeData: jsonb("hole_data"), // Par, yardage, handicap for each hole
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Golf Genius Events
export const golfGeniusEvents = pgTable("golf_genius_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  golfGeniusId: varchar("golf_genius_id").notNull().unique(),
  name: varchar("name").notNull(),
  seasonId: varchar("season_id").references(() => golfGeniusSeasons.id),
  categoryId: varchar("category_id").references(() => golfGeniusCategories.id),
  type: varchar("type").notNull(), // "event", "league", "trip"
  registrationStatus: varchar("registration_status"), // "invitation_list", "open", "closed"
  startDate: date("start_date"),
  endDate: date("end_date"),
  isArchived: boolean("is_archived").default(false),
  externalId: varchar("external_id"), // For syncing with external systems
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Golf Genius Event Rounds
export const golfGeniusEventRounds = pgTable("golf_genius_event_rounds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  golfGeniusId: varchar("golf_genius_id").notNull().unique(),
  eventId: varchar("event_id").notNull().references(() => golfGeniusEvents.id),
  name: varchar("name").notNull(),
  date: date("date").notNull(),
  status: varchar("status").notNull(), // "not started", "in progress", "completed"
  pairingGroupSize: integer("pairing_group_size"), // 2-6 players
  isMostRecent: boolean("is_most_recent").default(false),
  handicapUpdatesAllowed: boolean("handicap_updates_allowed").default(false),
  teeSheetReleased: boolean("tee_sheet_released").default(false),
  mobileScoreEntryEnabled: boolean("mobile_score_entry_enabled").default(false),
  resultsReleased: boolean("results_released").default(false),
  roundType: varchar("round_type").default("golf"), // "golf" or "social"
  externalId: varchar("external_id"), // For syncing with external systems
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Golf Genius Event Roster (players registered for events)
export const golfGeniusEventRoster = pgTable("golf_genius_event_roster", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => golfGeniusEvents.id),
  playerId: varchar("player_id").notNull().references(() => golfGeniusPlayers.id),
  registrationData: jsonb("registration_data"), // Event-specific player data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Golf Genius Tournaments (within rounds)
export const golfGeniusTournaments = pgTable("golf_genius_tournaments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  golfGeniusId: varchar("golf_genius_id").notNull().unique(),
  roundId: varchar("round_id").notNull().references(() => golfGeniusEventRounds.id),
  name: varchar("name").notNull(),
  settings: jsonb("settings"), // Tournament configuration settings
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Golf Genius Scores
export const golfGeniusScores = pgTable("golf_genius_scores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roundId: varchar("round_id").notNull().references(() => golfGeniusEventRounds.id),
  playerId: varchar("player_id").notNull().references(() => golfGeniusPlayers.id),
  courseId: varchar("course_id").references(() => golfGeniusCourses.id),
  teeId: varchar("tee_id").references(() => golfGeniusTees.id),
  scores: jsonb("scores").notNull(), // Hole-by-hole scores
  totalScore: integer("total_score"),
  netScore: integer("net_score"),
  handicapUsed: decimal("handicap_used", { precision: 5, scale: 2 }),
  teeTimeSlot: varchar("tee_time_slot"),
  startingHole: integer("starting_hole"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Golf Genius Tournament Results
export const golfGeniusTournamentResults = pgTable("golf_genius_tournament_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull().references(() => golfGeniusTournaments.id),
  playerId: varchar("player_id").notNull().references(() => golfGeniusPlayers.id),
  position: integer("position"),
  score: integer("score"),
  points: decimal("points", { precision: 10, scale: 2 }),
  prize: decimal("prize", { precision: 10, scale: 2 }),
  resultsData: jsonb("results_data"), // Additional result data from API
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Golf Genius API Import Logs
export const golfGeniusImportLogs = pgTable("golf_genius_import_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  importType: varchar("import_type").notNull(), // "players", "events", "scores", "results", etc.
  status: varchar("status").notNull(), // "pending", "running", "completed", "failed"
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  recordsProcessed: integer("records_processed").default(0),
  recordsSuccessful: integer("records_successful").default(0),
  recordsFailed: integer("records_failed").default(0),
  errorMessage: text("error_message"),
  errorDetails: jsonb("error_details"),
  requestedBy: varchar("requested_by").references(() => users.id),
  isAutoImport: boolean("is_auto_import").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema exports for Golf Genius tables
export const insertGolfGeniusSeasonSchema = createInsertSchema(golfGeniusSeasons).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGolfGeniusCategorySchema = createInsertSchema(golfGeniusCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGolfGeniusPlayerSchema = createInsertSchema(golfGeniusPlayers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGolfGeniusEventSchema = createInsertSchema(golfGeniusEvents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGolfGeniusEventRoundSchema = createInsertSchema(golfGeniusEventRounds).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGolfGeniusScoreSchema = createInsertSchema(golfGeniusScores).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGolfGeniusImportLogSchema = createInsertSchema(golfGeniusImportLogs).omit({
  id: true,
  createdAt: true,
});

// Types for Golf Genius entities
export type InsertGolfGeniusSeason = z.infer<typeof insertGolfGeniusSeasonSchema>;
export type GolfGeniusSeason = typeof golfGeniusSeasons.$inferSelect;

export type InsertGolfGeniusCategory = z.infer<typeof insertGolfGeniusCategorySchema>;
export type GolfGeniusCategory = typeof golfGeniusCategories.$inferSelect;

export type InsertGolfGeniusPlayer = z.infer<typeof insertGolfGeniusPlayerSchema>;
export type GolfGeniusPlayer = typeof golfGeniusPlayers.$inferSelect;

export type InsertGolfGeniusEvent = z.infer<typeof insertGolfGeniusEventSchema>;
export type GolfGeniusEvent = typeof golfGeniusEvents.$inferSelect;

export type InsertGolfGeniusEventRound = z.infer<typeof insertGolfGeniusEventRoundSchema>;
export type GolfGeniusEventRound = typeof golfGeniusEventRounds.$inferSelect;

export type InsertGolfGeniusScore = z.infer<typeof insertGolfGeniusScoreSchema>;
export type GolfGeniusScore = typeof golfGeniusScores.$inferSelect;

export type InsertGolfGeniusImportLog = z.infer<typeof insertGolfGeniusImportLogSchema>;
export type GolfGeniusImportLog = typeof golfGeniusImportLogs.$inferSelect;
