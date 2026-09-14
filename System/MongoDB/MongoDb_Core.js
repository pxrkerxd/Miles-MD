import mongoose from "mongoose";
import fs from "fs";
import path from "path";

// In-Memory cache for super-fast lookups
const userCache = new Map();
const groupCache = new Map();
let sysCache = null;

// Local JSON fallback store when MongoDB is not connected
const LOCAL_DB_FILE = path.join(process.cwd(), "System", "local_storage.json");

const loadLocalData = () => {
  try {
    if (fs.existsSync(LOCAL_DB_FILE)) {
      return JSON.parse(fs.readFileSync(LOCAL_DB_FILE, "utf-8"));
    }
  } catch (e) {}
  return { users: {}, groups: {}, system: { botMode: "public", charId: "0" }, plugins: [] };
};

const saveLocalData = (data) => {
  try {
    fs.mkdirSync(path.dirname(LOCAL_DB_FILE), { recursive: true });
    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {}
};

let localData = loadLocalData();

const isMongoActive = () => mongoose.connection.readyState === 1;

// --- Mongoose Schemas (when MongoDB is active) ---
const userSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  ban: { type: Boolean, default: false },
  role: { type: String, default: "User" },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  tokens: { type: Number, default: 100 },
  lastDaily: { type: Date, default: null },
  warnings: { type: Number, default: 0 },
});

const groupSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  antilink: { type: Boolean, default: false },
  antidelete: { type: Boolean, default: false },
  autosticker: { type: Boolean, default: false },
  switchWelcome: { type: Boolean, default: false },
  chatBot: { type: Boolean, default: false },
  bangroup: { type: Boolean, default: false },
  nsfw: { type: Boolean, default: false },
});

const systemSchema = new mongoose.Schema({
  botMode: { type: String, default: "public" },
  charId: { type: String, default: "0" },
  pmChatbot: { type: Boolean, default: false },
});

const pluginSchema = new mongoose.Schema({
  plugin: { type: String, unique: true, required: true },
  url: { type: String, required: true },
});

let userData, groupData, systemData, pluginData;

try {
  userData = mongoose.model("MilesUser", userSchema);
  groupData = mongoose.model("MilesGroup", groupSchema);
  systemData = mongoose.model("MilesSystem", systemSchema);
  pluginData = mongoose.model("MilesPlugin", pluginSchema);
} catch (e) {
  // Models already compiled or not yet ready
}

// ==================== USER FUNCTIONS ====================

export async function banUser(userId) {
  userCache.set(userId, { ...(userCache.get(userId) || {}), ban: true });
  if (isMongoActive() && userData) {
    await userData.findOneAndUpdate({ id: userId }, { $set: { ban: true } }, { upsert: true });
  } else {
    localData.users[userId] = { ...(localData.users[userId] || {}), ban: true };
    saveLocalData(localData);
  }
}

export async function checkBan(userId) {
  if (userCache.has(userId) && userCache.get(userId).ban !== undefined) {
    return userCache.get(userId).ban;
  }
  if (isMongoActive() && userData) {
    const u = await userData.findOne({ id: userId });
    const ban = u?.ban || false;
    userCache.set(userId, { ...(userCache.get(userId) || {}), ban });
    return ban;
  }
  return localData.users[userId]?.ban || false;
}

export async function unbanUser(userId) {
  userCache.set(userId, { ...(userCache.get(userId) || {}), ban: false });
  if (isMongoActive() && userData) {
    await userData.findOneAndUpdate({ id: userId }, { $set: { ban: false } }, { upsert: true });
  } else {
    localData.users[userId] = { ...(localData.users[userId] || {}), ban: false };
    saveLocalData(localData);
  }
}

export async function addMod(userId) {
  userCache.set(userId, { ...(userCache.get(userId) || {}), role: "Mod" });
  if (isMongoActive() && userData) {
    await userData.findOneAndUpdate({ id: userId }, { $set: { role: "Mod" } }, { upsert: true });
  } else {
    localData.users[userId] = { ...(localData.users[userId] || {}), role: "Mod" };
    saveLocalData(localData);
  }
}

