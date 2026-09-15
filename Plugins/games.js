import { addXP, addTokens, getUserRPG } from "../System/MongoDB/MongoDb_Core.js";

// Active in-memory game sessions per chat JID
const tttSessions = new Map();
const rouletteSessions = new Map();
const hangmanSessions = new Map();
const wordleSessions = new Map();
const riddleSessions = new Map();
const emojiSessions = new Map();
const triviaSessions = new Map();

// ==========================================
// 1. DATASETS
// ==========================================

const HANGMAN_WORDS = [
  // Spider-Verse & Marvel
  { word: "SPIDERMAN", category: "Marvel & Spider-Verse" },
  { word: "MILESMORALES", category: "Marvel & Spider-Verse" },
  { word: "GWENSTACY", category: "Marvel & Spider-Verse" },
  { word: "PETERPARKER", category: "Marvel & Spider-Verse" },
  { word: "MIGUELOHARA", category: "Marvel & Spider-Verse" },
  { word: "SPIDERHAM", category: "Marvel & Spider-Verse" },
  { word: "PAVITR", category: "Marvel & Spider-Verse" },
  { word: "HOBIEBROWN", category: "Marvel & Spider-Verse" },
  { word: "SPOT", category: "Marvel & Spider-Verse" },
  { word: "KINGPIN", category: "Marvel & Spider-Verse" },
  { word: "PROWLER", category: "Marvel & Spider-Verse" },
  { word: "GREENGOBLIN", category: "Marvel & Spider-Verse" },
  { word: "DOC OCK", category: "Marvel & Spider-Verse" },
  { word: "VENOM", category: "Marvel & Spider-Verse" },
  { word: "CARNAGE", category: "Marvel & Spider-Verse" },
  { word: "BROOKLYN", category: "Marvel & Spider-Verse" },
  { word: "MULTIVERSE", category: "Marvel & Spider-Verse" },
  { word: "ALCHEMAX", category: "Marvel & Spider-Verse" },
  { word: "AVENGERS", category: "Marvel & Spider-Verse" },
  { word: "THANOS", category: "Marvel & Spider-Verse" },
  { word: "IRONMAN", category: "Marvel & Spider-Verse" },
  { word: "THOR", category: "Marvel & Spider-Verse" },
  { word: "WOLVERINE", category: "Marvel & Spider-Verse" },
  { word: "DEADPOOL", category: "Marvel & Spider-Verse" },
  { word: "LOKI", category: "Marvel & Spider-Verse" },

  // Movies & Pop Culture
  { word: "INTERSTELLAR", category: "Movies" },
  { word: "INCEPTION", category: "Movies" },
  { word: "AVATAR", category: "Movies" },
  { word: "TITANIC", category: "Movies" },
  { word: "GLADIATOR", category: "Movies" },
  { word: "MATRIX", category: "Movies" },
  { word: "BATMAN", category: "Movies" },
  { word: "OPPENHEIMER", category: "Movies" },
  { word: "BARBIE", category: "Movies" },
  { word: "JOKER", category: "Movies" },
  { word: "STARWARS", category: "Movies" },
  { word: "HARRYPOTTER", category: "Movies" },

  // Gaming
  { word: "MINECRAFT", category: "Video Games" },
  { word: "FORTNITE", category: "Video Games" },
  { word: "VALORANT", category: "Video Games" },
  { word: "POKEMON", category: "Video Games" },
  { word: "CYBERPUNK", category: "Video Games" },
  { word: "OVERWATCH", category: "Video Games" },
  { word: "ROBLOX", category: "Video Games" },
  { word: "ZELDA", category: "Video Games" },
  { word: "GOD OF WAR", category: "Video Games" },
  { word: "ASSASSINSCREED", category: "Video Games" },

  // Animals & Nature
  { word: "CHAMELEON", category: "Animals & Nature" },
  { word: "KANGAROO", category: "Animals & Nature" },
  { word: "PLATYPUS", category: "Animals & Nature" },
  { word: "JELLYFISH", category: "Animals & Nature" },
  { word: "SCORPION", category: "Animals & Nature" },
  { word: "CROCODILE", category: "Animals & Nature" },
  { word: "FLAMINGO", category: "Animals & Nature" },
  { word: "CHEETAH", category: "Animals & Nature" },
  { word: "HEDGEHOG", category: "Animals & Nature" },

  // Countries & Geography
  { word: "ARGENTINA", category: "Countries" },
  { word: "AUSTRALIA", category: "Countries" },
  { word: "BRAZIL", category: "Countries" },
  { word: "CANADA", category: "Countries" },
  { word: "GERMANY", category: "Countries" },
  { word: "JAPAN", category: "Countries" },
  { word: "MADAGASCAR", category: "Countries" },
  { word: "SWITZERLAND", category: "Countries" },
];

const WORDLE_WORDS = [
  "MILES", "SPARK", "GHOST", "POWER", "BRAIN", "HERO", "FIGHT", "SWING", "SHOCK",
  "PETER", "STACY", "VENOM", "VIPER", "LASER", "CYBER", "ROBOT", "MAGIC", "STORM",
  "NIGHT", "LIGHT", "FLAME", "WATER", "EARTH", "PLANT", "TIGER", "EAGLE", "SHARK",
  "SPACE", "SOLAR", "LUNAR", "COMET", "ORBIT", "BLAST", "PIXEL", "AUDIO", "VIDEO",
  "MUSIC", "DANCE", "CHAMP", "CLASH", "QUEST", "BLADE", "STEEL", "FORCE", "TITAN",
  "NINJA", "SAMUR", "ARMOR", "PULSE", "SONIC", "FLASH", "RADIO", "VIRAL", "SPEED",
  "RIDER", "PILOT", "GUARD", "PRIDE", "NOBLE", "BRAVE", "HONOR", "GLORY", "CROWN",
  "GIANT", "BEAST", "HEART", "DREAM", "WORLD", "IMAGE", "CLOCK", "STONE", "RIVER",
];

