import "./Configurations.js";
import "./System/BotCharacters.js";
import express from "express";
import qrcode from "qrcode";
import qrcodeTerminal from "qrcode-terminal";
import chalk from "chalk";
import pino from "pino";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import {
  default as makeWASocket,
  DisconnectReason,
  fetchLatestBaileysVersion,
  jidNormalizedUser,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";

import { readcommands, commands } from "./System/ReadCommands.js";
import Core from "./Core.js";
import MongoAuth from "./System/MongoAuth/MongoAuth.js";
import {
  checkWelcome,
  getGroupSettings,
  updateGroupSetting,
  setChar,
  getChar,
  getBotMode,
  setBotMode,
} from "./System/MongoDB/MongoDb_Core.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Suppress noisy harmless libsignal decryption errors and session logs ---
const isNoisyLibsignalLog = (args) => {
  const msg = args
    .map((a) => (typeof a === "object" && a !== null ? (a.stack || a.message || JSON.stringify(a)) : String(a)))
    .join(" ");
  return (
    msg.includes("Failed to decrypt message with any known session") ||
    msg.includes("MessageCounterError") ||
    msg.includes("Bad MAC") ||
    msg.includes("Key used already or never filled") ||
    msg.includes("Closing session: SessionEntry") ||
    msg.includes("Closing open session in favor of incoming prekey bundle") ||
    msg.includes("No matching sessions found for message")
  );
};

const originalConsoleError = console.error;
console.error = (...args) => {
  if (isNoisyLibsignalLog(args)) return;
  originalConsoleError(...args);
};

const originalConsoleLog = console.log;
console.log = (...args) => {
  if (isNoisyLibsignalLog(args)) return;
  originalConsoleLog(...args);
};

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", express.static(path.join(__dirname, "Frontend")));

let SpiderSocket = null;
let status = "initializing";
let QR_CODE_RAW = null;
let reconnectAttempts = 0;

const PORT = parseInt(global.port || "10000", 10);

// --- Spider-Verse Banner ---
const printBanner = () => {
  console.log(chalk.red.bold(`
  ███╗   ███╗██╗██╗     ███████╗███████╗    ██████╗  ██████╗ ████████╗
  ████╗ ████║██║██║     ██╔════╝██╔════╝    ██╔══██╗██╔═══██╗╚══██╔══╝
  ██╔████╔██║██║██║     █████╗  ███████╗    ██████╔╝██║   ██║   ██║   
  ██║╚██╔╝██║██║██║     ██╔══╝  ╚════██║    ██╔══██╗██║   ██║   ██║   
  ██║ ╚═╝ ██║██║███████╗███████╗███████║    ██████╔╝╚██████╔╝   ██║   
  ╚═╝     ╚═╝╚═╝╚══════╝╚══════╝╚══════╝    ╚═════╝  ╚═════╝    ╚═╝   
  🕷️  MILES MORALES MD - EARTH-1610 SPIDER-VERSE WHATSAPP BOT  🕸️
  `));
};

// --- Optional MongoDB Connection ---
if (global.mongodb && global.mongodb.trim() !== "") {
  mongoose
    .connect(global.mongodb)
    .then(() => console.log(chalk.green(`[ SPIDER-BOT ] Connected to MongoDB Cloud`)))
    .catch((err) =>
      console.warn(chalk.yellow(`[ SPIDER-BOT ] MongoDB offline, using Local Storage: ${err.message}`))
    );
} else {
  console.log(chalk.blue(`[ SPIDER-BOT ] Running in Local Auth Mode (./Session)`));
}

// --- Start Bot Connection ---
async function startSpiderBot() {
  printBanner();
  await readcommands();
  console.log(chalk.cyan(`[ SPIDER-BOT ] Loaded ${commands.size} command suites.`));

  const mongoAuth = new MongoAuth(global.sessionId);
  const { state, saveCreds } = await mongoAuth.getAuthState();
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(chalk.gray(`[ SPIDER-BOT ] Using Baileys v${version.join(".")} (Latest: ${isLatest})`));

  status = "connecting";

  SpiderSocket = makeWASocket({
    version,
    logger: pino({ level: "silent" }),
    auth: state,
    browser: ["Ubuntu", "Chrome", "20.0.04"],
    syncFullHistory: false,
    generateHighQualityLinkPreview: true,
    keepAliveIntervalMs: 25000,
  });

  const rawSendMessage = SpiderSocket.sendMessage.bind(SpiderSocket);
  SpiderSocket.sendMessage = async (jid, content, ...args) => {
    if (content && typeof content === "object" && typeof content.text === "string") {
      const textMentions = [...content.text.matchAll(/@([0-9]{5,16})/g)].map(
        (v) => v[1] + "@s.whatsapp.net"
      );
      if (textMentions.length > 0) {
        content.mentions = Array.from(
          new Set([...(content.mentions || []), ...textMentions])
        );
      }
    }
    return rawSendMessage(jid, content, ...args);
  };

  global.contactNames = global.contactNames || new Map();

  SpiderSocket.ev.on("contacts.update", (updates) => {
    for (const contact of updates) {
      if (contact.id && (contact.notify || contact.name || contact.verifiedName)) {
        const name = contact.notify || contact.name || contact.verifiedName;
        const clean = jidNormalizedUser(contact.id);
        global.contactNames.set(clean, name);
        global.contactNames.set(clean.split("@")[0], name);
      }
    }
  });

  SpiderSocket.ev.on("contacts.upsert", (contacts) => {
    for (const contact of contacts) {
      if (contact.id && (contact.notify || contact.name || contact.verifiedName)) {
        const name = contact.notify || contact.name || contact.verifiedName;
        const clean = jidNormalizedUser(contact.id);
        global.contactNames.set(clean, name);
        global.contactNames.set(clean.split("@")[0], name);
      }
    }
  });

  SpiderSocket.ev.on("creds.update", async () => {
    await saveCreds();
    await mongoAuth.pushToMongoDB();
  });

  SpiderSocket.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      QR_CODE_RAW = qr;
      status = "qr";
      console.log(chalk.yellow(`\n[ SPIDER-BOT ] QR Code ready! Scan with WhatsApp or use Web Dashboard:\n`));
      try {
        qrcodeTerminal.generate(qr, { small: true });
      } catch (e) {}
    }

    if (connection === "connecting") {
      status = "connecting";
    }

    if (connection === "open") {
      status = "open";
      QR_CODE_RAW = null;
      reconnectAttempts = 0;
      console.log(
        chalk.green.bold(`\n🕸️ [ SPIDER-BOT ONLINE ] Successfully connected to WhatsApp! Let's swing! 🕷️\n`)
      );
    }

    if (connection === "close") {
      status = "closed";
      const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;
      const isLoggedOut = statusCode === DisconnectReason.loggedOut || statusCode === 401;
      const shouldReconnect = !isLoggedOut;

      console.log(
        chalk.red(`[ SPIDER-BOT ] Connection closed. Reason: ${statusCode || "Unknown"}. Reconnecting: ${shouldReconnect}`)
      );

      if (isLoggedOut) {
        console.log(chalk.red.bold(`[ SPIDER-BOT ] Session expired or logged out. Auto-clearing ./Session...`));
        try {
          const sessionDir = path.join(process.cwd(), "Session", global.sessionId);
          if (fs.existsSync(sessionDir)) {
            fs.rmSync(sessionDir, { recursive: true, force: true });
          }
        } catch (e) {}
        console.log(chalk.yellow(`[ SPIDER-BOT ] Session reset! Restarting fresh in 3s...`));
        setTimeout(() => startSpiderBot(), 3000);
      } else if (shouldReconnect) {
        reconnectAttempts++;
        const delay = Math.min(reconnectAttempts * 3000, 15000);
        setTimeout(() => startSpiderBot(), delay);
      }
    }
  });

  // Handle incoming messages
  SpiderSocket.ev.on("messages.upsert", async (chatUpdate) => {
    try {
      if (chatUpdate.type !== "notify") return;
      for (let rawMessage of chatUpdate.messages) {
        if (!rawMessage.message) continue;

        const serialized = serialize(SpiderSocket, rawMessage);
        await Core(SpiderSocket, serialized, commands, chatUpdate);
      }
    } catch (err) {
      console.error(chalk.red("[ MESSAGES UPSERT ERROR ]"), err);
    }
  });

  // Handle group join/leave events
  SpiderSocket.ev.on("group-participants.update", async (update) => {
    try {
      const { id, participants, action } = update;
      const welcomeActive = await checkWelcome(id);
      if (!welcomeActive) return;

      for (const num of participants) {
        const userJid = jidNormalizedUser(num);
        if (action === "add") {
          await SpiderSocket.sendMessage(id, {
            text: `🕷️ *Welcome to the Spider-Verse!* Welcome @${userJid.split("@")[0]} to the chat! Stay sharp and do your own thing!`,
            mentions: [userJid],
          });
        } else if (action === "remove") {
          await SpiderSocket.sendMessage(id, {
            text: `🕸️ Looks like @${userJid.split("@")[0]} jumped through a multiverse portal. Goodbye!`,
            mentions: [userJid],
          });
        }
      }
    } catch (e) {}
  });

  return SpiderSocket;
}

