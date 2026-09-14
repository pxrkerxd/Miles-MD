import axios from "axios";
import { GoogleGenAI } from "@google/genai";
import { getGeminiConfig, GEMINI_MODEL } from "../System/__system_prompt.js";

let commands = ["imagine", "draw", "aiimage", "gen", "vision", "describe"];

export default {
  name: "aistudio",
  alias: [...commands],
  uniquecommands: ["imagine", "vision", "draw", "describe"],
  description: "Spider-Verse AI image generation & computer vision",
  start: async (SpiderBot, m, { inputCMD, text, doReact, prefix }) => {
    switch (inputCMD) {
      case "imagine":
      case "draw":
      case "gen":
      case "aiimage": {
        if (!text) {
          return m.reply(
            `🎨 *Spider-Verse AI Art Studio*\n\nUsage: \`${prefix}imagine <prompt>\`\nExample: \`${prefix}imagine Miles Morales swinging through Brooklyn in neon rain\``
          );
        }

        await doReact("🎨");
        await SpiderBot.sendMessage(
          m.from,
          {
            text: `🕸️ *Creating Spider-Verse Art in Brooklyn Studio...*\n🎨 *Prompt:* "${text}"`,
          },
          { quoted: m }
        );

        try {
          const seed = Math.floor(Math.random() * 1000000);
          const aiImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
            text
          )}?width=1024&height=1024&nologo=true&seed=${seed}&enhance=true&model=flux`;

          return await SpiderBot.sendMessage(
            m.from,
            {
              image: { url: aiImageUrl },
              caption: `🎨 *Spider-Verse AI Art:* \`${text}\`\n⚡ _Rendered in Earth-1610 Studio_ 🕸️`,
            },
            { quoted: m }
          );
        } catch (err) {
          return m.reply(`⚠️ AI art generation error: ${err.message}`);
        }
      }

      case "vision":
      case "describe": {
        const target = m.quoted ? m.quoted : m;
        const mime = (target.msg || target).mimetype || "";

        if (!/image/.test(mime)) {
          return m.reply(
            `👁️ *Spider-Sense Vision*\n\nReply to any image with \`${prefix}vision <your question>\` for Miles to analyze what's in it!`
          );
        }

        await doReact("👁️");
        try {
          const mediaBuffer = await target.download();
          if (!mediaBuffer) return m.reply("⚠️ Could not download image.");

          const apiKey = global.pickKey(global.geminiAPIKeys);
          if (!apiKey) {
            return m.reply("⚠️ Gemini Vision API key is not configured in `.env`.");
          }

          const ai = new GoogleGenAI({ apiKey });
          const userPrompt = text || "Describe what you see in this image in your authentic Miles Morales personality and Brooklyn slang.";

          const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
              {
                role: "user",
                parts: [
                  { text: userPrompt },
                  {
                    inlineData: {
                      mimeType: "image/jpeg",
                      data: mediaBuffer.toString("base64"),
                    },
                  },
                ],
              },
            ],
            config: getGeminiConfig(),
          });

          const replyText = response.text || "🕸️ Spider-Sense couldn't make out the details.";
          return m.reply(replyText);
        } catch (err) {
          return m.reply(`⚠️ Vision error: ${err.message}`);
        }
      }
    }
  },
};
