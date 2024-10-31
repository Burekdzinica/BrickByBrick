export class Paddle {
    constructor(config, canvas) {
        this.canvas = canvas;
        const { width, height, startPosition, color, strokeColor, lineWidth } = config;

        this.startPosition = startPosition;
        this.startWidth = width;

        this.width = width;
        this.height = height;
        this.position = startPosition;
        this.color = color;
        this.strokeColor = strokeColor;
        this.lineWidth = lineWidth;
    }
    
    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = this.lineWidth;
        
        // Draws rect with outline
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        ctx.strokeRect(this.position.x, this.position.y, this.width, this.height);
    }

    move(mouseX) {
        let paddleSize = this.width / 2; // take half of paddleWidth

        // Checks bounding box so it doesn't go offscreen //
        // Right
        if ((mouseX + paddleSize) + this.lineWidth >= this.canvas.width)
            this.position.x = this.canvas.width - this.width - this.lineWidth;

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

        this.move(mouseX);
    }

    resetPosition() {
        this.position.x = (this.canvas.width - this.width) / 2; // center paddle on canvas
        this.position.y = this.startPosition.y;
    }

    resetWidth() {
        this.width = this.startWidth;
    }
}