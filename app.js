/**
 * HARSHITHA.exe — Master Application Controller
 * Handles scene routing, typewriter text, memory cards, quiz logic, password verification,
 * DevTools easter eggs, and emotional finale transitions!
 */

// Scene Constants
const SCENES = [
  'scene-boot',          // 0: Boot sequence
  'scene-personality',   // 1: System dialogue
  'scene-quiz',          // 2: Level 1 Quiz
  'scene-memories',      // 3: Level 2 Memory Database
  'scene-game',          // 4: Level 3 Mini Game
  'scene-password',      // 5: Level 4 Corrupted File Password
  'scene-tonesplit',     // 6: Emotional Tone Shift
  'scene-galaxy',        // 7: Level 5 The Galaxy
  'scene-letter',        // 8: Level 6 Personal Letter
  'scene-delete-joke',   // 9: Fake Delete Button
  'scene-achievement'    // 10: Final Achievement & Easter Eggs
];

window.currentSceneIndex = 0;
let gameInstance = null;
let galaxyInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  setupDevToolsDetection();
  setupGlobalControls();
  startBootSequence();
}

/* ==========================================================================
   GLOBAL CONTROLS & DEVTOOLS DETECTION
   ========================================================================== */
function setupGlobalControls() {
  const muteBtn = document.getElementById('sound-toggle-btn');
  if (muteBtn) {
    updateMuteBtnUI();
    muteBtn.addEventListener('click', () => {
      sound.resume();
      const isMuted = sound.toggleMute();
      updateMuteBtnUI();
    });
  }

  // First interaction anywhere unlocks Web Audio context
  const unlockAudio = () => {
    sound.resume();
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
  };
  window.addEventListener('click', unlockAudio);
  window.addEventListener('keydown', unlockAudio);
  window.addEventListener('touchstart', unlockAudio);
}

function updateMuteBtnUI() {
  const icon = document.getElementById('sound-toggle-icon');
  const text = document.getElementById('sound-toggle-text');
  if (icon && text) {
    if (sound.isMuted) {
      icon.textContent = '🔇';
      text.textContent = 'SOUND OFF';
    } else {
      icon.textContent = '🔊';
      text.textContent = 'SOUND ON';
    }
  }
}

function setupDevToolsDetection() {
  // Secret Console Welcome for CSE Student
  console.log(
    `%c
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   🚨 SYSTEM INSPECTION DETECTED — CSE RECOGNITION PROTOCOL 🚨  ║
║                                                                ║
║   Subject: HARSHITHA                                           ║
║   Threat Level: Extremely Curious & Sneaky                     ║
║                                                                ║
║   "Nice try inspecting the code! I knew you would do this 😂"  ║
║   Honestly... Respect. But no spoilers, okay? Enjoy the ride!  ║
║                                                                ║
║   — Built with ❤️ by your Best Friend                         ║
╚════════════════════════════════════════════════════════════════╝
`,
    'color: #00ff66; font-family: monospace; font-size: 13px; font-weight: bold; background: #0a0d14; padding: 10px; border-radius: 6px;'
  );

  // Keyboard shortcut listener for F12 or Inspect
  window.addEventListener('keydown', (e) => {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j'))) {
      triggerDevToolsAlert();
    }
  });

  // Window resize threshold check (docked DevTools - desktop only, prevent mobile false positives)
  let devToolsOpened = false;
  window.addEventListener('resize', () => {
    const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || ('ontouchstart' in window && window.innerWidth < 1024);
    if (isMobile) return; // Do not trigger on mobile/tablets where viewport resizes with keyboard/address bar

    const threshold = 180;
    // Only check if window is large desktop and difference is significant
    if (window.outerWidth > 900) {
      const widthDiff = window.outerWidth - window.innerWidth > threshold;
      const heightDiff = window.outerHeight - window.innerHeight > threshold;
      if ((widthDiff || heightDiff) && !devToolsOpened) {
        devToolsOpened = true;
        triggerDevToolsAlert();
      }
    }
  });
}