const RIDDLES = [
  {
    riddle: "I have branches, but no fruit, trunk, or leaves. What am I?",
    answers: ["bank", "a bank"],
    hint: "Think about where you store your money!",
  },
  {
    riddle: "What has to be broken before you can use it?",
    answers: ["egg", "an egg", "eggs", "glowstick", "glow stick"],
    hint: "Breakfast favorite or party lighting!",
  },
  {
    riddle: "I'm tall when I'm young, and I'm short when I'm old. What am I?",
    answers: ["candle", "a candle", "pencil", "a pencil"],
    hint: "Provides light or helps you sketch!",
  },
  {
    riddle: "What month of the year has 28 days?",
    answers: ["all", "all of them", "all months", "every month", "12"],
    hint: "Read the question very carefully!",
  },
  {
    riddle: "What is full of holes but still holds water?",
    answers: ["sponge", "a sponge"],
    hint: "Found in your kitchen sink or bathroom!",
  },
  {
    riddle: "What question can you never honestly answer yes to?",
    answers: ["are you asleep", "are you asleep yet", "are you dead", "are you unconscious"],
    hint: "You do it every night in bed!",
  },
  {
    riddle: "What is always in front of you but can't be seen?",
    answers: ["future", "the future"],
    hint: "Tomorrow and beyond!",
  },
  {
    riddle: "There’s a one-story house where everything is yellow. Yellow walls, yellow furniture, yellow carpets. What color are the stairs?",
    answers: ["no stairs", "there are no stairs", "none"],
    hint: "Read the first sentence again!",
  },
  {
    riddle: "What can you break, even if you never pick it up or touch it?",
    answers: ["promise", "a promise", "trust", "heart", "a heart"],
    hint: "Given with words or feelings!",
  },
  {
    riddle: "What goes up but never comes down?",
    answers: ["age", "your age"],
    hint: "It increases every birthday!",
  },
  {
    riddle: "A man dies of old age on his 25th birthday. How is this possible?",
    answers: ["leap year", "he was born on leap day", "born on feb 29", "february 29", "leap day"],
    hint: "February 29th!",
  },
  {
    riddle: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?",
    answers: ["map", "a map", "globe", "a globe"],
    hint: "Used for navigation!",
  },
  {
    riddle: "What has one eye, but can’t see a thing?",
    answers: ["needle", "a needle", "storm", "cyclone", "hurricane"],
    hint: "Used for sewing!",
  },
  {
    riddle: "What has many keys but can’t open a single lock?",
    answers: ["piano", "a piano", "keyboard", "a keyboard"],
    hint: "Makes music or types code!",
  },
  {
    riddle: "What gets wetter the more it dries?",
    answers: ["towel", "a towel"],
    hint: "Used right after a shower!",
  },
  {
    riddle: "What can travel around the world while staying in the exact same corner?",
    answers: ["stamp", "a stamp", "postage stamp"],
    hint: "Stuck to an envelope!",
  },
  {
    riddle: "What has a head and a tail but no body?",
    answers: ["coin", "a coin", "penny", "quarter"],
    hint: "Flip it to decide something!",
  },
  {
    riddle: "The more of this there is, the less you see. What is it?",
    answers: ["darkness", "dark", "fog", "smoke"],
    hint: "Turn on the lights!",
  },
  {
    riddle: "What belongs to you, but other people use it much more than you do?",
    answers: ["name", "your name", "my name"],
    hint: "How people address you!",
  },
  {
    riddle: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
    answers: ["echo", "an echo"],
    hint: "Shout in a cave or canyon!",
  },
  {
    riddle: "What has hands, but can’t clap?",
    answers: ["clock", "a clock", "watch", "a watch"],
    hint: "Tells time!",
  },
  {
    riddle: "What has legs, but doesn’t walk?",
    answers: ["table", "a table", "chair", "a chair"],
    hint: "Furniture you sit at!",
  },
  {
    riddle: "If you drop me I’m sure to crack, but give me a smile and I’ll always smile back. What am I?",
    answers: ["mirror", "a mirror"],
    hint: "Reflects your image!",
  },
  {
    riddle: "What starts with T, ends with T, and has T in it?",
    answers: ["teapot", "a teapot"],
    hint: "Used to brew hot beverages!",
  },
  {
    riddle: "What kind of band never plays music?",
    answers: ["rubber band", "a rubber band", "hair band", "headband"],
    hint: "Stretchy stationary item!",
  },
];

const EMOJI_QUIZZES = [
  // Movies
  { emojis: "🕷️ 🕸️ 🗽 🏙️", answer: "Spider-Man", aliases: ["spiderman", "spider man", "spider-man into the spider-verse"], category: "Movie" },
  { emojis: "🦁 👑 🌅 🐗", answer: "The Lion King", aliases: ["lion king", "the lion king"], category: "Movie" },
  { emojis: "🚢 🧊 💔 🌊", answer: "Titanic", aliases: ["titanic"], category: "Movie" },
  { emojis: "🧙‍♂️ ⚡ 👓 🧹", answer: "Harry Potter", aliases: ["harry potter"], category: "Movie" },
  { emojis: "🦖 🏝️ 🚙 🧬", answer: "Jurassic Park", aliases: ["jurassic park", "jurassic world"], category: "Movie" },
  { emojis: "🎈 🏠 👴 👦", answer: "Up", aliases: ["up", "pixar up"], category: "Movie" },
  { emojis: "🦇 🃏 🏙️ 🌃", answer: "The Dark Knight", aliases: ["dark knight", "batman", "the dark knight"], category: "Movie" },
  { emojis: "🏴‍☠️ ⚔️ 🧭 🌊", answer: "Pirates of the Caribbean", aliases: ["pirates of the caribbean", "potc"], category: "Movie" },
  { emojis: "🍫 🏭 🎩 🎟️", answer: "Charlie and the Chocolate Factory", aliases: ["willy wonka", "charlie and the chocolate factory", "wonka"], category: "Movie" },
  { emojis: "🤖 💊 🕶️ 🟢", answer: "The Matrix", aliases: ["matrix", "the matrix"], category: "Movie" },
  { emojis: "👽 🚲 🌕 👉", answer: "E.T.", aliases: ["et", "e.t.", "e.t. the extra-terrestrial"], category: "Movie" },
  { emojis: "❄️ 👭 ⛄ 👑", answer: "Frozen", aliases: ["frozen"], category: "Movie" },
  { emojis: "🏎️ 🏁 ⚡ 🏆", answer: "Cars", aliases: ["cars", "lightning mcqueen"], category: "Movie" },
  { emojis: "🥊 🐯 🥩 🏃‍♂️", answer: "Rocky", aliases: ["rocky", "rocky balboa"], category: "Movie" },
  { emojis: "🤡 🎈 🌧️ ⛵", answer: "It", aliases: ["it", "pennywise", "it chapter one"], category: "Movie" },
  { emojis: "👻 🚫 🔫 🚗", answer: "Ghostbusters", aliases: ["ghostbusters"], category: "Movie" },

  // Anime & Cartoons
  { emojis: "🏴‍☠️ 👒 🍖 🌊", answer: "One Piece", aliases: ["one piece", "luffy"], category: "Anime" },
  { emojis: "🥷 🦊 🍜 🌀", answer: "Naruto", aliases: ["naruto", "naruto shippuden"], category: "Anime" },
  { emojis: "🥋 🐉 🟡 ⚡", answer: "Dragon Ball Z", aliases: ["dragon ball", "dragon ball z", "dbz", "dragon ball super"], category: "Anime" },
  { emojis: "⚔️ 👹 🗡️ 🌊", answer: "Demon Slayer", aliases: ["demon slayer", "kimetsu no yaiba"], category: "Anime" },
  { emojis: "📓 🍎 🖊️ ☠️", answer: "Death Note", aliases: ["death note"], category: "Anime" },
  { emojis: "🧱 🧗‍♂️ 🩸 👹", answer: "Attack on Titan", aliases: ["attack on titan", "aot", "shingeki no kyojin"], category: "Anime" },
  { emojis: "🐱 🐭 🧀 🔨", answer: "Tom and Jerry", aliases: ["tom and jerry", "tom & jerry"], category: "Cartoon" },
  { emojis: "🧽 🍍 🌊 🦀", answer: "SpongeBob SquarePants", aliases: ["spongebob", "spongebob squarepants"], category: "Cartoon" },
  { emojis: "👦 🐕 🔬 ⏰", answer: "Rick and Morty", aliases: ["rick and morty", "rick & morty"], category: "Cartoon" },
  { emojis: "🦸‍♂️ 👊 👨‍🦲 🥊", answer: "One Punch Man", aliases: ["one punch man", "opm", "saitama"], category: "Anime" },

  // Video Games
  { emojis: "🍄 🏰 🐢 👨🏻", answer: "Super Mario", aliases: ["mario", "super mario", "super mario bros"], category: "Video Game" },
  { emojis: "⛏️ 🧱 🟩 🧟", answer: "Minecraft", aliases: ["minecraft"], category: "Video Game" },
  { emojis: "🔫 🚗 💰 🌴", answer: "Grand Theft Auto", aliases: ["gta", "grand theft auto", "gta 5", "gta v", "gta 6"], category: "Video Game" },
  { emojis: "🦔 💍 👟 🌀", answer: "Sonic the Hedgehog", aliases: ["sonic", "sonic the hedgehog"], category: "Video Game" },
  { emojis: "🪓 🏹 ⚔️ 🧝‍♀️", answer: "The Legend of Zelda", aliases: ["zelda", "the legend of zelda"], category: "Video Game" },
  { emojis: "🪂 🔫 🚌 ⛏️", answer: "Fortnite", aliases: ["fortnite"], category: "Video Game" },
];

