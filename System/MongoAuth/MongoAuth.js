import fs from "fs";
import path from "path";
import { useMultiFileAuthState } from "@whiskeysockets/baileys";
import mongoose from "mongoose";

const SESSION_BASE_DIR = path.join(process.cwd(), "Session");

// Mongoose schema for optional cloud MongoDB session storage
const sessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  data: { type: Object, default: {} },
  updatedAt: { type: Date, default: Date.now },
});

let SessionModel;
try {
  SessionModel = mongoose.model("MilesSession", sessionSchema);
} catch (e) {
  // Already compiled
}

export default class MongoAuth {
  constructor(sessionId) {
    this.sessionId = sessionId || "miles-session";
    this.dir = path.join(SESSION_BASE_DIR, this.sessionId);
    fs.mkdirSync(this.dir, { recursive: true });
  }

  async getAuthState() {
    const isMongoConnected = mongoose.connection.readyState === 1;

    // If MongoDB is connected and local session is empty, attempt to restore from MongoDB
    if (isMongoConnected && SessionModel) {
      try {
        const files = fs.readdirSync(this.dir);
        if (files.length === 0) {
          const cloudSession = await SessionModel.findOne({ sessionId: this.sessionId });
          if (cloudSession && cloudSession.data) {
            for (const [filename, content] of Object.entries(cloudSession.data)) {
              fs.writeFileSync(path.join(this.dir, filename), Buffer.from(content, "base64"));
            }
            console.log(`[ SPIDER-BOT ] Restored session from MongoDB cloud`);
          }
        }
      } catch (err) {
        console.warn(`[ SPIDER-BOT ] Could not sync from MongoDB: ${err.message}`);
      }
    }

    // Standard Baileys multi-file auth
    return await useMultiFileAuthState(this.dir);
  }

  async pushToMongoDB() {
    const isMongoConnected = mongoose.connection.readyState === 1;
    if (!isMongoConnected || !SessionModel) return;

    try {
      const files = fs.readdirSync(this.dir);
      const data = {};
      for (const file of files) {
        const content = fs.readFileSync(path.join(this.dir, file));
        data[file] = content.toString("base64");
      }
      await SessionModel.findOneAndUpdate(
        { sessionId: this.sessionId },
        { $set: { data, updatedAt: new Date() } },
        { upsert: true }
      );
    } catch (err) {
      console.warn(`[ SPIDER-BOT ] MongoDB session backup failed: ${err.message}`);
    }
  }
}
