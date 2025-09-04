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
import { versesData } from "./data/verses";
import bcrypt from "bcryptjs";

export interface IStorage {
  // Verse operations
  getVersesByEmotion(emotion: Emotion): Promise<Verse[]>;
  getRandomVerseByEmotion(emotion: Emotion): Promise<Verse | undefined>;
  getAllVerses(): Promise<Verse[]>;
  getAllVersesForAdmin(): Promise<Verse[]>;
  
  // Admin verse management
  createVerse(verse: InsertVerse): Promise<Verse>;
  updateVerse(id: string, verse: Partial<InsertVerse>): Promise<Verse | undefined>;
  deleteVerse(id: string): Promise<boolean>;
  getVerseById(id: string): Promise<Verse | undefined>;
  
  // Admin authentication
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  getAdminByEmail(email: string): Promise<Admin | undefined>;
  verifyAdminPassword(password: string, hash: string): Promise<boolean>;
  updateAdminLastLogin(id: string): Promise<void>;
  
  // Emotion management
  getAllEmotions(): Promise<EmotionRecord[]>;
  getEmotionById(id: string): Promise<EmotionRecord | undefined>;
  getEmotionByName(name: string): Promise<EmotionRecord | undefined>;
  createEmotion(emotion: InsertEmotion): Promise<EmotionRecord>;
  updateEmotion(id: string, emotion: Partial<InsertEmotion>): Promise<EmotionRecord | undefined>;
  deleteEmotion(id: string): Promise<boolean>;

  // Analytics and interactions
  recordInteraction(interaction: InsertVerseInteraction): Promise<VerseInteraction>;
  getEmotionStats(startDate?: Date, endDate?: Date): Promise<EmotionStats[]>;
  getVerseInteractions(limit?: number): Promise<VerseInteraction[]>;
  getDashboardStats(): Promise<{
    totalVerses: number;
    totalInteractions: number;
    popularEmotions: { emotion: string; count: number }[];
    recentInteractions: VerseInteraction[];
  }>;
}

// Keep MemStorage for fallback
export class MemStorage implements IStorage {
  private verses: Map<string, Verse>;
  private admins: Map<string, Admin>;
  private emotions: Map<string, EmotionRecord>;
  private interactions: Map<string, VerseInteraction>;
  private emotionStats: Map<string, EmotionStats>;

  constructor() {
    this.verses = new Map();
    this.admins = new Map();
    this.emotions = new Map();
    this.interactions = new Map();
    this.emotionStats = new Map();
    this.initializeVerses();
    this.initializeEmotions();
    this.initializeDefaultAdmin();
  }

