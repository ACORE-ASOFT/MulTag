// Main game entry point
window.FILE_MANIFEST = window.FILE_MANIFEST || [];
window.FILE_MANIFEST.push({
  name: 'src/game/main.js',
  exports: ['initGame', 'startGame'],
  dependencies: ['gameLoop', 'GameManager', 'Renderer', 'InputHandler']
});

let gameManager;
let renderer;

/**
 * Initialize game
 */
window.initGame = function() {
  // Initialize input handler
  window.input = new InputHandler();
  
  // Use existing global renderer instance
  renderer = window.renderer;
  
  // Create game manager
  gameManager = new GameManager();
  window.gameManager = gameManager;
  
  console.log('Multi-Tag Game initialized');
};

/**
 * Start game loop
 */
window.startGame = function() {
  // Set update function
  window.gameLoop.setUpdate(function(dt) {
    gameManager.update(dt);
    
    // Handle pause
    if (window.input.isKeyPressed('Escape')) {
      gameManager.isPaused = !gameManager.isPaused;
    }
  });
  
  // Set draw function
  window.gameLoop.setDraw(function() {
    renderer.clear('#87CEEB'); // Sky blue background
    gameManager.draw();
  });
  
  // Start the game loop
  window.gameLoop.start();
  
  console.log('Multi-Tag Game started!');
};