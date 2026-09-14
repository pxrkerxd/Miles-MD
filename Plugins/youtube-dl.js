import axios from "axios";
import yts from "yt-search";
import { ytmp3, ytmp4 } from "@vreden/youtube_scraper";

let commands = ["play", "song", "ytmp3", "yta", "ytmp4", "ytv", "video", "yts"];

export default {
  name: "youtube",
  alias: [...commands],
  uniquecommands: ["play", "ytmp3", "ytmp4", "yts"],
  description: "Spider-Verse YouTube music & video downloader",
  start: async (SpiderBot, m, { inputCMD, text, doReact, prefix }) => {
    let query = text?.trim();
    if (!query && m.quoted?.text) {
      query = m.quoted.text.trim();
    }

    if (!query) {
      return m.reply(
        `🕷️ *Spider-Verse YouTube Studio*\n\nUsage:\n  \`${prefix}play <song title>\`\n  \`${prefix}ytmp3 <youtube url>\`\n  \`${prefix}ytmp4 <video title or url>\`\n  \`${prefix}yts <search query>\``
      );
    }

    try {
      if (inputCMD === "yts") {
        await doReact("🔍");
        const searchResults = await yts(query);
        const videos = searchResults.videos.slice(0, 5);
        if (!videos.length) return m.reply("🕸️ No YouTube tracks found in this dimension.");

        let txt = `🕷️ *YOUTUBE SEARCH RESULTS* 🕷️\n\n`;
        videos.forEach((v, i) => {
          txt += `*${i + 1}. ${v.title}*\n⏱️ Duration: ${v.timestamp} | 👁️ Views: ${v.views}\n🔗 Link: ${v.url}\n\n`;
        });
        txt += `_Use \`${prefix}play <title>\` to download!_`;

        return SpiderBot.sendMessage(
          m.from,
          { image: { url: videos[0].thumbnail }, caption: txt },
          { quoted: m }
        );
      }

      if (inputCMD === "play" || inputCMD === "song" || inputCMD === "ytmp3" || inputCMD === "yta") {
        await doReact("🎵");
        const search = await yts(query);
        const video = search.videos[0];
        if (!video) return m.reply("🕸️ Track not found.");

        await SpiderBot.sendMessage(
          m.from,
          {
            image: { url: video.thumbnail },
            caption: `🎧 *Playing in Brooklyn:* ${video.title}\n⏱️ *Duration:* ${video.timestamp}\n⚡ *Spider-Bot downloading audio...*`,
          },
          { quoted: m }
        );

        // 1. Primary High-Speed Engine (Vreden)
        let audioUrl = null;
        try {
          const vredenRes = await ytmp3(video.url);
          if (vredenRes.status && vredenRes.download?.url) {
            audioUrl = vredenRes.download.url;
          }
        } catch (e) {}

        // 2. Secondary Engine (api-faa)
        if (!audioUrl) {
          try {
            const apiRes = await axios.get(
              `https://api-faa.my.id/faa/ytmp3?url=${encodeURIComponent(video.url)}`,
              { timeout: 8000 }
            );
            audioUrl =
              apiRes.data?.result?.mp3 ||
              apiRes.data?.result?.download_url ||
              apiRes.data?.result?.url ||
              apiRes.data?.download_url;
          } catch (e) {}
        }

        if (audioUrl) {
          await SpiderBot.sendMessage(
            m.from,
            {
              audio: { url: audioUrl },
              mimetype: "audio/mp4",
              fileName: `${video.title}.mp3`,
            },
            { quoted: m }
          );
          return await doReact("✅");
        }

        return m.reply("⚠️ Track found but media download server is temporarily busy. Try again shortly!");
      }

      if (inputCMD === "ytmp4" || inputCMD === "ytv" || inputCMD === "video") {
        await doReact("🎬");
        const search = await yts(query);
        const video = search.videos[0];
        if (!video) return m.reply("🕸️ Video not found.");

        let videoUrl = null;
        try {
          const vredenRes = await ytmp4(video.url);
          if (vredenRes.status && vredenRes.download?.url) {
            videoUrl = vredenRes.download.url;
          }
        } catch (e) {}

        if (!videoUrl) {
          try {
            const fbRes = await axios.get(
              `https://api-faa.my.id/faa/ytmp4?url=${encodeURIComponent(video.url)}`,
              { timeout: 8000 }
            );
            videoUrl =
              fbRes.data?.result?.mp4 ||
              fbRes.data?.result?.download_url ||
              fbRes.data?.result?.url ||
              fbRes.data?.download_url;
          } catch (e) {}
        }

        if (videoUrl) {
          await SpiderBot.sendMessage(
            m.from,
            {
              video: { url: videoUrl },
              caption: `🎬 *${video.title}*\n⏱️ ${video.timestamp}\n\n_Downloaded via Miles Morales MD_ 🕷️`,
            },
            { quoted: m }
          );
          return await doReact("✅");
        }

        return m.reply("⚠️ Video found but download server is busy. Try again in a moment!");
      }
    } catch (err) {
      await doReact("⚠️");
      return m.reply(`🕸️ Spider-Sense glitch: ${err.message}`);
    }
  },
};
