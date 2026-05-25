/**
 * 👩‍⚕️ The Friendship Run — RETRO MEMORY OVERLAY & PARTICLES
 * 
 * Pauses game engine physics, populates options dynamically, flashes answers,
 * plays synthetic retro sound effects, and bursts congratulatory emoji particles!
 */

class MemoryOverlayManager {
  constructor() {
    this.overlay = null;
    this.card = null;
    this.emojiEl = null;
    this.titleEl = null;
    this.storyEl = null;
    this.imgContainer = null;
    this.imgEl = null;
    this.questionEl = null;
    this.optionsGrid = null;
    this.reactionBox = null;
    this.continueBtn = null;

    this.currentMemory = null;
    this.hasAnswered = false;

    // Wait for DOM load to gather elements
    window.addEventListener('DOMContentLoaded', () => this.initElements());
  }

  initElements() {
    this.overlay = document.getElementById('memory-overlay');
    this.card = document.getElementById('memory-card');
    this.emojiEl = document.getElementById('mc-emoji');
    this.titleEl = document.getElementById('mc-title');
    this.storyEl = document.getElementById('mc-story');
    this.imgContainer = document.getElementById('mc-image-container');
    this.imgEl = document.getElementById('mc-image');
    this.questionEl = document.getElementById('mc-question');
    this.optionsGrid = document.getElementById('mc-options-grid');
    this.reactionBox = document.getElementById('mc-reaction-box');
    this.continueBtn = document.getElementById('btn-mc-continue');

    // Bind continue click
    if (this.continueBtn) {
      this.continueBtn.addEventListener('click', () => this.closeOverlay());
    }
  }

