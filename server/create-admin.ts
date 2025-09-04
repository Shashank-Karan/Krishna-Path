import { storage } from "./storage";

async function createInitialAdmin() {
  try {
    const adminData = {
      username: "admin",
      email: "admin@krishnapath.com",
      passwordHash: "admin123", // This will be hashed automatically by the storage
      role: "admin"
    };

    const admin = await storage.createAdmin(adminData);
    console.log("Initial admin created successfully:", {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role
    });
  } catch (error) {
    console.error("Error creating admin:", error);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  createInitialAdmin().then(() => process.exit(0));
}