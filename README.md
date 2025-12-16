# Multi-Tag Game

A 4-player local multiplayer tag game with power-ups, platforms, and multiple game modes.

## Quick Start

1. Open `index.html` in a web browser
2. Game starts automatically
3. Player 1: Arrow keys/WASD to move, Space/Up/W to jump
4. Player 2: J/L to move, I/O to jump
5. Players 3-4 are AI-controlled

## Game Features

- **4 Players**: 2 human players + 2 AI players
- **Tag Mechanics**: Tag other players to score points
- **Power-ups**: Speed boost, jump boost, shield
- **Platforms**: Static and moving platforms
- **AI Opponents**: Smart AI that chases or runs away
- **Real-time Physics**: Smooth movement and collisions

## Controls

### Player 1 (Green)
- Movement: Arrow keys or A/D
- Jump: Space, W, or Up Arrow

### Player 2 (Blue)  
- Movement: J/L keys
- Jump: I or O keys

### General
- Pause: Escape key
- Game auto-starts when loaded

## Scoring

- Tag another player: 10 points
- Collect power-up: 5 points
- Survival time: 1 point per second

## Game Modes

- **Classic Tag**: Traditional tag game
- **Time Attack**: Race against the clock
- **Elimination**: Last player standing wins

## Technical Features

- 60 FPS gameplay with delta time
- Object pooling for performance
- Advanced collision detection
- Smooth physics simulation
- Responsive canvas rendering

## Development

Built with vanilla JavaScript and HTML5 Canvas. No external dependencies required.

Enjoy the game!