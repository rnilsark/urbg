// Constants

// Game dimensions
export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 640;
export const BAR_Y_POSITION = GAME_HEIGHT - 50;
export const BAR_BASE_HEIGHT = 20;
export const BAR_BASE_WIDTH = 100;

// Game rhythm
export const BPM = 120;
export const BEAT_INTERVAL_MS = 60000 / BPM;

// Bar Scaling / Animation
export const BAR_MIN_SCALE_X = 0.8;
export const BAR_MAX_SCALE_X = 1.2;
export const BOOST_MAX_SCALE_X = 2.5;
export const BOOST_SHRINK_DURATION = 4000;
export const BOOST_EXPAND_DURATION = 500;

// Boost System
export const BOOST_MAX = 100;
export const BOOST_START = BOOST_MAX;
export const BOOST_CONSUMPTION_RATE = 50;
export const BOOST_PASSIVE_RECHARGE_RATE = 5;
export const BOOST_RECHARGE_ON_CATCH = 35;

// Item System
export const BASE_ITEM_SPAWN_RATE_MS = 1000;
export const MIN_ITEM_SPAWN_RATE_MS = 300;
export const ITEM_SPAWN_RATE_DECREASE_PER_LEVEL = 100;
export const BASE_ITEM_SPEED = 150;
export const ITEM_SPEED_INCREASE_PER_LEVEL = 30;
export const ITEM_SIZE = 20;
export const BASE_ITEM_SPAWN_PAIR_CHANCE = 0.15;
export const MAX_ITEM_SPAWN_PAIR_CHANCE = 0.50;
export const ITEM_SPAWN_PAIR_INCREASE_PER_LEVEL = 0.05;
export const ITEM_TYPE_PROBABILITY = { points: 0.75, boost: 0.15, life: 0.10 };

// Life System
export const LIFE_MAX = 100;
export const LIFE_START = LIFE_MAX;
export const LIFE_COST_PER_MISS = 20;
export const LIFE_REPLENISH_ON_CATCH = 15;

// Leveling System
export const LEVEL_THRESHOLDS = [300, 800, 1500, 2500, 4000];
export const LEVEL_UP_FLASH_DURATION = 500;
export const LEVEL_UP_TEXT_FADE_DELAY = 500;
export const LEVEL_UP_TEXT_FADE_DURATION = 1500;

// Colors
export const BAR_COLOR = 0x00ff00;
export const ITEM_COLOR_POINTS = 0x00ff00;
export const ITEM_COLOR_BOOST = 0x00aaff;
export const ITEM_COLOR_LIFE = 0xff0000;
export const BOOST_BAR_COLOR = 0x00aaff;
export const BOOST_BAR_BG_COLOR = 0x444444;
export const LIFE_BAR_COLOR = 0xff0000;
export const LIFE_BAR_BG_COLOR = 0x444444;

// Phaser Game Configuration
export const gameConfig = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'phaser-game',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: GAME_WIDTH,
        height: GAME_HEIGHT
    },
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },
    audio: { 
        disableWebAudio: false,
        noAudio: false
    }
}; 