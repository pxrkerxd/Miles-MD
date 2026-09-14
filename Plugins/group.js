import {
  setAntilink,
  delAntilink,
  setWelcome,
  delWelcome,
} from "../System/MongoDB/MongoDb_Core.js";

let commands = [
  "kick",
  "remove",
  "promote",
  "demote",
  "tagall",
  "everyone",
  "hidetag",
  "mute",
  "unmute",
  "antilink",
  "welcome",
  "groupinfo",
  "setname",
  "setdesc",
];

export default {
  name: "group",
  alias: [...commands],
  uniquecommands: ["kick", "promote", "demote", "tagall", "hidetag", "mute", "unmute", "antilink", "welcome", "groupinfo"],
  description: "Group defense and administration commands",
  start: async (
    SpiderBot,
    m,
    {
      inputCMD,
      text,
      doReact,
      prefix,
      isGroup,
      isGroupAdmin,
      isBotAdmin,
      isCreator,
      groupMetadata,
      groupParticipants,
    }
  ) => {
    if (!isGroup) {
      return m.reply("🕸️ This command can only be used inside a WhatsApp group!");
    }

    // Permission checks for admin commands
    const adminOnlyCmds = ["kick", "remove", "promote", "demote", "mute", "unmute", "antilink", "welcome", "setname", "setdesc"];
    if (adminOnlyCmds.includes(inputCMD) && !isGroupAdmin && !isCreator) {
      await doReact("🚫");
      return m.reply("🕸️ *Access Denied:* Only Group Admins can use this ability!");
    }

    switch (inputCMD) {
      case "tagall":
      case "everyone": {
        await doReact("📢");
        const mentions = groupParticipants.map((p) => p.id);
        let tagMsg = `╔═══〔 🕷️ *SPIDER-SENSE BROADCAST* 〕═══╗\n`;
        tagMsg += `║ *Group:* ${groupMetadata.subject}\n`;
        tagMsg += `║ *Members:* ${groupParticipants.length}\n`;
        if (text) tagMsg += `║ *Message:* ${text}\n`;
        tagMsg += `╚════════════════════════════════╝\n\n`;

        groupParticipants.forEach((p, idx) => {
          tagMsg += `${idx + 1}. @${p.id.split("@")[0]}\n`;
        });

        return SpiderBot.sendMessage(m.from, { text: tagMsg, mentions }, { quoted: m });
      }

      case "hidetag": {
        if (!isGroupAdmin && !isCreator) return m.reply("Only Admins can hidetag!");
        await doReact("👁️");
        const mentions = groupParticipants.map((p) => p.id);
        const broadcastText = text || (m.quoted ? m.quoted.text : "🕷️ *Spider-Sense Alert!*");
        return SpiderBot.sendMessage(m.from, { text: broadcastText, mentions });
      }

      case "kick":
      case "remove": {
        if (!isBotAdmin) return m.reply("🕸️ I need to be a **Group Admin** to remove members!");
        const target = m.quoted ? m.quoted.sender : m.mentionedJid?.[0];
        if (!target) return m.reply(`🕸️ Mention a user or reply to their message with \`${prefix}kick\`.`);

        await doReact("👢");
        await SpiderBot.groupParticipantsUpdate(m.from, [target], "remove");
        return m.reply(`🕸️ Banished through a multiverse portal: @${target.split("@")[0]}!`);
      }

      case "promote": {
        if (!isBotAdmin) return m.reply("🕸️ Make me Group Admin first!");
        const target = m.quoted ? m.quoted.sender : m.mentionedJid?.[0];
        if (!target) return m.reply("🕸️ Mention or reply to the user you want to promote.");

        await doReact("🎖️");
        await SpiderBot.groupParticipantsUpdate(m.from, [target], "promote");
        return m.reply(`⚡ Promoted to Spider-Admin: @${target.split("@")[0]}!`);
      }

      case "demote": {
        if (!isBotAdmin) return m.reply("🕸️ Make me Group Admin first!");
        const target = m.quoted ? m.quoted.sender : m.mentionedJid?.[0];
        if (!target) return m.reply("🕸️ Mention or reply to the user you want to demote.");

        await doReact("📉");
        await SpiderBot.groupParticipantsUpdate(m.from, [target], "demote");
        return m.reply(`🕸️ Demoted to civilian: @${target.split("@")[0]}!`);
      }

      case "mute": {
        if (!isBotAdmin) return m.reply("🕸️ I need Admin permissions to mute the group.");
        await doReact("🔒");
        await SpiderBot.groupSettingUpdate(m.from, "announcement");
        return m.reply("🔒 *Group Muted:* Only Admins can send messages now.");
      }

      case "unmute": {
        if (!isBotAdmin) return m.reply("🕸️ I need Admin permissions to unmute the group.");
        await doReact("🔓");
        await SpiderBot.groupSettingUpdate(m.from, "not_announcement");
        return m.reply("🔓 *Group Unmuted:* Everyone can chat again! Let's swing!");
      }

      case "antilink": {
        const option = text.toLowerCase().trim();
        if (option === "on" || option === "enable") {
          await setAntilink(m.from);
          await doReact("🛡️");
          return m.reply("🛡️ *Anti-Link Activated:* Unauthorized links will be auto-deleted!");
        } else if (option === "off" || option === "disable") {
          await delAntilink(m.from);
          await doReact("🔓");
          return m.reply("🔓 *Anti-Link Deactivated:* Links are now permitted.");
        } else {
          return m.reply(`Usage: \`${prefix}antilink on\` or \`${prefix}antilink off\``);
        }
      }

      case "welcome": {
        const option = text.toLowerCase().trim();
        if (option === "on" || option === "enable") {
          await setWelcome(m.from);
          await doReact("👋");
          return m.reply("👋 *Spider Welcome Activated:* New members will receive Spider-Verse greeting!");
        } else if (option === "off" || option === "disable") {
          await delWelcome(m.from);
          await doReact("🛑");
          return m.reply("🛑 *Spider Welcome Deactivated.*");
        } else {
          return m.reply(`Usage: \`${prefix}welcome on\` or \`${prefix}welcome off\``);
        }
      }

      case "groupinfo": {
        await doReact("ℹ️");
        const admins = groupParticipants.filter((p) => p.admin).map((p) => `@${p.id.split("@")[0]}`);
        const info = [
          `╭━━━〔 👥 *GROUP DOSSIER* 〕━━━╮`,
          `┃ 🏷️ *Name:* ${groupMetadata.subject}`,
          `┃ 🆔 *ID:* ${m.from}`,
          `┃ 👥 *Total Members:* ${groupParticipants.length}`,
          `┃ 👑 *Admins:* ${admins.join(", ")}`,
          `┃ 🔒 *Restricted:* ${groupMetadata.announce ? "Yes (Admins Only)" : "No"}`,
          `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`,
        ].join("\n");

        return SpiderBot.sendMessage(m.from, { text: info, mentions: groupParticipants.map((p) => p.id) }, { quoted: m });
      }

      case "setname": {
        if (!isBotAdmin) return m.reply("Make me Admin first!");
        if (!text) return m.reply("Provide a new group name!");
        await SpiderBot.groupUpdateSubject(m.from, text);
        return m.reply(`✅ Group name updated to: *${text}*`);
      }

      case "setdesc": {
        if (!isBotAdmin) return m.reply("Make me Admin first!");
        if (!text) return m.reply("Provide a new group description!");
        await SpiderBot.groupUpdateDescription(m.from, text);
        return m.reply("✅ Group description updated!");
      }
    }
  },
};
