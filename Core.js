import "./Configurations.js";
import "./System/BotCharacters.js";
import chalk from "chalk";
import axios from "axios";
import { GoogleGenAI } from "@google/genai";
import { getGeminiConfig, GEMINI_MODEL } from "./System/__system_prompt.js";
import { jidNormalizedUser } from "@whiskeysockets/baileys";
import {
  checkBan,
  checkMod,
  getChar,
  checkPmChatbot,
  getBotMode,
  checkBanGroup,
  checkAntilink,
  checkGroupChatbot,
  checkAutosticker,
  addXP,
} from "./System/MongoDB/MongoDb_Core.js";
import { Sticker, StickerTypes } from "wa-sticker-formatter";

export default async (SpiderBot, m, commands, chatUpdate) => {
  try {
    if (!m) return;
    let { from, sender, isGroup } = m;
    if (!from || from === "status@broadcast" || from.endsWith("@broadcast")) return;

    let body = (m.text || m.body || "").trim();

    // Do not process messages sent by bot unless it is an explicit command from the owner
    if (m.isBot) return;

    const prefix = global.prefa || "/";
    const isCmd = body.startsWith(prefix);

    if (m.fromMe && !isCmd) return;

    const commandName = isCmd
      ? body.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase()
      : "";
    const args = isCmd
      ? body.slice(prefix.length).trim().split(/\s+/).slice(1)
      : [];
    const text = args.join(" ");

    const pushName = m.pushName || "Spider-Friend";

    // Clean sender ID
    const senderNumber = sender ? sender.split("@")[0].replace(/[^0-9]/g, "") : "";
    const isCreator = global.owner.includes(senderNumber) || m.fromMe;

    // Cache contact pushName
    global.contactNames = global.contactNames || new Map();
    if (senderNumber && pushName && pushName !== "Spider-Friend") {
      global.contactNames.set(senderNumber, pushName);
      if (sender) global.contactNames.set(sender, pushName);
    }
    const isMod = isCreator || (await checkMod(senderNumber));

    // Ban checks
    if (!isCreator) {
      const isUserBanned = await checkBan(senderNumber);
      if (isUserBanned) return;

      if (isGroup) {
        const isGrBanned = await checkBanGroup(from);
        if (isGrBanned) return;
      }
    }

    // Bot mode checks (public / private / self)
    const botMode = await getBotMode();
    if (botMode === "self" && !isCreator) return;
    if (botMode === "private" && isGroup && !isCreator) return;

    // Group Admin checks
    let groupMetadata = null;
    let groupParticipants = [];
    let isBotAdmin = false;
    let isGroupAdmin = false;

    if (isGroup) {
      try {
        groupMetadata = await SpiderBot.groupMetadata(from);
        groupParticipants = groupMetadata.participants || [];

        const botJid = SpiderBot.user?.id ? jidNormalizedUser(SpiderBot.user.id) : "";
        const botLid = SpiderBot.user?.lid ? jidNormalizedUser(SpiderBot.user.lid) : "";
        const botNum = botJid.split("@")[0].replace(/[^0-9]/g, "");

        // Set of all identifiers for the bot / owner account (phone, LID, sender, owner array)
        const myIds = new Set(
          [
            botJid,
            botLid,
            botNum,
            sender,
            senderNumber,
            m.key?.participant ? jidNormalizedUser(m.key.participant) : "",
            m.key?.participant ? m.key.participant.split("@")[0].replace(/[^0-9]/g, "") : "",
            ...(global.owner || []),
          ].filter(Boolean)
        );

        const isUserAdmin = groupParticipants.some((p) => {
          const pJid = jidNormalizedUser(p.id);
          const pNum = pJid.split("@")[0].replace(/[^0-9]/g, "");
          const match = myIds.has(pJid) || myIds.has(pNum);
          return match && (p.admin === "admin" || p.admin === "superadmin");
        });

        isBotAdmin = isCreator || isUserAdmin || groupParticipants.some((p) => {
          const pJid = jidNormalizedUser(p.id);
          const pNum = pJid.split("@")[0].replace(/[^0-9]/g, "");
          const isBot = pJid === botJid || pJid === botLid || (botNum && pNum === botNum);
          return isBot && (p.admin === "admin" || p.admin === "superadmin");
        });

        isGroupAdmin = isCreator || isUserAdmin;
      } catch (err) {}
    }

    // Anti-Link Enforcement
    if (isGroup && !isGroupAdmin && !isCreator) {
      const antilinkActive = await checkAntilink(from);
      if (antilinkActive && /(https?:\/\/[^\s]+|chat\.whatsapp\.com\/[^\s]+)/gi.test(body)) {
        await SpiderBot.sendMessage(from, { delete: m.key });
        await SpiderBot.sendMessage(from, {
          text: `🕸️ *Spider-Sense Alert!* Links are not allowed here, @${senderNumber}!`,
          mentions: [sender],
        });
        return;
      }
    }

    // Passive Spider-XP earning
    if (senderNumber) {
      void addXP(senderNumber, isCmd ? 15 : 5);
    }

    // Auto-Sticker Enforcement
    if (isGroup && !isCmd && m.mtype === "imageMessage") {
      const autoStickerActive = await checkAutosticker(from);
      if (autoStickerActive) {
        try {
          const mediaBuffer = await m.download();
          if (mediaBuffer) {
            const sticker = new Sticker(mediaBuffer, {
              pack: global.packname,
              author: global.author,
              type: StickerTypes.FULL,
              quality: 70,
            });
            const stickerBuffer = await sticker.toBuffer();
            return await SpiderBot.sendMessage(from, { sticker: stickerBuffer }, { quoted: m });
          }
        } catch (e) {}
      }
    }

    // Reaction helper
    const doReact = async (emoji) => {
      try {
        await SpiderBot.sendMessage(from, {
          react: { text: emoji, key: m.key },
        });
      } catch (e) {}
    };

    // Load active character details
    const charId = await getChar();
    const activeChar = global[`charID${charId}`] || global.charID0;
    const botName = activeChar.botName || global.botName;
    const botVideo = activeChar.botVideo;
    const botImage = activeChar.botImage1;

    // Command dispatch
    if (isCmd && commandName) {
      let cmd = null;
      for (const [, plugin] of commands) {
        if (
          plugin.name === commandName ||
          (Array.isArray(plugin.alias) && plugin.alias.includes(commandName)) ||
          (Array.isArray(plugin.uniquecommands) && plugin.uniquecommands.includes(commandName))
        ) {
          cmd = plugin;
          break;
        }
      }

      if (cmd) {
        console.log(
          chalk.magenta(`[ SPIDER-CMD ] `) +
            chalk.cyan(`${prefix}${commandName}`) +
            chalk.gray(` by `) +
            chalk.yellow(`${pushName} (${senderNumber})`)
        );

        try {
          await cmd.start(SpiderBot, m, {
            pushName,
            prefix,
            inputCMD: commandName,
            doReact,
            text,
            args,
            isCreator,
            isMod,
            isGroup,
            isGroupAdmin,
            isBotAdmin,
            groupMetadata,
            groupParticipants,
            botName,
            botVideo,
            botImage,
            activeChar,
          });
        } catch (err) {
          console.error(chalk.red(`[ CMD ERROR: ${commandName} ] `), err);
          await doReact("⚠️");
          m.reply(`🕸️ *Spider-Sense Glitch:* Something went wrong: ${err.message}`);
        }
        return;
      }
    }

    // Miles AI Chatbot trigger
    // Triggers if:
    // 1. In DM and PM Chatbot is active (or user sends regular text)
    // 2. In Group and bot is tagged or message replies to bot
    const botJidNormalized = SpiderBot.user?.id
      ? SpiderBot.user.id.split(":")[0] + "@s.whatsapp.net"
      : "";
    const isBotMentioned =
      (m.mentionedJid && m.mentionedJid.includes(botJidNormalized)) ||
      (m.quoted && m.quoted.sender === botJidNormalized);
    const isPm = !isGroup;
    const pmChatActive = await checkPmChatbot();
    const groupChatActive = isGroup && (await checkGroupChatbot(from));

    const shouldChat =
      !m.fromMe &&
      !isCmd &&
      body.trim().length > 1 &&
      ((isPm && pmChatActive) || (isGroup && isBotMentioned) || (isGroup && groupChatActive && isBotMentioned));

    if (shouldChat) {
      await doReact("🕷️");
      await SpiderBot.sendPresenceUpdate("composing", from);

      const cleanPrompt = body.replace(/@\d+/g, "").trim();

      // Gemini AI integration
      const geminiKey = global.pickKey(global.geminiAPIKeys);
      if (geminiKey) {
        try {
          const ai = new GoogleGenAI({ apiKey: geminiKey });
          const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: cleanPrompt,
            config: getGeminiConfig(),
          });

          if (response?.text) {
            return await m.reply(response.text.trim());
          }
        } catch (e) {
          console.error("[ GEMINI CHAT ERROR ]", e.message);
        }
      }

      // Fallback response if no AI keys configured
      const fallbackResponses = [
        "Yo! What's good? Miles Morales here. What's crackin' in Brooklyn?",
        "Spider-Sense is tingling! You called for your friendly neighborhood Spider-Man?",
        "Hey! Peter B. told me to keep training, but I'm always down to chat. What's up?",
        "Nah, I'mma do my own thing! But hey, I got your back. What do you need?",
        "Just swinging through the city. What's on your mind, homie?",
      ];
      const randomReply = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      return await m.reply(randomReply);
    }
  } catch (err) {
    console.error(chalk.red("[ CORE ERROR ] "), err);
  }
};
