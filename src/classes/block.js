import { StaticBody } from "./bodies/staticBody.js";

export class Block extends StaticBody {
    constructor(config) {
        const { width, height, position, color, strokeColor, lineWidth } = config.block;
        
        super(width, height, position);

        this.color = color;
        this.strokeColor = strokeColor;
        this.lineWidth = lineWidth;

        this.isDestroyed = false;
    }

    update(ballX, ballY) {
        if (this.contains(ballX, ballY))
            this.isDestroyed = true;
    }

    render(ctx) {
        if (!this.isDestroyed) {
            ctx.fillStyle = this.color;
            ctx.strokeStyle = this.strokeColor;
            ctx.lineWidth = this.lineWidth;
    
            // Draws rect with outline
            ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
            ctx.strokeRect(this.position.x, this.position.y, this.width, this.height);

        }
    }
}