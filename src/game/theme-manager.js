// Theme and sprite management system
window.FILE_MANIFEST = window.FILE_MANIFEST || [];
window.FILE_MANIFEST.push({
  name: 'src/game/theme-manager.js',
  exports: ['ThemeManager', 'themeManager'],
  dependencies: ['GAME', 'PLAYER']
});

/**
 * Theme Manager for handling multiple visual themes and character sprites
 */
window.ThemeManager = class {
  constructor() {
    // Current theme state
    this.currentTheme = window.GAME.THEME_DEFAULT;
    this.isInitialized = false;
    this.isLoading = false;
    
    // Available characters from MakkoEngine manifest
    this.availableCharacters = [];
    this.characterAnimations = new Map(); // characterName -> Set of animations
    
    // Sprite cache: themeName_characterName -> Character instance
    this.spriteCache = new Map();
    
    // Theme configurations
    this.themes = {
      [window.GAME.THEME_DEFAULT]: {
        name: 'Default',
        backgroundColors: ['#1a1a1a', '#2d2d2d'],
        playerColors: window.PLAYER.COLORS,
        effects: {
          tagGlow: '#ff4444',
          powerupGlow: '#44ff44',
          speedTrail: '#4444ff'
        }
      },
      [window.GAME.THEME_NEON]: {
        name: 'Neon',
        backgroundColors: ['#0a0a0a', '#1a0033'],
        playerColors: ['#ff00ff', '#00ffff', '#ffff00', '#ff00aa'],
        effects: {
          tagGlow: '#ff00ff',
          powerupGlow: '#00ff00',
          speedTrail: '#00ffff'
        }
      },
      [window.GAME.THEME_RETRO]: {
        name: 'Retro',
        backgroundColors: ['#2a1810', '#1a0f08'],
        playerColors: ['#8b4513', '#daa520', '#cd853f', '#deb887'],
        effects: {
          tagGlow: '#ff6600',
          powerupGlow: '#ffcc00',
          speedTrail: '#cc9900'
        }
      },
      [window.GAME.THEME_NATURE]: {
        name: 'Nature',
        backgroundColors: ['#1a3a1a', '#0f2f0f'],
        playerColors: ['#228b22', '#32cd32', '#90ee90', '#98fb98'],
        effects: {
          tagGlow: '#8b0000',
          powerupGlow: '#ffd700',
          speedTrail: '#87ceeb'
        }
      }
    };
    
    // Character selection pool
    this.characterPool = [];
    this.selectedCharacters = new Map(); // playerIndex -> characterName
    
    this.initializeMakkoEngine();
  }

  /**
   * Initialize MakkoEngine and load sprite manifest
   */
  async initializeMakkoEngine() {
    if (this.isInitialized || this.isLoading) return;
    
    this.isLoading = true;
    
    try {
      // Initialize MakkoEngine with bundle-aware loading
      await window.MakkoEngine.init('sprites-manifest.json', {
        onProgress: (loaded, total) => {
          console.log(`Loading sprites: ${loaded}/${total}`);
        },
        onComplete: () => {
          console.log('All sprites loaded successfully');
          this.processAvailableCharacters();
          this.isInitialized = true;
          this.isLoading = false;
        },
        onError: (error) => {
          console.error('Failed to load sprites:', error);
          this.fallbackToBasicCharacters();
          this.isInitialized = true;
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('Critical sprite loading error:', error);
      this.fallbackToBasicCharacters();
      this.isInitialized = true;
      this.isLoading = false;
    }
  }

  /**
   * Process available characters from MakkoEngine manifest
   */
  processAvailableCharacters() {
    if (!window.MakkoEngine.isLoaded()) {
      console.warn('MakkoEngine not loaded, using fallback characters');
      this.fallbackToBasicCharacters();
      return;
    }

    this.availableCharacters = window.MakkoEngine.getCharacters();
    this.characterPool = [...this.availableCharacters];
    
    // Cache available animations for each character
    this.availableCharacters.forEach(characterName => {
      const animations = window.MakkoEngine.getAnimations(characterName);
      this.characterAnimations.set(characterName, new Set(animations));
    });

    console.log(`Loaded ${this.availableCharacters.length} characters:`, this.availableCharacters);
  }

  /**
   * Fallback to basic character sprites if MakkoEngine fails
   */
  fallbackToBasicCharacters() {
    this.availableCharacters = ['player_core', 'player_alt'];
    this.characterPool = [...this.availableCharacters];
    console.log('Using fallback character pool:', this.availableCharacters);
  }

  /**
   * Set the current theme
   * @param {string} themeName - Theme name to set
   */
  setTheme(themeName) {
    if (!this.themes[themeName]) {
      console.warn(`Theme '${themeName}' not found, using default`);
      themeName = window.GAME.THEME_DEFAULT;
    }
    
    this.currentTheme = themeName;
    
    // Clear sprite cache for theme switching
    this.clearSpriteCache();
    
    console.log(`Theme changed to: ${this.themes[themeName].name}`);
  }

  /**
   * Get current theme configuration
   * @returns {Object} Current theme config
   */
  getCurrentTheme() {
    return this.themes[this.currentTheme];
  }

  /**
   * Get player color based on current theme and player index
   * @param {number} playerIndex - Player index (0-3)
   * @returns {string} Color hex code
   */
  getPlayerColor(playerIndex) {
    const theme = this.getCurrentTheme();
    const colors = theme.playerColors;
    return colors[playerIndex % colors.length];
  }

  /**
   * Assign character to player (random selection from pool)
   * @param {number} playerIndex - Player index
   * @param {string} preferredCharacter - Optional preferred character
   * @returns {string} Assigned character name
   */
  assignCharacterToPlayer(playerIndex, preferredCharacter = null) {
    // Remove existing assignment for this player
    if (this.selectedCharacters.has(playerIndex)) {
      const oldCharacter = this.selectedCharacters.get(playerIndex);
      this.characterPool.push(oldCharacter);
    }

    let assignedCharacter;

    if (preferredCharacter && this.characterPool.includes(preferredCharacter)) {
      assignedCharacter = preferredCharacter;
      this.characterPool = this.characterPool.filter(char => char !== assignedCharacter);
    } else if (this.characterPool.length > 0) {
      const randomIndex = Math.floor(Math.random() * this.characterPool.length);
      assignedCharacter = this.characterPool.splice(randomIndex, 1)[0];
    } else {
      // Reset pool if all characters are assigned
      this.characterPool = [...this.availableCharacters];
      const randomIndex = Math.floor(Math.random() * this.characterPool.length);
      assignedCharacter = this.characterPool.splice(randomIndex, 1)[0];
    }

    this.selectedCharacters.set(playerIndex, assignedCharacter);
    return assignedCharacter;
  }

  /**
   * Get character sprite for player with theme and character assignment
   * @param {number} playerIndex - Player index
   * @returns {Object|null} Character sprite or null if not available
   */
  getPlayerSprite(playerIndex) {
    if (!this.isInitialized) {
      console.warn('ThemeManager not initialized, returning null sprite');
      return null;
    }

    const characterName = this.selectedCharacters.get(playerIndex);
    if (!characterName) {
      console.warn(`No character assigned to player ${playerIndex}`);
      return null;
    }

    const cacheKey = `${this.currentTheme}_${characterName}`;
    
    // Check cache first
    if (this.spriteCache.has(cacheKey)) {
      return this.spriteCache.get(cacheKey);
    }

    // Create new sprite instance
    const sprite = window.MakkoEngine.sprite(characterName);
    
    if (!sprite || !sprite.isLoaded()) {
      console.warn(`Failed to load sprite for character: ${characterName}`);
      return null;
    }

    // Cache the sprite
    this.spriteCache.set(cacheKey, sprite);
    
    // Start with idle animation if available
    if (sprite.hasAnimation('idle')) {
      sprite.play('idle', true);
    } else if (this.characterAnimations.get(characterName).size > 0) {
      // Play first available animation as fallback
      const firstAnimation = this.characterAnimations.get(characterName).values().next().value;
      sprite.play(firstAnimation, true);
    }

    return sprite;
  }

  /**
   * Check if character has specific animation
   * @param {string} characterName - Character name
   * @param {string} animationName - Animation name
   * @returns {boolean} Whether animation exists
   */
  hasAnimation(characterName, animationName) {
    const animations = this.characterAnimations.get(characterName);
    return animations ? animations.has(animationName) : false;
  }

  /**
   * Get available animations for a character
   * @param {string} characterName - Character name
   * @returns {Array} Array of animation names
   */
  getCharacterAnimations(characterName) {
    const animations = this.characterAnimations.get(characterName);
    return animations ? Array.from(animations) : [];
  }

  /**
   * Clear sprite cache (used for theme switching)
   */
  clearSpriteCache() {
    this.spriteCache.clear();
  }

  /**
   * Reset all character assignments (for new game)
   */
  resetCharacterAssignments() {
    this.selectedCharacters.clear();
    this.characterPool = [...this.availableCharacters];
    this.clearSpriteCache();
  }

  /**
   * Get theme effect colors
   * @returns {Object} Effect colors for current theme
   */
  getEffectColors() {
    const theme = this.getCurrentTheme();
    return theme.effects;
  }

  /**
   * Update all player sprites in the update loop
   * @param {number} dt - Delta time in seconds
   */
  updateSprites(dt) {
    // Update cached sprites
    this.spriteCache.forEach(sprite => {
      if (sprite && sprite.update) {
        sprite.update(dt * 1000); // MakkoEngine expects milliseconds
      }
    });
  }

  /**
   * Get theme-specific background color
   * @param {number} index - Color index for gradient
   * @returns {string} Background color
   */
  getBackgroundColor(index = 0) {
    const theme = this.getCurrentTheme();
    const colors = theme.backgroundColors;
    return colors[index % colors.length];
  }

  /**
   * Check if theme manager is ready for use
   * @returns {boolean} Whether initialized and ready
   */
  isReady() {
    return this.isInitialized && !this.isLoading;
  }

  /**
   * Get system status for debugging
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      loading: this.isLoading,
      currentTheme: this.currentTheme,
      availableCharacters: this.availableCharacters.length,
      assignedCharacters: this.selectedCharacters.size,
      cachedSprites: this.spriteCache.size,
      makkoEngineLoaded: window.MakkoEngine ? window.MakkoEngine.isLoaded() : false
    };
  }
};

// Global theme manager instance
window.themeManager = new window.ThemeManager();