import {
    BAR_Y_POSITION,
    BAR_BASE_WIDTH,
    BAR_BASE_HEIGHT,
    BAR_COLOR,
    BAR_MIN_SCALE_X,
    BAR_MAX_SCALE_X,
    BOOST_MAX_SCALE_X,
    BOOST_SHRINK_DURATION,
    BOOST_EXPAND_DURATION,
    BEAT_INTERVAL_MS
} from '../config/game-config.js';

export default class PlayerBar {
    constructor(scene) {
        this.scene = scene;
        this.gameWidth = scene.sys.game.config.width;
        
        // Create the bar rectangle
        this.barSprite = scene.add.rectangle(
            this.gameWidth / 2, 
            BAR_Y_POSITION, 
            BAR_BASE_WIDTH, 
            BAR_BASE_HEIGHT, 
            BAR_COLOR
        );
        
        // Set up physics
        scene.physics.add.existing(this.barSprite);
        if (this.barSprite.body) {
            this.barSprite.body.setImmovable(true);
            this.barSprite.body.allowGravity = false;
            this.barSprite.body.enable = false;
        }
        
        // Properties for animation
        this.barSprite.scaleX = 1;
        this.barSprite.baseWidth = BAR_BASE_WIDTH;
        this.barSprite.setVisible(false);
        
        // Boost animation states
        this.isBoosting = false;
        this.isExpandingToBoost = false;
        this.expandStartTime = 0;
        this.scaleOnBoostStart = 1;
        this.isShrinkingFromBoost = false;
        this.shrinkStartTime = 0;
        this.scaleOnBoostRelease = 1;
        
        // Beat timing
        this.lastBeatTime = 0;
    }
    
    // Enable the bar for gameplay
    enable() {
        this.barSprite.setVisible(true);
        if (this.barSprite.body) {
            this.barSprite.body.enable = true;
        }
        this.lastBeatTime = this.scene.time.now;
    }
    
    // Start boosting state when player activates boost
    startBoosting(time) {
        if (!this.isBoosting && !this.isShrinkingFromBoost) {
            this.isBoosting = true;
            this.isExpandingToBoost = true;
            this.expandStartTime = time;
            this.scaleOnBoostStart = this.barSprite.scaleX;
        }
    }
    
    // End boosting state
    endBoosting(time) {
        if (this.isBoosting) {
            this.isBoosting = false;
            this.isExpandingToBoost = false;
            this.isShrinkingFromBoost = true;
            this.shrinkStartTime = time;
            this.scaleOnBoostRelease = this.barSprite.scaleX;
        }
    }
    
    // Cancel shrinking if player immediately starts boosting again
    cancelShrinking() {
        this.isShrinkingFromBoost = false;
    }
    
    // Move the bar to follow pointer position
    moveToPointer(pointer) {
        const gamePointer = pointer;
        const barHalfWidth = this.barSprite.displayWidth / 2;
        this.barSprite.x = Phaser.Math.Clamp(
            gamePointer.x, 
            barHalfWidth, 
            this.gameWidth - barHalfWidth
        );
    }
    
    // Update bar's scale based on rhythm and boost state
    update(time) {
        // Calculate rhythm based scale
        const timeSinceLastBeat = (time - this.lastBeatTime);
        const beatProgress = (timeSinceLastBeat % BEAT_INTERVAL_MS) / BEAT_INTERVAL_MS;
        const pulseAmount = (Math.cos(beatProgress * Math.PI * 2) + 1) / 2;
        const baseTargetScaleX = BAR_MIN_SCALE_X + (BAR_MAX_SCALE_X - BAR_MIN_SCALE_X) * pulseAmount;
        
        // Calculate final scale based on boost states
        let finalTargetScaleX = baseTargetScaleX;
        
        if (this.isExpandingToBoost) {
            const elapsedExpandTime = time - this.expandStartTime;
            if (elapsedExpandTime < BOOST_EXPAND_DURATION) {
                const expandProgress = elapsedExpandTime / BOOST_EXPAND_DURATION;
                finalTargetScaleX = Phaser.Math.Interpolation.Linear(
                    [this.scaleOnBoostStart, BOOST_MAX_SCALE_X], 
                    expandProgress
                );
                finalTargetScaleX = Math.max(finalTargetScaleX, baseTargetScaleX);
            } else {
                this.isExpandingToBoost = false;
                finalTargetScaleX = BOOST_MAX_SCALE_X;
            }
        } else if (this.isBoosting) {
            finalTargetScaleX = BOOST_MAX_SCALE_X;
        } else if (this.isShrinkingFromBoost) {
            const elapsedShrinkTime = time - this.shrinkStartTime;
            if (elapsedShrinkTime < BOOST_SHRINK_DURATION) {
                const shrinkProgress = elapsedShrinkTime / BOOST_SHRINK_DURATION;
                finalTargetScaleX = Phaser.Math.Interpolation.Linear(
                    [this.scaleOnBoostRelease, baseTargetScaleX], 
                    shrinkProgress
                );
                finalTargetScaleX = Math.max(finalTargetScaleX, baseTargetScaleX);
            } else {
                this.isShrinkingFromBoost = false;
                finalTargetScaleX = baseTargetScaleX;
            }
        }
        
        // Apply the scale if valid
        if (!isNaN(finalTargetScaleX)) {
            this.barSprite.scaleX = finalTargetScaleX;
        }
        
        // Update beat time if a complete beat has passed
        if (timeSinceLastBeat >= BEAT_INTERVAL_MS) {
            this.lastBeatTime = time;
        }
    }
    
    // Disable the bar
    disable() {
        this.barSprite.setVisible(false);
        if (this.barSprite.body) {
            this.barSprite.body.enable = false;
        }
    }
    
    // Get the underlying Phaser game object for collision detection
    getGameObject() {
        return this.barSprite;
    }
} 