// --- In-Memory System Event Logs ---
const systemLogs = [
  {
    id: "init-1",
    timestamp: new Date().toLocaleTimeString(),
    type: "system",
    message: `Spider-Verse Dashboard initialized on port ${PORT}`,
  },
  {
    id: "init-2",
    timestamp: new Date().toLocaleTimeString(),
    type: "auth",
    message: `Session ID: ${global.sessionId || "miles-session"} | Auth mode: ${global.mongodb ? "MongoDB Cloud" : "Local Disk"}`,
  },
];

const addSystemLog = (type, message) => {
  const entry = {
    id: Date.now() + "-" + Math.random().toString(36).substring(2, 7),
    timestamp: new Date().toLocaleTimeString(),
    type,
    message: typeof message === "object" ? JSON.stringify(message) : String(message),
  };
  systemLogs.push(entry);
  if (systemLogs.length > 200) systemLogs.shift();
};
global.addSystemLog = addSystemLog;

// --- Web Dashboard API Endpoints ---

app.get("/api/status", (req, res) => {
  const upSec = Math.floor(process.uptime());
  const upH = Math.floor(upSec / 3600);
  const upM = Math.floor((upSec % 3600) / 60);
  const upS = upSec % 60;

  res.json({
    botName: global.botName,
    status,
    uptime: `${upH}h ${upM}m ${upS}s`,
    uptimeSeconds: upSec,
    commandsCount: commands.size,
    reconnectAttempts,
    websocketOpen: Boolean(SpiderSocket?.ws?.isOpen),
    prefix: global.prefa || "/",
    ownerName: global.ownername || "Parker",
  });
});

