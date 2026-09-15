let commands = [
  "roast",
  "ship",
  "8ball",
  "coinflip",
  "flip",
  "dice",
  "roll",
  "quote",
  "truth",
  "dare",
];

const ROASTS = [
  "You look like an anomaly Miguel O'Hara wouldn't even bother capturing.",
  "Even Spider-Ham has more street cred in Brooklyn than you.",
  "Your spider-sense is permanently set to lagging.",
  "You're like the Spot before he figured out where the holes went.",
  "If Peter B. Parker mentor taught you, he'd ask for his sweatpants back.",
  "You're about as intimidating as Spider-Rex with clipped nails.",
];

const SPIDER_QUOTES = [
  "“Anyone can wear the mask. You can wear the mask. If you didn't know that before, I hope you do now.” — Miles Morales",
  "“That's all it is, Miles. A leap of faith.” — Peter B. Parker",
  "“Everyone keeps telling me how my story is supposed to go... nah, I'mma do my own thing.” — Miles Morales",
  "“Wherever I go, the wind follows. And the wind, it smells like rain.” — Spider-Man Noir",
  "“You gotta do what you gotta do, no matter what it takes.” — Gwen Stacy",
  "“You're the best of all of us, Miles. Just keep going.” — Uncle Aaron",
];

const TRUTHS = [
  // Spider-Verse & Superhero
  "What is the most embarrassing thing your spider-sense failed to warn you about?",
  "If you had to team up with one villain from the Spider-Verse, who would it be?",
  "Who in this chat would make the worst superhero mentor?",
  "If you were bit by a radioactive animal, which animal would give you the worst possible powers?",
  "If you had to trade places with any Spider-Man variant for a week, who would you choose?",
  "Have you ever lied about watching a movie to look cool?",

  // Embarrassing & Funny Moments
  "What is the most embarrassing thing you've ever done in front of a crush?",
  "What's the biggest lie you've ever told without getting caught?",
  "What is your most bizarre habit when you are completely alone?",
  "Have you ever accidentally sent a screenshot of a chat to the exact person you were talking about?",
  "What is the most childish thing you still secretly do?",
  "Have you ever pretended to be sick just to avoid hanging out with someone?",
  "What's the weirdest thing in your web search history right now?",
  "Have you ever stalked an ex or crush on social media for way too long?",
  "What's the worst haircut or fashion disaster you've ever had in your life?",
  "Have you ever laughed so hard that a drink came out of your nose or mouth?",
  "What is the dumbest reason you have ever cried?",
  "What is something mischievous you did as a kid that your parents still don't know about?",
  "Have you ever used someone else's toothbrush by mistake or on purpose?",
  "What is the worst advice you have ever given someone with full confidence?",
  "Have you ever peed in a swimming pool as an adult?",
  "What's the cringiest username or email address you ever created?",
  "Have you ever practiced kissing on a pillow, mirror, or your own hand?",
  "What is the worst excuse you've ever used to cancel plans at the last minute?",
  "Have you ever dropped food on the floor, picked it up, and eaten it anyway when nobody was looking?",
  "What is the weirdest dream you've ever had that you still remember clearly?",
  "Have you ever waved back at someone who was actually waving at the person behind you?",
  "Have you ever walked into a glass door or tripped over absolutely nothing in public?",
  "Have you ever smelled your own clothes or socks to check if they were clean enough to wear again?",
  "What is the most awkward text you have ever sent to the wrong person or group?",
  "Have you ever pretended to understand a joke or reference just to avoid feeling left out?",
  "Have you ever blamed a fart or bad smell on a pet or someone standing next to you?",
  "What's the longest you have ever gone without taking a shower or bath?",
  "Have you ever sung passionately in the shower thinking you were a superstar only to get caught?",
  "Have you ever fallen asleep in public and started snoring or drooling?",
  "What's the most embarrassing song in your playlist that you'd hide from friends?",

  // Crushes, Dating & Relationships
  "Who was your very first crush and do you still think they are attractive?",
  "Have you ever had a secret crush on a teacher, professor, or friend's sibling?",
  "What is your biggest red flag that you're willing to honestly admit?",
  "What is the biggest green flag you look for in a person?",
  "Have you ever been rejected in a brutally awkward or embarrassing way?",
  "If you had to date anyone currently in this group chat, who would it be?",
  "What is the cheesiest pickup line you have ever used (or had used on you)?",
  "Have you ever led someone on even though you knew you didn't like them back?",
  "Have you ever been caught staring or checking someone out?",
  "Have you ever ghosted someone completely? What was the real reason?",
  "Have you ever double-texted or triple-texted someone who left you on delivered or read?",
  "What's one thing you find secretly attractive in people that most consider weird?",
  "Have you ever stalked someone's location or online status obsessively?",
  "What was your most awkward first date experience?",
  "Have you ever stayed up all night texting someone you knew you shouldn't have been talking to?",
  "Have you ever liked someone just because they gave you attention?",

  // Secrets, Life Confessions & Habits
  "What is a secret talent or skill you have that almost nobody knows about?",
  "If you could swap lives with anyone in this chat for 24 hours, who would it be and why?",
  "What is the most expensive thing you've ever accidentally broken and hid or blamed on someone else?",
  "What's a rumor about yourself that turned out to be 100% true?",
  "Have you ever cheated on a test, exam, or quiz in school or college?",
  "What is your biggest fear or phobia that sounds completely ridiculous to others?",
  "If you had a time machine, what is one mistake in your life you would instantly fix?",
  "Have you ever snooped through someone's phone, messages, or diary without their permission?",
  "What is something you are secretly super insecure about?",
  "If your entire search history was projected onto a big screen right now, how doomed are you from 1 to 10?",
  "Have you ever re-gifted a present to someone else because you hated it?",
  "What is the most hypocritical thing you do on a regular basis?",
  "If you could permanently erase one memory from your brain, what would it be?",
  "What's a popular movie, show, or song that everyone loves but you secretly think is trash?",
  "What is the biggest secret you have ever kept from your best friend?",
  "Have you ever cried during a movie, show, or cartoon? Which one was it?",
  "What's the longest amount of screen time you've racked up in a single day?",
  "What's the pettiest thing you've ever done out of pure spite?",
  "What is the weirdest food combination that you genuinely enjoy eating?",
  "If you were arrested today with no explanation, what would your friends automatically assume you did?",
  "What is the most useless piece of trivia or random fact stored in your brain?",
  "What's one item you desperately want to buy right now but cannot afford?",
  "Have you ever lied on your resume, CV, or during an interview?",
  "What is your ultimate guilty pleasure TV show or YouTube binge?",
  "Have you ever faked a phone call or emergency just to escape a conversation or social event?",
  "If you could read the mind of one person in this chat right now, who would it be?",
  "What is the most embarrassing nickname anyone has ever given you?",
  "Have you ever given yourself a full motivational speech in front of the mirror?",
  "What's the weirdest thing you believed as a kid for way too long?",
  "What's a secret you promised you'd never tell, but ended up spilling anyway?",
  "Who in this chat do you think gives the absolute worst life advice?",
  "What is something you judge other people for, even though you know you shouldn't?",
  "Have you ever pretended to like someone's cooking when it was actually terrible?",
  "If you could commit one harmless crime and get away with it forever, what would it be?",
  "What is the most money you have ever wasted on something completely useless?",
  "Have you ever cried over an argument in your head that never even happened in real life?",
  "What is one thing you would change about your physical appearance if you could snap your fingers?",
  "What is the biggest lie you've told on social media to seem cooler or happier?",
  "Have you ever had a crush on an animated character or fictional superhero?",
  "What's the most trouble you've ever gotten into at school or work?",
  "If you won $1,000,000 today, who is the first person you would NOT give a single penny to?",
  "What is something you pretend to hate just because it's cool to hate it?",
  "Have you ever blocked someone just because you were annoyed with them over something tiny?",
  "What's the worst purchase you've ever made that you still regret?",
];

