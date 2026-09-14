import {
  banUser,
  unbanUser,
  banGroup,
  unbanGroup,
  setBotMode,
  setChar,
  getChar,
  activateChatBot,
  deactivateChatBot,
  setGroupChatbot,
  delGroupChatbot,
  addMod,
  delMod,
} from "../System/MongoDB/MongoDb_Core.js";

let commands = [
  "mode",
  "ban",
  "unban",
  "bangroup",
  "unbangroup",
  "addmod",
  "delmod",
  "pmchatbot",
  "groupchatbot",
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
  name: "moderator",
  alias: [...commands],
  uniquecommands: [
    "mode",
    "ban",
    "unban",
    "bangroup",
    "unbangroup",
    "pmchatbot",
    "groupchatbot",
    "addmod",
    "delmod",
  ],
  description: "Bot administration, character switcher, and moderation",
  start: async (
    SpiderBot,
    m,
    { inputCMD, text, doReact, prefix, isCreator, isMod, isGroup }
  ) => {
    // Owner & Moderator permission enforcement
    if (!isCreator && !isMod) {
      await doReact("🚫");
      return m.reply("🕸️ *Access Denied:* Only the bot owner or moderators can use this command!");
    }

    switch (inputCMD) {
      case "mode": {
        const targetMode = text.toLowerCase().trim();
        if (["public", "private", "self"].includes(targetMode)) {
          await setBotMode(targetMode);
          await doReact("🌐");
          return m.reply(`🌐 *Bot Mode Updated:* Switched to \`${targetMode.toUpperCase()}\` mode.`);
        }
        return m.reply(`Usage: \`${prefix}mode public\` | \`${prefix}mode private\` | \`${prefix}mode self\``);
      }

      case "ban": {
        const targetJid = extractTargetUser(m, text);
        if (!targetJid) return m.reply("Reply to or mention (@) the user to ban!");
        const targetNum = targetJid.split("@")[0].replace(/[^0-9]/g, "");

        if (global.owner.includes(targetNum)) {
          await doReact("🛑");
          return m.reply("🕸️ You cannot ban the Bot Creator!");
        }

        await banUser(targetNum);
        await doReact("🔨");
        return SpiderBot.sendMessage(
          m.from,
          {
            text: `🔨 *User Banned:* @${targetNum} is now locked in Alchemax detention!`,
            mentions: [targetJid],
          },
          { quoted: m }
        );
      }

      case "unban": {
        const targetJid = extractTargetUser(m, text);
        if (!targetJid) return m.reply("Reply to or mention (@) the user to unban!");
        const targetNum = targetJid.split("@")[0].replace(/[^0-9]/g, "");

        await unbanUser(targetNum);
        await doReact("🕊️");
        return SpiderBot.sendMessage(
          m.from,
          {
            text: `🕊️ *User Unbanned:* @${targetNum} is free to swing through Brooklyn!`,
            mentions: [targetJid],
          },
          { quoted: m }
        );
      }

      case "bangroup": {
        if (!isGroup) return m.reply("Can only ban groups!");
        await banGroup(m.from);
        await doReact("🛑");
        return m.reply("🛑 *Group Banned:* Miles Morales MD will no longer respond in this chat.");
      }

      case "unbangroup": {
        if (!isGroup) return m.reply("Can only unban groups!");
        await unbanGroup(m.from);
        await doReact("✅");
        return m.reply("✅ *Group Unbanned:* Spider-Bot is back online here!");
      }

      case "pmchatbot": {
        const option = text.toLowerCase().trim();
        if (option === "on" || option === "enable") {
          await activateChatBot();
          await doReact("🤖");
          return m.reply("🤖 *PM AI Chatbot Activated:* Miles will reply to all DM messages!");
        } else if (option === "off" || option === "disable") {
          await deactivateChatBot();
          await doReact("💤");
          return m.reply("💤 *PM AI Chatbot Deactivated.*");
        } else {
          return m.reply(`Usage: \`${prefix}pmchatbot on\` or \`${prefix}pmchatbot off\``);
        }
      }

      case "groupchatbot": {
        if (!isGroup) return m.reply("Can only configure inside a group!");
        const option = text.toLowerCase().trim();
        if (option === "on" || option === "enable") {
          await setGroupChatbot(m.from);
          await doReact("🤖");
          return m.reply("🤖 *Group AI Chatbot Activated:* Miles will respond whenever tagged or replied to!");
        } else if (option === "off" || option === "disable") {
          await delGroupChatbot(m.from);
          await doReact("💤");
          return m.reply("💤 *Group AI Chatbot Deactivated.*");
        } else {
          return m.reply(`Usage: \`${prefix}groupchatbot on\` or \`${prefix}groupchatbot off\``);
        }
      }

      case "addmod": {
        if (!isCreator) return m.reply("Only the owner can appoint moderators!");
        const targetJid = extractTargetUser(m, text);
        if (!targetJid) return m.reply("Reply to or mention (@) the user to add as Moderator.");
        const targetNum = targetJid.split("@")[0].replace(/[^0-9]/g, "");

        await addMod(targetNum);
        return SpiderBot.sendMessage(
          m.from,
          {
            text: `🛡️ Appointed @${targetNum} as Spider-Moderator!`,
            mentions: [targetJid],
          },
          { quoted: m }
        );
      }

      case "delmod": {
        if (!isCreator) return m.reply("Only the owner can remove moderators!");
        const targetJid = extractTargetUser(m, text);
        if (!targetJid) return m.reply("Reply to or mention (@) the user to remove from Moderator.");
        const targetNum = targetJid.split("@")[0].replace(/[^0-9]/g, "");

        await delMod(targetNum);
        return SpiderBot.sendMessage(
          m.from,
          {
            text: `Removed @${targetNum} from Spider-Moderators.`,
            mentions: [targetJid],
          },
          { quoted: m }
        );
      }
    }
  },
};
