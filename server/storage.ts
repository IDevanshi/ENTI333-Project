import {
  users,
  students,
  matches,
  events,
  studyGroups,
  chatRooms,
  messages,
  campusNews,
  meetupLocations,
  type User,
  type InsertUser,
  type Student,
  type InsertStudent,
  type Match,
  type InsertMatch,
  type Event,
  type InsertEvent,
  type StudyGroup,
  type InsertStudyGroup,
  type ChatRoom,
  type InsertChatRoom,
  type Message,
  type InsertMessage,
  type CampusNews,
  type InsertCampusNews,
  type MeetupLocation,
  type InsertMeetupLocation,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, sql } from "drizzle-orm";

export interface IStorage {
  // User methods (auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Student profile methods
  getStudent(id: string): Promise<Student | undefined>;
  getStudentByUserId(userId: string): Promise<Student | undefined>;
  getAllStudents(): Promise<Student[]>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: string, updates: Partial<InsertStudent>): Promise<Student | undefined>;
  deleteStudent(id: string): Promise<boolean>;

  // Match methods
  getMatches(studentId: string): Promise<Match[]>;
  createMatch(match: InsertMatch): Promise<Match>;
  deleteMatch(id: string): Promise<boolean>;

  // Event methods
  getEvent(id: string): Promise<Event | undefined>;
  getAllEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, updates: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: string): Promise<boolean>;
  addEventAttendee(eventId: string, studentId: string): Promise<Event | undefined>;
  removeEventAttendee(eventId: string, studentId: string): Promise<Event | undefined>;

  // Study Group methods
  getStudyGroup(id: string): Promise<StudyGroup | undefined>;
  getAllStudyGroups(): Promise<StudyGroup[]>;
  createStudyGroup(group: InsertStudyGroup): Promise<StudyGroup>;
  updateStudyGroup(id: string, updates: Partial<InsertStudyGroup>): Promise<StudyGroup | undefined>;
  deleteStudyGroup(id: string): Promise<boolean>;
  addGroupMember(groupId: string, studentId: string): Promise<StudyGroup | undefined>;
  removeGroupMember(groupId: string, studentId: string): Promise<StudyGroup | undefined>;

  // Chat Room methods
  getChatRoom(id: string): Promise<ChatRoom | undefined>;
  getAllChatRooms(): Promise<ChatRoom[]>;
  getChatRoomsByStudent(studentId: string): Promise<ChatRoom[]>;
  createChatRoom(room: InsertChatRoom): Promise<ChatRoom>;
  deleteChatRoom(id: string): Promise<boolean>;

  // Message methods
  getMessage(id: string): Promise<Message | undefined>;
  getMessagesByRoom(roomId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  deleteMessage(id: string): Promise<boolean>;

  // Campus News methods
  getNews(id: string): Promise<CampusNews | undefined>;
  getAllNews(): Promise<CampusNews[]>;
  getNewsByCategory(category: string): Promise<CampusNews[]>;
  createNews(news: InsertCampusNews): Promise<CampusNews>;
  updateNews(id: string, updates: Partial<InsertCampusNews>): Promise<CampusNews | undefined>;
  deleteNews(id: string): Promise<boolean>;

  // Meetup Location methods
  getMeetupLocation(id: string): Promise<MeetupLocation | undefined>;
  getAllMeetupLocations(): Promise<MeetupLocation[]>;
  createMeetupLocation(location: InsertMeetupLocation): Promise<MeetupLocation>;
  deleteMeetupLocation(id: string): Promise<boolean>;
}

