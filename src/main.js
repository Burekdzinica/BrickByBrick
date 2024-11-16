import { Game } from './classes/game.js';

let config = null;
let game = null;

async function loadConfig() {
    if (!config) {
        try {
            const response = await fetch('./config.json');
            if (!response.ok) throw new Error(`Failed to load config: ${response.status}`);
            config = await response.json();
        } 
        catch (error) {
            console.error('Error loading config:', error);
            return null;
        }
    }
    game = new Game(config);
}

loadConfig().then(() => {
    if (game) {
        requestAnimationFrame(gameLoop);
    } 
    else {
        console.error('Game initialization failed.');
    }
});

const targetFPS = 60;
const frameDuration = 1000 / targetFPS;
let lastFrameTime = 0;

function gameLoop(timestamp) {
    // Calculate the time since the last frame
    const timeSinceLastFrame = timestamp - lastFrameTime;

    if (timeSinceLastFrame >= frameDuration) {
        lastFrameTime = timestamp;

        const deltaTime = timeSinceLastFrame / 1000;
        game.play(deltaTime);
    }

    requestAnimationFrame(gameLoop);
}

// Start the loop
requestAnimationFrame(gameLoop);