app.get("/api/system", (req, res) => {
  const mem = process.memoryUsage();
  const upSec = Math.floor(process.uptime());
  const totalCmdCount = Array.from(commands.values()).reduce(
    (acc, c) => acc + (c.alias?.length || 1),
    0
  );

  res.json({
    botName: global.botName,
    status,
    uptimeSeconds: upSec,
    memory: {
      heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
      rssMb: Math.round(mem.rss / 1024 / 1024),
      percent: Math.round((mem.heapUsed / mem.heapTotal) * 100),
    },
    system: {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
    },
    bot: {
      ownerName: global.ownername || "Parker",
      prefix: global.prefa || "/",
      packname: global.packname || "Miles Morales MD",
      author: global.author || "Earth-1610",
      sessionId: global.sessionId,
      suitesCount: commands.size,
      totalCommands: totalCmdCount,
      hasGemini: Boolean(global.geminiAPIKeys && global.geminiAPIKeys.length > 0),
      hasMongo: Boolean(global.mongodb && global.mongodb.trim() !== ""),
      wsConnected: Boolean(SpiderSocket?.ws?.isOpen),
    },
  });
});

app.get("/api/commands", (req, res) => {
  const list = [];
  for (const [name, suite] of commands.entries()) {
    list.push({
      name: suite.name || name,
      description: suite.description || "Spider-Verse Suite Command",
      uniquecommands: suite.uniquecommands || [],
      aliases: suite.alias || [],
    });
  }
  res.json({ suites: list, totalSuites: list.length, prefix: global.prefa || "/" });
});

