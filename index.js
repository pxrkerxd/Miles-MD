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
import { serialize } from "./System/whatsapp.js";
import { checkWelcome } from "./System/MongoDB/MongoDb_Core.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Suppress noisy harmless libsignal decryption errors ---
const originalConsoleError = console.error;
console.error = (...args) => {
  const msg = args.map((a) => (typeof a === "object" && a !== null ? (a.stack || a.message || JSON.stringify(a)) : String(a))).join(" ");
  if (
    msg.includes("Failed to decrypt message with any known session") ||
    msg.includes("MessageCounterError") ||
    msg.includes("Bad MAC") ||
    msg.includes("Key used already or never filled") ||
    msg.includes("Closing session: SessionEntry") ||
    msg.includes("No matching sessions found for message")
  ) {
    return;
  }
  originalConsoleError(...args);
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
    commandsCount: commands.size,
    reconnectAttempts,
    websocketOpen: Boolean(SpiderSocket?.ws?.isOpen),
  });
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
    return res.json({ code });
  } catch (err) {
    console.error(chalk.red("[ PAIRING CODE ERROR ]"), err.message);
    return res.status(500).json({ error: `Pairing failed: ${err.message}` });
  }
});

// Start Express Server with error handling
const server = app.listen(PORT, () => {
  console.log(chalk.cyan(`[ SPIDER-DASHBOARD ] Web GUI running on http://localhost:${PORT}`));
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
