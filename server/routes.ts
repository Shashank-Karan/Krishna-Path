import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import type { Emotion, InsertVerse, InsertAdmin, InsertVerseInteraction, InsertEmotion } from "@shared/schema";
import { insertVerseSchema, insertAdminSchema, insertEmotionSchema } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import MemoryStore from "memorystore";

// Session configuration for admin authentication
const sessionTtl = 24 * 60 * 60 * 1000; // 24 hours

// Use memory store when not using real database, PostgreSQL store otherwise
const hasDatabase = process.env.DATABASE_URL;
let sessionStore: any;

if (hasDatabase) {
  const pgStore = connectPg(session);
  sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl / 1000,
    tableName: "session",
  });
} else {
  const MemStore = MemoryStore(session);
  sessionStore = new MemStore({
    checkPeriod: sessionTtl,
  });
}

// Admin authentication middleware
const isAdminAuthenticated = (req: any, res: any, next: any) => {
  if (req.session && req.session.adminId) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

// WebSocket connections storage
const adminConnections = new Set<WebSocket>();
const publicConnections = new Set<WebSocket>();

// Broadcast function for real-time updates to admin dashboard
export function broadcastToAdmins(data: any) {
  const message = JSON.stringify(data);
  adminConnections.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  });
}

// Broadcast function for real-time updates to main website
export function broadcastToPublic(data: any) {
  const message = JSON.stringify(data);
  publicConnections.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  });
}

