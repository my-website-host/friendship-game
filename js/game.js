/**
 * 🎮 The Friendship Run — RETRO PIXEL CANVAS ENGINE
 * 
 * Manages full-viewport responsive scaling using a fixed virtual aspect ratio,
 * loads, caches, and scrolls custom background photos infinitely with parallax effect,
 * triggers soft cross-fade transitions between day and night scenes repeatedly during play,
 * dynamically handles glowing chest/heart collectibles, pauses on memory collisions,
 * spawns the checkered Finish Line gate at the end, and handles smooth fade success loops.
 */

class GameEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.gameState = 'menu'; // 'menu' | 'countdown' | 'playing' | 'paused' | 'finishing' | 'gameover'

    // Active Character Chosen
    this.selectedChar = null;

    // Virtual resolution for unified physics calculations across screen sizes
    this.virtualWidth = 960;
    this.virtualHeight = 540;

    // Viewport scaling multipliers
    this.scaleX = 1;
    this.scaleY = 1;

    // Physics constants (mapped to 540px vertical coordinate space)
    this.gravity = 0.82;
    this.jumpForce = -14.2;
    this.doubleJumpForce = -12.2;

    // Player object state
    this.player = {
      x: 120,
      y: 356, // ground level (420) minus height (64)
      width: 64,
      height: 64,
      vy: 0,
      isGrounded: false,
      jumpsRemaining: 2,
      runFrame: 0,
      runTimer: 0
    };

    // Obstacles list & speed controllers
    this.obstacles = [];
    this.obstacleSpawnTimer = 0;
    this.obstacleSpeed = 6.8;

    // Parallax background scroll offsets
    this.groundScroll = 0;
    this.bgScrollOffset = 0;

    // Background scenes list (2 day images, 1 night type image)
    this.bgList = ["assets/nature_1.png", "assets/nature_2.png", "assets/nature_3.png"];
    this.bgImages = {};      // Caches Image objects

    // Scrolling cross-fade state managers
    this.activeBgPath = null;  // Base background currently drawn
    this.nextBgPath = null;    // Background fading in
    this.isFading = false;     // Fading status active flag
    this.bgFadeProgress = 0;   // Lerps from 0.0 to 1.0

    // Distance / Score tracking
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('friendship_highscore') || '0', 10);

    // Gamification elements
    this.lives = 3;
    this.maxLives = 3;
    this.ammo = 3;
    this.maxAmmo = 4;
    this.projectiles = [];
    this.invulnerableTimer = 0;
    this.magnetCharges = 0;
    this.collectedMemoriesCount = 0; // successfully collected count

    // Countdown details
    this.countdownVal = 3;
    this.countdownTimer = 0;

    // Dynamic Memory Spawning Coordinates
    this.currentMemoryIndex = 0;
    this.nextMemorySpawnScore = 300; // Next dynamic memory spawn score threshold
    this.finishLineScore = 0;   // Calculated finish spawn threshold
    this.finishLineX = -999;    // Checkered gate X coordinate
    this.finishLineWidth = 48;
    this.finishCrossed = false;
    this.fadeAlpha = 0;         // Fade overlay opacity for victory screen transition

    // Event listeners
    this.boundInteraction = this.handlePlayerAction.bind(this);
    this.boundResize = this.handleResize.bind(this);
  }

  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // Stretch canvas full viewport
    this.handleResize();

    // Select default character (Riya 👩‍⚕️)
    this.selectedChar = CONFIG.characters[0];

    // Pre-load background scenes for seamless loop transitions
    this.preloadBackgrounds();
    this.preloadMemoryImages();

    // Pick an initial random background scene
    this.activeBgPath = this.bgList[Math.floor(Math.random() * this.bgList.length)];

    // Bind controls
    window.addEventListener('keydown', this.boundInteraction);
    window.addEventListener('resize', this.boundResize);

    // Canvas interaction binds
    this.canvas.addEventListener('mousedown', this.boundInteraction);
    this.canvas.addEventListener('touchstart', this.boundInteraction, { passive: true });

    // Wire up visual throw button to avoid jumping on click/tap
    const throwBtn = document.getElementById('btn-arcade-throw');
    if (throwBtn) {
      const triggerThrow = (e) => {
        e.stopPropagation();
        e.preventDefault();
        this.throwProjectile();
      };
      throwBtn.addEventListener('click', triggerThrow);
      throwBtn.addEventListener('touchstart', triggerThrow, { passive: false });
    }

    // Start Engine Loop
    this.loop();
  }

  // Pre-load all 3 background files into Image objects
  preloadBackgrounds() {
    this.bgList.forEach(path => {
      const img = new Image();
      img.src = path;
      this.bgImages[path] = img;
      console.log(`🖼️ Cached background scene: ${path}`);
    });
  }

  // Pre-load all defined memory pictures to prevent layout pop/load lag on display
  preloadMemoryImages() {
    if (!CONFIG || !CONFIG.memories) return;
    if (CONFIG.memories.riya) {
      CONFIG.memories.riya.forEach(mem => {
        if (mem.image) {
          const img = new Image();
          img.src = mem.image;
        }
      });
    }
    if (CONFIG.memories.nishthi) {
      CONFIG.memories.nishthi.forEach(mem => {
        if (mem.image) {
          const img = new Image();
          img.src = mem.image;
        }
      });
    }
  }

  // Dynamic helper to return memories array based on currently selected runner
  getMemories() {
    const charId = this.selectedChar ? this.selectedChar.id : 'riya';
    if (charId === 'nishthi') {
      return CONFIG.memories.nishthi;
    }
    if (charId === 'me') {
      return []; // Utsav has no memories along the run (infinite run)
    }
    return CONFIG.memories.riya;
  }

  // Standard Fisher-Yates shuffle algorithm to randomize array elements
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Make canvas stretch full screen and compute scale factors
  handleResize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.scaleX = this.canvas.width / this.virtualWidth;
    this.scaleY = this.canvas.height / this.virtualHeight;

  }

  selectCharacter(charId) {
    const character = CONFIG.characters.find(c => c.id === charId);
    if (character) {
      this.selectedChar = character;
      console.log(`👤 Runner loaded: ${character.name}`);
    }
  }

  quitToMenu() {
    this.gameState = 'menu';

    // Reset/Hide overlays
    const landingScreen = document.getElementById('landing-screen');
    if (landingScreen) landingScreen.classList.remove('hidden');

    const charModalOverlay = document.getElementById('char-modal-overlay');
    if (charModalOverlay) charModalOverlay.classList.remove('visible');

    const briefingOverlay = document.getElementById('mission-briefing-overlay');
    if (briefingOverlay) briefingOverlay.classList.remove('visible');

    const memoryOverlay = document.getElementById('memory-overlay');
    if (memoryOverlay) memoryOverlay.classList.remove('visible');

    const gameOverScreen = document.getElementById('gameover-screen');
    if (gameOverScreen) gameOverScreen.classList.remove('visible');

    const finaleOverlay = document.getElementById('birthday-finale-overlay');
    if (finaleOverlay) finaleOverlay.classList.remove('visible');

    const hudTips = document.getElementById('hud-tips');
    if (hudTips) hudTips.style.display = 'none';

    const throwBtn = document.getElementById('btn-arcade-throw');
    if (throwBtn) throwBtn.style.display = 'none';

    const quitBtn = document.getElementById('btn-quit');
    if (quitBtn) quitBtn.style.display = 'none';

    this.obstacles = [];
    this.projectiles = [];
    console.log("↩️ Quitted back to Main Menu");
  }

  startCountdown() {
    this.gameState = 'countdown';
    this.countdownVal = 3;
    this.countdownTimer = Date.now();
    AUDIO.init(); // Initialize retro synth Web Audio context

    // Hide throw button during countdown
    const throwBtn = document.getElementById('btn-arcade-throw');
    if (throwBtn) throwBtn.style.display = 'none';

    // Show QUIT button when starting a run!
    const quitBtn = document.getElementById('btn-quit');
    if (quitBtn) quitBtn.style.display = 'flex';

    // Pick a new random background scene to start this specific run
    this.activeBgPath = this.bgList[Math.floor(Math.random() * this.bgList.length)];
    this.nextBgPath = null;
    this.isFading = false;
    this.bgFadeProgress = 0;
    this.bgScrollOffset = 0;

    // Dynamic scheduling variables for memory spawning
    this.currentMemoryIndex = 0;
    this.nextMemorySpawnScore = 300; // First memory obstacle spawns at score 300
    this.finishLineScore = Infinity; // Dynamic trigger set after last memory collection
    this.finishLineX = -999;
    this.finishCrossed = false;
    this.fadeAlpha = 0;

    console.log(`🎬 Run started with scene: ${this.activeBgPath}`);
  }

  startGame() {
    this.gameState = 'playing';
    this.score = 0;
    this.obstacleSpeed = 6.8;
    this.obstacles = [];

    // Shuffle Nishtha's memories dynamically per run to make it a fresh surprise!
    if (CONFIG.memories && CONFIG.memories.nishthi) {
      this.shuffleArray(CONFIG.memories.nishthi);
    }

    this.player.x = 120;
    this.player.y = 356;
    this.player.vy = 0;
    this.player.isGrounded = true;
    this.player.jumpsRemaining = 2;

    // Reset gamification states
    this.lives = 3;
    this.ammo = 3;
    this.projectiles = [];
    this.invulnerableTimer = 0;
    this.magnetCharges = 0;
    this.collectedMemoriesCount = 0;

    // Show visual throw button when actual run gameplay starts
    const throwBtn = document.getElementById('btn-arcade-throw');
    if (throwBtn) throwBtn.style.display = 'flex';
  }

  triggerGameOver() {
    this.gameState = 'gameover';
    AUDIO.playGameOver();

    // Hide throw button during game over
    const throwBtn = document.getElementById('btn-arcade-throw');
    if (throwBtn) throwBtn.style.display = 'none';

    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('friendship_highscore', this.highScore);
    }

    // Dispatch HUD update event
    document.dispatchEvent(new CustomEvent('gameover', { detail: { score: this.score, high: this.highScore } }));
  }

  // Soft cross-fade transition: triggers a shift to another random scene
  triggerBgTransition() {
    if (this.isFading) return;

    // Filter available scenes to select one different from current active scene
    const available = this.bgList.filter(path => path !== this.activeBgPath);
    const nextPath = available[Math.floor(Math.random() * available.length)];

    this.nextBgPath = nextPath;
    this.isFading = true;
    this.bgFadeProgress = 0;
  }



  // Key / Click actions mapping
  handlePlayerAction(e) {
    if (this.gameState === 'menu' || this.gameState === 'paused' || this.gameState === 'finishing') return;

    if (this.gameState === 'gameover') {
      if (e.type === 'keydown' && (e.code === 'Space' || e.code === 'Enter' || e.key === 'Shift')) {
        e.preventDefault();
        this.gameState = 'menu';
        document.dispatchEvent(new CustomEvent('showmenu'));
      }
      return;
    }

    if (this.gameState === 'playing') {
      if (e.type === 'keydown') {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
          e.preventDefault();
          this.jump();
        } else if (e.key === 'Shift' || e.code === 'KeyF' || e.code === 'KeyX' || e.code === 'Enter') {
          e.preventDefault();
          this.throwProjectile();
        }
      } else {
        // Canvas click/touch triggers jump (we stop throw button clicks propagating to this)
        this.jump();
      }
    }
  }

  jump() {
    if (this.player.jumpsRemaining > 0) {
      if (this.player.jumpsRemaining === 2) {
        this.player.vy = this.jumpForce;
        AUDIO.playJump();
      } else {
        this.player.vy = this.doubleJumpForce;
        AUDIO.playDoubleJump();
      }
      this.player.isGrounded = false;
      this.player.jumpsRemaining--;
    }
  }

  throwProjectile() {
    if (this.gameState !== 'playing') return;
    if (this.ammo > 0) {
      this.ammo--;
      // Spawn star moving rapidly to the right with custom size
      this.projectiles.push({
        x: this.player.x + this.player.width - 15,
        y: this.player.y + this.player.height / 2 - 12,
        width: 24,
        height: 24,
        speed: 10,
        angle: 0,
        emoji: "✴️" // Rotating ninja star emoji
      });
      AUDIO.playDoubleJump(); // Chirpy sound effect for throwing!
      console.log(`✴️ Throwing Ninja Star. Remaining Ammo: ${this.ammo}`);
    }
  }

  updatePhysics() {
    // 1. Apply gravity bounds
    this.player.vy += this.gravity;
    this.player.y += this.player.vy;

    const groundLevelY = 356; // 420 (ground) - 64 (height)
    if (this.player.y >= groundLevelY) {
      this.player.y = groundLevelY;
      this.player.vy = 0;
      this.player.isGrounded = true;
      this.player.jumpsRemaining = 2;
    }

    // 2. Animate sprite index timers
    if (this.player.isGrounded) {
      this.player.runTimer++;
      if (this.player.runTimer > 4) {
        this.player.runFrame = (this.player.runFrame + 1) % SPRITES.spriteConfig.totalFrames;
        this.player.runTimer = 0;
      }
    } else {
      this.player.runFrame = 3;
    }

    // 3. Decrement damage invulnerability flashing countdown
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer--;
    }

    // 4. Increment distance score
    this.score++;
    if (this.score % 400 === 0) {
      this.obstacleSpeed += 0.6; // Speed up progressively
    }
  }

  updateObstacles() {
    // Prevent standard spawning if a memory is on screen or the finish line is coming
    const isMemoryOnScreen = this.obstacles.some(o => o.isMemory);
    const isFinishSpawned = this.finishLineX !== -999;

    // 0. Update custom projectiles (Ninja Stars)
    for (let p = this.projectiles.length - 1; p >= 0; p--) {
      const proj = this.projectiles[p];
      proj.x += proj.speed;
      proj.angle += 0.25; // spin star

      // Check collision between ninja star and standard hazard blocks
      let projDestroyed = false;
      for (let i = this.obstacles.length - 1; i >= 0; i--) {
        const obs = this.obstacles[i];
        if (obs.isMemory || obs.isCollectible) continue;

        // Projectile bounding box overlap
        if (
          proj.x < obs.x + obs.width &&
          proj.x + proj.width > obs.x &&
          proj.y < obs.y + obs.height &&
          proj.y + proj.height > obs.y
        ) {
          // Burst retro emoji explosion!
          const canvasRect = this.canvas.getBoundingClientRect();
          const screenX = canvasRect.left + (obs.x + obs.width / 2) * this.scaleX;
          const screenY = canvasRect.top + (obs.y + obs.height / 2) * this.scaleY;

          MEMORIES.burstEmojiParticles('💥', screenX, screenY);
          AUDIO.playExplosion();

          this.obstacles.splice(i, 1);
          projDestroyed = true;
          break;
        }
      }

      if (projDestroyed || proj.x > this.virtualWidth + 50) {
        this.projectiles.splice(p, 1);
      }
    }

    // 1. Spawning glowing Memory Collectibles dynamically
    if (
      this.score > 0 &&
      this.currentMemoryIndex < this.getMemories().length &&
      this.score >= this.nextMemorySpawnScore &&
      !isMemoryOnScreen &&
      this.finishLineX === -999
    ) {
      const isSkyBalloon = this.currentMemoryIndex % 2 === 1;
      this.obstacles.push({
        x: this.virtualWidth + 60,
        y: isSkyBalloon ? 190 : 326, // Sky height (requires double-jump) vs Ground float
        width: 48,
        height: 48,
        isMemory: true,
        memoryIndex: this.currentMemoryIndex,
        isBalloon: isSkyBalloon,
        // Alternates: odd index is sky balloon (🎈), even index alternates chest (🎁) and heart (💝)
        emoji: isSkyBalloon ? "🎈" : (this.currentMemoryIndex % 4 === 0 ? "🎁" : "💝")
      });
      this.nextMemorySpawnScore = Infinity; // Block further spawns until this one is resolved
      this.obstacleSpawnTimer = 0;
      console.log(`🎁 Spawned Memory Block #${this.currentMemoryIndex + 1} (${isSkyBalloon ? 'Balloon' : 'Ground'}) at score ${this.score}`);
    }

    // 2. Spawning regular hazards AND floating collectibles
    if (!isMemoryOnScreen && !isFinishSpawned && this.gameState === 'playing') {
      this.obstacleSpawnTimer++;
      const spawnRate = Math.max(80, 160 - Math.floor(this.score * 0.006));

      if (this.obstacleSpawnTimer > spawnRate) {
        this.obstacleSpawnTimer = 0;

        // 16% chance to spawn a gaming power-up collectible instead of a dangerous obstacle block!
        if (Math.random() < 0.16) {
          const typeRoll = Math.random();
          let type = 'ammo';
          let emoji = '✴️';

          if (typeRoll < 0.35) {
            type = 'life';
            emoji = '❤️';
          } else if (typeRoll < 0.70) {
            type = 'ammo';
            emoji = '✴️';
          } else {
            type = 'magnet';
            emoji = '🧲';
          }

          const isFloating = Math.random() > 0.5;
          const cy = isFloating ? 240 : 388; // Floating vs ground

          this.obstacles.push({
            x: this.virtualWidth + 60,
            y: cy,
            width: 32,
            height: 32,
            isCollectible: true,
            type: type,
            emoji: emoji,
            isFloating: isFloating
          });
          console.log(`⚡ Spawned collectible power-up: ${type} (${emoji})`);
        } else {
          // Standard hazard block
          const obstacleHeight = 35 + Math.random() * 40;
          this.obstacles.push({
            x: this.virtualWidth + 60,
            y: 420 - obstacleHeight,
            width: 32 + Math.random() * 16,
            height: obstacleHeight,
            isMemory: false,
            color: Math.random() > 0.5 ? CONFIG.theme.primary : CONFIG.theme.accent
          });
        }
      }
    }

    // 3. Move obstacles, apply magnet pull logic, and check collisions
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];

      // Apply Magnet active pull on memory blocks
      if (obs.isMemory && this.magnetCharges > 0 && obs.x < this.virtualWidth) {
        const dx = (this.player.x + this.player.width / 2) - (obs.x + obs.width / 2);
        const dy = (this.player.y + this.player.height / 2) - (obs.y + obs.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 12) {
          const pullSpeed = 8.5;
          obs.x += (dx / distance) * pullSpeed;
          obs.y += (dy / distance) * pullSpeed;

          // Offset regular scroll subtraction to pull cleanly
          obs.x += this.obstacleSpeed;
        }
      }

      obs.x -= this.obstacleSpeed;

      // Collision box checks
      if (this.checkCollision(this.player, obs)) {
        if (obs.isMemory) {
          // Pause game physics and open the styled quiz overlay
          this.obstacles.splice(i, 1);
          MEMORIES.open(obs.memoryIndex);
        } else if (obs.isCollectible) {
          // Collect items & increase states
          if (obs.type === 'life') {
            this.lives = Math.min(this.maxLives, this.lives + 1);
          } else if (obs.type === 'ammo') {
            this.ammo = Math.min(this.maxAmmo, this.ammo + 1);
          } else if (obs.type === 'magnet') {
            this.magnetCharges = 2; // attracts the next 2 treasures!
          }

          // Burst gold sparkles & play retro pickup chirps
          const canvasRect = this.canvas.getBoundingClientRect();
          const screenX = canvasRect.left + (obs.x + obs.width / 2) * this.scaleX;
          const screenY = canvasRect.top + (obs.y + obs.height / 2) * this.scaleY;

          MEMORIES.burstEmojiParticles('✨', screenX, screenY);
          AUDIO.playPickup();

          this.obstacles.splice(i, 1);
          console.log(`🎁 Collected ${obs.type}! Lives: ${this.lives}, Ammo: ${this.ammo}, Magnet: ${this.magnetCharges}`);
        } else {
          // Danger hazard collision
          if (this.invulnerableTimer > 0) {
            // Player is flashing/invulnerable: ignore damage
          } else {
            this.lives--;
            AUDIO.playHurt();

            // Burst angry fire sparks
            const canvasRect = this.canvas.getBoundingClientRect();
            const screenX = canvasRect.left + (this.player.x + this.player.width / 2) * this.scaleX;
            const screenY = canvasRect.top + (this.player.y + this.player.height / 2) * this.scaleY;
            MEMORIES.burstEmojiParticles('💥', screenX, screenY);

            if (this.lives <= 0) {
              this.triggerGameOver();
            } else {
              this.invulnerableTimer = 90; // 1.5 seconds flash immunity
              this.obstacles.splice(i, 1); // remove collided block
              console.log(`💥 Hit hazard obstacle. Lives remaining: ${this.lives}`);
            }
          }
        }
        break;
      }

      if (obs.x + obs.width < -100) {
        if (obs.isMemory) {
          // Missed memory block: just move forward to the next memory!
          console.log(`⚠️ Missed memory block #${obs.memoryIndex + 1}! Advancing to next memory.`);
          this.currentMemoryIndex++;

          // Schedule the next memory or finish line dynamic spawn score!
          if (this.currentMemoryIndex < this.getMemories().length) {
            this.nextMemorySpawnScore = this.score + 300;
            console.log(`🎯 Scheduled next memory #${this.currentMemoryIndex + 1} to spawn at score ${this.nextMemorySpawnScore}`);
          } else {
            this.finishLineScore = this.score + 300;
            console.log(`🏆 All memories processed! Scheduled checkered finish gate at score ${this.finishLineScore}`);
          }
        }
        this.obstacles.splice(i, 1);
      }
    }
  }

  checkCollision(rect1, rect2) {
    const marginX = rect2.isMemory ? 4 : 12; // Wider collision box for items to make collecting easy!
    const marginY = rect2.isMemory ? 4 : 6;
    return (
      rect1.x + marginX < rect2.x + rect2.width &&
      rect1.x + rect1.width - marginX > rect2.x &&
      rect1.y + marginY < rect2.y + rect2.height &&
      rect1.y + rect1.height - marginY > rect2.y
    );
  }

  updateParallax() {
    if (this.gameState === 'playing' || this.gameState === 'finishing') {
      // Parallax scroll rates
      this.bgScrollOffset += this.obstacleSpeed * 0.3;
      if (this.bgScrollOffset >= this.virtualWidth) {
        this.bgScrollOffset = 0;
      }
      this.groundScroll += this.obstacleSpeed;

      // Handle active cross-fades
      if (this.isFading) {
        this.bgFadeProgress += 0.015;
        if (this.bgFadeProgress >= 1) {
          this.activeBgPath = this.nextBgPath;
          this.nextBgPath = null;
          this.isFading = false;
          this.bgFadeProgress = 0;
        }
      }

      // Background theme shifts every 750 points during regular gameplay
      if (this.gameState === 'playing' && this.score > 0 && this.score % 750 === 0 && !this.isFading) {
        this.triggerBgTransition();
      }
    }


    // 2. Finish Line Spawning Logic
    // If all memories cleared, spawn Checkered Banner 600 points later!
    const allCleared = this.currentMemoryIndex >= this.getMemories().length;
    if (allCleared && this.score >= this.finishLineScore && this.finishLineX === -999) {
      this.finishLineX = this.virtualWidth + 100;
      console.log("🏆 The Finish Line banner has spawned on the horizon!");
    }

    // 3. Move Finish Line banner
    if (this.finishLineX !== -999 && (this.gameState === 'playing' || this.gameState === 'finishing')) {
      this.finishLineX -= this.obstacleSpeed;

      // Check crossing success
      if (!this.finishCrossed && this.player.x >= this.finishLineX) {
        this.triggerFinishSuccess();
      }
    }

    // 4. Handle finish line automatic walk-off & fade success transition
    if (this.gameState === 'finishing') {
      // Player runs off right side of screen automatically
      this.player.x += this.obstacleSpeed * 0.85;

      // Animate running feet
      this.player.runTimer++;
      if (this.player.runTimer > 4) {
        this.player.runFrame = (this.player.runFrame + 1) % SPRITES.spriteConfig.totalFrames;
        this.player.runTimer = 0;
      }

      // Fade canvas to cream white
      this.fadeAlpha += 0.012; // ~1.5 seconds fade to cream
      if (this.fadeAlpha >= 1) {
        this.gameState = 'menu'; // reset state safely
        this.fadeAlpha = 1;

        // Compare successful collections at the finish line
        const allCollected = this.collectedMemoriesCount === this.getMemories().length;
        if (allCollected) {
          console.log("🏁 Screen fully faded. Revealing final Wish Card / AI letter!");
          document.dispatchEvent(new CustomEvent('showwish'));
        } else {
          const runnerName = this.selectedChar ? this.selectedChar.name : 'Riya';
          console.log(`🏁 Screen fully faded. ${runnerName} missed memories! Collected ${this.collectedMemoriesCount}/${this.getMemories().length}. Revealing Locked Vault overlay.`);
          document.dispatchEvent(new CustomEvent('showlocked', {
            detail: {
              collected: this.collectedMemoriesCount,
              total: this.getMemories().length
            }
          }));
        }
      }
    }
  }

  triggerFinishSuccess() {
    this.finishCrossed = true;
    this.gameState = 'finishing';
    AUDIO.playCorrect(); // Synthesizes victory sound arpeggio!

    // Hide throw button during finishing walkoff
    const throwBtn = document.getElementById('btn-arcade-throw');
    if (throwBtn) throwBtn.style.display = 'none';

    console.log("🎉 Player crossed the Finish Line! Transitioning to birthday letter...");
  }



  draw() {
    this.ctx.save();
    // ⚡ Auto-scale virtual coordinates to current window size!
    this.ctx.scale(this.scaleX, this.scaleY);

    // Disable image smoothing for perfect pixelated image scaling!
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.mozImageSmoothingEnabled = false;
    this.ctx.webkitImageSmoothingEnabled = false;
    this.ctx.msImageSmoothingEnabled = false;

    // 1. Draw Active Base Background Scene
    const activeBg = this.bgImages[this.activeBgPath];

    if (activeBg && activeBg.complete && activeBg.naturalWidth > 0) {
      // Draw first copy
      this.ctx.drawImage(activeBg, -this.bgScrollOffset, 0, this.virtualWidth, this.virtualHeight);
      // Draw second copy for loop
      this.ctx.drawImage(activeBg, this.virtualWidth - this.bgScrollOffset, 0, this.virtualWidth, this.virtualHeight);
    } else {
      // 🌤️ Fallback: Draw vintage purple sky
      this.ctx.fillStyle = "#4c3e60";
      this.ctx.fillRect(0, 0, this.virtualWidth, this.virtualHeight);
    }

    // 2. Draw Fading Overlay Background Scene during cross-fades
    if (this.isFading) {
      const nextBg = this.bgImages[this.nextBgPath];
      if (nextBg && nextBg.complete && nextBg.naturalWidth > 0) {
        this.ctx.save();
        this.ctx.globalAlpha = this.bgFadeProgress; // Set opacity strictly for next scene

        // Draw next scene scroll loop
        this.ctx.drawImage(nextBg, -this.bgScrollOffset, 0, this.virtualWidth, this.virtualHeight);
        this.ctx.drawImage(nextBg, this.virtualWidth - this.bgScrollOffset, 0, this.virtualWidth, this.virtualHeight);

        this.ctx.restore(); // Restores globalAlpha to 1.0!
      }
    }



    // 4. Draw Checkered Finish Line Banner Gate
    if (this.finishLineX !== -999) {
      const fx = this.finishLineX;

      // Draw left post (grey structural block)
      this.ctx.fillStyle = "#888888";
      this.ctx.fillRect(fx, 150, 8, 270);
      this.ctx.fillStyle = "#222222";
      this.ctx.fillRect(fx - 2, 150, 2, 270);

      // Draw right post
      this.ctx.fillStyle = "#888888";
      this.ctx.fillRect(fx + 40, 150, 8, 270);
      this.ctx.fillStyle = "#222222";
      this.ctx.fillRect(fx + 48, 150, 2, 270);

      // Checkered Banner Board across columns (from y=150 to y=190)
      const bh = 40;
      this.ctx.fillStyle = "#ffffff";
      this.ctx.fillRect(fx - 10, 150, 68, bh);

      this.ctx.strokeStyle = "#222222";
      this.ctx.lineWidth = 3;
      this.ctx.strokeRect(fx - 10, 150, 68, bh);

      // Draw checkers inside board
      const bCols = 6;
      const bRows = 4;
      const cw = 68 / bCols;
      const ch = bh / bRows;
      this.ctx.fillStyle = "#222222";
      for (let r = 0; r < bRows; r++) {
        for (let c = 0; c < bCols; c++) {
          if ((r + c) % 2 === 0) {
            this.ctx.fillRect(fx - 10 + c * cw, 150 + r * ch, cw, ch);
          }
        }
      }

      // "FINISH" Label text floating on top in VT323
      this.ctx.fillStyle = "#222222";
      this.ctx.font = "20px VT323, monospace";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText("FINISH", fx + 24, 134);
    }

    // 5. Solid Ground base + double pixel grid borders (drawn over bg images)
    this.ctx.fillStyle = CONFIG.theme.ground; // deep retro violet
    this.ctx.fillRect(0, 420, this.virtualWidth, 120);

    // Thick double retro borders for ground
    this.ctx.fillStyle = CONFIG.theme.primary; // Pink outline
    this.ctx.fillRect(0, 420, this.virtualWidth, 6);
    this.ctx.fillStyle = CONFIG.theme.secondary; // Gold top outline
    this.ctx.fillRect(0, 426, this.virtualWidth, 4);

    // Textured pixel ground dashes scrolling horizontal
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    const groundSegmentSize = 40;
    const groundScrollOffset = this.groundScroll % (groundSegmentSize * 2);
    for (let x = -groundScrollOffset; x < this.virtualWidth + groundSegmentSize; x += groundSegmentSize * 2) {
      this.ctx.fillRect(x, 445, groundSegmentSize, 8);
      this.ctx.fillRect(x + groundSegmentSize, 475, groundSegmentSize, 8);
    }

    // 6. Draw Obstacles (vintage warning signs OR glowing items)
    this.obstacles.forEach(obs => {
      if (obs.isMemory) {
        // Pulse float using a soft sine/cosine wave
        const bob = obs.isBalloon
          ? Math.cos(Date.now() * 0.005) * 12 // Slow sway for balloons
          : Math.sin(Date.now() * 0.0075) * 8; // Soft ground bob

        if (obs.isBalloon) {
          // Draw balloon string dangling below
          this.ctx.beginPath();
          this.ctx.moveTo(obs.x + obs.width / 2, obs.y + bob + obs.height);
          this.ctx.quadraticCurveTo(
            obs.x + obs.width / 2 - 5, obs.y + bob + obs.height + 10,
            obs.x + obs.width / 2, obs.y + bob + obs.height + 20
          );
          this.ctx.strokeStyle = "#222222";
          this.ctx.lineWidth = 2;
          this.ctx.stroke();

          // Sky balloon box gets a beautiful light cyan neon glow
          this.ctx.fillStyle = "#e0f7fa";
        } else {
          // Ground chest gets beautiful gold
          this.ctx.fillStyle = CONFIG.theme.secondary;
        }

        // Draw double-bordered box
        this.ctx.fillRect(obs.x, obs.y + bob, obs.width, obs.height);

        this.ctx.strokeStyle = "#222222";
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(obs.x, obs.y + bob, obs.width, obs.height);

        // White retro highlight lines inside block edges
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        this.ctx.fillRect(obs.x + 3, obs.y + bob + 3, obs.width - 6, 4);
        this.ctx.fillRect(obs.x + 3, obs.y + bob + 3, 4, obs.height - 6);

        // Render the pulsing emoji inside the block
        this.ctx.fillStyle = "#222222";
        this.ctx.font = "26px Arial, sans-serif";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(obs.emoji, obs.x + obs.width / 2, obs.y + bob + obs.height / 2);
      } else if (obs.isCollectible) {
        // Pulse float powerups slightly
        const bob = Math.sin(Date.now() * 0.007) * 4;

        // White vintage rounded box with double retro outline
        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillRect(obs.x, obs.y + bob, obs.width, obs.height);

        this.ctx.strokeStyle = "#222222";
        this.ctx.lineWidth = 2.5;
        this.ctx.strokeRect(obs.x, obs.y + bob, obs.width, obs.height);

        // Highlight inside
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        this.ctx.fillRect(obs.x + 2, obs.y + bob + 2, obs.width - 4, 3);

        // Render emoji
        this.ctx.fillStyle = "#222222";
        this.ctx.font = "20px Arial, sans-serif";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(obs.emoji, obs.x + obs.width / 2, obs.y + bob + obs.height / 2);
      } else {
        // Draw standard solid hazard block
        this.ctx.fillStyle = obs.color;
        this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

        // Add pixelated black outlines
        this.ctx.strokeStyle = "#222222";
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

        // Draw pixel highlights inside
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        this.ctx.fillRect(obs.x + 3, obs.y + 3, 5, obs.height - 6);
      }
    });

    // 6.5 Draw rotating projectiles (Ninja Stars)
    this.projectiles.forEach(proj => {
      this.ctx.save();
      this.ctx.translate(proj.x + proj.width / 2, proj.y + proj.height / 2);
      this.ctx.rotate(proj.angle);

      this.ctx.fillStyle = "#222222";
      this.ctx.font = "22px Arial, sans-serif";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText(proj.emoji, 0, 0);

      this.ctx.restore();
    });

    // 7. Draw Player Character using off-screen dynamic pixelation
    if (this.gameState === 'playing' || this.gameState === 'countdown' || this.gameState === 'paused' || this.gameState === 'finishing' || this.gameState === 'gameover') {
      const emoji = this.selectedChar ? this.selectedChar.emoji : "👩‍⚕️";

      // Jumps tail bubbles in blocky retro style
      if (!this.player.isGrounded && this.gameState === 'playing') {
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        this.ctx.fillRect(this.player.x - 8, this.player.y + 40, 10, 10);
        this.ctx.fillRect(this.player.x - 22, this.player.y + 48, 8, 8);
      }

      // Blinking retro invulnerable effect
      if (this.invulnerableTimer > 0 && Math.floor(this.invulnerableTimer / 5) % 2 === 0) {
        // Skip drawing frame
      } else {
        SPRITES.drawSpriteFrame(
          this.ctx,
          emoji,
          this.player.runFrame,
          this.player.x,
          this.player.y,
          this.player.width,
          this.player.height,
          this.player.vy,
          this.player.isGrounded
        );
      }
    }

    // 8. Dynamic HUD Text in pixel typography VT323
    if (this.gameState === 'playing' || this.gameState === 'finishing') {
      this.ctx.fillStyle = varColorText();
      this.ctx.font = "32px VT323, monospace";

      // Draw Score
      this.ctx.textAlign = "left";
      this.ctx.fillText(`SCORE: ${this.score}`, 30, 45);

      // Draw Treasures Found Metric (Found / Missed / Total)
      const missed = Math.max(0, this.currentMemoryIndex - this.collectedMemoriesCount);
      this.ctx.textAlign = "center";
      this.ctx.fillText(`FOUND: ${this.collectedMemoriesCount}  MISSED: ${missed} / ${this.getMemories().length}`, this.virtualWidth / 2, 45);

      // Draw High Score
      this.ctx.textAlign = "right";
      this.ctx.fillText(`HIGH: ${this.highScore}`, this.virtualWidth - 30, 45);

      // Draw Gamified stats: Lives, Ammo, Magnet status below
      this.ctx.font = "24px VT323, monospace";
      this.ctx.textAlign = "left";

      let livesText = "LIVES: ";
      for (let l = 0; l < this.lives; l++) livesText += "❤️";
      for (let l = this.lives; l < this.maxLives; l++) livesText += "🖤";
      this.ctx.fillText(livesText, 30, 82);

      this.ctx.textAlign = "right";
      let ammoText = "AMMO: ";
      for (let a = 0; a < this.ammo; a++) ammoText += "✴️";
      for (let a = this.ammo; a < this.maxAmmo; a++) ammoText += "◽";
      this.ctx.fillText(ammoText, this.virtualWidth - 30, 82);

      if (this.magnetCharges > 0) {
        this.ctx.textAlign = "center";
        this.ctx.fillText(`🧲 MAGNET ACTIVE (${this.magnetCharges})`, this.virtualWidth / 2, 82);
      }
    }

    // 9. 3..2..1 Countdown overlay
    if (this.gameState === 'countdown') {
      const elapsed = Date.now() - this.countdownTimer;
      if (elapsed > 1000) {
        this.countdownVal--;
        this.countdownTimer = Date.now();
        if (this.countdownVal <= 0) {
          this.startGame();
        }
      }

      if (this.gameState === 'countdown') {
        this.ctx.fillStyle = "rgba(249, 246, 240, 0.4)";
        this.ctx.fillRect(0, 0, this.virtualWidth, this.virtualHeight);

        this.ctx.fillStyle = varColorText();
        this.ctx.font = "120px VT323, monospace";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(this.countdownVal, this.virtualWidth / 2, this.virtualHeight / 2);
      }
    }

    // 10. Success Fade Screen Overlay (draws a smooth transition after finish line)
    if (this.fadeAlpha > 0) {
      this.ctx.fillStyle = `rgba(249, 246, 240, ${this.fadeAlpha})`; // sunset cream
      this.ctx.fillRect(0, 0, this.virtualWidth, this.virtualHeight);
    }

    this.ctx.restore();
  }

  loop() {
    this.updateParallax();

    if (this.gameState === 'playing' || this.gameState === 'finishing') {
      // Halt physics if player crossed finish line to run off automatically
      if (this.gameState === 'playing') {
        this.updatePhysics();
      }
      this.updateObstacles();
    }

    this.draw();
    requestAnimationFrame(() => this.loop());
  }
}

// Quick helper to read high contrast text theme based on background day/night cycle
function varColorText() {
  if (typeof GAME !== 'undefined' && GAME.activeBgPath === 'assets/nature_3.png') {
    return "#f9f6f0"; // Bright cream for dark night background
  }
  return "#222222"; // Dark charcoal for bright daylight background
}

// Global Game Engine instance
const GAME = new GameEngine();
