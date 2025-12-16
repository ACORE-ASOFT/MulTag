// Rendering system for canvas drawing
window.FILE_MANIFEST = window.FILE_MANIFEST || [];
window.FILE_MANIFEST.push({
  name: 'src/engine/renderer.js',
  exports: ['Renderer', 'renderer'],
  dependencies: []
});

/**
 * Canvas renderer
 */
window.Renderer = class {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.clearColor = '#1a1a1a';
  }

  /**
   * Clear the canvas
   */
  clear() {
    this.ctx.fillStyle = this.clearColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Draw a rectangle
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Width
   * @param {number} height - Height
   * @param {string} color - Fill color
   */
  drawRect(x, y, width, height, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, width, height);
  }

  /**
   * Draw a circle
   * @param {number} x - Center X
   * @param {number} y - Center Y
   * @param {number} radius - Radius
   * @param {string} color - Fill color
   */
  drawCircle(x, y, radius, color) {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  /**
   * Draw text
   * @param {string} text - Text to draw
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {string} color - Text color
   * @param {number} size - Font size
   * @param {string} font - Font family
   */
  drawText(text, x, y, color = '#fff', size = 16, font = 'Arial') {
    this.ctx.fillStyle = color;
    this.ctx.font = `${size}px ${font}`;
    this.ctx.fillText(text, x, y);
  }

  /**
   * Draw an entity with standard properties
   * @param {Object} entity - Entity with x, y, width, height, color
   */
  drawEntity(entity) {
    if (entity.color && entity.width && entity.height) {
      this.drawRect(entity.x, entity.y, entity.width, entity.height, entity.color);
    }
  }

  /**
   * Draw debug information
   * @param {Array} entities - Array of entities to debug
   */
  drawDebug(entities) {
    entities.forEach(entity => {
      // Draw bounding box
      this.ctx.strokeStyle = '#ff0';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(entity.x, entity.y, entity.width, entity.height);
      
      // Draw velocity vector
      if (entity.vx || entity.vy) {
        this.ctx.strokeStyle = '#0ff';
        this.ctx.beginPath();
        this.ctx.moveTo(entity.x + entity.width / 2, entity.y + entity.height / 2);
        this.ctx.lineTo(
          entity.x + entity.width / 2 + entity.vx * 0.1,
          entity.y + entity.height / 2 + entity.vy * 0.1
        );
        this.ctx.stroke();
      }
    });
  }

  /**
   * Draw background with theme support
   * @param {string} theme - Current theme name
   */
  drawBackground(theme = 'default') {
    if (window.themeManager && window.themeManager.isReady()) {
      const colors = window.themeManager.getCurrentTheme().backgroundColors;
      
      // Create gradient background
      const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
      gradient.addColorStop(0, colors[0]);
      gradient.addColorStop(1, colors[1] || colors[0]);
      
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    } else {
      // Fallback to solid color
      this.clear();
    }
  }

  /**
   * Draw theme-specific UI elements
   * @param {string} theme - Current theme
   * @param {Object} gameState - Game state information
   */
  drawThemeUI(theme, gameState) {
    if (!window.themeManager || !window.themeManager.isReady()) {
      return;
    }

    const effectColors = window.themeManager.getEffectColors();
    
    // Draw score with theme color
    if (gameState && gameState.players) {
      gameState.players.forEach((player, index) => {
        const color = window.themeManager.getPlayerColor(index);
        this.drawText(
          `P${index + 1}: ${player.score || 0}`,
          50 + index * 200,
          50,
          color,
          24,
          'monospace'
        );
      });
    }

    // Draw game timer
    if (gameState && gameState.timeRemaining !== undefined) {
      const minutes = Math.floor(gameState.timeRemaining / 60);
      const seconds = Math.floor(gameState.timeRemaining % 60);
      const timeText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      this.drawText(
        timeText,
        this.canvas.width / 2 - 50,
        50,
        '#fff',
        36,
        'monospace'
      );
    }
  }
};

// Global renderer instance
window.renderer = new window.Renderer();