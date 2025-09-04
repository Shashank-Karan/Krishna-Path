import type { 
  Verse, 
  InsertVerse, 
  Emotion, 
  Admin, 
  InsertAdmin, 
  VerseInteraction, 
  InsertVerseInteraction,
  EmotionStats,
  InsertEmotionStats,
  EmotionRecord,
  InsertEmotion
} from "@shared/schema";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { verses, emotions, admins, verseInteractions, emotionStats } from "@shared/schema";
import { eq, desc, and, gte, lte, asc } from "drizzle-orm";
import { versesData } from "./data/verses";
import bcrypt from "bcryptjs";
import { IStorage } from "./storage";

export class PostgresStorage implements IStorage {
  private db: any;

  constructor() {
    this.initialize();
  }

  private initialize() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl || databaseUrl === '') {
      console.error('DATABASE_URL environment variable is not set or empty');
      console.error('Available DATABASE_URL value:', process.env.DATABASE_URL);
      throw new Error('DATABASE_URL is required for PostgreSQL storage');
    }
    
    console.log('Connecting to PostgreSQL with DATABASE_URL...', 
                databaseUrl.length > 30 ? databaseUrl.substring(0, 30) + '...' : '[short URL]');
    
    try {
      const sql = neon(databaseUrl);
      this.db = drizzle(sql);
      
      // Initialize database in the background
      this.initializeDatabase();
    } catch (error) {
      console.error('Failed to initialize PostgreSQL connection:', error);
      throw error;
    }
  }

  private async initializeDatabase() {
    console.log("Initializing Supabase PostgreSQL database...");
    
    // Add a delay to let the server start properly
    setTimeout(async () => {
      try {
        // Check if verses exist, if not, seed the database
        const existingVerses = await this.db.select().from(verses).limit(1);
        
        if (existingVerses.length === 0) {
          await this.seedVerses();
        }

        // Check if emotions exist, if not, seed them
        const existingEmotions = await this.db.select().from(emotions).limit(1);
        
        if (existingEmotions.length === 0) {
          await this.seedEmotions();
        }

        // Check if default admin exists, if not, create one
        const existingAdmins = await this.db.select().from(admins).limit(1);
        
        if (existingAdmins.length === 0) {
          await this.createDefaultAdmin();
        }
        
        console.log("Supabase PostgreSQL database initialized successfully!");
      } catch (error) {
        console.error("Error initializing Supabase database:", error);
        console.log("Database may need to be created - try running db:push first");
      }
    }, 2000);
  }

  private async testConnection() {
    try {
      const result = await this.db.select({ test: sql`1` });
      console.log("Supabase connection test successful");
      return true;
    } catch (error) {
      console.error("Supabase connection test failed:", error);
      throw error;
    }
  }

  private async createTables() {
    console.log("Skipping manual table creation - Drizzle will handle this");
    // Tables will be created automatically by Drizzle schema when first query runs
    return;
  }

  private async seedVerses() {
    console.log("Seeding verses...");
    
    // Simple test verses to ensure basic functionality works
    const testVerses = [
      {
        emotion: "happy",
        sanskrit: "योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय।",
        hindi: "हे अर्जुन! आसक्ति को त्यागकर योग में स्थित हुआ कर्तव्य कर्मों को कर।",
        english: "Perform your duty equipoised, O Arjuna, abandoning all attachment to success or failure.",
        explanation: "When you feel happy, use this positive energy mindfully. True happiness comes from performing your duties without attachment to results.",
        chapter: "Bhagavad Gita 2.48",
        isActive: true
      },
      {
        emotion: "peace",
        sanskrit: "प्रशान्तमनसं ह्येनं योगिनं सुखमुत्तमम्।",
        hindi: "शांत मन वाले योगी को उत्तम सुख प्राप्त होता है।",
        english: "The yogi whose mind is peaceful attains the highest bliss.",
        explanation: "True peace is found in inner calm and spiritual connection. Seek stillness within.",
        chapter: "Bhagavad Gita 6.27",
        isActive: true
      },
      {
        emotion: "anxious", 
        sanskrit: "सुखदुःखे समे कृत्वा लाभालाभौ जयाजयौ।",
        hindi: "सुख-दुःख, लाभ-हानि को समान समझकर कर्म कर।",
        english: "Treating pleasure and pain, gain and loss, victory and defeat alike, engage in action.",
        explanation: "When anxious, remember that all experiences are temporary. Maintain equanimity.",
        chapter: "Bhagavad Gita 2.38",
        isActive: true
      }
    ];
    
    for (const verse of testVerses) {
      try {
        await this.db.insert(verses).values(verse);
        console.log(`Seeded verse for emotion: ${verse.emotion}`);
      } catch (error) {
        console.log(`Verse for ${verse.emotion} might already exist, skipping...`);
      }
    }
    
    console.log(`Attempted to seed ${testVerses.length} test verses`);
  }

  private async seedEmotions() {
    console.log("Seeding emotions...");
    const initialEmotions = [
      {
        name: "happy",
        displayName: "Happy",
        description: "Feeling joyful, content, and full of positive energy",
        color: "#F59E0B",
        icon: "😊",
        emoji: "😊",
        sortOrder: 1
      },
      {
        name: "peace",
        displayName: "Peace",
        description: "Seeking inner calm, tranquility, and serenity",
        color: "#3B82F6",
        icon: "🕊️",
        emoji: "🕊️",
        sortOrder: 2
      },
      {
        name: "anxious",
        displayName: "Anxious",
        description: "Feeling worried, nervous, or uncertain about the future",
        color: "#F97316",
        icon: "😰",
        emoji: "😰",
        sortOrder: 3
      },
      {
        name: "angry",
        displayName: "Angry",
        description: "Experiencing frustration, irritation, or strong displeasure",
        color: "#EF4444",
        icon: "😠",
        emoji: "😠",
        sortOrder: 4
      },
      {
        name: "sad",
        displayName: "Sad",
        description: "Feeling down, sorrowful, or experiencing grief",
        color: "#8B5CF6",
        icon: "😢",
        emoji: "😢",
        sortOrder: 5
      },
      {
        name: "protection",
        displayName: "Protection",
        description: "Seeking divine guidance, safety, and spiritual shelter",
        color: "#10B981",
        icon: "🛡️",
        emoji: "🛡️",
        sortOrder: 6
      },
      {
        name: "lazy",
        displayName: "Lazy",
        description: "Feeling unmotivated, lethargic, or lacking energy",
        color: "#6B7280",
        icon: "😴",
        emoji: "😴",
        sortOrder: 7
      },
      {
        name: "lonely",
        displayName: "Lonely",
        description: "Feeling isolated, disconnected, or in need of companionship",
        color: "#EC4899",
        icon: "😞",
        emoji: "😞",
        sortOrder: 8
      }
    ];

    for (const emotion of initialEmotions) {
      await this.db.insert(emotions).values(emotion);
    }
    
    console.log(`Seeded ${initialEmotions.length} emotions`);
  }

  private async createDefaultAdmin() {
    console.log("Creating default admin...");
    const defaultAdmin = {
      username: 'admin',
      email: 'admin@krishnapath.com',
      passwordHash: await bcrypt.hash('admin123', 12),
      role: 'admin' as const,
      isActive: true
    };
    
    await this.db.insert(admins).values(defaultAdmin);
    console.log("Default admin created");
  }

  // Verse operations
  async getVersesByEmotion(emotion: Emotion): Promise<Verse[]> {
    return await this.db
      .select()
      .from(verses)
      .where(and(eq(verses.emotion, emotion), eq(verses.isActive, true)))
      .orderBy(verses.createdAt);
  }

  async getRandomVerseByEmotion(emotion: Emotion): Promise<Verse | undefined> {
    const allVerses = await this.getVersesByEmotion(emotion);
    if (allVerses.length === 0) return undefined;
    
    const randomIndex = Math.floor(Math.random() * allVerses.length);
    return allVerses[randomIndex];
  }

  async getAllVerses(): Promise<Verse[]> {
    return await this.db
      .select()
      .from(verses)
      .where(eq(verses.isActive, true))
      .orderBy(desc(verses.createdAt));
  }

  async getAllVersesForAdmin(): Promise<Verse[]> {
    return await this.db
      .select()
      .from(verses)
      .orderBy(desc(verses.updatedAt));
  }

  // Admin verse management
  async createVerse(verse: InsertVerse): Promise<Verse> {
    const [newVerse] = await this.db.insert(verses).values(verse).returning();
    return newVerse;
  }

  async updateVerse(id: string, verse: Partial<InsertVerse>): Promise<Verse | undefined> {
    const [updatedVerse] = await this.db
      .update(verses)
      .set({ ...verse, updatedAt: new Date() })
      .where(eq(verses.id, id))
      .returning();
    
    return updatedVerse;
  }

  async deleteVerse(id: string): Promise<boolean> {
    const [updatedVerse] = await this.db
      .update(verses)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(verses.id, id))
      .returning();
    
    return !!updatedVerse;
  }

  async getVerseById(id: string): Promise<Verse | undefined> {
    const [verse] = await this.db.select().from(verses).where(eq(verses.id, id)).limit(1);
    return verse?.isActive ? verse : undefined;
  }

  // Admin authentication
  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const hashedPassword = await bcrypt.hash(admin.passwordHash, 12);
    const [newAdmin] = await this.db
      .insert(admins)
      .values({
        ...admin,
        passwordHash: hashedPassword
      })
      .returning();
    
    return newAdmin;
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const [admin] = await this.db
      .select()
      .from(admins)
      .where(and(eq(admins.username, username), eq(admins.isActive, true)))
      .limit(1);
    
    return admin;
  }

  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    const [admin] = await this.db
      .select()
      .from(admins)
      .where(and(eq(admins.email, email), eq(admins.isActive, true)))
      .limit(1);
    
    return admin;
  }

  async verifyAdminPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  async updateAdminLastLogin(id: string): Promise<void> {
    await this.db
      .update(admins)
      .set({ lastLoginAt: new Date() })
      .where(eq(admins.id, id));
  }

  // Emotion management
  async getAllEmotions(): Promise<EmotionRecord[]> {
    return await this.db
      .select()
      .from(emotions)
      .where(eq(emotions.isActive, true))
      .orderBy(asc(emotions.sortOrder));
  }

  async getEmotionById(id: string): Promise<EmotionRecord | undefined> {
    const [emotion] = await this.db
      .select()
      .from(emotions)
      .where(eq(emotions.id, id))
      .limit(1);
    
    return emotion?.isActive ? emotion : undefined;
  }

  async getEmotionByName(name: string): Promise<EmotionRecord | undefined> {
    const [emotion] = await this.db
      .select()
      .from(emotions)
      .where(and(eq(emotions.name, name), eq(emotions.isActive, true)))
      .limit(1);
    
    return emotion;
  }

  async createEmotion(emotion: InsertEmotion): Promise<EmotionRecord> {
    const [newEmotion] = await this.db.insert(emotions).values(emotion).returning();
    return newEmotion;
  }

  async updateEmotion(id: string, emotion: Partial<InsertEmotion>): Promise<EmotionRecord | undefined> {
    const [updatedEmotion] = await this.db
      .update(emotions)
      .set({ ...emotion, updatedAt: new Date() })
      .where(eq(emotions.id, id))
      .returning();
    
    return updatedEmotion;
  }

  async deleteEmotion(id: string): Promise<boolean> {
    const [updatedEmotion] = await this.db
      .update(emotions)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(emotions.id, id))
      .returning();
    
    return !!updatedEmotion;
  }

  // Analytics and interactions
  async recordInteraction(interaction: InsertVerseInteraction): Promise<VerseInteraction> {
    const [newInteraction] = await this.db
      .insert(verseInteractions)
      .values(interaction)
      .returning();
    
    return newInteraction;
  }

  async getEmotionStats(startDate?: Date, endDate?: Date): Promise<EmotionStats[]> {
    let query = this.db.select().from(emotionStats);
    
    if (startDate && endDate) {
      query = query.where(and(
        gte(emotionStats.date, startDate),
        lte(emotionStats.date, endDate)
      ));
    }
    
    return await query.orderBy(desc(emotionStats.date));
  }

  async getVerseInteractions(limit: number = 100): Promise<VerseInteraction[]> {
    return await this.db
      .select()
      .from(verseInteractions)
      .orderBy(desc(verseInteractions.createdAt))
      .limit(limit);
  }

  async getDashboardStats(): Promise<{
    totalVerses: number;
    totalInteractions: number;
    popularEmotions: { emotion: string; count: number }[];
    recentInteractions: VerseInteraction[];
  }> {
    const allVerses = await this.db.select().from(verses);
    const totalVerses = allVerses.length;
    
    const allInteractions = await this.db.select().from(verseInteractions);
    const totalInteractions = allInteractions.length;
    
    // Calculate popular emotions
    const emotionCounts: Record<string, number> = {};
    allInteractions.forEach((interaction: VerseInteraction) => {
      emotionCounts[interaction.emotion] = (emotionCounts[interaction.emotion] || 0) + 1;
    });
    
    const popularEmotions = Object.entries(emotionCounts)
      .map(([emotion, count]) => ({ emotion, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    const recentInteractions = await this.getVerseInteractions(10);
    
    return {
      totalVerses,
      totalInteractions,
      popularEmotions,
      recentInteractions
    };
  }
}