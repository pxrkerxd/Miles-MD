import fs from "fs";

let commands = [
  "miles",
  "intro",
  "about",
  "spidersense",
  "venom",
  "venomblast",
  "camouflage",
  "invis",
  "leapoffaith",
  "canon",
  "punk",
  "chai",
  "spidertrivia",
  "spidersuit",
  "multiverse",
];

const TRIVIA_QUESTIONS = [
  {
    q: "What number was on the radioactive spider that bit Miles Morales in Into the Spider-Verse?",
    a: "Spider #42 (from Alchemax / Earth-42)!",
  },
  {
    q: "What song does Miles sing with his headphones on at the beginning of Into the Spider-Verse?",
    a: "Sunflower by Post Malone & Swae Lee!",
  },
  {
    q: "Who is the Prowler on Earth-42?",
    a: "Miles G. Morales himself!",
  },
  {
    q: "What instrument does Gwen Stacy play in her band?",
    a: "The Drums (in The Mary Janes)!",
  },
  {
    q: "Why does Pavitr Prabhakar get mad at Miles about tea?",
    a: "Because Miles called it 'Chai tea' — Chai means tea, bro!",
  },
  {
    q: "What is Hobie Brown's electric weapon of choice?",
    a: "His custom electric bass/guitar!",
  },
];

const MILES_SUITS = [
  {
    name: "Classic Black & Red Suit (Earth-1610)",
    desc: "Crafted with spray paint over Peter's old suit. Features the iconic red graffiti spider emblem.",
    img: "https://wallpapercave.com/wp/wp3843516.jpg",
  },
  {
    name: "Across the Spider-Verse Suit",
    desc: "Upgraded sleeker design with bleeding red arm stripes, sharper mask lenses, and venom-conducting fabric.",
    img: "https://wallpapercave.com/wp/wp3843516.jpg",
  },
  {
    name: "2020 Cyberpunk Suit",
    desc: "Futuristic neon LED visor, high-top kicks, and digital soundwave chest display.",
    img: "https://wallpapercave.com/wp/wp3843516.jpg",
  },
  {
    name: "Bodega Cat Suit",
    desc: "Includes a cute ginger cat wearing a Spider-Man mask inside Miles' backpack who jumps out during finishing moves!",
    img: "https://wallpapercave.com/wp/wp3843516.jpg",
  },
  {
    name: "The End Suit",
    desc: "Designed for an older Miles in a dystopian future with a Brooklyn camo jacket and glowing venom gauntlets.",
    img: "https://wallpapercave.com/wp/wp3843516.jpg",
  },
];

const MULTIVERSE_EARTHS = [
  { earth: "Earth-1610", hero: "Miles Morales", vibe: "Brooklyn, graffiti, hip-hop, venom blast, modern Spider-Man." },
  { earth: "Earth-65", hero: "Gwen Stacy (Ghost-Spider)", vibe: "Pastel watercolor skyline, punk rock drums, ballet web-swinging." },
  { earth: "Earth-928", hero: "Miguel O'Hara (2099)", vibe: "Nueva York, high-tech dystopian city, holo-webs, strict canon timeline." },
  { earth: "Earth-138", hero: "Hobie Brown (Spider-Punk)", vibe: "Anarchist London, punk rock collage, zero tolerance for authority." },
  { earth: "Earth-50101", hero: "Pavitr Prabhakar", vibe: "Mumbattan, vibrant colors, flowing hair, yo-yo web spinners, no 'chai tea'!" },
  { earth: "Earth-90214", hero: "Spider-Man Noir", vibe: "1933 Great Depression, trench coat, fedora, shadow investigation, rubik's cube." },
  { earth: "Earth-8311", hero: "Peter Porker (Spider-Ham)", vibe: "Cartoon physics, oversized wooden mallets, anvil drops, talking pig." },
  { earth: "Earth-42", hero: "Miles G. Morales (The Prowler)", vibe: "Dimension without a Spider-Man, Sinister Six cartel, vigilante Prowler." },
];

