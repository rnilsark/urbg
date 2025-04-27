import PlayerBar from '../entities/PlayerBar.js';
import FallingItemManager from '../entities/FallingItem.js';
import GameUI from '../ui/GameUI.js';
import { 
    BOOST_MAX, 
    BOOST_START,
    BOOST_CONSUMPTION_RATE,
    BOOST_PASSIVE_RECHARGE_RATE,
    BOOST_RECHARGE_ON_CATCH,
    LIFE_MAX,
    LIFE_START,
    LIFE_COST_PER_MISS,
    LIFE_REPLENISH_ON_CATCH,
    BASE_ITEM_SPAWN_RATE_MS,
    MIN_ITEM_SPAWN_RATE_MS,
    ITEM_SPAWN_RATE_DECREASE_PER_LEVEL,
    BASE_ITEM_SPEED,
    ITEM_SPEED_INCREASE_PER_LEVEL,
    BASE_ITEM_SPAWN_PAIR_CHANCE,
    MAX_ITEM_SPAWN_PAIR_CHANCE,
    ITEM_SPAWN_PAIR_INCREASE_PER_LEVEL,
    BOOST_MAX_SCALE_X,
    BAR_BASE_WIDTH,
    LEVEL_THRESHOLDS,
    LEVEL_UP_FLASH_DURATION
} from '../config/game-config.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        
        // Game state
        this.gameState = 'prestart';
        this.isGameOver = false;
        
        // Game objects
        this.playerBar = null;
        this.itemManager = null;
        this.gameUI = null;
        
        // Game stats
        this.score = 0;
        this.boost = BOOST_START;
        this.currentLife = LIFE_START;
        this.currentLevel = 1;
        
        // Input state
        this.isPointerDown = false;
        this.isBoosting = false;
        
        // Timer objects
        this.itemSpawnTimer = null;
        
        // Game difficulty settings (updated as level increases)
        this.currentPairChance = BASE_ITEM_SPAWN_PAIR_CHANCE;
        this.currentItemSpeed = BASE_ITEM_SPEED;
        
        // Audio
        this.beatSound = null;
        
        // Scoreboard data
        this.scoreboardData = null;
    }
    
    preload() {
        console.log("preload starting");
        this.load.audio('beatSound', 'assets/beat.mp3');
        console.log("preload finished");
    }
    
    async create() {
        console.log("create starting");
        this.cameras.main.setBackgroundColor('#1a1a1a');
        this.gameState = 'prestart';
        
        // Set up game components
        this.setupAudio();
        this.setupGameObjects();
        this.setupPhysics();
        this.setupInput();
        
        // Load scoreboard data
        await this.fetchScoreboardData();
        this.gameUI.createScoreboard(this.scoreboardData);
        
        // Set up event for the start button
        this.gameUI.getStartButton().on('pointerdown', () => this.startGame());
        
        // Set up event for the play again button
        this.gameUI.getPlayAgainButton().on('pointerdown', () => {
            window.location.reload();
        });
        
        console.log("create finished - Waiting for Start Button.");
    }
    
    setupGameObjects() {
        // Create player bar
        this.playerBar = new PlayerBar(this);
        
        // Create item manager
        this.itemManager = new FallingItemManager(this);
        this.itemManager.setSpeed(this.currentItemSpeed);
        
        // Create UI
        this.gameUI = new GameUI(this);
        
        // Create item spawn timer (paused initially)
        this.itemSpawnTimer = this.time.addEvent({
            delay: BASE_ITEM_SPAWN_RATE_MS,
            callback: this.spawnItem,
            callbackScope: this,
            loop: true,
            paused: true
        });
    }
    
    setupPhysics() {
        // Set up collision detection between player bar and items
        this.physics.add.overlap(
            this.playerBar.getGameObject(),
            this.itemManager.getGroup(),
            this.handleCatch,
            null,
            this
        );
    }
    
    setupInput() {
        // Pointer down event
        this.input.on('pointerdown', () => {
            if (this.gameState !== 'playing' || this.isGameOver) return;
            
            this.isPointerDown = true;
            if (this.playerBar.isShrinkingFromBoost) {
                this.playerBar.cancelShrinking();
            }
        });
        
        // Pointer up event
        this.input.on('pointerup', () => {
            if (this.gameState !== 'playing' || this.isGameOver) return;
            this.isPointerDown = false;
        });
    }
    
    setupAudio() {
        // Set up audio with proper error handling
        try {
            this.beatSound = this.sound.add('beatSound', { 
                volume: 0.5,
                loop: true
            });
            console.log("Beat sound initialized successfully");
        } catch (e) {
            console.error("Could not initialize beat sound:", e);
        }
    }
    
    async fetchScoreboardData() {
        try {
            console.log('Fetching scoreboard data...');
            const response = await fetch('/api/scores');
            
            if (!response.ok) {
                // Log detailed error information
                const errorDetail = await response.text();
                console.error(`Score fetch failed with status ${response.status}:`, errorDetail);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.scoreboardData = data.scores || [];
            console.log("Fetched scoreboard data:", this.scoreboardData);
        } catch (error) {
            console.error("Error fetching scoreboard data:", error);
            this.scoreboardData = [];
            this.gameUI.showScoreboardError();
        }
    }
    
    async submitScore(playerName, score) {
        try {
            console.log(`Submitting score: ${playerName} - ${score}`);
            const response = await fetch('/api/scores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: playerName, score: score }),
            });
            
            // Get the detailed error information if request failed
            if (!response.ok) {
                const errorDetail = await response.text();
                console.error(`Score submission failed with status ${response.status}:`, errorDetail);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log("Score submitted successfully:", result);
            return result;
        } catch (error) {
            console.error("Error submitting score:", error);
            // Show a success message anyway to improve user experience even if the score wasn't saved
            alert("Thanks for playing! Note: There was an issue saving your score to the leaderboard.");
            return null;
        }
    }
    
    startGame() {
        if (this.gameState !== 'prestart') return;
        
        console.log("Starting game...");
        this.gameState = 'playing';
        
        // Hide scoreboard during play
        this.gameUI.hideScoreboard();
        
        // Show game UI and hide start button
        this.gameUI.hideStartButton();
        this.gameUI.showGameUI();
        
        // Enable player bar
        this.playerBar.enable();
        
        // Play beat sound
        this.playBeatSound();
        
        // Start item spawn timer
        if (this.itemSpawnTimer) {
            this.itemSpawnTimer.paused = false;
            console.log("Item spawn timer resumed.");
        }
    }
    
    playBeatSound() {
        if (this.beatSound) {
            try {
                this.beatSound.play();
                console.log("Beat sound playing");
            } catch (e) {
                console.error("Error playing beat sound:", e);
            }
        } else {
            console.error("Beat sound not available!");
            
            // Try to create it now if it wasn't created in create()
            try {
                this.beatSound = this.sound.add('beatSound', { 
                    volume: 0.5,
                    loop: true
                });
                this.beatSound.play();
                console.log("Beat sound created and playing on second try");
            } catch (e) {
                console.error("Second attempt to create beat sound failed:", e);
            }
        }
    }
    
    spawnItem() {
        if (this.gameState !== 'playing' || this.isGameOver) return;
        
        try {
            this.itemManager.spawnItems(
                this.currentPairChance,
                BAR_BASE_WIDTH,
                BOOST_MAX_SCALE_X
            );
        } catch (error) {
            console.error("ERROR in spawnItem:", error);
        }
    }
    
    handleCatch(bar, item) {
        if (this.gameState !== 'playing' || this.isGameOver) return;
        
        this.itemManager.handleCatch(item, (itemType) => {
            let gainedScore = 0;
            
            if (itemType === 'points') {
                this.score += 10;
                gainedScore = 10;
            }
            else if (itemType === 'boost') {
                this.boost = Math.min(BOOST_MAX, this.boost + BOOST_RECHARGE_ON_CATCH);
            }
            else if (itemType === 'life') {
                this.currentLife = Math.min(LIFE_MAX, this.currentLife + LIFE_REPLENISH_ON_CATCH);
            }
            
            if (gainedScore > 0) {
                this.checkForLevelUp();
            }
        });
    }
    
    checkForLevelUp() {
        if (this.gameState !== 'playing' || this.isGameOver) return;
        
        if (this.currentLevel <= LEVEL_THRESHOLDS.length && 
            this.score >= LEVEL_THRESHOLDS[this.currentLevel - 1]) {
            this.levelUp();
        }
    }
    
    levelUp() {
        if (this.gameState !== 'playing' || this.isGameOver) return;
        
        const levelReached = this.currentLevel + 1;
        const scoreThreshold = LEVEL_THRESHOLDS[this.currentLevel - 1];
        
        console.log(`Level Up! Reached Level ${levelReached} at score ${this.score} (Threshold: ${scoreThreshold})`);
        
        this.currentLevel = levelReached;
        
        // Visual flash effect
        this.cameras.main.flash(LEVEL_UP_FLASH_DURATION, 255, 255, 255);
        
        // Show level up text
        this.gameUI.showLevelUp(this.currentLevel);
        
        // Adjust item spawn rate
        const newDelay = Math.max(
            MIN_ITEM_SPAWN_RATE_MS, 
            BASE_ITEM_SPAWN_RATE_MS - (this.currentLevel - 1) * ITEM_SPAWN_RATE_DECREASE_PER_LEVEL
        );
        
        if (this.itemSpawnTimer) {
            this.itemSpawnTimer.delay = newDelay;
            console.log(`Level ${this.currentLevel}: Spawn delay reduced to ${newDelay}ms`);
        }
        
        // Adjust pair spawn chance
        this.currentPairChance = Math.min(
            MAX_ITEM_SPAWN_PAIR_CHANCE, 
            BASE_ITEM_SPAWN_PAIR_CHANCE + (this.currentLevel - 1) * ITEM_SPAWN_PAIR_INCREASE_PER_LEVEL
        );
        console.log(`Level ${this.currentLevel}: Pair spawn chance increased to ${(this.currentPairChance * 100).toFixed(0)}%`);
        
        // Update item speed based on level
        this.currentItemSpeed = BASE_ITEM_SPEED + (this.currentLevel - 1) * ITEM_SPEED_INCREASE_PER_LEVEL;
        console.log(`Level ${this.currentLevel}: Item speed increased to ${this.currentItemSpeed}`);
        
        // Update item manager with new speed
        this.itemManager.setSpeed(this.currentItemSpeed);
    }
    
    triggerGameOver() {
        if (this.isGameOver || this.gameState === 'prestart') return;
        
        console.log("GAME OVER triggered!");
        this.gameState = 'gameover';
        this.isGameOver = true;
        
        // Pause physics and item spawning
        this.physics.pause();
        if (this.itemManager) {
            this.itemManager.pause();
        }
        if (this.itemSpawnTimer) {
            this.itemSpawnTimer.paused = true;
        }
        
        // Stop audio
        this.stopBeatSound();
        
        // Update UI for game over
        this.gameUI.showGameOver();
        
        // Show score input modal
        const nameInputModal = document.getElementById('nameInputModal');
        const finalScoreDisplay = document.getElementById('finalScoreDisplay');
        const playerNameInput = document.getElementById('playerNameInput');
        const submitScoreBtn = document.getElementById('submitScoreBtn');
        
        finalScoreDisplay.textContent = `Your Score: ${this.score}`;
        nameInputModal.style.display = 'block';
        
        // Focus on the input
        setTimeout(() => {
            playerNameInput.focus();
        }, 100);
        
        // Set up submit button handler
        submitScoreBtn.onclick = async () => {
            const playerName = playerNameInput.value.trim();
            if (playerName) {
                await this.submitScore(playerName, this.score);
                nameInputModal.style.display = 'none';
                playerNameInput.value = '';
                await this.fetchScoreboardData();
                this.gameUI.createScoreboard(this.scoreboardData);
                this.gameUI.showScoreboard();
                this.gameUI.showPlayAgainButton();
            }
        };
    }
    
    stopBeatSound() {
        try {
            if (this.beatSound) {
                this.beatSound.stop();
                console.log("Beat sound stopped");
            }
        } catch (error) {
            console.error("Error stopping beat sound:", error);
        }
    }
    
    update(time, delta) {
        if (this.gameState !== 'playing' || this.isGameOver) {
            return;
        }
        
        // Update player bar position based on pointer
        this.playerBar.moveToPointer(this.input.activePointer);
        
        // Update player bar animation
        this.playerBar.update(time);
        
        // Boost processing
        this.processBoost(time, delta);
        
        // Update UI elements
        this.updateUI();
        
        // Update falling items and check for misses
        this.itemManager.update(() => {
            this.currentLife -= LIFE_COST_PER_MISS;
            this.currentLife = Math.max(0, this.currentLife);
        });
        
        // Check for game over condition
        if (this.currentLife <= 0 && !this.isGameOver) {
            this.triggerGameOver();
        }
    }
    
    processBoost(time, delta) {
        // Start boosting if pointer is down and boost is available
        if (this.isPointerDown && this.boost > 0 && !this.isBoosting) {
            this.isBoosting = true;
            this.playerBar.startBoosting(time);
        }
        
        // Consume boost while boosting
        if (this.isBoosting) {
            this.boost -= BOOST_CONSUMPTION_RATE * (delta / 1000);
            this.boost = Math.max(0, this.boost);
        }
        
        // End boosting if pointer is up or boost is depleted
        if ((!this.isPointerDown || this.boost <= 0) && this.isBoosting) {
            this.isBoosting = false;
            this.playerBar.endBoosting(time);
        }
        // Recharge boost when not boosting
        else if (!this.isPointerDown && !this.isBoosting) {
            if (this.boost < BOOST_MAX) {
                this.boost += BOOST_PASSIVE_RECHARGE_RATE * (delta / 1000);
                this.boost = Math.min(BOOST_MAX, this.boost);
            }
        }
    }
    
    updateUI() {
        // Update score display
        this.gameUI.updateScore(this.score);
        
        // Update boost meter
        this.gameUI.updateBoostMeter(this.boost);
        
        // Update life meter
        this.gameUI.updateLifeMeter(this.currentLife);
    }
} 