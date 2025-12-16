// Game constants and configuration
window.FILE_MANIFEST = window.FILE_MANIFEST || [];
window.FILE_MANIFEST.push({
  name: 'src/utils/constants.js',
  exports: ['GAME', 'PLAYER', 'PHYSICS', 'COLLISION', 'TAG', 'POWERUP', 'PLATFORM', 'INPUT', 'CHARACTER', 'ANIMATION'],
  dependencies: []
});

/**
 * Core game constants
 */
window.GAME = {
  // Canvas resolution
  CANVAS_WIDTH: 1920,
  CANVAS_HEIGHT: 1080,
  
  // Game settings
  MAX_PLAYERS: 4,
  DEFAULT_PLAYERS: 2, // Default number of human players
  AI_PLAYERS: false, // Disable AI for 4-player multiplayer
  DEBUG: false,
  
  // Timing
  FPS: 60,
  MAX_DELTA_TIME: 0.1, // Cap delta time to prevent spiral of death
  
  // Game modes
  MODE_CLASSIC: 'classic',
  MODE_ELIMINATION: 'elimination',
  MODE_TIME_ATTACK: 'time_attack',
  MODE_TEAM: 'team',
  
  // Themes
  THEME_DEFAULT: 'default',
  THEME_NEON: 'neon',
  THEME_RETRO: 'retro',
  THEME_NATURE: 'nature',
  
  // Character sprite types
  CHARACTER_PLAYER: 'player_core',
  CHARACTER_NPC: 'npc_basic',
  CHARACTER_BOSS: 'boss_basic',
  
  // Animation states
  ANIM_IDLE: 'idle',
  ANIM_WALK: 'walk',
  ANIM_RUN: 'run',
  ANIM_JUMP: 'jump',
  ANIM_FALL: 'fall',
  ANIM_ATTACK: 'attack',
  ANIM_TAG: 'tag',
  ANIM_DODGE: 'dodge',
  ANIM_VICTORY: 'victory',
  ANIM_DEFEAT: 'defeat'
};

/**
 * Player-related constants
 */
window.PLAYER = {
  // Physics properties
  WIDTH: 40,
  HEIGHT: 40,
  RADIUS: 20,
  
  // Movement
  SPEED: 300, // pixels per second
  JUMP_POWER: 400,
  GRAVITY_SCALE: 1.0,
  
  // Collision
  MASS: 1.0,
  FRICTION: 0.9,
  
  // Tagging
  TAG_COOLDOWN: 0.5, // seconds between tags
  TAG_RANGE: 60, // pixels
  
  // Health and stamina
  MAX_HEALTH: 100,
  STAMINA_REGEN: 20, // per second
  STAMINA_COST_JUMP: 20,
  
  // Colors for different players
  COLORS: [
    '#4CAF50', // Green
    '#2196F3', // Blue
    '#FF9800', // Orange
    '#E91E63'  // Pink
  ]
};

/**
 * Character sprite constants
 */
window.CHARACTER = {
  // Types
  PLAYER_CORE: 'player_core',
  PLAYER_ALT: 'player_alt',
  NPC_BASIC: 'npc_basic',
  BOSS_BASIC: 'boss_basic',
  
  // Animation priority (higher = more important)
  PRIORITY_VICTORY: 10,
  PRIORITY_ATTACK: 9,
  PRIORITY_TAG: 8,
  PRIORITY_DODGE: 7,
  PRIORITY_JUMP: 6,
  PRIORITY_RUN: 5,
  PRIORITY_WALK: 4,
  PRIORITY_FALL: 3,
  PRIORITY_IDLE: 1
};

/**
 * Animation constants
 */
window.ANIMATION = {
  // States
  IDLE: 'idle',
  WALK: 'walk',
  RUN: 'run',
  JUMP: 'jump',
  FALL: 'fall',
  ATTACK: 'attack',
  TAG: 'tag',
  DODGE: 'dodge',
  VICTORY: 'victory',
  DEFEAT: 'defeat',
  
  // Timing
  TRANSITION_BLEND: 0.2, // seconds for animation blending
  
  // Playback speeds
  SPEED_SLOW: 0.5,
  SPEED_NORMAL: 1.0,
  SPEED_FAST: 1.5,
  SPEED_VERY_FAST: 2.0
};

