import { Paddle } from './entities/paddle.js';
import { Ball } from './entities/ball.js';
import { Block } from './entities/block.js';
import { PowerUp } from './entities/powerUp.js';

import { gameState } from './gameStates.js';

import { Button } from './components/button.js';
import { Text } from './components/text.js';

import { LevelEditor } from './tools/levelEditor.js';
import { Options } from './tools/options.js';

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

        this.paddle = new Paddle(config.paddle, this.canvas);
        this.levelEditor = new LevelEditor(this.canvas, config.block, config.button);
        this.options = new Options(this.canvas, this.config, this);
        
        this.balls.push(new Ball(config.ball));

        // Buttons
        const playButtonPosition = { x: this.canvas.width / 2 - 100, y: this.canvas.height / 2 - 60 };
        const editButtonPosition = { x: this.canvas.width / 2 - 100, y: this.canvas.height / 2 + 100 };
        const optionsButtonPosition = { x: this.canvas.width / 2 - 100, y: this.canvas.height / 2 + 20 };

        this.buttons = [
            new Button(config.button, playButtonPosition, "Play", this.canvas),
            new Button(config.button, editButtonPosition, "Options", this.canvas),
            new Button(config.button, optionsButtonPosition, "Edit Mode", this.canvas)
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

        // Listener for esc
        document.addEventListener("keydown", this.handleKeyPressBound);

        this.currentState = gameState.MAIN_MENU;

        // Wait for click to start game
        this.waitingForAction = true;

        this.hasWon = false;
        this.hasLost = false;

        this.level = 1;

        this.highscore = this.loadHighscore();
        this.score = 0;

        // Audio
        this.music = new Audio("../../res/audio/music.mp3");
        this.music.loop = true;
        this.music.play();

        this.brickDestroyedSound = new Audio("../../res/audio/brickDestroyed.mp3");
        this.brickDestroyedSound.volume = 0.5;

        this.powerUpSpawnSound = new Audio("../../res/audio/powerUpSpawn.mp3")
        this.powerUpPickupSound = new Audio("../../res/audio/powerPickup2.mp3");

        this.winSound = new Audio("../../res/audio/win.mp3");
        this.loseSound = new Audio("../../res/audio/lose.mp3");

        // Load settings from localStorage
        this.changeMusicVolume();
        this.changeSoundVolume();
        this.changeDifficulty();

        this.lastTime = 0;
    }

    play(timestamp) {
        switch (this.currentState) {
            case gameState.MAIN_MENU: 
                this.clear();

                this.buttons.forEach(button => {
                    button.render(this.ctx)});
                    
                this.text.render(this.ctx, "#C9C9C9", "80px arial", this.canvas.width / 2 , this.canvas.height / 2 - 200, "Brick by Brick");
                
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
                    this.lastTime = timestamp;
                    const deltaTime = (timestamp - this.lastTime) / 1000; // Convert to seconds
       
                    this.update(deltaTime);

                    this.render();
                }   

                break;

            case gameState.EDIT_MODE:
                this.levelEditor.render();
                
                break;  
                
            case gameState.OPTIONS:
                this.changeMusicVolume();
                this.changeSoundVolume();

                this.options.render();
                
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
                this.powerUpPickupSound.play();

                // Extra ball powerup
                if (powerUp.power == "Ball") {
                    const position = { x: this.paddle.position.x + this.paddle.width / 2, y: this.paddle.position.y - this.paddle.height}; // Center of paddle spawn
                    this.addBall(position);
                }

                // Paddle size powerup
                else 
                    this.increasePaddleSize();

                // Remove that powerup
                this.powerUps.splice(index, 1);
            }

            // Remove if it falls
            else if (powerUp.position.y >= this.canvas.height)
                this.powerUps.splice(index, 1)
        });

        
        // Block collision logic
        this.balls.forEach(ball => {
            // Prevents ball going between blocks
            let hitUnbreakable = false;
            let lastHitBlock = false;

            this.blocks.forEach(block => {
                // If it has already hit a block or hit unbreakable block return
                if (lastHitBlock || hitUnbreakable)
                    return;
            
                if (block.containsBall(ball)) {
                    if (block.hp === "Unbreakable") {
                        ball.bounceOfBlock();

                        hitUnbreakable = true;
                        lastHitBlock = true;

                        return;
                    }
    
                    if (block.hp !== "Unbreakable") {
                        ball.bounceOfBlock();

                        block.hp--;
                        this.score += 100;
                        
                        // Destroy block if hp zero
                        if (block.hp === 0) {
                            this.brickDestroyedSound.play();
    
                            // If block has powerup drop it
                            if (block.powerUp) {
                                this.powerUpSpawnSound.play();
    
                                let power;
                                if (Math.random() < 0.5) 
                                    power = "Ball";
                                else
                                    power = "Size";
                        
                                this.powerUps.push(new PowerUp(this.config.powerUp, block.position, block.width, power));
                            }
                            // Delete that block
                            this.blocks = this.blocks.filter(b => b !== block);
                        }
                        
                        // Add highscore if new highscore
                        if (this.score >= this.highscore) 
                            this.highscore = this.score;
                        
                        lastHitBlock = true;
                    } 
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

        // LOSE when you lose all balls
        if (this.balls.length === 0) {
            this.loseSound.play();
            
            this.saveHighscore();
            this.score = 0;
    
            this.hasLost = true;
        }
  
        // WIN if zero blocks left not including unbreakable
        if (this.blocks.length == 0 || this.blocks.every(block => block.hp === "Unbreakable")) {
            this.winSound.play();

            // If you played all levels(5), cycle through them
            if (this.level === 5)
                this.level = Math.floor(Math.random() * 5) + 1;
            else
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

        this.changeSoundVolume();
    }

    increasePaddleSize() {
        this.paddle.width += 10;
    }

    // Difficulty based on paddle size
    changeDifficulty() {
        let storedDifficulty = localStorage.getItem("difficulty");
        if (storedDifficulty === null)
            storedDifficulty = this.options.difficulties.NORMAL;

        switch (storedDifficulty) {
            case this.options.difficulties.EASY:
                this.paddle.width = this.startPaddleWidth + 50;
                break;

            case this.options.difficulties.NORMAL:
                this.paddle.width = this.startPaddleWidth;
                break;
            
            case this.options.difficulties.HARD:
                this.paddle.width = this.startPaddleWidth - 50;
                break;

            case this.options.difficulties.NIGHTMARE:
                this.paddle.width = this.startPaddleWidth - 130;
                break;   
        }
    }

    changeMusicVolume() {
        let storedMusicVolume = parseInt(localStorage.getItem("musicVolume"), 10);
        if (storedMusicVolume === null || isNaN(storedMusicVolume))
            storedMusicVolume = 1;

        this.music.volume = storedMusicVolume
    }

    changeSoundVolume() {
        let storedSoundVolume = parseInt(localStorage.getItem("soundVolume"), 10);
        if (storedSoundVolume === null || isNaN(storedSoundVolume))
            storedSoundVolume = 1;

        this.balls.forEach(ball => {
            ball.baseVolume = storedSoundVolume;
        });

        this.brickDestroyedSound.volume = storedSoundVolume;
        this.loseSound.volume = storedSoundVolume;
        this.winSound.volume = storedSoundVolume;
        this.powerUpPickupSound.volume = storedSoundVolume;
        this.powerUpSpawnSound.volume = storedSoundVolume;
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

                        this.changeDifficulty();
                        this.paddle.resetPosition();
                        
                        // Load only if no blocks have been loaded yet
                        if (this.blocks.length == 0) {
                            let level = "level" + this.level;
                            this.loadLevel(level);
                        }

                        this.canvas.addEventListener('click', this.handleCanvasClickBound);

                        // Remove listeners
                        this.levelEditor.removeButtonListeners();
                        this.removeButtonListeners();

                        break;

                    case "Edit Mode":
                        this.currentState = gameState.EDIT_MODE;
                    
                        this.levelEditor.addButtonListeners();
                        this.canvas.addEventListener("click", this.addBlockBound);
                        
                        // Remove listeners
                        this.removeButtonListeners();

                        break;

                    case "Options":
                        this.currentState = gameState.OPTIONS;

                        this.options.addButtonListeners();

                        this.levelEditor.removeButtonListeners();
                        this.removeButtonListeners();

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

            // Reset to 1 ball
            this.balls = [];
            this.powerUps = [];
            this.balls.push(new Ball(this.config.ball));

            this.changeSoundVolume();
          
            this.changeDifficulty(); // change paddle width depending on difficulty
            this.paddle.resetPosition();

            this.waitingForAction = true;
            this.hasWon = false;
        }

        else if (this.hasLost) {
            this.level = 1; // Start at zero if you lose
            let level = 'level' + this.level;

            this.loadLevel(level);

            this.powerUps = [];

            this.balls.push(new Ball(this.config.ball));
            
            this.changeSoundVolume();

            this.changeDifficulty(); // change paddle width depending on difficulty
            
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
            
            // Remove listeners not wanted in menu
            this.canvas.removeEventListener('click', this.handleCanvasClickBound);
            this.canvas.removeEventListener("click", this.addBlockBound);
            this.levelEditor.removeButtonListeners();
            this.options.removeButtonListeners();

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
                    // Add a drop chance for a powerup to block
                    const isPowerUp = Math.random() < 0.20 ; // 20% drop chance
      
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
  
        if (storedHighscore === null) 
            return 0;
        else
            return parseInt(storedHighscore, 10);
    }

    saveHighscore() {
        localStorage.setItem("highscore", this.highscore.toString());
    }
}