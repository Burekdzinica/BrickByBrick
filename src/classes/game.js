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

        const playButtonPosition = { x: this.canvas.width / 2 - 100, y: this.canvas.height / 2 - 60 };
        const editButtonPosition = { x: this.canvas.width / 2 - 100, y: this.canvas.height / 2 + 20 };

        this.buttons = [
            new Button(config, playButtonPosition, "Play", this.canvas),
            new Button(config, editButtonPosition, "Edit Mode", this.canvas)
        ];

        // Paddle listener
        this.canvas.addEventListener("mousemove", this.paddle.handleMouse.bind(this));

        // Reference to the bound listeners
        this.handleButtonHoverBound = this.handleButtonHover.bind(this);
        this.handleButtonClickBound = this.handleButtonClick.bind(this);
        this.addBlockBound = this.addBlock.bind(this);

        // Button listeners
        this.canvas.addEventListener("mousemove", this.handleButtonHoverBound);
        this.canvas.addEventListener("click", this.handleButtonClickBound);

        this.currentState = gameState.MAIN_MENU;

        this.lastTime = 0;
    }

    play(timestamp) {
        switch (this.currentState) {
            case gameState.MAIN_MENU: 
                this.buttons.forEach(button => 
                    button.render(this.ctx));
            
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
                this.canvas.addEventListener('click', this.addBlockBound);
    
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

    addBlock(event) {
        if (this.currentState === gameState.EDIT_MODE) { // Check if in EDIT_MODE
            const rect = this.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left; 
            const y = event.clientY - rect.top; 
    
            // Create a new block at the clicked position
            const newBlock = new Block({
                block: {
                    width: 125,
                    height: 25,
                    position: { x: x - 62.5, y: y - 12.5 }, // Center the block at the click
                    color: 'green',
                    strokeColor: 'black',
                    lineWidth: 2
                }
            });
    
            this.blocks.push(newBlock); // Add the new block to the blocks array
        }
    }

    handleButtonHover(event) {
        this.buttons.forEach(button => 
            button.handleMouseHover(event));
    }

    handleButtonClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        this.buttons.forEach(button => {
            if (button.checkPosition(mouseX, mouseY)) {
                if (button.text === "Play") {
                    this.currentState = gameState.PLAYING;
                    this.removeButtonListeners();
                    this.clear();
                } 
                else if (button.text === "Edit Mode") {
                    this.currentState = gameState.EDIT_MODE;
                    this.removeButtonListeners();
                    this.clear();
                }
            }
        });
    }

    removeButtonListeners() {
        this.canvas.removeEventListener("mousemove", this.handleButtonHoverBound);
        this.canvas.removeEventListener("click", this.handleButtonClickBound);
        this.canvas.removeEventListener("click", this.addBlockBound);
    }
}