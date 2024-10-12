// TODO: fix x pos cuz xPos = screenWidth / 2 - paddleWidth / 2;
const paddleXPos = 325; 
const paddleYPos = 600;
const paddleWidth = 150;
const paddleHeight = 25;

const color = "gray";
const strokeColor = "black";
const lineWidth = 2;

export class Paddle {
    constructor() {
        this.xPos = paddleXPos;
        this.yPos = paddleYPos;
    }
    
    update() {
        
    }
    
    render(ctx) {
        ctx.fillStyle = color;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
        
        // Draws rect with outline
        ctx.fillRect(this.xPos, this.yPos, paddleWidth, paddleHeight);
        ctx.strokeRect(this.xPos, this.yPos, paddleWidth, paddleHeight);
    }

    move(mouseX, canvasWidth) {
        // Checks bounding box so it doesn't go offscreen
        if ((mouseX + paddleWidth / 2) > canvasWidth)
            this.xPos = canvasWidth - paddleWidth - lineWidth;

        else if ((mouseX - paddleWidth / 2 - lineWidth) < 0)
            this.xPos = lineWidth;

        else 
            this.xPos = mouseX - paddleWidth / 2;        
    }

    handleMouse(event) {
        const rect = this.canvas.getBoundingClientRect();

        // Gets mouse x position
        let mouseX = event.clientX - rect.left;

        this.paddle.move(mouseX, this.canvas.width);
    }
}