app.get("/api/logs", (req, res) => {
  res.json({ logs: systemLogs });
});

// Visual Group Command Hub: Get all joined groups and their toggle status
app.get("/api/groups", async (req, res) => {
  try {
    const isConnected = status === "open" && Boolean(SpiderSocket);
    let rawGroups = {};

    if (isConnected) {
      try {
        rawGroups = await SpiderSocket.groupFetchAllParticipating();
      } catch (err) {
        console.warn(chalk.yellow(`[ GROUP FETCH WARNING ] ${err.message}`));
      }
    }

    const botJid = SpiderSocket?.user?.id ? jidNormalizedUser(SpiderSocket.user.id) : "";
    const botLid = SpiderSocket?.user?.lid ? jidNormalizedUser(SpiderSocket.user.lid) : "";
    const botNum = botJid ? botJid.split("@")[0].replace(/[^0-9]/g, "") : "";

    const groupList = [];
    for (const [gId, gData] of Object.entries(rawGroups)) {
      const participants = gData.participants || [];
      const botParticipant = participants.find((p) => {
        const pJid = jidNormalizedUser(p.id);
        const pNum = pJid.split("@")[0].replace(/[^0-9]/g, "");
        return (
          (botJid && pJid === botJid) ||
          (botLid && pJid === botLid) ||
          (botNum && pNum === botNum)
        );
      });

      const isBotAdmin = Boolean(
        botParticipant && (botParticipant.admin === "admin" || botParticipant.admin === "superadmin")
      );

      const settings = await getGroupSettings(gId);

      groupList.push({
        id: gId,
        subject: gData.subject || "Spider-Group",
        desc: gData.desc || "",
        creation: gData.creation,
        owner: gData.owner,
        memberCount: participants.length,
        isBotAdmin,
        antilink: settings.antilink,
        welcome: settings.welcome,
        autosticker: settings.autosticker,
        chatbot: settings.chatbot,
        allowed: settings.allowed,
        antidelete: settings.antidelete,
      });
    }

    const currentMode = await getBotMode();
    const currentCharId = await getChar();

    res.json({
      connected: isConnected,
      groups: groupList,
      totalGroups: groupList.length,
      botMode: currentMode,
      charId: currentCharId,
    });
  } catch (err) {
    console.error(chalk.red("[ API GROUPS ERROR ]"), err.message);
    res.status(500).json({ error: err.message, groups: [] });
  }
});

// Visual Group Command Hub: Instant toggle switch endpoint
app.post("/api/group/toggle", async (req, res) => {
  const { groupId, setting, value } = req.body;
  if (!groupId || !setting) {
    return res.status(400).json({ error: "groupId and setting are required." });
  }

  try {
    const result = await updateGroupSetting(groupId, setting, value);
    addSystemLog(
      "system",
      `Group Toggle: ${groupId.substring(0, 15)}... | ${setting} = ${Boolean(value)}`
    );
    res.json(result);
  } catch (err) {
    console.error(chalk.red("[ GROUP TOGGLE ERROR ]"), err.message);
    res.status(500).json({ error: err.message });
  }
});

// Active Persona API
app.get("/api/persona", async (req, res) => {
  const charId = await getChar();
  const currentChar = global[`charID${charId}`] || global.charID0;
  res.json({ charId, persona: currentChar });
});

app.post("/api/set-persona", async (req, res) => {
  const { charId } = req.body;
  if (charId === undefined || charId === null) {
    return res.status(400).json({ error: "charId is required." });
  }
  await setChar(String(charId));
  addSystemLog("system", `Multiverse Persona switched to: [ ${charId} ]`);
  res.json({ success: true, charId: String(charId) });
});

