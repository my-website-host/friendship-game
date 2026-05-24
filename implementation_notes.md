# 🎮 The Friendship Run — Birthday Game
## Implementation Plan & Developer Notes

---

## Overview

A custom side-scrolling browser game built as a single `.html` file. The player (birthday girl) runs through a world full of shared memories. Hitting an obstacle pauses the game and reveals a memory card with a quiz or choice. At the end, an AI-generated wish letter is revealed.

**Tech:** Pure HTML + CSS + JavaScript (Canvas API). No frameworks, no build tools. Runs offline. Share as a file or host anywhere.

---

## Architecture

```
index.html
├── <style>        → All CSS (game UI, overlays, cards, animations)
├── <canvas>       → Game rendering (background, cat, obstacles, ground)
├── #memoryCard    → Overlay div (hidden by default, shown on collision)
├── #wishCard      → Final screen overlay (shown after all memories cleared)
└── <script>
    ├── CONFIG     → All personalisation data lives here (names, memories, colors)
    ├── SPRITE     → Base64 sprite, frame animation logic
    ├── GAME LOOP  → requestAnimationFrame, physics, collision
    ├── OBSTACLES  → Spawn logic, memory trigger on collision
    ├── MEMORY     → Card render, quiz/choice logic, resume game
    ├── WISH       → Final card + Anthropic API call
    └── INPUT      → Keyboard, touch, click handlers
```

---

## Phase 1 — Core Game Engine ✅

**What's to be built:**
- Scrolling canvas background with stars, clouds, ground
- Cat sprite animation (7 frames, vertical sprite sheet)
- Physics — gravity, jump, double jump
- Obstacle spawning with increasing speed
- Score + high score
- Game states: `idle → running → dead`
- Keyboard (Space/↑), mouse click, touch support

**Implementation notes:**
- Sprite sheet is 118×900px, 7 frames each 118×128px
- Frame order reads top-to-bottom (index 0 = top frame)
- Scale factor `0.42` gives a good in-game cat size
- Obstacle height randomised between 20–50px
- Speed starts at 4, increases by 0.5 every 400 points
- Spawn interval decreases with score (min ~60 ticks)

---

## Phase 2 — Memory System

### 2a. Data Structure

Define all memories in a `CONFIG` object at the top of the script:

```js
const CONFIG = {
  names: {
    birthday: "Priya",       // birthday girl
    friend1:  "You",         // person gifting
    friend2:  "Ananya"       // third in trio
  },
  theme: {
    primary:   "#f9c74f",    // accent color (match her fav color)
    secondary: "#ff6b9d",
    bg:        "#0d0f1e"
  },
  memories: [
    {
      id: 1,
      emoji: "🍜",
      place: "That ramen place",
      summary: "Short description shown on card header",
      story: "Longer warm text shown in the card body. This is what she reads.",
      type: "quiz",           // "quiz" | "choice"
      question: "What did I order that I immediately regretted?",
      options: ["Spicy ramen", "Plain broth", "Nothing — I stole yours", "A salad (mistake)"],
      correct: 2,             // index of correct answer (for quiz type)
      reactions: {
        right: "Haha yes you know me too well 😭",
        wrong: "Really?? You were THERE!"
      },
      emotion: "funny"        // "funny" | "warm" | "dramatic" | "bittersweet"
    },
    {
      id: 2,
      emoji: "💊",
      place: "Dental school exam week",
      summary: "The week we survived on chai and panic",
      story: "...",
      type: "choice",
      question: "It's 2am, exam in 6 hours. What do you do?",
      options: ["Study more", "Force her to sleep", "Make chai and cry together", "Watch one more episode"],
      reactions: {            // for choice type, one reaction per option index
        0: "Respect. She studied. You panicked.",
        1: "She would never listen lol",
        2: "This is literally what happened 😭",
        3: "Honestly valid"
      },
      emotion: "dramatic"
    }
    // ... more memories
  ]
}
```

### 2b. Obstacle → Memory Mapping

- Each memory gets one obstacle in the game world
- Obstacles are spawned at **fixed score intervals** (not random) so memories appear in order
- After collision, `currentMemoryIndex` increments
- When `currentMemoryIndex >= CONFIG.memories.length` → trigger wish card

