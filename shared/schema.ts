import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Students/User Profiles
export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  year: text("year").notNull(), // Freshman, Sophomore, Junior, Senior
  major: text("major").notNull(),
  bio: text("bio"),
  avatar: text("avatar"),
  courses: text("courses").array().notNull().default(sql`ARRAY[]::text[]`),
  interests: text("interests").array().notNull().default(sql`ARRAY[]::text[]`),
  hobbies: text("hobbies").array().notNull().default(sql`ARRAY[]::text[]`),
  goals: text("goals").array().notNull().default(sql`ARRAY[]::text[]`),
  location: text("location"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true,
});

export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;

// Events
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  location: text("location").notNull(),
  image: text("image"),
  organizerId: varchar("organizer_id").notNull(),
  category: text("category").notNull(), // Study, Social, Sports, Arts, etc.
  capacity: integer("capacity"),
  attendees: text("attendees").array().notNull().default(sql`ARRAY[]::text[]`), // Array of student IDs
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
}).extend({
  attendees: z.array(z.string()).default([]),
});

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

// Study Groups
export const studyGroups = pgTable("study_groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  course: text("course").notNull(),
  description: text("description").notNull(),
  image: text("image"),
  creatorId: varchar("creator_id").notNull(),
  members: text("members").array().notNull().default(sql`ARRAY[]::text[]`), // Array of student IDs
  tags: text("tags").array().notNull().default(sql`ARRAY[]::text[]`),
  maxMembers: integer("max_members"),
  isPrivate: boolean("is_private").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertStudyGroupSchema = createInsertSchema(studyGroups).omit({
  id: true,
  createdAt: true,
}).extend({
  members: z.array(z.string()).default([]),
});

export type InsertStudyGroup = z.infer<typeof insertStudyGroupSchema>;
export type StudyGroup = typeof studyGroups.$inferSelect;

// Chat Rooms
export const chatRooms = pgTable("chat_rooms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // study, event, social, direct
  relatedId: varchar("related_id"), // ID of related event or study group
  members: text("members").array().notNull().default(sql`ARRAY[]::text[]`),
  lastMessage: text("last_message"),
  lastMessageTime: timestamp("last_message_time"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertChatRoomSchema = createInsertSchema(chatRooms).omit({
  id: true,
  createdAt: true,
});

export type InsertChatRoom = z.infer<typeof insertChatRoomSchema>;
export type ChatRoom = typeof chatRooms.$inferSelect;

// Messages
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomId: varchar("room_id").notNull(),
  senderId: varchar("sender_id").notNull(),
  senderName: text("sender_name").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Campus News with category enum
const newsCategoryEnum = z.enum(["Announcement", "Event", "Academic", "Campus Life"]);

export const campusNews = pgTable("campus_news", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  image: text("image"),
  author: text("author").notNull(),
  category: text("category").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCampusNewsSchema = createInsertSchema(campusNews).omit({
  id: true,
  createdAt: true,
}).extend({
  category: newsCategoryEnum,
});

export type InsertCampusNews = z.infer<typeof insertCampusNewsSchema>;
export type CampusNews = typeof campusNews.$inferSelect;

// Meetup Locations
export const meetupLocations = pgTable("meetup_locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // study, café, recreation, dining
  description: text("description"),
  address: text("address").notNull(),
  popular: boolean("popular").notNull().default(false),
});

export const insertMeetupLocationSchema = createInsertSchema(meetupLocations).omit({
  id: true,
});

export type InsertMeetupLocation = z.infer<typeof insertMeetupLocationSchema>;
export type MeetupLocation = typeof meetupLocations.$inferSelect;

// Matching/Connection tracking
export const connections = pgTable("connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentId: varchar("student_id").notNull(),
  connectedId: varchar("connected_id").notNull(),
  status: text("status").notNull(), // pending, accepted, rejected
  matchScore: integer("match_score").notNull(), // 0-100 compatibility score
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertConnectionSchema = createInsertSchema(connections).omit({
  id: true,
  createdAt: true,
});

export type InsertConnection = z.infer<typeof insertConnectionSchema>;
export type Connection = typeof connections.$inferSelect;
