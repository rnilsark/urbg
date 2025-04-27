import { 
    ITEM_SIZE,
    ITEM_COLOR_POINTS, 
    ITEM_COLOR_BOOST, 
    ITEM_COLOR_LIFE,
    ITEM_TYPE_PROBABILITY
} from '../config/game-config.js';

export default class FallingItemManager {
    constructor(scene) {
        this.scene = scene;
        this.gameHeight = scene.sys.game.config.height;
        
        // Create physics group for items
        this.itemsGroup = scene.physics.add.group({
            allowGravity: false,
            classType: Phaser.GameObjects.Rectangle
        });
        
        // Current item speed - will be updated as level increases
        this.currentSpeed = 0;
    }
    
    // Set the speed for falling items
    setSpeed(speed) {
        this.currentSpeed = speed;
        
        // Update existing active items to new speed
        this.itemsGroup.children.each(item => {
            if (item.active && item.body) {
                item.body.velocity.y = speed;
            }
        });
    }
    
    // Create a single item of a specified type at the given position
    createItem(x, y, itemType) {
        const item = this.itemsGroup.get(x, y);
        
        if (item) {
            item.setActive(true).setVisible(true);
            item.itemType = itemType;
            
            // Set color based on item type
            let itemColor = ITEM_COLOR_POINTS;
            if (itemType === 'boost') {
                itemColor = ITEM_COLOR_BOOST;
            } else if (itemType === 'life') {
                itemColor = ITEM_COLOR_LIFE;
            }
            
            item.setFillStyle(itemColor);
            item.setSize(ITEM_SIZE, ITEM_SIZE);
            item.setDisplaySize(ITEM_SIZE, ITEM_SIZE);
            
            // Set up physics
            this.scene.physics.world.enable(item);
            if (item.body) {
                item.body.enable = true;
                item.body.reset(x, y);
                item.body.setSize(ITEM_SIZE, ITEM_SIZE);
                item.body.velocity.y = this.currentSpeed;
            }
        }
        
        return item;
    }
    
    // Spawn new item(s) - either as single or as pair
    spawnItems(pairChance, barBaseWidth, maxBoostScale) {
        // Determine item type randomly based on probability
        let itemType = 'points';
        const rand = Phaser.Math.FloatBetween(0, 1);
        const lifeProb = ITEM_TYPE_PROBABILITY.life;
        const boostProb = ITEM_TYPE_PROBABILITY.boost;
        
        if (rand < lifeProb) {
            itemType = 'life';
        } else if (rand < lifeProb + boostProb) {
            itemType = 'boost';
        }
        
        // Check if we should spawn a pair
        if (Phaser.Math.FloatBetween(0, 1) < pairChance) {
            this.spawnItemPair(itemType, barBaseWidth, maxBoostScale);
        } else {
            // Just spawn a single item at random X position
            const gameWidth = this.scene.sys.game.config.width;
            const x = Phaser.Math.Between(ITEM_SIZE / 2, gameWidth - ITEM_SIZE / 2);
            this.createItem(x, -ITEM_SIZE, itemType);
        }
    }
    
    // Spawn a pair of items with appropriate spacing
    spawnItemPair(itemType, barBaseWidth, maxBoostScale) {
        const gameWidth = this.scene.sys.game.config.width;
        
        // Calculate min/max spread based on bar scales
        const minSpread = (barBaseWidth * 1.2) + ITEM_SIZE * 0.5;  // For base boost scale
        const maxSpread = (barBaseWidth * maxBoostScale) - ITEM_SIZE * 1.5;  // For max boost
        const safeMaxSpread = Math.max(minSpread + ITEM_SIZE, maxSpread);
        
        if (safeMaxSpread > minSpread) {
            // Calculate random spread between items
            const spread = Phaser.Math.Between(minSpread, safeMaxSpread);
            
            // Calculate valid range for center position
            const centerMinX = Math.max(ITEM_SIZE / 2, spread / 2 + ITEM_SIZE / 2);
            const centerMaxX = Math.min(gameWidth - ITEM_SIZE / 2, gameWidth - spread / 2 - ITEM_SIZE / 2);
            
            if (centerMaxX > centerMinX) {
                // Place items symmetrically around random center point
                const centerX = Phaser.Math.Between(centerMinX, centerMaxX);
                const x1 = centerX - spread / 2;
                const x2 = centerX + spread / 2;
                const y = -ITEM_SIZE;
                
                this.createItem(x1, y, itemType);
                this.createItem(x2, y, itemType);
            } else {
                // Fallback to single item if constraints can't be satisfied
                this.createItem(
                    Phaser.Math.Between(ITEM_SIZE / 2, gameWidth - ITEM_SIZE / 2), 
                    -ITEM_SIZE, 
                    itemType
                );
            }
        } else {
            // Fallback to single item if spread calculations don't work
            this.createItem(
                Phaser.Math.Between(ITEM_SIZE / 2, gameWidth - ITEM_SIZE / 2), 
                -ITEM_SIZE, 
                itemType
            );
        }
    }
    
    // Check for and remove items that have fallen below the screen
    update(lifeLossCallback) {
        this.itemsGroup.children.each(item => {
            if (item.active && item.y > this.gameHeight + item.displayHeight) {
                // If it's a point item, trigger life loss
                if (item.itemType === 'points') {
                    lifeLossCallback();
                }
                
                // Remove the item
                this.itemsGroup.killAndHide(item);
                if (item.body) {
                    item.body.stop();
                    item.body.enable = false;
                }
            }
        });
    }
    
    // Handle collision with player bar
    handleCatch(item, catchCallback) {
        if (!item || !item.active) return;
        
        catchCallback(item.itemType);
        
        // Remove the item
        this.itemsGroup.killAndHide(item);
        if (item.body) {
            item.body.stop();
            item.body.enable = false;
        }
    }
    
    // Get the physics group for collision detection
    getGroup() {
        return this.itemsGroup;
    }
    
    // Pause all items (for game over)
    pause() {
        this.itemsGroup.children.each(item => {
            if (item.body) {
                item.body.stop();
            }
        });
    }
} 