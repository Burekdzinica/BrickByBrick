import { Game } from './classes/game.js';

let config = null;
let game = null;

async function loadConfig() {
    if (!config) {
        const response = await fetch('./config.json');
        config = await response.json(); 
    }
    
    game = new Game(config);
}

function gameLoop(game, timestamp) {
    game.play(timestamp);

    requestAnimationFrame(gameLoop.bind(null, game)); 
}

// Load config then game play
loadConfig().then(() => {
    requestAnimationFrame(gameLoop.bind(null, game));
});
