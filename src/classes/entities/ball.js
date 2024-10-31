import { RigidBody } from '../bodies/rigidBody.js';

export class Ball extends RigidBody {
    constructor(config) {
        const { radius, startPosition, velocity, mass, color, strokeColor, lineWidth, startAngle, endAngle, bounceMultiplier } = config;

        super(mass, velocity);

        this.startPosition = startPosition;

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

        this.bounceSound = new Audio("../../res/audio/bounce.wav");
        this.baseVolume = 1;
    }

    update(deltaTime, canvas, paddle) {
        this.checkBoundingBox(canvas);
        this.checkPaddleBox(paddle);
        
        this.updatePhysics(deltaTime);
        this.move();
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

    move() {
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }

    bounceOfPaddle(posX, width) {
        this.bounceSound.volume = this.baseVolume * 0.5;
        this.bounceSound.play();

        let center = posX + width / 2; 
        let distanceFromCenter = this.position.x - center;

        let normalizedDistance = distanceFromCenter / (width / 2); // ball hit relative to center of paddle

        // x velocity based on distanced from paddle center
        this.velocity.x = normalizedDistance * this.bounceMultiplier;
        this.velocity.y *= -1;
    }

    bounceOfBlock() {
        this.bounceSound.volume = this.baseVolume * 1;
        this.bounceSound.play();

        this.velocity.y *= -1;
    }

    // Checks canvas collision
    checkBoundingBox(canvas) {
        const ballSize = this.radius + this.lineWidth / 2;

        // Bounces from top
        if (this.position.y - ballSize <= 0) {
            this.bounceSound.play();

            this.position.y = ballSize;
            this.velocity.y *= -1;
        }

        // Bounces from right
        if (this.position.x + ballSize >= canvas.width) {
            this.bounceSound.play();

            this.position.x = canvas.width - ballSize;
            this.velocity.x *= -1;
        } 

        // Bounces from left
        else if (this.position.x - ballSize <= 0) {
            this.bounceSound.play();

            this.position.x = ballSize;
            this.velocity.x *= -1;
        }
    }

    // Checks paddle collision
    checkPaddleBox(paddle) {
        let ballSize = this.radius + this.lineWidth / 2;

        // Is on paddle vertical
        if (this.position.y + ballSize >= paddle.position.y) {
            // Checks horizontal paddle bounds
            if (this.position.x >= paddle.position.x && this.position.x <= (paddle.position.x + paddle.width)) {
                let edgeOffset = paddle.height; // Allows hitting with the edge of the paddle

                // Is going down and isn't bellow paddle 
                if (this.velocity.y > 0 && this.position.y + ballSize <= paddle.position.y + paddle.height + edgeOffset) {
                    this.bounceOfPaddle(paddle.position.x, paddle.width);
                }
            }
        }
    }

    resetPosition() {
        this.position.x = this.startPosition.x;
        this.position.y = this.startPosition.y;
    }
}


////////////////// Bounce logic: //////////////////

// only change x direction if it hits canvas right or left edge, or depending on paddle hit
// every bounce changes y direction