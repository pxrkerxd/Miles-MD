import googleTTS from "google-tts-api";
import qrcode from "qrcode";
import axios from "axios";
import { getUserRPG, getWarn, checkMod } from "../System/MongoDB/MongoDb_Core.js";

let commands = ["profile", "p", "userprofile", "tts", "say", "qr", "qrcode", "calc", "calculate", "shorturl"];

const getTitle = (level) => {
  if (level >= 50) return "👑 Ultimate Spider-Man";
  if (level >= 35) return "🛡️ Multiverse Defender";
  if (level >= 20) return "🌀 Dimension Hopper";
  if (level >= 10) return "⚡ Spider-Verse Champion";
  if (level >= 5) return "🏙️ Brooklyn Vigilante";
  return "🕸️ Web-Shooter Novice";
};

export default {
  name: "tools",
  alias: [...commands],
  uniquecommands: ["profile", "tts", "qr", "calc", "shorturl"],
  description: "Everyday productivity and utility tools",
  start: async (
    SpiderBot,
    m,
    { inputCMD, text, doReact, prefix, pushName, isGroup, groupParticipants }
  ) => {
    switch (inputCMD) {
      case "profile":
      case "p":
      case "userprofile": {
        await doReact("👤");
        await SpiderBot.sendPresenceUpdate("composing", m.from);

        const senderNumber = m.sender ? m.sender.split("@")[0].replace(/[^0-9]/g, "") : "";
        let targetJid = m.sender;
        let targetNum = senderNumber;

        if (m.quoted?.sender) {
          targetJid = m.quoted.sender;
          targetNum = targetJid.split("@")[0].replace(/[^0-9]/g, "");
        } else if (m.mentionedJid && m.mentionedJid.length > 0) {
          targetJid = m.mentionedJid[0];
          targetNum = targetJid.split("@")[0].replace(/[^0-9]/g, "");
        } else if (text && text.trim().length > 0) {
          const clean = text.replace(/[^0-9]/g, "");
          if (clean.length >= 7) {
            targetNum = clean;
            targetJid = `${clean}@s.whatsapp.net`;
          }
        }

        // 1. Fetch Profile Picture
        let pfpUrl = null;
        try {
          pfpUrl = await SpiderBot.profilePictureUrl(targetJid, "image");
        } catch (e) {
          pfpUrl = null;
        }

        // 2. Fetch User Bio / Status
        let userBio = "No status set";
        try {
          const statusObj = await SpiderBot.fetchStatus(targetJid);
          if (statusObj && statusObj.status) {
            userBio = statusObj.status;
          }
        } catch (e) {
          userBio = "Hidden / Private";
        }

        // 3. User RPG Stats & Rank
        const rpg = await getUserRPG(targetNum);
        const warns = await getWarn(targetNum);
        const title = getTitle(rpg.level);

        // 4. Roles & Permissions
        const isTargetOwner =
          (global.owner && global.owner.includes(targetNum)) ||
          (m.fromMe && targetNum === senderNumber);
        const isTargetMod = isTargetOwner || (await checkMod(targetNum));
        const botRole = isTargetOwner
          ? "👑 Bot Owner"
          : isTargetMod
          ? "🛡️ Moderator"
          : "🕷️ Spider-Hero (User)";

        let groupRole = "Private DM";
        if (isGroup && groupParticipants && groupParticipants.length > 0) {
          const isTargetAdmin = groupParticipants.some(
            (p) =>
              (p.id === targetJid || p.id.split("@")[0] === targetNum) &&
              (p.admin === "admin" || p.admin === "superadmin")
          );
          groupRole = isTargetAdmin ? "⚡ Group Admin" : "👤 Group Member";
        }

        const displayName =
          targetNum === senderNumber ? pushName || `@${targetNum}` : `@${targetNum}`;

        const profileCard = [
          `╔════〔 🕷️ *SPIDER-VERSE PROFILE* 〕════╗`,
          `║ 👤 *Hero:* ${displayName}`,
          `║ 📱 *Number:* @${targetNum}`,
          `║ 📝 *Bio:* "${userBio}"`,
          `║ 👑 *Bot Role:* ${botRole}`,
          ...(isGroup ? [`║ 🛡️ *Group Role:* ${groupRole}`] : []),
          `║ 🎖️ *Spider-Rank:* ${title}`,
          `║ ⚡ *Level:* ${rpg.level} (XP: ${rpg.xp})`,
          `║ 🪙 *Tokens:* ${rpg.tokens} 🪙`,
          `║ ⚠️ *Warnings:* ${warns}/3`,
          `╚══════════════════════════════════════╝`,
          `\n_Tip: Type \`${prefix}rank\` to view your RPG level progression!_ 🕸️`,
        ].join("\n");

        if (pfpUrl) {
          try {
            return await SpiderBot.sendMessage(
              m.from,
              {
                image: { url: pfpUrl },
                caption: profileCard,
                mentions: [targetJid],
              },
              { quoted: m }
            );
          } catch (err) {}
        }

        return m.reply(profileCard, { mentions: [targetJid] });
      }
      case "tts":
      case "say": {
        await doReact("🗣️");
        let content = text || (m.quoted ? m.quoted.text : "");
        if (!content) return m.reply(`Usage: \`${prefix}tts <text to speak>\``);

        try {
          const audioUrl = googleTTS.getAudioUrl(content.slice(0, 200), {
            lang: "en",
            slow: false,
            host: "https://translate.google.com",
          });

          return SpiderBot.sendMessage(
            m.from,
            { audio: { url: audioUrl }, mimetype: "audio/mp4", ptt: true },
            { quoted: m }
          );
        } catch (err) {
          return m.reply(`⚠️ TTS failed: ${err.message}`);
        }
      }

      case "qr":
      case "qrcode": {
        await doReact("📱");
        if (!text) return m.reply(`Usage: \`${prefix}qr <text or url>\``);

        try {
          const qrBuffer = await qrcode.toBuffer(text, { scale: 8, margin: 2 });
          return SpiderBot.sendMessage(
            m.from,
            { image: qrBuffer, caption: `📱 *QR Code Generated:* "${text}"` },
            { quoted: m }
          );
        } catch (e) {
          return m.reply(`⚠️ QR Error: ${e.message}`);
        }
      }

      case "calc":
      case "calculate": {
        await doReact("🧮");
        let raw = (text || (m.quoted ? m.quoted.text : "")).trim();
        if (!raw) return m.reply(`Usage: \`${prefix}calc 100x2\` or \`${prefix}calc 50 + 25 * 4\` or \`${prefix}calc sqrt(144)\``);

        try {
          let expr = raw
            .replace(/x|X|×/g, "*")
            .replace(/÷|:/g, "/")
            .replace(/\^/g, "**")
            .replace(/([0-9.]+)%/g, "($1/100)")
            .replace(/sqrt\(/gi, "Math.sqrt(")
            .replace(/cbrt\(/gi, "Math.cbrt(")
            .replace(/abs\(/gi, "Math.abs(")
            .replace(/sin\(/gi, "Math.sin(")
            .replace(/cos\(/gi, "Math.cos(")
            .replace(/tan\(/gi, "Math.tan(")
            .replace(/log\(/gi, "Math.log10(")
            .replace(/\bpi\b/gi, "Math.PI")
            .replace(/\be\b/gi, "Math.E");

          // Sanitize safe characters
          const safeChars = /^[0-9+\-*/().%* ,Math.PIEsqrtcbrtabsincoslog]+$/;
          if (!safeChars.test(expr)) {
            return m.reply("⚠️ Invalid mathematical characters.");
          }

          const evaluated = new Function(`'use strict'; return (${expr})`)();

          if (evaluated === undefined || Number.isNaN(evaluated)) {
            return m.reply("⚠️ Calculation resulted in undefined / NaN.");
          }

          const formattedResult =
            typeof evaluated === "number" && !Number.isInteger(evaluated)
              ? parseFloat(evaluated.toFixed(6)).toString()
              : evaluated.toString();

          return m.reply(
            `🧮 *Spider Calculator:*\n\n*Input:* \`${raw}\`\n*Result:* \`${formattedResult}\``
          );
        } catch (err) {
          return m.reply(`⚠️ Calculation error: ${err.message}`);
        }
      }

      case "shorturl": {
        await doReact("✂️");
        if (!text) return m.reply(`Usage: \`${prefix}shorturl <url>\``);

        try {
          const res = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(text)}`);
          return m.reply(`✂️ *Shortened URL:*\n${res.data}`);
        } catch (e) {
          return m.reply("⚠️ Failed to shorten URL.");
        }
      }
    }
  },
};
