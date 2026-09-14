<p align="center">
  <img src="https://images.alphacoders.com/978/978824.jpg" width="100%" alt="Miles Morales Spider-Verse Banner">
</p>

<h1 align="center">🕷️ Miles Morales MD (Earth-1610)</h1>

<p align="center">
  <i>The Ultimate Spider-Verse WhatsApp Multi-Device Bot — Inspired by Atlas-MD, rebuilt with Brooklyn swag, 20 Spider-Verse Characters, Triple AI, and Dual Auth.</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Theme-Miles%20Morales-E50914?style=for-the-badge&logo=marvel" alt="Theme">
  <img src="https://img.shields.io/badge/Baileys-Multi--Device-00F0FF?style=for-the-badge" alt="Baileys">
  <img src="https://img.shields.io/badge/AI-Gemini%20%7C%20GPT-FFDF00?style=for-the-badge" alt="AI">
  <img src="https://img.shields.io/badge/Auth-Dual%20(Local%20%2B%20Mongo)-green?style=for-the-badge" alt="Auth">
</p>

---

## ⚡ Key Features at a Glance

| Feature | Details |
| :--- | :--- |
| 🕷️ **Miles Morales Persona** | Authentic Brooklyn slang, Spider-Verse lore, graffiti & lo-fi vibes powered by Gemini / GPT |
| 🌀 **20 Spider-Verse Characters** | Switch active character anytime (`.setchar 0-19`): Miles, Spider-Gwen, 2099, Spider-Punk, Pavitr, Noir, etc. |
| ⚡ **Signature Spider Abilities** | `.spidersense`, `.venom`, `.camouflage`, `.leapoffaith`, `.canon`, `.punk`, `.chai` |
| 📱 **Spider-Verse Web Dashboard** | Modern dark halftone dashboard with QR code scanner and instant 8-digit phone pairing code (`/api/pair`) |
| 🔐 **Dual Authentication** | Works 100% locally out-of-the-box (`./Session`), or syncs to MongoDB Cloud for 24/7 hostings |
| 📥 **Universal Downloader** | YouTube (Audio/Video), TikTok, Instagram, Twitter/X, Facebook, Spotify, Pinterest |
| 🎨 **Sticker Studio** | Image/Video to WebP stickers, meme stickers, `.take` rebranding, sticker-to-image/video converters |
| 🛡️ **Group Defense** | Anti-link detection, automated welcome/goodbye, kick, promote, demote, tagall, mute/unmute |
| 🔍 **Multiverse Search** | Google, Wikipedia summaries, song lyrics, weather radar, GitHub profiles, wallpapers |

---

## 🚀 Quick Start Guide

### 1. Installation

Ensure you have **Node.js (v18+)** installed. In your project directory:

```bash
# Install dependencies
npm install
```

### 2. Configuration

Copy the example environment file and edit it:

```bash
cp .env.example .env
```

Open `.env` and fill in:
- `MODS`: Your WhatsApp phone number (e.g. `14155552671`)
- `GEMINI_API`: (Optional) Your Google Gemini API key for Miles' AI personality.
- `MONGODB`: (Optional) Leave blank to run locally without a database!

### 3. Start the Bot

```bash
npm start
```

Open your browser and navigate to:
👉 **`http://localhost:10000`**

- **Option A (Pairing Code):** Enter your phone number, click **Get Pairing Code**, then enter the 8-digit code on WhatsApp (*Settings ➔ Linked Devices ➔ Link with phone number*).
- **Option B (QR Code):** Click the **QR Code Scan** tab and scan with WhatsApp camera.

---

## 🎭 Authentic Miles Morales Hero Persona
Miles Morales MD is custom-tuned to reflect **Miles Morales (Earth-1610)** — with genuine Brooklyn swagger, Spider-Verse lore, hip-hop culture, graffiti art, and iconic quotes. Powered by Google Gemini and OpenAI for deep conversational AI.

---

## 📜 Full Command Reference

- **System:** `/menu`, `/owner`, `/alive`, `/ping`, `/uptime`, `/script`, `/support`, `/restart`
- **AI Art & Vision:** `/imagine <prompt>`, `/draw <prompt>`, `/vision <question>`
- **Spider-Verse RPG:** `/rank`, `/level`, `/daily`, `/leaderboard`, `/gamble <tokens>`
- **Audio Studio FX:** `/slowed`, `/reverb`, `/bass`, `/nightcore`, `/pitch`, `/robot`, `/reverse`, `/fast`
- **Group Power Tools:** `/poll <Q | opt1 | opt2>`, `/tagadmins`, `/warn @user`, `/checkwarn`, `/resetwarn`, `/autosticker on/off`, `/antidelete on/off`
- **Spider-Verse Special:** `/miles`, `/spidersense`, `/venom`, `/camouflage`, `/leapoffaith`, `/canon`, `/punk`, `/chai`, `/spidertrivia`, `/spidersuit`, `/multiverse`
- **Stickers:** `/s` (or `/sticker`), `/take`, `/toimg`, `/tovideo`
- **Media Downloaders:** `/play <song>`, `/ytmp3 <url>`, `/ytmp4 <url>`, `/yts <search>`, `/tiktok <url>`, `/ig <url>`, `/fb <url>`, `/x <url>`, `/pinterest <query>`, `/spotify <url>`
- **Spider-Man Reactions:** `/hug`, `/slap`, `/punch`, `/kick`, `/pat`, `/kiss`, `/dance`, `/webshoot`, `/bonk`
- **Group Defense:** `/kick`, `/promote`, `/demote`, `/tagall`, `/hidetag`, `/mute`, `/unmute`, `/antilink on/off`, `/welcome on/off`, `/groupinfo`
- **Moderation:** `/mode <public/private/self>`, `/ban`, `/unban`, `/pmchatbot on/off`, `/groupchatbot on/off`
- **Search & Radar:** `/google <query>`, `/wiki <query>`, `/weather <city>`, `/lyrics <song>`, `/github <user>`, `/wallpaper <query>`
- **Fun & Games:** `/roast`, `/ship`, `/8ball`, `/coinflip`, `/dice`, `/quote`, `/truth`, `/dare`
- **Tools & Converters:** `/profile` (or `/p`), `/tts <text>`, `/qr <text>`, `/calc <math>`, `/shorturl <url>`, `/tomp3`

---

<p align="center">
  <b>Built with ❤️ by Parker</b><br>
  <i>"Anyone can wear the mask."</i>
</p>