  /**
   * Opens the overlay for a specific memory item.
   * Halts game physics while keeping the engine rendering active.
   */
  open(memoryIndex) {
    this.currentMemory = GAME.getMemories()[memoryIndex];
    if (!this.currentMemory) return;

    this.hasAnswered = false;

    // 1. Pause game loop
    GAME.gameState = 'paused';

    // 2. Format card colors matching emotion vibe
    this.card.className = `memory-card ${this.currentMemory.emotion || 'funny'}`;

    // 3. Populate standard metadata
    this.emojiEl.textContent = this.currentMemory.emoji || '💖';
    this.titleEl.textContent = `${this.currentMemory.place || 'Memory'}`;
    this.storyEl.textContent = this.currentMemory.story || '';

    // 4. Handle optional personalized photos
    if (this.currentMemory.image) {
      this.imgEl.src = this.currentMemory.image;
      this.imgContainer.style.display = 'flex';

      // Auto-apply portrait ratio frame specifically for vertical photos dynamically on load!
      this.imgEl.onload = () => {
        if (this.imgEl.naturalHeight > this.imgEl.naturalWidth * 1.1) {
          this.imgContainer.classList.add('portrait-fit');
        } else {
          this.imgContainer.classList.remove('portrait-fit');
        }
      };
    } else {
      this.imgContainer.style.display = 'none';
      this.imgContainer.classList.remove('portrait-fit');
    }

    // 5. Hide reaction and continue button by default
    this.reactionBox.style.display = 'none';
    this.continueBtn.style.display = 'none';

    // 6. Handle layout variations (Interactive Quiz vs Simple Story)
    if (this.currentMemory.type === 'story') {
      // Simple Story: hide question area and show continue button immediately!
      this.questionEl.style.display = 'none';
      this.optionsGrid.style.display = 'none';
      this.continueBtn.style.display = 'block';
    } else {
      // Interactive Quiz/Choice: populate option buttons dynamically
      this.questionEl.textContent = this.currentMemory.question || '';
      this.questionEl.style.display = 'block';
      this.optionsGrid.style.display = 'grid';
      this.optionsGrid.innerHTML = '';

      this.currentMemory.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'retro-option';
        btn.textContent = opt;
        btn.addEventListener('click', () => this.handleOptionSelection(btn, idx));
        this.optionsGrid.appendChild(btn);
      });
    }

    // 7. Make overlay visible
    this.overlay.classList.add('visible');
    console.log(`📖 Memory card opened: ${this.currentMemory.place}`);
  }

  /**
   * Validates selected options and shows corresponding feedback reactions.
   */
  handleOptionSelection(selectedBtn, selectedIdx) {
    if (this.hasAnswered) return; // Prevent double click
    this.hasAnswered = true;

    const memory = this.currentMemory;
    const allButtons = this.optionsGrid.querySelectorAll('.retro-option');

    // Block interactions with other buttons
    allButtons.forEach(btn => btn.style.cursor = 'default');

    if (memory.type === 'quiz') {
      // Correct vs Wrong validation
      const isCorrect = selectedIdx === memory.correct;

      if (isCorrect) {
        selectedBtn.classList.add('correct');
        AUDIO.playCorrect();
        this.showReaction(memory.reactions.right);
      } else {
        selectedBtn.classList.add('wrong');
        AUDIO.playWrong();

        // Highlight correct button as helper flash
        if (allButtons[memory.correct]) {
          allButtons[memory.correct].classList.add('correct');
        }
        this.showReaction(memory.reactions.wrong);
      }
    } else {
      // Choice type: directly trigger customized reactions per index
      selectedBtn.classList.add('correct'); // Highlight choice selected
      AUDIO.playCorrect();
      const reaction = memory.reactions[selectedIdx] || "Lovely choice!";
      this.showReaction(reaction);
    }

    // Reveal continue runner button
    this.continueBtn.style.display = 'block';
  }

  showReaction(text) {
    this.reactionBox.textContent = `💬 ${text}`;
    this.reactionBox.style.display = 'block';
  }

  /**
   * Resumes the game engine and launches the congratulations emoji particles.
   */
  closeOverlay() {
    this.overlay.classList.remove('visible');
    AUDIO.playJump();

    // Spawn 16 retro floating confetti particles from player screen center
    const canvasRect = GAME.canvas.getBoundingClientRect();
    const playerX = canvasRect.left + (GAME.player.x + GAME.player.width / 2) * GAME.scaleX;
    const playerY = canvasRect.top + (GAME.player.y + GAME.player.height / 2) * GAME.scaleY;

    this.burstEmojiParticles(this.currentMemory.emoji || '🎉', playerX, playerY);

    // Set a tiny delay before fully resuming to let particles start flying!
    setTimeout(() => {
      // Decrement magnet pull charge upon successful memory collection
      if (GAME.magnetCharges > 0) {
        GAME.magnetCharges--;
        console.log(`🧲 Decremented magnet charges. Charges left: ${GAME.magnetCharges}`);
      }

      // Increment successful collection count
      GAME.collectedMemoriesCount++;
      console.log(`⭐ Successfully collected memory! Count: ${GAME.collectedMemoriesCount}`);

      // Advance to next memory index
      GAME.currentMemoryIndex++;

      // Schedule the next memory or finish line dynamic spawn score!
      if (GAME.currentMemoryIndex < GAME.getMemories().length) {
        GAME.nextMemorySpawnScore = GAME.score + 300;
        console.log(`🎯 Scheduled next memory #${GAME.currentMemoryIndex + 1} to spawn at score ${GAME.nextMemorySpawnScore}`);
      } else {
        GAME.finishLineScore = GAME.score + 300;
        console.log(`🏆 All memories collected! Scheduled checkered finish gate at score ${GAME.finishLineScore}`);
      }

      GAME.gameState = 'playing';
      console.log(`🏃‍♂️ Run resumed! Current Memory Index: ${GAME.currentMemoryIndex}`);
    }, 100);
  }

  /**
   * Spawns a gorgeous floating burst of vintage emoji particles that fall with gravity.
   */
  burstEmojiParticles(emoji, startX, startY) {
    const particleCount = 16;
    const emojis = [emoji, '✨', '💖', '🎉'];

    for (let i = 0; i < particleCount; i++) {
      const el = document.createElement('div');
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      el.style.cssText = `
        position: fixed;
        left: ${startX}px;
        top: ${startY}px;
        font-size: 26px;
        font-family: Arial, sans-serif;
        pointer-events: none;
        z-index: 99;
        transition: transform 0.88s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.88s ease;
      `;
      document.body.appendChild(el);

      const angle = (i / particleCount) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
      const distance = 80 + Math.random() * 60;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance + 35; // slightly skewed down due to gravity effect

      // Force draw frame updates then apply transform
      requestAnimationFrame(() => {
        el.style.transform = `translate(${tx}px, ${ty}px) scale(0.6) rotate(${Math.random() * 360}deg)`;
        el.style.opacity = '0';
      });

      // Remove after transition finishes
      setTimeout(() => el.remove(), 950);
    }
  }

  /**
   * Opens the custom Mission Briefing popup before the countdown starts.
   */
  openMissionBriefing(selectedChar) {
    if (!this.briefingOverlay) {
      this.briefingOverlay = document.getElementById('mission-briefing-overlay');
    }
    const emojiEl = document.getElementById('briefing-char-emoji');
    const textEl = document.getElementById('briefing-text');
    const headerEl = this.briefingOverlay ? this.briefingOverlay.querySelector('.briefing-header') : null;
    const startBtn = document.getElementById('btn-briefing-start');

    if (emojiEl) emojiEl.textContent = selectedChar ? selectedChar.emoji : "👩‍⚕️";
    
    const charId = selectedChar ? selectedChar.id : 'riya';
    
    if (charId === 'me') {
      if (headerEl) headerEl.textContent = "🦊 Utsav's Message";
      if (textEl) {
        textEl.innerHTML = `<strong>"My memories are with you guys and you already saw them :) You are my good memories."</strong><br><br>Let's run infinitely and dodge spikes to set a legendary high score! 🚀`;
      }
      if (startBtn) {
        startBtn.textContent = "Start Infinite Run 🏃‍♂️";
      }
    } else {
      const activeName = (charId === 'nishthi') ? 'Nishtha' : 'Riya';
      const totalTreasures = GAME.getMemories().length;
      if (headerEl) headerEl.textContent = "🚀 Mission Briefing";
      if (textEl) {
        textEl.innerHTML = `Hey <strong>${activeName}</strong>! You have <strong>${totalTreasures} treasures</strong> to find along our memory run. If you are able to find them all, you will win! Let's go! 🚀`;
      }
      if (startBtn) {
        startBtn.textContent = "Let's Run! 🏃‍♂️";
      }
    }

    if (this.briefingOverlay) {
      this.briefingOverlay.classList.add('visible');
    }

    // Bind start button
    if (startBtn && !startBtn.dataset.bound) {
      startBtn.dataset.bound = "true";
      startBtn.addEventListener('click', () => {
        AUDIO.playJump();
        if (this.briefingOverlay) this.briefingOverlay.classList.remove('visible');
        const hudTips = document.getElementById('hud-tips');
        if (hudTips) hudTips.style.display = 'block';
        GAME.startCountdown();
      });
    }
  }

  /**
   * Opens the grand birthday finale present selector and scrolling wishing letter.
   */
  openBirthdayFinale() {
    if (!this.finaleOverlay) {
      this.finaleOverlay = document.getElementById('birthday-finale-overlay');
    }

    const giftSelectView = document.getElementById('gift-selection-view');
    const letterView = document.getElementById('letter-view');
    const lockedView = document.getElementById('locked-view');

    if (giftSelectView) {
      giftSelectView.style.display = 'block';
      giftSelectView.style.opacity = '1';
    }
    if (letterView) {
      letterView.style.display = 'none';
    }
    if (lockedView) {
      lockedView.style.display = 'none';
    }

    if (this.finaleOverlay) {
      this.finaleOverlay.classList.add('visible');
    }

    // Bind Gift Boxes clicks
    const giftBoxes = document.querySelectorAll('.gift-box');
    giftBoxes.forEach(box => {
      if (!box.dataset.bound) {
        box.dataset.bound = "true";
        box.addEventListener('click', (e) => {
          const rect = box.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;

          // Confetti and audio triggers!
          AUDIO.playCorrect();
          this.burstEmojiParticles('🎉', cx, cy);
          this.burstEmojiParticles('💖', cx, cy);
          this.burstEmojiParticles('🎂', cx, cy);

          // Transition to letter
          if (giftSelectView) {
            giftSelectView.style.transition = 'opacity 0.3s ease';
            giftSelectView.style.opacity = '0';
            setTimeout(() => {
              giftSelectView.style.display = 'none';

              // Populate the dynamic letter based on selected birthday girl
              const charId = GAME.selectedChar ? GAME.selectedChar.id : 'riya';
              const letterHeaderEl = document.getElementById('letter-header');
              const letterContentEl = document.getElementById('letter-content');

              if (charId === 'nishthi') {
                if (letterHeaderEl) letterHeaderEl.innerHTML = '🎂 For you Nishthi! 💖';
                if (letterContentEl) {
                  letterContentEl.innerHTML = `
                    <p><strong>Tera to bday he bhi nai kher, fir bhi tere liye do sabd 😂</strong></p>
                    <br>
                    <p>Ik you are going through crucial time of your life, bahot pressure feel kr rhi he tu, we all know that. But you will get through it, don't worry. Just stay calm and keep going! And cool to tu he hi 😎 most dramatic character of our group, har baat me emo blackmail and paise mangna 😂.</p>
                    <br>
                    <p>Kher jo bhi he, be happy bro! We both are with you in any ups and downs you will have, you know that obv. You have got good friends - karthik and harsh, karthik ne hi help kri he kuch isme 😂 likh kr bheja ye sab with photos, wordings se samaj gayi hogi kuch kuch me. Keep them!</p>
                    <br>
                    <p>And anyways, I hope k apna bond chalta rahe until we get old? Kuch na hua to soda shop kholni he na apn ko kodinar me 😂 our business idea.</p>
                    <br>
                    <p><strong>Stay happy bruuuhh!! 🫂</strong></p>
                  `;
                }
              } else {
                if (letterHeaderEl) letterHeaderEl.innerHTML = '🎂 Happppiesttt Birthdayyyy Riyaaaa!! 🥳';
                if (letterContentEl) {
                  letterContentEl.innerHTML = `
                    <p><strong>Our Alice Hesterrr!</strong></p>
                    <br>
                    <p>I don't have much to write about you, we are already in the phase of lives where we don't need to tell each other that how much we care for each other. Just stay happy bruh, we (me and Nishthi) just want to see you smile everyday, khush reh sirf. Ik you are trying to get better in many aspects, say it relationships, friendship, as a daughter, as a sibling and much more.</p>
                    <br>
                    <p>So just wishing you everything! Tujhe germany jana he, ja tu, mast apna career bana and make us proud! And we will keep going to new places, new cafes? I hope so 😂. You also have someone who cares for you and you also care for him, you are comfortable with him. Bahot badi baat he ye, stay happy with him, and you said ki vo aaye na aaye meri shadi pr but ik ki utsav zaroor aayega. Definetly 😎</p>
                    <br>
                    <p>Hope that hmara bond vo buddhe uncles k jesa ho, saath me chai piyenge budhape me teeno 😂, ig 6 log - couple honge na tab to. saath me ghar banane ka he baju baju me, yaad he na deal? And our soda shop in kodinar 😂</p>
                    <br>
                    <p>Hope to see you soon :)</p>
                    <br>
                    <p><strong>Again, Happpppy birthday broooo! 🫂</strong></p>
                  `;
                }
              }

              if (letterView) {
                letterView.style.display = 'block';
                letterView.style.opacity = '0';
                setTimeout(() => {
                  letterView.style.transition = 'opacity 0.4s ease';
                  letterView.style.opacity = '1';
                }, 50);
              }
            }, 300);
          }
        });
      }
    });

    // Bind Restart Play Again button
    const restartBtn = document.getElementById('btn-finale-restart');
    if (restartBtn && !restartBtn.dataset.bound) {
      restartBtn.dataset.bound = "true";
      restartBtn.addEventListener('click', () => {
        AUDIO.playJump();
        if (this.finaleOverlay) this.finaleOverlay.classList.remove('visible');

        const landingScreen = document.getElementById('landing-screen');
        if (landingScreen) landingScreen.classList.remove('hidden');

        GAME.gameState = 'menu';
      });
    }
  }

  /**
   * Opens the grand birthday finale in a LOCKED state when some memories were missed along the timeline.
   */
  openBirthdayLocked(collected, total) {
    if (!this.finaleOverlay) {
      this.finaleOverlay = document.getElementById('birthday-finale-overlay');
    }

    const giftSelectView = document.getElementById('gift-selection-view');
    const letterView = document.getElementById('letter-view');
    const lockedView = document.getElementById('locked-view');
    const statusText = document.getElementById('locked-status-text');

    if (statusText) {
      const charId = GAME.selectedChar ? GAME.selectedChar.id : 'riya';
      const activeName = (charId === 'nishthi') ? 'Nishtha' : 'Riya';
      statusText.innerHTML = `Oh no, <strong>${activeName}</strong>! You only collected <strong>${collected} out of ${total}</strong> treasures along the memory run.`;
    }

    if (giftSelectView) giftSelectView.style.display = 'none';
    if (letterView) letterView.style.display = 'none';
    if (lockedView) {
      lockedView.style.display = 'block';
      lockedView.style.opacity = '1';
    }

    if (this.finaleOverlay) {
      this.finaleOverlay.classList.add('visible');
    }

    // Bind Locked restart button
    const lockedRestartBtn = document.getElementById('btn-locked-restart');
    if (lockedRestartBtn && !lockedRestartBtn.dataset.bound) {
      lockedRestartBtn.dataset.bound = "true";
      lockedRestartBtn.addEventListener('click', () => {
        AUDIO.playJump();
        if (this.finaleOverlay) this.finaleOverlay.classList.remove('visible');

        const landingScreen = document.getElementById('landing-screen');
        if (landingScreen) landingScreen.classList.remove('hidden');

        GAME.gameState = 'menu';
      });
    }
  }
}

