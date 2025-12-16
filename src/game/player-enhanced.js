// Enhanced Player entity with theme and sprite support
window.FILE_MANIFEST = window.FILE_MANIFEST || [];
window.FILE_MANIFEST.push({
  name: 'src/game/player-enhanced.js',
  exports: ['PlayerEnhanced'],
  dependencies: ['PhysicsEngine', 'ThemeManager', 'CHARACTER', 'ANIMATION']
});

/**
 * Enhanced Player entity with physics, input, and sprite animations
 */
window.PlayerEnhanced = class {
  constructor(x, y, playerIndex = 0) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 40;
    this.playerIndex = playerIndex;
    
    // Initialize theme and sprite
    this.characterName = null;
    this.sprite = null;
    this.initializeCharacter();
    
    // Physics properties
    this.vx = 0;
    this.vy = 0;
    this.ax = 0;
    this.ay = 0;
    this.useGravity = false;
    
    // Movement settings
    this.speed = 300; // pixels per second
    this.jumpPower = 400;
    
    // Game state
    this.isGrounded = false;
    this.score = 0;
    this.isTagged = false;
    
    // Animation state
    this.currentAnimation = window.ANIMATION.IDLE;
    this.facingDirection = 1; // 1 = right, -1 = left
    
    this.physics = new window.PhysicsEngine();
  }

  /**
   * Initialize character and sprite from theme manager
   */
  initializeCharacter() {
    if (!window.themeManager) {
      console.warn('ThemeManager not available, using fallback color');
      this.color = window.PLAYER.COLORS[this.playerIndex % window.PLAYER.COLORS.length];
      return;
    }

    // Assign character to player
    this.characterName = window.themeManager.assignCharacterToPlayer(this.playerIndex);
    
    // Get themed color
    this.color = window.themeManager.getPlayerColor(this.playerIndex);
    
    // Get sprite instance
    this.sprite = window.themeManager.getPlayerSprite(this.playerIndex);
    
    console.log(`Player ${this.playerIndex} assigned character: ${this.characterName}`);
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
    if (this.y >= 1080 - this.height - 10) {
      this.y = 1080 - this.height - 10;
      this.vy = 0;
      this.isGrounded = true;
      
      // Land animation if falling
      if (this.currentAnimation === window.ANIMATION.FALL) {
        this.playAnimation(window.ANIMATION.IDLE, true);
      }
    } else {
      this.isGrounded = false;
    }
    
    // Update sprite animation
    if (this.sprite) {
      this.sprite.update(dt * 1000); // MakkoEngine expects milliseconds
    }
  }

  /**
   * Handle keyboard input
   * @param {number} dt - Delta time in seconds
   */
  handleInput(dt) {
    let moving = false;
    
    // Horizontal movement
    if (window.input.isKeyPressed('ArrowLeft') || window.input.isKeyPressed('a')) {
      this.ax = -this.speed;
      this.facingDirection = -1;
      moving = true;
    }
    if (window.input.isKeyPressed('ArrowRight') || window.input.isKeyPressed('d')) {
      this.ax = this.speed;
      this.facingDirection = 1;
      moving = true;
    }
    
    // Jump
    if ((window.input.isKeyPressed(' ') || window.input.isKeyPressed('ArrowUp') || window.input.isKeyPressed('w')) && this.isGrounded) {
      this.vy = -this.jumpPower;
      this.isGrounded = false;
      this.playAnimation(window.ANIMATION.JUMP, false);
    }
    
    // Update animation based on movement
    if (!this.isGrounded) {
      if (this.vy > 0) {
        this.playAnimation(window.ANIMATION.FALL, true);
      }
    } else if (moving) {
      this.playAnimation(window.ANIMATION.WALK, true);
    } else {
      this.playAnimation(window.ANIMATION.IDLE, true);
    }
  }

  /**
   * Play animation if available
   * @param {string} animationName - Animation to play
   * @param {boolean} loop - Whether to loop the animation
   */
  playAnimation(animationName, loop = false) {
    if (this.currentAnimation === animationName) return;
    
    if (this.sprite && window.themeManager.hasAnimation(this.characterName, animationName)) {
      this.sprite.play(animationName, loop);
      this.currentAnimation = animationName;
    }
  }

  /**
   * Draw the player with sprite or fallback
   */
  draw() {
    if (this.sprite && this.sprite.isLoaded()) {
      // Draw sprite
      this.sprite.draw(window.renderer.ctx, this.x + this.width / 2, this.y + this.height, {
        scale: 1.0,
        flipH: this.facingDirection < 0,
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
   * Set tagged state with animation
   * @param {boolean} tagged - Whether player is tagged
   */
  setTagged(tagged) {
    if (this.isTagged === tagged) return;
    
    this.isTagged = tagged;
    
    if (tagged) {
      this.playAnimation(window.ANIMATION.DEFEAT, false);
    } else {
      this.playAnimation(window.ANIMATION.IDLE, true);
    }
  }

  /**
   * Play victory animation
   */
  playVictory() {
    this.playAnimation(window.ANIMATION.VICTORY, false);
  }

  /**
   * Play attack/tag animation
   */
  playAttack() {
    this.playAnimation(window.ANIMATION.ATTACK, false);
  }

  /**
   * Play dodge animation
   */
  playDodge() {
    this.playAnimation(window.ANIMATION.DODGE, false);
  }

  /**
   * Reset player for new round
   */
  reset() {
    this.score = 0;
    this.isTagged = false;
    this.currentAnimation = window.ANIMATION.IDLE;
    this.facingDirection = 1;
    this.vx = 0;
    this.vy = 0;
    this.ax = 0;
    this.ay = 0;
    
    if (this.sprite) {
      this.playAnimation(window.ANIMATION.IDLE, true);
    }
  }

  /**
   * Get player status for debugging
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      playerIndex: this.playerIndex,
      characterName: this.characterName,
      position: { x: this.x, y: this.y },
      velocity: { vx: this.vx, vy: this.vy },
      isGrounded: this.isGrounded,
      isTagged: this.isTagged,
      currentAnimation: this.currentAnimation,
      facingDirection: this.facingDirection,
      spriteLoaded: this.sprite ? this.sprite.isLoaded() : false,
      score: this.score
    };
  }
};