const DARES = [
  // Spider-Verse & Superhero Themed
  "Send a voice note shouting 'NAH, I'MMA DO MY OWN THING!' with maximum conviction.",
  "Change your WhatsApp bio/about to '🕸️ Friendly Neighborhood Anomaly' for 24 hours.",
  "Send a message in the chat explaining why Chai Tea makes total sense (and face Pavitr's wrath).",
  "Send a selfie doing the iconic Spider-Man web-shooter hand sign!",
  "Send a voice note doing your best impression of Spider-Man Noir describing the weather.",
  "Send a 10-second voice note doing Peter B. Parker giving tired, exhausted life advice.",

  // Chat & Social Media Dares
  "Send a voice note singing the chorus of your favorite pop song at the top of your lungs!",
  "Text your crush or a random friend: 'I need to confess something... I eat pizza with ketchup' and screenshot their reply!",
  "Change your WhatsApp profile picture to a silly selfie or a picture of a potato for the next 2 hours!",
  "Send a voice note doing your best impression of an anime character or cartoon!",
  "Send the 5th photo in your phone's camera roll to this chat with zero context!",
  "Send a screenshot of your WhatsApp chat list right now without archiving or hiding anything!",
  "Change your WhatsApp bio/about to 'I eat cereal with warm tap water' for 12 hours!",
  "Send voice messages speaking only in a thick British, cowboy, or pirate accent for the next 5 minutes in this chat!",
  "Text a random contact: 'They found out. Act completely natural.' and send a screenshot of the response!",
  "Send a selfie making the most ridiculous and unhinged facial expression possible!",
  "Let someone in this chat write a 1-sentence message that you must send to any contact of their choice!",
  "Send a voice note mimicking a cat meowing aggressively for 10 seconds straight!",
  "Send the very last screenshot you took on your phone directly into this chat!",
  "Post a single completely random emoji (e.g. 🦧 or 🧽) on your WhatsApp status with no caption for 1 hour!",
  "Send a voice note rapping any song or nursery rhyme for 15 seconds!",
  "Take and send a picture of the inside of your fridge or pantry right now!",
  "Send a voice note whispering your deepest darkest secret (or a fake dramatic one) like a cinematic movie villain!",
  "Send all your messages in ALL CAPS for the next 10 messages you send in this chat!",
  "Send a screenshot of your screen time / digital wellbeing stats for today!",
  "Send a voice note singing Happy Birthday in dramatic opera style to the bot or group!",
  "Write a 4-line romantic love poem dedicated to the person who texted before you in this chat!",
  "Send a voice note crying dramatically over an imaginary dropped slice of pizza!",
  "Give every single active person in this chat a genuine, unique compliment right now!",
  "Text a friend: 'I accidentally adopted a pet goat, can it stay at your place tonight?' and share the screenshot!",
  "Change your group nickname or WhatsApp name to 'Captain Clumsy' for 24 hours!",
  "Share a screenshot of your most frequently used emojis list right now!",
  "Pretend to be a frantic news reporter giving breaking news about an alien invasion in a 15-second voice note!",
  "Confess your undying love for an inanimate object (like your pillow or microwave) in a passionate voice note!",
  "Send a voice note laughing like an evil supervillain for 10 straight seconds!",
  "Act like you just won an Academy Award and give a tearful 20-second acceptance speech via voice note!",
  "Let the group decide a funny nickname for you and refer to yourself in the third person using that name for 15 minutes!",
  "Tell the chat the most embarrassing story you know about yourself with full details!",
  "Send a picture of whatever is directly in front of you right this second without tidying up!",
  "Type out the full chorus of 'Never Gonna Give You Up' by Rick Astley word for word without copy-pasting!",
  "Speak like Master Yoda for the next 5 messages you send in this chat!",
  "Send a voice note making a loud ambulance or police siren noise for 8 seconds!",
  "Record a 10-second ASMR voice note whispering passionately about your favorite comfort food!",
  "Send a photo of the messiest drawer, desk, or corner in your room right now!",
  "Post on your WhatsApp status: 'I believe in dinosaur supremacy 🦖' and leave it for 2 hours!",
  "Give a dramatic 20-second motivational speech about why sleeping 12 hours a day is a superpower!",
  "Send a voice note reading a random ingredient label from a snack or shampoo bottle with pure emotion and tears!",
  "Send the bot a formal marriage proposal in full Shakespearean Old English!",
  "Send a voice note imitating a microwave sound ('MMMMMMMM... BEEP BEEP BEEP!')!",
  "Describe the person who texted before you in this chat using only 5 adjectives!",
  "Text your best friend 'We need to talk...' and then wait 5 minutes before saying '...about how awesome you are!' (screenshot proof)!",
  "Send a selfie where you attempt to recreate a popular meme face!",
  "Send a voice note singing the theme song of your favorite childhood cartoon!",
  "Send a voice note trying to hold a high note for as long as your lungs allow!",
  "Describe your dream vacation using only emojis in the chat!",

  // Physical, Action & Fun Challenges
  "Do 15 pushups or 20 jumping jacks right now and send a voice note proving you're out of breath!",
  "Take a selfie balancing a random household object on top of your head!",
  "Speak only in rhyming sentences in this chat for the next 3 messages!",
  "Put an ice cube in your hand and hold it until it completely melts!",
  "Eat a spoonful of peanut butter, mustard, hot sauce, or ketchup right now!",
  "Spin around in a circle 10 times and send a voice note trying to talk while dizzy!",
  "Do your best dramatic movie death scene in a 5-second video or voice note with screams!",
  "Talk without letting your lips touch each other for your next voice note!",
  "Put socks on your hands for the next 10 minutes and send a photo as proof!",
  "Try to lick your elbow and send a voice note or photo of your struggle!",
  "Balance on one leg with your eyes closed for 30 seconds straight without putting your foot down!",
  "Drink an entire glass of water in under 10 seconds without stopping!",
  "Say the entire English alphabet backwards from Z to A in a voice note in under 15 seconds!",
  "Wear a shirt or hoodie backwards or inside out for the next hour!",
  "Do your best celebrity or movie character impression and let the group guess who it is!",
  "Try not to blink for 45 seconds straight right now!",
  "Tell a hilariously bad joke in a voice note without laughing at yourself!",
  "Send a photo wearing the weirdest combination of footwear you can find (e.g. one boot, one flip-flop)!",
  "Hold a plank or a wall sit for 45 seconds right now!",
  "Do 10 squats while shouting 'I AM INVINCIBLE!' after each rep!",
  "Take a selfie with the most boring object in your room and post it with a dramatic caption!",
  "Whisper everything you say in voice notes for the next 10 minutes!",
  "Eat a raw slice of onion or a lemon wedge without making any facial expression!",
  "Try to juggle 3 random objects for 10 seconds and report how many dropped!",
  "Draw a face on your thumb or hand with a pen, give it a name, and send a picture of your new friend!",
  "Stand up and do your best robot dance for 15 seconds!",
  "Send a voice note imitating 3 different farm animals back-to-back with zero hesitation!",
  "Try to say 'Peter Piper picked a peck of pickled peppers' 5 times fast in a voice note without messing up!",
  "Take a photo of your shoe on your hand like a phone and send it: 'Hello? Yes, this is Shoe.'",
  "Do your best slow-motion running impression and send a 5-second video or voice narration!",
];

