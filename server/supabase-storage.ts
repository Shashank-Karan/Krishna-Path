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
// Supabase import will be done conditionally inside the class
import { versesData } from "./data/verses";
import bcrypt from "bcryptjs";
import { IStorage } from "./storage";

export class SupabaseStorage implements IStorage {
  private supabase: any;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    await this.initializeSupabase();
    await this.initializeDatabase();
  }

  private async initializeSupabase() {
    const { createClient } = await import('@supabase/supabase-js');
    
    if (!process.env.SUPABASE_URL) {
      throw new Error('SUPABASE_URL is required');
    }
    
    if (!process.env.SUPABASE_ANON_KEY) {
      throw new Error('SUPABASE_ANON_KEY is required');
    }
    
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );
  }

  private async initializeDatabase() {
    console.log("Initializing Supabase database...");
    
    // Create tables if they don't exist
    await this.createTables();
    
    // Check if verses exist, if not, seed the database
    const { data: existingVerses } = await this.supabase
      .from('verses')
      .select('id')
      .limit(1);
    
    if (!existingVerses || existingVerses.length === 0) {
      await this.seedVerses();
    }

    // Check if emotions exist, if not, seed them
    const { data: existingEmotions } = await this.supabase
      .from('emotions')
      .select('id')
      .limit(1);
    
    if (!existingEmotions || existingEmotions.length === 0) {
      await this.seedEmotions();
    }
    
    console.log("Supabase database initialized successfully!");
  }

  private async createTables() {
    const tables = [
      {
        name: 'verses',
        sql: `
          CREATE TABLE IF NOT EXISTS verses (
            id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
            emotion TEXT NOT NULL,
            sanskrit TEXT NOT NULL,
            hindi TEXT NOT NULL,
            english TEXT NOT NULL,
            explanation TEXT NOT NULL,
            chapter TEXT NOT NULL,
            is_active BOOLEAN DEFAULT true NOT NULL,
            created_at TIMESTAMP DEFAULT NOW() NOT NULL,
            updated_at TIMESTAMP DEFAULT NOW() NOT NULL
          );
        `
      },
      {
        name: 'admins',
        sql: `
          CREATE TABLE IF NOT EXISTS admins (
            id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
            username TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'admin' NOT NULL,
            is_active BOOLEAN DEFAULT true NOT NULL,
            created_at TIMESTAMP DEFAULT NOW() NOT NULL,
            last_login_at TIMESTAMP
          );
        `
      },
      {
        name: 'emotions',
        sql: `
          CREATE TABLE IF NOT EXISTS emotions (
            id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL UNIQUE,
            display_name TEXT NOT NULL,
            description TEXT NOT NULL,
            color TEXT NOT NULL,
            icon TEXT NOT NULL,
            emoji TEXT NOT NULL,
            is_active BOOLEAN DEFAULT true NOT NULL,
            sort_order INTEGER DEFAULT 0 NOT NULL,
            created_at TIMESTAMP DEFAULT NOW() NOT NULL,
            updated_at TIMESTAMP DEFAULT NOW() NOT NULL
          );
        `
      },
      {
        name: 'verse_interactions',
        sql: `
          CREATE TABLE IF NOT EXISTS verse_interactions (
            id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
            verse_id VARCHAR NOT NULL,
            emotion TEXT NOT NULL,
            action TEXT NOT NULL,
            session_id TEXT,
            user_agent TEXT,
            ip_address TEXT,
            created_at TIMESTAMP DEFAULT NOW() NOT NULL
          );
        `
      },
      {
        name: 'emotion_stats',
        sql: `
          CREATE TABLE IF NOT EXISTS emotion_stats (
            id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
            emotion TEXT NOT NULL,
            date TIMESTAMP NOT NULL,
            view_count INTEGER DEFAULT 0 NOT NULL,
            share_count INTEGER DEFAULT 0 NOT NULL,
            total_interactions INTEGER DEFAULT 0 NOT NULL
          );
        `
      }
    ];

    for (const table of tables) {
      try {
        const { error } = await this.supabase.rpc('exec_sql', { sql: table.sql });
        if (error) {
          console.log(`Table ${table.name} might already exist or there was an issue:`, error.message);
        }
      } catch (error) {
        console.log(`Could not create table ${table.name}:`, error);
      }
    }
  }

  private async seedVerses() {
    const allVerses = Object.values(versesData).flat();
    for (const verse of allVerses) {
      const { error } = await this.supabase
        .from('verses')
        .insert({
          id: verse.id,
          emotion: verse.emotion,
          sanskrit: verse.sanskrit,
          hindi: verse.hindi,
          english: verse.english,
          explanation: verse.explanation,
          chapter: verse.chapter,
        });
      
      if (error && !error.message.includes('duplicate')) {
        console.error('Error seeding verse:', error);
      }
    }
  }

  private async seedEmotions() {
    const initialEmotions = [
      {
        name: "happy",
        display_name: "Happy",
        description: "Feeling joyful, content, and full of positive energy",
        color: "#F59E0B",
        icon: "😊",
        emoji: "😊",
        sort_order: 1
      },
      {
        name: "peace",
        display_name: "Peace",
        description: "Seeking inner calm, tranquility, and serenity",
        color: "#3B82F6",
        icon: "🕊️",
        emoji: "🕊️",
        sort_order: 2
      },
      {
        name: "anxious",
        display_name: "Anxious",
        description: "Feeling worried, nervous, or uncertain about the future",
        color: "#F97316",
        icon: "😰",
        emoji: "😰",
        sort_order: 3
      },
      {
        name: "angry",
        display_name: "Angry",
        description: "Experiencing frustration, irritation, or strong displeasure",
        color: "#EF4444",
        icon: "😠",
        emoji: "😠",
        sort_order: 4
      },
      {
        name: "sad",
        display_name: "Sad",
        description: "Feeling down, sorrowful, or experiencing grief",
        color: "#8B5CF6",
        icon: "😢",
        emoji: "😢",
        sort_order: 5
      },
      {
        name: "protection",
        display_name: "Protection",
        description: "Seeking divine guidance, safety, and spiritual shelter",
        color: "#10B981",
        icon: "🛡️",
        emoji: "🛡️",
        sort_order: 6
      },
      {
        name: "lazy",
        display_name: "Lazy",
        description: "Feeling unmotivated, lethargic, or lacking energy",
        color: "#6B7280",
        icon: "😴",
        emoji: "😴",
        sort_order: 7
      },
      {
        name: "lonely",
        display_name: "Lonely",
        description: "Feeling isolated, disconnected, or in need of companionship",
        color: "#EC4899",
        icon: "😞",
        emoji: "😞",
        sort_order: 8
      }
    ];

    for (const emotion of initialEmotions) {
      const { error } = await this.supabase
        .from('emotions')
        .insert(emotion);
      
      if (error && !error.message.includes('duplicate')) {
        console.error('Error seeding emotion:', error);
      }
    }
  }

  // Verse operations
  async getVersesByEmotion(emotion: Emotion): Promise<Verse[]> {
    const { data, error } = await this.supabase
      .from('verses')
      .select('*')
      .eq('emotion', emotion)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching verses by emotion:', error);
      return [];
    }

    return data || [];
  }

  async getRandomVerseByEmotion(emotion: Emotion): Promise<Verse | undefined> {
    const allVerses = await this.getVersesByEmotion(emotion);
    if (allVerses.length === 0) return undefined;
    
    const randomIndex = Math.floor(Math.random() * allVerses.length);
    return allVerses[randomIndex];
  }

  async getAllVerses(): Promise<Verse[]> {
    const { data, error } = await this.supabase
      .from('verses')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all verses:', error);
      return [];
    }

    return data || [];
  }

  async getAllVersesForAdmin(): Promise<Verse[]> {
    const { data, error } = await this.supabase
      .from('verses')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin verses:', error);
      return [];
    }

    return data || [];
  }

  async createVerse(verse: InsertVerse): Promise<Verse> {
    const { data, error } = await this.supabase
      .from('verses')
      .insert(verse)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create verse: ${error.message}`);
    }

    return data;
  }

  async updateVerse(id: string, verseData: Partial<InsertVerse>): Promise<Verse | undefined> {
    const { data, error } = await this.supabase
      .from('verses')
      .update({ 
        ...verseData, 
        is_active: true, // Reactivate verse when updating
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating verse:', error);
      return undefined;
    }

    return data;
  }

  async deleteVerse(id: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('verses')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error deleting verse:', error);
      return false;
    }

    return !!data;
  }

  async getVerseById(id: string): Promise<Verse | undefined> {
    const { data, error } = await this.supabase
      .from('verses')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching verse by ID:', error);
      return undefined;
    }

    return data;
  }

  // Admin authentication
  async createAdmin(adminData: InsertAdmin): Promise<Admin> {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(adminData.passwordHash, saltRounds);
    
    const { data, error } = await this.supabase
      .from('admins')
      .insert({
        ...adminData,
        password_hash: hashedPassword,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create admin: ${error.message}`);
    }

    return data;
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const { data, error } = await this.supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .single();

    if (error) {
      return undefined;
    }

    return data;
  }

  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    const { data, error } = await this.supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (error) {
      return undefined;
    }

    return data;
  }

  async verifyAdminPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  async updateAdminLastLogin(id: string): Promise<void> {
    await this.supabase
      .from('admins')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', id);
  }

  // Emotion management
  async getAllEmotions(): Promise<EmotionRecord[]> {
    const { data, error } = await this.supabase
      .from('emotions')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching emotions:', error);
      return [];
    }

    return data || [];
  }

  async getEmotionById(id: string): Promise<EmotionRecord | undefined> {
    const { data, error } = await this.supabase
      .from('emotions')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      return undefined;
    }

    return data;
  }

  async getEmotionByName(name: string): Promise<EmotionRecord | undefined> {
    const { data, error } = await this.supabase
      .from('emotions')
      .select('*')
      .eq('name', name)
      .eq('is_active', true)
      .single();

    if (error) {
      return undefined;
    }

    return data;
  }

  async createEmotion(emotionData: InsertEmotion): Promise<EmotionRecord> {
    const { data, error } = await this.supabase
      .from('emotions')
      .insert(emotionData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create emotion: ${error.message}`);
    }

    return data;
  }

  async updateEmotion(id: string, emotionData: Partial<InsertEmotion>): Promise<EmotionRecord | undefined> {
    const { data, error } = await this.supabase
      .from('emotions')
      .update({ ...emotionData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating emotion:', error);
      return undefined;
    }

    return data;
  }

  async deleteEmotion(id: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('emotions')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error deleting emotion:', error);
      return false;
    }

    return !!data;
  }

  // Analytics and interactions
  async recordInteraction(interaction: InsertVerseInteraction): Promise<VerseInteraction> {
    const { data, error } = await this.supabase
      .from('verse_interactions')
      .insert(interaction)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to record interaction: ${error.message}`);
    }

    return data;
  }

  async getEmotionStats(startDate?: Date, endDate?: Date): Promise<EmotionStats[]> {
    let query = this.supabase
      .from('emotion_stats')
      .select('*');

    if (startDate && endDate) {
      query = query
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString());
    }

    const { data, error } = await query
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching emotion stats:', error);
      return [];
    }

    return data || [];
  }

  async getVerseInteractions(limit: number = 100): Promise<VerseInteraction[]> {
    const { data, error } = await this.supabase
      .from('verse_interactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching verse interactions:', error);
      return [];
    }

    return data || [];
  }

  async getDashboardStats() {
    // Get total verses count
    const { count: totalVerses } = await this.supabase
      .from('verses')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Get total interactions count
    const { count: totalInteractions } = await this.supabase
      .from('verse_interactions')
      .select('*', { count: 'exact', head: true });

    // Get popular emotions
    const { data: popularEmotionsData } = await this.supabase
      .from('verse_interactions')
      .select('emotion')
      .limit(1000); // Get recent interactions to calculate popular emotions

    const emotionCounts: Record<string, number> = {};
    popularEmotionsData?.forEach((interaction: any) => {
      emotionCounts[interaction.emotion] = (emotionCounts[interaction.emotion] || 0) + 1;
    });

    const popularEmotions = Object.entries(emotionCounts)
      .map(([emotion, count]) => ({ emotion, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Get recent interactions
    const recentInteractions = await this.getVerseInteractions(10);

    return {
      totalVerses: totalVerses || 0,
      totalInteractions: totalInteractions || 0,
      popularEmotions,
      recentInteractions,
    };
  }
}