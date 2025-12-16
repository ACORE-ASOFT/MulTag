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
  window.input = new window.InputHandler();
  
  // Use existing global renderer instance
  renderer = window.renderer;
  
  // Wait for theme manager to be ready before creating game manager
  const initializeGameManager = () => {
    // Create game manager
    gameManager = new GameManager();
    window.gameManager = gameManager;
    
    // Resume audio context after user interaction
    if (window.soundManager) {
      window.soundManager.resumeAudioContext();
      // Start background music
      window.soundManager.play('music');
    }
    
    console.log('Multi-Tag Game initialized');
  };
  
  // Check if theme manager is ready
  if (window.themeManager && window.themeManager.isReady()) {
    initializeGameManager();
  } else {
    // Wait for theme manager to initialize
    setTimeout(() => {
      console.log('Waiting for theme manager...');
      initializeGameManager();
    }, 1000);
  }
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
      
      // Toggle sound mute
      if (window.soundManager) {
        window.soundManager.toggleMute();
      }
    }
  });
  
  // Set draw function
  window.gameLoop.setDraw(function() {
    renderer.clear(); // Use default clear or theme-based clear
    gameManager.draw();
  });
  
  // Start the game loop
  window.gameLoop.start();
  
  console.log('Multi-Tag Game started!');
};