function triggerDevToolsAlert() {
  const modal = document.getElementById('devtools-modal');
  if (modal && modal.classList.contains('hidden')) {
    sound.playGlitch();
    modal.classList.remove('hidden');
    document.getElementById('devtools-close-btn').onclick = () => {
      sound.playSelect();
      modal.classList.add('hidden');
    };
  }
}

/* ==========================================================================
   SCENE ROUTING UTILITIES
   ========================================================================== */
function switchScene(nextSceneIndex) {
  SCENES.forEach((sceneId, idx) => {
    const el = document.getElementById(sceneId);
    if (!el) return;
    if (idx === nextSceneIndex) {
      el.classList.remove('hidden');
      el.classList.add('active-scene');
    } else {
      el.classList.add('hidden');
      el.classList.remove('active-scene');
    }
  });

  window.currentSceneIndex = nextSceneIndex;

  // Scene-specific hooks
  if (nextSceneIndex === 1) initPersonalityScene();
  if (nextSceneIndex === 2) initQuizScene();
  if (nextSceneIndex === 3) initMemoriesScene();
  if (nextSceneIndex === 4) initGameScene();
  if (nextSceneIndex === 5) initPasswordScene();
  if (nextSceneIndex === 6) initToneShiftScene();
  if (nextSceneIndex === 7) initGalaxyScene();
  if (nextSceneIndex === 8) initLetterScene();
  if (nextSceneIndex === 9) initDeleteJokeScene();
  if (nextSceneIndex === 10) initAchievementScene();
}

/* ==========================================================================
   SCENE 0: BOOT SEQUENCE
   ========================================================================== */
function startBootSequence() {
  sound.playBootBeep();
  const terminalText = document.getElementById('boot-terminal-content');
  const bootBtnContainer = document.getElementById('boot-button-container');

  const lines = [
    "╔══════════════════════════════════════╗",
    "║   🎉 HAPPY 19th BIRTHDAY EDITION 🎉  ║",
    "║       FRIENDSHIP OS v19.0            ║",
    "╚══════════════════════════════════════╝",
    "",
    "Loading celebration modules...",
    "[████████████████████] 100%",
    "",
    "Scanning memories database...",
    "Searching for VIP Birthday Queen...",
    "............................",
    "TARGET FOUND: HARSHITHA 🎂",
    "",
    `Name: ${CONFIG.target.name}`,
    `Age: ${CONFIG.target.age} (LEVEL 19 UNLOCKED! 🎈)`,
    `Occasion: ${CONFIG.target.occasion}`,
    `Occupation: ${CONFIG.target.occupation}`,
    `Threat Level: ${CONFIG.target.threatLevel}`,
    `Friendship Level: ████████████████████ (${CONFIG.target.friendshipLevel})`,
    "",
    `Status: ${CONFIG.target.title}`
  ];

  let currentLine = 0;

  function typeLine() {
    if (currentLine < lines.length) {
      const lineP = document.createElement('div');
      lineP.className = 'term-line';
      if (lines[currentLine].includes('TARGET FOUND') || lines[currentLine].includes('BEST FRIEND')) {
        lineP.classList.add('term-highlight');
      }
      lineP.textContent = lines[currentLine];
      terminalText.appendChild(lineP);
      terminalText.scrollTop = terminalText.scrollHeight;
      sound.playKeyClick();
      currentLine++;
      setTimeout(typeLine, lines[currentLine - 1] === "" ? 180 : 80);
    } else {
      // Completed typing boot sequence
      bootBtnContainer.classList.remove('hidden');
      const startBtn = document.getElementById('boot-start-btn');
      
      const handleStart = () => {
        sound.playSelect();
        switchScene(1);
        window.removeEventListener('keydown', handleKeyStart);
      };

      const handleKeyStart = (e) => {
        if (e.key === 'Enter') handleStart();
      };

      startBtn.addEventListener('click', handleStart);
      window.addEventListener('keydown', handleKeyStart);
    }
  }

  setTimeout(typeLine, 400);
}

/* ==========================================================================
   SCENE 1: SYSTEM PERSONALITY
   ========================================================================== */
