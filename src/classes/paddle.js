export class Paddle {
    constructor(config) {
        const { width, height, startPosition, color, strokeColor, lineWidth } = config.paddle;

        this.width = width;
        this.height = height;
        this.position = { x: startPosition.x, y: startPosition.y};
        this.color = color;
        this.strokeColor = strokeColor;
        this.lineWidth = lineWidth;
    }
    
    update() {
        
    }
    
    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = this.lineWidth;
        
        // Draws rect with outline
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        ctx.strokeRect(this.position.x, this.position.y, this.width, this.height);
    }

    move(mouseX, canvasWidth) {
        let paddleSize = this.width / 2; // take half of paddleWidth

        // Checks bounding box so it doesn't go offscreen
        // Right
        if ((mouseX + paddleSize) + this.lineWidth >= canvasWidth)
            this.position.x = canvasWidth - this.width - this.lineWidth;

        // Left 
        else if ((mouseX - paddleSize - this.lineWidth) <= 0)
            this.position.x = this.lineWidth;

        // Else
        else 
            this.position.x = mouseX - paddleSize;        
    }

    handleMouse(event) {
        // Get canvas rect
        const rect = this.canvas.getBoundingClientRect();

        // Gets mouse x position
        let mouseX = event.clientX - rect.left;

        this.paddle.move(mouseX, this.canvas.width);
    }
}