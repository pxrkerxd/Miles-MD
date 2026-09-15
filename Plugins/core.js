import fs from "fs";
import path from "path";
import os from "os";
import { pathToFileURL } from "url";

let mergedCommands = [
  "help",
  "h",
  "menu",
  "owner",
  "creator",
  "developer",
  "dev",
  "sc",
  "script",
  "support",
  "alive",
  "uptime",
  "runtime",
  "ping",
  "status",
  "restart",
  "reboot",
];

export default {
  name: "systemcommands",
  alias: [...mergedCommands],
  uniquecommands: ["menu", "owner", "alive", "ping", "uptime", "script", "support", "restart"],
  description: "Core Spider-Verse system commands",
  start: async (
    SpiderBot,
    m,
    {
      pushName,
      prefix,
      inputCMD,
      doReact,
      text,
      args,
      isCreator,
      botName,
      activeChar,
    }
  ) => {
    switch (inputCMD) {
      case "owner":
      case "creator":
      case "developer":
      case "dev": {
        await doReact("👑");
        const ownerNum = (global.owner && global.owner[0]) || "919123764864";
        const ownerName = global.ownername || "Parker";
        const ownerJid = `${ownerNum}@s.whatsapp.net`;

        const vcard =
          "BEGIN:VCARD\n" +
          "VERSION:3.0\n" +
          `FN:${ownerName}\n` +
          "ORG:Spider-Society (Earth-1610);\n" +
          `TEL;type=CELL;type=VOICE;waid=${ownerNum}:+${ownerNum}\n` +
          "END:VCARD";

        try {
          await SpiderBot.sendMessage(
            m.from,
            {
              contacts: {
                displayName: ownerName,
                contacts: [{ vcard }],
              },
            },
            { quoted: m }
          );
        } catch (e) {}

        const ownerCard = [
          `╔════〔 👑 *BOT OWNER & CREATOR* 〕════╗`,
          `║ 👤 *Name:* ${ownerName}`,
          `║ 🕷️ *Identity:* Peter Parker / Bot Architect`,
          `║ 📱 *Contact:* @${ownerNum}`,
          `║ 🌐 *Universe:* Earth-616 / Earth-1610`,
          `║ ⚡ *Status:* Online & Active in Multiverse`,
          `║ 💬 *Motto:* "With great power comes great responsibility."`,
          `╚══════════════════════════════════════╝`,
          `\n_Feel free to reach out for questions, bot features, or spider-tech!_ 🕸️`,
        ].join("\n");

        return m.reply(ownerCard, { mentions: [ownerJid] });
      }

      case "ping": {
        const start = Date.now();
        await doReact("⚡");
        const latency = Date.now() - start;
        return m.reply(`🕸️ *Spider-Sense Latency:* \`${latency}ms\`\n⚡ *Status:* All multiverse webs operational!`);
      }

      case "alive":
      case "uptime":
      case "runtime":
      case "status": {
        await doReact("🕷️");
        const upSec = Math.floor(process.uptime());
        const upH = Math.floor(upSec / 3600);
        const upM = Math.floor((upSec % 3600) / 60);
        const upS = upSec % 60;
        const uptimeStr = `${upH}h ${upM}m ${upS}s`;

        const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
        const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);

        const aliveText = [
          `╭━━━〔 🕷️ *MILES MORALES MD* 〕━━━╮`,
          `┃ ⚡ *Status:* Operational`,
          `┃ 👤 *Hero:* Miles Morales (Earth-1610)`,
          `┃ 💬 *Quote:* "Nah, I'mma do my own thing."`,
          `┃ ⏱️ *Web Uptime:* ${uptimeStr}`,
          `┃ 🧠 *Memory:* ${freeMem}GB / ${totalMem}GB Free`,
          `┃ 🌐 *Platform:* ${os.platform()} (${os.arch()})`,
          `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`,
          `\n_Type \`${prefix}menu\` to view all Spider-Verse commands!_`,
        ].join("\n");

        try {
          if (fs.existsSync("./Assets/Miles.jpg")) {
            const pic = fs.readFileSync("./Assets/Miles.jpg");
            return await SpiderBot.sendMessage(
              m.from,
              { image: pic, caption: aliveText },
              { quoted: m }
            );
          }
        } catch (e) {}

        return m.reply(aliveText);
      }

      case "script":
      case "sc": {
        await doReact("📜");
        const scriptMsg = [
          `🕷️ *MILES MORALES MD - SOURCE REPO* 🕷️`,
          ``,
          `*Creator & Theme:* Miles Morales (Earth-1610)`,
          `*Inspired by:* Atlas-MD by FantoX & Team Atlas`,
          `*Engine:* Baileys v7 Multi-Device`,
          `*Personality:* Brooklyn Swagger & Triple AI (Gemini/OpenAI)`,
          ``,
          `⭐ *Features:* Dual Auth, 20 Spider-Verse Characters, Downloaders, Sticker Studio, Group Security.`,
          ``,
          `_Stay original. Do your own thing._ 🕸️`,
        ].join("\n");

        return m.reply(scriptMsg);
      }

      case "support": {
        await doReact("🤝");
        return m.reply(
          `🕷️ *Spider-Verse Support Terminal*\n\nNeed help with commands or setup?\nCheck out the web dashboard or contact the creator in \`.env\`.\n\n*Remember:* Anyone can wear the mask!`
        );
      }

      case "help":
      case "h":
      case "menu": {
        await doReact("🕸️");
        await SpiderBot.sendPresenceUpdate("composing", m.from);

        const upSec = Math.floor(process.uptime());
        const upH = Math.floor(upSec / 3600);
        const upM = Math.floor((upSec % 3600) / 60);
        const upS = upSec % 60;
        const uptimeStr = `${upH}h ${upM}m ${upS}s`;

        const categoryOrder = [
          "core",
          "spiderverse",
          "ai-studio",
          "youtube-dl",
          "downloader",
          "rpg-level",
          "audio-fx",
          "sticker",
          "group",
          "group-tools",
          "moderator",
          "search",
          "games",
          "fun",
          "reactions",
          "tools",
          "converter",
        ];

        const categoryMeta = {
          core: { title: "SYSTEM COMMANDS", icon: "🌐" },
          spiderverse: { title: "SPIDER-VERSE SPECIAL", icon: "🕷️" },
          "ai-studio": { title: "AI ART & VISION", icon: "🎨" },
          "youtube-dl": { title: "YOUTUBE SUITE", icon: "🎬" },
          downloader: { title: "MEDIA DOWNLOADERS", icon: "📥" },
          "rpg-level": { title: "SPIDER-VERSE RPG & RANK", icon: "🏆" },
          games: { title: "INTERACTIVE GAMES & ARCADE", icon: "🎮" },
          "audio-fx": { title: "AUDIO EFFECTS STUDIO", icon: "🎧" },
          sticker: { title: "STICKER WORKSHOP", icon: "🎭" },
          group: { title: "GROUP DEFENSE", icon: "🛡️" },
          "group-tools": { title: "GROUP POWER TOOLS", icon: "⚡" },
          moderator: { title: "MODERATOR & CONTROL", icon: "🔨" },
          search: { title: "SEARCH & RADAR", icon: "🔍" },
          fun: { title: "FUN & GAMES", icon: "🎲" },
          reactions: { title: "SPIDER-MAN REACTIONS", icon: "🥊" },
          tools: { title: "SPIDER TOOLS", icon: "🧰" },
          converter: { title: "MEDIA CONVERTERS", icon: "🔄" },
        };

        const pluginsDir = path.join(process.cwd(), "Plugins");
        const files = fs.readdirSync(pluginsDir).filter((f) => f.endsWith(".js"));

        // Load all plugins mapping
        const pluginMap = new Map();
        for (const file of files) {
          try {
            const filePath = path.join(pluginsDir, file);
            const mod = await import(pathToFileURL(filePath).href);
            const cmd = mod.default;
            if (cmd) {
              const nameKey = file.replace(".js", "");
              pluginMap.set(nameKey, cmd);
            }
          } catch (e) {}
        }

        // 1. Specific command lookup (e.g. /help play)
        const query = (text || "").trim().toLowerCase().replace(/^\//, "");
        if (query) {
          for (const [key, plugin] of pluginMap.entries()) {
            const list = plugin.uniquecommands || [];
            const aliases = plugin.alias || [];
            if (list.includes(query) || aliases.includes(query)) {
              const meta = categoryMeta[key] || { title: key.toUpperCase(), icon: "⚡" };
              const intelCard = [
                `╔════〔 🕷️ *COMMAND INTEL* 〕════╗`,
                `║ ⚡ *Command:* \`${prefix}${query}\``,
                `║ 📂 *Category:* ${meta.icon} ${meta.title}`,
                `║ 📝 *Details:* ${plugin.description || "No description provided."}`,
                `║ 🔄 *Aliases:* ${aliases.map((a) => `\`${prefix}${a}\``).join(", ") || "None"}`,
                `║ 💡 *Usage:* \`${prefix}${query}\``,
                `╚══════════════════════════════╝`,
              ].join("\n");
              return m.reply(intelCard);
            }
          }
        }

        // 2. Full structured menu
        let sections = [];
        let totalCount = 0;

        for (const key of categoryOrder) {
          const plugin = pluginMap.get(key);
          if (plugin && (plugin.uniquecommands || plugin.alias)) {
            const list = plugin.uniquecommands || plugin.alias;
            const meta = categoryMeta[key] || { title: key.toUpperCase(), icon: "⚡" };
            totalCount += list.length;
            const formattedList = list.map((c) => `│  › \`${prefix}${c}\``).join("\n");
            sections.push(`╭─❮ ${meta.icon} *${meta.title}* ❯\n${formattedList}\n╰───────────────`);
          }
        }

        // Catch any extra custom plugins outside the categoryOrder list
        for (const [key, plugin] of pluginMap.entries()) {
          if (!categoryOrder.includes(key) && plugin && (plugin.uniquecommands || plugin.alias)) {
            const list = plugin.uniquecommands || plugin.alias;
            totalCount += list.length;
            const formattedList = list.map((c) => `│  › \`${prefix}${c}\``).join("\n");
            sections.push(`╭─❮ ⚡ *${key.toUpperCase()}* ❯\n${formattedList}\n╰───────────────`);
          }
        }

        const menuHeader = [
          `╔════════════════════════════╗`,
          `  🕷️ *MILES MORALES MD* // ISSUE #1610  `,
          `  _"Nah, I'mma do my own thing."_  `,
          `╚════════════════════════════╝`,
          ``,
          `  👤 *Hero:* Miles Morales (Earth-1610)`,
          `  👑 *Owner:* ${global.ownername || "Parker"}`,
          `  ⚡ *Prefix:* \`${prefix}\``,
          `  📚 *Abilities:* ${totalCount} active commands`,
          `  ⏱️ *Uptime:* ${uptimeStr}`,
          ``,
          sections.join("\n\n"),
          ``,
          `_Tip: Use \`${prefix}help <command>\` for detailed command guide!_ 🕸️`,
          `_Tip: Tag me or reply in any chat to chat with Miles AI!_ 🤖`,
        ].join("\n");

        // Send with local image asset if present, fallback gracefully to text
        try {
          if (fs.existsSync("./Assets/Miles.jpg")) {
            const pic = fs.readFileSync("./Assets/Miles.jpg");
            return await SpiderBot.sendMessage(
              m.from,
              { image: pic, caption: menuHeader },
              { quoted: m }
            );
          }
        } catch (err) {
          console.warn("[ MENU IMAGE ERROR, FALLING BACK TO TEXT ]", err.message);
        }

        return m.reply(menuHeader);
      }

      case "reboot":
      case "restart": {
        if (!isCreator) {
          await doReact("❌");
          return m.reply("🚫 *Access Denied:* Only the bot owner can reboot Miles Morales MD!");
        }
        await doReact("🔄");
        await m.reply("🕸️ *Rebooting Spider-Bot...* Multiverse portal will reopen in 3 seconds!");
        setTimeout(() => process.exit(0), 2000);
        break;
      }
    }
  },
};