export async function checkMod(userId) {
  if (userCache.has(userId) && userCache.get(userId).role !== undefined) {
    return userCache.get(userId).role === "Mod";
  }
  if (isMongoActive() && userData) {
    const u = await userData.findOne({ id: userId });
    const isM = u?.role === "Mod";
    userCache.set(userId, { ...(userCache.get(userId) || {}), role: u?.role || "User" });
    return isM;
  }
  return localData.users[userId]?.role === "Mod";
}

export async function delMod(userId) {
  userCache.set(userId, { ...(userCache.get(userId) || {}), role: "User" });
  if (isMongoActive() && userData) {
    await userData.findOneAndUpdate({ id: userId }, { $set: { role: "User" } }, { upsert: true });
  } else {
    localData.users[userId] = { ...(localData.users[userId] || {}), role: "User" };
    saveLocalData(localData);
  }
}

// ==================== SYSTEM & CHARACTER FUNCTIONS ====================

export async function setChar(charId) {
  sysCache = { ...(sysCache || {}), charId: String(charId) };
  if (isMongoActive() && systemData) {
    await systemData.findOneAndUpdate({}, { $set: { charId: String(charId) } }, { upsert: true });
  } else {
    localData.system.charId = String(charId);
    saveLocalData(localData);
  }
}

export async function getChar() {
  if (sysCache?.charId) return sysCache.charId;
  if (isMongoActive() && systemData) {
    const s = await systemData.findOne({});
    const charId = s?.charId || "0";
    sysCache = { ...(sysCache || {}), charId };
    return charId;
  }
  return localData.system?.charId || "0";
}

export async function setBotMode(mode) {
  sysCache = { ...(sysCache || {}), botMode: mode };
  if (isMongoActive() && systemData) {
    await systemData.findOneAndUpdate({}, { $set: { botMode: mode } }, { upsert: true });
  } else {
    localData.system.botMode = mode;
    saveLocalData(localData);
  }
}

export async function getBotMode() {
  if (sysCache?.botMode) return sysCache.botMode;
  if (isMongoActive() && systemData) {
    const s = await systemData.findOne({});
    const botMode = s?.botMode || "public";
    sysCache = { ...(sysCache || {}), botMode };
    return botMode;
  }
  return localData.system?.botMode || "public";
}

export async function activateChatBot() {
  sysCache = { ...(sysCache || {}), pmChatbot: true };
  if (isMongoActive() && systemData) {
    await systemData.findOneAndUpdate({}, { $set: { pmChatbot: true } }, { upsert: true });
  } else {
    localData.system.pmChatbot = true;
    saveLocalData(localData);
  }
}

export async function deactivateChatBot() {
  sysCache = { ...(sysCache || {}), pmChatbot: false };
  if (isMongoActive() && systemData) {
    await systemData.findOneAndUpdate({}, { $set: { pmChatbot: false } }, { upsert: true });
  } else {
    localData.system.pmChatbot = false;
    saveLocalData(localData);
  }
}

export async function checkPmChatbot() {
  if (sysCache?.pmChatbot !== undefined) return sysCache.pmChatbot;
  if (isMongoActive() && systemData) {
    const s = await systemData.findOne({});
    const active = s?.pmChatbot || false;
    sysCache = { ...(sysCache || {}), pmChatbot: active };
    return active;
  }
  return localData.system?.pmChatbot || false;
}

// ==================== GROUP FUNCTIONS ====================

const getGroupProp = async (groupId, prop) => {
  if (groupCache.has(groupId) && groupCache.get(groupId)[prop] !== undefined) {
    return groupCache.get(groupId)[prop];
  }
  if (isMongoActive() && groupData) {
    const g = await groupData.findOne({ id: groupId });
    const val = g?.[prop] || false;
    groupCache.set(groupId, { ...(groupCache.get(groupId) || {}), [prop]: val });
    return val;
  }
  return localData.groups[groupId]?.[prop] || false;
};

