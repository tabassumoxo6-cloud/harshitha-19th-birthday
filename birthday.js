/**
 * HARSHITHA.exe — Interactive 19th Birthday Experience Layer
 * Dedicated interactive milestone celebration layer featuring:
 * 1. Interactive 19-Candles Cyber Cake (click individual candles, blow all candles out, make a wish, cake cutting)
 * 2. 19 Memory Balloons Mini-Game (interactive canvas with floating physics, click/tap to pop, sound effects & lore)
 * 3. Birthday Celebration Jukebox & Confetti Cannon
 * 4. Digital Polaroid Keepsake
 */

class BirthdayExperience {
  constructor() {
    this.isOpen = false;
    this.activeTab = 'cake'; // 'cake' | 'balloons' | 'jukebox'
    
    // 19 Candles State
    this.totalCandles = 19;
    this.candlesLit = Array(19).fill(true);
    this.isCakeCut = false;
    this.userWish = localStorage.getItem('harshitha_19th_wish') || '';
    
    // 19 Balloons State
    this.balloons = [];
    this.poppedCount = 0;
    this.balloonCanvas = null;
    this.balloonCtx = null;
    this.balloonAnimId = null;
    this.activeMemoryModal = null;

    // 19 Memory Lore Snippets for the 19 Balloons
    this.memorySnippets = [
      { num: 1, title: "The Origin Glitch", text: "Walking into college as clueless strangers and somehow ending up as an inseparable chaotic duo! 👯‍♀️" },
      { num: 2, title: "The 2 AM Debug Club", text: "Staring at code with 0 errors that refused to run, slowly losing our minds together at 2 AM. 💻😭" },
      { num: 3, title: "The 5-Minute Myth", text: "'Bro I'm reaching in 5 mins' = still in bed finding an outfit for the next 45 minutes. ⏰😂" },
      { num: 4, title: "Canteen Survival", text: "Surviving impossible engineering lectures purely by daydreaming about the canteen snacks afterward. 🧋" },
      { num: 5, title: "The Infinite Food Loop", text: "'What to eat?' 'Anything.' 'Pizza?' 'No.' 'Pani Puri?' 'YES IMMEDIATELY!' 🥙" },
      { num: 6, title: "The Exam Hall Telepathy", text: "Making that silent, horrified eye contact across 4 benches when question 3 was in alien language. 🎓👀" },
      { num: 7, title: "Uncontrollable Laughs", text: "Laughing so uncontrollably hard in public that our ribs hurt and everyone stared at us like we were unhinged. 🤣" },
      { num: 8, title: "The Deep Talk Walk", text: "Golden hour walks where the memes took a break and we talked honestly about our dreams, life, and fears. 🌅" },
      { num: 9, title: "The Sarcasm Equilibrium", text: "Nobody can roast me like you, and nobody can roast you like me. Mutual destruction at its finest! 🔥" },
      { num: 10, title: "Chai Therapy", text: "15 minutes of venting with hot cutting chai solving every single existential crisis known to mankind. ☕" },
      { num: 11, title: "Computer Lab Partners", text: "Writing questionable code, blaming the compiler for our emotional damage, and still passing by 1 mark! 💻" },
      { num: 12, title: "Classified Tea Vault", text: "Holding the sheer gigabytes of confidential tea we have on the universe. Vault encrypted for life. 🤫" },
      { num: 13, title: "The Reel Hivemind", text: "Flooding each other with 47 Instagram reels a day and replying to every single one with 'literally us'. 📱" },
      { num: 14, title: "Matching Energies", text: "Never having to filter your weirdness because you have someone who matches it and multiplies it by 10! ⚡" },
      { num: 15, title: "Quiet Strength", text: "Watching you push through tough days and always coming out stronger, kinder, and more brilliant. 🌟" },
      { num: 16, title: "Summer Ice Cream Runs", text: "Grabbing cold ice cream after a melting hot college afternoon—pure nostalgia and bliss! 🍦" },
      { num: 17, title: "100% Reliability", text: "In a world full of temporary friendships, you are the one person I can trust completely with eyes closed. 🛡️" },
      { num: 18, title: "Level 19 Milestone", text: "Reaching 19! The golden bridge between all our wild teen memories and your extraordinary future. 🎂🎈" },
      { num: 19, title: "Eternal Best Friends", text: "Friends come and go, but Harshitha is a permanent system dependency. Best Friends Forever and Always. ❤️✨" }
    ];

    this.particles = [];
  }