function initPersonalityScene() {
  const dialogueContainer = document.getElementById('personality-messages');
  const actionBtn = document.getElementById('personality-proceed-btn');
  dialogueContainer.innerHTML = '';
  actionBtn.classList.add('hidden');

  const dialogues = [
    { text: "SYSTEM: Hello, Birthday Queen Harshitha! 👑🎂", delay: 800 },
    { text: "HAPPY 19TH BIRTHDAY! 🎉🎈", delay: 1100 },
    { text: "You have officially unlocked Level 19 in the game of life.", delay: 1200 },
    { text: "Another year older, zero percent more mature, and 1000% more chaotic! 😂", delay: 1400 },
    { text: "Today, this entire system runs in celebration mode just for you.", delay: 1200 },
    { text: "Let's see if the Birthday Girl can pass the 19th Birthday Evaluation! 👀", delay: 1000 }
  ];

  let idx = 0;
  function showNext() {
    if (idx < dialogues.length) {
      const p = document.createElement('div');
      p.className = 'personality-bubble';
      p.textContent = dialogues[idx].text;
      dialogueContainer.appendChild(p);
      sound.playKeyClick();
      setTimeout(showNext, dialogues[idx].delay);
      idx++;
    } else {
      actionBtn.classList.remove('hidden');
      actionBtn.onclick = () => {
        sound.playSelect();
        switchScene(2);
      };
    }
  }

  setTimeout(showNext, 400);
}

/* ==========================================================================
   SCENE 2: LEVEL 1 — FRIENDSHIP TEST (QUIZ)
   ========================================================================== */
let currentQuizIndex = 0;
let quizScore = 0;

function initQuizScene() {
  currentQuizIndex = 0;
  quizScore = 0;
  renderQuizQuestion();
}

function renderQuizQuestion() {
  const qData = CONFIG.quiz[currentQuizIndex];
  const qTitle = document.getElementById('quiz-question-title');
  const qCounter = document.getElementById('quiz-counter');
  const qProgress = document.getElementById('quiz-progress-bar');
  const optionsContainer = document.getElementById('quiz-options-container');
  const reactionBox = document.getElementById('quiz-reaction-box');
  const reactionText = document.getElementById('quiz-reaction-text');
  const nextBtn = document.getElementById('quiz-next-btn');

  reactionBox.classList.add('hidden');
  nextBtn.classList.add('hidden');

  qCounter.textContent = `QUESTION ${currentQuizIndex + 1} OF ${CONFIG.quiz.length}`;
  qProgress.style.width = `${((currentQuizIndex + 1) / CONFIG.quiz.length) * 100}%`;
  qTitle.textContent = qData.question;

  optionsContainer.innerHTML = '';

  qData.options.forEach((opt) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option-btn cyber-btn-secondary';
    btn.innerHTML = `<span class="opt-indicator">▸</span> ${opt.text}`;

    btn.onclick = () => {
      // Disable all options
      Array.from(optionsContainer.children).forEach(b => b.disabled = true);
      btn.classList.add('selected');

      // Check if it's the lie detected
      if (opt.reaction.includes('LIE DETECTED') || opt.reaction.includes('lie detected')) {
        sound.playBuzzer();
        reactionBox.classList.add('alarm-alert');
      } else {
        sound.playSelect();
        reactionBox.classList.remove('alarm-alert');
      }

      reactionText.textContent = opt.reaction;
      reactionBox.classList.remove('hidden');
      nextBtn.classList.remove('hidden');

      nextBtn.onclick = () => {
        sound.playSelect();
        currentQuizIndex++;
        if (currentQuizIndex < CONFIG.quiz.length) {
          renderQuizQuestion();
        } else {
          // Quiz Complete
          showQuizSummary();
        }
      };
    };

    optionsContainer.appendChild(btn);
  });
}