const setGroupProp = async (groupId, prop, val) => {
  groupCache.set(groupId, { ...(groupCache.get(groupId) || {}), [prop]: val });
  if (isMongoActive() && groupData) {
    await groupData.findOneAndUpdate({ id: groupId }, { $set: { [prop]: val } }, { upsert: true });
  } else {
    localData.groups[groupId] = { ...(localData.groups[groupId] || {}), [prop]: val };
    saveLocalData(localData);
  }
};

export const setAntilink = (gId) => setGroupProp(gId, "antilink", true);
export const checkAntilink = (gId) => getGroupProp(gId, "antilink");
export const delAntilink = (gId) => setGroupProp(gId, "antilink", false);

export const setWelcome = (gId) => setGroupProp(gId, "switchWelcome", true);
export const checkWelcome = (gId) => getGroupProp(gId, "switchWelcome");
export const delWelcome = (gId) => setGroupProp(gId, "switchWelcome", false);

export const setGroupChatbot = (gId) => setGroupProp(gId, "chatBot", true);
export const checkGroupChatbot = (gId) => getGroupProp(gId, "chatBot");
export const delGroupChatbot = (gId) => setGroupProp(gId, "chatBot", false);

export const banGroup = (gId) => setGroupProp(gId, "bangroup", true);
export const checkBanGroup = (gId) => getGroupProp(gId, "bangroup");
export const unbanGroup = (gId) => setGroupProp(gId, "bangroup", false);

export const setAntidelete = (gId) => setGroupProp(gId, "antidelete", true);
export const checkAntidelete = (gId) => getGroupProp(gId, "antidelete");
export const delAntidelete = (gId) => setGroupProp(gId, "antidelete", false);

export const setAutosticker = (gId) => setGroupProp(gId, "autosticker", true);
export const checkAutosticker = (gId) => getGroupProp(gId, "autosticker");
export const delAutosticker = (gId) => setGroupProp(gId, "autosticker", false);

export const setNSFW = (gId) => setGroupProp(gId, "nsfw", true);
export const checkNSFW = (gId) => getGroupProp(gId, "nsfw");
export const delNSFW = (gId) => setGroupProp(gId, "nsfw", false);

// ==================== SPIDER-VERSE RPG & LEVELING ====================

export async function getUserRPG(userId) {
  if (isMongoActive() && userData) {
    let u = await userData.findOne({ id: userId });
    if (!u) u = await userData.create({ id: userId, xp: 0, level: 1, tokens: 100 });
    return {
      xp: u.xp || 0,
      level: u.level || 1,
      tokens: u.tokens || 100,
      lastDaily: u.lastDaily,
      warnings: u.warnings || 0,
    };
  }
  const u = localData.users[userId] || { xp: 0, level: 1, tokens: 100, warnings: 0 };
  return {
    xp: u.xp || 0,
    level: u.level || 1,
    tokens: u.tokens || 100,
    lastDaily: u.lastDaily || null,
    warnings: u.warnings || 0,
  };
}

export async function addXP(userId, xpAmount = 15) {
  const current = await getUserRPG(userId);
  const newXP = (current.xp || 0) + xpAmount;
  // Calculate level based on XP formula (XP required = level * 100)
  let newLevel = Math.max(1, Math.floor(Math.sqrt(newXP / 25)) + 1);
  const leveledUp = newLevel > current.level;

  if (isMongoActive() && userData) {
    await userData.findOneAndUpdate(
      { id: userId },
      { $set: { xp: newXP, level: newLevel } },
      { upsert: true }
    );
  } else {
    localData.users[userId] = {
      ...(localData.users[userId] || {}),
      xp: newXP,
      level: newLevel,
    };
    saveLocalData(localData);
  }

  return { newXP, newLevel, leveledUp };
}

