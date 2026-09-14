let commands = [
  "roast",
  "ship",
  "8ball",
  "coinflip",
  "flip",
  "dice",
  "roll",
  "quote",
  "truth",
  "dare",
];

const ROASTS = [
  "You look like an anomaly Miguel O'Hara wouldn't even bother capturing.",
  "Even Spider-Ham has more street cred in Brooklyn than you.",
  "Your spider-sense is permanently set to lagging.",
  "You're like the Spot before he figured out where the holes went.",
  "If Peter B. Parker mentor taught you, he'd ask for his sweatpants back.",
  "You're about as intimidating as Spider-Rex with clipped nails.",
];

const SPIDER_QUOTES = [
  "“Anyone can wear the mask. You can wear the mask. If you didn't know that before, I hope you do now.” — Miles Morales",
  "“That's all it is, Miles. A leap of faith.” — Peter B. Parker",
  "“Everyone keeps telling me how my story is supposed to go... nah, I'mma do my own thing.” — Miles Morales",
  "“Wherever I go, the wind follows. And the wind, it smells like rain.” — Spider-Man Noir",
  "“You gotta do what you gotta do, no matter what it takes.” — Gwen Stacy",
  "“You're the best of all of us, Miles. Just keep going.” — Uncle Aaron",
];

const TRUTHS = [
  "What is the most embarrassing thing your spider-sense failed to warn you about?",
  "If you had to team up with one villain from the Spider-Verse, who would it be?",
  "Have you ever lied about watching a movie to look cool?",
  "Who in this chat would make the worst superhero mentor?",
];

const DARES = [
  "Send a voice note shouting 'NAH, I'MMA DO MY OWN THING!'",
  "Change your WhatsApp bio to '🕸️ Friendly Neighborhood Anomaly' for 24 hours.",
  "Send a message in the chat explaining why Chai Tea makes sense (and face Pavitr's wrath).",
  "Send a selfie doing the Spider-Man web-shooter hand sign!",
];

export default {
  name: "fun",
  alias: [...commands],
  uniquecommands: ["roast", "ship", "8ball", "coinflip", "dice", "quote", "truth", "dare"],
  description: "Multiverse fun, roasts, games, and quotes",
  start: async (SpiderBot, m, { inputCMD, text, doReact, pushName }) => {
    switch (inputCMD) {
      case "roast": {
        await doReact("🔥");
        let target = "";
        let mentions = [];
        if (m.quoted?.sender) {
          target = `@${m.quoted.sender.split("@")[0]}`;
          mentions.push(m.quoted.sender);
        } else if (m.mentionedJid && m.mentionedJid.length > 0) {
          target = `@${m.mentionedJid[0].split("@")[0]}`;
          mentions.push(m.mentionedJid[0]);
        } else if (text && text.trim().length > 0) {
          target = text.trim();
        } else {
          target = `@${m.sender.split("@")[0]}`;
          mentions.push(m.sender);
        }
        const roast = ROASTS[Math.floor(Math.random() * ROASTS.length)];
        return m.reply(`🔥 *SPIDER ROAST:* ${target}\n\n"${roast}" 💥`, { mentions });
      }

      case "ship": {
        await doReact("💘");
        const percent = Math.floor(Math.random() * 101);
        let bar = "█".repeat(Math.floor(percent / 10)) + "░".repeat(10 - Math.floor(percent / 10));
        let comment = "";
        if (percent > 85) comment = "Multiverse soulmates! Even across dimensions! 💖";
        else if (percent > 50) comment = "Decent compatibility. Like Peter B. and a cheeseburger! 🍔";
        else comment = "Total anomaly. Miguel O'Hara is on the way to break this up. 🚨";

        let targetPair = "";
        let mentions = [];
        if (m.mentionedJid && m.mentionedJid.length >= 2) {
          targetPair = `@${m.mentionedJid[0].split("@")[0]} ❤️ @${m.mentionedJid[1].split("@")[0]}`;
          mentions.push(m.mentionedJid[0], m.mentionedJid[1]);
        } else if (m.mentionedJid && m.mentionedJid.length === 1) {
          targetPair = `@${m.sender.split("@")[0]} ❤️ @${m.mentionedJid[0].split("@")[0]}`;
          mentions.push(m.sender, m.mentionedJid[0]);
        } else if (m.quoted?.sender) {
          targetPair = `@${m.sender.split("@")[0]} ❤️ @${m.quoted.sender.split("@")[0]}`;
          mentions.push(m.sender, m.quoted.sender);
        } else if (text && text.trim().length > 0) {
          targetPair = `@${m.sender.split("@")[0]} ❤️ ${text.trim()}`;
          mentions.push(m.sender);
        } else {
          targetPair = `@${m.sender.split("@")[0]} ❤️ Mystery Partner 💖`;
          mentions.push(m.sender);
        }

        return m.reply(
          `💘 *MULTIVERSE COMPATIBILITY RADAR* 💘\n\nTarget: ${targetPair}\nCompatibility: *${percent}%* [${bar}]\n\n_${comment}_`,
          { mentions }
        );
      }

      case "8ball": {
        await doReact("🎱");
        const answers = [
          "My Spider-Sense says YES! 🕸️",
          "Definitely in this universe!",
          "Ask Peter B. Parker, I'm swinging right now.",
          "Nah, I'mma do my own thing — NO.",
          "Outlook cloudy, like Nueva York in 2099.",
          "100% CANON! It will happen!",
          "Very doubtful, my guy.",
        ];
        const answer = answers[Math.floor(Math.random() * answers.length)];
        return m.reply(`🎱 *MAGIC 8-BALL SAYS:*\n\n"${answer}"`);
      }

      case "coinflip":
      case "flip": {
        await doReact("🪙");
        const result = Math.random() > 0.5 ? "HEADS (Spider-Logo)" : "TAILS (Web)";
        return m.reply(`🪙 *COIN FLIP:* Result is *${result}*!`);
      }

      case "dice":
      case "roll": {
        await doReact("🎲");
        const diceNum = Math.floor(Math.random() * 6) + 1;
        return m.reply(`🎲 *DICE ROLL:* You rolled a *${diceNum}*!`);
      }

      case "quote": {
        await doReact("💬");
        const q = SPIDER_QUOTES[Math.floor(Math.random() * SPIDER_QUOTES.length)];
        return m.reply(`💬 *SPIDER-VERSE WISDOM:*\n\n${q}`);
      }

      case "truth": {
        await doReact("🤔");
        const t = TRUTHS[Math.floor(Math.random() * TRUTHS.length)];
        return m.reply(`🎭 *TRUTH CHALLENGE:*\n\n${t}`);
      }

      case "dare": {
        await doReact("⚡");
        const d = DARES[Math.floor(Math.random() * DARES.length)];
        return m.reply(`⚡ *DARE CHALLENGE:*\n\n${d}`);
      }
    }
  },
};