export default {
  name: "fun",
  alias: [...commands],
  uniquecommands: ["roast", "ship", "8ball", "coinflip", "dice", "quote", "truth", "dare"],
  description: "Multiverse fun, roasts, games, and quotes",
  start: async (SpiderBot, m, { inputCMD, text, doReact, pushName }) => {
    switch (inputCMD) {
      case "roast": {
        await doReact("🔥");
        let target = "";
        let mentions = [];
        if (m.quoted?.sender) {
          target = `@${m.quoted.sender.split("@")[0]}`;
          mentions.push(m.quoted.sender);
        } else if (m.mentionedJid && m.mentionedJid.length > 0) {
          target = `@${m.mentionedJid[0].split("@")[0]}`;
          mentions.push(m.mentionedJid[0]);
        } else if (text && text.trim().length > 0) {
          target = text.trim();
        } else {
          target = `@${m.sender.split("@")[0]}`;
          mentions.push(m.sender);
        }
        const roast = ROASTS[Math.floor(Math.random() * ROASTS.length)];
        return m.reply(`🔥 *SPIDER ROAST:* ${target}\n\n"${roast}" 💥`, { mentions });
      }

      case "ship": {
        await doReact("💘");
        const percent = Math.floor(Math.random() * 101);
        let bar = "█".repeat(Math.floor(percent / 10)) + "░".repeat(10 - Math.floor(percent / 10));
        let comment = "";
        if (percent > 85) comment = "Multiverse soulmates! Even across dimensions! 💖";
        else if (percent > 50) comment = "Decent compatibility. Like Peter B. and a cheeseburger! 🍔";
        else comment = "Total anomaly. Miguel O'Hara is on the way to break this up. 🚨";

        let targetPair = "";
        let mentions = [];
        if (m.mentionedJid && m.mentionedJid.length >= 2) {
          targetPair = `@${m.mentionedJid[0].split("@")[0]} ❤️ @${m.mentionedJid[1].split("@")[0]}`;
          mentions.push(m.mentionedJid[0], m.mentionedJid[1]);
        } else if (m.mentionedJid && m.mentionedJid.length === 1) {
          targetPair = `@${m.sender.split("@")[0]} ❤️ @${m.mentionedJid[0].split("@")[0]}`;
          mentions.push(m.sender, m.mentionedJid[0]);
        } else if (m.quoted?.sender) {
          targetPair = `@${m.sender.split("@")[0]} ❤️ @${m.quoted.sender.split("@")[0]}`;
          mentions.push(m.sender, m.quoted.sender);
        } else if (text && text.trim().length > 0) {
          targetPair = `@${m.sender.split("@")[0]} ❤️ ${text.trim()}`;
          mentions.push(m.sender);
        } else {
          targetPair = `@${m.sender.split("@")[0]} ❤️ Mystery Partner 💖`;
          mentions.push(m.sender);
        }

        return m.reply(
          `💘 *MULTIVERSE COMPATIBILITY RADAR* 💘\n\nTarget: ${targetPair}\nCompatibility: *${percent}%* [${bar}]\n\n_${comment}_`,
          { mentions }
        );
      }

      case "8ball": {
        await doReact("🎱");
        const answers = [
          "My Spider-Sense says YES! 🕸️",
          "Definitely in this universe!",
          "Ask Peter B. Parker, I'm swinging right now.",
          "Nah, I'mma do my own thing — NO.",
          "Outlook cloudy, like Nueva York in 2099.",
          "100% CANON! It will happen!",
          "Very doubtful, my guy.",
        ];
        const answer = answers[Math.floor(Math.random() * answers.length)];
        return m.reply(`🎱 *MAGIC 8-BALL SAYS:*\n\n"${answer}"`);
      }

      case "coinflip":
      case "flip": {
        await doReact("🪙");
        const result = Math.random() > 0.5 ? "HEADS (Spider-Logo)" : "TAILS (Web)";
        return m.reply(`🪙 *COIN FLIP:* Result is *${result}*!`);
      }

      case "dice":
      case "roll": {
        await doReact("🎲");
        const diceNum = Math.floor(Math.random() * 6) + 1;
        return m.reply(`🎲 *DICE ROLL:* You rolled a *${diceNum}*!`);
      }

      case "quote": {
        await doReact("💬");
        const q = SPIDER_QUOTES[Math.floor(Math.random() * SPIDER_QUOTES.length)];
        return m.reply(`💬 *SPIDER-VERSE WISDOM:*\n\n${q}`);
      }

      case "truth": {
        await doReact("🤔");
        const t = TRUTHS[Math.floor(Math.random() * TRUTHS.length)];
        return m.reply(`🎭 *TRUTH CHALLENGE:*\n\n${t}`);
      }

      case "dare": {
        await doReact("⚡");
        const d = DARES[Math.floor(Math.random() * DARES.length)];
        return m.reply(`⚡ *DARE CHALLENGE:*\n\n${d}`);
      }
    }
  },
};
