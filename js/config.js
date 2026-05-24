/**
 * 🎮 The Friendship Run — CONFIGURATION
 * 
 * Central data layer. Personalize your names, themes, and memory sequences here.
 * Progression thresholds are calculated dynamically from this memories array!
 */

const CONFIG = {
  // Names of the participants
  names: {
    birthday: "Riya",       // Birthday Girl
    friend1: "Me",         // The Chaotic Bestie
    friend2: "Nishtha"     // The Sensible One
  },

  // Color theme for the game UI and Canvas elements
  theme: {
    primary: "#ff6b9d",    // Pastel Pink
    secondary: "#f9c74f",    // Soft Gold
    accent: "#43e8d8",    // Mint/Teal
    background: "#f9f6f0",   // Sunset cream white
    ground: "#221430"    // Deep purple ground color
  },

  // Characters available for selection
  characters: [
    {
      id: "riya",
      name: "Riya",
      emoji: "👩‍⚕️",          // Doctor/Dentist Emoji
      role: "Birthday Girl",
      description: "Fast, energetic, and completely obsessed with shared snacks."
    },
    {
      id: "me",
      name: "Utsav",
      emoji: "🦊",
      role: "Chaotic Bestie",
      description: "Double-jumps at the wrong times. Constantly planning the next wild plan."
    },
    {
      id: "nishthi",
      name: "Nishtha",
      emoji: "🐰",
      role: "The Sensible One",
      description: "Calculates the exact trajectory of jumps. Keeps this trio functional."
    }
  ],

  // Modular Memories array (separated by runner ID for custom storylines)
  memories: {
    riya: [
      {
        id: 1,
        emoji: "🧪",
        place: "Science Exhibition",
        summary: "Probably the loudest team there",
        story: "Dusre logo ka project humse better hoga but I am pretty sure we — especially me 😭 — were the loudest in the room. You and Nishtha were teamed up together. Your project somehow broke when you reached the exhibition but you guys fixed it 🥳.",
        type: "story",
        emotion: "funny",
        image: "assets/riya_pics/mem_1_rj.jpeg"
      },
      {
        id: 2,
        emoji: "📚",
        place: "Std 8 Poetry Competition",
        summary: "The first time I properly noticed you",
        story: "Yaad che 😂, in 8th std we had a poetry competition and coincidentally we chose the same poem 😭 — 'Janni ni Jod sakhi nai jade re lol'. And you won I think, like you came second right? This was probably the first time I properly got to know you.",
        type: "story",
        emotion: "warm",
        image: ""
      },
      {
        id: 3,
        emoji: "📔",
        place: "The Diary Exchange",
        summary: "How I got your number for the first time",
        story: "I must have told you this 😭, our diaries got exchanged somehow, ka to tari mari pase aavi gai hati, and that’s how I got your number for the first time 🥹. I could have just asked you for it, tune kaha bhi tha sayad isk baad ki mang leta 😌. But accha insaan jo hu me 🗿.",
        type: "story",
        emotion: "funny",
        image: "assets/riya_pics/mem_3_rj.jpg"
      },
      {
        id: 4,
        emoji: "✉️",
        place: "The Letter Era",
        summary: "Probably the best phase of school life",
        story: "Best thing of our school life? Like mere liye to he 😌. Because of this thing only, I got you 😭 and you got such a mature and interesting human being as your best friend 🥱. Those letters, reviews, random topics and replies — that phase genuinely made us close.",
        type: "story",
        emotion: "warm",
        image: ""
      },
      {
        id: 5,
        emoji: "😢",
        place: "Std 10 Farewell",
        summary: "You never turned up",
        story: "Horrible thing, one of the most buri cheez 🤡. I fought a lot with you for this if you remember 😂, ki tu aayi nai, maza aata etc. You kept saying till the end ki tu aayegi but you didn't 🫠.",
        type: "story",
        emotion: "dramatic",
        image: "assets/riya_pics/mem_5_rj.jpg"
      },
      {
        id: 6,
        emoji: "🏆",
        place: "10th Prelims Competition",
        summary: "Jitesh Sir thought we were competing",
        story: "Ye to btaya hi hoga tujhe mene 😂. This happened on that prize distribution day, first time I got a prize for something in 10th, although I don't even remember for what 😭. Jitesh Sir literally told my parents that Riya and Utsav are competing very hard because you beat me by a few marks in prelims 🥲. Final exam me to me hi first aaya tha 😎. Fun fact, mujhe Vrushti bhi acchi lagti thi 😭 Jitesh Sir ki ladki.",
        type: "story",
        emotion: "funny",
        image: ""
      },
      {
        id: 7,
        emoji: "🏠",
        place: "First Bhai Dooj Visit",
        summary: "The awkward Bhai Dooj visit",
        story: "Me chal k aaya tha Avsar tak 😂 and from there you came to pick me up. It was hell awkward that day 😂, hm dono ne to baat hi nai kri thi itni, your siblings were talking more with me 😆. Sowry that I didn’t eat at your place, Bhai Dooj thi fir bhi nai khaya 🥀 dumb ass I was. Ghar pahucha tab mummy papa ne bhi kaha ki kha leta, Bhai Dooj thi or gaya tha to 😭.",
        type: "story",
        emotion: "warm",
        image: ""
      },
      {
        id: 8,
        emoji: "🎁",
        place: "Our First Rakhi",
        summary: "One of the best surprises",
        story: "Seriously, one of the best surprises of my life 🥹. Mujhe surprises vese bhi bahot kam mile he, and this was one of the most special ones. 11th std tha tab, corona chal raha tha, and I was constantly staring at my phone because Nishtha ne kaha tha ki you guys would come agar gaadi mil gayi to 😭. Fir boom 💥, you guys actually turned up for me.",
        type: "story",
        emotion: "warm",
        image: ""
      },
      {
        id: 9,
        emoji: "📞",
        place: "Ahmedabad NEET Prep Phase",
        summary: "Your first emotional call with me",
        story: "I was in PG and you were in your pre-drop era, Allen k hostel me thi tu. You cried on a call with me because tujhe bilkul accha nai lag raha tha vaha 😞. You were feeling very lonely and depressed there. Usk baad tune ghar jane ka decide kiya tha, late October me as far as I remember.",
        type: "story",
        emotion: "warm",
        image: ""
      },
      {
        id: 10,
        emoji: "⚡",
        place: "First Big Fight",
        summary: "College changed everything for a while",
        story: "Our first big fight 😂. You got into college and obviously everything was very new for you — whole college life, new people, new environment. Nishtha tried to make me understand too, but still I overthought a lot and fought with you 🥲.",
        type: "story",
        emotion: "dramatic",
        image: "assets/riya_pics/mem_10_r.jpg"
      },
      {
        id: 11,
        emoji: "🍔",
        place: "First Ahmedabad Meet",
        summary: "The first proper trio meetup",
        story: "Yayy 🥳. You guys visited me. Pata nai Nishtha kyu thi Ahmedabad me 🤔 but thik he 😭. One of the best memories honestly. That day I realised ki haan, mujhe ghumna pasand he 😭 — people matter.",
        type: "story",
        emotion: "warm",
        image: "assets/riya_pics/mem_11_rj.jpg"
      },
      {
        id: 12,
        emoji: "☕",
        place: "Danny’s Coffee Birthday",
        summary: "The ring gift and your late entry",
        story: "We gifted you a ring 💍! Pata he kitni matha pacchi krk vo design dhundhi thi 😂. You shitty ass came 1.5 hrs late 💀, you slept 😭. Me vaha Joggers Park me betha raha, bot kahiki 🫠. Usk baad har baar Danny Coffee Bar hi jane ka sochte he hm 😭.",
        type: "story",
        emotion: "funny",
        image: "assets/riya_pics/mem_12_r.jpg"
      },
      {
        id: 13,
        emoji: "💃",
        place: "Vadodara Navratri",
        summary: "You went without me 🥀",
        story: "I still have this wish to go out on Navratri with you guys 😭, infact with all my sisters — especially you guys and Sakshi 🥲. Pata nai kab hoga ye. Akeli chali gai Vadodara, Nishtha k sath khelne 🥀. But I know this is probably one of Nishtha’s favourite memories too 😂.",
        type: "story",
        emotion: "funny",
        image: "assets/riya_pics/mem_13_rj.jpg"
      },
      {
        id: 14,
        emoji: "🌯",
        place: "The Bajra Wrap Disaster",
        summary: "Instagram reels lied to us",
        story: "Teri bajeh se bajra khaya he mene wrap me 😭 bot kahiki. Instagram reel dekh kr gaye the because B1G1 tha 🗿. Tera wrap bhi mene khaya tha thoda 😭. But honestly, evening acchi thi. Keventers pe waffle khaya and tune 1 bola tha 😂, mene 2 order kr diye the.",
        type: "story",
        emotion: "funny",
        image: "assets/riya_pics/mem_14_r.jpg"
      },
      {
        id: 15,
        emoji: "🛍️",
        place: "First Shopping Together",
        summary: "You chose my best outfit",
        story: "Bhai firse chalna mere sath jab me kahu 😭. I still have the best outfit in my wardrobe, jo tune kharidvaya tha mujhe from Zudio 😎. Itne compliments aaye he us outfit pe. Fir uske baad 10 min ka show skip ho gaya tha Final Destination ka because sab unplanned tha 😂. Aur tu shaani ban rhi thi popcorn lejane me 😂, security ne checking me nikal liya tha.",
        type: "story",
        emotion: "warm",
        image: ""
      },
      {
        id: 16,
        emoji: "🏺",
        place: "Ahmedabad HAAT",
        summary: "50 rupees pottery and horrible food",
        story: "Well well, 50rs me pottery kri he hmne 😂 and video bhi bana liya. Fir tatti khana khane 1.5 km chale hm 😭. MMV turned out very bad that day honestly 🥀.",
        type: "story",
        emotion: "funny",
        image: "assets/riya_pics/mem_16_rj.jpeg"
      },
      {
        id: 17,
        emoji: "🎤",
        place: "The Interview Reel",
        summary: "You completely fumbled it",
        story: "Tum dono ka influencer ne women hone k nate interview liya tha 😂 and posted it on Insta. You literally fucked up in that 😭 mujhe to bas yehi yaad he 🗿. Why tf I don't have that reel now, send me dhundh k pls 😂.",
        type: "story",
        emotion: "funny",
        image: "assets/riya_pics/mem_17_rj.jpeg"
      },
      {
        id: 18,
        emoji: "🤫",
        place: "The Boyfriend Reveal",
        summary: "2.5 years later 😭",
        story: "Shitty coward ass you are 😭. Hmse kya darna bhai 🥲. Itne saal me to samaj jana chahiye tha ki we won't judge you... dusro ko zarur krenge 😂. Thike ab, tab hi bahot jhagda kr liya tha hmne 🗿 not anymore.",
        type: "story",
        emotion: "funny",
        image: "assets/riya_pics/mem_18_r.jpeg"
      },
      {
        id: 19,
        emoji: "🏰",
        place: "First Udaipur Trip",
        summary: "You looked genuinely happy",
        story: "Other than with your siblings, I think this is one of the happiest I have seen you 🥹. Isse pehle bhi gayi thi na kahi, maybe Polo Forest 🤔? But this trip just felt different.",
        type: "story",
        emotion: "warm",
        image: "assets/riya_pics/mem_19_r.jpeg"
      },
      {
        id: 20,
        emoji: "💔",
        place: "The Brink of Ending Things",
        summary: "Our worst fight",
        story: "We were genuinely at the brink of ending things 😭. But since I am such a mature guy 😜, sambhal liya mene 😌. Promise me we’ll always talk things out whenever something like this happens again.",
        type: "story",
        emotion: "dramatic",
        image: ""
      },
      {
        id: 21,
        emoji: "☕",
        place: "The Free Coffee Meet",
        summary: "One unexpectedly good evening",
        story: "Free coffee bhai 😂 kitni acchi drink thi vo 🙂. Me being overconfident that we would each eat one full frankie 😭, bc mujhse aadhi bhi nai khayi gayi. I literally threw it away 🥀. But honestly, I felt very happy that day, especially when you messaged afterwards 🙂.",
        type: "story",
        emotion: "warm",
        image: "assets/riya_pics/mem_21_r.jpeg"
      },
      {
        id: 22,
        emoji: "🔑",
        place: "The Personal Conversation",
        summary: "You trusted me with something important",
        story: "Have I got your trust and made you comfortable enough to share anything with me? I hope so 😭. I genuinely try my best to make people feel comfortable around me whenever we talk or meet. It’s kinda an achievement for me when someone feels safe enough to share their flaws or personal things with me 🥹.",
        type: "story",
        emotion: "warm",
        image: ""
      }
    ],
    nishthi: [
      {
        id: 1,
        emoji: "📸",
        place: "Purse Baby Party",
        summary: "Purse is the new baby",
        story: "When everyone clicks cute pics at parties, we would click the most stupid pics—like here, us both taking care of your purse as if it's a baby 😔 (these kinds of pics are better than normal pics anyways!).",
        type: "story",
        emotion: "funny",
        image: "assets/nishthi_pics/mem_1.jpeg"
      },
      {
        id: 2,
        emoji: "🦊",
        place: "Meeting Kartik's another bestie",
        summary: "Met Kartik's another bsf",
        story: "When universes collided, my 2 best friends met each other! We clicked these pics when stalls ke paas Khushi, Shalin, and Aaryan were clicking pics, but we both didn't want to click pics with them.",
        type: "story",
        emotion: "funny",
        image: "assets/nishthi_pics/mem_2.jpeg"
      },
      {
        id: 3,
        emoji: "📑",
        place: "Fake presentation poses",
        summary: "Fake poses for presentation",
        story: "Fake poses on our final presentation in April 2025 because during the actual presentation, Harsh took ekdum bakwas photos of you! 😂",
        type: "story",
        emotion: "funny",
        image: "assets/nishthi_pics/mem_3.jpeg"
      },
      {
        id: 4,
        emoji: "😈",
        place: "Navratri Mischiefs 2023",
        summary: "Ditching the drama",
        story: "When Khushi ka mood ekdum off ho gaya tha in 2023 Navratri, so we both opted not to go and bahar ekdum bakchodi, timepass, and bitching ki uski, and had our fun! 😝",
        type: "story",
        emotion: "funny",
        image: "assets/nishthi_pics/mem_4.jpeg"
      },
      {
        id: 5,
        emoji: "🚌",
        place: "Statue of Unity (SOU)",
        summary: "Sukoon on getting AC bus",
        story: "During SOU we had walked 1-2 whole hours in the full sun, and then jab finally AC bus main baithe, itniii shaanti miliii (you can see the tiredness in our faces!).",
        type: "story",
        emotion: "warm",
        image: "assets/nishthi_pics/mem_5.jpeg"
      },
      {
        id: 6,
        emoji: "🎨",
        place: "Impromptu Holi celebration",
        summary: "Surprise Holi Attack",
        story: "The worst and best Holi at the same time! Qaeed did a surprise attack on us after classes, and we played with colours and water.",
        type: "story",
        emotion: "funny",
        image: "assets/nishthi_pics/mem_6.jpeg"
      },
      {
        id: 7,
        emoji: "🎤",
        place: "Riya and Nishtha ka interview",
        summary: "You completely fumbled it",
        story: "Tum dono ka influencer ne women hone k nate interview liya tha 😂 and posted it on Insta. You literally fucked up in that? Mujhe to yehi yaad he 🗿, why tf I don't have the reel now, send me dhundh k plz 😂.",
        type: "story",
        emotion: "funny",
        image: "assets/nishthi_pics/mem_7.jpeg"
      },
      {
        id: 8,
        emoji: "🏺",
        place: "Ahmedabad HAAT experience",
        summary: "Pottery fun and MMV walk",
        story: "Ek to itni late aayi or usme bhi khud hi photoshoot krvana tha 😭 and then we had tatti khana after walking 1.5 km 😭. MMV turned out very bad that day.",
        type: "story",
        emotion: "funny",
        image: "assets/nishthi_pics/mem_8.jpeg"
      },
      {
        id: 9,
        emoji: "💃",
        place: "Vadodara Navratri Betrayal",
        summary: "You went without me 🥀",
        story: "I still have this wish to go out on Navratri with you guys, in fact with my every sister 😭 especially you guys and Sakshi 😭. Pata nai kab hoga ye 🥲. Akeli khel li Navratri tum dono ne or itne acche photos se mujhe jala bhi diya 🥀.",
        type: "story",
        emotion: "funny",
        image: "assets/nishthi_pics/mem_9.jpg"
      },
      {
        id: 10,
        emoji: "🍔",
        place: "First Ahmedabad Reunion",
        summary: "Trio's first proper meet",
        story: "Yayy! 🥳 You guys visited me. Pata nai why tu kyo thi Ahmedabad me 🤔 but thik he. One of the best memories I have! That day I realised ki haan, mujhe ghumna pasand he 😭 people matter!",
        type: "story",
        emotion: "warm",
        image: "assets/nishthi_pics/mem_10.jpg"
      },
      {
        id: 11,
        emoji: "😢",
        place: "10th Farewell Party",
        summary: "You actually turned up!",
        story: "Itni minnate krne k baad tu aayi thi, huh! Fir bhi maza aaya, not like Riya jisne latka kr rkha mujhe or aayi hi nai 🫠.",
        type: "story",
        emotion: "warm",
        image: "assets/nishthi_pics/mem_11.jpg"
      },
      {
        id: 12,
        emoji: "🧪",
        place: "Science Exhibition",
        summary: "The loudest team in the room",
        story: "Dusre logo ka project humse better hoga, but I am pretty sure we \"especially me\" were the loudest in the room! Teamed up with Nishtha. Your project broke somehow when you got there in the exhibition, but you guys fixed it 🥳.",
        type: "story",
        emotion: "funny",
        image: "assets/nishthi_pics/mem_12.jpeg"
      },
      {
        id: 13,
        emoji: "🏰",
        place: "Vadodara Summer Trip",
        summary: "Sev Usal and heavy sun",
        story: "Kitni dhoop me ghumaya mujhe us din 🥀. Kher, sev usal was quite good, overall trip acchi ho gayi thi! At least got a photo with you. :)",
        type: "story",
        emotion: "warm",
        image: "assets/nishthi_pics/mem_13.jpg"
      },
      {
        id: 14,
        emoji: "🤫",
        place: "Photo with your ex-bsf",
        summary: "A picture for solidarity",
        story: "Kher, isk liye to I don't have any memory to recall—jo meri bsf ko pasand nai, mujhe bhi pasand nai! But photo was necessary. 😛",
        type: "story",
        emotion: "funny",
        image: "assets/nishthi_pics/mem_14.jpg"
      },
      {
        id: 15,
        emoji: "💇‍♀️",
        place: "Nishtha's First Haircut",
        summary: "A fresh new look",
        story: "Ye photo me to tatti lag rhi he, lekin ese phir thik lagti thi. :)",
        type: "story",
        emotion: "funny",
        image: "assets/nishthi_pics/mem_15.jpg"
      },
      {
        id: 16,
        emoji: "🔥",
        place: "The Epic Scrapbook Shot",
        summary: "Obsessed with this picture",
        story: "Idk about you, but I am really obsessed with this pic 😭 this is fucking so good!",
        type: "story",
        emotion: "warm",
        image: "assets/nishthi_pics/mem_16.jpg"
      },
      {
        id: 17,
        emoji: "📚",
        place: "Endless UPSC Debates",
        summary: "Reasoning and fruitful talks",
        story: "Would you stop convincing me to start UPSC prep? 😭 Talks are always fruitful though, meri reasoning badhti he usse.",
        type: "story",
        emotion: "funny",
        image: ""
      },
      {
        id: 18,
        emoji: "💔",
        place: "The Plan Cancellation Fight",
        summary: "Our very first argument",
        story: "We both knew who was at fault 🗿, still at the end, mujhe hi manana pada tha! 😭",
        type: "story",
        emotion: "dramatic",
        image: ""
      },
      {
        id: 19,
        emoji: "✉",
        place: "The Letter Exchange Era",
        summary: "Secret reviews and folding notes",
        story: "Best thing of our school life? Like mere liye to he. Because of this thing, I got you 😌 and you got such a mature and interesting human being as your best friend 🥱.",
        type: "story",
        emotion: "warm",
        image: ""
      },
      {
        id: 20,
        emoji: "🎁",
        place: "Rakhi Surprise Reunion",
        summary: "Corona lockdown surprise",
        story: "Our first Rakhi 🥹. Seriously, one of the best surprises of my life! Mujhe surprises mile hi bahot kam he vese, unme se ye bahot special tha. Literally, I was devastated on that day—11th tha tab, just after our 10th got finished, corona chal rha tha, I was studying at home, constantly staring at my phone screen because tune kaha tha ki we will come agar gaadi mil jayegi, and tumhe nai mili thi. But boom 💥, you guys actually turned up for me! 😭",
        type: "story",
        emotion: "warm",
        image: ""
      },
      {
        id: 21,
        emoji: "🕶",
        place: "The Lenskart Eyewear Brawl",
        summary: "Getting kicked out of the store",
        story: "Kicked out from Lenskart after trying so many chashma but not liking one... sab frustrate ho gaye the. Employee joked on it and Palak laughed with him, and boom—tune Palak k sath bhi lad liya! 😂",
        type: "story",
        emotion: "funny",
        image: "assets/nishthi_pics/mem_21.jpeg"
      },
      {
        id: 22,
        emoji: "🥻",
        place: "The Saree Selection Marathon",
        summary: "Trying dozen but wearing the first",
        story: "Tried out dozens but at the end wore this only!",
        type: "story",
        emotion: "warm",
        image: "assets/nishthi_pics/mem_22.jpeg"
      }
    ]
  }
};