/**
 * Physics constants
 */
window.PHYSICS = {
  // Global physics
  GRAVITY: 800, // pixels per second squared
  AIR_RESISTANCE: 0.99,
  GROUND_FRICTION: 0.85,
  
  // Velocity limits
  MAX_VELOCITY: 1000, // pixels per second
  MIN_VELOCITY: 0.1,
  
  // Collision tolerance
  COLLISION_TOLERANCE: 0.01,
  SEPARATION_ITERATIONS: 3,
  
  // Projectiles
  PROJECTILE_SPEED: 500,
  PROJECTILE_LIFETIME: 2.0, // seconds
  PROJECTILE_SIZE: 8
};

/**
 * Collision detection constants
 */
window.COLLISION = {
  // Collision types
  AABB: 'aabb',
  CIRCLE: 'circle',
  LINE: 'line',
  POINT: 'point',
  
  // Collision layers (bitmask)
  LAYER_DEFAULT: 1,
  LAYER_PLAYER: 2,
  LAYER_PROJECTILE: 4,
  LAYER_PLATFORM: 8,
  LAYER_POWERUP: 16,
  LAYER_TRIGGER: 32,
  
  // Collision response
  RESTITUTION: 0.8, // Bounciness
  STATIC_FRICTION: 0.6,
  DYNAMIC_FRICTION: 0.4
};

/**
 * Tag game constants
 */
window.TAG = {
  // Game timing
  ROUND_TIME: 180, // seconds (3 minutes)
  WARMUP_TIME: 5, // seconds
  COOLDOWN_TIME: 3, // seconds
  
  // Scoring
  POINTS_TAG: 10,
  POINTS_SURVIVAL: 1, // per second
  POINTS_POWERUP: 5,
  POINTS_SPECIAL: 25,
  
  // Special mechanics
  FREEZE_TIME: 1.5, // seconds when tagged
  SPEED_BOOST: 2.0, // multiplier
  SHIELD_DURATION: 3.0, // seconds
  
  // Visual effects
  TAGGED_COLOR: '#f44336',
  SAFE_COLOR: '#4CAF50',
  WARNING_THRESHOLD: 10, // seconds left
};

/**
 * Power-up constants
 */
window.POWERUP = {
  // Types
  SPEED: 'speed',
  JUMP: 'jump',
  SHIELD: 'shield',
  FREEZE: 'freeze',
  TELEPORT: 'teleport',
  MULTI_TAG: 'multi_tag',
  INVINCIBLE: 'invincible',
  MAGNET: 'magnet',
  
  // Spawning
  SPAWN_INTERVAL: 10, // seconds
  MAX_ACTIVE: 3,
  DESPAWN_TIME: 15, // seconds if not collected
  
  // Effects
  DURATION: 5.0, // seconds
  SPEED_MULTIPLIER: 1.5,
  JUMP_MULTIPLIER: 1.3,
  
  // Visual
  SIZE: 30,
  GLOW_RADIUS: 45,
  PULSE_SPEED: 2.0
};

/**
 * Platform constants
 */
window.PLATFORM = {
  // Types
  STATIC: 'static',
  MOVING: 'moving',
  ROTATING: 'rotating',
  DISAPPEARING: 'disappearing',
  BOUNCY: 'bouncy',
  
  // Properties
  MIN_WIDTH: 60,
  MAX_WIDTH: 300,
  MIN_HEIGHT: 15,
  MAX_HEIGHT: 30,
  
  // Movement
  MOVE_SPEED: 100, // pixels per second
  ROTATE_SPEED: Math.PI / 2, // radians per second
  MOVE_RANGE: 200, // pixels
  
  // Disappearing platforms
  APPEAR_TIME: 2.0, // seconds
  STABLE_TIME: 3.0, // seconds
  DISAPPEAR_TIME: 1.0, // seconds
  
  // Bouncy platforms
  BOUNCE_MULTIPLIER: 1.5,
  BOUNCE_DAMPING: 0.8
};