export default {
  name: "spiderverse",
  alias: [...commands],
  uniquecommands: ["miles", "spidersense", "venom", "camouflage", "leapoffaith", "canon", "punk", "chai", "spidertrivia", "spidersuit", "multiverse"],
  description: "Exclusive Miles Morales & Spider-Verse lore commands",
  start: async (
    SpiderBot,
    m,
    { inputCMD, doReact, text, pushName, prefix }
  ) => {
    switch (inputCMD) {
      case "miles":
      case "intro":
      case "about": {
        await doReact("🕷️");
        const pref = prefix || "/";
        const ownerNum = (global.owner && global.owner[0]) || "919123764864";
        const ownerJid = `${ownerNum}@s.whatsapp.net`;
        const ownerName = global.ownername || "Parker";

        const introText = [
          `╔═══════════════════════════════════╗`,
          `  🕷️ *MILES MORALES MD // EARTH-1610*  `,
          `  _"Everyone keeps telling me how my story_  `,
          `  _is supposed to go... nah, I'mma do my own thing."_`,
          `╚═══════════════════════════════════╝`,
          ``,
          `Yo, what's good! I'm *Miles Morales* — your friendly neighborhood Spider-Man swinging straight out of Brooklyn, Earth-1610. 🕸️`,
          ``,
          `⚡ *Hero Intel:*`,
          `• 👤 *Alias:* Spider-Man / Brooklyn's Own`,
          `• 🧬 *Powers:* Bio-Electric Venom Blast, Camouflage, Wall-Crawling & Spider-Sense`,
          `• 👑 *Bot Architect:* ${ownerName} (@${ownerNum})`,
          `• 🎧 *Signature Vibe:* Hip-Hop, Spray Paint, Air Jordan 1s & Leap of Faith`,
          `• 🌐 *Universe:* Earth-1610 (Multiverse Connected)`,
          ``,
          `🧠 *What I Can Do For You:*`,
          `• 🤖 *AI Chat:* Tag or reply to me anywhere to chat with Brooklyn flavor`,
          `• 🎨 *AI Art & Vision:* Generate art with \`${pref}imagine\` and inspect photos with \`${pref}vision\``,
          `• 📥 *Media Downloader:* Fast downloads for YouTube, Spotify, TikTok, IG & Pinterest`,
          `• 🎧 *Audio FX Studio:* Slowed, Reverb, Bass Boost, 8D & Nightcore effects`,
          `• 🛡️ *Group Security:* Anti-link protection, warnings, polls & welcome protocols`,
          `• 🏆 *Spider-RPG:* Earn XP, level up, and climb the Multiverse leaderboard`,
          ``,
          `_Type \`${pref}menu\` or \`${pref}help\` to explore all 105+ spider-abilities!_ 🕸️`,
        ].join("\n");

        if (fs.existsSync("./Assets/MilesIntro.jpg")) {
          const introImg = fs.readFileSync("./Assets/MilesIntro.jpg");
          return await SpiderBot.sendMessage(
            m.from,
            {
              image: introImg,
              caption: introText,
              mentions: [ownerJid],
            },
            { quoted: m }
          );
        } else {
          return await SpiderBot.sendMessage(
            m.from,
            {
              image: { url: "https://i.pinimg.com/736x/2c/11/03/2c1103aed75a5af483500c6e81ec2a90.jpg" },
              caption: introText,
              mentions: [ownerJid],
            },
            { quoted: m }
          );
        }
      }

      case "spidersense": {
        await doReact("⚡");
        const dangerLevels = [
          { level: "Low", msg: "Just Uncle Aaron's text message checking on homework." },
          { level: "Medium", msg: "Spot spotted near the ATM! Be ready to swing." },
          { level: "CRITICAL", msg: "MIGUEL O'HARA IS HEADING YOUR WAY! TIME TO GO INVISIBLE!" },
          { level: "Vibe Check", msg: "No threats detected. Just Brooklyn at sunset with Post Malone on the headphones." },
        ];
        const chosen = dangerLevels[Math.floor(Math.random() * dangerLevels.length)];

        const senseText = [
          `⚡⚡⚡ *SPIDER-SENSE TINGLING!* ⚡⚡⚡`,
          ``,
          `*Hero:* ${pushName}`,
          `*Danger Level:* [ ${chosen.level} ]`,
          `*Intuition:* ${chosen.msg}`,
          ``,
          `_Stay frosty, Spider-Hero._ 🕸️`,
        ].join("\n");

        return m.reply(senseText);
      }

      case "venom":
      case "venomstrike":
      case "venomblast": {
        await doReact("⚡");
        const target = m.quoted
          ? `@${m.quoted.sender.split("@")[0]}`
          : m.mentionedJid && m.mentionedJid.length > 0
          ? `@${m.mentionedJid[0].split("@")[0]}`
          : text
          ? text
          : "the surrounding villains";
        const venomMsg = [
          `⚡⚡⚡ *BIO-ELECTRIC VENOM STRIKE!* ⚡⚡⚡`,
          ``,
          `*Miles Morales charges up bio-electric current...*`,
          `💥 *BZZZZZZT!* 💥`,
          `Miles releases a 100,000-volt Venom Blast straight at *${target}*!`,
          ``,
          `_Target paralyzed and blown back through a billboard!_`,
        ].join("\n");

        return m.reply(venomMsg);
      }

      case "camouflage":
      case "invis": {
        await doReact("👻");
        const invisMsg = [
          `🕶️ *CAMOUFLAGE ACTIVATED* 🕶️`,
          ``,
          `*Miles Morales bends light particles...*`,
          `...`,
          `...`,
          `Miles has turned completely invisible! 🥷`,
          ``,
          `_You can't hit what you can't see, fam._`,
        ].join("\n");

        return m.reply(invisMsg);
      }

      case "leapoffaith": {
        await doReact("🏙️");
        const leapText = [
          `🌆 *THE LEAP OF FAITH* 🌆`,
          ``,
          `*Miles:* "When do I know I'm ready?"`,
          `*Peter B. Parker:* "You won't. That's all it is, Miles. A leap of faith."`,
          ``,
          `✨ Whatever you're hesitating about today, ${pushName}... take the leap.`,
          `You don't need permission to be great. Just jump. 🕸️`,
        ].join("\n");

        try {
          if (fs.existsSync("./Assets/Miles.jpg")) {
            const pic = fs.readFileSync("./Assets/Miles.jpg");
            return await SpiderBot.sendMessage(m.from, { image: pic, caption: leapText }, { quoted: m });
          }
        } catch (e) {}

        return m.reply(leapText);
      }

      case "canon": {
        await doReact("🚨");
        const target = text || (m.quoted ? m.quoted.text : "this situation");
        const canonMsg = [
          `🚨🚨 *MIGUEL O'HARA // SPIDER-MAN 2099 ALERT* 🚨🚨`,
          ``,
          `*"STOP! You cannot change this! It's a CANON EVENT!"*`,
          ``,
          `Disruption Detected: *"${target}"*`,
          `Timeline: Under observation by the Spider Society.`,
          ``,
          `*Miles Morales:* "Nah, I'mma do my own thing!" 💥`,
        ].join("\n");

        return m.reply(canonMsg);
      }

      case "punk": {
        await doReact("🎸");
        const punkWisdom = [
          "I don't believe in consistency. Consistency is for fascists.",
          "I don't have a label. The moment you label something, you own it.",
          "Rules? Made to be smashed with a Gibson Les Paul.",
          "You're not an imposter. You're an anarchist waiting to wake up.",
          "Taking down the establishment before bedtime.",
        ];
        const randomPunk = punkWisdom[Math.floor(Math.random() * punkWisdom.length)];
        return m.reply(`🎸 *HOBIE BROWN (SPIDER-PUNK) SAYS:* \n\n_"${randomPunk}"_ ⚡`);
      }

      case "chai": {
        await doReact("☕");
        return m.reply(
          `☕ *PAVITR PRABHAKAR (SPIDER-MAN INDIA):*\n\n"What did you just say?! *'Chai tea'?!*\n'Chai' MEANS tea, bro! You are saying *'tea tea'*! Would I ask you for a 'coffee coffee' with room for 'cream cream'?! NO!" 😤`
        );
      }

      case "spidertrivia": {
        await doReact("❓");
        const item = TRIVIA_QUESTIONS[Math.floor(Math.random() * TRIVIA_QUESTIONS.length)];
        return m.reply(
          `🧠 *SPIDER-VERSE TRIVIA CHALLENGE*\n\n*Question:* ${item.q}\n\n||*Answer:* ${item.a}||`
        );
      }

      case "spidersuit": {
        await doReact("🎽");
        const suit = MILES_SUITS[Math.floor(Math.random() * MILES_SUITS.length)];
        const suitText = [
          `🎽 *SUIT SHOWCASE: ${suit.name}*`,
          ``,
          `${suit.desc}`,
          ``,
          `_Brooklyn swag at its finest!_ 🕷️`,
        ].join("\n");

        try {
          if (fs.existsSync("./Assets/Miles.jpg")) {
            const pic = fs.readFileSync("./Assets/Miles.jpg");
            return await SpiderBot.sendMessage(m.from, { image: pic, caption: suitText }, { quoted: m });
          }
        } catch (e) {}

        return m.reply(suitText);
      }

      case "multiverse": {
        await doReact("🌀");
        const e = MULTIVERSE_EARTHS[Math.floor(Math.random() * MULTIVERSE_EARTHS.length)];
        return m.reply(
          `🌀 *MULTIVERSE INTEL // ${e.earth}*\n\n*Resident Spider-Hero:* ${e.hero}\n*Dimension Vibe:* ${e.vibe}\n\n_Connected via Web of Life and Destiny._`
        );
      }
    }
  },
};