export async function claimDaily(userId) {
  const current = await getUserRPG(userId);
  const now = new Date();
  if (current.lastDaily) {
    const last = new Date(current.lastDaily);
    const diffHours = (now.getTime() - last.getTime()) / (1000 * 60 * 60);
    if (diffHours < 24) {
      const waitHours = Math.ceil(24 - diffHours);
      return { success: false, waitHours };
    }
  }

  const bonusTokens = 500;
  const bonusXP = 200;
  const newTokens = (current.tokens || 100) + bonusTokens;
  const { newXP, newLevel, leveledUp } = await addXP(userId, bonusXP);

  if (isMongoActive() && userData) {
    await userData.findOneAndUpdate(
      { id: userId },
      { $set: { tokens: newTokens, lastDaily: now } },
      { upsert: true }
    );
  } else {
    localData.users[userId] = {
      ...(localData.users[userId] || {}),
      tokens: newTokens,
      lastDaily: now,
    };
    saveLocalData(localData);
  }

  return { success: true, bonusTokens, bonusXP, newTokens, newXP, newLevel, leveledUp };
}

export async function getLeaderboard(limit = 10) {
  if (isMongoActive() && userData) {
    const top = await userData.find({}).sort({ xp: -1 }).limit(limit);
    return top.map((u) => ({
      id: u.id,
      xp: u.xp || 0,
      level: u.level || 1,
      tokens: u.tokens || 100,
    }));
  }

  const all = Object.entries(localData.users).map(([id, u]) => ({
    id,
    xp: u.xp || 0,
    level: u.level || 1,
    tokens: u.tokens || 100,
  }));
  return all.sort((a, b) => b.xp - a.xp).slice(0, limit);
}

// ==================== WARNING SYSTEM ====================

export async function addWarn(userId) {
  const current = await getUserRPG(userId);
  const newWarns = (current.warnings || 0) + 1;
  if (isMongoActive() && userData) {
    await userData.findOneAndUpdate({ id: userId }, { $set: { warnings: newWarns } }, { upsert: true });
  } else {
    localData.users[userId] = { ...(localData.users[userId] || {}), warnings: newWarns };
    saveLocalData(localData);
  }
  return newWarns;
}

export async function resetWarn(userId) {
  if (isMongoActive() && userData) {
    await userData.findOneAndUpdate({ id: userId }, { $set: { warnings: 0 } }, { upsert: true });
  } else {
    localData.users[userId] = { ...(localData.users[userId] || {}), warnings: 0 };
    saveLocalData(localData);
  }
}

export async function getWarn(userId) {
  const current = await getUserRPG(userId);
  return current.warnings || 0;
}

// ==================== PLUGIN & CACHE MANAGEMENT ====================

export async function pushPlugin(plugin, url) {
  if (isMongoActive() && pluginData) {
    await pluginData.create({ plugin, url });
  } else {
    localData.plugins.push({ plugin, url });
    saveLocalData(localData);
  }
}

export async function isPluginPresent(pluginName) {
  if (isMongoActive() && pluginData) {
    const p = await pluginData.findOne({ plugin: pluginName });
    return Boolean(p);
  }
  return localData.plugins.some((p) => p.plugin === pluginName);
}

export async function delPlugin(pluginName) {
  if (isMongoActive() && pluginData) {
    await pluginData.deleteOne({ plugin: pluginName });
  } else {
    localData.plugins = localData.plugins.filter((p) => p.plugin !== pluginName);
    saveLocalData(localData);
  }
}

export async function getAllPlugins() {
  if (isMongoActive() && pluginData) {
    return pluginData.find({}, { plugin: 1, url: 1 });
  }
  return localData.plugins;
}

export function clearUserCache(userId) {
  if (userId) userCache.delete(userId);
  else userCache.clear();
}

export function clearGroupCache(groupId) {
  if (groupId) groupCache.delete(groupId);
  else groupCache.clear();
}

export function clearSystemCache() {
  sysCache = null;
}