/**
 * Input constants
 */
window.INPUT = {
  // Keyboard
  UP: ['ArrowUp', 'w', 'W'],
  DOWN: ['ArrowDown', 's', 'S'],
  LEFT: ['ArrowLeft', 'a', 'A'],
  RIGHT: ['ArrowRight', 'd', 'D'],
  JUMP: [' ', 'ArrowUp', 'w', 'W'],
  ACTION: ['Enter', 'e', 'E'],
  TAG: ['Tab', 'q', 'Q'],
  PAUSE: ['Escape', 'p', 'P'],
  
  // Player 1 controls (WASD)
  P1_LEFT: ['a', 'A'],
  P1_RIGHT: ['d', 'D'],
  P1_UP: ['w', 'W'],
  P1_DOWN: ['s', 'S'],
  P1_JUMP: [' ', 'w', 'W'],
  
  // Player 2 controls (Arrow keys)
  P2_LEFT: ['ArrowLeft'],
  P2_RIGHT: ['ArrowRight'],
  P2_UP: ['ArrowUp'],
  P2_DOWN: ['ArrowDown'],
  P2_JUMP: ['Enter', 'ArrowUp'],
  
  // Player 3 controls (TFGH)
  P3_LEFT: ['f', 'F'],
  P3_RIGHT: ['h', 'H'],
  P3_UP: ['t', 'T'],
  P3_DOWN: ['g', 'G'],
  P3_JUMP: ['r', 'R', 't', 'T'],
  
  // Player 4 controls (IJKL)
  P4_LEFT: ['j', 'J'],
  P4_RIGHT: ['l', 'L'],
  P4_UP: ['i', 'I'],
  P4_DOWN: ['k', 'K'],
  P4_JUMP: ['o', 'O', 'i', 'I'],
  
  // Mouse
  MOUSE_LEFT: 0,
  MOUSE_RIGHT: 2,
  MOUSE_MIDDLE: 1,
  
  // Touch
  TAP_THRESHOLD: 10, // pixels
  TAP_TIME: 0.2, // seconds
  SWIPE_THRESHOLD: 50, // pixels
  
  // Gamepad
  GAMEPAD_DEADZONE: 0.15,
  GAMEPAD_VIBRATION_TIME: 200, // milliseconds
  GAMEPAD_VIBRATION_INTENSITY: 0.5
};

/**
 * Audio constants
 */
window.AUDIO = {
  // Volume levels
  MASTER_VOLUME: 1.0,
  SFX_VOLUME: 0.8,
  MUSIC_VOLUME: 0.6,
  
  // Sound effects
  SFX_TAG: 'tag.wav',
  SFX_JUMP: 'jump.wav',
  SFX_LAND: 'land.wav',
  SFX_POWERUP: 'powerup.wav',
  SFX_COLLISION: 'collision.wav',
  
  // Music tracks
  MUSIC_MENU: 'menu.ogg',
  MUSIC_GAME: 'game.ogg',
  MUSIC_RESULTS: 'results.ogg'
};

/**
 * Visual constants
 */
window.VISUAL = {
  // Particles
  PARTICLE_COUNT: 20,
  PARTICLE_LIFETIME: 1.0, // seconds
  PARTICLE_FADE_TIME: 0.5, // seconds
  
  // Screen effects
  SHAKE_DURATION: 0.5, // seconds
  SHAKE_INTENSITY: 5, // pixels
  FLASH_DURATION: 0.2, // seconds
  
  // UI
  UI_SCALE: 1.0,
  FONT_SIZE_SMALL: 16,
  FONT_SIZE_MEDIUM: 24,
  FONT_SIZE_LARGE: 36,
  
  // Animation
  ANIMATION_SPEED: 1.0,
  TRANSITION_TIME: 0.3 // seconds
};