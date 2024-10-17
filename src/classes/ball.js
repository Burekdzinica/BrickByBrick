import { RigidBody } from './bodies/rigidBody.js';

export class Ball extends RigidBody {
    constructor(config) {
        const { radius, startPosition, velocity, mass, color, strokeColor, lineWidth, startAngle, endAngle } = config.ball;

        super(mass, velocity);
        
        this.radius = radius;
        this.position = { x: startPosition.x, y: startPosition.y };
        this.velocity = { x: velocity.x, y: velocity.y };
        this.mass = mass;
        this.color = color;
        this.strokeColor = strokeColor;
        this.lineWidth = lineWidth;
        this.startAngle = startAngle;
        this.endAngle = endAngle;
    }

    update(deltaTime, canvasWidth, canvasHeight) {
        this.checkBoundingBox(canvasWidth, canvasHeight);
        
        this.updatePhysics(deltaTime);
        this.move();
    }
    
    move() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }

    // TODO: what if it hits corner?? it bugs goes everywhere
    // Checks canvas collision
    checkBoundingBox(canvasWidth, canvasHeight) {
        // Bounces up down
        if (this.position.y >= canvasHeight - this.radius || this.position.y <= 0 + this.radius)
            this.velocity.y *= -1;

        // Bounces left right
        else if (this.position.x >= canvasWidth - this.radius || this.position.x <= 0 + this.radius)
            this.velocity.x *= -1;

    }

    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = this.lineWidth;

        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, this.startAngle, this.endAngle);

        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    }
}