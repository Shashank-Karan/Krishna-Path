import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";
import { verses, admins, emotions, verseInteractions } from "@shared/schema";
import bcrypt from "bcryptjs";
import { versesData } from "./data/verses";

async function setupDatabase() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  console.log("Setting up Supabase database...");
  
  try {
    const sqlClient = neon(process.env.DATABASE_URL);
    const db = drizzle(sqlClient);

    console.log("Testing connection...");
    
    // Test connection
    const testResult = await db.execute(sql`SELECT 1 as test`);
    console.log("Connection successful!");

    // Seed emotions first
    console.log("Setting up emotions...");
    const defaultEmotions = [
      { name: "happy", displayName: "Happy", description: "Feeling joyful and content", color: "#F59E0B", icon: "😊", emoji: "😊", sortOrder: 1 },
      { name: "peace", displayName: "Peace", description: "Seeking inner calm and tranquility", color: "#3B82F6", icon: "🕊️", emoji: "🕊️", sortOrder: 2 },
      { name: "anxious", displayName: "Anxious", description: "Feeling worried or nervous", color: "#F97316", icon: "😰", emoji: "😰", sortOrder: 3 },
      { name: "angry", displayName: "Angry", description: "Experiencing frustration or anger", color: "#EF4444", icon: "😠", emoji: "😠", sortOrder: 4 },
      { name: "sad", displayName: "Sad", description: "Feeling down or sorrowful", color: "#8B5CF6", icon: "😢", emoji: "😢", sortOrder: 5 },
      { name: "protection", displayName: "Protection", description: "Seeking divine guidance and safety", color: "#10B981", icon: "🛡️", emoji: "🛡️", sortOrder: 6 },
      { name: "lazy", displayName: "Lazy", description: "Feeling unmotivated or lethargic", color: "#6B7280", icon: "😴", emoji: "😴", sortOrder: 7 },
      { name: "lonely", displayName: "Lonely", description: "Feeling isolated or disconnected", color: "#EC4899", icon: "😞", emoji: "😞", sortOrder: 8 }
    ];

    for (const emotion of defaultEmotions) {
      try {
        await db.insert(emotions).values(emotion);
        console.log(`Added emotion: ${emotion.name}`);
      } catch (error) {
        console.log(`Emotion ${emotion.name} already exists, skipping...`);
      }
    }

    // Seed verses
    console.log("Setting up verses...");
    for (const verse of versesData) {
      try {
        await db.insert(verses).values({
          id: verse.id,
          emotion: verse.emotion,
          sanskrit: verse.sanskrit,
          hindi: verse.hindi,
          english: verse.english,
          explanation: verse.explanation,
          chapter: verse.chapter,
          isActive: true
        });
        console.log(`Added verse: ${verse.id}`);
      } catch (error) {
        console.log(`Verse ${verse.id} already exists, skipping...`);
      }
    }

    // Create default admin
    console.log("Setting up default admin...");
    try {
      const passwordHash = await bcrypt.hash("admin123", 10);
      await db.insert(admins).values({
        username: "admin",
        email: "admin@krishnapath.com",
        passwordHash,
        role: "admin"
      });
      console.log("Default admin created (username: admin, password: admin123)");
    } catch (error) {
      console.log("Default admin already exists, skipping...");
    }

    console.log("Database setup completed successfully!");
    
  } catch (error) {
    console.error("Database setup failed:", error);
    console.log("\nPossible issues:");
    console.log("1. Check if your Supabase project is active");
    console.log("2. Verify the DATABASE_URL is correct");
    console.log("3. Ensure your Supabase project has the required permissions");
    
    process.exit(1);
  }
}

setupDatabase();