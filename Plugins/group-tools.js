import {
  addWarn,
  resetWarn,
  getWarn,
  setAutosticker,
  delAutosticker,
  checkAutosticker,
  setAntidelete,
  delAntidelete,
  checkAntidelete,
} from "../System/MongoDB/MongoDb_Core.js";

let commands = [
  "poll",
  "vote",
  "tagadmins",
  "admins",
  "warn",
  "checkwarn",
  "warns",
  "resetwarn",
  "autosticker",
  "antidelete",
];

const extractTargetUser = (m, text = "") => {
  if (m.quoted?.sender) return m.quoted.sender;
  if (m.mentionedJid && m.mentionedJid.length > 0) return m.mentionedJid[0];
  if (m.mentions && m.mentions.length > 0) return m.mentions[0];
  if (text) {
    const cleanNum = text.replace(/[^0-9]/g, "");
    if (cleanNum.length >= 7) return `${cleanNum}@s.whatsapp.net`;
  }
  return null;
};

export default {
  name: "grouptools",
  alias: [...commands],
  uniquecommands: ["poll", "tagadmins", "warn", "checkwarn", "resetwarn", "autosticker", "antidelete"],
  description: "Advanced Group Automation & Moderation Power Tools",
  start: async (
    SpiderBot,
    m,
    { inputCMD, text, doReact, prefix, isCreator, isMod, isGroup, groupMetadata, groupAdmin }
  ) => {
    switch (inputCMD) {
      // 1. WHATSAPP POLL MAKER
      case "poll":
      case "vote": {
        if (!text || !text.includes("|")) {
          return m.reply(
            `📊 *Spider-Verse Poll Studio*\n\nUsage: \`${prefix}poll Question | Option 1 | Option 2 | Option 3\`\nExample: \`${prefix}poll Best Spider-Man Movie? | Into the Spider-Verse | Across the Spider-Verse | No Way Home\``
          );
        }

        const parts = text.split("|").map((p) => p.trim()).filter(Boolean);
        if (parts.length < 3) {
          return m.reply("🕸️ You must provide at least a Question and 2 Options separated by `|`!");
        }

        const question = parts[0];
        const values = parts.slice(1, 12); // Up to 11 options

        await doReact("📊");
        try {
          return await SpiderBot.sendMessage(
            m.from,
            {
              poll: {
                name: `🕷️ ${question}`,
                values,
                selectableCount: 1,
              },
            },
            { quoted: m }
          );
        } catch (err) {
          return m.reply(`⚠️ Poll creation error: ${err.message}`);
        }
      }

      // 2. TAG ALL ADMINS
      case "tagadmins":
      case "admins": {
        if (!isGroup) return m.reply("🕸️ This command can only be used in groups!");
        await doReact("🚨");

        if (!groupMetadata) {
          return m.reply("🕸️ Could not retrieve group admin roster.");
        }

        const admins = groupMetadata.participants.filter(
          (p) => p.admin === "admin" || p.admin === "superadmin"
        );

        if (!admins.length) return m.reply("🕸️ No group admins detected.");

        const ownerNumbers = global.owner || ["919123764864"];
        let txt = `🚨 *SPIDER-SIGNAL: CALLING GROUP ADMINS* 🚨\n\n`;
        admins.forEach((a, i) => {
          const userJid = a.id;
          const userNum = userJid.split("@")[0];

          let adminName = "";
          if (ownerNumbers.includes(userNum)) {
            adminName = `${global.ownername || "Parker"} (Creator)`;
          } else if (global.contactNames?.has(userJid)) {
            adminName = global.contactNames.get(userJid);
          } else if (global.contactNames?.has(userNum)) {
            adminName = global.contactNames.get(userNum);
          } else if (SpiderBot.contacts?.[userJid]?.notify || SpiderBot.contacts?.[userJid]?.name) {
            adminName = SpiderBot.contacts[userJid].notify || SpiderBot.contacts[userJid].name;
          }

          const role = a.admin === "superadmin" ? " 👑 *[Leader]*" : " ⚡ *[Admin]*";
          if (adminName) {
            txt += `${i + 1}. 🕷️ @${userNum} ~ *${adminName}*${role}\n`;
          } else {
            txt += `${i + 1}. 🕷️ @${userNum}${role}\n`;
          }
        });
        txt += `\n_Message: ${text || "Attention required in group!"}_ 🕸️`;

        return SpiderBot.sendMessage(
          m.from,
          {
            text: txt,
            mentions: admins.map((a) => a.id),
          },
          { quoted: m }
        );
      }

      // 3. WARNING SYSTEM
      case "warn": {
        if (!isGroup) return m.reply("🕸️ Warnings can only be used in groups!");
        if (!groupAdmin && !isCreator && !isMod) {
          return m.reply("🚫 *Access Denied:* Only group admins can issue warnings!");
        }

        const target = extractTargetUser(m, text);
        if (!target) {
          return m.reply(`🕸️ Mention or reply to a user to warn them! e.g. \`${prefix}warn @user spamming\``);
        }

        const targetNum = target.split("@")[0].replace(/[^0-9]/g, "");
        const warns = await addWarn(targetNum);
        await doReact("⚠️");

        let warnMsg = `⚠️ *SPIDER WARNING ISSUED* ⚠️\n\n`;
        warnMsg += `👤 *User:* @${targetNum}\n`;
        warnMsg += `📊 *Warning Level:* [ ${warns} / 3 ]\n`;
        warnMsg += `📝 *Reason:* ${text ? text.replace(/@[0-9]+/g, "").trim() || "Rule Violation" : "Rule Violation"}\n\n`;

        if (warns >= 3) {
          warnMsg += `🚨 *MAX WARNINGS REACHED!* @${targetNum} has reached 3 warnings!`;
        } else {
          warnMsg += `_3 warnings will result in disciplinary action!_`;
        }

        return SpiderBot.sendMessage(
          m.from,
          {
            text: warnMsg,
            mentions: [target],
          },
          { quoted: m }
        );
      }

      case "checkwarn":
      case "warns": {
        const target = extractTargetUser(m, text) || m.sender;
        const targetNum = target.split("@")[0].replace(/[^0-9]/g, "");
        const count = await getWarn(targetNum);
        await doReact("📋");
        return m.reply(`📋 *Warning Status for @${targetNum}:* [ \`${count} / 3\` warnings ]`);
      }

      case "resetwarn": {
        if (!isGroup) return m.reply("🕸️ Warnings can only be managed in groups!");
        if (!groupAdmin && !isCreator && !isMod) {
          return m.reply("🚫 *Access Denied:* Only group admins can reset warnings!");
        }

        const target = extractTargetUser(m, text);
        if (!target) return m.reply("🕸️ Mention or reply to the user to clear warnings.");

        const targetNum = target.split("@")[0].replace(/[^0-9]/g, "");
        await resetWarn(targetNum);
        await doReact("✅");
        return m.reply(`✅ *Spider-Slate Cleared:* All warnings for @${targetNum} have been reset to 0.`);
      }

      // 4. AUTOSTICKER TOGGLE
      case "autosticker": {
        if (!isGroup) return m.reply("🕸️ Auto-Sticker is only available in groups!");
        if (!groupAdmin && !isCreator && !isMod) {
          return m.reply("🚫 *Access Denied:* Only group admins can toggle Auto-Sticker!");
        }

        const val = text.toLowerCase().trim();
        if (val === "on" || val === "enable" || val === "1") {
          await setAutosticker(m.from);
          await doReact("🎨");
          return m.reply("🎨 *Auto-Sticker Enabled:* Any image sent in this group will be automatically turned into a sticker!");
        } else if (val === "off" || val === "disable" || val === "0") {
          await delAutosticker(m.from);
          await doReact("🛑");
          return m.reply("🛑 *Auto-Sticker Disabled.*");
        }
        return m.reply(`Usage: \`${prefix}autosticker on\` or \`${prefix}autosticker off\``);
      }

      // 5. ANTIDELETE TOGGLE
      case "antidelete": {
        if (!isGroup) return m.reply("🕸️ Anti-Delete can only be configured in groups!");
        if (!groupAdmin && !isCreator && !isMod) {
          return m.reply("🚫 *Access Denied:* Only group admins can toggle Anti-Delete!");
        }

        const val = text.toLowerCase().trim();
        if (val === "on" || val === "enable" || val === "1") {
          await setAntidelete(m.from);
          await doReact("🛡️");
          return m.reply("🛡️ *Anti-Delete Guard Active:* Deleted messages will be caught and preserved!");
        } else if (val === "off" || val === "disable" || val === "0") {
          await delAntidelete(m.from);
          await doReact("🛑");
          return m.reply("🛑 *Anti-Delete Guard Deactivated.*");
        }
        return m.reply(`Usage: \`${prefix}antidelete on\` or \`${prefix}antidelete off\``);
      }
    }
  },
};
