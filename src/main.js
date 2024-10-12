import { Game } from './classes/game.js';

const game = new Game;

function gameLoop() {
    game.play();
    requestAnimationFrame(gameLoop); // Improves performance by browser
}

gameLoop();