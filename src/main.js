import { Game } from './classes/game.js';

let config = null;

async function loadConfig() {
    if (!config) {
        const response = await fetch('./config.json');
        config = await response.json(); 
    }

    const game = new Game(config);

    requestAnimationFrame(gameLoop.bind(null, game));
}

function gameLoop(game, timestamp) {
    game.play(timestamp);
    requestAnimationFrame(gameLoop.bind(null, game)); 
}

loadConfig();


// TODO: fix this mess