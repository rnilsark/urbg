import {
    BOOST_MAX,
    LIFE_MAX,
    BOOST_BAR_COLOR,
    BOOST_BAR_BG_COLOR,
    LIFE_BAR_COLOR,
    LIFE_BAR_BG_COLOR,
    LEVEL_UP_TEXT_FADE_DURATION,
    LEVEL_UP_TEXT_FADE_DELAY
} from '../config/game-config.js';

export default class GameUI {
    constructor(scene) {
        this.scene = scene;
        this.gameWidth = scene.sys.game.config.width;
        this.gameHeight = scene.sys.game.config.height;
        
        // Score display
        this.scoreText = scene.add.text(16, 16, 'Score: 0', { 
            fontSize: '24px', 
            fill: '#ffffff' 
        }).setDepth(5).setVisible(false);
        
        // Boost meter
        const meterWidth = 150;
        const meterHeight = 15;
        const boostMeterX = 10;
        const boostMeterY = 50;
        
        this.boostMeterBg = scene.add.rectangle(
            boostMeterX, boostMeterY, meterWidth, meterHeight, BOOST_BAR_BG_COLOR
        ).setOrigin(0, 0.5).setVisible(false);
        
        this.boostMeterFill = scene.add.rectangle(
            boostMeterX, boostMeterY, meterWidth, meterHeight, BOOST_BAR_COLOR
        ).setOrigin(0, 0.5).setVisible(false);
        
        // Life meter
        const lifeMeterX = this.gameWidth - meterWidth - 10;
        const lifeMeterY = 50;
        
        this.lifeMeterBg = scene.add.rectangle(
            lifeMeterX, lifeMeterY, meterWidth, meterHeight, LIFE_BAR_BG_COLOR
        ).setOrigin(0, 0.5).setVisible(false);
        
        this.lifeMeterFill = scene.add.rectangle(
            lifeMeterX, lifeMeterY, meterWidth, meterHeight, LIFE_BAR_COLOR
        ).setOrigin(0, 0.5).setVisible(false);
        
        // Game over text
        this.gameOverText = scene.add.text(
            this.gameWidth / 2, 
            this.gameHeight / 2 - 50, 
            'GAME OVER', 
            {
                fontSize: '48px', 
                fill: '#ff0000', 
                stroke: '#ffffff', 
                strokeThickness: 4
            }
        ).setOrigin(0.5).setVisible(false).setDepth(100);
        
        // Level up text
        this.levelUpText = scene.add.text(
            this.gameWidth / 2, 
            this.gameHeight / 2, 
            'Level 2', 
            {
                fontSize: '48px', 
                fill: '#ffff00', 
                stroke: '#000000', 
                strokeThickness: 4
            }
        ).setOrigin(0.5).setVisible(false).setAlpha(0).setDepth(100);
        
        // Start button
        this.startButton = scene.add.text(
            this.gameWidth / 2, 
            this.gameHeight / 2 + 80, 
            'Start Game', 
            {
                fontSize: '40px', 
                fill: '#fff', 
                backgroundColor: '#333', 
                padding: { x: 20, y: 10 }, 
                align: 'center'
            }
        )
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
        
        // Play again button (hidden initially)
        this.playAgainButton = scene.add.text(
            this.gameWidth / 2, 
            this.gameHeight / 2 + 50, 
            'Play Again', 
            {
                fontSize: '32px', 
                fill: '#ffffff', 
                backgroundColor: '#333', 
                padding: { x: 20, y: 10 }
            }
        )
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .setVisible(false);
        
        // Scoreboard container
        this.scoreboardContainer = null;
    }
    
    // Show game UI elements
    showGameUI() {
        this.scoreText.setVisible(true);
        this.boostMeterBg.setVisible(true);
        this.boostMeterFill.setVisible(true);
        this.lifeMeterBg.setVisible(true);
        this.lifeMeterFill.setVisible(true);
    }
    
    // Hide start button
    hideStartButton() {
        if (this.startButton) {
            this.startButton.destroy();
            this.startButton = null;
        }
    }
    
    // Update score display
    updateScore(score) {
        this.scoreText.setText('Score: ' + score);
    }
    
    // Update boost meter fill
    updateBoostMeter(boostValue) {
        if (this.boostMeterFill && this.boostMeterBg) {
            this.boostMeterFill.width = Phaser.Math.Clamp(
                (boostValue / BOOST_MAX), 0, 1
            ) * this.boostMeterBg.width;
        }
    }
    
    // Update life meter fill
    updateLifeMeter(lifeValue) {
        if (this.lifeMeterFill && this.lifeMeterBg) {
            const lifePercent = Phaser.Math.Clamp((lifeValue / LIFE_MAX), 0, 1);
            this.lifeMeterFill.width = lifePercent * this.lifeMeterBg.width;
        }
    }
    
    // Show level up text with animation
    showLevelUp(level) {
        this.levelUpText.setText('Level ' + level);
        this.levelUpText.setAlpha(1);
        this.levelUpText.setVisible(true);
        
        this.scene.tweens.add({
            targets: this.levelUpText,
            alpha: 0,
            duration: LEVEL_UP_TEXT_FADE_DURATION,
            delay: LEVEL_UP_TEXT_FADE_DELAY,
            onComplete: () => {
                if (this.levelUpText) {
                    this.levelUpText.setVisible(false);
                }
            }
        });
    }
    
