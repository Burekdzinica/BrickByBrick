import { Paddle } from './paddle.js';
import { Ball } from './ball.js';
import { Block } from './block.js';

import { gameState } from './gameStates.js';

import { Button } from './components/button.js';

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
        this.block = new Block(config);
        this.blocks = [];

        let position = {x:200, y:100};
        this.button = new Button(200, 50, position);

        // Binds mouseover event to handleMouse
        this.canvas.addEventListener("mousemove", this.paddle.handleMouse.bind(this));
        this.canvas.addEventListener("mousemove", this.button.handleMouseHover.bind(this));

        this.currentState = gameState.EDIT_MODE;

        this.lastTime = 0;
    }

    play(timestamp) {
        switch (this.currentState) {
            case gameState.MAIN_MENU: 
                // this.button.update();
                this.button.render(this.ctx);
            
                break;
            
            case gameState.PLAYING:
                if (!this.lastTime)
                    this.lastTime = timestamp;
        
                const deltaTime = (timestamp - this.lastTime) / 1000; // Convert to seconds
                this.lastTime = timestamp;

                this.update(deltaTime, this.canvas.width, this.canvas.height);
    
                this.render();

                break;

            case gameState.EDIT_MODE:
                this.canvas.addEventListener('click', (event) => {
                    const rect = this.canvas.getBoundingClientRect();
                    const x = event.clientX - rect.left; // Calculate x position relative to canvas
                    const y = event.clientY - rect.top;  // Calculate y position relative to canvas
                
                    // Create a new block at the clicked position
                    const newBlock = new Block({
                        block: {
                            width: 125,
                            height: 25,
                            position: { x: x - 62.5, y: y - 12.5 }, // Center the block at the click
                            color: 'blue',
                            strokeColor: 'black',
                            lineWidth: 2
                        }
                    });
                
                    this.blocks.push(newBlock); // Add the new block to the blocks array
                });
    
    
                this.blocks.forEach(block => {
                    block.render(this.ctx);
                });

                break;  
        }
    }

    update(deltaTime, canvasWidth, canvasHeight) {
        this.ball.update(deltaTime, canvasWidth, canvasHeight, this.paddle.position.x, this.paddle.position.y, this.paddle.width, this.paddle.height);


        // this.block.update(this.ball.position.x, this.ball.position.y);

        this.blocks.forEach(block => {
            block.update(this.ball.position.x, this.ball.position.y);
        });
    }

    render() {
        this.clear();

        this.ball.render(this.ctx);
        this.paddle.render(this.ctx);
        // this.block.render(this.ctx);


        this.blocks.forEach(block => {
            block.render(this.ctx);
        });
    }

    // Clear display
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

}