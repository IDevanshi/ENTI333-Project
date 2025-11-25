import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import bcrypt from "bcryptjs";
import { storage } from "./storage";
import {
  insertUserSchema,
  insertStudentSchema,
  insertMatchSchema,
  insertEventSchema,
  insertStudyGroupSchema,
  insertChatRoomSchema,
  insertMessageSchema,
  insertCampusNewsSchema,
  insertMeetupLocationSchema,
  type Student,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Authentication Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password } = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        username,
        password: hashedPassword,
      });

      req.session.userId = user.id;
      res.status(201).json({ id: user.id, username: user.username });
    } catch (error) {
      res.status(400).json({ error: "Invalid registration data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const student = await storage.getStudentByUserId(user.id);
      
      req.session.userId = user.id;
      if (student) {
        req.session.studentId = student.id;
      }

      res.json({
        id: user.id,
        username: user.username,
        student: student || null,
      });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const student = await storage.getStudentByUserId(user.id);
      
      res.json({
        id: user.id,
        username: user.username,
        student: student || null,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Student Profile Routes
  app.get("/api/students", async (_req, res) => {
    try {
      const students = await storage.getAllStudents();
      res.json(students);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch students" });
    }
  });

  app.get("/api/students/:id", async (req, res) => {
    try {
      const student = await storage.getStudent(req.params.id);
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }
      res.json(student);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch student" });
    }
  });

  app.post("/api/students", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const existingStudent = await storage.getStudentByUserId(req.session.userId);
      if (existingStudent) {
        return res.status(400).json({ error: "Profile already exists" });
      }

      const validatedData = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent({
        ...validatedData,
        userId: req.session.userId,
      });

      req.session.studentId = student.id;
      res.status(201).json(student);
    } catch (error) {
      res.status(400).json({ error: "Invalid student data" });
    }
  });

  app.put("/api/students/:id", async (req, res) => {
    try {
      const validatedData = insertStudentSchema.partial().parse(req.body);
      const student = await storage.updateStudent(req.params.id, validatedData);
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }
      res.json(student);
    } catch (error) {
      res.status(400).json({ error: "Invalid student data" });
    }
  });

  app.delete("/api/students/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteStudent(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Student not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete student" });
    }
  });

  // Matching Algorithm
  app.post("/api/matches/calculate", async (req, res) => {
    try {
      const { studentId } = req.body;
      
      if (!studentId || typeof studentId !== "string") {
        return res.status(400).json({ error: "studentId is required" });
      }
      
      const currentStudent = await storage.getStudent(studentId);
      if (!currentStudent) {
        return res.status(404).json({ error: "Student not found" });
      }

      const allStudents = await storage.getAllStudents();
      const matches = allStudents
        .filter((s) => s.id !== studentId)
        .map((student) => {
          const score = calculateCompatibilityScore(currentStudent, student);
          return { student, score };
        })
        .filter((match) => match.score >= 60)
        .sort((a, b) => b.score - a.score);

      res.json(matches);
    } catch (error) {
      res.status(500).json({ error: "Failed to calculate matches" });
    }
  });

  app.post("/api/matches", async (req, res) => {
    try {
      const validatedData = insertMatchSchema.parse(req.body);
      const match = await storage.createMatch(validatedData);
      res.status(201).json(match);
    } catch (error) {
      res.status(400).json({ error: "Invalid match data" });
    }
  });

  app.get("/api/matches/:studentId", async (req, res) => {
    try {
      const matches = await storage.getMatches(req.params.studentId);
      res.json(matches);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch matches" });
    }
  });

  // Event Routes
  app.get("/api/events", async (_req, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch event" });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      const validatedData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(validatedData);
      res.status(201).json(event);
    } catch (error) {
      res.status(400).json({ error: "Invalid event data" });
    }
  });

  app.put("/api/events/:id", async (req, res) => {
    try {
      const validatedData = insertEventSchema.partial().parse(req.body);
      const event = await storage.updateEvent(req.params.id, validatedData);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(400).json({ error: "Invalid event data" });
    }
  });

  app.delete("/api/events/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteEvent(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete event" });
    }
  });

  app.post("/api/events/:id/rsvp", async (req, res) => {
    try {
      const { studentId } = req.body;
      if (!studentId || typeof studentId !== "string") {
        return res.status(400).json({ error: "studentId is required" });
      }
      
      // Verify student exists
      const student = await storage.getStudent(studentId);
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }
      
      const event = await storage.addEventAttendee(req.params.id, studentId);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to RSVP to event" });
    }
  });

  app.delete("/api/events/:id/rsvp", async (req, res) => {
    try {
      const { studentId } = req.body;
      if (!studentId || typeof studentId !== "string") {
        return res.status(400).json({ error: "studentId is required" });
      }
      
      // Verify event exists first
      const existingEvent = await storage.getEvent(req.params.id);
      if (!existingEvent) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      const event = await storage.removeEventAttendee(req.params.id, studentId);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to remove RSVP" });
    }
  });

  // Study Group Routes
  app.get("/api/study-groups", async (_req, res) => {
    try {
      const groups = await storage.getAllStudyGroups();
      res.json(groups);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch study groups" });
    }
  });

  app.get("/api/study-groups/:id", async (req, res) => {
    try {
      const group = await storage.getStudyGroup(req.params.id);
      if (!group) {
        return res.status(404).json({ error: "Study group not found" });
      }
      res.json(group);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch study group" });
    }
  });

  app.post("/api/study-groups", async (req, res) => {
    try {
      const validatedData = insertStudyGroupSchema.parse(req.body);
      const group = await storage.createStudyGroup(validatedData);
      res.status(201).json(group);
    } catch (error) {
      res.status(400).json({ error: "Invalid study group data" });
    }
  });

  app.put("/api/study-groups/:id", async (req, res) => {
    try {
      const validatedData = insertStudyGroupSchema.partial().parse(req.body);
      const group = await storage.updateStudyGroup(req.params.id, validatedData);
      if (!group) {
        return res.status(404).json({ error: "Study group not found" });
      }
      res.json(group);
    } catch (error) {
      res.status(400).json({ error: "Invalid study group data" });
    }
  });

  app.delete("/api/study-groups/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteStudyGroup(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Study group not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete study group" });
    }
  });

  app.post("/api/study-groups/:id/join", async (req, res) => {
    try {
      const { studentId } = req.body;
      if (!studentId || typeof studentId !== "string") {
        return res.status(400).json({ error: "studentId is required" });
      }
      
      // Verify student exists
      const student = await storage.getStudent(studentId);
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }
      
      const group = await storage.addGroupMember(req.params.id, studentId);
      if (!group) {
        return res.status(404).json({ error: "Study group not found" });
      }
      res.json(group);
    } catch (error) {
      res.status(500).json({ error: "Failed to join study group" });
    }
  });

  app.delete("/api/study-groups/:id/leave", async (req, res) => {
    try {
      const { studentId } = req.body;
      if (!studentId || typeof studentId !== "string") {
        return res.status(400).json({ error: "studentId is required" });
      }
      
      // Verify group exists first
      const existingGroup = await storage.getStudyGroup(req.params.id);
      if (!existingGroup) {
        return res.status(404).json({ error: "Study group not found" });
      }
      
      const group = await storage.removeGroupMember(req.params.id, studentId);
      if (!group) {
        return res.status(404).json({ error: "Study group not found" });
      }
      res.json(group);
    } catch (error) {
      res.status(500).json({ error: "Failed to leave study group" });
    }
  });

  // Chat Room Routes
  app.get("/api/chat-rooms", async (req, res) => {
    try {
      const { studentId } = req.query;
      if (studentId && typeof studentId === "string") {
        const rooms = await storage.getChatRoomsByStudent(studentId);
        return res.json(rooms);
      }
      const rooms = await storage.getAllChatRooms();
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat rooms" });
    }
  });

  // Get chat rooms for the current authenticated user
  app.get("/api/my-chat-rooms", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const student = await storage.getStudentByUserId(req.session.userId);
      if (!student) {
        return res.json([]);
      }
      const rooms = await storage.getChatRoomsByStudent(student.id);
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat rooms" });
    }
  });

  app.get("/api/chat-rooms/:id", async (req, res) => {
    try {
      const id = req.params.id;
      
      // First check if this is a student ID (for backwards compatibility)
      const studentRooms = await storage.getChatRoomsByStudent(id);
      if (studentRooms.length > 0) {
        return res.json(studentRooms);
      }
      
      // Otherwise treat it as a room ID
      const room = await storage.getChatRoom(id);
      if (!room) {
        // If no room found, return empty array (might be a new student with no chats)
        const student = await storage.getStudent(id);
        if (student) {
          return res.json([]);
        }
        return res.status(404).json({ error: "Chat room not found" });
      }
      res.json(room);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat room" });
    }
  });

  app.post("/api/chat-rooms", async (req, res) => {
    try {
      const validatedData = insertChatRoomSchema.parse(req.body);
      const room = await storage.createChatRoom(validatedData);
      res.status(201).json(room);
    } catch (error) {
      res.status(400).json({ error: "Invalid chat room data" });
    }
  });

  app.delete("/api/chat-rooms/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteChatRoom(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Chat room not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete chat room" });
    }
  });

  // Direct chat endpoint - creates or gets existing direct chat between two users
  app.post("/api/chat-rooms/direct", async (req, res) => {
    try {
      const { student1Id, student2Id, student1Name, student2Name } = req.body;
      
      if (!student1Id || !student2Id || !student1Name || !student2Name) {
        return res.status(400).json({ error: "Both student IDs and names are required" });
      }
      
      // Check if direct chat already exists
      let room = await storage.getDirectChatRoom(student1Id, student2Id);
      
      if (!room) {
        // Create new direct chat room
        room = await storage.createChatRoom({
          name: `${student1Name} & ${student2Name}`,
          type: "direct",
          members: [student1Id, student2Id],
        });
      }
      
      res.json(room);
    } catch (error) {
      res.status(500).json({ error: "Failed to create direct chat" });
    }
  });

  // Message Routes
  app.get("/api/messages/:roomId", async (req, res) => {
    try {
      const messages = await storage.getMessagesByRoom(req.params.roomId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(validatedData);
      
      // Broadcast message to all connected WebSocket clients in this room
      const room = roomConnections.get(validatedData.roomId);
      if (room) {
        room.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: "message",
              data: message,
            }));
          }
        });
      }
      
      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ error: "Invalid message data" });
    }
  });

  // Campus News Routes
  app.get("/api/news", async (req, res) => {
    try {
      const { category } = req.query;
      if (category && typeof category === "string") {
        const news = await storage.getNewsByCategory(category);
        return res.json(news);
      }
      const news = await storage.getAllNews();
      res.json(news);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  app.get("/api/news/:id", async (req, res) => {
    try {
      const news = await storage.getNews(req.params.id);
      if (!news) {
        return res.status(404).json({ error: "News not found" });
      }
      res.json(news);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  app.post("/api/news", async (req, res) => {
    try {
      const validatedData = insertCampusNewsSchema.parse(req.body);
      const news = await storage.createNews(validatedData);
      res.status(201).json(news);
    } catch (error) {
      res.status(400).json({ error: "Invalid news data" });
    }
  });

  app.put("/api/news/:id", async (req, res) => {
    try {
      const validatedData = insertCampusNewsSchema.partial().parse(req.body);
      const news = await storage.updateNews(req.params.id, validatedData);
      if (!news) {
        return res.status(404).json({ error: "News not found" });
      }
      res.json(news);
    } catch (error) {
      res.status(400).json({ error: "Invalid news data" });
    }
  });

  app.delete("/api/news/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteNews(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "News not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete news" });
    }
  });

  // Meetup Location Routes
  app.get("/api/meetups", async (_req, res) => {
    try {
      const locations = await storage.getAllMeetupLocations();
      res.json(locations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch meetup locations" });
    }
  });

  app.get("/api/meetups/:id", async (req, res) => {
    try {
      const location = await storage.getMeetupLocation(req.params.id);
      if (!location) {
        return res.status(404).json({ error: "Meetup location not found" });
      }
      res.json(location);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch meetup location" });
    }
  });

  app.post("/api/meetups", async (req, res) => {
    try {
      const validatedData = insertMeetupLocationSchema.parse(req.body);
      const location = await storage.createMeetupLocation(validatedData);
      res.status(201).json(location);
    } catch (error) {
      res.status(400).json({ error: "Invalid meetup location data" });
    }
  });

  app.delete("/api/meetups/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteMeetupLocation(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Meetup location not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete meetup location" });
    }
  });

  // WebSocket Server for Real-time Chat
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  const roomConnections = new Map<string, Set<WebSocket>>();

  wss.on("connection", (ws: WebSocket) => {
    let currentRoom: string | null = null;

    ws.on("message", async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === "join" && message.roomId) {
          // Join a chat room
          const roomId: string = message.roomId;
          currentRoom = roomId;
          if (!roomConnections.has(roomId)) {
            roomConnections.set(roomId, new Set());
          }
          roomConnections.get(roomId)?.add(ws);
          
          // Send acknowledgment
          ws.send(JSON.stringify({
            type: "joined",
            roomId: roomId,
          }));
        } else if (message.type === "message" && currentRoom) {
          // Validate and save message
          const validatedData = insertMessageSchema.parse({
            roomId: currentRoom,
            senderId: message.senderId,
            senderName: message.senderName,
            content: message.content,
          });
          const newMessage = await storage.createMessage(validatedData);
          
          // Broadcast to all clients in the room
          const room = roomConnections.get(currentRoom);
          if (room) {
            room.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: "message",
                  data: newMessage,
                }));
              }
            });
          }
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
        // Send error response to client
        ws.send(JSON.stringify({
          type: "error",
          message: error instanceof Error ? error.message : "Unknown error",
        }));
      }
    });

    ws.on("close", () => {
      if (currentRoom) {
        roomConnections.get(currentRoom)?.delete(ws);
        if (roomConnections.get(currentRoom)?.size === 0) {
          roomConnections.delete(currentRoom);
        }
      }
    });
  });

  return httpServer;
}

// Compatibility Score Calculation Algorithm
function calculateCompatibilityScore(student1: Student, student2: Student): number {
  let score = 0;
  let maxScore = 0;

  // Shared courses (30 points max)
  const sharedCourses = student1.courses.filter((course) =>
    student2.courses.includes(course)
  );
  score += Math.min(sharedCourses.length * 10, 30);
  maxScore += 30;

  // Shared interests (25 points max)
  const sharedInterests = student1.interests.filter((interest) =>
    student2.interests.includes(interest)
  );
  score += Math.min(sharedInterests.length * 5, 25);
  maxScore += 25;

  // Shared hobbies (20 points max)
  const sharedHobbies = student1.hobbies.filter((hobby) =>
    student2.hobbies.includes(hobby)
  );
  score += Math.min(sharedHobbies.length * 5, 20);
  maxScore += 20;

  // Shared goals (15 points max)
  const sharedGoals = student1.goals.filter((goal) =>
    student2.goals.includes(goal)
  );
  score += Math.min(sharedGoals.length * 5, 15);
  maxScore += 15;

  // Same major (10 points)
  if (student1.major === student2.major) {
    score += 10;
  }
  maxScore += 10;

  // Normalize to 100
  return Math.round((score / maxScore) * 100);
}