const TRIVIA_QUESTIONS = [
  // Spider-Man & Marvel
  {
    q: "What is Miles Morales' middle name?",
    options: ["Gonzalo", "G.", "Peter", "Aaron"],
    answer: "B",
    explanation: "His full name is Miles Gonzalo Morales, Earth-42 Miles goes by Miles G. Morales!",
    category: "Marvel & Spider-Verse",
  },
  {
    q: "Which spider bit Miles Morales in Into the Spider-Verse?",
    options: ["Spider #1610", "Spider #42", "Spider #2099", "Spider #616"],
    answer: "B",
    explanation: "It was Spider #42 from Earth-42, brought over by Alchemax!",
    category: "Marvel & Spider-Verse",
  },
  {
    q: "What color is Spider-Man Noir's Rubik's Cube at the end of the first film?",
    options: ["Black and White", "Full of Colors", "Gold", "Invisible"],
    answer: "B",
    explanation: "He finally solved it and was amazed that it has colors!",
    category: "Marvel & Spider-Verse",
  },
  {
    q: "Who leads the Spider-Society in Spider-Man: Across the Spider-Verse?",
    options: ["Peter B. Parker", "Spider-Punk", "Miguel O'Hara", "Madame Web"],
    answer: "C",
    explanation: "Miguel O'Hara (Spider-Man 2099) founded and leads the Spider-Society!",
    category: "Marvel & Spider-Verse",
  },
  {
    q: "What is Spider-Punk's real name?",
    options: ["Pavitr Prabhakar", "Hobie Brown", "Ben Reilly", "Miles Morales"],
    answer: "B",
    explanation: "Spider-Punk is Hobie Brown from Earth-138!",
    category: "Marvel & Spider-Verse",
  },
  {
    q: "What is the name of Thor's enchanted hammer in Marvel Comics/MCU?",
    options: ["Stormbreaker", "Mjolnir", "Gungnir", "Aegis"],
    answer: "B",
    explanation: "Mjolnir is forged from Uru metal in the heart of a dying star!",
    category: "Marvel & Spider-Verse",
  },
  {
    q: "What fictional metal is bonded to Wolverine's skeleton?",
    options: ["Vibranium", "Adamantium", "Uru", "Promethium"],
    answer: "B",
    explanation: "Adamantium is an virtually indestructible metal alloy!",
    category: "Marvel & Spider-Verse",
  },

  // General Knowledge & Pop Culture
  {
    q: "What is the capital city of Australia?",
    options: ["Sydney", "Melbourne", "Canberra", "Brisbane"],
    answer: "C",
    explanation: "Canberra is the capital city of Australia!",
    category: "Geography",
  },
  {
    q: "What is the hottest planet in our solar system?",
    options: ["Mercury", "Venus", "Mars", "Jupiter"],
    answer: "B",
    explanation: "Venus is the hottest due to its thick greenhouse atmosphere (over 465°C / 870°F)!",
    category: "Science",
  },
  {
    q: "How many hearts does an octopus have?",
    options: ["1", "2", "3", "4"],
    answer: "C",
    explanation: "An octopus has 3 hearts: two pump blood to the gills, one pumps to the body!",
    category: "Science & Nature",
  },
  {
    q: "Which element on the periodic table has the chemical symbol 'Au'?",
    options: ["Silver", "Gold", "Copper", "Aluminum"],
    answer: "B",
    explanation: "'Au' comes from the Latin word 'Aurum', meaning Gold!",
    category: "Science",
  },
  {
    q: "Who painted the famous artwork 'Starry Night'?",
    options: ["Leonardo da Vinci", "Pablo Picasso", "Vincent van Gogh", "Claude Monet"],
    answer: "C",
    explanation: "Vincent van Gogh painted Starry Night in June 1889!",
    category: "Art & History",
  },
  {
    q: "What is the highest-grossing film of all time (unadjusted for inflation)?",
    options: ["Avengers: Endgame", "Titanic", "Avatar", "Star Wars: The Force Awakens"],
    answer: "C",
    explanation: "James Cameron's Avatar (2009) holds the record with over $2.9 billion worldwide!",
    category: "Movies",
  },
  {
    q: "In what year was the original iPhone released?",
    options: ["2005", "2007", "2009", "2010"],
    answer: "B",
    explanation: "Steve Jobs unveiled the first iPhone on January 9, 2007!",
    category: "Technology",
  },
  {
    q: "Which video game character eats ghosts after consuming power pellets?",
    options: ["Sonic", "Mario", "Pac-Man", "Mega Man"],
    answer: "C",
    explanation: "Pac-Man eats Blinky, Pinky, Inky, and Clyde after eating a Power Pellet!",
    category: "Video Games",
  },
  {
    q: "What is the primary currency used in Japan?",
    options: ["Yuan", "Won", "Yen", "Baht"],
    answer: "C",
    explanation: "The Yen (¥) is the official Japanese currency!",
    category: "General Knowledge",
  },
  {
    q: "How many bones are there in an adult human body?",
    options: ["186", "206", "256", "306"],
    answer: "B",
    explanation: "An adult human has 206 bones (babies are born with around 270 which fuse together)!",
    category: "Science",
  },
  {
    q: "Which country is home to the ancient ruins of Machu Picchu?",
    options: ["Chile", "Mexico", "Peru", "Colombia"],
    answer: "C",
    explanation: "Machu Picchu is a 15th-century Inca citadel located in Peru!",
    category: "Geography",
  },
  {
    q: "What is the longest river in the world?",
    options: ["Amazon River", "Nile River", "Yangtze River", "Mississippi River"],
    answer: "B",
    explanation: "The Nile River is approximately 6,650 km (4,132 miles) long!",
    category: "Geography",
  },
  {
    q: "In the anime 'One Piece', what kind of Devil Fruit did Luffy eat?",
    options: ["Gomu Gomu no Mi / Hito Hito no Mi: Nika", "Mera Mera no Mi", "Ope Ope no Mi", "Gura Gura no Mi"],
    answer: "A",
    explanation: "Luffy ate the legendary Sun God Nika fruit (known as Gomu Gomu no Mi)!",
    category: "Anime",
  },
];

