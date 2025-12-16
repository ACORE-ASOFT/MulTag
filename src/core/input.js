// Input handling system
window.FILE_MANIFEST = window.FILE_MANIFEST || [];
window.FILE_MANIFEST.push({
  name: 'src/core/input.js',
  exports: ['InputHandler', 'input'],
  dependencies: []
});

/**
 * Input handler for keyboard and mouse
 */
window.InputHandler = class {
  constructor() {
    this.keys = {};
    this.mouse = { x: 0, y: 0, pressed: false };
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Keyboard events
    window.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
      
      // Fullscreen toggle
      if (e.shiftKey && e.key === 'F') {
        e.preventDefault();
        if (!document.fullscreenElement) {
          document.getElementById('gameCanvas').requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });

    // Mouse events
    const canvas = document.getElementById('gameCanvas');
    
    canvas.addEventListener('mousedown', (e) => {
      this.mouse.pressed = true;
      this.updateMousePosition(e);
    });

    canvas.addEventListener('mouseup', (e) => {
      this.mouse.pressed = false;
      this.updateMousePosition(e);
    });

    canvas.addEventListener('mousemove', (e) => {
      this.updateMousePosition(e);
    });
  }

  updateMousePosition(e) {
    const rect = e.target.getBoundingClientRect();
    this.mouse.x = (e.clientX - rect.left) * (1920 / rect.width);
    this.mouse.y = (e.clientY - rect.top) * (1080 / rect.height);
  }

  isKeyPressed(key) {
    return !!this.keys[key];
  }

  isMouseButtonPressed() {
    return this.mouse.pressed;
  }
};

// Global input instance
window.input = new window.InputHandler();