// Broadcast to both admin and public clients
export function broadcastToAll(data: any) {
  broadcastToAdmins(data);
  broadcastToPublic(data);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware
  app.use(session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'fallback-secret-for-dev',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  }));

  // ADMIN ROUTES
  
  // Admin login
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const admin = await storage.getAdminByUsername(username);
      if (!admin) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await storage.verifyAdminPassword(password, admin.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Update last login
      await storage.updateAdminLastLogin(admin.id);

      // Set session
      (req as any).session.adminId = admin.id;
      (req as any).session.adminUsername = admin.username;

      res.json({ 
        message: "Login successful", 
        admin: { 
          id: admin.id, 
          username: admin.username, 
          email: admin.email, 
          role: admin.role 
        } 
      });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin logout
  app.post("/api/admin/logout", (req, res) => {
    (req as any).session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logout successful" });
    });
  });

  // Admin register (for initial setup)
  app.post("/api/admin/register", async (req, res) => {
    try {
      const adminData = insertAdminSchema.parse(req.body);
      
      // Check if admin already exists
      const existingAdmin = await storage.getAdminByUsername(adminData.username);
      if (existingAdmin) {
        return res.status(409).json({ message: "Admin already exists" });
      }

      const newAdmin = await storage.createAdmin(adminData);
      
      res.status(201).json({ 
        message: "Admin created successfully", 
        admin: { 
          id: newAdmin.id, 
          username: newAdmin.username, 
          email: newAdmin.email, 
          role: newAdmin.role 
        } 
      });
    } catch (error) {
      console.error("Admin registration error:", error);
      res.status(500).json({ message: "Failed to create admin" });
    }
  });

  // Check admin session
  app.get("/api/admin/me", isAdminAuthenticated, async (req, res) => {
    try {
      const adminId = (req as any).session.adminId;
      const admin = await storage.getAdminByUsername((req as any).session.adminUsername);
      
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      res.json({ 
        admin: { 
          id: admin.id, 
          username: admin.username, 
          email: admin.email, 
          role: admin.role 
        } 
      });
    } catch (error) {
      console.error("Admin session check error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin dashboard stats
  app.get("/api/admin/dashboard", isAdminAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // ADMIN VERSE MANAGEMENT

  // Get all verses for admin
  app.get("/api/admin/verses", isAdminAuthenticated, async (req, res) => {
    try {
      const verses = await storage.getAllVersesForAdmin();
      res.json(verses);
    } catch (error) {
      console.error("Error fetching admin verses:", error);
      res.status(500).json({ message: "Failed to fetch verses" });
    }
  });

  // Create new verse
  app.post("/api/admin/verses", isAdminAuthenticated, async (req, res) => {
    try {
      const verseData = insertVerseSchema.parse(req.body);
      const newVerse = await storage.createVerse(verseData);
      
      // Broadcast verse creation to all connected clients
      broadcastToAll({
        type: 'verse_created',
        data: newVerse
      });
      
      res.status(201).json(newVerse);
    } catch (error) {
      console.error("Error creating verse:", error);
      res.status(500).json({ message: "Failed to create verse" });
    }
  });

  // Update verse
  app.put("/api/admin/verses/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const verseData = insertVerseSchema.partial().parse(req.body);
      const updatedVerse = await storage.updateVerse(id, verseData);
      
      if (!updatedVerse) {
        return res.status(404).json({ message: "Verse not found" });
      }
      
      // Broadcast verse update to all connected clients
      broadcastToAll({
        type: 'verse_updated',
        data: updatedVerse
      });
      
      res.json(updatedVerse);
    } catch (error) {
      console.error("Error updating verse:", error);
      res.status(500).json({ message: "Failed to update verse" });
    }
  });

  // Delete verse (soft delete)
  app.delete("/api/admin/verses/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteVerse(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Verse not found" });
      }
      
      // Broadcast verse deletion to all connected clients
      broadcastToAll({
        type: 'verse_deleted',
        data: { id }
      });
      
      res.json({ message: "Verse deleted successfully" });
    } catch (error) {
      console.error("Error deleting verse:", error);
      res.status(500).json({ message: "Failed to delete verse" });
    }
  });

  // Get verse interactions
  app.get("/api/admin/interactions", isAdminAuthenticated, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const interactions = await storage.getVerseInteractions(limit);
      res.json(interactions);
    } catch (error) {
      console.error("Error fetching interactions:", error);
      res.status(500).json({ message: "Failed to fetch interactions" });
    }
  });

  // EMOTION MANAGEMENT ROUTES
  
  // Get all emotions
  app.get("/api/admin/emotions", isAdminAuthenticated, async (req, res) => {
    try {
      const emotions = await storage.getAllEmotions();
      res.json(emotions);
    } catch (error) {
      console.error("Error fetching emotions:", error);
      res.status(500).json({ message: "Failed to fetch emotions" });
    }
  });

  // Get emotion by ID
  app.get("/api/admin/emotions/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const emotion = await storage.getEmotionById(id);
      
      if (!emotion) {
        return res.status(404).json({ message: "Emotion not found" });
      }
      
      res.json(emotion);
    } catch (error) {
      console.error("Error fetching emotion:", error);
      res.status(500).json({ message: "Failed to fetch emotion" });
    }
  });

  // Create new emotion
  app.post("/api/admin/emotions", isAdminAuthenticated, async (req, res) => {
    try {
      const emotionData = insertEmotionSchema.parse(req.body);
      
      // Check if emotion name already exists
      const existingEmotion = await storage.getEmotionByName(emotionData.name);
      if (existingEmotion) {
        return res.status(409).json({ message: "Emotion with this name already exists" });
      }
      
      const newEmotion = await storage.createEmotion(emotionData);
      
      // Broadcast emotion change to all connected clients (admin dashboard and main website)
      broadcastToAll({
        type: 'emotion_created',
        data: newEmotion
      });
      
      res.status(201).json(newEmotion);
    } catch (error) {
      console.error("Error creating emotion:", error);
      res.status(500).json({ message: "Failed to create emotion" });
    }
  });

  // Update emotion
  app.put("/api/admin/emotions/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const emotionData = insertEmotionSchema.partial().parse(req.body);
      
      // If updating name, check for conflicts
      if (emotionData.name) {
        const existingEmotion = await storage.getEmotionByName(emotionData.name);
        if (existingEmotion && existingEmotion.id !== id) {
          return res.status(409).json({ message: "Emotion with this name already exists" });
        }
      }
      
      const updatedEmotion = await storage.updateEmotion(id, emotionData);
      
      if (!updatedEmotion) {
        return res.status(404).json({ message: "Emotion not found" });
      }
      
      // Broadcast emotion change to all connected clients (admin dashboard and main website)
      broadcastToAll({
        type: 'emotion_updated',
        data: updatedEmotion
      });
      
      res.json(updatedEmotion);
    } catch (error) {
      console.error("Error updating emotion:", error);
      res.status(500).json({ message: "Failed to update emotion" });
    }
  });

  // Delete emotion (soft delete)
  app.delete("/api/admin/emotions/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteEmotion(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Emotion not found" });
      }
      
      // Broadcast emotion deletion to all connected clients (admin dashboard and main website)
      broadcastToAll({
        type: 'emotion_deleted',
        data: { id }
      });
      
      res.json({ message: "Emotion deleted successfully" });
    } catch (error) {
      console.error("Error deleting emotion:", error);
      res.status(500).json({ message: "Failed to delete emotion" });
    }
  });

  // Get emotion statistics
  app.get("/api/admin/emotions/stats", isAdminAuthenticated, async (req, res) => {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      const stats = await storage.getEmotionStats(startDate, endDate);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching emotion stats:", error);
      res.status(500).json({ message: "Failed to fetch emotion statistics" });
    }
  });

  // PUBLIC ROUTES (existing)
  
  // Record interaction (for analytics)
  app.post("/api/interactions", async (req, res) => {
    try {
      const interaction: InsertVerseInteraction = {
        verseId: req.body.verseId,
        emotion: req.body.emotion,
        action: req.body.action,
        sessionId: req.sessionID,
        userAgent: req.get('User-Agent') || null,
        ipAddress: req.ip || null,
      };
      
      const newInteraction = await storage.recordInteraction(interaction);

      // Broadcast to admin dashboard in real-time
      broadcastToAdmins({
        type: 'new_interaction',
        data: newInteraction
      });

      // Also broadcast updated stats
      try {
        const stats = await storage.getDashboardStats();
        broadcastToAdmins({
          type: 'stats_update',
          data: stats
        });
      } catch (error) {
        console.error("Error broadcasting stats update:", error);
      }

      res.status(201).json(newInteraction);
    } catch (error) {
      console.error("Error recording interaction:", error);
      res.status(500).json({ message: "Failed to record interaction" });
    }
  });

  // Get verses by emotion
  app.get("/api/verses/:emotion", async (req, res) => {
    try {
      const emotion = req.params.emotion;
      
      // Validate emotion against database
      const allEmotions = await storage.getAllEmotions();
      const validEmotions = allEmotions.filter(e => e.isActive !== false).map(e => e.name);
      
      if (!validEmotions.includes(emotion)) {
        return res.status(400).json({ 
          message: "Invalid emotion. Must be one of: " + validEmotions.join(", ") 
        });
      }

      const verses = await storage.getVersesByEmotion(emotion as any);
      res.json(verses);
    } catch (error) {
      console.error("Error fetching verses:", error);
      res.status(500).json({ message: "Failed to fetch verses" });
    }
  });

  // Get random verse by emotion
  app.get("/api/verses/:emotion/random", async (req, res) => {
    try {
      const emotion = req.params.emotion;
      
      // Validate emotion against database
      const allEmotions = await storage.getAllEmotions();
      const validEmotions = allEmotions.filter(e => e.isActive !== false).map(e => e.name);
      
      if (!validEmotions.includes(emotion)) {
        return res.status(400).json({ 
          message: "Invalid emotion. Must be one of: " + validEmotions.join(", ") 
        });
      }

      const verse = await storage.getRandomVerseByEmotion(emotion as any);
      
      if (!verse) {
        return res.status(404).json({ 
          message: `No verses found for emotion: ${emotion}` 
        });
      }

      // Track interaction for real-time analytics
      const interaction = {
        emotion,
        action: 'verse_drawn',
        verseId: verse.id,
        createdAt: new Date().toISOString()
      };

      // Store interaction
      await storage.recordInteraction(interaction);

      // Broadcast to admin dashboard in real-time
      broadcastToAdmins({
        type: 'new_interaction',
        data: interaction
      });

      // Also broadcast updated stats
      try {
        const stats = await storage.getDashboardStats();
        broadcastToAdmins({
          type: 'stats_update',
          data: stats
        });
      } catch (error) {
        console.error("Error broadcasting stats update:", error);
      }

      res.json(verse);
    } catch (error) {
      console.error("Error fetching random verse:", error);
      res.status(500).json({ message: "Failed to fetch random verse" });
    }
  });

  // Get all verses
  app.get("/api/verses", async (req, res) => {
    try {
      const verses = await storage.getAllVerses();
      res.json(verses);
    } catch (error) {
      console.error("Error fetching all verses:", error);
      res.status(500).json({ message: "Failed to fetch verses" });
    }
  });

  // Get all emotions (public endpoint for main website)
  app.get("/api/emotions", async (req, res) => {
    try {
      const emotions = await storage.getAllEmotions();
      // Filter only active emotions for public consumption
      const activeEmotions = emotions.filter(emotion => emotion.isActive !== false);
      res.json(activeEmotions);
    } catch (error) {
      console.error("Error fetching emotions:", error);
      res.status(500).json({ message: "Failed to fetch emotions" });
    }
  });

  const httpServer = createServer(app);
  
  // Setup WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws, req) => {
    // Check for admin connection via query parameter
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const isAdminConnection = url.searchParams.get('admin') === 'true';
    
    if (isAdminConnection) {
      console.log('Admin WebSocket connection established');
      adminConnections.add(ws);
      
      ws.on('close', () => {
        console.log('Admin WebSocket connection closed');
        adminConnections.delete(ws);
      });
      
      ws.on('error', (error) => {
        console.error('Admin WebSocket error:', error);
        adminConnections.delete(ws);
      });
    } else {
      console.log('Public WebSocket connection established');
      publicConnections.add(ws);
      
      ws.on('close', () => {
        console.log('Public WebSocket connection closed');
        publicConnections.delete(ws);
      });
      
      ws.on('error', (error) => {
        console.error('Public WebSocket error:', error);
        publicConnections.delete(ws);
      });
    }
  });
  
  return httpServer;
}
