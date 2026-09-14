import fs from "fs";
import path from "path";
import { exec } from "child_process";
import util from "util";
import ffmpegStatic from "ffmpeg-static";

const execAsync = util.promisify(exec);

let commands = ["toaudio", "tomp3", "topdf"];

export default {
  name: "converter",
  alias: [...commands],
  uniquecommands: ["toaudio", "tomp3"],
  description: "Media audio and document format converter",
  start: async (SpiderBot, m, { inputCMD, doReact, prefix }) => {
    switch (inputCMD) {
      case "toaudio":
      case "tomp3": {
        await doReact("🎵");
        const target = m.quoted ? m.quoted : m;
        const mime = (target.msg || target).mimetype || "";

        if (!/video|audio/.test(mime)) {
          return m.reply(`🕸️ Reply to a video or audio file with \`${prefix}tomp3\` to convert it to MP3!`);
        }

        try {
          const mediaBuffer = await target.download();
          const tmpIn = path.join(process.cwd(), `conv_in_${Date.now()}.mp4`);
          const tmpOut = path.join(process.cwd(), `conv_out_${Date.now()}.mp3`);

          fs.writeFileSync(tmpIn, mediaBuffer);
          await execAsync(`"${ffmpegStatic}" -i "${tmpIn}" -vn -b:a 192k -ar 44100 -ac 2 "${tmpOut}"`);

          const audioBuffer = fs.readFileSync(tmpOut);
          fs.unlinkSync(tmpIn);
          fs.unlinkSync(tmpOut);

          return SpiderBot.sendMessage(
            m.from,
            { audio: audioBuffer, mimetype: "audio/mp4", fileName: "miles_audio.mp3" },
            { quoted: m }
          );
        } catch (err) {
          return m.reply(`⚠️ Conversion failed: ${err.message}`);
        }
      }
    }
  },
};
