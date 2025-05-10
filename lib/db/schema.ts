import { pgTable, serial, text, timestamp, integer, varchar, json, boolean } from 'drizzle-orm/pg-core';

// Users table - compatible with BetterAuth
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  password: text('password'),
  image: text('image'),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow(),
});

// Store threat intelligence data
export const threats = pgTable('threats', {
  id: serial('id').primaryKey(),
  aptGroup: varchar('apt_group', { length: 50 }).notNull(),
  attackMethod: varchar('attack_method', { length: 100 }).notNull(),
  target: varchar('target', { length: 100 }),
  location: varchar('location', { length: 100 }),
  confidence: integer('confidence'),
  timestamp: timestamp('timestamp', { mode: 'date' }).defaultNow(),
  details: json('details'),
  source: varchar('source', { length: 50 }).notNull(),
  sourceUrl: varchar('source_url', { length: 500 }),
  ioc: varchar('ioc', { length: 500 }),
  verified: boolean('verified').default(false),
});

// Store ML model predictions
export const predictions = pgTable('predictions', {
  id: serial('id').primaryKey(),
  aptGroup: varchar('apt_group', { length: 50 }).notNull(),
  attackMethod: varchar('attack_method', { length: 100 }).notNull(),
  targetType: varchar('target_type', { length: 100 }),
  confidence: integer('confidence').notNull(),
  timestamp: timestamp('timestamp', { mode: 'date' }).defaultNow(),
  features: json('features'),
  description: text('description'),
});

// User preferences for dashboard
export const userPreferences = pgTable('user_preferences', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  favoriteGroups: json('favorite_groups').$type<string[]>(),
  dashboardLayout: json('dashboard_layout'),
  darkMode: boolean('dark_mode').default(true),
  alertsEnabled: boolean('alerts_enabled').default(true),
  lastVisited: timestamp('last_visited', { mode: 'date' }).defaultNow(),
});