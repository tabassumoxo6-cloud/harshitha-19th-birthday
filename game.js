/**
 * HARSHITHA.exe — Level 3: The Friendship Game
 * Canvas-based top-down adventure mini-game with NPCs, fragments, and responsive controls!
 */

class FriendshipGame {
  constructor(canvasId, onCompleteCallback) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.onComplete = onCompleteCallback;

    this.width = CONFIG.game.worldWidth;
    this.height = CONFIG.game.worldHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Player State
    this.player = {
      x: 450,
      y: 280,
      radius: 16,
      speed: 4.5,
      direction: 'down',
      isMoving: false,
      stepCount: 0
    };
    this.targetPos = null;

    // Input State
    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false,
      action: false
    };

    // Game Entities
    this.fragments = JSON.parse(JSON.stringify(CONFIG.game.fragments)).map(f => ({
      ...f,
      collected: false,
      hoverOffset: Math.random() * Math.PI * 2
    }));

    this.npcs = JSON.parse(JSON.stringify(CONFIG.game.npcs));
    this.collectedCount = 0;
    this.totalFragments = this.fragments.length;

    // Particles for sparkles
    this.particles = [];

    // Obstacles
    this.obstacles = [
      // Central Computer Cluster
      { x: 410, y: 190, w: 80, h: 50, label: "CSE LAB SERVER", icon: "🖥️" },
      // Cafe tables
      { x: 220, y: 320, w: 60, h: 60, label: "CANTEEN TABLE", icon: "☕" },
      { x: 620, y: 320, w: 60, h: 60, label: "LIBRARY TABLE", icon: "📚" },
      // Trees / Plants
      { x: 80, y: 80, w: 50, h: 50, icon: "🪴" },
      { x: 770, y: 80, w: 50, h: 50, icon: "🪴" },
      { x: 80, y: 520, w: 50, h: 50, icon: "🪴" },
      { x: 770, y: 520, w: 50, h: 50, icon: "🪴" }
    ];

    this.activeNpc = null;
    this.isPaused = false;
    this.animId = null;

    this.setupListeners();
  }

  setupListeners() {
    // Keyboard handlers with dual e.code & e.key checks + preventDefault
    window.addEventListener('keydown', (e) => {
      if (window.currentSceneIndex !== 4) return;
      const k = e.key ? e.key.toLowerCase() : '';
      const c = e.code || '';

      if (c === 'ArrowUp' || c === 'KeyW' || k === 'w' || k === 'arrowup') {
        this.keys.up = true;
        this.targetPos = null;
        e.preventDefault();
      }
      if (c === 'ArrowDown' || c === 'KeyS' || k === 's' || k === 'arrowdown') {
        this.keys.down = true;
        this.targetPos = null;
        e.preventDefault();
      }
      if (c === 'ArrowLeft' || c === 'KeyA' || k === 'a' || k === 'arrowleft') {
        this.keys.left = true;
        this.targetPos = null;
        e.preventDefault();
      }
      if (c === 'ArrowRight' || c === 'KeyD' || k === 'd' || k === 'arrowright') {
        this.keys.right = true;
        this.targetPos = null;
        e.preventDefault();
      }
      if (c === 'Space' || c === 'KeyE' || k === 'e' || k === 'enter' || k === ' ') {
        this.interactNearest();
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      const k = e.key ? e.key.toLowerCase() : '';
      const c = e.code || '';

      if (c === 'ArrowUp' || c === 'KeyW' || k === 'w' || k === 'arrowup') this.keys.up = false;
      if (c === 'ArrowDown' || c === 'KeyS' || k === 's' || k === 'arrowdown') this.keys.down = false;
      if (c === 'ArrowLeft' || c === 'KeyA' || k === 'a' || k === 'arrowleft') this.keys.left = false;
      if (c === 'ArrowRight' || c === 'KeyD' || k === 'd' || k === 'arrowright') this.keys.right = false;
    });

    // Reset movement keys if window loses focus
    window.addEventListener('blur', () => {
      this.keys.up = false;
      this.keys.down = false;
      this.keys.left = false;
      this.keys.right = false;
      this.targetPos = null;
    });

    // Tap/Click on canvas to walk directly to point
    const handleCanvasPointer = (e) => {
      if (window.currentSceneIndex !== 4 || this.isPaused) return;
      const rect = this.canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const scaleX = this.width / rect.width;
      const scaleY = this.height / rect.height;
      const targetX = (e.clientX - rect.left) * scaleX;
      const targetY = (e.clientY - rect.top) * scaleY;
      this.targetPos = { x: targetX, y: targetY };
    };

    this.canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      handleCanvasPointer(e);
    });

    this.canvas.addEventListener('pointermove', (e) => {
      if (e.buttons === 1) {
        e.preventDefault();
        handleCanvasPointer(e);
      }
    });

    // Touch D-Pad setup
    const bindTouchBtn = (id, direction) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      const start = (e) => {
        e.preventDefault();
        this.targetPos = null;
        this.keys[direction] = true;
      };
      const stop = (e) => {
        e.preventDefault();
        this.keys[direction] = false;
      };
      btn.addEventListener('touchstart', start, { passive: false });
      btn.addEventListener('touchend', stop, { passive: false });
      btn.addEventListener('mousedown', start);
      btn.addEventListener('mouseup', stop);
      btn.addEventListener('mouseleave', stop);
    };

    bindTouchBtn('dpad-up', 'up');
    bindTouchBtn('dpad-down', 'down');
    bindTouchBtn('dpad-left', 'left');
    bindTouchBtn('dpad-right', 'right');

    const actionBtn = document.getElementById('dpad-action');
    if (actionBtn) {
      actionBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.interactNearest();
      });
      actionBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.interactNearest();
      }, { passive: false });
    }
  }

  start() {
    this.stop();
    this.isPaused = false;
    this.updateHUD();
    this.loop();
  }

  stop() {
    this.isPaused = true;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  pause() {
    this.isPaused = true;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  resume() {
    if (this.isPaused) {
      this.isPaused = false;
      if (!this.animId) {
        this.loop();
      }
    }
  }

  interactNearest() {
    if (this.isPaused) return;

    // Check nearest NPC
    for (const npc of this.npcs) {
      const dist = Math.hypot(this.player.x - npc.x, this.player.y - npc.y);
      if (dist < 55) {
        sound.playDialogueChirp();
        this.showNpcDialogue(npc);
        return;
      }
    }
  }

  showNpcDialogue(npc) {
    this.pause();
    const modal = document.getElementById('game-dialogue-modal');
    const title = document.getElementById('dialogue-title');
    const text = document.getElementById('dialogue-text');
    const closeBtn = document.getElementById('dialogue-close-btn');

    title.innerHTML = `${npc.icon} ${npc.name}`;
    text.innerHTML = npc.dialogue.map(line => `<p class="dialogue-line">${line}</p>`).join('');
    modal.classList.remove('hidden');

    const handleClose = () => {
      sound.playSelect();
      modal.classList.add('hidden');
      closeBtn.removeEventListener('click', handleClose);
      window.removeEventListener('keydown', handleKeyClose);
      this.resume();
    };

    const handleKeyClose = (e) => {
      const k = e.key ? e.key.toLowerCase() : '';
      if (k === 'e' || k === 'enter' || k === 'escape' || k === ' ') {
        e.preventDefault();
        handleClose();
      }
    };

    closeBtn.addEventListener('click', handleClose);
    window.addEventListener('keydown', handleKeyClose);
  }

  showFragmentModal(fragment) {
    this.pause();
    sound.playPickup();

    const modal = document.getElementById('game-fragment-modal');
    const nameEl = document.getElementById('frag-modal-name');
    const titleEl = document.getElementById('frag-modal-title');
    const storyEl = document.getElementById('frag-modal-story');
    const countEl = document.getElementById('frag-modal-count');
    const continueBtn = document.getElementById('frag-continue-btn');

    nameEl.innerHTML = `${fragment.icon} FRAGMENT: ${fragment.name}`;
    titleEl.textContent = fragment.title;
    storyEl.textContent = `"${fragment.story}"`;
    countEl.textContent = `Fragments Collected: ${this.collectedCount} / ${this.totalFragments}`;

    modal.classList.remove('hidden');

    const handleContinue = () => {
      sound.playSelect();
      modal.classList.add('hidden');
      continueBtn.removeEventListener('click', handleContinue);
      window.removeEventListener('keydown', handleKeyContinue);

      // Check if all collected
      if (this.collectedCount >= this.totalFragments) {
        setTimeout(() => {
          this.triggerCompletion();
        }, 300);
      } else {
        this.resume();
      }
    };

    const handleKeyContinue = (e) => {
      const k = e.key ? e.key.toLowerCase() : '';
      if (k === 'enter' || k === 'escape' || k === ' ' || k === 'e') {
        e.preventDefault();
        handleContinue();
      }
    };

    continueBtn.addEventListener('click', handleContinue);
    window.addEventListener('keydown', handleKeyContinue);
  }

  triggerCompletion() {
    this.stop();
    sound.playSuccess();
    const banner = document.getElementById('game-complete-banner');
    if (banner) {
      banner.classList.remove('hidden');
      const portalBtn = document.getElementById('game-portal-btn');
      portalBtn.onclick = () => {
        sound.playSelect();
        banner.classList.add('hidden'); // Close modal overlay
        if (this.onComplete) this.onComplete();
      };
    } else {
      if (this.onComplete) this.onComplete();
    }
  }

  updateHUD() {
    const counter = document.getElementById('game-fragment-counter');
    if (counter) {
      counter.textContent = `${this.collectedCount} / ${this.totalFragments}`;
    }
  }

  update() {
    if (this.isPaused) return;

    let dx = 0;
    let dy = 0;

    if (this.keys.up) dy -= this.player.speed;
    if (this.keys.down) dy += this.player.speed;
    if (this.keys.left) dx -= this.player.speed;
    if (this.keys.right) dx += this.player.speed;

    // Direct click/tap movement if no keyboard input
    if (dx === 0 && dy === 0 && this.targetPos) {
      const dist = Math.hypot(this.targetPos.x - this.player.x, this.targetPos.y - this.player.y);
      if (dist > 6) {
        dx = ((this.targetPos.x - this.player.x) / dist) * this.player.speed;
        dy = ((this.targetPos.y - this.player.y) / dist) * this.player.speed;
      } else {
        this.targetPos = null;
      }
    }

    // Diagonal speed normalization
    if (dx !== 0 && dy !== 0) {
      dx *= 0.7071;
      dy *= 0.7071;
    }

    if (dx !== 0 || dy !== 0) {
      this.player.isMoving = true;
      this.player.stepCount += 0.2;
      if (Math.abs(dx) > Math.abs(dy)) {
        this.player.direction = dx > 0 ? 'right' : 'left';
      } else {
        this.player.direction = dy > 0 ? 'down' : 'up';
      }
    } else {
      this.player.isMoving = false;
    }

    // Try moving X
    const newX = this.player.x + dx;
    if (newX >= 25 && newX <= this.width - 25 && !this.checkCollision(newX, this.player.y)) {
      this.player.x = newX;
    }

    // Try moving Y
    const newY = this.player.y + dy;
    if (newY >= 25 && newY <= this.height - 25 && !this.checkCollision(this.player.x, newY)) {
      this.player.y = newY;
    }

    // Check Fragment pickups
    this.fragments.forEach(frag => {
      frag.hoverOffset += 0.05;
      if (!frag.collected) {
        const dist = Math.hypot(this.player.x - frag.x, this.player.y - frag.y);
        if (dist < 38) {
          frag.collected = true;
          this.collectedCount++;
          this.updateHUD();
          this.spawnSparkles(frag.x, frag.y, frag.color);
          this.showFragmentModal(frag);
        }
      }
    });

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.02;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Periodic sparkle near uncollected fragments
    if (Math.random() < 0.2) {
      const uncollected = this.fragments.filter(f => !f.collected);
      if (uncollected.length > 0) {
        const pick = uncollected[Math.floor(Math.random() * uncollected.length)];
        this.particles.push({
          x: pick.x + (Math.random() - 0.5) * 20,
          y: pick.y + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 1,
          vy: -Math.random() * 1.5,
          color: pick.color,
          alpha: 0.8,
          size: 2.5
        });
      }
    }
  }

  checkCollision(x, y) {
    const r = this.player.radius;
    for (const obs of this.obstacles) {
      if (
        x + r > obs.x &&
        x - r < obs.x + obs.w &&
        y + r > obs.y &&
        y - r < obs.y + obs.h
      ) {
        return true;
      }
    }
    return false;
  }

  spawnSparkles(x, y, color) {
    for (let i = 0; i < 28; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: color || '#00f3ff',
        alpha: 1,
        size: 3 + Math.random() * 3
      });
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Floor Grid / Campus tiles
    this.drawFloor();

    // Draw Obstacles
    this.drawObstacles();

    // Draw NPCs
    this.drawNPCs();

    // Draw Fragments
    this.drawFragments();

    // Draw Player
    this.drawPlayer();

    // Draw Particles
    this.drawParticles();

    // Draw Proximity Prompts
    this.drawProximityPrompts();
  }

  drawFloor() {
    // Cyberpunk campus tile pattern
    this.ctx.fillStyle = '#0a0d14';
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.strokeStyle = '#121824';
    this.ctx.lineWidth = 1;
    const tileSize = 50;
    for (let x = 0; x < this.width; x += tileSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }
    for (let y = 0; y < this.height; y += tileSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
      this.ctx.stroke();
    }

    // Outer cyber border
    this.ctx.strokeStyle = '#00f3ff22';
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(10, 10, this.width - 20, this.height - 20);

    // Subtle label in center
    this.ctx.fillStyle = '#ffd70015';
    this.ctx.font = '700 24px "Fira Code", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText("🎉 HAPPY 19th BIRTHDAY HARSHITHA 🎉", this.width / 2, this.height / 2 - 80);
    this.ctx.fillStyle = '#ffffff08';
    this.ctx.font = '700 16px "Fira Code", monospace';
    this.ctx.fillText("LEVEL 19 ARCHIVE v19.0", this.width / 2, this.height / 2 - 50);
  }

  drawObstacles() {
    this.obstacles.forEach(obs => {
      // Glow shadow
      this.ctx.fillStyle = '#161d2d';
      this.ctx.fillRect(obs.x, obs.y, obs.w, obs.h);

      this.ctx.strokeStyle = '#00f3ff44';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);

      // Icon & Label
      this.ctx.font = '22px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(obs.icon, obs.x + obs.w / 2, obs.y + obs.h / 2 - (obs.label ? 6 : 0));

      if (obs.label) {
        this.ctx.fillStyle = '#00ff88bb';
        this.ctx.font = '9px "Fira Code", monospace';
        this.ctx.fillText(obs.label, obs.x + obs.w / 2, obs.y + obs.h - 8);
      }
    });
  }

  drawNPCs() {
    this.npcs.forEach(npc => {
      // NPC Base Shadow
      this.ctx.fillStyle = '#00000055';
      this.ctx.beginPath();
      this.ctx.ellipse(npc.x, npc.y + 14, 18, 8, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // NPC Body / Aura
      this.ctx.fillStyle = '#1a233a';
      this.ctx.beginPath();
      this.ctx.arc(npc.x, npc.y, 16, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.strokeStyle = '#ff007f';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      // NPC Icon
      this.ctx.font = '18px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(npc.icon, npc.x, npc.y);

      // Name tag
      this.ctx.fillStyle = '#ffffffdd';
      this.ctx.font = '10px "Fira Code", monospace';
      this.ctx.fillText(npc.name, npc.x, npc.y - 24);
    });
  }

  drawFragments() {
    this.fragments.forEach(frag => {
      if (frag.collected) return;

      const floatY = frag.y + Math.sin(frag.hoverOffset) * 6;

      // Glow Aura
      const grad = this.ctx.createRadialGradient(frag.x, floatY, 4, frag.x, floatY, 26);
      grad.addColorStop(0, frag.color);
      grad.addColorStop(1, 'transparent');
      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(frag.x, floatY, 26, 0, Math.PI * 2);
      this.ctx.fill();

      // Outer pulsing ring
      this.ctx.strokeStyle = frag.color;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(frag.x, floatY, 15 + Math.sin(frag.hoverOffset * 1.5) * 3, 0, Math.PI * 2);
      this.ctx.stroke();

      // Core Fragment Icon
      this.ctx.font = '18px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(frag.icon, frag.x, floatY);

      // Label below
      this.ctx.fillStyle = frag.color;
      this.ctx.font = '700 10px "Fira Code", monospace';
      this.ctx.fillText(frag.name, frag.x, floatY + 26);
    });
  }

  drawPlayer() {
    const p = this.player;
    const bounce = p.isMoving ? Math.sin(p.stepCount) * 3 : 0;

    // Shadow
    this.ctx.fillStyle = '#00000066';
    this.ctx.beginPath();
    this.ctx.ellipse(p.x, p.y + 16, 16, 6, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Body
    this.ctx.fillStyle = '#00f3ff';
    this.ctx.beginPath();
    this.ctx.arc(p.x, p.y + bounce, 15, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2.5;
    this.ctx.stroke();

    // Cute Player Face
    this.ctx.fillStyle = '#0a0d14';
    if (p.direction === 'down') {
      // Eyes
      this.ctx.beginPath();
      this.ctx.arc(p.x - 4, p.y + bounce - 1, 2.5, 0, Math.PI * 2);
      this.ctx.arc(p.x + 4, p.y + bounce - 1, 2.5, 0, Math.PI * 2);
      this.ctx.fill();
      // Smile
      this.ctx.strokeStyle = '#0a0d14';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y + bounce + 4, 3, 0, Math.PI);
      this.ctx.stroke();
    } else if (p.direction === 'up') {
      // Back of head / hair accent
      this.ctx.fillStyle = '#0099cc';
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y + bounce - 4, 6, 0, Math.PI * 2);
      this.ctx.fill();
    } else if (p.direction === 'left') {
      this.ctx.beginPath();
      this.ctx.arc(p.x - 6, p.y + bounce - 1, 2.5, 0, Math.PI * 2);
      this.ctx.fill();
    } else if (p.direction === 'right') {
      this.ctx.beginPath();
      this.ctx.arc(p.x + 6, p.y + bounce - 1, 2.5, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Crown emoji on birthday girl
    this.ctx.font = '14px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText("👑", p.x, p.y + bounce - 28);

    // Player Name Tag: "HARSHITHA (19)"
    this.ctx.fillStyle = '#ffd700';
    this.ctx.font = '700 11px "Fira Code", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText("HARSHITHA 🎂", p.x, p.y + bounce - 14);
  }

  drawParticles() {
    this.particles.forEach(p => {
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.alpha;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalAlpha = 1.0;
  }

  drawProximityPrompts() {
    // If close to NPC, draw "[ E ] TALK" prompt
    this.npcs.forEach(npc => {
      const dist = Math.hypot(this.player.x - npc.x, this.player.y - npc.y);
      if (dist < 55) {
        this.ctx.fillStyle = '#ff007f';
        this.ctx.fillRect(npc.x - 30, npc.y - 45, 60, 18);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '700 10px "Fira Code", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText("TALK [E]", npc.x, npc.y - 33);
      }
    });
  }

  loop() {
    if (this.isPaused) {
      this.animId = null;
      return;
    }
    this.update();
    this.draw();
    this.animId = requestAnimationFrame(() => this.loop());
  }
}
