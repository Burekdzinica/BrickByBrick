import { Paddle } from './entities/paddle.js';
import { Ball } from './entities/ball.js';
import { Block } from './entities/block.js';

import { gameState } from './gameStates.js';

import { Button } from './components/button.js';
import { LevelEditor } from './levelEditor.js';

export class Game {
    constructor(config) {
        this.canvas = document.getElementById("game");
        this.ctx = this.canvas.getContext("2d");

        // Scales the resolution of the drawing
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        this.canvas.width = width * window.devicePixelRatio;
        this.canvas.height = height * window.devicePixelRatio;

        this.paddle = new Paddle(config.paddle);
        this.ball = new Ball(config.ball);
        this.block = new Block(config.block);
        this.blocks = [];

        this.levelEditor = new LevelEditor(this.canvas, config.block, config.button);

        // Buttons
        const playButtonPosition = { x: this.canvas.width / 2 - 100, y: this.canvas.height / 2 - 60 };
        const editButtonPosition = { x: this.canvas.width / 2 - 100, y: this.canvas.height / 2 + 20 };

        this.buttons = [
            new Button(config.button, playButtonPosition, "Play", this.canvas),
            new Button(config.button, editButtonPosition, "Edit Mode", this.canvas)
        ];

        // Paddle listener
        this.canvas.addEventListener("mousemove", this.paddle.handleMouse.bind(this));

        // Reference to the bound listeners
        this.handleButtonHoverBound = this.handleButtonHover.bind(this);
        this.handleButtonClickBound = this.handleButtonClick.bind(this);

        // Button listeners
        this.canvas.addEventListener("mousemove", this.handleButtonHoverBound);
        this.canvas.addEventListener("click", this.handleButtonClickBound);

        this.currentState = gameState.MAIN_MENU;

        this.lastTime = 0;
    }

    play(timestamp) {
        switch (this.currentState) {
            case gameState.MAIN_MENU: 
                this.buttons.forEach(button => {
                    button.render(this.ctx)});
        
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
                this.levelEditor.render();

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

    // Does x on x button click
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
                    
                    this.canvas.addEventListener("click", this.levelEditor.addBlock.bind(this.levelEditor));
                    this.canvas.addEventListener("mousemove", this.levelEditor.previewBlock.bind(this.levelEditor));

                    
                    this.removeButtonListeners();
                    this.clear();
                }
            }
        });
    }

    // Changes button color on hover
    handleButtonHover(event) {
        this.buttons.forEach(button => 
            button.handleMouseHover(event));
    }

    removeButtonListeners() {
        this.canvas.removeEventListener("mousemove", this.handleButtonHoverBound);
        this.canvas.removeEventListener("click", this.handleButtonClickBound);
    }
}