import { Paddle } from './entities/paddle.js';
import { Ball } from './entities/ball.js';
import { Block } from './entities/block.js';
import { PowerUp } from './entities/powerUp.js';

import { gameState } from './gameStates.js';

import { Button } from './components/button.js';
import { Text } from './components/text.js';

import { LevelEditor } from './levelEditor.js';
import { RigidBody } from './bodies/rigidBody.js';

export class Game {
    constructor(config) {
        this.canvas = document.getElementById("game");
        this.ctx = this.canvas.getContext("2d");

        this.config = config;

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

        this.startPaddleWidth = config.paddle.width;
    
        this.blocks = [];
        this.powerUps = [];

        this.balls = [];
        this.balls.push(new Ball(config.ball));

        this.paddle = new Paddle(config.paddle, this.canvas);
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
        this.handleKeyPressBound = this.handleKeyPress.bind(this);

        this.addBlockBound = this.levelEditor.addBlock.bind(this.levelEditor);

        // Button listeners
        this.addButtonListeners();

        document.addEventListener("keydown", this.handleKeyPressBound);

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
        this.balls.forEach(ball => {
            ball.update(deltaTime, this.canvas, this.paddle);
        })

        // Update powerUps
        this.powerUps.forEach((powerUp, index) => {
            powerUp.update(deltaTime);
    
            // Add ball if it hits paddle
            if (powerUp.checkPaddleBox(this.paddle)) {
                if (powerUp.power == "Ball") {
                    const position = { x: this.paddle.position.x + this.paddle.width / 2, y: this.paddle.position.y - this.paddle.height}; // Center of paddle spawn
                    this.addBall(position);
                }

                else 
                    this.increasePaddleSize();

                // Remove that powerup
                this.powerUps.splice(index, 1);
            }

            // Remove if it falls
            else if (powerUp.position.y >= this.canvas.height)
                this.powerUps.splice(index, 1)
        });

        let lastHitBlock = null;
    
        // Block collision logic
        this.balls.forEach(ball => {
            this.blocks.forEach(block => {
                // If it has already hit a block or hit unbreakable block return
                if (lastHitBlock || block.hp === "Unbreakable") 
                    return;
                
                else if (block.containsBall(ball)) {
                    ball.bounce(block.position.x, block.width);
                    
                    block.hp--;
                    this.score += 100;
                    
                    // Destroy block if hp zero
                    if (block.hp === 0) {
                        // If block has powerup drop it
                        if (block.powerUp) {
                            let power;
                            if (Math.random() < 0.5) 
                                power = "Ball";
                            
                            else {
                                power = "Size";
                            }
                            
                            this.powerUps.push(new PowerUp(this.config.powerUp, block.position, block.width, power));
                        }

                            this.blocks = this.blocks.filter(b => 
                                b !== block);
                        }
                    
                    // Add highscore if new highscore
                    if (this.score >= this.highscore) 
                        this.highscore = this.score;
                    
                    lastHitBlock = block;
                }
            })
        })
        
        // Delete ball that falls
        this.balls = this.balls.filter(ball => {
            const ballSize = ball.radius + ball.lineWidth / 2;

            if (ball.position.y + ballSize >= this.canvas.height)
                return false;

            return true;
        });

        // Lose when you lose all balls
        if (this.balls.length === 0) {
            this.saveHighscore();
            this.score = 0;
    
            this.hasLost = true;
        }
  
        // You win if zero blocks left not including unbreakable
        if (this.blocks.length == 0 || this.blocks.every(block => block.hp === "Unbreakable")) {
            this.level += 1;
            this.hasWon = true;
        }

    }

    render() {
        this.clear();

        this.powerUps.forEach(powerUp => {
            powerUp.render(this.ctx);
        })

        this.balls.forEach(ball => {
            ball.render(this.ctx);
        })

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

    addBall(position) {
        const { radius, velocity, mass, color, strokeColor, lineWidth, startAngle, endAngle, bounceMultiplier } = this.config.ball;

        this.balls.push(new Ball({
            radius: radius,
            startPosition: {
                x: position.x,
                y: position.y
            },
            velocity: velocity,
            mass: mass,
            color: color,
            strokeColor: strokeColor,
            lineWidth: lineWidth,
            startAngle: startAngle,
            endAngle: endAngle,
            bounceMultiplier: bounceMultiplier
        }));
    }

    increasePaddleSize() {
        this.paddle.width += 10;
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

                        this.loadLevel('level1');

                        this.canvas.addEventListener('click', this.handleCanvasClickBound);

                        // Remove listeners
                        this.levelEditor.removeButtonListeners();
                        this.removeButtonListeners();

                        this.clear();

                        break;

                    case "Edit Mode":
                        this.currentState = gameState.EDIT_MODE;
                    
                        this.canvas.addEventListener("click", this.addBlockBound);
                        this.levelEditor.addButtonListeners();
                        
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

            // Reset to 1 ball
            this.balls = [];
            this.powerUps = [];
            this.balls.push(new Ball(this.config.ball));
          
            this.loadLevel(level);

            this.paddle.resetWidth();
            this.paddle.resetPosition();

            this.waitingForAction = true;
            this.hasWon = false;
        }

        else if (this.hasLost) {
            let level = 'level' + this.level;

            this.loadLevel(level);

            this.powerUps = [];

            this.balls.push(new Ball(this.config.ball));
            
            this.paddle.resetWidth();
            this.paddle.resetPosition();

            this.waitingForAction = true;
            this.hasLost = false;
        }
    }

    handlePaddle(event) {
        if (!this.waitingForAction)
            this.paddle.handleMouse(event);
    }

    // Esc to menu
    handleKeyPress(event) {
        if (event.key == "Escape" && this.currentState != gameState.MAIN_MENU) {
            this.currentState = gameState.MAIN_MENU;

            this.addButtonListeners();
            this.canvas.removeEventListener('click', this.handleCanvasClickBound);
            this.canvas.removeEventListener("click", this.addBlockBound);

            this.clear();
        }
    }

    // Changes button color on hover
    handleButtonHover(event) {
        this.buttons.forEach(button => 
            button.handleMouseHover(event));
    }

    addButtonListeners() {
        this.canvas.addEventListener("mousemove", this.handleButtonHoverBound);
        this.canvas.addEventListener("click", this.handleButtonClickBound);
    }

    removeButtonListeners() {
        this.canvas.removeEventListener("mousemove", this.handleButtonHoverBound);
        this.canvas.removeEventListener("click", this.handleButtonClickBound);
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
                this.blocks = levelData.map(blockConfig => {
                    // Add a drop chance for a powerup
                    const isPowerUp = Math.random() < 0.33 ; // 33% drop chance
      
                    return new Block({ 
                        width: this.blockWidth,
                        height: this.blockHeight,
                        position: blockConfig.position,
                        hp: blockConfig.hp,
                        strokeColor: this.blockStrokeColor,
                        lineWidth: this.blockLineWidth,
                        powerUp: isPowerUp
                    })

                });
            })
            .catch(error => {
                console.error('Error loading level:', error);
            });
    }

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
}