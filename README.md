# Rhythm Bar Game

A rhythm-based game built with Next.js and Phaser. Control a bar at the bottom of the screen to catch falling items in sync with the beat.

## Features

- Dynamic difficulty scaling
- Boost mechanic for wider bar width
- Life system
- Level progression

## Tech Stack

- Next.js
- React
- Phaser 3
- CSS

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to play the game.

## Building for Production

```bash
npm run build
npm start
```

## How to Play

- Click and hold to activate boost (makes your bar wider)
- Move your mouse or touch to position the bar
- Catch falling items to score points
- Green items: points
- Blue items: boost recharge
- Red items: life restoration
- Missing green items costs life
- Game ends when your life reaches zero