app.get("/api/qr", async (req, res) => {
  if (status === "open") {
    return res.json({ status: "connected" });
  }
  if (!QR_CODE_RAW) {
    return res.json({ status: "waiting" });
  }
  try {
    const qrDataUrl = await qrcode.toDataURL(QR_CODE_RAW);
    return res.json({ status: "qr", qr: qrDataUrl });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
});

app.post("/api/pair", async (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: "Phone number is required." });
  }
  if (status === "open") {
    return res.status(400).json({ error: "Bot is already connected to WhatsApp!" });
  }
  if (!SpiderSocket) {
    return res.status(503).json({ error: "Spider-Bot socket is initializing, please retry in 5 seconds." });
  }
  try {
    const cleaned = phone.replace(/[^0-9]/g, "");
    let code = await SpiderSocket.requestPairingCode(cleaned);
    code = code?.match(/.{1,4}/g)?.join("-") || code;
    console.log(chalk.black.bgCyan(` PAIRING CODE: `), chalk.black.bgYellow(` ${code} `));
    addSystemLog("auth", `Pairing code requested for phone +${cleaned.substring(0, 4)}**** : [ ${code} ]`);
    return res.json({ code });
  } catch (err) {
    console.error(chalk.red("[ PAIRING CODE ERROR ]"), err.message);
    addSystemLog("error", `Pairing request failed: ${err.message}`);
    return res.status(500).json({ error: `Pairing failed: ${err.message}` });
  }
});

// Interactive Chat with Miles Morales API
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Message is required." });
  }

  addSystemLog("ai", `Web Terminal Chat: "${message.substring(0, 60)}"`);

  // 1. If Gemini is available, call Gemini with Miles persona
  const geminiKey = global.pickKey?.(global.geminiAPIKeys);
  if (geminiKey) {
    try {
      const { GoogleGenAI } = await import("@google/genai");
      const { getGeminiConfig, GEMINI_MODEL } = await import("./System/__system_prompt.js");
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL || "gemini-2.5-flash",
        contents: message,
        config: getGeminiConfig(),
      });
      const reply = response.text?.trim();
      if (reply) {
        return res.json({ reply, source: "gemini-ai" });
      }
    } catch (err) {
      console.warn(chalk.yellow(`[ AI CHAT FALLBACK ] ${err.message}`));
    }
  }

  // 2. Authentic Brooklyn Miles Morales Conversational Engine Fallback
  const q = message.toLowerCase().trim();
  let reply = "";

  if (q.includes("who are you") || q.includes("who r u") || q.includes("your name")) {
    reply = "Yo! I'm Miles Morales — your friendly neighborhood Spider-Man swinging straight out of Brooklyn, Earth-1610. What's on your mind?";
  } else if (q.includes("leap of faith")) {
    reply = "That's all it is, man. A leap of faith. You don't know if you're ready until you jump. Trust your instincts and do your own thing!";
  } else if (q.includes("venom") || q.includes("powers")) {
    reply = "Bio-electric venom blast! ⚡ Tap into that static charge and bzzzt — lights out for Kingpin or whoever is testing us. Plus invisibility and classic wall-crawling.";
  } else if (q.includes("gwen") || q.includes("ghost-spider")) {
    reply = "Gwen's from Earth-65! Incredible drummer, sharpest web-swinger in the multiverse, and one of my best friends. We've got that multiverse connection.";
  } else if (q.includes("miguel") || q.includes("2099") || q.includes("canon")) {
    reply = "Miguel is hardcore about 'canon events' in Nueva York. But nah — everyone keeps telling me how my story is supposed to go. I'mma save my people and do my own thing.";
  } else if (q.includes("hobie") || q.includes("punk")) {
    reply = "Hobie Brown! Spider-Punk doesn't believe in consistency or authority. He made his electric guitar out of recycled amps and pure anarchy. Legend.";
  } else if (q.includes("pavitr") || q.includes("chai") || q.includes("india")) {
    reply = "Pavitr Prabhakar from Mumbattan! And whatever you do, DO NOT say 'chai tea' around him. Chai literally means tea, bro! 😂";
  } else if (q.includes("peter b") || q.includes("mentor")) {
    reply = "Peter B. Parker taught me how to swing (and how to eat burgers in sweatpants). He's got Mayday now, which is awesome.";
  } else if (q.includes("music") || q.includes("song") || q.includes("playlist") || q.includes("sunflower")) {
    reply = "Right now? Got *Sunflower* by Post Malone, *Am I Dreaming* by Metro Boomin & A$AP Rocky, and some vintage vinyl on repeat in my headphones. 🎧";
  } else if (q.includes("suit") || q.includes("jordan") || q.includes("shoes")) {
    reply = "Classic black and red suit with spray-painted graffiti spider emblem, paired with Chicago Air Jordan 1s. Pure Brooklyn drip. 👟🕷️";
  } else if (q.includes("help") || q.includes("commands") || q.includes("bot")) {
    const p = global.prefa || "/";
    reply = `You can run all my WhatsApp commands using prefix \`${p}\`. Check the Command Simulator tab right here to test ${p}spidersense, ${p}spidertrivia, ${p}multiverse, or ${p}leapoffaith!`;
  } else {
    const randomMilesQuotes = [
      "Yo, Brooklyn is quiet today, but my Spider-Sense is always locked in. What can I help you cook up?",
      "Ain't no problem we can't solve. Just gotta look at it from upside down while hanging from the ceiling! 🕸️",
      "Stay sharp! Remember: Anyone can wear the mask. It's how you wear it that counts.",
      "Nah, we don't follow everyone else's script here. We do our own thing. What's the plan?",
      "Webs loaded, venom charged, Jordans laced up. Let's get to work!",
    ];
    reply = randomMilesQuotes[Math.floor(Math.random() * randomMilesQuotes.length)];
  }

  return res.json({ reply, source: "spider-core" });
});

