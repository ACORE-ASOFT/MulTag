// Core game manager for multi-tag game
window.FILE_MANIFEST = window.FILE_MANIFEST || [];
window.FILE_MANIFEST.push({
  name: 'src/game/gameManager.js',
  exports: ['GameManager'],
  dependencies: ['Player', 'PhysicsEngine', 'checkCollision', 'randomRange', 'randomChoice', 'GAME', 'PLAYER', 'TAG']
});

/**
 * Main game manager
 */
window.GameManager = class {
  constructor() {
    this.players = [];
    this.powerups = [];
    this.platforms = [];
    this.gameState = 'menu';
    this.gameMode = window.GAME.MODE_CLASSIC;
    this.roundTime = window.TAG.ROUND_TIME;
    this.isPaused = false;
    
    this.physics = new window.PhysicsEngine();
    this.lastTagTime = 0;
    
    this.init();
  }

  init() {
    this.createPlayers();
    this.createPlatforms();
    this.startGame();
  }

  createPlayers() {
    const colors = window.PLAYER.COLORS;
    const positions = [
      { x: 200, y: 500 },
      { x: 1720, y: 500 },
      { x: 200, y: 800 },
      { x: 1720, y: 800 }
    ];

    for (let i = 0; i < window.GAME.MAX_PLAYERS; i++) {
      const player = new window.Player(
        positions[i].x,
        positions[i].y,
        i, // playerIndex
        i >= 2 // isAI - first 2 are human, rest are AI
      );
      player.score = 0;
      this.players.push(player);
    }
  }

  createPlatforms() {
    // Ground platforms
    this.platforms.push({
      x: 0, y: 1020, width: 1920, height: 60,
      type: window.PLATFORM.STATIC
    });

    // Floating platforms
    this.platforms.push({
      x: 400, y: 700, width: 200, height: 20,
      type: window.PLATFORM.STATIC
    });
    
    this.platforms.push({
      x: 1320, y: 700, width: 200, height: 20,
      type: window.PLATFORM.STATIC
    });
    
    this.platforms.push({
      x: 860, y: 500, width: 200, height: 20,
      type: window.PLATFORM.STATIC
    });

    // Moving platform
    this.platforms.push({
      x: 600, y: 400, width: 150, height: 20,
      type: window.PLATFORM.MOVING,
      moveSpeed: 100,
      moveRange: 300,
      startX: 600,
      moveDirection: 1
    });
  }

  startGame() {
    this.gameState = 'playing';
    this.roundTime = window.TAG.ROUND_TIME;
    
    // Pick random tagged player
    const taggedIndex = Math.floor(Math.random() * this.players.length);
    this.players[taggedIndex].setTagged(true);
  }

  update(dt) {
    if (this.gameState !== 'playing' || this.isPaused) return;

    this.roundTime -= dt;
    if (this.roundTime <= 0) {
      this.endRound();
      return;
    }

    // Update players
    this.players.forEach(player => {
      if (player.isAI) {
        this.updateAI(player, dt);
      } else {
        player.update(dt);
      }
      this.checkPlatformCollisions(player);
      this.keepPlayerInBounds(player);
    });

    // Update moving platforms
    this.platforms.forEach(platform => {
      if (platform.type === window.PLATFORM.MOVING) {
        platform.x += platform.moveSpeed * platform.moveDirection * dt;
        if (Math.abs(platform.x - platform.startX) > platform.moveRange) {
          platform.moveDirection *= -1;
        }
      }
    });

    // Check player collisions
    this.checkPlayerCollisions();

    // Spawn powerups
    if (Math.random() < 0.01) {
      this.spawnPowerup();
    }

    // Update powerups
    this.updatePowerups(dt);
  }

  updateAI(player, dt) {
    // Simple AI: move towards nearest untagged player or run away if tagged
    let target = null;
    let minDist = Infinity;

    this.players.forEach(other => {
      if (other.id === player.id) return;
      
      const dist = window.distance(player.x, player.y, other.x, other.y);
      
      if (player.isTagged && !other.isTagged) {
        // Run away from untagged players
        if (dist < minDist) {
          minDist = dist;
          target = other;
        }
      } else if (!player.isTagged && other.isTagged) {
        // Chase tagged players
        if (dist < minDist) {
          minDist = dist;
          target = other;
        }
      }
    });

    if (target) {
      const dx = target.x - player.x;
      const dy = target.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 0) {
        if (player.isTagged) {
          // Run away
          player.ax = -(dx / dist) * window.PLAYER.SPEED;
        } else {
          // Chase
          player.ax = (dx / dist) * window.PLAYER.SPEED;
        }
      }

      // Jump randomly
      if (Math.random() < 0.02 && player.isGrounded) {
        player.vy = -window.PLAYER.JUMP_POWER;
      }
    }

    this.physics.applyPhysics(player, dt);
  }

  checkPlayerCollisions() {
    for (let i = 0; i < this.players.length; i++) {
      for (let j = i + 1; j < this.players.length; j++) {
        const a = this.players[i];
        const b = this.players[j];
        
        if (window.checkCollision(a, b)) {
          // Check for tagging
          if (a.isTagged && !b.isTagged) {
            this.tagPlayer(a, b);
          } else if (b.isTagged && !a.isTagged) {
            this.tagPlayer(b, a);
          } else {
            // Regular collision
            window.resolveCollision(a, b);
          }
        }
      }
    }
  }

  tagPlayer(tagger, tagged) {
    const now = Date.now() / 1000;
    if (now - this.lastTagTime < window.TAG.TAG_COOLDOWN) return;

    tagged.setTagged(true);
    tagger.setTagged(false);
    tagger.score += window.TAG.POINTS_TAG;
    this.lastTagTime = now;
  }

  checkPlatformCollisions(player) {
    this.platforms.forEach(platform => {
      if (window.checkCollision(player, platform)) {
        // Land on top of platform
        if (player.vy > 0 && player.y < platform.y) {
          player.y = platform.y - player.height;
          player.vy = 0;
          player.isGrounded = true;
        }
      }
    });
  }

  keepPlayerInBounds(player) {
    player.x = window.clamp(player.x, 0, window.GAME.CANVAS_WIDTH - player.width);
    
    if (player.y > window.GAME.CANVAS_HEIGHT - player.height) {
      player.y = window.GAME.CANVAS_HEIGHT - player.height;
      player.vy = 0;
      player.isGrounded = true;
    }
  }

  spawnPowerup() {
    if (this.powerups.length >= window.POWERUP.MAX_ACTIVE) return;

    const types = Object.values(window.POWERUP).filter(v => typeof v === 'string' && v !== v.toUpperCase());
    const type = window.randomChoice(types);
    
    const powerup = {
      x: window.randomRange(100, window.GAME.CANVAS_WIDTH - 100),
      y: window.randomRange(200, 600),
      width: window.POWERUP.SIZE,
      height: window.POWERUP.SIZE,
      type: type,
      lifetime: window.POWERUP.DESPAWN_TIME,
      color: this.getPowerupColor(type)
    };
    
    this.powerups.push(powerup);
  }

  getPowerupColor(type) {
    const colors = {
      [window.POWERUP.SPEED]: '#FFD700',
      [window.POWERUP.JUMP]: '#00CED1',
      [window.POWERUP.SHIELD]: '#FF69B4',
      [window.POWERUP.FREEZE]: '#00BFFF'
    };
    return colors[type] || '#FFFFFF';
  }

  updatePowerups(dt) {
    this.powerups = this.powerups.filter(powerup => {
      powerup.lifetime -= dt;
      
      // Check player collection
      for (let player of this.players) {
        if (window.checkCollision(player, powerup)) {
          this.applyPowerup(player, powerup);
          return false;
        }
      }
      
      return powerup.lifetime > 0;
    });
  }

  applyPowerup(player, powerup) {
    player.score += window.TAG.POINTS_POWERUP;
    
    switch (powerup.type) {
      case window.POWERUP.SPEED:
        player.speed = window.PLAYER.SPEED * window.POWERUP.SPEED_MULTIPLIER;
        setTimeout(() => player.speed = window.PLAYER.SPEED, window.POWERUP.DURATION * 1000);
        break;
      case window.POWERUP.JUMP:
        player.jumpPower = window.PLAYER.JUMP_POWER * window.POWERUP.JUMP_MULTIPLIER;
        setTimeout(() => player.jumpPower = window.PLAYER.JUMP_POWER, window.POWERUP.DURATION * 1000);
        break;
    }
  }

  endRound() {
    this.gameState = 'gameover';
    
    // Find winner (highest score)
    let winner = this.players[0];
    this.players.forEach(player => {
      if (player.score > winner.score) {
        winner = player;
      }
    });
    
    console.log('Game Over! Winner: Player', winner.id + 1, 'with', winner.score, 'points');
  }

  draw() {
    // Draw platforms
    this.platforms.forEach(platform => {
      window.renderer.drawRect(platform.x, platform.y, platform.width, platform.height, '#666666');
    });

    // Draw powerups
    this.powerups.forEach(powerup => {
      window.renderer.drawCircle(
        powerup.x + powerup.width / 2,
        powerup.y + powerup.height / 2,
        powerup.width / 2,
        powerup.color
      );
    });

    // Draw players
    this.players.forEach(player => {
      player.draw();
      
      // Draw AI indicator
      if (player.isAI) {
        window.renderer.drawText(
          'AI',
          player.x + player.width / 2 - 10,
          player.y - 10,
          '#FFFFFF',
          12,
          'Arial'
        );
      }
    });

    // Draw UI
    this.drawUI();
  }

  drawUI() {
    // Draw timer
    window.renderer.drawText(
      `Time: ${Math.ceil(this.roundTime)}s`,
      20,
      30,
      '#FFFFFF',
      24,
      'Arial'
    );

    // Draw scores
    this.players.forEach((player, index) => {
      const y = 70 + index * 30;
      window.renderer.drawText(
        `P${index + 1}: ${player.score} ${player.isTagged ? '[TAGGED]' : ''}`,
        20,
        y,
        player.isTagged ? '#FF0000' : '#FFFFFF',
        18,
        'Arial'
      );
    });

    // Draw game over
    if (this.gameState === 'gameover') {
      window.renderer.drawText(
        'GAME OVER!',
        window.GAME.CANVAS_WIDTH / 2 - 100,
        window.GAME.CANVAS_HEIGHT / 2,
        '#FF0000',
        48,
        'Arial'
      );
    }
  }
};