// Instantiate global memory overlay controller
const MEMORIES = new MemoryOverlayManager();

class CharacterQuizManager {
  constructor() {
    this.overlay = null;
    this.card = null;
    this.emojiEl = null;
    this.nameEl = null;
    this.questionEl = null;
    this.hintEl = null;
    this.inputEl = null;
    this.feedbackEl = null;
    this.changeBtn = null;
    this.verifyBtn = null;

    this.activeChar = null;
    this.currentQuestionIdx = 0;
    this.onSuccessCallback = null;

    window.addEventListener('DOMContentLoaded', () => this.initElements());
  }

  initElements() {
    this.overlay = document.getElementById('char-quiz-overlay');
    if (!this.overlay) return;
    this.card = this.overlay.querySelector('.char-quiz-box');
    this.emojiEl = document.getElementById('quiz-emoji');
    this.nameEl = document.getElementById('quiz-char-name');
    this.questionEl = document.getElementById('quiz-question-text');
    this.hintEl = document.getElementById('quiz-question-hint');
    this.inputEl = document.getElementById('quiz-answer-input');
    this.feedbackEl = document.getElementById('quiz-feedback');
    this.changeBtn = document.getElementById('btn-quiz-change');
    this.verifyBtn = document.getElementById('btn-quiz-verify');

    if (this.changeBtn) {
      this.changeBtn.addEventListener('click', () => {
        AUDIO.playJump();
        this.changeQuestion();
      });
    }

    if (this.verifyBtn) {
      this.verifyBtn.addEventListener('click', () => {
        this.verifyAnswer();
      });
    }

    if (this.inputEl) {
      this.inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.verifyAnswer();
        }
      });
    }
  }

  open(character, onSuccess) {
    this.activeChar = character;
    this.onSuccessCallback = onSuccess;
    this.currentQuestionIdx = 0;

    if (!this.overlay) {
      this.initElements();
    }

    if (!this.overlay || !this.activeChar || !this.activeChar.quiz || this.activeChar.quiz.length === 0) {
      // Fallback: if no quiz exists for this character (e.g. somehow undefined), allow bypass
      if (onSuccess) onSuccess();
      return;
    }

    // Populate metadata
    if (this.emojiEl) this.emojiEl.textContent = this.activeChar.emoji;
    if (this.nameEl) this.nameEl.textContent = this.activeChar.name;
    
    // Clear input & feedback
    if (this.inputEl) {
      this.inputEl.value = '';
      this.inputEl.style.borderColor = 'var(--retro-border)';
    }
    if (this.feedbackEl) {
      this.feedbackEl.style.display = 'none';
    }

    this.displayQuestion();

    // Show overlay
    this.overlay.style.display = 'flex';
    this.overlay.classList.add('visible');
    
    // Auto-focus input
    setTimeout(() => {
      if (this.inputEl) this.inputEl.focus();
    }, 50);
  }

  close() {
    if (this.overlay) {
      this.overlay.classList.remove('visible');
      setTimeout(() => {
        this.overlay.style.display = 'none';
      }, 300);
    }
  }

  displayQuestion() {
    const quizData = this.activeChar.quiz[this.currentQuestionIdx];
    if (this.questionEl) this.questionEl.textContent = quizData.question;
    
    if (this.hintEl) {
      if (quizData.hint) {
        this.hintEl.textContent = quizData.hint;
        this.hintEl.style.display = 'block';
      } else {
        this.hintEl.style.display = 'none';
      }
    }

    if (this.inputEl) {
      this.inputEl.value = '';
      this.inputEl.focus();
    }

    if (this.feedbackEl) {
      this.feedbackEl.style.display = 'none';
    }
  }

  changeQuestion() {
    if (!this.activeChar || !this.activeChar.quiz) return;
    this.currentQuestionIdx = (this.currentQuestionIdx + 1) % this.activeChar.quiz.length;
    this.displayQuestion();
  }

  verifyAnswer() {
    if (!this.activeChar || !this.activeChar.quiz) return;
    const quizData = this.activeChar.quiz[this.currentQuestionIdx];
    const userInput = this.inputEl ? this.inputEl.value : '';

    // Normalize: convert to lowercase and remove all special symbols/punctuation/whitespace
    const normalize = (text) => text.toLowerCase().trim().replace(/[^a-z0-9]/g, '');

    const normalizedInput = normalize(userInput);
    
    // Check if input matches any correct normalized answers
    const isCorrect = quizData.answers.some(ans => normalize(ans) === normalizedInput);

    if (isCorrect) {
      // Success! Play correct sound and confetti!
      AUDIO.playCorrect();
      
      // Spawn some sweet correct particles from center of quiz card
      const rect = this.card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      MEMORIES.burstEmojiParticles('🔓', cx, cy);
      MEMORIES.burstEmojiParticles('✨', cx, cy);

      this.close();
      
      // Call success callback
      if (this.onSuccessCallback) {
        this.onSuccessCallback();
      }
    } else {
      // Incorrect answer! Play buzzer/wrong sound, shake card, show error message
      AUDIO.playWrong();
      
      if (this.feedbackEl) {
        this.feedbackEl.textContent = "Access Denied: Incorrect answer. Try again!";
        this.feedbackEl.style.display = 'block';
      }

      if (this.inputEl) {
        this.inputEl.focus();
        this.inputEl.select();
      }

      // Add shake class for visual feedback
      if (this.card) {
        this.card.classList.add('shake');
        // Clear shake class after animation completes
        setTimeout(() => {
          this.card.classList.remove('shake');
        }, 400);
      }
    }
  }
}

// Instantiate global quiz manager
const QUIZ = new CharacterQuizManager();

