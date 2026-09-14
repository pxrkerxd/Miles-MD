import fs from "fs";

let commands = [
  "hug",
  "slap",
  "punch",
  "dropkick",
  "spidkick",
  "rkick",
  "spiderkick",
  "pat",
  "kiss",
  "dance",
  "webshoot",
  "bonk",
];

// Verified 100% Spider-Man & Spider-Verse Animated Video/GIF Clips (MP4)
const SPIDERMAN_REACTIONS = {
  slap: [
    "https://media.tenor.com/TXdibzXCOEAAAAPo/spiderman-ass-ass-clap.mp4",
  ],
  punch: [
    "https://media.tenor.com/grsJv6rF2zwAAAPo/spider-man-punch.mp4",
    "https://media.tenor.com/hIQCuZpKyA8AAAPo/webhead907-spiderman.mp4",
  ],
  dropkick: [
    "https://media.tenor.com/hVLTsc5nlHQAAAPo/kicked-off-spider-man.mp4",
    "https://media.tenor.com/L1hubOoT-pMAAAPo/spider-man-rider-kick.mp4",
  ],
  spidkick: [
    "https://media.tenor.com/hVLTsc5nlHQAAAPo/kicked-off-spider-man.mp4",
    "https://media.tenor.com/L1hubOoT-pMAAAPo/spider-man-rider-kick.mp4",
  ],
  rkick: [
    "https://media.tenor.com/hVLTsc5nlHQAAAPo/kicked-off-spider-man.mp4",
    "https://media.tenor.com/L1hubOoT-pMAAAPo/spider-man-rider-kick.mp4",
  ],
  spiderkick: [
    "https://media.tenor.com/hVLTsc5nlHQAAAPo/kicked-off-spider-man.mp4",
    "https://media.tenor.com/L1hubOoT-pMAAAPo/spider-man-rider-kick.mp4",
  ],
  hug: [
    "https://media.tenor.com/rNosc6tFFuEAAAPo/hug-couple.mp4",
    "https://media.tenor.com/dmJZfbc9FdgAAAPo/spider-man-gwen-stacy.mp4",
    "https://media.tenor.com/m3qx0LdrgmQAAAPo/spiderman-gwen-stacy.mp4",
    "https://media.tenor.com/rW4HtdpmZxAAAAPo/hug-spider-man.mp4",
  ],
  kiss: [
    "https://media.tenor.com/e9kVYRkX7HAAAAPo/spiderman-mary-jane.mp4",
  ],
  dance: [
    "https://media.giphy.com/media/cgLnOHV8mhaGk/giphy.mp4",
  ],
  webshoot: [
    "https://media.tenor.com/-pKVgn7XvR8AAAPo/spider-man-spider-man-1981.mp4",
  ],
  bonk: [
    "https://media.tenor.com/s8K39uERsJ4AAAPo/spider-man-black-panther.mp4",
  ],
  pat: [
    "https://media.tenor.com/5-OmzmGFq8kAAAPo/spider-man-hey.mp4",
  ],
};

export default {
  name: "reactions",
  alias: [...commands],
  uniquecommands: [
    "hug",
    "slap",
    "punch",
    "dropkick",
    "spidkick",
    "rkick",
    "pat",
    "kiss",
    "dance",
    "webshoot",
    "bonk",
  ],
  description: "Spider-Man & Spider-Verse animated reaction clips",
  start: async (SpiderBot, m, { inputCMD, text, doReact }) => {
    await doReact("🕷️");

    // 1. Robust Target Extraction (Quoted message, Mentioned JID, or text number)
    let targetJid = null;

    if (m.quoted?.sender) {
      targetJid = m.quoted.sender;
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
      targetJid = m.mentionedJid[0];
    } else if (m.mentions && m.mentions.length > 0) {
      targetJid = m.mentions[0];
    } else if (text) {
      const numMatch = text.match(/([0-9]{5,16})/);
      if (numMatch) {
        targetJid = numMatch[1] + "@s.whatsapp.net";
      }
    }

    const senderTag = `@${m.sender.split("@")[0]}`;
    const targetTag = targetJid
      ? `@${targetJid.split("@")[0]}`
      : text
        ? text.trim()
        : "someone in the multiverse";

    const textMap = {
      slap: `🖐️💥 ${senderTag} delivered a comic-book Spider-Slap to ${targetTag}!`,
      punch: `🥊⚡ ${senderTag} hit ${targetTag} with a bio-electric Venom Punch!`,
      dropkick: `🥋💫 ${senderTag} dropkicked ${targetTag} across dimensions!`,
      spidkick: `🥋💫 ${senderTag} dropkicked ${targetTag} across dimensions!`,
      rkick: `🥋💫 ${senderTag} dropkicked ${targetTag} across dimensions!`,
      spiderkick: `🥋💫 ${senderTag} dropkicked ${targetTag} across dimensions!`,
      hug: `🫂🕸️ ${senderTag} gave ${targetTag} a warm Spider-Hero hug!`,
      kiss: `💋🕸️ ${senderTag} gave ${targetTag} an iconic upside-down Spider-Man kiss!`,
      dance: `🕺🎶 ${senderTag} is hitting the legendary Spider-Man street dance with ${targetTag}!`,
      webshoot: `🕸️🎯 ${senderTag} shot a thick web right in ${targetTag}'s face!`,
      pat: `🐾✨ ${senderTag} patted ${targetTag} 🤌🏻.`,
    };

    const reactionText =
      textMap[inputCMD] || `${senderTag} reacted to ${targetTag}!`;
    const mentions = [
      m.sender,
      ...(targetJid ? [targetJid] : []),
      ...(m.mentionedJid || []),
    ];

    // 2. Spider-Man Video / GIF selection
    const clips = SPIDERMAN_REACTIONS[inputCMD] || SPIDERMAN_REACTIONS.slap;
    const clipTarget = clips[Math.floor(Math.random() * clips.length)];

    try {
      if (clipTarget) {
        // If it's a local file path
        if (typeof clipTarget === "string" && fs.existsSync(clipTarget)) {
          const buffer = fs.readFileSync(clipTarget);
          return await SpiderBot.sendMessage(
            m.from,
            {
              video: buffer,
              gifPlayback: true,
              caption: reactionText,
              mentions,
            },
            { quoted: m }
          );
        }

        // Otherwise treat as Web URL
        return await SpiderBot.sendMessage(
          m.from,
          {
            video: { url: clipTarget },
            gifPlayback: true,
            caption: reactionText,
            mentions,
          },
          { quoted: m }
        );
      }
    } catch (err) {
      console.warn("[ SPIDER REACTION VIDEO ERROR, FALLING BACK TO TEXT ]", err.message);
    }

    // Fallback to tagged text message if network issue
    return await SpiderBot.sendMessage(
      m.from,
      {
        text: reactionText,
        mentions,
      },
      { quoted: m }
    );
  },
};