// Interactive Command Simulator API
app.post("/api/simulate-cmd", async (req, res) => {
  let { cmd, args } = req.body;
  if (!cmd) return res.status(400).json({ error: "Command name is required." });

  cmd = cmd.replace(/^\//, "").toLowerCase().trim();
  const pref = global.prefa || "/";
  addSystemLog("cmd", `Simulating Command: ${pref}${cmd} ${args || ""}`);

  switch (cmd) {
    case "spidersense": {
      const dangerLevels = [
        { level: "🟢 LOW", msg: "Just a text from Uncle Aaron checking in on homework. All clear." },
        { level: "🟡 MEDIUM", msg: "Spot spotted near the Brooklyn ATM! Be ready to swing." },
        { level: "🔴 CRITICAL", msg: "MIGUEL O'HARA & THE SPIDER-SOCIETY ARE HEADING YOUR WAY! GO INVISIBLE NOW!" },
        { level: "✨ CHILL VIBE", msg: "No threats detected. Just sunset over the Brooklyn Bridge with Metro Boomin in the headphones." },
      ];
      const chosen = dangerLevels[Math.floor(Math.random() * dangerLevels.length)];
      return res.json({
        command: "spidersense",
        reaction: "⚡",
        output: `⚡⚡⚡ **SPIDER-SENSE TINGLING!** ⚡⚡⚡\n\n🎯 **Threat Level:** [ ${chosen.level} ]\n🧠 **Intuition:** ${chosen.msg}\n\n_Stay frosty, Spider-Hero._ 🕸️`,
      });
    }

    case "miles":
    case "intro":
    case "about": {
      return res.json({
        command: "miles",
        reaction: "🕷️",
        output: `╔═══════════════════════════════════╗\n  🕷️ **MILES MORALES MD // EARTH-1610**\n  _"Everyone keeps telling me how my story_\n  _is supposed to go... nah, I'mma do my own thing."_\n╚═══════════════════════════════════╝\n\nYo, what's good! I'm **Miles Morales** — your friendly neighborhood Spider-Man swinging straight out of Brooklyn, Earth-1610. 🕸️\n\n⚡ **Hero Intel:**\n• 👤 **Alias:** Spider-Man / Brooklyn's Own\n• 🧬 **Powers:** Bio-Electric Venom Blast, Camouflage, Wall-Crawling & Spider-Sense\n• 👑 **Bot Architect:** ${global.ownername || "Parker"}\n• 🎧 **Signature Vibe:** Hip-Hop, Spray Paint, Air Jordan 1s & Leap of Faith\n• 🌐 **Universe:** Earth-1610 (Multiverse Connected)`,
      });
    }

    case "spidertrivia":
    case "trivia": {
      const TRIVIA = [
        { q: "What number was on the radioactive spider that bit Miles Morales in Into the Spider-Verse?", a: "Spider #42 (from Alchemax / Earth-42)!" },
        { q: "What song does Miles sing with his headphones on at the beginning of Into the Spider-Verse?", a: "Sunflower by Post Malone & Swae Lee!" },
        { q: "Who is the Prowler on Earth-42?", a: "Miles G. Morales himself!" },
        { q: "What instrument does Gwen Stacy play in her band?", a: "The Drums (in The Mary Janes)!" },
        { q: "Why does Pavitr Prabhakar get mad at Miles about tea?", a: "Because Miles called it 'Chai tea' — Chai means tea, bro!" },
        { q: "What is Hobie Brown's electric weapon of choice?", a: "His custom electric bass guitar!" },
      ];
      const item = TRIVIA[Math.floor(Math.random() * TRIVIA.length)];
      return res.json({
        command: "spidertrivia",
        reaction: "❓",
        output: `🧠 **SPIDER-VERSE TRIVIA CHALLENGE**\n\n❓ **Question:** ${item.q}\n\n💡 **Answer:** ||${item.a}||`,
      });
    }

    case "spidersuit":
    case "suit": {
      const SUITS = [
        { name: "Classic Black & Red Suit (Earth-1610)", desc: "Crafted with spray paint over Peter's old suit. Features the iconic red graffiti spider emblem." },
        { name: "Across the Spider-Verse Upgraded Suit", desc: "Upgraded sleeker design with bleeding red arm stripes, sharper mask lenses, and venom-conducting fabric." },
        { name: "2020 Cyberpunk Suit", desc: "Futuristic neon LED visor, high-top kicks, and digital soundwave chest display." },
        { name: "Bodega Cat Suit", desc: "Includes a cute ginger cat wearing a Spider-Man mask inside Miles' backpack who jumps out during venom finishers!" },
        { name: "The End Suit", desc: "Designed for an older Miles in a dystopian future with a Brooklyn camo jacket and glowing venom gauntlets." },
      ];
      const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
      return res.json({
        command: "spidersuit",
        reaction: "🎽",
        output: `🎽 **SUIT SHOWCASE: ${suit.name}**\n\n${suit.desc}\n\n_Brooklyn swag at its finest!_ 🕷️`,
      });
    }

    case "multiverse": {
      const EARTHS = [
        { earth: "Earth-1610", hero: "Miles Morales", vibe: "Brooklyn, graffiti, hip-hop, venom blast, modern Spider-Man." },
        { earth: "Earth-65", hero: "Gwen Stacy (Ghost-Spider)", vibe: "Pastel watercolor skyline, punk rock drums, ballet web-swinging." },
        { earth: "Earth-928", hero: "Miguel O'Hara (2099)", vibe: "Nueva York, high-tech dystopian city, holo-webs, strict canon timeline." },
        { earth: "Earth-138", hero: "Hobie Brown (Spider-Punk)", vibe: "Anarchist London, punk rock collage, zero tolerance for authority." },
        { earth: "Earth-50101", hero: "Pavitr Prabhakar (Spider-Man India)", vibe: "Mumbattan, energetic traffic webs, zero stress heroics." },
      ];
      const e = EARTHS[Math.floor(Math.random() * EARTHS.length)];
      return res.json({
        command: "multiverse",
        reaction: "🌀",
        output: `🌀 **MULTIVERSE INTEL // ${e.earth}**\n\n👤 **Resident Spider-Hero:** ${e.hero}\n🌆 **Dimension Vibe:** ${e.vibe}\n\n_Connected via Web of Life and Destiny._ 🕸️`,
      });
    }

    case "venom":
    case "venomblast": {
      const charge = Math.floor(Math.random() * 40) + 60;
      return res.json({
        command: "venom",
        reaction: "⚡",
        output: `⚡⚡⚡ **BIO-ELECTRIC VENOM BLAST ENGAGED!** ⚡⚡⚡\n\n🔋 **Charge Output:** [ ${charge}% VOLTAGE ]\n💥 **Status:** Surge released! Surrounding enemies stunned.\n\n_"You felt that, didn't you?"_ 🕷️⚡`,
      });
    }

    case "leapoffaith": {
      return res.json({
        command: "leapoffaith",
        reaction: "🌆",
        output: `🌆 **THE LEAP OF FAITH**\n\n_"When do I know I'm Spider-Man?"_\n_"You won't. That's all it is, Miles. A leap of faith."_\n\n🏙️ **Altitude:** Top of Brooklyn Tower\n🎵 **Soundtrack:** Post Malone - Sunflower\n👟 **Kicks:** Air Jordan 1s Laced\n\n✨ **Result:** You jumped. And you flew. 🕸️`,
      });
    }

    case "ping":
    case "speed": {
      const speed = Math.floor(Math.random() * 18) + 12;
      return res.json({
        command: "ping",
        reaction: "⚡",
        output: `⚡ **SPIDER-LATENCY:** \`${speed}ms\`\n🌐 **Dimension:** Earth-1610 Brooklyn\n🕸️ **Web Status:** Quantum Connected & Super Fast!`,
      });
    }

    case "alive":
    case "uptime": {
      const upSec = Math.floor(process.uptime());
      const upH = Math.floor(upSec / 3600);
      const upM = Math.floor((upSec % 3600) / 60);
      const upS = upSec % 60;
      return res.json({
        command: "alive",
        reaction: "🕷️",
        output: `🕷️ **MILES MORALES MD IS ONLINE!**\n\n⏱️ **Uptime:** ${upH}h ${upM}m ${upS}s\n📦 **Suites Loaded:** ${commands.size} modules\n🤖 **Bot Name:** ${global.botName}\n👑 **Architect:** ${global.ownername || "Parker"}\n\n_"Nah, I'mma do my own thing!"_ 🕸️`,
      });
    }

    case "flip":
    case "coin": {
      const isHeads = Math.random() > 0.5;
      return res.json({
        command: "flip",
        reaction: "🪙",
        output: `🪙 **SPIDER-COIN FLIP**\n\nResult: **${isHeads ? "HEADS (Miles)" : "TAILS (Spider-Gwen)"}**!`,
      });
    }

    case "roll":
    case "dice": {
      const roll = Math.floor(Math.random() * 6) + 1;
      return res.json({
        command: "roll",
        reaction: "🎲",
        output: `🎲 **DICE ROLL:** You rolled a **[ ${roll} ]**!`,
      });
    }

    default: {
      return res.json({
        command: cmd,
        reaction: "🕸️",
        output: `🕸️ **Spider-Command Executed:** \`${pref}${cmd} ${args || ""}\`\n\n✅ Command validated across ${commands.size} loaded suites. Use on WhatsApp by sending \`${pref}${cmd}\` directly to the bot!`,
      });
    }
  }
});

// Start Express Server with error handling
const server = app.listen(PORT, () => {
  console.log(chalk.cyan(`[ SPIDER-DASHBOARD ] Web GUI running on http://localhost:${PORT}`));
  addSystemLog("system", `Web GUI server started on port ${PORT}`);
  void startSpiderBot();
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(chalk.red.bold(`\n[ ERROR ] Port ${PORT} is already in use by another process.`));
    console.log(chalk.yellow(`Tip: Close other running instances of the bot or change PORT in .env\n`));
  } else {
    console.error(chalk.red(`[ SERVER ERROR ] ${err.message}`));
  }
});