function showQuizSummary() {
  const container = document.getElementById('quiz-card');
  sound.playSuccess();
  container.innerHTML = `
    <div class="summary-wrapper">
      <div class="summary-icon">✅</div>
      <h3 class="cyber-heading">FRIENDSHIP CREDENTIALS: 100% VALIDATED</h3>
      <p class="summary-subtext">
        System diagnosis: Harshitha confirmed as an irreplaceable chaotic best friend.<br>
        Warning: Sarcasm and mutual brain damage detected at record levels.
      </p>
      <div class="summary-badge">ACCESS TO MEMORY ARCHIVES GRANTED 🔓</div>
      <button id="quiz-complete-proceed-btn" class="cyber-btn-primary mt-20">
        OPEN MEMORY DATABASE 📂
      </button>
    </div>
  `;

  document.getElementById('quiz-complete-proceed-btn').onclick = () => {
    sound.playSelect();
    switchScene(3);
  };
}

/* ==========================================================================
   SCENE 3: LEVEL 2 — MEMORY DATABASE
   ========================================================================== */
function initMemoriesScene() {
  const mapNodesContainer = document.getElementById('memory-map-nodes');
  const memoryGrid = document.getElementById('memory-files-grid');
  const proceedBtn = document.getElementById('memories-proceed-btn');

  // Render Memory Map Nodes
  mapNodesContainer.innerHTML = '';
  memoryGrid.innerHTML = '';

  CONFIG.memories.forEach((mem, idx) => {
    // 1. Grid Card
    const card = document.createElement('div');
    card.className = 'memory-file-item';
    card.style.borderColor = mem.accent + '66';
    card.innerHTML = `
      <div class="mem-header">
        <span class="mem-icon">${mem.icon}</span>
        <span class="mem-id">${mem.id}</span>
      </div>
      <div class="mem-title">${mem.title}</div>
      <div class="mem-date">${mem.date}</div>
      <div class="mem-tag" style="background:${mem.accent}22; color:${mem.accent};">${mem.tag}</div>
    `;
    card.onclick = () => openMemoryDetail(mem);
    memoryGrid.appendChild(card);

    // 2. Interactive Map Node
    const node = document.createElement('div');
    node.className = 'map-node';
    node.style.boxShadow = `0 0 15px ${mem.accent}66`;
    node.style.borderColor = mem.accent;
    node.innerHTML = `<span class="map-node-icon">${mem.icon}</span><span class="map-node-label">${mem.tag}</span>`;
    node.onclick = () => openMemoryDetail(mem);
    mapNodesContainer.appendChild(node);
  });

  proceedBtn.onclick = () => {
    sound.playSelect();
    switchScene(4);
  };
}

function openMemoryDetail(mem) {
  sound.playSelect();
  const modal = document.getElementById('memory-detail-modal');
  const titleEl = document.getElementById('modal-mem-title');
  const dateEl = document.getElementById('modal-mem-date');
  const tagEl = document.getElementById('modal-mem-tag');
  const summaryEl = document.getElementById('modal-mem-summary');
  const quoteEl = document.getElementById('modal-mem-quote');
  const analysisEl = document.getElementById('modal-mem-analysis');
  const visualEl = document.getElementById('modal-mem-visual');
  const closeBtn = document.getElementById('modal-mem-close-btn');

  titleEl.textContent = mem.title;
  dateEl.textContent = `${mem.date}`;
  tagEl.textContent = mem.tag;
  tagEl.style.color = mem.accent;
  summaryEl.textContent = mem.summary;
  quoteEl.textContent = `"${mem.quote}"`;
  analysisEl.textContent = mem.systemAnalysis;

  // Build high-aesthetic SVG memory polaroid artwork
  visualEl.innerHTML = createMemoryArtworkSVG(mem);

  modal.classList.remove('hidden');

  closeBtn.onclick = () => {
    sound.playSelect();
    modal.classList.add('hidden');
  };
}

function createMemoryArtworkSVG(mem) {
  // SVG Graphic representing the memory
  return `
    <div class="polaroid-wrapper">
      <div class="polaroid-card">
        <div class="polaroid-art-box" style="background: radial-gradient(circle, ${mem.accent}33 0%, #0a0d18 80%);">
          <div class="art-badge">${mem.icon}</div>
          <div class="art-caption">${mem.title}</div>
        </div>
        <div class="polaroid-label">${mem.date} • ${CONFIG.target.name}</div>
      </div>
    </div>
  `;
}