```js
// Spawn a memory obstacle at specific score thresholds
const MEMORY_SCORES = [300, 700, 1200, 1800, 2500, 3300, 4200, 5200];

// In game loop update():
if (MEMORY_SCORES.includes(score) && !memorySpawned) {
  spawnMemoryObstacle();   // special obstacle (different color/shape)
  memorySpawned = true;
}
```

### 2c. Memory Obstacle Visual

Memory obstacles should look distinct from regular obstacles:

```js
// Regular obstacle → pink rectangle
// Memory obstacle → glowing star/heart shape with emoji on top
// Draw with ctx, add a pulsing glow animation (sin wave on alpha)
```

### 2d. Collision → Card Trigger

On collision with a memory obstacle:
1. Set `state = 'paused'`
2. Stop game loop rendering obstacles + cat movement
3. Show `#memoryCard` overlay with fade-in CSS animation
4. Populate card with memory data (emoji, story, question, options)

```js
function showMemoryCard(memory) {
  state = 'paused';
  const card = document.getElementById('memoryCard');
  card.querySelector('.mc-emoji').textContent = memory.emoji;
  card.querySelector('.mc-story').textContent = memory.story;
  // render quiz or choice buttons dynamically
  card.classList.add('visible');
}
```

### 2e. Quiz Logic

```
Player picks an option
  ├── Quiz type → check against memory.correct
  │     ├── Correct → green flash, play happy sound, show right reaction
  │     └── Wrong   → red flash, show wrong reaction (still proceeds)
  └── Choice type → show reaction for chosen index, no right/wrong
        
After 2s delay → "Continue" button appears → resume game
```

---

## Phase 3 — Memory Card UI

### Card Layout

```
┌─────────────────────────────────────┐
│  🍜  Memory #3                  ×   │  ← header (emoji + index + close)
├─────────────────────────────────────┤
│                                     │
│  "That time we waited 45 mins for   │  ← story text
│   a table and it was totally worth  │
│   it (it wasn't)"                   │
│                                     │
├─────────────────────────────────────┤
│  What did I order?                  │  ← question
│                                     │
│  [ Spicy ramen ]  [ Plain broth ]   │  ← option buttons
│  [ Stole yours ]  [ A salad 💀 ]    │
│                                     │
│         "Haha yes you know me"      │  ← reaction (appears after pick)
│                                     │
│              [ Keep running → ]     │  ← continue button
└─────────────────────────────────────┘
```

### CSS Notes

- Card is a fixed overlay, centered, max-width 420px
- Backdrop: `rgba(0,0,0,0.75)` blur behind card
- Entry animation: `transform: scale(0.8) → 1` + `opacity: 0 → 1` over 300ms
- Emotion theming: card border color changes per `emotion` type
  - `funny` → yellow `#f9c74f`
  - `warm` → pink `#ff6b9d`
  - `dramatic` → red `#ff4757`
  - `bittersweet` → teal `#43e8d8`
- Option buttons: grid 2×2, highlight on hover, flash green/red on answer
- Photo slot (optional): if `memory.photo` is provided (base64), show small image in card

---

## Phase 4 — Emotion & Polish

### Music

- Use `<audio>` tags with `loop` attribute
- 2–3 tracks that cross-fade based on game section:
  - **Normal run** → lo-fi / chill beat
  - **Memory card open** → soft piano or ambient
  - **Final wish card** → emotional / warm track