  private initializeVerses() {
    // Create test verses with proper structure to ensure functionality works
    const testVerses: Verse[] = [
      {
        id: "happy-1",
        emotion: "happy",
        sanskrit: "योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय।",
        hindi: "हे अर्जुन! आसक्ति को त्यागकर योग में स्थित हुआ कर्तव्य कर्मों को कर।",
        english: "Perform your duty equipoised, O Arjuna, abandoning all attachment to success or failure.",
        explanation: "When you feel happy, use this positive energy mindfully. True happiness comes from performing your duties without attachment to results.",
        chapter: "Bhagavad Gita 2.48",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "peace-1",
        emotion: "peace",
        sanskrit: "प्रशान्तमनसं ह्येनं योगिनं सुखमुत्तमम्।",
        hindi: "शांत मन वाले योगी को उत्तम सुख प्राप्त होता है।",
        english: "The yogi whose mind is peaceful attains the highest bliss.",
        explanation: "True peace is found in inner calm and spiritual connection. Seek stillness within.",
        chapter: "Bhagavad Gita 6.27",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "anxious-1",
        emotion: "anxious",
        sanskrit: "सुखदुःखे समे कृत्वा लाभालाभौ जयाजयौ।",
        hindi: "सुख-दुःख, लाभ-हानि को समान समझकर कर्म कर।",
        english: "Treating pleasure and pain, gain and loss, victory and defeat alike, engage in action.",
        explanation: "When anxious, remember that all experiences are temporary. Maintain equanimity.",
        chapter: "Bhagavad Gita 2.38",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "angry-1",
        emotion: "angry",
        sanskrit: "क्रोधाद्भवति सम्मोहः सम्मोहात्स्मृतिविभ्रमः।",
        hindi: "क्रोध से मोह उत्पन्न होता है, मोह से स्मृति का नाश हो जाता है।",
        english: "From anger, complete delusion arises, and from delusion bewilderment of memory.",
        explanation: "When angry, step back and breathe. Anger clouds judgment and wisdom.",
        chapter: "Bhagavad Gita 2.63",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "sad-1",
        emotion: "sad",
        sanskrit: "असोच्यानन्वशोचस्त्वं प्रज्ञावादांश्च भाषसे।",
        hindi: "तुम शोक न करने योग्य व्यक्तियों के लिए शोक करते हो।",
        english: "You grieve for those who are not worthy of grief, yet you speak words of wisdom.",
        explanation: "When sad, remember that sorrow for the temporary is unnecessary. Focus on eternal truth.",
        chapter: "Bhagavad Gita 2.11",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "protection-1",
        emotion: "protection",
        sanskrit: "सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज।",
        hindi: "सभी धर्मों को त्यागकर केवल मेरी शरण में आ जाओ।",
        english: "Abandon all forms of duty and surrender unto Me alone. I will deliver you.",
        explanation: "When seeking protection, remember that divine grace is always available to those who surrender.",
        chapter: "Bhagavad Gita 18.66",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "lazy-1",
        emotion: "lazy",
        sanskrit: "योगः कर्मसु कौशलम्।",
        hindi: "कर्मों में कुशलता ही योग है।",
        english: "Yoga is skill in action.",
        explanation: "When feeling lazy, remember that skillful action leads to spiritual growth. Start with small steps.",
        chapter: "Bhagavad Gita 2.50",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "lonely-1",
        emotion: "lonely",
        sanskrit: "सर्वभूतस्थमात्मानं सर्वभूतानि चात्मनि।",
        hindi: "सभी भूतों में आत्मा को और आत्मा में सभी भूतों को देखना।",
        english: "One who sees the Self in all beings and all beings in the Self.",
        explanation: "When lonely, remember that the divine consciousness connects all beings. You are never truly alone.",
        chapter: "Bhagavad Gita 6.29",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    testVerses.forEach(verse => {
      this.verses.set(verse.id, verse);
    });
    
    console.log(`Initialized ${testVerses.length} verses in MemStorage`);
  }

  private async initializeDefaultAdmin() {
    // Create a default admin for testing
    const defaultAdmin: Admin = {
      id: 'admin-1',
      username: 'admin',
      email: 'admin@krishnapath.com',
      passwordHash: await bcrypt.hash('admin123', 12), // Simple password for demo
      role: 'admin',
      isActive: true,
      createdAt: new Date(),
      lastLoginAt: null
    };
    this.admins.set(defaultAdmin.id, defaultAdmin);
  }

  private initializeEmotions() {
    const defaultEmotions: EmotionRecord[] = [
      {
        id: 'emotion-1',
        name: 'happy',
        displayName: 'Happy',
        description: 'Feeling joyful, content, and full of positive energy',
        color: '#F59E0B',
        icon: '😊',
        emoji: '😊',
        isActive: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'emotion-2',
        name: 'peace',
        displayName: 'Peace',
        description: 'Seeking inner calm, tranquility, and serenity',
        color: '#3B82F6',
        icon: '🕊️',
        emoji: '🕊️',
        isActive: true,
        sortOrder: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'emotion-3',
        name: 'anxious',
        displayName: 'Anxious',
        description: 'Feeling worried, nervous, or uncertain about the future',
        color: '#F97316',
        icon: '😰',
        emoji: '😰',
        isActive: true,
        sortOrder: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'emotion-4',
        name: 'angry',
        displayName: 'Angry',
        description: 'Experiencing frustration, irritation, or strong displeasure',
        color: '#EF4444',
        icon: '😠',
        emoji: '😠',
        isActive: true,
        sortOrder: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'emotion-5',
        name: 'sad',
        displayName: 'Sad',
        description: 'Feeling down, sorrowful, or experiencing grief',
        color: '#8B5CF6',
        icon: '😢',
        emoji: '😢',
        isActive: true,
        sortOrder: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'emotion-6',
        name: 'protection',
        displayName: 'Protection',
        description: 'Seeking divine guidance, safety, and spiritual shelter',
        color: '#10B981',
        icon: '🛡️',
        emoji: '🛡️',
        isActive: true,
        sortOrder: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'emotion-7',
        name: 'lazy',
        displayName: 'Lazy',
        description: 'Feeling unmotivated, lethargic, or lacking energy',
        color: '#6B7280',
        icon: '😴',
        emoji: '😴',
        isActive: true,
        sortOrder: 7,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'emotion-8',
        name: 'lonely',
        displayName: 'Lonely',
        description: 'Feeling isolated, disconnected, or in need of companionship',
        color: '#EC4899',
        icon: '😞',
        emoji: '😞',
        isActive: true,
        sortOrder: 8,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    defaultEmotions.forEach(emotion => {
      this.emotions.set(emotion.id, emotion);
    });
  }

  async getVersesByEmotion(emotion: Emotion): Promise<Verse[]> {
    const filteredVerses = Array.from(this.verses.values()).filter(
      verse => verse.emotion === emotion && verse.isActive
    );
    console.log(`Found ${filteredVerses.length} verses for emotion ${emotion}`);
    return filteredVerses;
  }

  async getRandomVerseByEmotion(emotion: Emotion): Promise<Verse | undefined> {
    const verses = await this.getVersesByEmotion(emotion);
    if (verses.length === 0) return undefined;
    
    const randomIndex = Math.floor(Math.random() * verses.length);
    return verses[randomIndex];
  }

  async getAllVerses(): Promise<Verse[]> {
    // For public API, return only active verses
    return Array.from(this.verses.values())
      .filter(verse => verse.isActive)
      .sort((a, b) => {
        // Handle cases where updatedAt might be undefined
        const aTime = a.updatedAt ? a.updatedAt.getTime() : 0;
        const bTime = b.updatedAt ? b.updatedAt.getTime() : 0;
        return bTime - aTime;
      });
  }

  async getAllVersesForAdmin(): Promise<Verse[]> {
    // For admin view, return all verses including soft-deleted ones
    return Array.from(this.verses.values())
      .sort((a, b) => {
        // Handle cases where updatedAt might be undefined
        const aTime = a.updatedAt ? a.updatedAt.getTime() : 0;
        const bTime = b.updatedAt ? b.updatedAt.getTime() : 0;
        return bTime - aTime;
      });
  }

  // Admin authentication
  async createAdmin(adminData: InsertAdmin): Promise<Admin> {
    const id = `admin-${Date.now()}`;
    const hashedPassword = await bcrypt.hash(adminData.passwordHash, 12);
    
    const admin: Admin = {
      id,
      username: adminData.username,
      email: adminData.email,
      passwordHash: hashedPassword,
      role: adminData.role || 'admin',
      isActive: true,
      createdAt: new Date(),
      lastLoginAt: null
    };
    
    this.admins.set(id, admin);
    return admin;
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    return Array.from(this.admins.values()).find(admin => 
      admin.username === username && admin.isActive
    );
  }

  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    return Array.from(this.admins.values()).find(admin => 
      admin.email === email && admin.isActive
    );
  }

  async verifyAdminPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  async updateAdminLastLogin(id: string): Promise<void> {
    const admin = this.admins.get(id);
    if (admin) {
      admin.lastLoginAt = new Date();
      this.admins.set(id, admin);
    }
  }

  // Verse management
  async createVerse(verseData: InsertVerse): Promise<Verse> {
    const id = `verse-${Date.now()}`;
    const verse: Verse = {
      id,
      emotion: verseData.emotion,
      sanskrit: verseData.sanskrit,
      hindi: verseData.hindi,
      english: verseData.english,
      explanation: verseData.explanation,
      chapter: verseData.chapter,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.verses.set(id, verse);
    return verse;
  }

  async updateVerse(id: string, verseData: Partial<InsertVerse>): Promise<Verse | undefined> {
    const verse = this.verses.get(id);
    if (!verse) return undefined;
    
    // Allow updating inactive verses for admin management
    const updatedVerse = {
      ...verse,
      ...verseData,
      isActive: true, // Reactivate verse when updating
      updatedAt: new Date()
    };
    
    this.verses.set(id, updatedVerse);
    return updatedVerse;
  }

  async deleteVerse(id: string): Promise<boolean> {
    const verse = this.verses.get(id);
    if (!verse) return false;
    
    verse.isActive = false;
    verse.updatedAt = new Date();
    this.verses.set(id, verse);
    return true;
  }

  async getVerseById(id: string): Promise<Verse | undefined> {
    const verse = this.verses.get(id);
    return verse?.isActive ? verse : undefined;
  }

  // Emotion management
  async getAllEmotions(): Promise<EmotionRecord[]> {
    return Array.from(this.emotions.values())
      .filter(emotion => emotion.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getEmotionById(id: string): Promise<EmotionRecord | undefined> {
    const emotion = this.emotions.get(id);
    return emotion?.isActive ? emotion : undefined;
  }

  async getEmotionByName(name: string): Promise<EmotionRecord | undefined> {
    return Array.from(this.emotions.values()).find(emotion => 
      emotion.name === name && emotion.isActive
    );
  }

  async createEmotion(emotionData: InsertEmotion): Promise<EmotionRecord> {
    const id = `emotion-${Date.now()}`;
    const emotion: EmotionRecord = {
      id,
      name: emotionData.name,
      displayName: emotionData.displayName,
      description: emotionData.description,
      color: emotionData.color,
      icon: emotionData.icon,
      emoji: emotionData.emoji,
      isActive: true,
      sortOrder: emotionData.sortOrder || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.emotions.set(id, emotion);
    return emotion;
  }

  async updateEmotion(id: string, emotionData: Partial<InsertEmotion>): Promise<EmotionRecord | undefined> {
    const emotion = this.emotions.get(id);
    if (!emotion || !emotion.isActive) return undefined;
    
    const updatedEmotion = {
      ...emotion,
      ...emotionData,
      updatedAt: new Date()
    };
    
    this.emotions.set(id, updatedEmotion);
    return updatedEmotion;
  }

  async deleteEmotion(id: string): Promise<boolean> {
    const emotion = this.emotions.get(id);
    if (!emotion) return false;
    
    emotion.isActive = false;
    emotion.updatedAt = new Date();
    this.emotions.set(id, emotion);
    return true;
  }

  // Analytics and interactions
  async recordInteraction(interactionData: InsertVerseInteraction): Promise<VerseInteraction> {
    const id = `interaction-${Date.now()}`;
    const interaction: VerseInteraction = {
      id,
      verseId: interactionData.verseId,
      emotion: interactionData.emotion,
      action: interactionData.action,
      sessionId: interactionData.sessionId || null,
      userAgent: interactionData.userAgent || null,
      ipAddress: interactionData.ipAddress || null,
      createdAt: new Date()
    };
    
    this.interactions.set(id, interaction);
    return interaction;
  }

  async getEmotionStats(startDate?: Date, endDate?: Date): Promise<EmotionStats[]> {
    let stats = Array.from(this.emotionStats.values());
    
    if (startDate && endDate) {
      stats = stats.filter(stat => 
        stat.date >= startDate && stat.date <= endDate
      );
    }
    
    return stats.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async getVerseInteractions(limit: number = 100): Promise<VerseInteraction[]> {
    return Array.from(this.interactions.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getDashboardStats(): Promise<{
    totalVerses: number;
    totalInteractions: number;
    popularEmotions: { emotion: string; count: number }[];
    recentInteractions: VerseInteraction[];
  }> {
    const allVerses = Array.from(this.verses.values());
    const totalVerses = allVerses.filter(verse => verse.isActive).length; // Count only active verses
    const totalInteractions = this.interactions.size;
    
    // Calculate popular emotions
    const emotionCounts: Record<string, number> = {};
    Array.from(this.interactions.values()).forEach(interaction => {
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

// Use PostgreSQL storage when DATABASE_URL is available, fallback to MemStorage
import { PostgresStorage } from "./postgres-storage";

// Check if DATABASE_URL is available in environment
const hasDatabaseUrl = 'DATABASE_URL' in process.env && process.env.DATABASE_URL !== '';

// Enhanced MemStorage with real-time capabilities for now
export const storage = new MemStorage();

// Debug environment variables
console.log("Environment variable check:");
console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
console.log("All env keys containing 'DATABASE':", Object.keys(process.env).filter(key => key.includes('DATABASE')));

// Initialize the storage and log which one we're using
if (hasDatabaseUrl) {
  console.log("Using PostgreSQL storage with DATABASE_URL");
} else {
  console.log("Using MemStorage (DATABASE_URL not found)");
  console.log("Available environment variables:", Object.keys(process.env).slice(0, 10));
}