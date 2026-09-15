import { getUserRPG, claimDaily, getLeaderboard, addXP, addTokens } from "../System/MongoDB/MongoDb_Core.js";

let commands = ["rank", "level", "lvl", "daily", "claim", "leaderboard", "top", "gamble", "bet", "tokens"];

const getTitle = (level) => {
  if (level >= 50) return "👑 Ultimate Spider-Man";
  if (level >= 35) return "🛡️ Multiverse Defender";
  if (level >= 20) return "🌀 Dimension Hopper";
  if (level >= 10) return "⚡ Spider-Verse Champion";
  if (level >= 5) return "🏙️ Brooklyn Vigilante";
  return "🕸️ Web-Shooter Novice";
};

const getProgressBar = (xp, level) => {
  const currentLevelBaseXP = (level - 1) * (level - 1) * 25;
  const nextLevelXP = level * level * 25;
  const needed = nextLevelXP - currentLevelBaseXP;
  const progress = Math.max(0, Math.min(1, (xp - currentLevelBaseXP) / (needed || 1)));
  const filled = Math.round(progress * 10);
  const empty = 10 - filled;
  return "█".repeat(filled) + "░".repeat(empty) + ` ${Math.round(progress * 100)}%`;
};

export default {
  name: "rpg",
  alias: [...commands],
  uniquecommands: ["rank", "daily", "leaderboard", "gamble"],
  description: "Spider-Verse RPG leveling, daily rewards, and leaderboards",
  start: async (SpiderBot, m, { inputCMD, text, doReact, prefix, pushName }) => {
    const senderNumber = m.sender.split("@")[0].replace(/[^0-9]/g, "");

    switch (inputCMD) {
      case "rank":
      case "level":
      case "lvl":
      case "tokens": {
        await doReact("⚡");
        let targetId = senderNumber;
        let targetName = pushName;

        if (m.quoted?.sender) {
          targetId = m.quoted.sender.split("@")[0].replace(/[^0-9]/g, "");
          targetName = `@${targetId}`;
        } else if (m.mentionedJid && m.mentionedJid.length > 0) {
          targetId = m.mentionedJid[0].split("@")[0].replace(/[^0-9]/g, "");
          targetName = `@${targetId}`;
        }

        const data = await getUserRPG(targetId);
        const title = getTitle(data.level);
        const bar = getProgressBar(data.xp, data.level);

        const card = [
          `╔════〔 🕷️ *SPIDER-HERO CARD* 〕════╗`,
          `║ 👤 *Hero:* ${targetName}`,
          `║ 🎖️ *Rank:* ${title}`,
          `║ ⚡ *Level:* ${data.level}`,
          `║ 🧠 *Total XP:* ${data.xp} XP`,
          `║ 🪙 *Spider-Tokens:* ${data.tokens}`,
          `║ 📊 *Progress:* [${bar}]`,
          `╚════════════════════════════════╝`,
          ``,
          `_Tip: Earn XP by chatting, using commands, and claiming \`${prefix}daily\`!_ 🕸️`,
        ].join("\n");

        return m.reply(card);
      }

      case "daily":
      case "claim": {
        await doReact("🎁");
        const res = await claimDaily(senderNumber);
        if (!res.success) {
          return m.reply(
            `🕸️ *Daily Reward on Cooldown!*\n\nYou've already claimed your Brooklyn stipend today. Come back in \`${res.waitHours} hour(s)\`!`
          );
        }

        let msg = [
          `🎁 *BROOKLYN DAILY STIPEND CLAIMED!* 🕷️`,
          ``,
          `🪙 *+${res.bonusTokens} Spider-Tokens* added to your wallet!`,
          `⚡ *+${res.bonusXP} Spider-XP* earned!`,
          `💰 *New Balance:* ${res.newTokens} Tokens | *Level:* ${res.newLevel}`,
        ];

        if (res.leveledUp) {
          msg.push(`\n🎉 *LEVEL UP!* You reached Level ${res.newLevel}! (${getTitle(res.newLevel)})`);
        }

        return m.reply(msg.join("\n"));
      }

      case "leaderboard":
      case "top": {
        await doReact("🏆");
        const top = await getLeaderboard(10);
        if (!top.length) return m.reply("🕸️ No Spider-Heroes registered yet!");

        let txt = `╔════〔 🏆 *MULTIVERSE TOP HEROES* 〕════╗\n`;
        top.forEach((u, i) => {
          const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `[${i + 1}]`;
          txt += `║ ${medal} @${u.id} — Lv.${u.level} (${u.xp} XP | 🪙${u.tokens})\n`;
        });
        txt += `╚══════════════════════════════════════╝\n\n_Type \`${prefix}rank\` to check your standing!_`;

        return SpiderBot.sendMessage(
          m.from,
          {
            text: txt,
            mentions: top.map((u) => `${u.id}@s.whatsapp.net`),
          },
          { quoted: m }
        );
      }

      case "gamble":
      case "bet": {
        const amount = parseInt(text.trim());
        if (isNaN(amount) || amount <= 0) {
          return m.reply(`Usage: \`${prefix}gamble <amount>\`\nExample: \`${prefix}gamble 50\``);
        }

        const user = await getUserRPG(senderNumber);
        if (user.tokens < amount) {
          return m.reply(`🚫 *Insufficient Tokens:* You only have \`${user.tokens}\` Spider-Tokens!`);
        }

        await doReact("🎲");
        const roll = Math.floor(Math.random() * 100) + 1;
        const win = roll > 52; // 48% win chance

        let newTokens;
        if (win) {
          newTokens = await addTokens(senderNumber, amount);
          await addXP(senderNumber, 25);
          return m.reply(
            `🎲 *SPIDER-DICE RESULT: ${roll}* (WIN!)\n🎉 You won \`+${amount}\` Spider-Tokens!\n💰 *Balance:* ${newTokens} Tokens`
          );
        } else {
          newTokens = await addTokens(senderNumber, -amount);
          return m.reply(
            `🎲 *SPIDER-DICE RESULT: ${roll}* (LOST)\n💥 You lost \`-${amount}\` Spider-Tokens.\n💰 *Balance:* ${newTokens} Tokens`
          );
        }
      }
    }
  },
};
