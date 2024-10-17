import { Paddle } from './paddle.js';
import { Ball } from './ball.js';

export class Game {
    constructor(config) {
        this.canvas = document.getElementById("game");
        this.ctx = this.canvas.getContext("2d");

        // Scales the resolution of the drawing
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        this.canvas.width = width * window.devicePixelRatio;
        this.canvas.height = height * window.devicePixelRatio;

        this.paddle = new Paddle(config);
        this.ball = new Ball(config);

        // Binds mouseover event to handleMouse
        this.canvas.addEventListener("mousemove", this.paddle.handleMouse.bind(this));

        this.lastTime = 0;
    }

    play(timestamp) {
        if (!this.lastTime)
            this.lastTime = timestamp;

        const deltaTime = (timestamp - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = timestamp;

        this.update(deltaTime, this.canvas.width, this.canvas.height);

        this.render();
    }

    update(deltaTime, canvasWidth, canvasHeight) {
        this.ball.update(deltaTime, canvasWidth, canvasHeight);
    }

    render() {
        this.clear();

        this.ball.render(this.ctx);
        this.paddle.render(this.ctx);
    }

    // Clear display
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

}