/* ==========================================================================
   SCENE 4: LEVEL 3 — THE FRIENDSHIP GAME
   ========================================================================== */
function initGameScene() {
  if (!gameInstance) {
    gameInstance = new FriendshipGame('game-canvas', () => {
      // When mini-game completes, proceed to corrupted file
      switchScene(5);
    });
  }
  gameInstance.start();
}

/* ==========================================================================
   SCENE 5: LEVEL 4 — CORRUPTED FILE & SECRET PASSWORD
   ========================================================================== */
let currentHintIdx = 0;

function initPasswordScene() {
  sound.playGlitch();
  currentHintIdx = 0;

  const hintBox = document.getElementById('password-hint-box');
  const hintText = document.getElementById('password-hint-text');
  const hintBtn = document.getElementById('password-request-hint-btn');
  const roastBox = document.getElementById('password-roast-box');
  const roastText = document.getElementById('password-roast-text');
  const submitBtn = document.getElementById('password-submit-btn');
  const inputEl = document.getElementById('password-input');

  hintBox.classList.add('hidden');
  roastBox.classList.add('hidden');
  inputEl.value = '';
  inputEl.focus();

  hintBtn.onclick = () => {
    sound.playSelect();
    const hints = CONFIG.passwordLevel.hints;
    hintText.textContent = hints[currentHintIdx % hints.length];
    currentHintIdx++;
    hintBox.classList.remove('hidden');
  };

  const handleVerify = () => {
    const val = inputEl.value.trim().toUpperCase();
    if (!val) {
      sound.playBuzzer();
      return;
    }

    const accepted = CONFIG.passwordLevel.acceptedPasswords.map(p => p.toUpperCase());

    if (accepted.includes(val)) {
      // Correct!
      sound.playSuccess();
      roastBox.classList.add('hidden');
      
      const successBox = document.getElementById('password-success-box');
      successBox.classList.remove('hidden');
      inputEl.disabled = true;
      submitBtn.disabled = true;

      setTimeout(() => {
        switchScene(6); // The Tone Shift
      }, 1600);
    } else {
      // Wrong! Roast her
      sound.playBuzzer();
      const roasts = CONFIG.passwordLevel.roastAttempts;
      const roast = roasts[Math.floor(Math.random() * roasts.length)];
      roastText.textContent = roast;
      roastBox.classList.remove('hidden');
      inputEl.select();
    }
  };

  submitBtn.onclick = handleVerify;
  inputEl.onkeydown = (e) => {
    if (e.key === 'Enter') handleVerify();
  };
}

/* ==========================================================================
   SCENE 6: THE TONE SHIFT (EMOTIONAL TURNING POINT)
   ========================================================================== */
function initToneShiftScene() {
  const container = document.getElementById('tone-shift-text-container');
  const proceedBtn = document.getElementById('tone-shift-proceed-btn');
  container.innerHTML = '';
  proceedBtn.classList.add('hidden');

  const statements = [
    { text: "You found it.", delay: 1400 },
    { text: "The file wasn't corrupted.", delay: 2000 },
    { text: "Nineteen years ago today, the world became a whole lot brighter.", delay: 2400 },
    { text: "And out of 8 billion people on this planet...", delay: 2200 },
    { text: "I got blessed with the most wonderful best friend.", delay: 2400 },
    { text: "Happy 19th Birthday, Harshitha. ✨🎂", delay: 2200 }
  ];

  let i = 0;
  function showNextStatement() {
    if (i < statements.length) {
      const p = document.createElement('p');
      p.className = 'tone-statement fade-in';
      p.textContent = statements[i].text;
      container.appendChild(p);
      setTimeout(showNextStatement, statements[i].delay);
      i++;
    } else {
      proceedBtn.classList.remove('hidden');
      proceedBtn.onclick = () => {
        sound.playSelect();
        sound.startAmbient(); // Start celestial background pad
        switchScene(7); // Galaxy
      };
    }
  }

  setTimeout(showNextStatement, 800);
}

/* ==========================================================================
   SCENE 7: LEVEL 5 — THE GALAXY
   ========================================================================== */