  init() {
    this.createDOM();
    this.bindEvents();
    this.initCandles();
    this.initBalloons();
  }

  createDOM() {
    // If modal already exists, remove it
    const existing = document.getElementById('birthday-experience-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'birthday-experience-modal';
    modal.className = 'bday-modal-overlay hidden';
    modal.innerHTML = `
      <div class="bday-modal-container">
        <!-- Modal Top Bar -->
        <div class="bday-topbar">
          <div class="bday-title-badge">
            <span class="bday-pulse-dot"></span>
            <span>LEVEL 19 // BIRTHDAY_EXPERIENCE_LAYER.exe</span>
          </div>
          <button id="bday-modal-close-btn" class="bday-close-btn" title="Close Birthday Layer (ESC)">
            ✕ CLOSE
          </button>
        </div>

        <!-- Experience Header Banner -->
        <div class="bday-banner">
          <div class="bday-banner-tag">OFFICIAL 19TH BIRTHDAY PROTOCOL 👑</div>
          <h1 class="bday-banner-title">HAPPY 19th BIRTHDAY, HARSHITHA! 🎉🎂</h1>
          <p class="bday-banner-subtitle">
            Welcome to your dedicated interactive celebration layer. Blow out your 19 candles, pop the 19 memory balloons, make a secret wish, and celebrate!
          </p>
        </div>

        <!-- Interactive Tab Navigation -->
        <div class="bday-tabs-nav">
          <button id="bday-tab-cake" class="bday-tab-btn active" data-tab="cake">
            🎂 19 CANDLES & CYBER CAKE
          </button>
          <button id="bday-tab-balloons" class="bday-tab-btn" data-tab="balloons">
            🎈 19 MEMORY BALLOONS MINI-GAME
          </button>
          <button id="bday-tab-jukebox" class="bday-tab-btn" data-tab="jukebox">
            🎵 BIRTHDAY JUKEBOX & KEEPSAKE
          </button>
        </div>

        <!-- Tab 1: 19 Candles & Cake -->
        <div id="bday-pane-cake" class="bday-tab-pane active-pane">
          <div class="cake-activity-card">
            <div class="cake-status-bar">
              <span id="candles-counter-badge" class="candles-counter">CANDLES LIT: 19 / 19 🔥</span>
              <span class="candles-hint">Click individual candles or blow them all out!</span>
            </div>

            <!-- Interactive Cake Stage -->
            <div class="cake-stage-wrapper">
              <div class="cake-display-box" id="cake-display-box">
                <!-- 19 Candles Row -->
                <div class="candles-row" id="candles-container"></div>
                <!-- 3-Tier Neon Cyber Cake -->
                <div class="cyber-cake">
                  <div class="cake-tier tier-top">
                    <span class="tier-frosting">~~~~~~~</span>
                    <span class="tier-text">19</span>
                  </div>
                  <div class="cake-tier tier-mid">
                    <span class="tier-frosting">~~~~~~~~~~~~~</span>
                    <span class="tier-text">HARSHITHA</span>
                  </div>
                  <div class="cake-tier tier-base">
                    <span class="tier-frosting">~~~~~~~~~~~~~~~~~~~</span>
                    <span class="tier-text">HAPPY BIRTHDAY ❤️</span>
                  </div>
                  <div class="cake-stand"></div>
                </div>
              </div>
            </div>

            <!-- Cake Actions -->
            <div class="cake-actions-row">
              <button id="blow-candles-btn" class="cyber-btn-primary">
                BLOW OUT ALL 19 CANDLES 🌬️
              </button>
              <button id="relight-candles-btn" class="cyber-btn-secondary">
                RELIGHT CANDLES 🔥
              </button>
              <button id="cut-cake-btn" class="cyber-btn-primary bday-glow-btn">
                CUT THE BIRTHDAY CAKE 🎂
              </button>
            </div>

            <!-- Birthday Wish Section -->
            <div class="wish-section-box">
              <div class="wish-header">
                <span>✨ MAKE YOUR OFFICIAL 19th BIRTHDAY WISH</span>
                <span style="font-size: 11px; color: var(--text-muted);">ENCRYPTED & PERMANENT</span>
              </div>
              <div class="wish-input-group">
                <input type="text" id="bday-wish-input" class="cyber-input" placeholder="Type your 19th birthday wish here..." maxlength="120">
                <button id="bday-save-wish-btn" class="cyber-btn-primary">SEAL WISH ✨</button>
              </div>
              <div id="bday-wish-confirmation" class="wish-saved-msg hidden"></div>
            </div>
          </div>
        </div>

        <!-- Tab 2: 19 Memory Balloons -->
        <div id="bday-pane-balloons" class="bday-tab-pane hidden">
          <div class="balloons-activity-card">
            <div class="balloons-header-row">
              <div>
                <h3 style="color: #ffd700; font-size: 18px; margin-bottom: 4px;">19 MEMORY BALLOONS MINI-GAME 🎈</h3>
                <p style="font-size: 13px; color: var(--text-muted);">
                  Click or tap floating balloons to pop them and unlock 19 custom friendship memories!
                </p>
              </div>
              <div class="balloons-score-badge">
                <span id="balloons-popped-counter">POPPED: 0 / 19 🎈</span>
                <button id="respawn-balloons-btn" class="cyber-btn-secondary" style="font-size: 11px; padding: 6px 10px;">
                  RESPAWN 🎈
                </button>
              </div>
            </div>

            <div class="balloon-canvas-wrapper">
              <canvas id="balloon-canvas"></canvas>
            </div>

            <!-- Balloon Memory Reveal Card -->
            <div id="balloon-memory-popup" class="balloon-popup-box hidden">
              <div class="popup-header">
                <span id="balloon-popup-num" class="popup-num-tag"></span>
                <span id="balloon-popup-title" class="popup-title"></span>
              </div>
              <p id="balloon-popup-text" class="popup-text"></p>
            </div>
          </div>
        </div>

        <!-- Tab 3: Jukebox & Keepsake -->
        <div id="bday-pane-jukebox" class="bday-tab-pane hidden">
          <div class="jukebox-grid">
            <!-- Audio Player Card -->
            <div class="jukebox-card">
              <h3 style="color: var(--cyan-neon); font-size: 17px; margin-bottom: 12px;">🎵 CELEBRATION SYNTHESIZER</h3>
              <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 18px;">
                High-definition procedural Web Audio synthesizer triggers crafted for Harshitha's 19th.
              </p>
              <div class="jukebox-btn-list">
                <button id="juke-play-bday" class="cyber-btn-primary" style="width: 100%; margin-bottom: 10px;">
                  ▶ PLAY 8-BIT HAPPY BIRTHDAY 🎂
                </button>
                <button id="juke-play-fanfare" class="cyber-btn-secondary" style="width: 100%; margin-bottom: 10px;">
                  🎺 PLAY CELEBRATION FANFARE
                </button>
                <button id="juke-play-ambient" class="cyber-btn-secondary" style="width: 100%; margin-bottom: 10px;">
                  🌌 PLAY CELESTIAL AMBIENT PAD
                </button>
                <button id="juke-fire-confetti" class="cyber-btn-primary bday-glow-btn" style="width: 100%;">
                  🎉 LAUNCH CONFETTI CANNON
                </button>
              </div>
            </div>

            <!-- Digital Keepsake Card -->
            <div class="jukebox-card">
              <h3 style="color: #ffd700; font-size: 17px; margin-bottom: 12px;">👑 BIRTHDAY QUEEN PASSPORT</h3>
              <div class="passport-box">
                <div class="passport-photo">🎂</div>
                <div class="passport-details">
                  <div class="p-line"><strong>NAME:</strong> HARSHITHA</div>
                  <div class="p-line"><strong>AGE:</strong> 19 (LEVEL 19)</div>
                  <div class="p-line"><strong>TITLE:</strong> BEST FRIEND FOR LIFE</div>
                  <div class="p-line"><strong>CHAOS:</strong> 9999% MAXIMUM</div>
                  <div class="p-line"><strong>WISH:</strong> <span id="passport-wish-display">None yet</span></div>
                </div>
              </div>
              <div class="passport-status-stamp">
                VERIFIED OFFICIAL BEST FRIEND PROTOCOL ✅
              </div>
              <p style="font-size: 12px; color: var(--text-muted); text-align: center; margin-top: 14px;">
                Built with endless care, laughs, and lines of code just for you. ❤️
              </p>
            </div>
          </div>
        </div>

      </div>
    `;

    document.body.appendChild(modal);

    // Also add the Birthday button to the top HUD if not already added
    const hudControls = document.querySelector('.hud-controls');
    if (hudControls && !document.getElementById('birthday-layer-btn')) {
      const bdayBtn = document.createElement('button');
      bdayBtn.id = 'birthday-layer-btn';
      bdayBtn.className = 'hud-btn bday-hud-btn';
      bdayBtn.title = 'Open 19th Birthday Interactive Experience Layer';
      bdayBtn.innerHTML = `
        <span class="bday-btn-icon">🎂</span>
        <span class="bday-btn-label">19th BIRTHDAY SPECIAL</span>
      `;
      hudControls.prepend(bdayBtn);
    }

    // Also add a button in Scene 10 (Achievement Scene) if present
    const achievementCard = document.querySelector('.achievement-card');
    if (achievementCard && !document.getElementById('achievement-bday-layer-btn')) {
      const launchBtn = document.createElement('button');
      launchBtn.id = 'achievement-bday-layer-btn';
      launchBtn.className = 'cyber-btn-primary bday-glow-btn mt-20';
      launchBtn.style.width = '100%';
      launchBtn.innerHTML = 'OPEN 19th BIRTHDAY CELEBRATION LAYER 🎂✨';
      achievementCard.appendChild(launchBtn);
    }
  }

  bindEvents() {
    // HUD button open
    const hudBtn = document.getElementById('birthday-layer-btn');
    if (hudBtn) {
      hudBtn.onclick = () => this.open();
    }

    // Achievement scene button open
    const achBtn = document.getElementById('achievement-bday-layer-btn');
    if (achBtn) {
      achBtn.onclick = () => this.open();
    }

    // Close button
    const closeBtn = document.getElementById('bday-modal-close-btn');
    if (closeBtn) {
      closeBtn.onclick = () => this.close();
    }

    // ESC key closes modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });

    // Tab buttons
    const tabs = ['cake', 'balloons', 'jukebox'];
    tabs.forEach(tab => {
      const btn = document.getElementById(`bday-tab-${tab}`);
      if (btn) {
        btn.onclick = () => this.switchTab(tab);
      }
    });

    // Cake buttons
    const blowBtn = document.getElementById('blow-candles-btn');
    if (blowBtn) blowBtn.onclick = () => this.blowAllCandles();

    const relightBtn = document.getElementById('relight-candles-btn');
    if (relightBtn) relightBtn.onclick = () => this.relightCandles();

    const cutCakeBtn = document.getElementById('cut-cake-btn');
    if (cutCakeBtn) cutCakeBtn.onclick = () => this.cutCake();

    // Wish saving
    const saveWishBtn = document.getElementById('bday-save-wish-btn');
    const wishInput = document.getElementById('bday-wish-input');
    if (saveWishBtn && wishInput) {
      if (this.userWish) {
        wishInput.value = this.userWish;
        this.updatePassportWish(this.userWish);
      }
      saveWishBtn.onclick = () => this.saveWish();
      wishInput.onkeydown = (e) => {
        if (e.key === 'Enter') this.saveWish();
      };
    }

    // Balloon respawn
    const respawnBtn = document.getElementById('respawn-balloons-btn');
    if (respawnBtn) {
      respawnBtn.onclick = () => {
        sound.playSelect();
        this.initBalloons();
      };
    }

    // Jukebox buttons
    const jukeBday = document.getElementById('juke-play-bday');
    if (jukeBday) {
      jukeBday.onclick = () => {
        sound.playBirthdayMelody();
      };
    }

    const jukeFanfare = document.getElementById('juke-play-fanfare');
    if (jukeFanfare) {
      jukeFanfare.onclick = () => {
        sound.playAchievementFanfare();
      };
    }

    const jukeAmbient = document.getElementById('juke-play-ambient');
    if (jukeAmbient) {
      jukeAmbient.onclick = () => {
        sound.startAmbient();
      };
    }

    const jukeConfetti = document.getElementById('juke-fire-confetti');
    if (jukeConfetti) {
      jukeConfetti.onclick = () => {
        sound.playSuccess();
        this.spawnFireworkBurst();
      };
    }
  }

  open() {
    this.isOpen = true;
    sound.resume();
    sound.playSelect();
    const modal = document.getElementById('birthday-experience-modal');
    if (modal) {
      modal.classList.remove('hidden');
    }
    // Resize balloon canvas when opening
    setTimeout(() => {
      this.resizeBalloonCanvas();
      if (this.activeTab === 'balloons') {
        this.startBalloonLoop();
      }
    }, 100);
  }

  close() {
    this.isOpen = false;
    sound.playSelect();
    const modal = document.getElementById('birthday-experience-modal');
    if (modal) {
      modal.classList.add('hidden');
    }
    this.stopBalloonLoop();
  }

  switchTab(tabName) {
    sound.playSelect();
    this.activeTab = tabName;

    // Update buttons
    ['cake', 'balloons', 'jukebox'].forEach(t => {
      const btn = document.getElementById(`bday-tab-${t}`);
      const pane = document.getElementById(`bday-pane-${t}`);
      if (btn && pane) {
        if (t === tabName) {
          btn.classList.add('active');
          pane.classList.remove('hidden');
          pane.classList.add('active-pane');
        } else {
          btn.classList.remove('active');
          pane.classList.add('hidden');
          pane.classList.remove('active-pane');
        }
      }
    });

    if (tabName === 'balloons') {
      this.resizeBalloonCanvas();
      this.startBalloonLoop();
    } else {
      this.stopBalloonLoop();
    }
  }

  /* ========================================================================
     19 CANDLES & CYBER CAKE LOGIC
     ======================================================================== */
  initCandles() {
    const container = document.getElementById('candles-container');
    if (!container) return;
    container.innerHTML = '';

    for (let i = 0; i < this.totalCandles; i++) {
      const candle = document.createElement('div');
      candle.className = 'cyber-candle';
      candle.id = `candle-${i}`;
      candle.title = `Candle #${i + 1} of 19 (Click to blow out)`;

      candle.innerHTML = `
        <div class="candle-flame-wrapper">
          <div class="candle-flame ${this.candlesLit[i] ? '' : 'extinguished'}" id="flame-${i}">
            <div class="flame-core"></div>
          </div>
          <div class="candle-smoke hidden" id="smoke-${i}"></div>
        </div>
        <div class="candle-wick"></div>
        <div class="candle-stick">
          <span class="candle-number">${i + 1}</span>
        </div>
      `;

      candle.onclick = () => this.toggleCandle(i);
      container.appendChild(candle);
    }

    this.updateCandlesBadge();
  }

  toggleCandle(index) {
    if (this.candlesLit[index]) {
      // Extinguish
      this.candlesLit[index] = false;
      sound.playCandleBlow();
      const flame = document.getElementById(`flame-${index}`);
      const smoke = document.getElementById(`smoke-${index}`);
      if (flame) flame.classList.add('extinguished');
      if (smoke) {
        smoke.classList.remove('hidden');
        setTimeout(() => smoke.classList.add('hidden'), 1200);
      }
    } else {
      // Relight
      this.candlesLit[index] = true;
      sound.playSelect();
      const flame = document.getElementById(`flame-${index}`);
      if (flame) flame.classList.remove('extinguished');
    }

    this.updateCandlesBadge();
    this.checkAllCandlesBlown();
  }

  blowAllCandles() {
    sound.playCandleBlow();
    for (let i = 0; i < this.totalCandles; i++) {
      this.candlesLit[i] = false;
      const flame = document.getElementById(`flame-${i}`);
      const smoke = document.getElementById(`smoke-${i}`);
      if (flame) flame.classList.add('extinguished');
      if (smoke) {
        smoke.classList.remove('hidden');
        setTimeout(() => smoke.classList.add('hidden'), 1500);
      }
    }

    this.updateCandlesBadge();
    setTimeout(() => {
      sound.playBirthdayMelody();
      this.spawnFireworkBurst();
      this.showWishPrompt();
    }, 400);
  }

  relightCandles() {
    sound.playSelect();
    for (let i = 0; i < this.totalCandles; i++) {
      this.candlesLit[i] = true;
      const flame = document.getElementById(`flame-${i}`);
      if (flame) flame.classList.remove('extinguished');
    }
    this.updateCandlesBadge();
  }

  updateCandlesBadge() {
    const badge = document.getElementById('candles-counter-badge');
    const litCount = this.candlesLit.filter(Boolean).length;
    if (badge) {
      if (litCount === 0) {
        badge.innerHTML = `ALL 19 CANDLES BLOWN OUT! 🌟 MAKE A WISH!`;
        badge.style.color = '#ffd700';
      } else {
        badge.innerHTML = `CANDLES LIT: ${litCount} / 19 🔥`;
        badge.style.color = 'var(--cyan-neon)';
      }
    }
  }

  checkAllCandlesBlown() {
    const litCount = this.candlesLit.filter(Boolean).length;
    if (litCount === 0) {
      setTimeout(() => {
        sound.playBirthdayMelody();
        this.spawnFireworkBurst();
      }, 300);
    }
  }

  cutCake() {
    sound.playSuccess();
    const cakeBox = document.getElementById('cake-display-box');
    if (cakeBox) {
      cakeBox.classList.add('cake-cut-animation');
      setTimeout(() => {
        cakeBox.classList.remove('cake-cut-animation');
      }, 1000);
    }
    this.spawnFireworkBurst();

    const banner = document.getElementById('bday-wish-confirmation');
    if (banner) {
      banner.textContent = "🎂 CAKE OFFICIALLY SLICED! May your 19th year be sweet, joyful & legendary! ❤️";
      banner.classList.remove('hidden');
    }
  }

  showWishPrompt() {
    const wishInput = document.getElementById('bday-wish-input');
    if (wishInput && !this.userWish) {
      wishInput.focus();
    }
  }

  saveWish() {
    const input = document.getElementById('bday-wish-input');
    const msg = document.getElementById('bday-wish-confirmation');
    if (!input || !msg) return;

    const val = input.value.trim();
    if (!val) {
      sound.playBuzzer();
      return;
    }

    sound.playSuccess();
    this.userWish = val;
    localStorage.setItem('harshitha_19th_wish', val);
    this.updatePassportWish(val);

    msg.textContent = `✨ 19th Birthday Wish Encrypted into the Universe: "${val}" — Status: Guaranteed to come true! ❤️`;
    msg.classList.remove('hidden');
    this.spawnFireworkBurst();
  }

  updatePassportWish(wishText) {
    const display = document.getElementById('passport-wish-display');
    if (display) {
      display.textContent = `"${wishText}"`;
      display.style.color = '#ffd700';
    }
  }

  /* ========================================================================
     19 MEMORY BALLOONS MINI-GAME
     ======================================================================== */
  initBalloons() {
    this.poppedCount = 0;
    this.updateBalloonScore();
    this.balloonCanvas = document.getElementById('balloon-canvas');
    if (!this.balloonCanvas) return;
    this.balloonCtx = this.balloonCanvas.getContext('2d');
    this.resizeBalloonCanvas();

    const w = this.balloonCanvas.width;
    const h = this.balloonCanvas.height;

    // Palette of vibrant celebratory colors
    const colors = ['#00f3ff', '#ff007f', '#ffd700', '#00ff88', '#bd00ff', '#ff5533', '#33bbff'];

    this.balloons = [];
    const isSmallScreen = w < 480;
    const balloonRadiusX = isSmallScreen ? 18 : 24;
    const balloonRadiusY = isSmallScreen ? 23 : 30;

    for (let i = 0; i < 19; i++) {
      const col = (i % 6);
      const row = Math.floor(i / 6);
      const startX = Math.max(30, 40 + col * ((w - 80) / 5) + (Math.random() - 0.5) * 20);
      const startY = h - 50 - row * (isSmallScreen ? 85 : 110) + (Math.random() - 0.5) * 20;

      this.balloons.push({
        id: i + 1,
        x: Math.max(balloonRadiusX + 10, Math.min(w - balloonRadiusX - 10, startX)),
        y: Math.max(balloonRadiusY + 20, startY),
        origX: startX,
        radiusX: balloonRadiusX,
        radiusY: balloonRadiusY,
        color: colors[i % colors.length],
        popped: false,
        floatSpeed: 0.3 + Math.random() * 0.4,
        swaySpeed: 0.02 + Math.random() * 0.02,
        swayAmount: isSmallScreen ? 10 : (15 + Math.random() * 15),
        swayOffset: Math.random() * Math.PI * 2,
        stringLength: isSmallScreen ? 25 : 35
      });
    }

    this.setupBalloonInteraction();
  }

  resizeBalloonCanvas() {
    if (!this.balloonCanvas) return;
    const rect = this.balloonCanvas.getBoundingClientRect();
    this.balloonCanvas.width = rect.width || 700;
    this.balloonCanvas.height = Math.min(360, Math.max(260, Math.floor(window.innerHeight * 0.42)));
  }

  setupBalloonInteraction() {
    if (!this.balloonCanvas || this.balloonCanvas._hasListener) return;
    this.balloonCanvas._hasListener = true;

    const handlePointer = (e) => {
      e.preventDefault();
      const rect = this.balloonCanvas.getBoundingClientRect();
      const scaleX = this.balloonCanvas.width / rect.width;
      const scaleY = this.balloonCanvas.height / rect.height;
      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;

      // Check click against unpopped balloons
      for (let i = this.balloons.length - 1; i >= 0; i--) {
        const b = this.balloons[i];
        if (b.popped) continue;

        // Ellipse hit check with generous tap target padding (1.35 factor for touch comfort)
        const dx = (clickX - b.x) / (b.radiusX * 1.35);
        const dy = (clickY - b.y) / (b.radiusY * 1.35);
        if (dx * dx + dy * dy <= 1.2) {
          this.popBalloon(b);
          break;
        }
      }
    };

    this.balloonCanvas.addEventListener('pointerdown', handlePointer);
  }

  popBalloon(balloon) {
    balloon.popped = true;
    this.poppedCount++;
    this.updateBalloonScore();

    // Play balloon pop audio
    sound.playPop();

    // Spawn popping particle explosion
    this.spawnPopParticles(balloon.x, balloon.y, balloon.color);

    // Reveal Memory Snippet
    const snippet = this.memorySnippets[balloon.id - 1];
    this.showBalloonMemory(snippet);

    // If all 19 are popped, play fanfare!
    if (this.poppedCount >= 19) {
      setTimeout(() => {
        sound.playBirthdayMelody();
        this.spawnFireworkBurst();
      }, 300);
    }
  }

  spawnPopParticles(x, y, color) {
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        color: color,
        alpha: 1,
        size: 3 + Math.random() * 4
      });
    }
  }

  showBalloonMemory(snippet) {
    const popup = document.getElementById('balloon-memory-popup');
    const numTag = document.getElementById('balloon-popup-num');
    const titleEl = document.getElementById('balloon-popup-title');
    const textEl = document.getElementById('balloon-popup-text');

    if (!popup || !snippet) return;

    numTag.textContent = `BALLOON #${snippet.num} OF 19 🎈`;
    titleEl.textContent = snippet.title;
    textEl.textContent = `"${snippet.text}"`;

    popup.classList.remove('hidden');
    popup.classList.add('pop-pulse');
    setTimeout(() => popup.classList.remove('pop-pulse'), 500);
  }

  updateBalloonScore() {
    const counter = document.getElementById('balloons-popped-counter');
    if (counter) {
      counter.textContent = `POPPED: ${this.poppedCount} / 19 🎈`;
      if (this.poppedCount >= 19) {
        counter.innerHTML = `👑 ALL 19 BALLOONS POPPED! LEVEL 19 MASTER! 🎈`;
        counter.style.color = '#ffd700';
      }
    }
  }

  startBalloonLoop() {
    this.stopBalloonLoop();
    const render = () => {
      this.updateBalloons();
      this.drawBalloons();
      this.balloonAnimId = requestAnimationFrame(render);
    };
    render();
  }

  stopBalloonLoop() {
    if (this.balloonAnimId) {
      cancelAnimationFrame(this.balloonAnimId);
      this.balloonAnimId = null;
    }
  }

  updateBalloons() {
    const h = this.balloonCanvas ? this.balloonCanvas.height : 360;

    this.balloons.forEach(b => {
      if (b.popped) return;

      b.swayOffset += b.swaySpeed;
      b.x = b.origX + Math.sin(b.swayOffset) * b.swayAmount;
      b.y -= b.floatSpeed;

      // Wrap around top to bottom
      if (b.y < -40) {
        b.y = h + 40;
      }
    });

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1; // gravity
      p.alpha -= 0.025;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  drawBalloons() {
    if (!this.balloonCtx || !this.balloonCanvas) return;
    const ctx = this.balloonCtx;
    const w = this.balloonCanvas.width;
    const h = this.balloonCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // Subtle dark grid background
    ctx.fillStyle = '#080c16';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = '#121a2c';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // Draw Balloons
    this.balloons.forEach(b => {
      if (b.popped) return;

      // Balloon string
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y + b.radiusY);
      ctx.quadraticCurveTo(
        b.x + Math.sin(b.swayOffset) * 8,
        b.y + b.radiusY + b.stringLength * 0.5,
        b.x,
        b.y + b.radiusY + b.stringLength
      );
      ctx.stroke();

      // Balloon Body (Radial Gradient for 3D sphere look)
      const grad = ctx.createRadialGradient(
        b.x - b.radiusX * 0.3,
        b.y - b.radiusY * 0.3,
        2,
        b.x,
        b.y,
        b.radiusY
      );
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, b.color);
      grad.addColorStop(1, '#000000');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(b.x, b.y, b.radiusX, b.radiusY, 0, 0, Math.PI * 2);
      ctx.fill();

      // Balloon Knot
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.moveTo(b.x - 4, b.y + b.radiusY + 4);
      ctx.lineTo(b.x + 4, b.y + b.radiusY + 4);
      ctx.lineTo(b.x, b.y + b.radiusY);
      ctx.fill();

      // Number badge on balloon: 1..19
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 12px "Fira Code", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${b.id}`, b.x, b.y);
    });

    // Draw Particles
    this.particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;
  }

  /* ========================================================================
     CONFETTI & FIREWORK BURST
     ======================================================================== */
  spawnFireworkBurst() {
    const confettiColors = ['#00f3ff', '#ff007f', '#ffd700', '#00ff88', '#bd00ff', '#ffffff'];
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      this.particles.push({
        x: (this.balloonCanvas ? this.balloonCanvas.width : 500) / 2,
        y: 120,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        alpha: 1,
        size: 3 + Math.random() * 4
      });
    }
  }
}

// Global Singleton Instance
let birthdayLayer = null;

document.addEventListener('DOMContentLoaded', () => {
  birthdayLayer = new BirthdayExperience();
  birthdayLayer.init();
});
