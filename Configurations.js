import dotenv from "dotenv";
dotenv.config({ override: true });

// Strip inline # comments that some env injectors leave
const stripEnv = (val, fallback = "") => {
  if (!val) return fallback;
  return val.split("#")[0].trim() || fallback;
};

// Parse a comma-separated env value into a cleaned array
const parseKeys = (envVal, ...placeholders) => {
  if (!envVal) return [];
  return envVal
    .split(",")
    .map((k) => k.trim())
    .filter((k) => k && !placeholders.includes(k));
};

// Pick a random key from a pool
global.pickKey = (keys) => {
  if (!keys || keys.length === 0) return null;
  return keys[Math.floor(Math.random() * keys.length)];
};

let mods = stripEnv(process.env.MODS, "919123764864");
global.owner = mods.split(",").map((s) => s.trim().replace(/[^0-9]/g, "")).filter(Boolean);
global.ownername = stripEnv(process.env.OWNER_NAME, "Parker");
global.botName = stripEnv(process.env.BOT_NAME, "Miles Morales MD");
global.mongodb = stripEnv(process.env.MONGODB, "");
global.sessionId = stripEnv(process.env.SESSION_ID, "miles-session");
global.prefa = stripEnv(process.env.PREFIX, "/");
global.packname = stripEnv(process.env.PACKNAME, "🕷️ Miles Morales MD");
global.author = stripEnv(process.env.AUTHOR, "🕸️ Earth-1610 Brooklyn");
global.port = stripEnv(process.env.PORT, "10000");

// Multi-key pools
global.geminiAPIKeys = parseKeys(
  process.env.GEMINI_API,
  "your-gemini-key",
);
global.openAiAPIKeys = parseKeys(
  process.env.OPENAI_API,
  "sk-...",
);
global.claudeAPIKeys = parseKeys(
  process.env.CLAUDE_API,
  "sk-ant-...",
);
global.tenorAPIKeys = parseKeys(
  process.env.TENOR_API_KEY,
  "your-tenor-key"
);

Object.defineProperty(global, "tenorApiKey", {
  get() {
    return global.pickKey(global.tenorAPIKeys) || "";
  },
  configurable: true,
});

export default {
  botName: global.botName,
  owner: global.owner,
  mongodb: global.mongodb,
  sessionId: global.sessionId,
  prefa: global.prefa,
  packname: global.packname,
  author: global.author,
  port: global.port,
};