// ==========================================
// 2. HELPER UTILS
// ==========================================

const HANGMAN_ASCII = [
  `  +---+
  |   |
      |
      |
      |
      |
=========`,
  `  +---+
  |   |
  O   |
      |
      |
      |
=========`,
  `  +---+
  |   |
  O   |
  |   |
      |
      |
=========`,
  `  +---+
  |   |
  O   |
 /|   |
      |
      |
=========`,
  `  +---+
  |   |
  O   |
 /|\\  |
      |
      |
=========`,
  `  +---+
  |   |
  O   |
 /|\\  |
 /    |
      |
=========`,
  `  +---+
  |   |
  O   |
 /|\\  |
 / \\  |
      |
=========`,
];

function renderTTTBoard(board) {
  const symbols = board.map((cell, idx) => {
    if (cell === "X") return "❌";
    if (cell === "O") return "⭕";
    const numEmojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"];
    return numEmojis[idx];
  });
  return [
    `  ${symbols[0]} ┃ ${symbols[1]} ┃ ${symbols[2]}`,
    `  ───┼───┼───`,
    `  ${symbols[3]} ┃ ${symbols[4]} ┃ ${symbols[5]}`,
    `  ───┼───┼───`,
    `  ${symbols[6]} ┃ ${symbols[7]} ┃ ${symbols[8]}`,
  ].join("\n");
}

function checkTTTWinner(board) {
  const winLines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6],           // Diagonals
  ];
  for (const [a, b, c] of winLines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  if (board.every((cell) => cell !== null)) {
    return "DRAW";
  }
  return null;
}

function getBotTTTMove(board) {
  const winLines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];

  // 1. Check if Bot (O) can win in 1 move
  for (const [a, b, c] of winLines) {
    const line = [board[a], board[b], board[c]];
    if (line.filter((x) => x === "O").length === 2 && line.includes(null)) {
      if (board[a] === null) return a;
      if (board[b] === null) return b;
      if (board[c] === null) return c;
    }
  }

  // 2. Block Player (X) from winning
  for (const [a, b, c] of winLines) {
    const line = [board[a], board[b], board[c]];
    if (line.filter((x) => x === "X").length === 2 && line.includes(null)) {
      if (board[a] === null) return a;
      if (board[b] === null) return b;
      if (board[c] === null) return c;
    }
  }

  // 3. Take Center if open
  if (board[4] === null) return 4;

  // 4. Take random open corner
  const corners = [0, 2, 6, 8].filter((i) => board[i] === null);
  if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];

  // 5. Take any remaining open square
  const openCells = board.map((v, i) => (v === null ? i : null)).filter((v) => v !== null);
  return openCells[Math.floor(Math.random() * openCells.length)];
}

// ==========================================
// 3. COMMAND REGISTRATION & EXPORT
// ==========================================

let commands = [
  "ttt",
  "tictactoe",
  "roulette",
  "russianroulette",
  "spin",
  "hangman",
  "hm",
  "wordle",
  "wdl",
  "riddle",
  "tease",
  "emojiquiz",
  "guessemoji",
  "emojiriddle",
  "guessmovie",
  "trivia",
  "quiz",
];

