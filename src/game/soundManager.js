// Sound system for game audio effects
window.FILE_MANIFEST = window.FILE_MANIFEST || [];
window.FILE_MANIFEST.push({
  name: 'src/game/soundManager.js',
  exports: ['SoundManager', 'soundManager'],
  dependencies: ['AUDIO']
});

/**
 * Sound Manager for handling all game audio
 */
window.SoundManager = class {
  constructor() {
    this.sounds = new Map();
    this.volume = {
      master: 1.0,
      sfx: window.AUDIO.SFX_VOLUME,
      music: window.AUDIO.MUSIC_VOLUME
    };
    this.isMuted = false;
    this.audioContext = null;
    this.masterGainNode = null;
    this.sfxGainNode = null;
    this.musicGainNode = null;
    
    this.initializeAudioContext();
    this.createFallbackSounds();
  }

  /**
   * Initialize Web Audio API
   */
  initializeAudioContext() {
    try {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new window.AudioContext();
      
      // Create gain nodes for volume control
      this.masterGainNode = this.audioContext.createGain();
      this.sfxGainNode = this.audioContext.createGain();
      this.musicGainNode = this.audioContext.createGain();
      
      // Connect nodes
      this.masterGainNode.connect(this.audioContext.destination);
      this.sfxGainNode.connect(this.masterGainNode);
      this.musicGainNode.connect(this.masterGainNode);
      
      // Set initial volumes
      this.updateVolumes();
      
      console.log('Audio system initialized');
    } catch (error) {
      console.warn('Web Audio API not supported, using fallback:', error);
      this.audioContext = null;
    }
  }

  /**
   * Create fallback sounds using Web Audio API oscillators
   */
  createFallbackSounds() {
    // Jump sound - ascending tone
    this.sounds.set('jump', () => this.playTone(400, 0.1, 'sine', 0.3));
    
    // Tag sound - impact sound
    this.sounds.set('tag', () => this.playImpact(0.15));
    
    // Powerup collect sound - magical chime
    this.sounds.set('powerup', () => this.playChime(0.3));
    
    // Land sound - soft thud
    this.sounds.set('land', () => this.playTone(150, 0.1, 'triangle', 0.2));
    
    // Victory sound - fanfare
    this.sounds.set('victory', () => this.playFanfare(0.8));
    
    // Menu select sound - click
    this.sounds.set('select', () => this.playTone(600, 0.05, 'square', 0.1));
    
    // Error sound - buzz
    this.sounds.set('error', () => this.playBuzz(0.2));
    
    // Background music - ambient loop
    this.sounds.set('music', () => this.playAmbientLoop());
  }

  /**
   * Play a tone with Web Audio API
   * @param {number} frequency - Frequency in Hz
   * @param {number} duration - Duration in seconds
   * @param {string} type - Wave type ('sine', 'square', 'triangle', 'sawtooth')
   * @param {number} volume - Volume (0-1)
   */
  playTone(frequency, duration, type = 'sine', volume = 0.5) {
    if (!this.audioContext || this.isMuted) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(this.sfxGainNode);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.error('Error playing tone:', error);
    }
  }

  /**
   * Play impact sound for tagging
   * @param {number} duration - Duration in seconds
   */
  playImpact(duration = 0.15) {
    if (!this.audioContext || this.isMuted) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      const filter = this.audioContext.createBiquadFilter();
      
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + duration);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
      filter.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + duration);
      
      gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
      
      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.sfxGainNode);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.error('Error playing impact:', error);
    }
  }

  /**
   * Play magical chime for powerups
   * @param {number} duration - Duration in seconds
   */
  playChime(duration = 0.3) {
    if (!this.audioContext || this.isMuted) return;

    try {
      const frequencies = [523, 659, 784, 1047]; // C, E, G, C (octave higher)
      
      frequencies.forEach((freq, index) => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime + index * 0.05);
        
        const startTime = this.audioContext.currentTime + index * 0.05;
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGainNode);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.2);
      });
    } catch (error) {
      console.error('Error playing chime:', error);
    }
  }

  /**
   * Play fanfare for victory
   * @param {number} duration - Duration in seconds
   */
  playFanfare(duration = 0.8) {
    if (!this.audioContext || this.isMuted) return;

    try {
      const notes = [
        { freq: 523, start: 0, duration: 0.15 }, // C
        { freq: 659, start: 0.15, duration: 0.15 }, // E
        { freq: 784, start: 0.3, duration: 0.15 }, // G
        { freq: 1047, start: 0.45, duration: 0.35 } // C (high)
      ];
      
      notes.forEach(note => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(note.freq, this.audioContext.currentTime + note.start);
        
        const startTime = this.audioContext.currentTime + note.start;
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
        gainNode.gain.setValueAtTime(0.2, startTime + note.duration - 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + note.duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGainNode);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + note.duration);
      });
    } catch (error) {
      console.error('Error playing fanfare:', error);
    }
  }

  /**
   * Play buzz sound for errors
   * @param {number} duration - Duration in seconds
   */
  playBuzz(duration = 0.2) {
    if (!this.audioContext || this.isMuted) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(100, this.audioContext.currentTime);
      oscillator.frequency.linearRampToValueAtTime(50, this.audioContext.currentTime + duration);
      
      gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(this.sfxGainNode);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.error('Error playing buzz:', error);
    }
  }

  /**
   * Play ambient background music loop
   */
  playAmbientLoop() {
    if (!this.audioContext || this.isMuted || this.musicPlaying) return;

    try {
      const createNote = (freq, startTime, duration) => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime + startTime);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime + startTime);
        gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + startTime + 0.5);
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime + startTime + duration - 0.5);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + startTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.musicGainNode);
        
        oscillator.start(this.audioContext.currentTime + startTime);
        oscillator.stop(this.audioContext.currentTime + startTime + duration);
      };

      // Create ambient chord progression
      const progression = [
        { note: 261.63, start: 0, duration: 2 },    // C
        { note: 329.63, start: 0, duration: 2 },    // E
        { note: 392.00, start: 0, duration: 2 },    // G
        { note: 293.66, start: 2, duration: 2 },    // D
        { note: 369.99, start: 2, duration: 2 },    // F#
        { note: 440.00, start: 2, duration: 2 },    // A
        { note: 349.23, start: 4, duration: 2 },    // F
        { note: 440.00, start: 4, duration: 2 },    // A
        { note: 523.25, start: 4, duration: 2 }     // C
      ];

      // Play progression
      progression.forEach(({ note, start, duration }) => {
        createNote(note, start, duration);
      });

      // Loop every 6 seconds
      this.musicInterval = setInterval(() => {
        if (!this.isMuted && this.musicPlaying) {
          progression.forEach(({ note, start, duration }) => {
            createNote(note, start, duration);
          });
        }
      }, 6000);

      this.musicPlaying = true;
    } catch (error) {
      console.error('Error playing ambient music:', error);
    }
  }

  /**
   * Stop background music
   */
  stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.musicPlaying = false;
  }

  /**
   * Play a sound by name
   * @param {string} soundName - Name of sound to play
   */
  play(soundName) {
    const sound = this.sounds.get(soundName);
    if (sound) {
      sound();
    } else {
      console.warn(`Sound '${soundName}' not found`);
    }
  }

  /**
   * Update volume levels
   */
  updateVolumes() {
    if (!this.audioContext) return;

    if (this.masterGainNode) {
      this.masterGainNode.gain.setValueAtTime(this.volume.master, this.audioContext.currentTime);
    }
    if (this.sfxGainNode) {
      this.sfxGainNode.gain.setValueAtTime(this.volume.sfx, this.audioContext.currentTime);
    }
    if (this.musicGainNode) {
      this.musicGainNode.gain.setValueAtTime(this.volume.music, this.audioContext.currentTime);
    }
  }

  /**
   * Set master volume
   * @param {number} volume - Volume level (0-1)
   */
  setMasterVolume(volume) {
    this.volume.master = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
  }

  /**
   * Set SFX volume
   * @param {number} volume - Volume level (0-1)
   */
  setSFXVolume(volume) {
    this.volume.sfx = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
  }

  /**
   * Set music volume
   * @param {number} volume - Volume level (0-1)
   */
  setMusicVolume(volume) {
    this.volume.music = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
  }

  /**
   * Toggle mute state
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    
    if (this.audioContext) {
      if (this.isMuted) {
        this.masterGainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      } else {
        this.updateVolumes();
      }
    }

    if (this.isMuted) {
      this.stopMusic();
    } else {
      this.play('music');
    }
  }

  /**
   * Resume audio context (required after user interaction)
   */
  resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  /**
   * Get current volume settings
   * @returns {Object} Volume settings
   */
  getVolumes() {
    return { ...this.volume, isMuted: this.isMuted };
  }

  /**
   * Get available sounds list
   * @returns {Array} Array of sound names
   */
  getAvailableSounds() {
    return Array.from(this.sounds.keys());
  }

  /**
   * Cleanup audio resources
   */
  cleanup() {
    this.stopMusic();
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
};

// Global sound manager instance
window.soundManager = new window.SoundManager();