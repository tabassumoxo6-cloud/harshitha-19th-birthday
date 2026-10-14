/**
 * HARSHITHA.exe — Level 5: The Galaxy & Memory Constellations
 * 3D Particle Galaxy Canvas with Interactive Constellations and Celestial Name Reveal!
 */

class GalaxyCanvas {
  constructor(canvasId, onCompleteCallback) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.onComplete = onCompleteCallback;

    this.stars = [];
    this.starCount = 1200;
    this.fov = 400;

    // Rotation angles
    this.rotX = 0.2;
    this.rotY = 0;
    this.targetRotX = 0.2;
    this.targetRotY = 0;

    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;

    // State modes: 'galaxy' -> 'text_reveal'
    this.mode = 'galaxy';
    this.namePoints = [];
    this.bestFriendPoints = [];

    // Constellations
    this.constellations = JSON.parse(JSON.stringify(CONFIG.constellations));

    this.animId = null;
    this.running = false;

    this.resize();
    this.initStars();
    this.generateNameCoordinates();
    this.setupListeners();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.cx = this.width / 2;
    this.cy = this.height / 2;
    // Responsive FOV based on screen width
    this.fov = Math.min(400, Math.max(260, this.width * 0.75));
  }

  initStars() {
    this.stars = [];
    for (let i = 0; i < this.starCount; i++) {
      // Spiral Galaxy distribution
      const arm = Math.floor(Math.random() * 3);
      const armAngle = (arm * 2 * Math.PI) / 3;
      const distance = Math.pow(Math.random(), 0.6) * 450 + 20;
      const spiralAngle = distance * 0.015 + armAngle + (Math.random() - 0.5) * 0.5;

      const x = Math.cos(spiralAngle) * distance;
      const z = Math.sin(spiralAngle) * distance;
      const y = (Math.random() - 0.5) * 60 * Math.exp(-distance / 300);

      const colorHues = [180, 280, 320, 45]; // Cyan, Purple, Pink, Gold
      const hue = colorHues[Math.floor(Math.random() * colorHues.length)];

      this.stars.push({
        origX: x,
        origY: y,
        origZ: z,
        x: x,
        y: y,
        z: z,
        targetX: x,
        targetY: y,
        targetZ: z,
        size: Math.random() * 2 + 0.8,
        hue: hue,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.03 + Math.random() * 0.05,
        isConstellationStar: false
      });
    }
  }

  generateNameCoordinates() {
    // Generate star coordinates spelling "HAPPY 19TH", "HARSHITHA", and "BEST FRIEND"
    const charMaps = {
      H: [ [0,0],[0,1],[0,2],[0,3],[0,4],[2,0],[2,1],[2,2],[2,3],[2,4],[1,2] ],
      A: [ [0,1],[0,2],[0,3],[0,4],[2,1],[2,2],[2,3],[2,4],[1,0],[1,2] ],
      R: [ [0,0],[0,1],[0,2],[0,3],[0,4],[1,0],[2,0],[2,1],[1,2],[0,2],[1,3],[2,4] ],
      S: [ [0,0],[1,0],[2,0],[0,1],[0,2],[1,2],[2,2],[2,3],[0,4],[1,4],[2,4] ],
      I: [ [0,0],[1,0],[2,0],[1,1],[1,2],[1,3],[0,4],[1,4],[2,4] ],
      T: [ [0,0],[1,0],[2,0],[1,1],[1,2],[1,3],[1,4] ],
      B: [ [0,0],[0,1],[0,2],[0,3],[0,4],[1,0],[2,1],[1,2],[2,3],[1,4],[0,2] ],
      E: [ [0,0],[0,1],[0,2],[0,3],[0,4],[1,0],[2,0],[1,2],[1,4],[2,4] ],
      F: [ [0,0],[0,1],[0,2],[0,3],[0,4],[1,0],[2,0],[1,2] ],
      N: [ [0,0],[0,1],[0,2],[0,3],[0,4],[1,2],[2,0],[2,1],[2,2],[2,3],[2,4] ],
      D: [ [0,0],[0,1],[0,2],[0,3],[0,4],[1,0],[2,1],[2,2],[2,3],[1,4] ],
      P: [ [0,0],[0,1],[0,2],[0,3],[0,4],[1,0],[2,0],[2,1],[1,2],[0,2] ],
      Y: [ [0,0],[0,1],[2,0],[2,1],[1,2],[1,3],[1,4] ],
      1: [ [0,1],[1,0],[1,1],[1,2],[1,3],[1,4],[0,4],[2,4] ],
      9: [ [0,0],[1,0],[2,0],[0,1],[2,1],[0,2],[1,2],[2,2],[2,3],[1,4],[0,4] ]
    };

    // 1. Build HAPPY 19TH
    const word0 = "HAPPY 19TH";
    const totalW0 = word0.length * 28;
    let startX0 = -totalW0 / 2;
    this.bdayPoints = [];
    for (let c of word0) {
      if (c === ' ') {
        startX0 += 20;
        continue;
      }
      const map = charMaps[c] || charMaps['H'];
      map.forEach(([px, py]) => {
        this.bdayPoints.push({
          x: startX0 + px * 9,
          y: -130 + py * 11,
          z: 0
        });
      });
      startX0 += 28;
    }

    // 2. Build HARSHITHA
    const word1 = "HARSHITHA";
    const letterWidth = 32;
    const spacing = 10;
    const totalW1 = word1.length * (letterWidth + spacing);
    const startX1 = -totalW1 / 2;

    this.namePoints = [];
    let curX = startX1;
    for (let c of word1) {
      const map = charMaps[c] || charMaps['H'];
      map.forEach(([px, py]) => {
        this.namePoints.push({
          x: curX + px * 12,
          y: -10 + py * 14,
          z: 0
        });
      });
      curX += letterWidth + spacing;
    }

    // 3. Build BEST FRIEND
    const word2 = "BEST FRIEND";
    const totalW2 = word2.length * 28;
    let startX2 = -totalW2 / 2;
    this.bestFriendPoints = [];
    for (let c of word2) {
      if (c === ' ') {
        startX2 += 22;
        continue;
      }
      const map = charMaps[c] || charMaps['E'];
      map.forEach(([px, py]) => {
        this.bestFriendPoints.push({
          x: startX2 + px * 9,
          y: 110 + py * 11,
          z: 0
        });
      });
      startX2 += 28;
    }
  }

  setupListeners() {
    window.addEventListener('resize', () => this.resize());

    // Mouse / Touch Drag to Rotate Galaxy
    const onStart = (x, y) => {
      this.isDragging = true;
      this.lastMouseX = x;
      this.lastMouseY = y;
    };
    const onMove = (x, y) => {
      if (!this.isDragging) return;
      const dx = x - this.lastMouseX;
      const dy = y - this.lastMouseY;
      this.targetRotY += dx * 0.005;
      this.targetRotX += dy * 0.005;
      this.lastMouseX = x;
      this.lastMouseY = y;
    };
    const onEnd = () => {
      this.isDragging = false;
    };

    this.canvas.addEventListener('mousedown', (e) => onStart(e.clientX, e.clientY));
    window.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', onEnd);

    let touchStartX = 0;
    let touchStartY = 0;
    let hasTouchMoved = false;

    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        hasTouchMoved = false;
        onStart(touchStartX, touchStartY);
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && this.isDragging) {
        const curX = e.touches[0].clientX;
        const curY = e.touches[0].clientY;
        if (Math.hypot(curX - touchStartX, curY - touchStartY) > 5) {
          hasTouchMoved = true;
        }
        onMove(curX, curY);
      }
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      onEnd();
      // If user tapped without dragging, check for constellation click
      if (!hasTouchMoved && this.mode !== 'text_reveal') {
        const rect = this.canvas.getBoundingClientRect();
        this.checkConstellationClick(touchStartX - rect.left, touchStartY - rect.top);
      }
    });

    // Click detector for constellations (mouse)
    this.canvas.addEventListener('click', (e) => {
      if (this.mode === 'text_reveal') return;
      const rect = this.canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      this.checkConstellationClick(clickX, clickY);
    });

    // Reveal Button handler
    const revealBtn = document.getElementById('galaxy-reveal-btn');
    if (revealBtn) {
      revealBtn.addEventListener('click', () => {
        sound.playSuccess();
        this.transitionToTextReveal();
      });
    }

    // Next button handler
    const letterBtn = document.getElementById('galaxy-next-btn');
    if (letterBtn) {
      letterBtn.addEventListener('click', () => {
        sound.playSelect();
        this.stop();
        if (this.onComplete) this.onComplete();
      });
    }
  }

  checkConstellationClick(cx, cy) {
    for (const c of this.constellations) {
      // Find constellation center in screen space
      let avgX = 0, avgY = 0, avgZ = 0;
      c.stars.forEach(s => {
        avgX += s.x;
        avgY += s.y;
      });
      avgX /= c.stars.length;
      avgY /= c.stars.length;

      // Project center
      const proj = this.project3D(avgX, avgY, 0);
      if (proj.visible) {
        const dist = Math.hypot(cx - proj.x, cy - proj.y);
        if (dist < 45) {
          sound.playSelect();
          this.showConstellationModal(c);
          return;
        }
      }
    }
  }

  showConstellationModal(c) {
    const modal = document.getElementById('constellation-modal');
    const symbolEl = document.getElementById('constellation-symbol');
    const nameEl = document.getElementById('constellation-name');
    const quoteEl = document.getElementById('constellation-quote');
    const closeBtn = document.getElementById('constellation-close-btn');

    symbolEl.textContent = c.symbol;
    nameEl.textContent = c.name;
    quoteEl.textContent = `"${c.quote}"`;

    modal.classList.remove('hidden');

    const handleClose = () => {
      sound.playSelect();
      modal.classList.add('hidden');
      closeBtn.removeEventListener('click', handleClose);
    };
    closeBtn.addEventListener('click', handleClose);
  }

  transitionToTextReveal() {
    this.mode = 'text_reveal';
    const allTextPoints = [...(this.bdayPoints || []), ...this.namePoints, ...this.bestFriendPoints];
    const bdayLen = (this.bdayPoints || []).length;
    const nameLen = this.namePoints.length;

    // Map each star to a text point or disperse into cosmic aura
    this.stars.forEach((star, i) => {
      if (i < allTextPoints.length) {
        star.targetX = allTextPoints[i].x;
        star.targetY = allTextPoints[i].y;
        star.targetZ = allTextPoints[i].z;
        if (i < bdayLen) {
          star.hue = 45; // Golden Birthday Starlight
          star.size = 2.6;
        } else if (i < bdayLen + nameLen) {
          star.hue = 180; // Cyan Neon for Harshitha
          star.size = 2.8;
        } else {
          star.hue = 330; // Rose Neon for Best Friend
          star.size = 2.4;
        }
      } else {
        // Outer halo
        const angle = Math.random() * Math.PI * 2;
        const rad = 280 + Math.random() * 250;
        star.targetX = Math.cos(angle) * rad;
        star.targetY = Math.sin(angle) * rad;
        star.targetZ = (Math.random() - 0.5) * 80;
        star.size = Math.random() * 1.5 + 0.5;
      }
    });

    // Reset rotation slowly to flat face
    this.targetRotX = 0;
    this.targetRotY = 0;

    // Show congratulations banner / next button
    setTimeout(() => {
      const banner = document.getElementById('galaxy-final-banner');
      if (banner) banner.classList.remove('hidden');
    }, 2500);
  }

  project3D(x, y, z) {
    // Rotate around Y
    const cosY = Math.cos(this.rotY);
    const sinY = Math.sin(this.rotY);
    let rx = x * cosY - z * sinY;
    let rz = z * cosY + x * sinY;

    // Rotate around X
    const cosX = Math.cos(this.rotX);
    const sinX = Math.sin(this.rotX);
    let ry = y * cosX - rz * sinX;
    rz = rz * cosX + y * sinX;

    const scale = this.fov / (this.fov + rz + 400);
    return {
      x: this.cx + rx * scale,
      y: this.cy + ry * scale,
      scale: scale,
      visible: (rz + 400) > 10
    };
  }

  start() {
    this.running = true;
    this.loop();
  }

  stop() {
    this.running = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  update() {
    // Smooth rotation lerp
    this.rotX += (this.targetRotX - this.rotX) * 0.08;
    this.rotY += (this.targetRotY - this.rotY) * 0.08;

    // Gentle auto-rotation when idle
    if (!this.isDragging && this.mode === 'galaxy') {
      this.targetRotY += 0.0015;
    }

    // Update stars
    this.stars.forEach(s => {
      s.twinkle += s.twinkleSpeed;

      if (this.mode === 'text_reveal') {
        // Lerp towards letter coordinates
        s.x += (s.targetX - s.x) * 0.05;
        s.y += (s.targetY - s.y) * 0.05;
        s.z += (s.targetZ - s.z) * 0.05;
      }
    });
  }

  draw() {
    this.ctx.fillStyle = '#060713';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Deep cosmic nebula backdrop
    const grad = this.ctx.createRadialGradient(this.cx, this.cy, 20, this.cx, this.cy, this.width * 0.6);
    grad.addColorStop(0, 'rgba(40, 16, 75, 0.45)');
    grad.addColorStop(0.5, 'rgba(12, 18, 50, 0.3)');
    grad.addColorStop(1, 'rgba(6, 7, 19, 0)');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw Constellations in 'galaxy' mode
    if (this.mode === 'galaxy') {
      this.drawConstellations();
    }

    // Draw Stars
    this.stars.forEach(s => {
      const p = this.project3D(s.x, s.y, s.z);
      if (!p.visible) return;

      const alpha = 0.5 + Math.sin(s.twinkle) * 0.45;
      const size = Math.max(0.6, s.size * p.scale);

      this.ctx.fillStyle = `hsla(${s.hue}, 85%, 75%, ${alpha})`;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      this.ctx.fill();

      // Subtle star glow on brighter stars
      if (s.size > 1.8) {
        this.ctx.fillStyle = `hsla(${s.hue}, 90%, 65%, ${alpha * 0.3})`;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, size * 2.5, 0, Math.PI * 2);
        this.ctx.fill();
      }
    });
  }

  drawConstellations() {
    this.constellations.forEach(c => {
      // Connect constellation lines
      this.ctx.strokeStyle = c.color + '66';
      this.ctx.lineWidth = 1.8;
      this.ctx.beginPath();

      let projectedPoints = [];
      c.stars.forEach((s, idx) => {
        const p = this.project3D(s.x, s.y, 0);
        projectedPoints.push(p);
        if (p.visible) {
          if (idx === 0) this.ctx.moveTo(p.x, p.y);
          else this.ctx.lineTo(p.x, p.y);
        }
      });
      this.ctx.stroke();

      // Draw constellation nodes
      projectedPoints.forEach((p, idx) => {
        if (!p.visible) return;
        this.ctx.fillStyle = c.color;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, 3.5 * p.scale, 0, Math.PI * 2);
        this.ctx.fill();
      });

      // Constellation Label
      const centerP = projectedPoints[Math.floor(projectedPoints.length / 2)];
      if (centerP && centerP.visible) {
        this.ctx.fillStyle = c.color;
        this.ctx.font = '700 11px "Outfit", sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${c.symbol} ${c.name}`, centerP.x, centerP.y - 12);
      }
    });
  }

  loop() {
    if (!this.running) return;
    this.update();
    this.draw();
    this.animId = requestAnimationFrame(() => this.loop());
  }
}