export default {
  name: "games",
  alias: [...commands],
  uniquecommands: [
    "tictactoe",
    "roulette",
    "hangman",
    "wordle",
    "riddle",
    "emojiquiz",
    "trivia",
  ],
  description: "Interactive multiplayer and party games (Tic-Tac-Toe, Roulette, Hangman, Wordle, Riddles, Trivia)",
  start: async (SpiderBot, m, { inputCMD, text, args, doReact, prefix, pushName }) => {
    const from = m.from;
    const senderNumber = m.sender.split("@")[0].replace(/[^0-9]/g, "");

    switch (inputCMD) {
      // =====================================================
      // 1. TIC-TAC-TOE (/ttt, /tictactoe)
      // =====================================================
      case "ttt":
      case "tictactoe": {
        await doReact("🎮");
        const sub = (args[0] || "").toLowerCase();

        // Cancel / Surrender
        if (sub === "cancel" || sub === "surrender" || sub === "forfeit" || sub === "stop") {
          if (!tttSessions.has(from)) {
            return m.reply(`🕸️ No active Tic-Tac-Toe match in this chat! Start one with \`${prefix}ttt\`.`);
          }
          tttSessions.delete(from);
          return m.reply(`🏳️ *Tic-Tac-Toe game has been cancelled/forfeited!*`);
        }

        // Check if player is making a move (number 1-9)
        const moveNum = parseInt(sub, 10);
        if (!isNaN(moveNum) && moveNum >= 1 && moveNum <= 9) {
          const session = tttSessions.get(from);
          if (!session) {
            return m.reply(`🕸️ No active game! Start a new match with \`${prefix}ttt\` or challenge a friend with \`${prefix}ttt @user\`.`);
          }

          const moveIndex = moveNum - 1;
          if (session.board[moveIndex] !== null) {
            return m.reply(`⚠️ Square *${moveNum}* is already taken! Choose an empty square (1-9).\n\n${renderTTTBoard(session.board)}`);
          }

          // Verify turn
          const isPlayerX = session.playerX.id === senderNumber;
          const isPlayerO = session.playerO.id === senderNumber;

          if (session.turn === "X" && !isPlayerX) {
            return m.reply(`⏳ It is @${session.playerX.id}'s turn (❌)! Please wait.`, { mentions: [session.playerX.jid] });
          }
          if (session.turn === "O" && !isPlayerO && !session.isVsBot) {
            return m.reply(`⏳ It is @${session.playerO.id}'s turn (⭕)! Please wait.`, { mentions: [session.playerO.jid] });
          }

          // Apply move
          session.board[moveIndex] = session.turn;

          // Check Winner
          let result = checkTTTWinner(session.board);
          if (result) {
            tttSessions.delete(from);
            if (result === "DRAW") {
              await addXP(senderNumber, 15);
              return m.reply(
                `╔════〔 🕸️ TIC-TAC-TOE 〕════╗\n${renderTTTBoard(session.board)}\n╠══════════════════════════╣\n🤝 *IT'S A DRAW!* Well played both!\n🎁 +15 XP rewarded!\n╚══════════════════════════╝`
              );
            }

            const winner = result === "X" ? session.playerX : session.playerO;
            if (winner.id !== "BOT") {
              await addXP(winner.id, 50);
              await addTokens(winner.id, 100);
            }

            return m.reply(
              `╔════〔 🕸️ TIC-TAC-TOE 〕════╗\n${renderTTTBoard(session.board)}\n╠══════════════════════════╣\n🎉 *VICTORY!* @${winner.id} (${result === "X" ? "❌" : "⭕"}) WINS!\n🏆 *Rewards:* +50 XP & +100 Spider-Tokens!\n╚══════════════════════════╝`,
              { mentions: winner.jid ? [winner.jid] : [] }
            );
          }

          // Switch Turn
          if (session.isVsBot) {
            // Bot Move (O)
            const botMove = getBotTTTMove(session.board);
            session.board[botMove] = "O";

            result = checkTTTWinner(session.board);
            if (result) {
              tttSessions.delete(from);
              if (result === "DRAW") {
                await addXP(senderNumber, 15);
                return m.reply(
                  `╔════〔 🕸️ TIC-TAC-TOE 〕════╗\n${renderTTTBoard(session.board)}\n╠══════════════════════════╣\n🤝 *IT'S A DRAW!* Good game vs Miles Bot!\n🎁 +15 XP rewarded!\n╚══════════════════════════╝`
                );
              }

              if (result === "O") {
                return m.reply(
                  `╔════〔 🕸️ TIC-TAC-TOE 〕════╗\n${renderTTTBoard(session.board)}\n╠══════════════════════════╣\n🤖 *Miles Bot (⭕) Wins!* Better luck next time, Spider-Friend!\n╚══════════════════════════╝`
                );
              }
            }

            return m.reply(
              `╔════〔 🕸️ TIC-TAC-TOE 〕════╗\n║ 👤 @${session.playerX.id} (❌) vs 🤖 Miles Bot (⭕)\n║ 🎮 *Your Turn (❌)*\n╠══════════════════════════╣\n${renderTTTBoard(session.board)}\n╠══════════════════════════╣\n💡 Reply with: \`${prefix}ttt <1-9>\`\n╚══════════════════════════╝`,
              { mentions: [session.playerX.jid] }
            );
          } else {
            session.turn = session.turn === "X" ? "O" : "X";
            const nextPlayer = session.turn === "X" ? session.playerX : session.playerO;
            return m.reply(
              `╔════〔 🕸️ TIC-TAC-TOE 〕════╗\n║ ❌ @${session.playerX.id} vs ⭕ @${session.playerO.id}\n║ 🎮 *Turn:* @${nextPlayer.id} (${session.turn === "X" ? "❌" : "⭕"})\n╠══════════════════════════╣\n${renderTTTBoard(session.board)}\n╠══════════════════════════╣\n💡 Reply with: \`${prefix}ttt <1-9>\`\n╚══════════════════════════╝`,
              { mentions: [session.playerX.jid, session.playerO.jid] }
            );
          }
        }

        // Start new game
        let opponentJid = null;
        let opponentId = "BOT";
        let isVsBot = true;

        if (m.mentionedJid && m.mentionedJid.length > 0 && m.mentionedJid[0] !== m.sender) {
          opponentJid = m.mentionedJid[0];
          opponentId = opponentJid.split("@")[0].replace(/[^0-9]/g, "");
          isVsBot = false;
        } else if (m.quoted?.sender && m.quoted.sender !== m.sender) {
          opponentJid = m.quoted.sender;
          opponentId = opponentJid.split("@")[0].replace(/[^0-9]/g, "");
          isVsBot = false;
        }

        const newBoard = Array(9).fill(null);
        const newSession = {
          board: newBoard,
          playerX: { id: senderNumber, jid: m.sender },
          playerO: { id: opponentId, jid: opponentJid },
          turn: "X",
          isVsBot,
          startedAt: Date.now(),
        };

        tttSessions.set(from, newSession);

        const mentions = [m.sender];
        if (opponentJid) mentions.push(opponentJid);

        const vsText = isVsBot
          ? `👤 @${senderNumber} (❌) vs 🤖 Miles Bot (⭕)`
          : `👤 @${senderNumber} (❌) vs 👤 @${opponentId} (⭕)`;

        return m.reply(
          `╔════〔 🕸️ TIC-TAC-TOE MATCH 〕════╗\n║ ${vsText}\n║ 🎮 *First Turn:* @${senderNumber} (❌)\n╠════════════════════════════════╣\n${renderTTTBoard(newBoard)}\n╠════════════════════════════════╣\n💡 Play your move: \`${prefix}ttt <1-9>\`\n🏳️ Surrender: \`${prefix}ttt cancel\`\n╚════════════════════════════════╝`,
          { mentions }
        );
      }

      // =====================================================
      // 2. RUSSIAN ROULETTE (/roulette, /spin)
      // =====================================================
      case "roulette":
      case "russianroulette":
      case "spin": {
        await doReact("🎲");
        let bet = 50;
        if (args[0] && !isNaN(parseInt(args[0], 10))) {
          bet = Math.max(10, Math.min(1000, parseInt(args[0], 10)));
        }

        const user = await getUserRPG(senderNumber);
        if (user.tokens < bet) {
          return m.reply(`🚫 *Insufficient Tokens:* You need \`${bet}\` Spider-Tokens to spin the cylinder! Balance: \`${user.tokens}\``);
        }

        let session = rouletteSessions.get(from);
        if (!session) {
          session = {
            chambers: 6,
            bullet: Math.floor(Math.random() * 6) + 1,
            currentPull: 1,
            pot: 0,
          };
          rouletteSessions.set(from, session);
        }

        const isBullet = session.currentPull === session.bullet;
        const remaining = session.chambers - session.currentPull + 1;

        if (isBullet) {
          rouletteSessions.delete(from);
          const newBal = await addTokens(senderNumber, -bet);
          const roasts = [
            "Your spider-sense was completely asleep!",
            "Even Spot could dodge better than that.",
            "That's gonna leave a multiverse dent in your forehead!",
            "Miguel O'Hara warned you not to mess with canon events!",
          ];
          const roast = roasts[Math.floor(Math.random() * roasts.length)];

          return m.reply(
            `🔫 *RUSSIAN ROULETTE — CHAMBER ${session.currentPull}/6*\n\n💥 *BANG! YOU GOT HIT!* 💀\n\n"${roast}"\n\n💸 *Lost:* \`-${bet}\` Spider-Tokens\n💰 *New Balance:* ${newBal} Tokens\n🔄 Cylinder reloaded!`
          );
        } else {
          session.currentPull++;
          const winTokens = Math.round(bet * 0.5);
          const newBal = await addTokens(senderNumber, winTokens);
          await addXP(senderNumber, 20);

          return m.reply(
            `🔫 *RUSSIAN ROULETTE — CHAMBER ${session.currentPull - 1}/6*\n\n*CLICK!* 😮💨 *You Survived!*\n\n🎉 *Reward:* \`+${winTokens}\` Spider-Tokens & +20 XP!\n💰 *Balance:* ${newBal} Tokens\n🎲 *Chambers Left:* ${remaining - 1}/6\n\n💡 Next brave hero can type \`${prefix}roulette ${bet}\` to pull the trigger!`
          );
        }
      }

      // =====================================================
      // 3. HANGMAN (/hangman, /hm)
      // =====================================================
      case "hangman":
      case "hm": {
        await doReact("🪢");
        const guess = (text || "").trim().toUpperCase();

        if (guess === "CANCEL" || guess === "STOP" || guess === "GIVEUP") {
          if (!hangmanSessions.has(from)) return m.reply(`🕸️ No active Hangman game in this chat!`);
          const s = hangmanSessions.get(from);
          hangmanSessions.delete(from);
          return m.reply(`🏳️ *Game Over!* The secret word was: *${s.word}*`);
        }

        let session = hangmanSessions.get(from);

        // Start new game if none exists or if player typed /hangman with no arguments
        if (!session || (!guess && session)) {
          const item = HANGMAN_WORDS[Math.floor(Math.random() * HANGMAN_WORDS.length)];
          session = {
            word: item.word,
            category: item.category,
            guessed: new Set(),
            wrongGuesses: 0,
            maxWrong: 6,
            startedAt: Date.now(),
          };
          hangmanSessions.set(from, session);

          const masked = session.word
            .split("")
            .map((ch) => (ch === " " ? "  " : "_"))
            .join(" ");

          return m.reply(
            `╔════〔 🕸️ SPIDER HANGMAN 〕════╗\n║ 📂 *Category:* ${session.category}\n║ 🔤 *Word:* ${masked}\n║ ❤️ *Lives:* ❤️❤️❤️❤️❤️❤️ (6/6)\n╠═════════════════════════════╣\n${HANGMAN_ASCII[0]}\n╠═════════════════════════════╣\n💡 Guess a letter: \`${prefix}hangman <letter>\`\n🏳️ Give up: \`${prefix}hangman giveup\`\n╚═════════════════════════════╝`
          );
        }

        // Process Guess
        if (!guess) {
          const masked = session.word
            .split("")
            .map((ch) => (ch === " " ? "  " : session.guessed.has(ch) ? ch : "_"))
            .join(" ");
          return m.reply(
            `╔════〔 🕸️ HANGMAN STATUS 〕════╗\n║ 📂 *Category:* ${session.category}\n║ 🔤 *Word:* ${masked}\n║ 🎯 *Guessed:* [ ${[...session.guessed].join(", ") || "None"} ]\n║ ❤️ *Lives Left:* ${session.maxWrong - session.wrongGuesses}/${session.maxWrong}\n╠═════════════════════════════╣\n${HANGMAN_ASCII[session.wrongGuesses]}\n╠═════════════════════════════╣\n💡 Guess with: \`${prefix}hangman <letter>\`\n╚═════════════════════════════╝`
          );
        }

        // Full word guess
        if (guess.length > 1) {
          if (guess === session.word.replace(/\s+/g, "") || guess === session.word) {
            hangmanSessions.delete(from);
            await addXP(senderNumber, 60);
            await addTokens(senderNumber, 150);
            return m.reply(
              `🎉 *CORRECT! YOU SOLVED THE HANGMAN!* 🕸️\n\n✨ *Word:* ${session.word}\n📂 *Category:* ${session.category}\n🏆 *Rewards:* +60 XP & +150 Spider-Tokens awarded to @${senderNumber}!`,
              { mentions: [m.sender] }
            );
          } else {
            session.wrongGuesses++;
          }
        } else {
          // Single letter guess
          const char = guess[0];
          if (session.guessed.has(char)) {
            return m.reply(`⚠️ You already guessed letter *'${char}'*! Try a different one.`);
          }
          session.guessed.add(char);

          if (!session.word.includes(char)) {
            session.wrongGuesses++;
          }
        }

        // Check Win
        const isWon = session.word
          .split("")
          .every((ch) => ch === " " || session.guessed.has(ch));

        if (isWon) {
          hangmanSessions.delete(from);
          await addXP(senderNumber, 50);
          await addTokens(senderNumber, 120);
          return m.reply(
            `🎉 *CONGRATULATIONS!* 🕸️\n\n✨ *Word:* ${session.word}\n📂 *Category:* ${session.category}\n🏆 *Rewards:* +50 XP & +120 Spider-Tokens to @${senderNumber}!`,
            { mentions: [m.sender] }
          );
        }

        // Check Loss
        if (session.wrongGuesses >= session.maxWrong) {
          hangmanSessions.delete(from);
          return m.reply(
            `💀 *GAME OVER! HANGMAN DEFEATED!*\n\n${HANGMAN_ASCII[6]}\n\n✨ The secret word was: *${session.word}*\n💡 Start a new game anytime with \`${prefix}hangman\`!`
          );
        }

        // Render progress
        const masked = session.word
          .split("")
          .map((ch) => (ch === " " ? "  " : session.guessed.has(ch) ? ch : "_"))
          .join(" ");

        const hearts = "❤️".repeat(session.maxWrong - session.wrongGuesses) + "🤍".repeat(session.wrongGuesses);

        return m.reply(
          `╔════〔 🕸️ SPIDER HANGMAN 〕════╗\n║ 📂 *Category:* ${session.category}\n║ 🔤 *Word:* ${masked}\n║ 🎯 *Guessed:* [ ${[...session.guessed].join(", ")} ]\n║ ❤️ *Lives:* ${hearts} (${session.maxWrong - session.wrongGuesses}/${session.maxWrong})\n╠═════════════════════════════╣\n${HANGMAN_ASCII[session.wrongGuesses]}\n╠═════════════════════════════╣\n💡 Guess: \`${prefix}hangman <letter/word>\`\n╚═════════════════════════════╝`
        );
      }

      // =====================================================
      // 4. WORDLE (/wordle, /wdl)
      // =====================================================
      case "wordle":
      case "wdl": {
        await doReact("🟩");
        const guess = (text || "").trim().toUpperCase();

        if (guess === "CANCEL" || guess === "STOP" || guess === "GIVEUP") {
          if (!wordleSessions.has(from)) return m.reply(`🕸️ No active Wordle in this chat!`);
          const s = wordleSessions.get(from);
          wordleSessions.delete(from);
          return m.reply(`🏳️ *Wordle Ended!* The secret word was: *${s.word}*`);
        }

        let session = wordleSessions.get(from);

        // Start new game if none active or no guess given
        if (!session) {
          const secret = WORDLE_WORDS[Math.floor(Math.random() * WORDLE_WORDS.length)];
          session = {
            word: secret,
            attempts: [],
            maxAttempts: 6,
            startedAt: Date.now(),
          };
          wordleSessions.set(from, session);

          return m.reply(
            `╔════〔 🟩 5-LETTER WORDLE 〕════╗\n║ 🎯 Guess the secret 5-letter word!\n║ 🔢 Attempts: 0/6\n╠════════════════════════════════╣\n║ 🟩 = Correct letter & spot\n║ 🟨 = In word, wrong spot\n║ ⬛ = Not in word\n╠════════════════════════════════╣\n💡 Make a guess: \`${prefix}wordle <5-letter word>\`\n╚════════════════════════════════╝`
          );
        }

        if (!guess || guess.length !== 5 || !/^[A-Z]{5}$/.test(guess)) {
          return m.reply(
            `⚠️ Please guess a valid *5-letter word*!\nExample: \`${prefix}wordle MILES\` or \`${prefix}wordle POWER\``
          );
        }

        // Evaluate guess
        const secretArr = session.word.split("");
        const guessArr = guess.split("");
        const rowResult = Array(5).fill("⬛");
        const usedSecret = Array(5).fill(false);

        // Green check
        for (let i = 0; i < 5; i++) {
          if (guessArr[i] === secretArr[i]) {
            rowResult[i] = "🟩";
            usedSecret[i] = true;
          }
        }

        // Yellow check
        for (let i = 0; i < 5; i++) {
          if (rowResult[i] !== "🟩") {
            const foundIdx = secretArr.findIndex((ch, idx) => ch === guessArr[i] && !usedSecret[idx]);
            if (foundIdx !== -1) {
              rowResult[i] = "🟨";
              usedSecret[foundIdx] = true;
            }
          }
        }

        const formattedRow = rowResult.map((icon, idx) => `${icon} ${guessArr[idx]}`).join(" ");
        session.attempts.push(formattedRow);

        // Check Win
        if (guess === session.word) {
          wordleSessions.delete(from);
          await addXP(senderNumber, 75);
          await addTokens(senderNumber, 200);
          return m.reply(
            `╔════〔 🟩 WORDLE VICTORY! 〕════╗\n${session.attempts.map((r, i) => `║ ${i + 1}. ${r}`).join("\n")}\n╠════════════════════════════════╣\n🎉 *SOLVED in ${session.attempts.length}/6 attempts!* 🕷️\n✨ *Word:* ${session.word}\n🏆 *Rewards:* +75 XP & +200 Spider-Tokens to @${senderNumber}!\n╚════════════════════════════════╝`,
            { mentions: [m.sender] }
          );
        }

        // Check Loss
        if (session.attempts.length >= session.maxAttempts) {
          wordleSessions.delete(from);
          return m.reply(
            `╔════〔 ⬛ WORDLE OVER 〕════╗\n${session.attempts.map((r, i) => `║ ${i + 1}. ${r}`).join("\n")}\n╠════════════════════════════╣\n💀 *Out of attempts!*\n✨ The secret word was: *${session.word}*\n💡 Start a new game with \`${prefix}wordle\`!\n╚════════════════════════════╝`
          );
        }

        return m.reply(
          `╔════〔 🟩 WORDLE (${session.attempts.length}/6) 〕════╗\n${session.attempts.map((r, i) => `║ ${i + 1}. ${r}`).join("\n")}\n╠════════════════════════════════╣\n💡 Next guess: \`${prefix}wordle <5-letter word>\`\n╚════════════════════════════════╝`
        );
      }

      // =====================================================
      // 5. RIDDLES (/riddle, /tease)
      // =====================================================
      case "riddle":
      case "tease": {
        await doReact("🧩");
        const input = (text || "").trim().toLowerCase();

        let session = riddleSessions.get(from);

        if (input === "hint") {
          if (!session) return m.reply(`🕸️ No active riddle right now! Start one with \`${prefix}riddle\`.`);
          return m.reply(`💡 *RIDDLE HINT:* ${session.hint}`);
        }

        if (input === "answer" || input === "giveup" || input === "reveal") {
          if (!session) return m.reply(`🕸️ No active riddle right now! Start one with \`${prefix}riddle\`.`);
          riddleSessions.delete(from);
          return m.reply(`🧩 *RIDDLE REVEALED:* The answer was *${session.answers[0].toUpperCase()}*!`);
        }

        // Answer attempt
        if (session && input.length > 0) {
          const isCorrect = session.answers.some((ans) => {
            const cleanAns = ans.toLowerCase().replace(/^(a|an|the)\s+/, "");
            const cleanInput = input.replace(/^(a|an|the)\s+/, "");
            return cleanInput.includes(cleanAns) || cleanAns.includes(cleanInput);
          });

          if (isCorrect) {
            riddleSessions.delete(from);
            await addXP(senderNumber, 40);
            await addTokens(senderNumber, 100);
            return m.reply(
              `🎉 *BULLSEYE!* @${senderNumber} solved the riddle!\n\n✨ *Answer:* ${session.answers[0].toUpperCase()}\n🏆 *Rewards:* +40 XP & +100 Spider-Tokens!`,
              { mentions: [m.sender] }
            );
          } else {
            return m.reply(`❌ Not quite! Keep thinking or type \`${prefix}riddle hint\` for a clue.`);
          }
        }

        // Spawn new riddle
        const r = RIDDLES[Math.floor(Math.random() * RIDDLES.length)];
        session = {
          riddle: r.riddle,
          answers: r.answers,
          hint: r.hint,
          startedAt: Date.now(),
        };
        riddleSessions.set(from, session);

        return m.reply(
          `╔════〔 🧩 SPIDER BRAIN TEASER 〕════╗\n\n"${session.riddle}"\n\n╠══════════════════════════════════╣\n💡 Reply with: \`${prefix}riddle <your answer>\`\n🔍 Need help? \`${prefix}riddle hint\`\n🏳️ Give up? \`${prefix}riddle answer\`\n╚══════════════════════════════════╝`
        );
      }

      // =====================================================
      // 6. EMOJI QUIZ / GUESS THE MOVIE (/emojiquiz, /guessemoji)
      // =====================================================
      case "emojiquiz":
      case "guessemoji":
      case "emojiriddle":
      case "guessmovie": {
        await doReact("🎬");
        const input = (text || "").trim().toLowerCase();

        let session = emojiSessions.get(from);

        if (input === "hint") {
          if (!session) return m.reply(`🕸️ No active emoji puzzle! Start one with \`${prefix}emojiquiz\`.`);
          const lettersCount = session.answer.replace(/\s+/g, "").length;
          return m.reply(`💡 *EMOJI HINT:* Category is *${session.category}* (${lettersCount} letters, ${session.answer.split(" ").length} words)!`);
        }

        if (input === "answer" || input === "giveup" || input === "reveal") {
          if (!session) return m.reply(`🕸️ No active emoji puzzle! Start one with \`${prefix}emojiquiz\`.`);
          emojiSessions.delete(from);
          return m.reply(`🎬 *EMOJI PUZZLE REVEALED:* The title was *${session.answer}*!`);
        }

        // Check guess
        if (session && input.length > 0) {
          const match =
            session.aliases.some((a) => a.toLowerCase() === input || input.includes(a.toLowerCase())) ||
            session.answer.toLowerCase() === input;

          if (match) {
            emojiSessions.delete(from);
            await addXP(senderNumber, 45);
            await addTokens(senderNumber, 120);
            return m.reply(
              `🎉 *CORRECT!* @${senderNumber} guessed the title!\n\n🎬 *Title:* ${session.answer}\n📂 *Category:* ${session.category}\n🏆 *Rewards:* +45 XP & +120 Spider-Tokens!`,
              { mentions: [m.sender] }
            );
          } else {
            return m.reply(`❌ Nope, that's not it! Try again or type \`${prefix}emojiquiz hint\`.`);
          }
        }

        // Spawn new Emoji Quiz
        const q = EMOJI_QUIZZES[Math.floor(Math.random() * EMOJI_QUIZZES.length)];
        session = {
          emojis: q.emojis,
          answer: q.answer,
          aliases: q.aliases,
          category: q.category,
          startedAt: Date.now(),
        };
        emojiSessions.set(from, session);

        return m.reply(
          `╔════〔 🎬 GUESS THE TITLE 〕════╗\n║ 📂 *Category:* ${session.category}\n╠══════════════════════════════╣\n\n     ${session.emojis}\n\n╠══════════════════════════════╣\n💡 Reply with: \`${prefix}emojiquiz <your guess>\`\n🔍 Clue: \`${prefix}emojiquiz hint\`\n🏳️ Give up: \`${prefix}emojiquiz answer\`\n╚══════════════════════════════╝`
        );
      }

      // =====================================================
      // 7. INTERACTIVE TRIVIA QUIZ (/trivia, /quiz)
      // =====================================================
      case "trivia":
      case "quiz": {
        await doReact("🧠");
        const input = (text || "").trim().toUpperCase();

        let session = triviaSessions.get(from);

        if (input === "ANSWER" || input === "SKIP" || input === "GIVEUP") {
          if (!session) return m.reply(`🕸️ No active trivia round! Start one with \`${prefix}trivia\`.`);
          triviaSessions.delete(from);
          return m.reply(
            `🧠 *TRIVIA REVEAL:*\n\n✅ Correct Option: *${session.answer}* — ${session.options[session.answer.charCodeAt(0) - 65]}\n💡 *Info:* ${session.explanation}`
          );
        }

        // Answer attempt
        if (session && input.length > 0) {
          const isCorrect =
            input === session.answer ||
            input === `OPTION ${session.answer}` ||
            input === session.options[session.answer.charCodeAt(0) - 65].toUpperCase();

          if (isCorrect) {
            triviaSessions.delete(from);
            await addXP(senderNumber, 50);
            await addTokens(senderNumber, 100);
            return m.reply(
              `🎉 *CORRECT!* @${senderNumber} nailed the trivia! 🧠\n\n✅ *Answer:* Option ${session.answer} (${session.options[session.answer.charCodeAt(0) - 65]})\n💡 *Intel:* ${session.explanation}\n🏆 *Rewards:* +50 XP & +100 Spider-Tokens!`,
              { mentions: [m.sender] }
            );
          } else if (["A", "B", "C", "D"].includes(input)) {
            return m.reply(`❌ *Incorrect!* Option ${input} is wrong. Anyone else know the answer?`);
          }
        }

        // Spawn new trivia question
        const t = TRIVIA_QUESTIONS[Math.floor(Math.random() * TRIVIA_QUESTIONS.length)];
        session = {
          q: t.q,
          options: t.options,
          answer: t.answer,
          explanation: t.explanation,
          category: t.category,
          startedAt: Date.now(),
        };
        triviaSessions.set(from, session);

        const letters = ["A", "B", "C", "D"];
        const formattedOptions = session.options
          .map((opt, i) => `║ 🔹 *${letters[i]}.* ${opt}`)
          .join("\n");

        return m.reply(
          `╔════〔 🧠 SPIDER-TRIVIA QUIZ 〕════╗\n║ 📂 *Category:* ${session.category}\n╠══════════════════════════════════╣\n║ ❓ *Question:*\n║ ${session.q}\n╠══════════════════════════════════╣\n${formattedOptions}\n╠══════════════════════════════════╣\n💡 Reply with: \`${prefix}trivia A\`, \`B\`, \`C\`, or \`D\`\n🏳️ Skip: \`${prefix}trivia skip\`\n╚══════════════════════════════════╝`
        );
      }
    }
  },
};
