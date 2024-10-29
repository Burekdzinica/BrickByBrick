import { Paddle } from './entities/paddle.js';
import { Ball } from './entities/ball.js';
import { Block } from './entities/block.js';

import { gameState } from './gameStates.js';

import { Button } from './components/button.js';
import { Text } from './components/text.js';

import { LevelEditor } from './levelEditor.js';

export class Game {
    constructor(config) {
        this.canvas = document.getElementById("game");
        this.ctx = this.canvas.getContext("2d");

        // Scales the resolution of the drawing
        const windowWidth = this.canvas.clientWidth;
        const windowHeight = this.canvas.clientHeight;
        this.canvas.width = windowWidth * window.devicePixelRatio;
        this.canvas.height = windowHeight * window.devicePixelRatio;

        const { width, height, strokeColor, lineWidth } = config.block;
        this.blockWidth = width;
        this.blockHeight = height;
        this.blockStrokeColor = strokeColor;
        this.blockLineWidth = lineWidth;
    
        this.blocks = [];

        this.paddle = new Paddle(config.paddle, this.canvas);
        this.ball = new Ball(config.ball);
        this.levelEditor = new LevelEditor(this.canvas, config.block, config.button);

        // Buttons
        const playButtonPosition = { x: this.canvas.width / 2 - 100, y: this.canvas.height / 2 - 60 };
        const editButtonPosition = { x: this.canvas.width / 2 - 100, y: this.canvas.height / 2 + 20 };

        this.buttons = [
            new Button(config.button, playButtonPosition, "Play", this.canvas),
            new Button(config.button, editButtonPosition, "Edit Mode", this.canvas)
        ];

        // Text
        this.text = new Text(config.text);

        // Paddle listener
        this.canvas.addEventListener("mousemove", this.handlePaddle.bind(this));

        // Reference to the bound listeners
        this.handleButtonHoverBound = this.handleButtonHover.bind(this);
        this.handleButtonClickBound = this.handleButtonClick.bind(this);
        this.handleCanvasClickBound = this.handleCanvasClick.bind(this);

        // Button listeners
        this.canvas.addEventListener("mousemove", this.handleButtonHoverBound);
        this.canvas.addEventListener("click", this.handleButtonClickBound);
  
        this.currentState = gameState.MAIN_MENU;

        // Wait for click
        this.waitingForAction = true;

        this.hasWon = false;
        this.hasLost = false;

        this.level = 1;

        this.highscore = this.loadHighscore();
        this.score = 0; // TODO: how do you handle score after lose, do you start at 0 or at what score you were last level?

        this.lastTime = 0;
    }

    play(timestamp) {
        switch (this.currentState) {
            case gameState.MAIN_MENU: 
                this.buttons.forEach(button => {
                    button.render(this.ctx)});
                
                break;
                
            case gameState.PLAYING:
                // Wait for start
                if (this.waitingForAction)
                    this.render();

                if (this.hasWon)
                    this.renderWinScreen();
            
                else if (this.hasLost) 
                    this.renderLoseScreen();

                if (!this.waitingForAction && !this.hasWon && !this.hasLost) {
                    // For frames
                    if (!this.lastTime)
                        this.lastTime = timestamp;

                    const deltaTime = (timestamp - this.lastTime) / 1000; // Convert to seconds
                    this.lastTime = timestamp;
    
                    this.update(deltaTime);

                    this.render();
                }   

                break;

            case gameState.EDIT_MODE:
                this.levelEditor.render();

                break;  
        }
    }

    update(deltaTime) {
        this.ball.update(deltaTime, this.canvas, this.paddle);

        // Lose ball if it hits bottom
        const ballSize = this.ball.radius + this.ball.lineWidth / 2;
        if (this.ball.position.y + ballSize >= this.canvas.height) {
            // delete this.ball;
    
            this.saveHighscore();
            this.score = 0;

            this.hasLost = true;
            // return;
        } 
        
        // TODO: fix block i want that object gone if possible
        this.blocks.forEach(block => {
            if (!block.isDestroyed && block.containsBall(this.ball)) {
                this.ball.bounce(block.position.x, block.width);

                this.score += 100;

                // Add highscore if new highscore
                if (this.score >= this.highscore) 
                    this.highscore = this.score;

                block.isDestroyed = true;
            }
        });
        
        // If all blocks are destroyed, you win
        if (this.blocks.every(block => block.isDestroyed)) {
            this.level += 1;
            this.hasWon = true;
        }

    }

