import fs from "fs";
import path from "path";
import { exec } from "child_process";
import util from "util";
import ffmpegStatic from "ffmpeg-static";

const execAsync = util.promisify(exec);

let commands = [
  "slowed",
  "slow",
  "reverb",
  "bass",
  "nightcore",
  "pitch",
  "robot",
  "reverse",
  "fast",
];

const FX_MAP = {
  slowed: '-af "atempo=0.85,asetrate=44100*0.9,aecho=0.8:0.88:60:0.4"',
  slow: '-af "atempo=0.8"',
  reverb: '-af "aecho=0.8:0.9:1000:0.3"',
  bass: '-af "equalizer=f=60:width_type=h:width=50:g=15"',
  nightcore: '-af "asetrate=44100*1.25,atempo=1.05"',
  pitch: '-af "asetrate=44100*1.4,atempo=0.9"',
  robot: '-af "flanger=delay=10:depth=10:regen=60"',
  reverse: '-af "areverse"',
  fast: '-af "atempo=1.5"',
};

export default {
  name: "audiofx",
  alias: [...commands],
  uniquecommands: ["slowed", "reverb", "bass", "nightcore", "pitch", "robot", "reverse", "fast"],
  description: "Spider-Verse Brooklyn Audio Studio effects",
  start: async (SpiderBot, m, { inputCMD, doReact, prefix }) => {
    const target = m.quoted ? m.quoted : m;
    const mime = (target.msg || target).mimetype || "";

    if (!/audio|video/.test(mime)) {
      return m.reply(
        `🎧 *Brooklyn Audio Studio*\n\nReply to any voice note, song, or video with:\n` +
          `  • \`${prefix}slowed\` (Lo-Fi Slowed + Reverb)\n` +
          `  • \`${prefix}bass\` (Bass Boost)\n` +
          `  • \`${prefix}nightcore\` (Fast + High Pitch)\n` +
          `  • \`${prefix}reverb\` (Atmospheric Echo)\n` +
          `  • \`${prefix}robot\` (Robotic Filter)\n` +
          `  • \`${prefix}reverse\` (Rewind Sound)\n` +
          `  • \`${prefix}fast\` (1.5x Speed)`
      );
    }

    await doReact("🎛️");

    try {
      const mediaBuffer = await target.download();
      if (!mediaBuffer) return m.reply("⚠️ Failed to download audio.");

      const tmpIn = path.join(process.cwd(), `fx_in_${Date.now()}.mp4`);
      const tmpOut = path.join(process.cwd(), `fx_out_${Date.now()}.mp3`);

      fs.writeFileSync(tmpIn, mediaBuffer);

      const filterCmd = FX_MAP[inputCMD] || FX_MAP.slowed;
      await execAsync(
        `"${ffmpegStatic}" -i "${tmpIn}" ${filterCmd} -vn -b:a 192k -ar 44100 "${tmpOut}"`
      );

      const outputAudio = fs.readFileSync(tmpOut);
      fs.unlinkSync(tmpIn);
      fs.unlinkSync(tmpOut);

      await SpiderBot.sendMessage(
        m.from,
        {
          audio: outputAudio,
          mimetype: "audio/mp4",
          fileName: `miles_${inputCMD}.mp3`,
        },
        { quoted: m }
      );
      return await doReact("✅");
    } catch (err) {
      return m.reply(`⚠️ Audio Studio error: ${err.message}`);
    }
  },
};