    // Show game over text
    showGameOver() {
        if (this.gameOverText) {
            this.gameOverText.setVisible(true);
        }
        if (this.lifeMeterFill) {
            this.lifeMeterFill.width = 0;
        }
    }
    
    // Show play again button
    showPlayAgainButton() {
        this.playAgainButton.setVisible(true);
    }
    
    // Create scoreboard display
    createScoreboard(scoreboardData) {
        // Remove existing scoreboard if it exists
        if (this.scoreboardContainer) {
            this.scoreboardContainer.destroy(true);
        }

        // Create container for all scoreboard elements
        this.scoreboardContainer = this.scene.add.container(this.gameWidth / 2, 120);
        
        // Background
        const bg = this.scene.add.rectangle(0, 0, 400, 160, 0x000000, 0.6)
            .setOrigin(0.5, 0.5);
        this.scoreboardContainer.add(bg);
        
        // Title
        const title = this.scene.add.text(0, -65, 'LEADERBOARD', {
            fontSize: '24px',
            fontStyle: 'bold',
            fill: '#ffff33',
            align: 'center'
        }).setOrigin(0.5, 0.5);
        this.scoreboardContainer.add(title);
        
        // Create table headers
        const rankHeader = this.scene.add.text(-150, -35, 'RANK', {
            fontSize: '16px',
            fill: '#aaaaaa',
            align: 'left'
        }).setOrigin(0, 0.5);
        
        const nameHeader = this.scene.add.text(-100, -35, 'NAME', {
            fontSize: '16px',
            fill: '#aaaaaa',
            align: 'left'
        }).setOrigin(0, 0.5);
        
        const scoreHeader = this.scene.add.text(100, -35, 'SCORE', {
            fontSize: '16px',
            fill: '#aaaaaa',
            align: 'right'
        }).setOrigin(0, 0.5);
        
        this.scoreboardContainer.add([rankHeader, nameHeader, scoreHeader]);
        
        // Add divider line
        const line = this.scene.add.line(-180, -20, 0, 0, 360, 0, 0xaaaaaa)
            .setOrigin(0, 0.5)
            .setLineWidth(1);
        this.scoreboardContainer.add(line);
        
        // Display top 5 scores or fewer if not available
        const scores = scoreboardData || [];
        const displayCount = Math.min(scores.length, 5);
        
        for (let i = 0; i < displayCount; i++) {
            const yPos = -10 + i * 25;
            const score = scores[i];
            
            const rank = this.scene.add.text(-150, yPos, `${i + 1}`, {
                fontSize: '16px',
                fill: '#ffffff',
                align: 'left'
            }).setOrigin(0, 0.5);
            
            const name = this.scene.add.text(-100, yPos, score.player_name, {
                fontSize: '16px',
                fill: '#ffffff',
                align: 'left'
            }).setOrigin(0, 0.5);
            
            const scoreText = this.scene.add.text(100, yPos, `${score.score}`, {
                fontSize: '16px',
                fill: '#ffffff',
                align: 'right'
            }).setOrigin(0, 0.5);
            
            this.scoreboardContainer.add([rank, name, scoreText]);
        }
        
        // If we have fewer than 5 scores, fill with empty rows
        for (let i = displayCount; i < 5; i++) {
            const yPos = -10 + i * 25;
            
            const rank = this.scene.add.text(-150, yPos, `${i + 1}`, {
                fontSize: '16px', 
                fill: '#555555',
                align: 'left'
            }).setOrigin(0, 0.5);
            
            const empty = this.scene.add.text(-100, yPos, '---', {
                fontSize: '16px',
                fill: '#555555', 
                align: 'left'
            }).setOrigin(0, 0.5);
            
            const emptyScore = this.scene.add.text(100, yPos, '---', {
                fontSize: '16px',
                fill: '#555555',
                align: 'right'
            }).setOrigin(0, 0.5);
            
            this.scoreboardContainer.add([rank, empty, emptyScore]);
        }
    }
    
    // Hide scoreboard
    hideScoreboard() {
        if (this.scoreboardContainer) {
            this.scoreboardContainer.visible = false;
        }
    }
    
    // Show scoreboard
    showScoreboard() {
        if (this.scoreboardContainer) {
            this.scoreboardContainer.visible = true;
        }
    }
    
    // Display error message for scoreboard
    showScoreboardError() {
        if (this.scoreboardContainer) {
            this.scoreboardContainer.destroy(true);
        }
        
        this.scoreboardContainer = this.scene.add.container(this.gameWidth / 2, 120);
        const bg = this.scene.add.rectangle(0, 0, 400, 100, 0x000000, 0.6).setOrigin(0.5, 0.5);
        this.scoreboardContainer.add(bg);
        
        const title = this.scene.add.text(0, -30, 'LEADERBOARD', {
            fontSize: '24px',
            fontStyle: 'bold',
            fill: '#ffff33',
            align: 'center'
        }).setOrigin(0.5, 0.5);
        
        const errorMsg = this.scene.add.text(0, 10, 'Scoreboard temporarily unavailable', {
            fontSize: '16px',
            fill: '#ffffff',
            align: 'center'
        }).setOrigin(0.5, 0.5);
        
        this.scoreboardContainer.add([title, errorMsg]);
    }
    
    // Get the start button game object for event handling
    getStartButton() {
        return this.startButton;
    }
    
    // Get the play again button for event handling
    getPlayAgainButton() {
        return this.playAgainButton;
    }
} 