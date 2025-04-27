import { gameConfig } from './config/game-config.js';
import GameScene from './scenes/GameScene.js';

// Register game scenes
gameConfig.scene = [GameScene];

// Initialize Phaser game
document.addEventListener('DOMContentLoaded', () => {
    console.log("Creating Phaser game instance...");
    
    try {
        const game = new Phaser.Game(gameConfig);
        console.log("Phaser game instance created.");
    } catch (error) {
        console.error("FATAL ERROR creating Phaser game:", error);
    }
}); 