function initGalaxyScene() {
  sound.startAmbient();
  if (!galaxyInstance) {
    galaxyInstance = new GalaxyCanvas('galaxy-canvas', () => {
      // Transition to Letter
      switchScene(8);
    });
  }
  galaxyInstance.start();
}

/* ==========================================================================
   SCENE 8: LEVEL 6 — THE LETTER (/HARSHITHA/thank_you.txt)
   ========================================================================== */
function initLetterScene() {
  sound.startAmbient();
  const letterBody = document.getElementById('letter-content');
  const proceedBtn = document.getElementById('letter-proceed-btn');
  proceedBtn.classList.remove('hidden');

  letterBody.innerHTML = `
    <div class="letter-greeting">${CONFIG.letter.greeting}</div>
    ${CONFIG.letter.paragraphs.map(p => `<p class="letter-para">${p}</p>`).join('')}
    <div class="letter-signoff">
      <div class="signoff-text">${CONFIG.letter.signoff}</div>
      <div class="signoff-date">${CONFIG.letter.date}</div>
    </div>
  `;

  proceedBtn.onclick = () => {
    sound.playSelect();
    switchScene(9); // Fake delete button joke
  };
}

/* ==========================================================================
   SCENE 9: THE FAKE DELETE BUTTON JOKE
   ========================================================================== */
function initDeleteJokeScene() {
  const deleteBtn = document.getElementById('delete-friendship-btn');
  const keepBtn = document.getElementById('keep-friendship-btn');
  const progressModal = document.getElementById('delete-progress-modal');
  const progressBar = document.getElementById('delete-progress-bar');
  const progressPercent = document.getElementById('delete-progress-percent');
  const errorModal = document.getElementById('delete-error-modal');
  const errorActionBtn = document.getElementById('delete-error-action-btn');

  progressModal.classList.add('hidden');
  errorModal.classList.add('hidden');

  keepBtn.onclick = () => {
    sound.playSelect();
    switchScene(10);
  };

  deleteBtn.onclick = () => {
    progressModal.classList.remove('hidden');
    sound.playSiren();
    let percent = 0;

    const interval = setInterval(() => {
      percent += Math.floor(Math.random() * 15) + 10;
      if (percent > 100) percent = 100;
      progressBar.style.width = `${percent}%`;
      progressPercent.textContent = `${percent}%`;

      if (percent >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          progressModal.classList.add('hidden');
          sound.playBuzzer();
          errorModal.classList.remove('hidden');
        }, 500);
      }
    }, 280);
  };

  errorActionBtn.onclick = () => {
    sound.playAchievementFanfare();
    errorModal.classList.add('hidden');
    switchScene(10);
  };
}

/* ==========================================================================
   SCENE 10: FINAL ACHIEVEMENT & EASTER EGGS
   ========================================================================== */
function initAchievementScene() {
  sound.playBirthdayMelody();
  setTimeout(() => {
    sound.playAchievementFanfare();
  }, 600);
  startConfetti();

  const secretBtn = document.getElementById('secret-easter-egg-btn');
  const secretModal = document.getElementById('secret-modal');
  const secretCloseBtn = document.getElementById('secret-modal-close-btn');

  secretBtn.onclick = () => {
    sound.playSelect();
    secretModal.classList.remove('hidden');
  };

  secretCloseBtn.onclick = () => {
    sound.playSelect();
    secretModal.classList.add('hidden');
  };
}

/* ==========================================================================
   CELEBRATION CONFETTI
   ========================================================================== */
function startConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const confettiPieces = [];
  const colors = ['#00f3ff', '#ff007f', '#ffaa00', '#00ff88', '#bd00ff', '#ffffff'];

  for (let i = 0; i < 120; i++) {
    confettiPieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: Math.random() * 3 + 2,
      speedX: (Math.random() - 0.5) * 2,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 8
    });
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    confettiPieces.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotationSpeed;

      if (p.y > canvas.height) {
        p.y = -10;
        p.x = Math.random() * canvas.width;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });
    requestAnimationFrame(render);
  }

  render();
}
