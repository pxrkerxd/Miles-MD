import axios from "axios";
import * as cheerio from "cheerio";
import yts from "yt-search";
import { ytmp3 } from "@vreden/youtube_scraper";

let commands = [
  "tiktok",
  "tt",
  "instagram",
  "ig",
  "facebook",
  "fb",
  "twitter",
  "x",
  "pinterest",
  "pin",
  "spotify",
  "dl",
];

// Helper to resolve Spotify track info via Spotify official embed
async function resolveSpotifyInfo(input) {
  const trackMatch = input.match(/open\.spotify\.com\/track\/([a-zA-Z0-9]+)/);
  if (trackMatch) {
    const trackId = trackMatch[1];
    try {
      const embedUrl = `https://open.spotify.com/embed/track/${trackId}`;
      const res = await axios.get(embedUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        timeout: 6000,
      });
      const $ = cheerio.load(res.data);
      const rawJson = $("script#__NEXT_DATA__").html();
      if (rawJson) {
        const nextData = JSON.parse(rawJson);
        const entity = nextData.props?.pageProps?.state?.data?.entity;
        if (entity && entity.name) {
          const artist = entity.artists?.map((a) => a.name).join(", ") || "";
          return {
            title: entity.name,
            artist,
            searchQuery: `${entity.name} ${artist}`.trim(),
          };
        }
      }
    } catch (e) {}
  }
  return {
    title: input,
    artist: "",
    searchQuery: input.replace(/https?:\/\/[^\s]+/g, "").trim() || input,
  };
}

