import { RigidBody } from '../bodies/rigidBody.js';

export class Ball extends RigidBody {
    constructor(config) {
        const { radius, startPosition, velocity, mass, color, strokeColor, lineWidth, startAngle, endAngle, bounceMultiplier } = config;

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
        this.bounceMultiplier = bounceMultiplier;
    }

    update(deltaTime, canvasWidth, canvasHeight, paddleX, paddleY, paddleWidth, paddleHeight) {
        this.checkBoundingBox(canvasWidth, canvasHeight);
        this.checkPaddleBox(paddleX, paddleY, paddleWidth, paddleHeight);
        
        this.updatePhysics(deltaTime);
        this.move();
    }
    
    move() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }

    // Checks canvas collision
    checkBoundingBox(canvasWidth, canvasHeight) {
        let ballSize = this.radius + this.lineWidth / 2;

        // Bounces up
        if (this.position.y + ballSize >= canvasHeight) {
            this.position.y = canvasHeight - ballSize; // Prevents sticking
            this.velocity.y *= -1;
        } 
        // Bounces down
        else if (this.position.y - ballSize <= 0) {
            this.position.y = ballSize;
            this.velocity.y *= -1;
        }

        // Bounces left
        if (this.position.x + ballSize >= canvasWidth) {
            this.position.x = canvasWidth - ballSize;
            this.velocity.x *= -1;
        } 
        // Bounces right
        else if (this.position.x - ballSize <= 0) {
            this.position.x = ballSize;
            this.velocity.x *= -1;
        }
    }

    // Checks paddle collision
    checkPaddleBox(paddleX, paddleY, paddleWidth, paddleHeight) {
        let ballSize = this.radius + this.lineWidth / 2;
        let paddleCenter = paddleX + paddleWidth / 2; 

        // Checks vertical paddle bounds 
        if (this.position.y + ballSize >= paddleY && this.position.y - ballSize<= paddleY + paddleHeight) {
            // Checks horizontal paddle bounds
            if (this.position.x >= paddleX && this.position.x <= (paddleX + paddleWidth)) {
                let distanceFromCenter = this.position.x - paddleCenter;

                // Normalize the distance to be between -1 and 1   
                let normalizedDistance = distanceFromCenter / (paddleWidth / 2);

                this.velocity.x = normalizedDistance * this.bounceMultiplier;

                this.velocity.y *= -1;
            }
        }
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