// Database-backed storage implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Student profile methods
  async getStudent(id: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student || undefined;
  }

  async getStudentByUserId(userId: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.userId, userId));
    return student || undefined;
  }

  async getAllStudents(): Promise<Student[]> {
    return await db.select().from(students);
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const [student] = await db.insert(students).values(insertStudent).returning();
    return student;
  }

  async updateStudent(id: string, updates: Partial<InsertStudent>): Promise<Student | undefined> {
    const [updated] = await db
      .update(students)
      .set(updates)
      .where(eq(students.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteStudent(id: string): Promise<boolean> {
    const result = await db.delete(students).where(eq(students.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Match methods
  async getMatches(studentId: string): Promise<Match[]> {
    return await db
      .select()
      .from(matches)
      .where(or(eq(matches.student1Id, studentId), eq(matches.student2Id, studentId)));
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const [match] = await db.insert(matches).values(insertMatch).returning();
    return match;
  }

  async deleteMatch(id: string): Promise<boolean> {
    const result = await db.delete(matches).where(eq(matches.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Event methods
  async getEvent(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }

  async getAllEvents(): Promise<Event[]> {
    return await db.select().from(events);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const [event] = await db.insert(events).values(insertEvent).returning();
    return event;
  }

  async updateEvent(id: string, updates: Partial<InsertEvent>): Promise<Event | undefined> {
    const [updated] = await db
      .update(events)
      .set(updates)
      .where(eq(events.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteEvent(id: string): Promise<boolean> {
    const result = await db.delete(events).where(eq(events.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async addEventAttendee(eventId: string, studentId: string): Promise<Event | undefined> {
    // Atomic array append using SQL
    const [updated] = await db
      .update(events)
      .set({ 
        attendees: sql`array_append(${events.attendees}, ${studentId})`
      })
      .where(and(
        eq(events.id, eventId),
        sql`NOT (${studentId} = ANY(${events.attendees}))`
      ))
      .returning();
    
    return updated || await this.getEvent(eventId);
  }

  async removeEventAttendee(eventId: string, studentId: string): Promise<Event | undefined> {
    // Atomic array remove using SQL
    const [updated] = await db
      .update(events)
      .set({ 
        attendees: sql`array_remove(${events.attendees}, ${studentId})`
      })
      .where(eq(events.id, eventId))
      .returning();
    
    return updated || undefined;
  }

  // Study Group methods
  async getStudyGroup(id: string): Promise<StudyGroup | undefined> {
    const [group] = await db.select().from(studyGroups).where(eq(studyGroups.id, id));
    return group || undefined;
  }

  async getAllStudyGroups(): Promise<StudyGroup[]> {
    return await db.select().from(studyGroups);
  }

  async createStudyGroup(insertGroup: InsertStudyGroup): Promise<StudyGroup> {
    const [group] = await db.insert(studyGroups).values(insertGroup).returning();
    return group;
  }

  async updateStudyGroup(id: string, updates: Partial<InsertStudyGroup>): Promise<StudyGroup | undefined> {
    const [updated] = await db
      .update(studyGroups)
      .set(updates)
      .where(eq(studyGroups.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteStudyGroup(id: string): Promise<boolean> {
    const result = await db.delete(studyGroups).where(eq(studyGroups.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async addGroupMember(groupId: string, studentId: string): Promise<StudyGroup | undefined> {
    // Atomic array append using SQL
    const [updated] = await db
      .update(studyGroups)
      .set({ 
        members: sql`array_append(${studyGroups.members}, ${studentId})`
      })
      .where(and(
        eq(studyGroups.id, groupId),
        sql`NOT (${studentId} = ANY(${studyGroups.members}))`
      ))
      .returning();
    
    return updated || await this.getStudyGroup(groupId);
  }

  async removeGroupMember(groupId: string, studentId: string): Promise<StudyGroup | undefined> {
    // Atomic array remove using SQL
    const [updated] = await db
      .update(studyGroups)
      .set({ 
        members: sql`array_remove(${studyGroups.members}, ${studentId})`
      })
      .where(eq(studyGroups.id, groupId))
      .returning();
    
    return updated || undefined;
  }

  // Chat Room methods
  async getChatRoom(id: string): Promise<ChatRoom | undefined> {
    const [room] = await db.select().from(chatRooms).where(eq(chatRooms.id, id));
    return room || undefined;
  }

  async getAllChatRooms(): Promise<ChatRoom[]> {
    return await db.select().from(chatRooms);
  }

  async getChatRoomsByStudent(studentId: string): Promise<ChatRoom[]> {
    // Server-side filtering using SQL
    return await db
      .select()
      .from(chatRooms)
      .where(sql`${studentId} = ANY(${chatRooms.members})`)
      .orderBy(sql`${chatRooms.lastMessageTime} DESC NULLS LAST`);
  }

  async createChatRoom(insertRoom: InsertChatRoom): Promise<ChatRoom> {
    const [room] = await db.insert(chatRooms).values(insertRoom).returning();
    return room;
  }

  async deleteChatRoom(id: string): Promise<boolean> {
    const result = await db.delete(chatRooms).where(eq(chatRooms.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Message methods
  async getMessage(id: string): Promise<Message | undefined> {
    const [message] = await db.select().from(messages).where(eq(messages.id, id));
    return message || undefined;
  }

  async getMessagesByRoom(roomId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.roomId, roomId))
      .orderBy(messages.createdAt);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    
    // Update chat room's lastMessage and lastMessageTime
    await db
      .update(chatRooms)
      .set({
        lastMessage: insertMessage.content,
        lastMessageTime: new Date(),
      })
      .where(eq(chatRooms.id, insertMessage.roomId));
    
    return message;
  }

  async deleteMessage(id: string): Promise<boolean> {
    const result = await db.delete(messages).where(eq(messages.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Campus News methods
  async getNews(id: string): Promise<CampusNews | undefined> {
    const [news] = await db.select().from(campusNews).where(eq(campusNews.id, id));
    return news || undefined;
  }

  async getAllNews(): Promise<CampusNews[]> {
    return await db.select().from(campusNews).orderBy(sql`${campusNews.createdAt} DESC`);
  }

  async getNewsByCategory(category: string): Promise<CampusNews[]> {
    return await db
      .select()
      .from(campusNews)
      .where(eq(campusNews.category, category))
      .orderBy(sql`${campusNews.createdAt} DESC`);
  }

  async createNews(insertNews: InsertCampusNews): Promise<CampusNews> {
    const [news] = await db.insert(campusNews).values(insertNews).returning();
    return news;
  }

  async updateNews(id: string, updates: Partial<InsertCampusNews>): Promise<CampusNews | undefined> {
    const [updated] = await db
      .update(campusNews)
      .set(updates)
      .where(eq(campusNews.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteNews(id: string): Promise<boolean> {
    const result = await db.delete(campusNews).where(eq(campusNews.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Meetup Location methods
  async getMeetupLocation(id: string): Promise<MeetupLocation | undefined> {
    const [location] = await db.select().from(meetupLocations).where(eq(meetupLocations.id, id));
    return location || undefined;
  }

  async getAllMeetupLocations(): Promise<MeetupLocation[]> {
    return await db.select().from(meetupLocations);
  }

  async createMeetupLocation(insertLocation: InsertMeetupLocation): Promise<MeetupLocation> {
    const [location] = await db.insert(meetupLocations).values(insertLocation).returning();
    return location;
  }

  async deleteMeetupLocation(id: string): Promise<boolean> {
    const result = await db.delete(meetupLocations).where(eq(meetupLocations.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
}

export const storage = new DatabaseStorage();