export default {
  name: "downloader",
  alias: [...commands],
  uniquecommands: ["tiktok", "instagram", "facebook", "twitter", "pinterest", "spotify"],
  description: "Universal social media and music downloader",
  start: async (SpiderBot, m, { inputCMD, text, doReact, prefix }) => {
    let url = text?.trim();
    if (!url && m.quoted?.text) {
      const match = m.quoted.text.match(/https?:\/\/[^\s]+/);
      if (match) url = match[0];
      else url = m.quoted.text.trim();
    }

    if (!url) {
      return m.reply(
        `📥 *Spider-Verse Universal Downloader*\n\nUsage:\n  \`${prefix}spotify <song name or spotify url>\`\n  \`${prefix}tiktok <url>\`\n  \`${prefix}ig <url>\`\n  \`${prefix}fb <url>\`\n  \`${prefix}x <url>\`\n  \`${prefix}pinterest <query or url>\``
      );
    }

    await doReact("⏳");

    try {
      // SPOTIFY DOWNLOADER
      if (inputCMD === "spotify") {
        const info = await resolveSpotifyInfo(url);

        await SpiderBot.sendMessage(
          m.from,
          {
            text: `🎧 *Searching Spotify Track in Brooklyn:* \`${info.title}\`\n⚡ *Spider-Bot downloading audio...*`,
          },
          { quoted: m }
        );

        // 1. Search YouTube for best match
        const ytResults = await yts(info.searchQuery);
        const bestMatch = ytResults.videos[0];

        if (!bestMatch) {
          return m.reply("🕸️ Could not locate audio stream for this Spotify track.");
        }

        // 2. Resolve Audio Stream via High-Speed Engine
        let audioUrl = null;
        try {
          const vredenRes = await ytmp3(bestMatch.url);
          if (vredenRes.status && vredenRes.download?.url) {
            audioUrl = vredenRes.download.url;
          }
        } catch (e) {}

        // Secondary fallback
        if (!audioUrl) {
          try {
            const apiRes = await axios.get(
              `https://api-faa.my.id/faa/ytmp3?url=${encodeURIComponent(bestMatch.url)}`,
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
              fileName: `${info.title || bestMatch.title}.mp3`,
            },
            { quoted: m }
          );
          return await doReact("✅");
        }

        return m.reply("⚠️ Track found on Spotify, but audio conversion server is temporarily busy. Please try again shortly!");
      }

      // TIKTOK
      if (inputCMD === "tiktok" || inputCMD === "tt" || /tiktok\.com/i.test(url)) {
        let videoUrl = null;
        let title = "";

        // Engine 1: api-faa
        try {
          const res = await axios.get(
            `https://api-faa.my.id/faa/tiktok?url=${encodeURIComponent(url)}`,
            { timeout: 8000 }
          );
          if (res.data?.status && res.data?.result) {
            videoUrl = res.data.result.video || res.data.result.url;
            title = res.data.result.title || "";
          }
        } catch (e) {}

        // Engine 2: TikWM
        if (!videoUrl) {
          try {
            const res2 = await axios.get(
              `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`,
              { timeout: 8000 }
            );
            if (res2.data?.data?.play) {
              videoUrl = res2.data.data.play;
              title = res2.data.data.title || title;
            }
          } catch (e) {}
        }

        // Engine 3: siputzx
        if (!videoUrl) {
          try {
            const res3 = await axios.get(
              `https://api.siputzx.my.id/api/d/tiktok?url=${encodeURIComponent(url)}`,
              { timeout: 8000 }
            );
            videoUrl = res3.data?.data?.video || res3.data?.data?.url;
          } catch (e) {}
        }

        if (videoUrl) {
          await SpiderBot.sendMessage(
            m.from,
            {
              video: { url: videoUrl },
              caption: `🎵 *TikTok Downloaded:*\n${title}\n\n_By Miles Morales MD_ 🕷️`,
            },
            { quoted: m }
          );
          return await doReact("✅");
        }
      }

      // INSTAGRAM
      if (inputCMD === "instagram" || inputCMD === "ig" || /instagram\.com/i.test(url)) {
        let mediaUrl = null;
        let isVid = true;

        try {
          const res = await axios.get(
            `https://api.siputzx.my.id/api/d/ig?url=${encodeURIComponent(url)}`,
            { timeout: 8000 }
          );
          const media = res.data?.data;
          if (Array.isArray(media) && media.length > 0) {
            mediaUrl = media[0].url;
            isVid = media[0].url?.includes(".mp4") || media[0].type === "video";
          }
        } catch (e) {}

        if (!mediaUrl) {
          try {
            const res2 = await axios.get(
              `https://api-faa.my.id/faa/igdl?url=${encodeURIComponent(url)}`,
              { timeout: 8000 }
            );
            if (res2.data?.status && res2.data?.result) {
              const r = res2.data.result;
              mediaUrl = Array.isArray(r) ? r[0]?.url || r[0] : r.url || r.video || r;
              isVid = typeof mediaUrl === "string" && (mediaUrl.includes(".mp4") || !mediaUrl.includes(".jpg"));
            }
          } catch (e) {}
        }

        if (mediaUrl) {
          if (isVid) {
            await SpiderBot.sendMessage(
              m.from,
              { video: { url: mediaUrl }, caption: "📸 *Instagram Video Downloaded!* 🕷️" },
              { quoted: m }
            );
          } else {
            await SpiderBot.sendMessage(
              m.from,
              { image: { url: mediaUrl }, caption: "📸 *Instagram Image Downloaded!* 🕷️" },
              { quoted: m }
            );
          }
          return await doReact("✅");
        }
      }

      // FACEBOOK
      if (inputCMD === "facebook" || inputCMD === "fb" || /facebook\.com|fb\.watch/i.test(url)) {
        let vidUrl = null;
        try {
          const res = await axios.get(
            `https://api.siputzx.my.id/api/d/facebook?url=${encodeURIComponent(url)}`,
            { timeout: 8000 }
          );
          const fbData = res.data?.data;
          vidUrl = fbData?.hd || fbData?.sd || fbData?.video || fbData?.url;
        } catch (e) {}

        if (!vidUrl) {
          try {
            const res2 = await axios.get(
              `https://api-faa.my.id/faa/fb?url=${encodeURIComponent(url)}`,
              { timeout: 8000 }
            );
            vidUrl = res2.data?.result?.video || res2.data?.result?.url || res2.data?.result?.hd || res2.data?.result?.sd;
          } catch (e) {}
        }

        if (vidUrl) {
          await SpiderBot.sendMessage(
            m.from,
            { video: { url: vidUrl }, caption: "📘 *Facebook Video Downloaded!* 🕷️" },
            { quoted: m }
          );
          return await doReact("✅");
        }
      }

      // TWITTER / X
      if (inputCMD === "twitter" || inputCMD === "x" || /twitter\.com|x\.com/i.test(url)) {
        let twVid = null;
        try {
          const res = await axios.get(
            `https://api.siputzx.my.id/api/d/twitter?url=${encodeURIComponent(url)}`,
            { timeout: 8000 }
          );
          twVid = res.data?.data?.video || res.data?.data?.url;
        } catch (e) {}

        if (!twVid) {
          try {
            const res2 = await axios.get(
              `https://api-faa.my.id/faa/twitter?url=${encodeURIComponent(url)}`,
              { timeout: 8000 }
            );
            twVid = res2.data?.result?.video || res2.data?.result?.url;
          } catch (e) {}
        }

        if (twVid) {
          await SpiderBot.sendMessage(
            m.from,
            { video: { url: twVid }, caption: "🐦 *X / Twitter Media Downloaded!* 🕷️" },
            { quoted: m }
          );
          return await doReact("✅");
        }
      }

      // PINTEREST
      if (inputCMD === "pinterest" || inputCMD === "pin") {
        try {
          const res = await axios.get(
            `https://api.siputzx.my.id/api/s/pinterest?query=${encodeURIComponent(url)}`,
            { timeout: 8000 }
          );
          const results = res.data?.data;
          if (Array.isArray(results) && results.length > 0) {
            const randomPin = results[Math.floor(Math.random() * Math.min(results.length, 8))];
            const pinUrl = typeof randomPin === "object" ? randomPin.pin || randomPin.images_url || randomPin.url : randomPin;
            if (pinUrl) {
              await SpiderBot.sendMessage(
                m.from,
                { image: { url: pinUrl }, caption: "📌 *Pinterest Result* 🕷️" },
                { quoted: m }
              );
              return await doReact("✅");
            }
          }
        } catch (e) {}
      }

      return m.reply("⚠️ Could not download this link at the moment. Please ensure the URL is public and valid.");
    } catch (err) {
      await doReact("❌");
      return m.reply(`🕸️ Download failed: ${err.message}`);
    }
  },
};