- Source: royalty-free from [pixabay.com/music](https://pixabay.com/music) or [freemusicarchive.org](https://freemusicarchive.org)
- Embed as base64 OR link directly (requires internet)

### Particle Effects

On memory card close (correct answer / choice made):
- Burst of emoji particles (🎉 ✨ 💕) from card center
- Simple JS: spawn 12 divs, animate outward with random angle, fade out, remove

```js
function burstEmoji(emoji, x, y) {
  for (let i = 0; i < 12; i++) {
    const el = document.createElement('div');
    el.textContent = emoji;
    el.style.cssText = `position:fixed;left:${x}px;top:${y}px;font-size:20px;
      pointer-events:none;transition:all 0.8s ease-out;`;
    document.body.appendChild(el);
    const angle = (i / 12) * Math.PI * 2;
    const dist = 60 + Math.random() * 40;
    setTimeout(() => {
      el.style.transform = `translate(${Math.cos(angle)*dist}px,${Math.sin(angle)*dist}px)`;
      el.style.opacity = '0';
    }, 10);
    setTimeout(() => el.remove(), 900);
  }
}
```

### Background Zones

Subtle background color shifts as memories progress — each memory zone has a slightly different sky tint:

```js
const ZONE_COLORS = ['#0d0f1e','#0f1020','#0e1020','#101224','#0d1020'];
// Lerp between zone colors as score increases
```

---

## Phase 5 — Wish Card + AI Letter

### Trigger

After the last memory card closes → fade game out → show full-screen wish card.

### Wish Card Layout

```
┌─────────────────────────────────────┐
│                                     │
│   🎂  Happy Birthday, Priya!        │
│                                     │
│   [loading spinner while AI writes] │
│                                     │
│   "Dear Priya,                      │
│    You have been the kind of friend │
│    who..."                          │
│                                     │
│   — with love, [Name1] & [Name2] 🤍 │
│                                     │
│        [ 🎉 Make it rain! ]         │  ← triggers confetti
└─────────────────────────────────────┘
```

### Anthropic API Call

```js
async function generateWishLetter() {
  const prompt = `Write a warm, funny, deeply personal birthday letter for ${CONFIG.names.birthday}.
She is a dental student who loves watching shows, exploring food places, and is part of a close trio of friends with ${CONFIG.names.friend1} and ${CONFIG.names.friend2}.
Memories shared together include: ${CONFIG.memories.map(m => m.summary).join('; ')}.
The letter is from ${CONFIG.names.friend1} and ${CONFIG.names.friend2}.
Keep it under 150 words. Warm, personal, a little funny, emotional at the end. No generic phrases.`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  const data = await res.json();
  return data.content[0].text;
}
```

### Letter Reveal

- Typewriter effect: reveal letter character by character at ~30ms/char
- Soft glow around the card
- After letter finishes → show "Make it rain 🎉" button → full-screen confetti

---

## Phase 6 — Character Select Screen

### Flow

```
Game loads
  → Character select screen (3 options, one per trio member)
  → Player picks her character
  → Brief "GET READY..." countdown (3..2..1)
  → Game starts
```

### Character Options

```js
const CHARACTERS = [
  { name: CONFIG.names.birthday, emoji: "🐱", label: "The Birthday Girl" },
  { name: CONFIG.names.friend1,  emoji: "🦊", label: "Her Chaotic Friend" },
  { name: CONFIG.names.friend2,  emoji: "🐰", label: "The Sensible One" }
]
// She'll obviously pick herself — but the choice is cute
```

---

## Build Order (Recommended)

| Step | What to build | Complexity |
|------|---------------|------------|
| 1 | CONFIG object + plug in real data | Low |
| 2 | Memory obstacle spawning (fixed intervals) | Low |
| 3 | Memory card HTML + CSS overlay | Medium |
| 4 | Quiz / choice logic + reactions | Medium |
| 5 | Wish card + AI letter API call | Medium |
| 6 | Particle bursts + emotion theming | Low |
| 7 | Music cross-fade | Medium |
| 8 | Character select screen | Low |
| 9 | Sprite base64 swap + final polish | Low |

---

## What You Need to Provide

| # | Info needed | Used for |
|---|-------------|----------|
| 1 | Her name + your names | CONFIG, AI letter, character select |
| 2 | 6–8 memories with quiz/choice | Memory cards |
| 3 | Her fav color | Theme colors |
| 4 | Music vibe | Background tracks |
| 5 | Photos (optional, base64) | Memory card images |
| 6 | Inside jokes / Easter eggs | Scattered as collectibles or card details |

---

## Delivery

- Single `birthday.html` file — she just opens it in any browser
- Works offline (except AI letter which needs internet for the API call)
- Mobile-friendly (tap to jump)
- Recommended: send via WhatsApp/email with a message like *"open this on your laptop 🎁"*