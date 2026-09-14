import axios from "axios";

let commands = ["google", "wiki", "wikipedia", "lyrics", "weather", "github", "wallpaper"];

export default {
  name: "search",
  alias: [...commands],
  uniquecommands: ["google", "wiki", "lyrics", "weather", "github", "wallpaper"],
  description: "Multiverse intelligence and search commands",
  start: async (SpiderBot, m, { inputCMD, text, doReact, prefix }) => {
    if (!text) {
      return m.reply(`🕸️ Please provide a query! e.g. \`${prefix}${inputCMD} Miles Morales\``);
    }

    await doReact("🔍");

    switch (inputCMD) {
      // 1. WEATHER RADAR
      case "weather": {
        try {
          const res = await axios.get(
            `https://wttr.in/${encodeURIComponent(text)}?format=j1`,
            { timeout: 8000 }
          );
          const current = res.data?.current_condition?.[0];
          const area = res.data?.nearest_area?.[0];
          const astronomy = res.data?.weather?.[0]?.astronomy?.[0];

          if (!current) return m.reply("🕸️ Could not locate city weather. Please check city name.");

          const queryCity = text.trim();
          const region = area?.region?.[0]?.value || "";
          const country = area?.country?.[0]?.value || "";
          const locationHeader = `${queryCity.toUpperCase()}${region ? `, ${region}` : ""}${country ? `, ${country}` : ""}`;

          const weatherTxt = [
            `🌤️ *WEATHER RADAR // ${locationHeader}*`,
            ``,
            `🌡️ *Temp:* ${current.temp_C}°C / ${current.temp_F}°F (Feels like: ${current.FeelsLikeC}°C)`,
            `💧 *Humidity:* ${current.humidity}%`,
            `💨 *Wind:* ${current.windspeedKmph} km/h`,
            `☀️ *UV Index:* ${current.uvIndex || "N/A"}`,
            `☁️ *Condition:* ${current.weatherDesc?.[0]?.value || "Clear"}`,
            ...(astronomy?.sunrise ? [`🌅 *Sunrise / Sunset:* ${astronomy.sunrise} / ${astronomy.sunset}`] : []),
            ``,
            `_Ideal conditions for web-swinging!_ 🕸️`,
          ].join("\n");

          return m.reply(weatherTxt);
        } catch (err) {
          return m.reply(`⚠️ Weather service error: ${err.message}`);
        }
      }

      // 2. SONG LYRICS
      case "lyrics": {
        try {
          // Engine 1: LRCLIB (Massive instant lyrics database)
          const lrcRes = await axios.get(
            `https://lrclib.net/api/search?q=${encodeURIComponent(text)}`,
            {
              headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              },
              timeout: 8000,
            }
          );

          if (Array.isArray(lrcRes.data) && lrcRes.data.length > 0) {
            const track = lrcRes.data.find((t) => t.plainLyrics) || lrcRes.data[0];
            const lyrics = track.plainLyrics || track.syncedLyrics;
            if (lyrics) {
              const cleanLyrics = lyrics.replace(/\[\d+:\d+\.\d+\]/g, "").trim();
              const replyTxt = [
                `🎵 *LYRICS: ${track.trackName?.toUpperCase() || text.toUpperCase()}*`,
                `👤 *Artist:* ${track.artistName || "Unknown Artist"}`,
                `💿 *Album:* ${track.albumName || "Single"}`,
                ``,
                cleanLyrics.slice(0, 3500),
                ``,
                `_Found in the Brooklyn Multiverse_ 🕸️`,
              ].join("\n");
              return m.reply(replyTxt);
            }
          }

          // Engine 2: Lyrics.ovh Fallback
          const parts = text.split(/[-–—by]/i).map((s) => s.trim());
          const artist = parts.length > 1 ? parts[0] : "";
          const songTitle = parts.length > 1 ? parts[1] : text;
          if (artist && songTitle) {
            const ovhRes = await axios.get(
              `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(songTitle)}`,
              { timeout: 6000 }
            );
            if (ovhRes.data?.lyrics) {
              return m.reply(
                `🎵 *LYRICS: ${songTitle.toUpperCase()}* by *${artist}*\n\n${ovhRes.data.lyrics.slice(0, 3500)}`
              );
            }
          }
        } catch (e) {}

        return m.reply("🕸️ Lyrics not found for this track. Try adding the artist name (e.g. `/lyrics The Neighbourhood - Sweater Weather`).");
      }

      // 3. HD / 4K WALLPAPERS
      case "wallpaper": {
        try {
          // Engine 1: Wallhaven 4K/HD Search
          const wallRes = await axios.get(
            `https://wallhaven.cc/api/v1/search?q=${encodeURIComponent(text)}&sorting=relevance`,
            {
              headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              },
              timeout: 8000,
            }
          );
          const wallpapers = wallRes.data?.data;
          if (Array.isArray(wallpapers) && wallpapers.length > 0) {
            const pick = wallpapers[Math.floor(Math.random() * Math.min(wallpapers.length, 6))];
            const imgUrl = pick.path || pick.thumbs?.large;
            if (imgUrl) {
              return SpiderBot.sendMessage(
                m.from,
                {
                  image: { url: imgUrl },
                  caption: `🖼️ *Wallpaper:* \`${text}\`\n📐 *Resolution:* ${pick.resolution || "HD"}\n\n_Miles Morales MD_ 🕷️`,
                },
                { quoted: m }
              );
            }
          }

          // Engine 2: Unsplash Fallback
          const unsplashRes = await axios.get(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(text)}&client_id=d62df944a6ec7aa6bf165e38d6df4d5faecaa57de2fb57ff2506e78cf8402450`,
            { timeout: 6000 }
          );
          const photo = unsplashRes.data?.results?.[0];
          if (photo?.urls?.regular) {
            return SpiderBot.sendMessage(
              m.from,
              {
                image: { url: photo.urls.regular },
                caption: `🖼️ *Wallpaper:* \`${text}\`\n📐 *Resolution:* ${photo.width}x${photo.height}\n\n_Miles Morales MD_ 🕷️`,
              },
              { quoted: m }
            );
          }
        } catch (e) {}

        return m.reply("🕸️ Wallpaper search returned no results. Try another keyword!");
      }

      // 4. WIKIPEDIA
      case "wiki":
      case "wikipedia": {
        try {
          const res = await axios.get(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(text)}`,
            {
              headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              },
              timeout: 8000,
            }
          );
          const data = res.data;
          if (!data || !data.title) return m.reply("🕸️ No Wikipedia article found.");

          const caption = `📚 *${data.title}*\n\n${data.extract}\n\n🔗 ${data.content_urls?.desktop?.page || ""}`;

          if (data.thumbnail?.source) {
            return SpiderBot.sendMessage(
              m.from,
              { image: { url: data.thumbnail.source }, caption },
              { quoted: m }
            );
          }
          return m.reply(caption);
        } catch (err) {
          return m.reply("🕸️ Wikipedia article not found for this query.");
        }
      }

      // 5. GOOGLE & WEB SEARCH
      case "google": {
        try {
          const ddgRes = await axios.get(
            `https://api.duckduckgo.com/?q=${encodeURIComponent(text)}&format=json&no_html=1&skip_disambig=1`,
            { timeout: 6000 }
          );
          const abstract = ddgRes.data?.AbstractText;
          const heading = ddgRes.data?.Heading || text;

          if (abstract) {
            const googleReply = [
              `🔍 *WEB INTELLIGENCE // ${heading.toUpperCase()}*`,
              ``,
              abstract,
              ``,
              `🔗 *More:* https://www.google.com/search?q=${encodeURIComponent(text)}`,
            ].join("\n");
            return m.reply(googleReply);
          }
        } catch (e) {}

        return m.reply(`🔍 *Google Search:* https://www.google.com/search?q=${encodeURIComponent(text)}`);
      }

      // 6. GITHUB PROFILE
      case "github": {
        try {
          const res = await axios.get(
            `https://api.github.com/users/${encodeURIComponent(text)}`,
            {
              headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
              },
              timeout: 6000,
            }
          );
          const u = res.data;
          const ghTxt = [
            `🐙 *GITHUB PROFILE: ${u.login}*`,
            ``,
            `*Name:* ${u.name || "None"}`,
            `*Bio:* ${u.bio || "None"}`,
            `*Public Repos:* ${u.public_repos}`,
            `*Followers:* ${u.followers} | *Following:* ${u.following}`,
            `*Location:* ${u.location || "Unknown"}`,
            `*Profile URL:* ${u.html_url}`,
          ].join("\n");

          return SpiderBot.sendMessage(
            m.from,
            { image: { url: u.avatar_url }, caption: ghTxt },
            { quoted: m }
          );
        } catch (e) {
          return m.reply("🕸️ GitHub user not found.");
        }
      }
    }
  },
};
