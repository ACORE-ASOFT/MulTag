// Core game loop with delta time
window.FILE_MANIFEST = window.FILE_MANIFEST || [];
window.FILE_MANIFEST.push({
  name: 'src/core/loop.js',
  exports: ['gameLoop'],
  dependencies: []
});

/**
 * Game loop implementation
 */
window.gameLoop = {
  lastTime: 0,
  isRunning: false,
  updateFunc: null,
  drawFunc: null,
  
  /**
   * Start the game loop
   */
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop();
    
    console.log('Game loop started');
  },
  
  /**
   * Stop the game loop
   */
  stop() {
    this.isRunning = false;
    console.log('Game loop stopped');
  },
  
  /**
   * Main loop
   */
  loop() {
    if (!this.isRunning) return;
    
    const currentTime = performance.now();
    let deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
    
    // Cap delta time to prevent spiral of death
    deltaTime = Math.min(deltaTime, window.GAME.MAX_DELTA_TIME);
    
    // Update
    if (this.updateFunc) {
      this.updateFunc(deltaTime);
    }
    
    // Draw
    if (this.drawFunc) {
      this.drawFunc();
    }
    
    this.lastTime = currentTime;
    
    // Continue loop
    requestAnimationFrame(() => this.loop());
  },
  
  /**
   * Set update function
   * @param {Function} func - Update function
   */
  setUpdate(func) {
    this.updateFunc = func;
  },
  
  /**
   * Set draw function
   * @param {Function} func - Draw function
   */
  setDraw(func) {
    this.drawFunc = func;
  }
};