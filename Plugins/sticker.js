import { Sticker, createSticker, StickerTypes } from "wa-sticker-formatter";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import util from "util";
import ffmpegStatic from "ffmpeg-static";

const execAsync = util.promisify(exec);

let commands = ["sticker", "s", "take", "steal", "toimg", "tovideo"];

export default {
  name: "sticker",
  alias: [...commands],
  uniquecommands: ["sticker", "take", "toimg", "tovideo"],
  description: "Spider-Verse sticker studio commands",
  start: async (
    SpiderBot,
    m,
    { inputCMD, doReact, text, args, pushName, prefix }
  ) => {
    switch (inputCMD) {
      case "sticker":
      case "s": {
        await doReact("🎨");
        let target = m.quoted ? m.quoted : m;
        let mime = (target.msg || target).mimetype || "";

        if (!/image|video/.test(mime)) {
          return m.reply(`🕸️ *Spider Studio:* Reply to an image or short video/GIF with \`${prefix}s\` to turn it into a sticker!`);
        }

        try {
          const mediaBuffer = await target.download();
          if (!mediaBuffer) return m.reply("⚠️ Failed to download media.");

          const [pack, auth] = text ? text.split("|") : [global.packname, global.author];

          const sticker = new Sticker(mediaBuffer, {
            pack: (pack || global.packname).trim(),
            author: (auth || global.author).trim(),
            type: StickerTypes.FULL,
            categories: ["🕷️", "⚡"],
            quality: 70,
          });

          const stickerBuffer = await sticker.toBuffer();
          return SpiderBot.sendMessage(m.from, { sticker: stickerBuffer }, { quoted: m });
        } catch (err) {
          return m.reply(`⚠️ Sticker creation error: ${err.message}`);
        }
      }

      case "take":
      case "steal": {
        await doReact("🥷");
        if (!m.quoted || m.quoted.mtype !== "stickerMessage") {
          return m.reply(`🕸️ Reply to a sticker with \`${prefix}take <PackName> | <Author>\` to rebrand it!`);
        }

        try {
          const mediaBuffer = await m.quoted.download();
          const [pack, auth] = text ? text.split("|") : [`By ${pushName}`, "🕷️ Miles Morales MD"];

          const sticker = new Sticker(mediaBuffer, {
            pack: pack.trim(),
            author: (auth || "").trim(),
            type: StickerTypes.FULL,
            quality: 70,
          });

          const stickerBuffer = await sticker.toBuffer();
          return SpiderBot.sendMessage(m.from, { sticker: stickerBuffer }, { quoted: m });
        } catch (err) {
          return m.reply(`⚠️ Failed to rebrand sticker: ${err.message}`);
        }
      }

      case "toimg": {
        await doReact("🖼️");
        if (!m.quoted || m.quoted.mtype !== "stickerMessage") {
          return m.reply(`🕸️ Reply to a sticker with \`${prefix}toimg\` to convert it back to an image!`);
        }

        try {
          const mediaBuffer = await m.quoted.download();
          return SpiderBot.sendMessage(m.from, { image: mediaBuffer, caption: "🕸️ Converted by Miles Morales MD" }, { quoted: m });
        } catch (err) {
          return m.reply(`⚠️ Error converting sticker: ${err.message}`);
        }
      }

      case "tovideo": {
        await doReact("🎥");
        if (!m.quoted || m.quoted.mtype !== "stickerMessage") {
          return m.reply(`🕸️ Reply to an animated sticker with \`${prefix}tovideo\`!`);
        }

        try {
          const mediaBuffer = await m.quoted.download();
          const tmpWebp = path.join(process.cwd(), `tmp_${Date.now()}.webp`);
          const tmpMp4 = path.join(process.cwd(), `tmp_${Date.now()}.mp4`);

          fs.writeFileSync(tmpWebp, mediaBuffer);
          await execAsync(`"${ffmpegStatic}" -i "${tmpWebp}" -movflags faststart -pix_fmt yuv420p "${tmpMp4}"`);

          const videoBuffer = fs.readFileSync(tmpMp4);
          fs.unlinkSync(tmpWebp);
          fs.unlinkSync(tmpMp4);

          return SpiderBot.sendMessage(m.from, { video: videoBuffer, caption: "🎥 Converted by Miles Morales MD" }, { quoted: m });
        } catch (err) {
          return m.reply(`⚠️ Conversion error: ${err.message}`);
        }
      }
    }
  },
};
