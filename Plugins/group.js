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
        const botJid = (SpiderBot.user?.id || "").split(":")[0] + "@s.whatsapp.net";
        const ownerNumbers = global.owner || ["919123764864"];

        let tagMsg = `╔═══〔 🕷️ *SPIDER-SENSE BROADCAST* 〕═══╗\n`;
        tagMsg += `║ 👥 *Group:* ${groupMetadata.subject || "Spider-Group"}\n`;
        tagMsg += `║ 📊 *Members:* ${groupParticipants.length}\n`;
        if (text) tagMsg += `║ 💬 *Message:* ${text}\n`;
        tagMsg += `╚════════════════════════════════╝\n\n`;

        groupParticipants.forEach((p, idx) => {
          const userJid = p.id;
          const userNum = userJid.split("@")[0];

          let memberName = "";
          if (userJid === botJid || userNum === botJid.split("@")[0]) {
            memberName = `${global.botName || "Miles Morales"} (Bot)`;
          } else if (ownerNumbers.includes(userNum)) {
            memberName = `${global.ownername || "Parker"} (Creator)`;
          } else if (global.contactNames?.has(userJid)) {
            memberName = global.contactNames.get(userJid);
          } else if (global.contactNames?.has(userNum)) {
            memberName = global.contactNames.get(userNum);
          } else if (SpiderBot.contacts?.[userJid]?.notify || SpiderBot.contacts?.[userJid]?.name) {
            memberName = SpiderBot.contacts[userJid].notify || SpiderBot.contacts[userJid].name;
          }

          let roleBadge = "";
          if (p.admin === "superadmin") roleBadge = " 👑 *[Leader]*";
          else if (p.admin === "admin") roleBadge = " ⚡ *[Admin]*";

          if (memberName) {
            tagMsg += `${idx + 1}. 🕷️ @${userNum} ~ *${memberName}*${roleBadge}\n`;
          } else {
            tagMsg += `${idx + 1}. 🕷️ @${userNum}${roleBadge}\n`;
          }
        });

        tagMsg += `\n_⚡ Powered by Miles Morales MD_ 🕸️`;

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
        if (!isBotAdmin && !isCreator) return m.reply("🕸️ *Action Required:* The bot/account must have **Group Admin** permissions in this group to remove members!");
        
        let target = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0]) || (m.mentions && m.mentions[0]);
        if (!target && text) {
          const cleanNum = text.replace(/[^0-9]/g, "");
          if (cleanNum.length >= 7) {
            target = cleanNum;
          } else {
            const searchName = text.replace(/^@/, "").trim().toLowerCase();
            const found = groupParticipants.find((p) => {
              const pJid = p.id || "";
              const pNum = pJid.split("@")[0].replace(/[^0-9]/g, "");
              const n1 = global.contactNames?.get(pJid) || "";
              const n2 = global.contactNames?.get(pNum) || "";
              const n3 = SpiderBot.contacts?.[pJid]?.notify || SpiderBot.contacts?.[pJid]?.name || "";
              return n1.toLowerCase().includes(searchName) || n2.toLowerCase().includes(searchName) || n3.toLowerCase().includes(searchName);
            });
            if (found) target = found.id;
          }
        }

        if (!target) return m.reply(`🕸️ Mention a user or reply to their message with \`${prefix}kick\`.`);

        const targetClean = target.split("@")[0].replace(/[^0-9]/g, "");
        const matched = groupParticipants.find(
          (p) => p.id === target || p.id.split("@")[0].replace(/[^0-9]/g, "") === targetClean
        );
        const finalTarget = matched ? matched.id : (target.includes("@") ? target : `${target}@s.whatsapp.net`);

        await doReact("👢");
        try {
          await SpiderBot.groupParticipantsUpdate(m.from, [finalTarget], "remove");
          return m.reply(`🕸️ Banished through a multiverse portal: @${finalTarget.split("@")[0]}!`, { mentions: [finalTarget] });
        } catch (err) {
          return m.reply(`⚠️ Could not remove member: ${err.message}`);
        }
      }

      case "promote": {
        if (!isBotAdmin && !isCreator) return m.reply("🕸️ *Action Required:* The bot/account must have **Group Admin** permissions in this group to promote members!");
        
        let target = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0]) || (m.mentions && m.mentions[0]);
        if (!target && text) {
          const cleanNum = text.replace(/[^0-9]/g, "");
          if (cleanNum.length >= 7) {
            target = cleanNum;
          } else {
            const searchName = text.replace(/^@/, "").trim().toLowerCase();
            const found = groupParticipants.find((p) => {
              const pJid = p.id || "";
              const pNum = pJid.split("@")[0].replace(/[^0-9]/g, "");
              const n1 = global.contactNames?.get(pJid) || "";
              const n2 = global.contactNames?.get(pNum) || "";
              const n3 = SpiderBot.contacts?.[pJid]?.notify || SpiderBot.contacts?.[pJid]?.name || "";
              return n1.toLowerCase().includes(searchName) || n2.toLowerCase().includes(searchName) || n3.toLowerCase().includes(searchName);
            });
            if (found) target = found.id;
          }
        }

        if (!target) return m.reply("🕸️ Mention or reply to the user you want to promote.");

        const targetClean = target.split("@")[0].replace(/[^0-9]/g, "");
        const matched = groupParticipants.find(
          (p) => p.id === target || p.id.split("@")[0].replace(/[^0-9]/g, "") === targetClean
        );
        const finalTarget = matched ? matched.id : (target.includes("@") ? target : `${target}@s.whatsapp.net`);

        await doReact("🎖️");
        try {
          await SpiderBot.groupParticipantsUpdate(m.from, [finalTarget], "promote");
          return m.reply(`⚡ Promoted to Spider-Admin: @${finalTarget.split("@")[0]}!`, { mentions: [finalTarget] });
        } catch (err) {
          return m.reply(`⚠️ Could not promote member: ${err.message}`);
        }
      }

      case "demote": {
        if (!isBotAdmin && !isCreator) return m.reply("🕸️ *Action Required:* The bot/account must have **Group Admin** permissions in this group to demote members!");
        
        let target = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0]) || (m.mentions && m.mentions[0]);
        if (!target && text) {
          const cleanNum = text.replace(/[^0-9]/g, "");
          if (cleanNum.length >= 7) {
            target = cleanNum;
          } else {
            const searchName = text.replace(/^@/, "").trim().toLowerCase();
            const found = groupParticipants.find((p) => {
              const pJid = p.id || "";
              const pNum = pJid.split("@")[0].replace(/[^0-9]/g, "");
              const n1 = global.contactNames?.get(pJid) || "";
              const n2 = global.contactNames?.get(pNum) || "";
              const n3 = SpiderBot.contacts?.[pJid]?.notify || SpiderBot.contacts?.[pJid]?.name || "";
              return n1.toLowerCase().includes(searchName) || n2.toLowerCase().includes(searchName) || n3.toLowerCase().includes(searchName);
            });
            if (found) target = found.id;
          }
        }

        if (!target) return m.reply("🕸️ Mention or reply to the user you want to demote.");

        const targetClean = target.split("@")[0].replace(/[^0-9]/g, "");
        const matched = groupParticipants.find(
          (p) => p.id === target || p.id.split("@")[0].replace(/[^0-9]/g, "") === targetClean
        );
        const finalTarget = matched ? matched.id : (target.includes("@") ? target : `${target}@s.whatsapp.net`);

        await doReact("📉");
        try {
          await SpiderBot.groupParticipantsUpdate(m.from, [finalTarget], "demote");
          return m.reply(`🕸️ Demoted to civilian: @${finalTarget.split("@")[0]}!`, { mentions: [finalTarget] });
        } catch (err) {
          return m.reply(`⚠️ Could not demote member: ${err.message}`);
        }
      }

      case "mute": {
        if (!isBotAdmin && !isCreator) return m.reply("🕸️ *Action Required:* The bot/account must have **Group Admin** permissions in this group to mute the chat.");
        await doReact("🔒");
        await SpiderBot.groupSettingUpdate(m.from, "announcement");
        return m.reply("🔒 *Group Muted:* Only Admins can send messages now.");
      }

      case "unmute": {
        if (!isBotAdmin && !isCreator) return m.reply("🕸️ *Action Required:* The bot/account must have **Group Admin** permissions in this group to unmute the chat.");
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
