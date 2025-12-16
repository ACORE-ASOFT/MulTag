// Player entity implementation
window.FILE_MANIFEST = window.FILE_MANIFEST || [];
window.FILE_MANIFEST.push({
  name: 'src/game/player.js',
  exports: ['Player'],
  dependencies: ['PhysicsEngine', 'PLAYER']
});

/**
 * Player entity with physics and input
 */
window.Player = class {
  constructor(x, y, playerIndex = 0, isAI = false) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 40;
    this.id = playerIndex;
    this.isAI = isAI;
    
    // Theme and sprite system
    this.characterType = null;
    this.sprite = null;
    this.currentAnimation = window.ANIM.ANIM_IDLE;
    
    // Color from theme manager
    this.updateColor();
    
    // Physics properties
    this.vx = 0;
    this.vy = 0;
    this.ax = 0;
    this.ay = 0;
    this.useGravity = false;
    
    // Movement settings
    this.speed = window.PLAYER.SPEED;
    this.jumpPower = window.PLAYER.JUMP_POWER;
    
    // Game state
    this.isGrounded = false;
    this.score = 0;
    this.isTagged = false;
    
    this.physics = new window.PhysicsEngine();
    
    // Initialize character assignment
    this.initializeCharacter();
  }

  /**
   * Initialize character assignment from theme manager
   */
  initializeCharacter() {
    if (window.themeManager && window.themeManager.isReady()) {
      this.characterType = window.themeManager.assignCharacterToPlayer(this.id);
      this.sprite = window.themeManager.getPlayerSprite(this.id);
    }
  }

  /**
   * Update player color from current theme
   */
  updateColor() {
    if (window.themeManager && window.themeManager.isReady()) {
      this.color = window.themeManager.getPlayerColor(this.id);
    } else {
      // Fallback to default colors
      this.color = window.PLAYER.COLORS[this.id % window.PLAYER.COLORS.length];
    }
  }

  /**
   * Update player with input and physics
   * @param {number} dt - Delta time in seconds
   */
  update(dt) {
    // Handle input
    this.handleInput(dt);
    
    // Apply physics
    this.physics.applyPhysics(this, dt);
    
    // Keep in bounds
    this.physics.keepInBounds(this);
    
    // Check ground collision
    if (this.y >= window.GAME.CANVAS_HEIGHT - this.height - 10) {
      this.y = window.GAME.CANVAS_HEIGHT - this.height - 10;
      this.vy = 0;
      this.isGrounded = true;
    } else {
      this.isGrounded = false;
    }
    
    // Update animation state
    this.updateAnimation();
    
    // Update sprite if available
    if (this.sprite) {
      this.sprite.update(dt * 1000); // MakkoEngine expects milliseconds
    }
  }

  /**
   * Update animation based on player state
   */
  updateAnimation() {
    if (!this.sprite) return;
    
    let targetAnimation = window.ANIM.ANIM_IDLE;
    
    // Determine animation based on state
    if (!this.isGrounded) {
      if (this.vy < 0) {
        targetAnimation = window.ANIM.ANIM_JUMP;
      } else {
        targetAnimation = window.ANIM.ANIM_FALL;
      }
    } else if (Math.abs(this.vx) > 10) {
      targetAnimation = window.ANIM.ANIM_WALK;
    }
    
    // Special states
    if (this.isTagged) {
      targetAnimation = window.ANIM.ANIM_TAG;
    }
    
    // Play animation if changed
    if (this.currentAnimation !== targetAnimation) {
      if (window.themeManager.hasAnimation(this.characterType, targetAnimation)) {
        this.sprite.play(targetAnimation, targetAnimation === window.ANIM.ANIM_IDLE);
        this.currentAnimation = targetAnimation;
      }
    }
  }

  /**
   * Handle keyboard input
   * @param {number} dt - Delta time in seconds
   */
  handleInput(dt) {
    // Skip input for AI players
    if (this.isAI) return;
    
    // Player 1 controls (Arrow keys and WASD)
    if (this.id === 0 || this.id === undefined) {
      // Horizontal movement
      if (window.input.isKeyPressed('ArrowLeft') || window.input.isKeyPressed('a')) {
        this.ax = -this.speed;
      }
      if (window.input.isKeyPressed('ArrowRight') || window.input.isKeyPressed('d')) {
        this.ax = this.speed;
      }
      
      // Jump
      if ((window.input.isKeyPressed(' ') || window.input.isKeyPressed('ArrowUp') || window.input.isKeyPressed('w')) && this.isGrounded) {
        this.vy = -this.jumpPower;
        this.isGrounded = false;
      }
    }
    
    // Player 2 controls (IJKL and O)
    if (this.id === 1) {
      // Horizontal movement
      if (window.input.isKeyPressed('j') || window.input.isKeyPressed('J')) {
        this.ax = -this.speed;
      }
      if (window.input.isKeyPressed('l') || window.input.isKeyPressed('L')) {
        this.ax = this.speed;
      }
      
      // Jump
      if ((window.input.isKeyPressed('i') || window.input.isKeyPressed('I') || window.input.isKeyPressed('o') || window.input.isKeyPressed('O')) && this.isGrounded) {
        this.vy = -this.jumpPower;
        this.isGrounded = false;
      }
    }
  }

  /**
   * Draw the player
   */
  draw() {
    // Draw sprite if available
    if (this.sprite && this.sprite.isLoaded()) {
      this.sprite.draw(window.renderer.ctx, this.x + this.width / 2, this.y + this.height, {
        scale: 1.5,
        flipH: this.vx < 0, // Flip sprite when moving left
        debug: window.GAME.DEBUG
      });
    } else {
      // Fallback to colored rectangle
      window.renderer.drawRect(this.x, this.y, this.width, this.height, this.color);
    }
    
    // Draw indicator if tagged
    if (this.isTagged) {
      const effectColors = window.themeManager ? window.themeManager.getEffectColors() : { tagGlow: '#ff4444' };
      window.renderer.drawCircle(
        this.x + this.width / 2,
        this.y + this.height / 2,
        this.width / 2 + 5,
        effectColors.tagGlow + '80' // Add transparency
      );
    }
  }

  /**
   * Set tagged state
   * @param {boolean} tagged - Whether player is tagged
   */
  setTagged(tagged) {
    this.isTagged = tagged;
    // Update color based on theme rather than hardcoding
    this.updateColor();
    
    // Trigger tag animation if available
    if (tagged && this.sprite && window.themeManager.hasAnimation(this.characterType, window.ANIM.ANIM_TAG)) {
      this.sprite.play(window.ANIM.ANIM_TAG, false);
    }
  }

  /**
   * Update theme and sprite for theme changes
   */
  updateTheme() {
    this.updateColor();
    this.initializeCharacter();
  }

  /**
   * Play specific animation
   * @param {string} animationName - Animation to play
   * @param {boolean} loop - Whether to loop the animation
   */
  playAnimation(animationName, loop = false) {
    if (this.sprite && window.themeManager.hasAnimation(this.characterType, animationName)) {
      this.sprite.play(animationName, loop);
      this.currentAnimation = animationName;
    }
  }

  /**
   * Get current character type
   * @returns {string|null} Character type
   */
  getCharacterType() {
    return this.characterType;
  }

  /**
   * Check if player has sprite loaded
   * @returns {boolean} Whether sprite is available
   */
  hasSprite() {
    return this.sprite && this.sprite.isLoaded();
  }
};