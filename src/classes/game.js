import { Paddle } from './paddle.js';

export class Game {
    constructor() {
        this.canvas = document.getElementById("game");
        this.ctx = this.canvas.getContext("2d");

        // Scales the resolution of the drawing
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        this.canvas.width = width * window.devicePixelRatio;
        this.canvas.height = height * window.devicePixelRatio;

        this.paddle = new Paddle;

        // Binds mouseover event to handleMouse
        this.canvas.addEventListener("mousemove", this.paddle.handleMouse.bind(this));
    }

    play() {
        // this.handleEvents();

        this.update();

        this.render();
    }

    update() {

    }

    render() {
        this.clear();

        this.paddle.render(this.ctx);
    }

    // Clear display
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

}