    render() {
        this.clear();

        
        this.ball.render(this.ctx);
        this.paddle.render(this.ctx);
        
        this.blocks.forEach(block => {
            block.render(this.ctx);
        });

        this.renderScore();
    }

    renderScore() {
        let highscore = "Highscore: " + this.highscore;
        let score = "Score: " + this.score;

        // Highscore positioning
        const highscoreTextWidth = this.ctx.measureText(highscore).width;
        const highscoreTextOffset = highscoreTextWidth / 2 - 5;
        const highscoreXPos = this.ctx.canvas.width - highscoreTextWidth + highscoreTextOffset;
        const highscoreYPos = 20;

        // Score positioning
        const scoreTextWidth = this.ctx.measureText(score).width;
        const scoreTextOffset = scoreTextWidth / 2 - 5;
        const scoreXPos = this.ctx.canvas.width - scoreTextWidth + scoreTextOffset;
        const scoreYPos = 60;

        this.text.render(this.ctx, "white", "30px Arial", highscoreXPos, highscoreYPos, highscore);
        this.text.render(this.ctx, "white", "30px Arial", scoreXPos, scoreYPos, score);
    }

    renderWinScreen() {
        this.clear();
        
        this.text.render(this.ctx, "green", "60px arial", this.canvas.width / 2, this.canvas.height / 2, "You Win!");
        this.text.render(this.ctx, "lightgray", "40px arial", this.canvas.width / 2, this.canvas.height / 2 + 100, "Click anything to continue");
    }

    renderLoseScreen() {
        this.clear();

        this.text.render(this.ctx, "red", "60px arial", this.canvas.width / 2, this.canvas.height / 2, "You lose!");
        this.text.render(this.ctx, "lightgray", "40px arial", this.canvas.width / 2, this.canvas.height / 2 + 100, "Click anything to restart");
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
                switch (button.text) {
                    case "Play":
                        this.currentState = gameState.PLAYING;

                        this.loadLevel('levelDemo');

                        this.canvas.addEventListener('click', this.handleCanvasClickBound);

                        // Remove listeners
                        this.levelEditor.removeEventListeners();
                        this.removeButtonListeners();

                        this.clear();

                        break;

                    case "Edit Mode":
                        this.currentState = gameState.EDIT_MODE;
                    
                        this.canvas.addEventListener("click", this.levelEditor.addBlock.bind(this.levelEditor));
                        
                        // Remove listeners
                        this.removeButtonListeners();

                        this.clear();

                        break;

                }
            }
        });
    }
    
    // Handles new/restart level and game start
    handleCanvasClick(event) {
        if (this.waitingForAction)
            this.waitingForAction = false;

        else if (this.hasWon) {
            let level = "level" + this.level;

            this.loadLevel(level);

            this.ball.resetPosition();
            this.paddle.resetPosition();

            this.waitingForAction = true;
            this.hasWon = false;
        }

        else if (this.hasLost) {
            let level = 'level' + this.level;

            this.loadLevel(level);

            this.ball.resetPosition();
            this.paddle.resetPosition();

            this.waitingForAction = true;
            this.hasLost = false;
        }
    }

    handlePaddle(event) {
        if (!this.waitingForAction)
            this.paddle.handleMouse(event);
    }

    loadLevel(level) {
        level = 'levels/' + level + '.json';
        fetch(level)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const levelData = data[0].block; // This gets the array of blocks
                this.blocks = levelData.map(blockConfig => 
                    new Block({ 
                        width: this.blockWidth,
                        height: this.blockHeight,
                        position: blockConfig.position,
                        color: blockConfig.color,
                        strokeColor: this.blockStrokeColor,
                        lineWidth: this.blockLineWidth
                    })
                );
            })
            .catch(error => {
                console.error('Error loading level:', error);
            });
    }

    // TODO: highscore undenifed ??? if not in storage
    loadHighscore() {
        const storedHighscore = localStorage.getItem("highscore");
  
        if (storedHighscore == null) 
            return 0;
        else
            return parseInt(storedHighscore, 10);
    }

    saveHighscore() {
        localStorage.setItem("highscore", this.highscore.toString());
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